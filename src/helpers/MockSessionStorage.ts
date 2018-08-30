import { ISessionStorage, Session } from "../..";

export default class MockSessionStorage implements ISessionStorage {
  public sessions: Session[] = []
  async get(provider: string, token: string): Promise<Session | null> {
    return this.sessions.find(
      this.sessionSearchPredicate(provider, token)
    ) || null
  }

  async create(provider: string, token: string, expiresAt: string, openIdSub: string): Promise<Session> {
    const session: Session = { provider, token, expiresAt, openIdSub }
    this.sessions.push(session)
    return session
  }

  async destroy(session: Session): Promise<void> {
    const index: number = this.sessions.findIndex(
      this.sessionSearchPredicate(session.provider, session.token)
    )
    if (index !== -1) {
      this.sessions.splice(index, 1)
    }
  }

  private sessionSearchPredicate(provider: string, token: string): (session: Session) => boolean {
    return (session: Session) => session.provider === provider && session.token === token
  }
}