import { Resend } from 'resend';

const FROM    = 'Nexara Cloud Labs <titas.datta@nexaracloudlabs.com>';
const CAREERS = 'https://nexaracloudlabs.com/career.html';
const CONTACT = 'titas.datta@nexaracloudlabs.com';

export default async function handler(req, res) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type, full_name, email, phone, job_title, exp_details, resume_url } = req.body;
    const firstName = full_name ? full_name.trim().split(' ')[0] : 'there';

    if (type === 'new_application') {
      // 1. Recruiter notification
      const expRows = exp_details ? Object.entries(exp_details).map(([skill, years]) =>
        `<tr>
          <td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;font-weight:600;color:#475569;background:#F8FAFC;width:40%;">${skill}</td>
          <td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;color:#0f172a;">${years} years</td>
        </tr>`
      ).join('') : '';

      await resend.emails.send({
        from: FROM, to: CONTACT,
        subject: `New Application — ${job_title}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#1e3a8a,#0e7490);padding:28px 32px;border-radius:12px 12px 0 0;">
              <h2 style="color:#fff;margin:0;font-size:20px;">New Job Application</h2>
              <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">Nexara Cloud Labs — Career Portal</p>
            </div>
            <div style="background:#f8fafc;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #E2E8F0;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr><td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;font-weight:600;color:#475569;background:#F8FAFC;width:38%;">Full Name</td><td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;color:#0f172a;">${full_name}</td></tr>
                <tr><td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;font-weight:600;color:#475569;background:#F8FAFC;">Email</td><td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;color:#0f172a;"><a href="mailto:${email}" style="color:#2563EB;">${email}</a></td></tr>
                <tr><td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;font-weight:600;color:#475569;background:#F8FAFC;">Phone</td><td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;color:#0f172a;">${phone || 'Not provided'}</td></tr>
                <tr><td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;font-weight:600;color:#475569;background:#F8FAFC;">Position</td><td style="padding:10px 12px;border:1px solid #E2E8F0;font-size:13px;color:#0f172a;">${job_title}</td></tr>
                ${expRows}
              </table>
              ${resume_url ? `<div style="text-align:center;margin-bottom:20px;"><a href="${resume_url}" style="display:inline-block;background:#2563EB;color:#fff;padding:11px 28px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700;">Download Resume</a></div>` : ''}
              <div style="background:#EFF6FF;border-radius:8px;padding:14px 16px;border:1px solid #BFDBFE;">
                <p style="font-size:12px;color:#1d4ed8;margin:0;">Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
              </div>
            </div>
          </div>`
      });

      // 2. Candidate auto-reply
      await resend.emails.send({
        from: FROM, to: email,
        subject: `Thank you for applying — Nexara Cloud Labs`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#1e3a8a,#0e7490);padding:28px 32px;border-radius:12px 12px 0 0;">
              <h2 style="color:#fff;margin:0;font-size:20px;">Application Received!</h2>
              <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">Nexara Cloud Labs</p>
            </div>
            <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #E2E8F0;">
              <p style="font-size:15px;color:#0f172a;margin:0 0 16px;">Hi ${firstName},</p>
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px;">Thank you for applying for the <strong>${job_title}</strong> position at Nexara Cloud Labs. We have received your application and our team is currently reviewing it.</p>
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px;">We aim to get back to you within <strong>2-3 business days</strong>.</p>
              <div style="background:#F0F9FF;border-left:4px solid #2563EB;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
                <p style="font-size:13px;color:#1d4ed8;margin:0;font-weight:600;">What happens next?</p>
                <ul style="font-size:13px;color:#334155;margin:8px 0 0;padding-left:18px;line-height:1.8;">
                  <li>Our team reviews your profile</li>
                  <li>If shortlisted, we will reach out to schedule an intro call</li>
                  <li>Technical round followed by a final interview</li>
                </ul>
              </div>
              <p style="font-size:14px;color:#334155;margin:0 0 24px;">Explore our open roles: <a href="${CAREERS}" style="color:#2563EB;font-weight:600;">${CAREERS}</a></p>
              <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 20px;">
              <p style="font-size:13px;color:#64748B;margin:0;">Questions? Reach out at <a href="mailto:${CONTACT}" style="color:#2563EB;">${CONTACT}</a></p>
              <p style="font-size:13px;color:#64748B;margin:16px 0 0;">Warm regards,<br><strong style="color:#0f172a;">Team Nexara Cloud Labs</strong></p>
            </div>
          </div>`
      });

      return res.status(200).json({ success: true });
    }

    if (type === 'rejection') {
      const { full_name: name, email: to, job_title: position } = req.body;
      const fn = name.trim().split(' ')[0];

      await resend.emails.send({
        from: FROM, to,
        subject: `Update on your application — Nexara Cloud Labs`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#1e3a8a,#0e7490);padding:28px 32px;border-radius:12px 12px 0 0;">
              <h2 style="color:#fff;margin:0;font-size:20px;">Update on Your Application</h2>
              <p style="color:#93c5fd;margin:6px 0 0;font-size:13px;">Nexara Cloud Labs</p>
            </div>
            <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #E2E8F0;">
              <p style="font-size:15px;color:#0f172a;margin:0 0 16px;">Hi ${fn},</p>
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px;">Thank you for taking the time to apply for the <strong>${position}</strong> role at Nexara Cloud Labs and for your interest in joining our team.</p>
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px;">After careful consideration, we regret to inform you that we will not be moving forward with your application at this time. This was not an easy decision — we received applications from many talented professionals and the competition was strong.</p>
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px;">We truly appreciate your effort and encourage you to keep an eye on our careers page for future opportunities.</p>
              <p style="font-size:14px;color:#334155;margin:0 0 24px;">View future openings: <a href="${CAREERS}" style="color:#2563EB;font-weight:600;">${CAREERS}</a></p>
              <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 20px;">
              <p style="font-size:13px;color:#64748B;margin:0;">Questions? <a href="mailto:${CONTACT}" style="color:#2563EB;">${CONTACT}</a></p>
              <p style="font-size:13px;color:#64748B;margin:16px 0 0;">Warm regards,<br><strong style="color:#0f172a;">Team Nexara Cloud Labs</strong></p>
            </div>
          </div>`
      });

      return res.status(200).json({ success: true });
    }

    if (type === 'shortlisted') {
      const { full_name: name, email: to, job_title: position } = req.body;
      const fn = name.trim().split(' ')[0];

      await resend.emails.send({
        from: FROM, to,
        subject: `Great news — You have been shortlisted! — Nexara Cloud Labs`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#059669,#0e7490);padding:28px 32px;border-radius:12px 12px 0 0;">
              <h2 style="color:#fff;margin:0;font-size:20px;">You Have Been Shortlisted!</h2>
              <p style="color:#a7f3d0;margin:6px 0 0;font-size:13px;">Nexara Cloud Labs</p>
            </div>
            <div style="background:#ffffff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #E2E8F0;">
              <p style="font-size:15px;color:#0f172a;margin:0 0 16px;">Hi ${fn},</p>
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 16px;">We are pleased to inform you that your application for the <strong>${position}</strong> position at Nexara Cloud Labs has been shortlisted!</p>
              <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 24px;">Our team will be in touch shortly to schedule the next steps. Please keep an eye on your inbox.</p>
              <hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 20px;">
              <p style="font-size:13px;color:#64748B;margin:0;">Questions? <a href="mailto:${CONTACT}" style="color:#2563EB;">${CONTACT}</a></p>
              <p style="font-size:13px;color:#64748B;margin:16px 0 0;">Warm regards,<br><strong style="color:#0f172a;">Team Nexara Cloud Labs</strong></p>
            </div>
          </div>`
      });

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown email type' });

  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
