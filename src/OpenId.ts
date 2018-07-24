import * as jwt from "jsonwebtoken"
import * as moment from "moment"
import OpenIdError from "./OpenIdError";
import ProviderHttpClient from "./ProviderHttpClient";
import { IUserManager, IConfig, Session } from "./types";
import SessionManager from "./SessionManager";
import TokenUtils from "./TokenUtils";

class OpenId<U, T> {
  private sessionManager: SessionManager
  private userManager: IUserManager<U, T>
  private jwtSecret: string
  private expireMinutes: number
  private providerHttpClient: ProviderHttpClient<T>
  private LOCAL_PROVIDER_NAME: string
  private OPENID_PROVIDER_NAME: string

  constructor(config: IConfig<U, T>) {
    this.userManager = config.userManager
    this.expireMinutes = config.expireMinutes
    this.sessionManager = new SessionManager(config.sessionStorage)
    this.jwtSecret = config.jwtSecret
    this.providerHttpClient = new ProviderHttpClient<T>(config.providerUserinfoUri)
    this.LOCAL_PROVIDER_NAME = config.LOCAL_PROVIDER_NAME
    this.OPENID_PROVIDER_NAME = config.OPENID_PROVIDER_NAME
  }

  public async getUserFromHeader(header: string): Promise<U | null> {
    try {
      const provider: string = TokenUtils.getProvider(header)
      const token: string = TokenUtils.getToken(header)

      if (provider === this.LOCAL_PROVIDER_NAME) {
        return this.getUserFromJWT(token)
      }
      if (provider === this.OPENID_PROVIDER_NAME) {
        return this.getUserFromOpenId(token)
      }

      throw new Error(
        `Unknown provider in your auth header: ${provider}. Only ${[this.LOCAL_PROVIDER_NAME, this.OPENID_PROVIDER_NAME]} is allowed`
      )
    } catch (e) {
      throw new OpenIdError(e.message)
    }
  }

  private async getUserFromOpenId(token: string): Promise<U | null> {
    const session: Session | null = await this.sessionManager.getSession(this.OPENID_PROVIDER_NAME, token)
    let user: U | null = null

    if (!session || await this.sessionManager.isSessionExpired(session)) {
      if (session) {
        await this.sessionManager.destroySession(session)
      }
      const { data: userInfo, status } = await this.providerHttpClient.getProviderResponse(token)
      const openIdSub: string = (userInfo as any).sub
      if (!userInfo || status !== 200) {
        throw new OpenIdError('OpenId server responsed with non 200 code')
      }
      user = await this.userManager.findByOpenIdSub(openIdSub)
      if (!user) {
        user = await this.userManager.create(userInfo)
      }

      await this.sessionManager.createSession(
        this.OPENID_PROVIDER_NAME,
        token,
        moment().add(this.expireMinutes, 'm').toISOString(),
        openIdSub
      )
    } else {
      user = await this.userManager.findByOpenIdSub(session.openIdSub)
    }

    return user
  }

  private getUserFromJWT(token: string): Promise<U | null> {
    return new Promise((resolve, reject) =>
      jwt.verify(token, this.jwtSecret, (err: Error, decoded: any) => {
        if (err) {
          reject(err)
        }
        resolve(decoded)
      })
    ).then((decoded: any) => this.userManager.findFromJWT(decoded))
  }
}

export default OpenId
