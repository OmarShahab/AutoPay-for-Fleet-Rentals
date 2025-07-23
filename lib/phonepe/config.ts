export const PHONEPE_CONFIG = {
  CLIENT_ID: process.env.PHONEPE_CLIENT_ID!,
  CLIENT_SECRET: process.env.PHONEPE_CLIENT_SECRET!,
  IS_UAT: process.env.PHONEPE_IS_UAT === 'true',
  CALLBACK_URL: process.env.CALLBACK_URL!,
  
  get BASE_URL() {
    return this.IS_UAT 
      ? 'https://api-preprod.phonepe.com/apis/pg-sandbox'
      : 'https://api.phonepe.com/apis/pg'
  },
  
  get AUTH_URL() {
    return this.IS_UAT
      ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token'
      : 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
  }
}