---
name: protecwise-compliance
description: >
  HIPAA, TCPA, CAN-SPAM, and insurance regulatory compliance requirements for
  ProtecWise. Use this skill whenever building features that touch: health data,
  SMS sending, email marketing, consent capture, disclosure forms, e-signatures,
  document retention, agent licensing, carrier appointments, or application submission.
  Do not build compliance-sensitive features without reading this first. Non-compliance
  is a legal and licensing risk that cannot be patched after the fact.
---

# ProtecWise Compliance Skill

## HIPAA — Health Data Protection

The application intake (step 5: Health Overview) collects Protected Health
Information (PHI). This triggers HIPAA obligations.

### What is PHI in this platform
```
- Height, weight, BMI
- Medical diagnoses (heart disease, cancer, diabetes, etc.)
- Prescription medications
- Hospitalization history
- Family medical history
- Any health condition disclosed in step 5
```

### Required implementation
```typescript
// 1. Encrypt PHI before storing
// step_5_health_overview JSONB must be encrypted at rest
// Use pgcrypto or application-level encryption
// Never log PHI to console or error tracking

// 2. Access control — PHI only accessible to:
//    - The client themselves
//    - The assigned agent
//    - Admin (audit only)
// Never return PHI in general API responses

// 3. HIPAA Authorization in Step 7 disclosures
// Client must sign authorization before PHI can be shared with carrier
// Store: authorization text, client signature, timestamp, IP address

// 4. Minimum necessary principle
// Only share PHI that is required for the specific carrier application
// Do not share with other carriers or third parties

// 5. Breach notification
// If PHI is accessed without authorization, notify affected clients
// within 60 days (federal) or state-specific timeline
```

### HIPAA Authorization Text (required in Step 7)
```
"HIPAA AUTHORIZATION FOR DISCLOSURE OF PROTECTED HEALTH INFORMATION

I authorize ProtecWise LLC and my assigned licensed insurance advisor to
use and disclose my protected health information (including health history,
medications, and medical records) to [Carrier Name] for the purpose of
evaluating my application for life insurance.

This authorization is valid for the duration of the application process,
not to exceed 24 months. I may revoke this authorization at any time in
writing. I understand that [Carrier Name] may not be covered by HIPAA and
may re-disclose my information."
```

### What NOT to store
```
- Full Social Security Number (store last 4 digits only)
- Full bank account number (store encrypted reference only)
- Medical records or doctor notes (agent handles these separately)
- Insurance policy numbers from other carriers (unless replacement case)
```

---

## TCPA — SMS Compliance

The Telephone Consumer Protection Act governs all SMS messaging.
Violations: $500–$1,500 per message. Class action risk.

### Consent Requirements
```typescript
// BEFORE sending ANY SMS to a lead or candidate:
// 1. Check explicit written consent was captured at point of opt-in
// 2. Consent must be specific to receiving insurance communications from ProtecWise
// 3. Cannot be bundled with terms of service

// Schema requirement:
// leads table must have:
//   sms_consent: boolean (default false)
//   sms_consent_at: timestamptz
//   sms_consent_ip: text
//   sms_consent_language: text (the exact text they agreed to)
//   sms_opt_out: boolean (default false)
//   sms_opt_out_at: timestamptz

// The send function in lib/sms.ts must check BOTH:
if (!lead.sms_consent || lead.sms_opt_out) {
  console.log(`[SMS] Skipping ${lead.id} — no consent or opted out`);
  return;
}
```

### Consent Capture Text (required on every opt-in form)
```
"By providing your phone number, you consent to receive text messages
from ProtecWise LLC about your life insurance quote and application.
Message frequency varies. Message & data rates may apply.
Reply STOP to opt out at any time. Reply HELP for help."
```

### Quiet Hours
```typescript
// NEVER send SMS between 8:00 PM and 8:00 AM local time
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { getHours } from 'date-fns';

function isQuietHours(timezone: string): boolean {
  const localTime = utcToZonedTime(new Date(), timezone);
  const hour = getHours(localTime);
  return hour < 8 || hour >= 20;
}

// In lib/sms.ts before every send:
if (isQuietHours(lead.timezone || 'America/Chicago')) {
  // Queue for next allowed window — do not skip, delay
  await scheduleDelayedSMS(lead.id, message, nextAllowedTime);
  return;
}
```

### STOP Handling (Twilio Webhook)
```typescript
// app/api/sms/opt-out/route.ts
// Twilio calls this when someone replies STOP
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const from = formData.get('From') as string; // phone number in E.164

  // Update ALL matching leads
  await supabaseAdmin
    .from('leads')
    .update({ sms_opt_out: true, sms_opt_out_at: new Date().toISOString() })
    .eq('phone', from);

  // Twilio expects empty 200 response (or TwiML saying "You've been unsubscribed")
  return new Response(
    '<?xml version="1.0"?><Response><Message>You have been unsubscribed from ProtecWise text messages.</Message></Response>',
    { headers: { 'Content-Type': 'text/xml' }, status: 200 }
  );
}
```

### First Message Must Include
```
1. Brand identification: "ProtecWise:"
2. Opt-out instruction: "Reply STOP to unsubscribe"
Example: "ProtecWise: Your quote for $500k of coverage is ready. 
View it here: [url] Reply STOP to unsubscribe."
```

---

## CAN-SPAM — Email Compliance

