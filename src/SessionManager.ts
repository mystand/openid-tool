import * as moment from "moment";
import { ISessionStorage, Session } from "./types";

export default class SessionManager {
  private sessionStorage: ISessionStorage
  constructor(sessionStorage: ISessionStorage) {
    this.sessionStorage = sessionStorage
  }

  async getSession(provider: string, token: string): Promise<Session> {
    return this.sessionStorage.get(provider, token)
  }

  async createSession(provider: string, token: string, expiresAt: string, openIdSub: string): Promise<Session> {
    return this.sessionStorage.create(provider, token, expiresAt, openIdSub)
  }

  async isSessionExpired(session: Session): Promise<boolean> {
    return moment(session.expiresAt).isBefore()
  }

  async destroySession(session: Session): Promise<void> {
    return this.sessionStorage.destroy(session)
  }
}
