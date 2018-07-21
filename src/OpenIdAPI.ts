import axios, { AxiosInstance, AxiosResponse } from "axios";

class OpenIdAPI<T> {
  private providerUserinfoUri: string

  constructor(providerUserinfoUri: string) {
    this.providerUserinfoUri = providerUserinfoUri
  }

  public async getUser(token: string): Promise<T> {
    return (await this.getProviderResponse(token)).data
  }

  public async getStatus(token: string): Promise<number> {
    return (await this.getProviderResponse(token)).status
  }

  private async getProviderResponse(token: string): Promise<AxiosResponse<T>> {
    const providerResponse: AxiosResponse<T> = await axios.get<T>(
      this.providerUserinfoUri,
      {
        headers: {
          authorization: `Bearer ${token}`
        },
        validateStatus(status) {
          return status >= 200 && status < 500
        }
      }
    )
    return providerResponse
  }
}

export default OpenIdAPI