### Every automated marketing email must include
```typescript
// In every email template:
// 1. Clear identification of sender (ProtecWise LLC)
// 2. Physical mailing address (add to env var: NEXT_PUBLIC_AGENCY_ADDRESS)
// 3. Unsubscribe mechanism
// 4. Accurate subject line (no deceptive subjects)
// 5. "ADV" prefix if purely commercial (quote reminders are transactional, OK without)

// In React Email template footer:
<Section style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #E2E8F0' }}>
  <Text style={{ fontSize: '12px', color: '#718096' }}>
    ProtecWise LLC · {process.env.NEXT_PUBLIC_AGENCY_ADDRESS}
  </Text>
  <Text style={{ fontSize: '12px', color: '#718096' }}>
    You received this because you requested a quote at protecwise.com.{' '}
    <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe/${unsubscribeToken}`}>
      Unsubscribe
    </Link>
  </Text>
</Section>
```

### Emails that DO NOT need unsubscribe
- Application status updates (transactional)
- Magic link authentication emails
- Password reset emails
- Agent activation emails
- Admin-to-admin notifications

### Emails that REQUIRE unsubscribe
- Quote reminders
- Application abandonment reminders
- Marketing campaigns
- Referral invitations
- Recruiting follow-up sequences

---

## Insurance Regulatory Compliance

### Agent Licensing
```typescript
// An agent CANNOT quote or sell in a state without:
// 1. Active license for that state (in agents.license_numbers JSONB)
// 2. Active carrier appointment for that carrier in that state
// 3. Admin approval of that carrier (agent_carrier_permissions.status = 'approved')

// The buildCOMPINC() function enforces #3 automatically
// But the UI must also enforce #1 and #2 when an agent tries to run a quote

// When agent selects state in quote builder:
// - Check license_numbers array for that state
// - If no active license: show "You don't have an active license in [State].
//   Contact admin to update your licensing."
// - Never disable the state silently — always explain why
```

### Required Application Disclosures
```typescript
// Step 7 of application intake must include ALL of these:
// (Add/remove based on carrier requirements and state)

const REQUIRED_DISCLOSURES = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    required: true,
    mustScrollToBottom: true,
  },
  {
    id: 'hipaa',
    title: 'HIPAA Authorization for Release of Health Information',
    required: true,
    mustScrollToBottom: true,
  },
  {
    id: 'econsent',
    title: 'Electronic Communications Consent',
    required: true,
    mustScrollToBottom: false,
  },
  {
    id: 'accuracy',
    title: 'Application Accuracy Certification',
    required: true,
    mustScrollToBottom: false,
    text: 'I certify that all information provided is true and complete...',
  },
  {
    id: 'replacement',
    title: 'Policy Replacement Disclosure',
    // Only required if step_4_coverage_context.replacement_flag = true
    required: 'conditional',
    condition: 'replacement_flag',
    text: 'I understand that replacing existing life insurance may have tax...',
  },
];
```

### Replacement Business (Regulation 60 / NAIC Model 613)
```typescript
// When a new policy replaces existing coverage:
// 1. Must capture the existing carrier name and policy number
// 2. Must deliver state-mandated replacement notice
// 3. Must document suitability rationale

// In step 4 data capture:
if (step4Data.hasExistingCoverage && step4Data.isReplacement) {
  // Set flag that triggers replacement disclosure in step 7
  await supabase.from('applications').update({
    step_4_coverage_context: {
      ...step4Data,
      replacement_flag: true,   // This flag drives step 7 disclosure
      replacement_carrier: step4Data.existingCarrier,
      replacement_policy: step4Data.existingPolicyNumber,
    }
  }).eq('id', applicationId);
}
```

### E-Signature Legal Requirements
```typescript
// Electronic signature on disclosures must capture:
// 1. Typed name (as legal signature)
// 2. Timestamp (ISO format)
// 3. IP address
// 4. User agent
// 5. The exact text that was agreed to (stored verbatim, not by reference)

// In step_7_disclosures JSONB:
{
  privacy_accepted: true,
  privacy_accepted_at: '2024-01-15T14:32:00Z',
  privacy_accepted_ip: '192.168.1.1',
  hipaa_accepted: true,
  hipaa_accepted_at: '2024-01-15T14:32:05Z',
  hipaa_accepted_ip: '192.168.1.1',
  hipaa_authorization_text: '...full text of the HIPAA authorization...',
  signature_name: 'John Smith',         // typed by user
  signature_timestamp: '2024-01-15T14:32:10Z',
  signature_ip: '192.168.1.1',
  signature_user_agent: 'Mozilla/5.0...',
}
```

### Anti-Money Laundering (AML) — Future Phase
```
AML/KYC screening is required for:
- High face amount policies (typically $1M+, varies by carrier)
- International applicants

For initial platform build:
- Flag cases above $1M face amount for manual AML review
- Add 'aml_review_required' field to applications table
- Create admin workflow to mark AML reviewed

Do NOT build automated OFAC/PEP screening in Phase 1 — 
it requires a third-party service (Dow Jones, LexisNexis) and compliance review.
```

---

## Do Not Call (DNC) Compliance

```typescript
// For outbound calls and SMS to leads:
// The platform MUST honor:
// 1. National DNC Registry (FTC)
// 2. State DNC lists (vary by state)
// 3. Internal DNC list (anyone who has asked not to be contacted)

// In leads table, add:
// do_not_call: boolean (default false)
// do_not_call_reason: text

// Before any outbound call or SMS:
if (lead.do_not_call || lead.sms_opt_out) {
  return; // Never contact
}

// Note: Checking the actual national DNC registry requires a third-party
// service. For Phase 1, implement internal DNC list only.
// Flag for agent attention when a lead requests no contact.
```

---

## Data Retention

```
Per insurance regulatory requirements:
- Application records: retain 7 years minimum (many states require longer)
- Disclosures and consents: retain for the life of the policy + 7 years
- Email and SMS logs: retain 3 years
- Agent activity logs: retain 5 years

Implementation: Never hard-delete application or compliance records.
Use soft deletes (is_deleted: boolean, deleted_at: timestamptz).
Build admin UI for data retention review, not automated deletion.
```
