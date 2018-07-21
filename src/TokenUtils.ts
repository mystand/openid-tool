export default class TokenUtils {
  // Bearer {provider} {token}
  static getProvider(header: string): string {
    return header.split(' ')[1]
  }

  static getToken(header: string): string {
    return header.split(' ')[2]
  }
}
