interface User {
  username: string
  role: string
}

// Hardcoded credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'bikeadmin123',
  role: 'admin'
}

export function validateCredentials(username: string, password: string): User | null {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return {
      username: ADMIN_CREDENTIALS.username,
      role: ADMIN_CREDENTIALS.role
    }
  }
  return null
}

export function createSession(user: User): string {
  // Simple session token (in production, use proper JWT)
  const sessionData = {
    username: user.username,
    role: user.role,
    timestamp: Date.now()
  }
  return btoa(JSON.stringify(sessionData))
}

export function validateSession(token: string): User | null {
  try {
    const sessionData = JSON.parse(atob(token))
    
    // Check if session is less than 24 hours old
    const isValid = (Date.now() - sessionData.timestamp) < (24 * 60 * 60 * 1000)
    
    if (isValid && sessionData.username === ADMIN_CREDENTIALS.username) {
      return {
        username: sessionData.username,
        role: sessionData.role
      }
    }
  } catch (error) {
    return null
  }
  return null
}