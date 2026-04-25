import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLicenseKeyEmail(email: string, key: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not found. Skipping email sending.');
      console.log(`[MOCK EMAIL] To: ${email}, Key: ${key}`);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: 'Cryllix <onboarding@resend.dev>', // Default Resend test domain, user should update if they have a domain
      to: [email],
      subject: 'Your Cryllix License Key',
      html: `
        <div style="font-family: Arial, sans-serif; bg-color: #0f172a; color: #fff; padding: 20px;">
          <h1 style="color: #3b82f6;">Cryllix</h1>
          <p>Thank you for your purchase!</p>
          <p>Here is your license key:</p>
          <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #334155; font-family: monospace; font-size: 18px; margin: 20px 0;">
            ${key}
          </div>
          <p>Please keep this key safe. Do not share it with anyone.</p>
          <br/>
          <p style="color: #64748b; font-size: 12px;">The Cryllix Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      throw error;
    }

    console.log('Message sent via Resend:', data?.id);
    return data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
