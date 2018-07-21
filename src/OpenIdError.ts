export default class OpenIdError extends Error {
  constructor(message: string = '') {
    super()
    this.name = 'OpenIdError'
    this.message = message
  }
}
