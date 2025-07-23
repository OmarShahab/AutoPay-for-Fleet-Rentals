import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export async function sendMandateEmail(email: string, name: string, mandateUrl: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Complete Your Weekly Subscription Setup',
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for subscribing to our weekly service!</p>
      <p>Please click the link below to authorize automatic weekly payments:</p>
      <a href="${mandateUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">
        Authorize Weekly Payments
      </a>
      <p>This mandate will allow us to automatically deduct the agreed amount every Monday.</p>
      <p>If the button doesn't work, copy and paste this link in your browser:</p>
      <p>${mandateUrl}</p>
      <br>
      <p>Thank you!</p>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Mandate email sent to:', email)
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}