import * as moment from "moment"
import SessionManager from './SessionManager'
import MockSessionStorage from './helpers/MockSessionStorage'

test('should create session', async () => {
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const sessionManager: SessionManager = new SessionManager(sessionStorage)

  const session = { 
    provider: 'pik',
    token: '5305a32e-907e-437e-b520-eb72b46ef9c6',
    expiresAt: moment().add(5, 'm').toISOString(),
    openIdSub: '79e42108-bd7d-4b10-83d7-6b0c526f8591'
  }

  await sessionManager.createSession(session.provider, session.token, session.expiresAt, session.openIdSub)

  expect(sessionStorage.sessions).toHaveLength(1)
  expect(sessionStorage.sessions[0]).toEqual(session)
})

test('should get session', async () => {
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const sessionManager: SessionManager = new SessionManager(sessionStorage)

  const session = { 
    provider: 'pik',
    token: '5305a32e-907e-437e-b520-eb72b46ef9c6',
    expiresAt: moment().add(5, 'm').toISOString(),
    openIdSub: '79e42108-bd7d-4b10-83d7-6b0c526f8591'
  }

  sessionStorage.sessions = [session]

  const sessionFromStorage = await sessionManager.getSession(session.provider, session.token)

  expect(sessionFromStorage).toEqual(session)
})

test('should destroy session from storage', async () => {
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const sessionManager: SessionManager = new SessionManager(sessionStorage)

  const session = { 
    provider: 'pik',
    token: '5305a32e-907e-437e-b520-eb72b46ef9c6',
    expiresAt: moment().add(5, 'm').toISOString(),
    openIdSub: '79e42108-bd7d-4b10-83d7-6b0c526f8591'
  }

  sessionStorage.sessions = [session]

  await sessionManager.destroySession(session)

  expect(sessionStorage.sessions).toHaveLength(0)
})

test('should return null on non existent session', async () => {
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const sessionManager: SessionManager = new SessionManager(sessionStorage)

  expect(await sessionManager.getSession('pik', '123')).toBe(null)
})

test('should return false if session is not expired yet', async () => {
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const sessionManager: SessionManager = new SessionManager(sessionStorage)
  
  const session = { 
    provider: 'pik',
    token: '5305a32e-907e-437e-b520-eb72b46ef9c6',
    expiresAt: moment().add(5, 'm').toISOString(),
    openIdSub: '79e42108-bd7d-4b10-83d7-6b0c526f8591'
  }

  expect(await sessionManager.isSessionExpired(session)).toBe(false)
})

test('should return true if session is expired', async () => {
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const sessionManager: SessionManager = new SessionManager(sessionStorage)
  
  const session = { 
    provider: 'pik',
    token: '5305a32e-907e-437e-b520-eb72b46ef9c6',
    expiresAt: moment().subtract(5, 'm').toISOString(),
    openIdSub: '79e42108-bd7d-4b10-83d7-6b0c526f8591'
  }

  expect(await sessionManager.isSessionExpired(session)).toBe(true)
})