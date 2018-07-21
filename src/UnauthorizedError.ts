export default class UnauthorizedError extends Error {
  constructor() {
    super()
    this.name = 'UnauthorizedError'
  }
}
