export interface IConfig<U, T> {
    sessionStorage: ISessionStorage;
    userManager: IUserManager<U, T>;
    jwtSecret: string;
    providerUserinfoUri: string;
    expireMinutes: number;
    LOCAL_PROVIDER_NAME: string;
    OPENID_PROVIDER_NAME: string;
}
export interface Session {
    expiresAt: string | Date;
    token: string;
    provider: string;
    openIdSub: string;
}
export interface ISessionStorage {
    get(provider: string, token: string): Promise<Session | null>;
    create(provider: string, token: string, expiresAt: string, openIdSub: string): Promise<Session>;
    destroy(session: Session): Promise<void>;
}
export interface IUserManager<U, T> {
    create(data: T): Promise<U>;
    findByOpenIdSub(openIdSub: string): Promise<U | null>;
    findFromJWT(parsedJWT: any): Promise<U | null>;
}
