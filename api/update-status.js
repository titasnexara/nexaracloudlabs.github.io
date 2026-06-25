import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { application_id, status, notes } = req.body;

    if (!application_id || !status) {
      return res.status(400).json({ error: 'Missing application_id or status' });
    }

    // Fetch current application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (fetchError || !application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update status in database
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status,
        notes:      notes || application.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', application_id);

    if (updateError) throw updateError;

    // Send email based on status
    if (status === 'Rejected') {
      await sendRejectionEmail(application);
    } else if (status === 'Shortlisted') {
      await sendShortlistEmail(application);
    }

    return res.status(200).json({ success: true, status });

  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Failed to update status' });
  }
}

// ── Rejection Email ───────────────────────────────────────────
async function sendRejectionEmail(application) {
  const firstName = application.full_name.trim().split(' ')[0];

  await resend.emails.send({
    from:    'Nexara Cloud Labs <titas.datta@nexaracloudlabs.com>',
    to:      application.email,
    subject: `Update on your application — Nexara Cloud Labs`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1e3a8a,#0e7490);padding:28px 32px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;font-size:20px;">Update on Your Application</h2>
          <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">Nexara Cloud Labs</p>
        </div>
        <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #E2E8F0;">
          <p style="font-size:15px;color:#0f172a;margin:0 0 16px;">Hi ${firstName},</p>
          <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px;">
            Thank you for taking the time to apply for the <strong>${application.job_title}</strong> role at Nexara Cloud Labs 
            and for your interest in joining our team.
          </p>
          <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px;">
            After careful consideration, we regret to inform you that we will not be moving forward 
            with your application at this time. This was not an easy decision — we received applications 
            from many talented professionals and the competition was strong.
          </p>
          <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px;">
            We truly appreciate your effort and encourage you to keep an eye on our careers page 
            for future opportunities that may be a great fit for your skills and experience.
          </p>
          <p style="font-size:14px;color:#334155;margin:0 0 24px;">
            View future openings: <a href="https://nexaracloudlabs.com/career.html" style="color:#2563EB;font-weight:600;">nexaracloudlabs.com/career.html</a>
          </p>
          <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 20px;">
          <p style="font-size:13px;color:#64748B;margin:0;">
            Should you have any questions, reach out at <a href="mailto:titas.datta@nexaracloudlabs.com" style="color:#2563EB;">titas.datta@nexaracloudlabs.com</a>
          </p>
          <p style="font-size:13px;color:#64748B;margin:16px 0 0;">Warm regards,<br><strong style="color:#0f172a;">Team Nexara Cloud Labs</strong></p>
        </div>
      </div>
    `
  });
}

// ── Shortlist Email ───────────────────────────────────────────
async function sendShortlistEmail(application) {
  const firstName = application.full_name.trim().split(' ')[0];

  await resend.emails.send({
    from:    'Nexara Cloud Labs <titas.datta@nexaracloudlabs.com>',
    to:      application.email,
    subject: `Great news — You've been shortlisted! — Nexara Cloud Labs`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#1e3a8a,#0e7490);padding:28px 32px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;font-size:20px;">You've Been Shortlisted!</h2>
          <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">Nexara Cloud Labs</p>
        </div>
        <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #E2E8F0;">
          <p style="font-size:15px;color:#0f172a;margin:0 0 16px;">Hi ${firstName},</p>
          <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px;">
            We are pleased to inform you that your application for the <strong>${application.job_title}</strong> 
            position at Nexara Cloud Labs has been shortlisted!
          </p>
          <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px;">
            Our team will be in touch shortly to schedule the next steps. Please keep an eye on your inbox.
          </p>
          <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 20px;">
          <p style="font-size:13px;color:#64748B;margin:0;">
            If you have any questions, reach out at <a href="mailto:titas.datta@nexaracloudlabs.com" style="color:#2563EB;">titas.datta@nexaracloudlabs.com</a>
          </p>
          <p style="font-size:13px;color:#64748B;margin:16px 0 0;">Warm regards,<br><strong style="color:#0f172a;">Team Nexara Cloud Labs</strong></p>
        </div>
      </div>
    `
  });
}
