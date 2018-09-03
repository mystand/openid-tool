import * as jwt from 'jsonwebtoken'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import * as moment from 'moment'

import MockUserManager from './helpers/MockUserManager'
import MockSessionStorage from './helpers/MockSessionStorage'
import { IConfig } from './types'
import { IMockUser, IMockProviderResponse } from './helpers/MockInterfaces'
import OpenId from '..'

const providerUri = 'http://provider.test'
const LOCAL_PROVIDER_NAME = 'local'
const OPENID_PROVIDER_NAME = 'openid'
const JWT_SECRET = 'somesecret'

test('should throw error with wrong provider', async () => {
  expect.assertions(1)
  const userManager: MockUserManager = new MockUserManager()
  
  const config: IConfig<IMockUser, IMockProviderResponse> = {
    sessionStorage:  new MockSessionStorage(),
    userManager,
    jwtSecret: JWT_SECRET,
    providerUserinfoUri: providerUri,
    expireMinutes: 5,
    LOCAL_PROVIDER_NAME,
    OPENID_PROVIDER_NAME
  }

  const auth = new OpenId(config)

  await auth.getUserFromHeader('Bearer invalid 2312321321312').catch(
    e => expect(e.message).toBe('Unknown provider in your auth header: invalid. Only local,openid is allowed')
  )
})

test('should return user from jwt token', async () => {
  const userManager: MockUserManager = new MockUserManager()
  await userManager.create({ name: 'tralala', sub: '2abce928-e4ad-4108-be04-a9504fd71d0c' })
  const user = await userManager.findByOpenIdSub('2abce928-e4ad-4108-be04-a9504fd71d0c')

  const config: IConfig<IMockUser, IMockProviderResponse> = {
    sessionStorage:  new MockSessionStorage(),
    userManager,
    jwtSecret: JWT_SECRET,
    providerUserinfoUri: providerUri,
    expireMinutes: 5,
    LOCAL_PROVIDER_NAME,
    OPENID_PROVIDER_NAME
  }

  const auth = new OpenId(config)
  
  const userJwt = jwt.sign(user, JWT_SECRET)
  expect(await auth.getUserFromHeader(`Bearer ${LOCAL_PROVIDER_NAME} ${userJwt}`)).toEqual(user)
})

test('should fail with invalid jwt', async () => {
  expect.assertions(1)
  const userManager: MockUserManager = new MockUserManager()

  const config: IConfig<IMockUser, IMockProviderResponse> = {
    sessionStorage:  new MockSessionStorage(),
    userManager,
    jwtSecret: JWT_SECRET,
    providerUserinfoUri: providerUri,
    expireMinutes: 5,
    LOCAL_PROVIDER_NAME,
    OPENID_PROVIDER_NAME
  }

  const auth = new OpenId(config)
  await auth.getUserFromHeader(`Bearer ${LOCAL_PROVIDER_NAME} invalid`).catch(
    e => expect(e.message).toBe('jwt malformed')
  )
})

test('should create user and session if user is not in db', async () => {
  const mock = new MockAdapter(axios)
  const userSub = 'a626ffb2-f179-4348-b7f6-260b1ef0e654'
  const providerResponse = {
    sub: userSub,
    name: 'somename'
  }

  mock
    .onGet(providerUri)
    .reply(200, providerResponse)
  
  const userManager: MockUserManager = new MockUserManager()
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const config: IConfig<IMockUser, IMockProviderResponse> = {
    sessionStorage:  sessionStorage,
    userManager,
    jwtSecret: JWT_SECRET,
    providerUserinfoUri: providerUri,
    expireMinutes: 5,
    LOCAL_PROVIDER_NAME,
    OPENID_PROVIDER_NAME
  }

  const auth = new OpenId(config)

  await auth.getUserFromHeader(`Bearer ${OPENID_PROVIDER_NAME} sometoken`)

  expect(sessionStorage.sessions).toHaveLength(1)
  expect(sessionStorage.sessions[0].openIdSub).toBe(providerResponse.sub)
  expect(userManager.users).toHaveLength(1)
  expect(userManager.users[0].importGuid).toBe(providerResponse.sub)
  expect(userManager.users[0].name).toBe(providerResponse.name)

  mock.restore()
})

test('should create session if user is in db', async () => {
  const mock = new MockAdapter(axios)
  const userSub = 'a626ffb2-f179-4348-b7f6-260b1ef0e654'
  const user = {
    sub: userSub,
    name: 'somename'
  }

  mock
    .onGet(providerUri)
    .reply(200, user)
  
  const userManager: MockUserManager = new MockUserManager()
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const config: IConfig<IMockUser, IMockProviderResponse> = {
    sessionStorage:  sessionStorage,
    userManager,
    jwtSecret: JWT_SECRET,
    providerUserinfoUri: providerUri,
    expireMinutes: 5,
    LOCAL_PROVIDER_NAME,
    OPENID_PROVIDER_NAME
  }

  const auth = new OpenId(config)

  expect(sessionStorage.sessions).toHaveLength(0)
  
  await userManager.create(user)

  await auth.getUserFromHeader(`Bearer ${OPENID_PROVIDER_NAME} sometoken`)

  expect(sessionStorage.sessions).toHaveLength(1)
  expect(sessionStorage.sessions[0].openIdSub).toBe(user.sub)

  mock.restore()
})

test('should destroy expired session and create new one', async () => {
  const mock = new MockAdapter(axios)
  const userSub = 'a626ffb2-f179-4348-b7f6-260b1ef0e654'
  const user = {
    sub: userSub,
    name: 'somename'
  }

  const token = 'sometoken'

  mock
    .onGet(providerUri)
    .reply(200, user)
  
  const userManager: MockUserManager = new MockUserManager()
  const sessionStorage: MockSessionStorage = new MockSessionStorage()
  const config: IConfig<IMockUser, IMockProviderResponse> = {
    sessionStorage:  sessionStorage,
    userManager,
    jwtSecret: JWT_SECRET,
    providerUserinfoUri: providerUri,
    expireMinutes: 5,
    LOCAL_PROVIDER_NAME,
    OPENID_PROVIDER_NAME
  }

  const auth = new OpenId(config)

  await userManager.create(user)
  const expiredAt = moment().subtract(1, 'm').toISOString()
  await sessionStorage.create(OPENID_PROVIDER_NAME, token, expiredAt, user.sub)

  expect(sessionStorage.sessions).toHaveLength(1)

  await auth.getUserFromHeader(`Bearer ${OPENID_PROVIDER_NAME} ${token}`)

  expect(sessionStorage.sessions).toHaveLength(1)
  expect(sessionStorage.sessions[0].expiresAt).not.toBe(expiredAt)

  mock.restore()
})