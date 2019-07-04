import { IConfig } from "./types";
declare class OpenId<U, T> {
    private sessionManager;
    private userManager;
    private jwtSecret;
    private expireMinutes;
    private providerHttpClient;
    private LOCAL_PROVIDER_NAME;
    private OPENID_PROVIDER_NAME;
    constructor(config: IConfig<U, T>);
    getUserFromHeader(header: string): Promise<U | null>;
    private getUserFromOpenId;
    private getUserFromJWT;
}
export default OpenId;
