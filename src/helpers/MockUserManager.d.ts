import { IUserManager } from "../types";
import { IMockUser, IMockProviderResponse } from "./MockInterfaces";
export default class MockUserManager implements IUserManager<IMockUser, IMockProviderResponse> {
    users: IMockUser[];
    create(data: IMockProviderResponse): Promise<IMockUser>;
    findByOpenIdSub(sub: string): Promise<IMockUser | null>;
    findFromJWT(parsedJWT: Partial<IMockUser>): Promise<IMockUser | null>;
    private mapData;
    private userSearchPredicateBySub;
}
