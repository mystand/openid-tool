import { ISessionStorage, Session } from "./types";
export default class SessionManager {
    private sessionStorage;
    constructor(sessionStorage: ISessionStorage);
    getSession(provider: string, token: string): Promise<Session | null>;
    createSession(provider: string, token: string, expiresAt: string, openIdSub: string): Promise<Session>;
    isSessionExpired(session: Session): Promise<boolean>;
    destroySession(session: Session): Promise<void>;
}
