import * as jwt from "jsonwebtoken"
import * as moment from "moment"
import OpenIdError from "./OpenIdError";
import { PROVIDERS } from "./constants/Providers";
import ProviderHttpClient from "./ProviderHttpClient";
import { IUserManager, IConfig } from "./types";
import SessionManager from "./SessionManager";
import TokenUtils from "./TokenUtils";

class OpenId<U, T> {
  private sessionManager: SessionManager
  private userManager: IUserManager<U, T>
  private jwtSecret: string
  private expireMinutes: number
  private providerHttpClient: ProviderHttpClient<T>

  constructor(config: IConfig<U, T>) {
    this.userManager = config.userManager
    this.expireMinutes = config.expireMinutes
    this.sessionManager = new SessionManager(config.sessionStorage)
    this.jwtSecret = config.jwtSecret
    this.providerHttpClient = new ProviderHttpClient<T>(config.providerUserinfoUri)
  }

  public async getUserFromHeader(header: string): Promise<U> {
    try {
      const provider: string = TokenUtils.getProvider(header)
      const token: string = TokenUtils.getToken(header)

      if (provider === PROVIDERS.LOCAL) {
        return this.getUserFromJWT(token)
      }
      if (provider === PROVIDERS.PIK) {
        return this.getUserFromOpenId(token)
      }

      throw new Error(
        `Unknown provider in your auth header: ${provider}. Only ${Object.keys(PROVIDERS).join(', ')} is allowed`
      )
    } catch (e) {
      throw new OpenIdError(e.message)
    }
  }

  private async getUserFromOpenId(token: string): Promise<U> {
    const session = await this.sessionManager.getSession(PROVIDERS.PIK, token)

    let user: U
    if (!session || this.sessionManager.isSessionExpired(session)) {
      if (session) {
        await this.sessionManager.destroySession(session)
      }
      const userInfo = await this.providerHttpClient.getUser(token)
      const openIdSub: string = (userInfo as any).sub
      if (!userInfo || await this.providerHttpClient.getStatus(token) !== 200) {
        throw new OpenIdError('OpenId server responsed with non 200 code')
      }
      user = await this.userManager.findByOpenIdSub(openIdSub)
      if (!user) {
        user = await this.userManager.create(userInfo)
      }

      await this.sessionManager.createSession(
        PROVIDERS.PIK,
        token,
        moment().add(this.expireMinutes, 'm').toISOString(),
        openIdSub
      )
    } else {
      user = await this.userManager.findByOpenIdSub(session.openIdSub)
    }

    return user
  }

  private getUserFromJWT(token: string): Promise<U> {
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
