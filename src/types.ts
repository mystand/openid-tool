
export interface IConfig<U, T> {
  sessionStorage: ISessionStorage
  userManager: IUserManager<U, T>
  jwtSecret: string
  providerUserinfoUri: string
  expireMinutes: number
  LOCAL_PROVIDER_NAME: string
  OPENID_PROVIDER_NAME: string
}

export interface Session {
  expiresAt: string
  token: string
  provider: string
  openIdSub: string
}

export interface ISessionStorage {
  get(provider: string, token: string): Promise<Session>

  create(provider: string, token: string, expiresAt: string, userId: string): Promise<Session>

  destroy(session: Session): Promise<void>
}

export interface IUserManager<U, T> {
  create(data: T): Promise<U>
  findByOpenIdSub(openIdSub: string): Promise<U>
  findFromJWT(parsedJWT: any): Promise<U>
}