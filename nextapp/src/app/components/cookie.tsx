// cookie.ts
import { setCookie, parseCookies, destroyCookie } from 'nookies';

export const storeTokensInCookie = (token: string, refreshToken: string) => {
  setCookie(null, 'authData', JSON.stringify({ token, refreshToken }), {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
};

//print stored tokens
export const printStoredTokens = () => {
  const cookies = parseCookies();
  const authData = cookies.authData ? JSON.parse(cookies.authData) : null;

  if (authData) {
    const { token, refreshToken } = authData;
    console.log('Stored Token:', token);
    console.log('Stored Refresh Token:', refreshToken);
  } else {
    console.log('No stored tokens found.');
  }
};

//delete the cookie
export const deleteCookie = () => {
  destroyCookie(null, 'authData', { path: '/' });
  console.log('Cookie deleted.');
};

//retrieve the stored token
export const getToken = () => {
  const cookies = parseCookies();
  const authData = cookies.authData ? JSON.parse(cookies.authData) : null;

  return authData ? authData.token : null;
};


