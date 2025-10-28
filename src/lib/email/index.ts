import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export { resend }

// Email templates will be created here later
export const sendCallbackRequest = async (data: {
  garageName: string
  customerName: string
  customerPhone: string
  callbackEmail: string
}) => {
  // Implementation will be added during feature development
  console.log('Callback request email:', data)
}
