import { ISessionStorage, Session } from "../..";
export default class MockSessionStorage implements ISessionStorage {
    sessions: Session[];
    get(provider: string, token: string): Promise<Session | null>;
    create(provider: string, token: string, expiresAt: string, openIdSub: string): Promise<Session>;
    destroy(session: Session): Promise<void>;
    private sessionSearchPredicate;
}
