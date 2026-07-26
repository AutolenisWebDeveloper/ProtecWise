// ============================================================
// Email — Resend send layer (opt-out + throttle + logging built in)
// ============================================================
// Every email in ProtecWise goes through sendEmail(). It enforces, at the
// library level (so it cannot be bypassed by a route):
//   1. CAN-SPAM opt-out — skips recipients with email_opt_out = true
//      (transactional emails: magic link, password reset, app status — exempt)
//   2. Frequency throttle — max 1 automated email per recipient per 24h
//   3. Logging — every attempt is written to email_log with the Resend id
//
// The per-template convenience senders (sendQuoteCopyEmail, …) and their
// React Email components are built in Session 12 and call sendEmail().

import type { ReactElement } from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { createAdminSupabase } from './supabase';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'quotes@protecwise.com';

function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  /** Template identifier for logging, e.g. '01_QuoteCopyEmail'. */
  template: string;
  /** Provide one of html / react / text. */
  html?: string;
  react?: ReactElement;
  text?: string;
  /** Recipient linkage — drives the opt-out check and email_log rows. */
  leadId?: string;
  clientId?: string;
  candidateId?: string;
  agentId?: string;
  /**
   * Transactional emails (magic link, password reset, application status,
   * agent activation) skip the opt-out check and the 24h throttle.
   */
  transactional?: boolean;
}

export interface SendEmailResult {
  sent: boolean;
  id?: string;
  /** Why the send was skipped, when sent = false. */
  reason?: 'opted_out' | 'throttled' | 'not_configured' | 'error';
}

/** Core email sender. Returns whether the message was actually sent. */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const supabase = createAdminSupabase();

  // 1. Opt-out check (skip for transactional).
  if (!params.transactional && (await isOptedOut(params))) {
    return { sent: false, reason: 'opted_out' };
  }

  // 2. Frequency throttle — one automated email per recipient per 24h.
  if (!params.transactional && (await isThrottled(params.to))) {
    return { sent: false, reason: 'throttled' };
  }

  // 3. Resolve the message body (Resend requires an html string).
  const html =
    params.html ?? (params.react ? await render(params.react) : (params.text ?? ''));

  const resend = resendClient();
  if (!resend) {
    // Not configured (e.g. local without a key) — log the intent, do not send.
    await logEmail(params, { status: 'failed', error: 'RESEND_API_KEY not set' });
    return { sent: false, reason: 'not_configured' };
  }

  // 4. Send via Resend.
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html,
    text: params.text,
  });

  if (error) {
    await logEmail(params, { status: 'failed', error: error.message });
    return { sent: false, reason: 'error' };
  }

  await logEmail(params, { status: 'sent', resendMessageId: data?.id });
  return { sent: true, id: data?.id };
}

/** True when the linked recipient has opted out of marketing email. */
async function isOptedOut(params: SendEmailParams): Promise<boolean> {
  const supabase = createAdminSupabase();

  if (params.leadId) {
    const { data } = await supabase
      .from('leads')
      .select('email_opt_out')
      .eq('id', params.leadId)
      .single();
    if (data?.email_opt_out) return true;
  }
  if (params.clientId) {
    const { data } = await supabase
      .from('clients')
      .select('email_opt_out')
      .eq('id', params.clientId)
      .single();
    if (data?.email_opt_out) return true;
  }
  if (params.candidateId) {
    const { data } = await supabase
      .from('candidates')
      .select('email_opt_out')
      .eq('id', params.candidateId)
      .single();
    if (data?.email_opt_out) return true;
  }
  return false;
}

/** True when a non-transactional email went to this address in the last 24h. */
async function isThrottled(toEmail: string): Promise<boolean> {
  const supabase = createAdminSupabase();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from('email_log')
    .select('id', { count: 'exact', head: true })
    .eq('to_email', toEmail)
    .in('status', ['sent', 'delivered', 'opened', 'clicked'])
    .gte('created_at', since);

  return (count ?? 0) > 0;
}

/** Write an email_log row for every attempt (sent or failed). */
async function logEmail(
  params: SendEmailParams,
  result: { status: 'sent' | 'failed'; resendMessageId?: string; error?: string },
): Promise<void> {
  const supabase = createAdminSupabase();
  await supabase.from('email_log').insert({
    resend_message_id: result.resendMessageId ?? null,
    template: params.template,
    to_email: params.to,
    from_email: FROM_EMAIL,
    subject: params.subject,
    lead_id: params.leadId ?? null,
    client_id: params.clientId ?? null,
    agent_id: params.agentId ?? null,
    candidate_id: params.candidateId ?? null,
    status: result.status,
    error: result.error ?? null,
  });
}
