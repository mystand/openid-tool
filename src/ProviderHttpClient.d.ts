import { AxiosResponse } from "axios";
declare class HttpClient<T> {
    private providerUserinfoUri;
    constructor(providerUserinfoUri: string);
    getProviderResponse(token: string): Promise<AxiosResponse<T>>;
}
export default HttpClient;
