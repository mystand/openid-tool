import axios, { AxiosResponse } from "axios";

class HttpClient<T> {
  private providerUserinfoUri: string

  constructor(providerUserinfoUri: string) {
    this.providerUserinfoUri = providerUserinfoUri
  }

  public async getProviderResponse(token: string): Promise<AxiosResponse<T>> {
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

export default HttpClient