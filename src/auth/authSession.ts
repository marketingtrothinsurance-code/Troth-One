const AUTH_SESSION_KEY = 'troth-one-demo-authenticated'

const DEMO_USERNAME = 'Troth'
const DEMO_PASSWORD = 'Troth@123'

export const authSession = {
  isAuthenticated: () => sessionStorage.getItem(AUTH_SESSION_KEY) === 'true',

  signIn: (username: string, password: string) => {
    const isValid = username === DEMO_USERNAME && password === DEMO_PASSWORD
    if (isValid) sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
    return isValid
  },

  signOut: () => sessionStorage.removeItem(AUTH_SESSION_KEY),
}

