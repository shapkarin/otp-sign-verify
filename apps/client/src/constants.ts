const CONSTANTS = {
  /* 
    NEXT_PUBLIC_DYNAMIC_ENV_ID not super secret until it avalibale on front-end build
    but it's possible to restrict it on the provider side
  */
  NEXT_PUBLIC_DYNAMIC_ENV_ID: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || '',
  // TODO auto add api prod domain
  API_DOMAIN: process.env.NODE_ENV === 'production' ? 'https://api-zeta-puce-36.vercel.app' : 'https://localhost:3001',
} as const;

export default CONSTANTS;