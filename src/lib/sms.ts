// ============================================================
// SMS — Twilio send layer (TCPA consent + quiet hours built in)
// ============================================================
// Every SMS goes through sendSMS(). It enforces, at the library level:
//   1. TCPA consent — never sends unless the recipient has sms_consent = true
//      AND sms_opt_out = false
//   2. Quiet hours — never sends between 8:00 PM and 8:00 AM in the
//      recipient's local timezone
//   3. Opt-out affordance — appends "Reply STOP to unsubscribe" to messages
//
// The recipient-specific senders (sendQuoteReminderSMS, …), the sms_log table,
// and the Twilio STOP webhook are built in Session 13. This module is the
// compliance-critical core they build on.

import twilio from 'twilio';
import { toZonedTime } from 'date-fns-tz';
import { getHours } from 'date-fns';
import { createAdminSupabase } from './supabase';

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
const OPT_OUT_SUFFIX = ' Reply STOP to unsubscribe.';

function twilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  return sid && token ? twilio(sid, token) : null;
}

export interface SendSMSParams {
  /** Recipient phone in E.164 (e.g. +12145550123). */
  to: string;
  /** Message body. "Reply STOP to unsubscribe" is appended automatically. */
  body: string;
  /** Consent source — provide the lead or candidate this SMS is going to. */
  leadId?: string;
  candidateId?: string;
  /** IANA timezone for quiet-hours (defaults to the record's tz or Central). */
  timezone?: string;
}

export interface SendSMSResult {
  sent: boolean;
  sid?: string;
  reason?: 'no_consent' | 'opted_out' | 'quiet_hours' | 'not_configured' | 'error';
}

/** Core SMS sender. Blocks the send unless TCPA consent + quiet hours pass. */
export async function sendSMS(params: SendSMSParams): Promise<SendSMSResult> {
  // 1. TCPA consent — must be explicitly granted and not revoked.
  const consent = await getConsent(params);
  if (consent === 'no_consent') return { sent: false, reason: 'no_consent' };
  if (consent === 'opted_out') return { sent: false, reason: 'opted_out' };

  // 2. Quiet hours — 8pm–8am local time is off-limits.
  const tz = params.timezone || consent.timezone || 'America/Chicago';
  if (isQuietHours(tz)) return { sent: false, reason: 'quiet_hours' };

  const client = twilioClient();
  if (!client || !FROM_NUMBER) return { sent: false, reason: 'not_configured' };

  // 3. Send, always including the opt-out affordance.
  try {
    const message = await client.messages.create({
      from: FROM_NUMBER,
      to: params.to,
      body: params.body.trimEnd() + OPT_OUT_SUFFIX,
    });
    return { sent: true, sid: message.sid };
  } catch {
    return { sent: false, reason: 'error' };
  }
}

/** True when local time in `timezone` is before 8am or 8pm-or-later. */
export function isQuietHours(timezone: string): boolean {
  const local = toZonedTime(new Date(), timezone);
  const hour = getHours(local);
  return hour < 8 || hour >= 20;
}

type ConsentOk = { timezone: string | null };

/**
 * Resolve consent for the recipient. Returns 'no_consent' / 'opted_out', or an
 * object with the record's timezone when consent is valid.
 */
async function getConsent(
  params: SendSMSParams,
): Promise<'no_consent' | 'opted_out' | ConsentOk> {
  const supabase = createAdminSupabase();

  if (params.leadId) {
    const { data } = await supabase
      .from('leads')
      .select('sms_consent, sms_opt_out, timezone')
      .eq('id', params.leadId)
      .single();
    if (!data || !data.sms_consent) return 'no_consent';
    if (data.sms_opt_out) return 'opted_out';
    return { timezone: data.timezone };
  }

  if (params.candidateId) {
    const { data } = await supabase
      .from('candidates')
      .select('sms_consent, sms_opt_out, timezone')
      .eq('id', params.candidateId)
      .single();
    if (!data || !data.sms_consent) return 'no_consent';
    if (data.sms_opt_out) return 'opted_out';
    return { timezone: data.timezone };
  }

  // No consent source provided → refuse to send.
  return 'no_consent';
}
