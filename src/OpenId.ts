import * as jwt from "jsonwebtoken"
import * as moment from "moment"
import UnauthorizedError from "./UnauthorizedError";
import { PROVIDERS } from "./constants/Providers";
import OpenIdAPI from "./OpenIdAPI";
import { IUserManager, IConfig } from "./types";
import SessionManager from "./SessionManager";
import TokenUtils from "./TokenUtils";

class OpenId<U, T> {
  private sessionManager: SessionManager
  private userManager: IUserManager<U, T>
  private jwtSecret: string
  private expireMinutes: number
  private openIdAPI: OpenIdAPI<T>

  constructor(config: IConfig<U, T>) {
    this.userManager = config.userManager
    this.expireMinutes = config.expireMinutes
    this.sessionManager = new SessionManager(config.sessionStorage)
    this.jwtSecret = config.jwtSecret
    this.openIdAPI = new OpenIdAPI<T>(config.providerUserinfoUri)
  }

  public async getUserFromHeader(header: string): Promise<U> {
    const provider: string = TokenUtils.getProvider(header)
    const token: string = TokenUtils.getToken(header)

    if (provider === PROVIDERS.LOCAL) {
      return this.getUserFromJWT(token)
    }
    if (provider === PROVIDERS.PIK) {
      return this.getUserFromOpenId(token)
    }

    throw new UnauthorizedError()
  }

  private async getUserFromOpenId(token: string): Promise<U> {
    const session = await this.sessionManager.getSession(PROVIDERS.PIK, token)

    let user: U
    if (!session || this.sessionManager.isSessionExpired(session)) {
      if (session) {
        await this.sessionManager.destroySession(session)
      }
      const userInfo = await this.openIdAPI.getUser(token)
      const openIdSub: string = (userInfo as any).sub
      if (!userInfo || await this.openIdAPI.getStatus(token) !== 200) {
        throw new UnauthorizedError()
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
