import { IUserManager } from "../types";
import { IMockUser, IMockProviderResponse } from "./MockInterfaces";


export default class MockUserManager implements IUserManager<IMockUser, IMockProviderResponse> {
  public users: IMockUser[] = []

  async create(data: IMockProviderResponse): Promise<IMockUser> {
    if (this.users.findIndex(this.userSearchPredicateBySub(data.sub)) !== -1) {
      throw new Error('duplicate user')
    }

    const user = this.mapData(data)
    this.users.push(user)

    return user
  }

  async findByOpenIdSub(sub: string): Promise<IMockUser | null> {
    return this.users.find(this.userSearchPredicateBySub(sub)) || null
  }

  async findFromJWT(parsedJWT: Partial<IMockUser>): Promise<IMockUser | null> {
    return this.users.find((user: IMockUser) => user.id === parsedJWT.id) || null
  }
  
  private mapData(data: IMockProviderResponse): IMockUser {
    return {
      id: this.users.length + 1,
      name: data.name,
      importGuid: data.sub
    }
  }

  private userSearchPredicateBySub(sub: string): (user: IMockUser) => boolean {
    return (user: IMockUser) => user.importGuid === sub
  }
}