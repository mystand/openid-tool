import TokenUtils from './TokenUtils'

test('getting provider from header', () => {
  expect(TokenUtils.getProvider('Bearer provider token')).toBe('provider')
})

test('getting token from header', () => {
  expect(TokenUtils.getToken('Bearer provider token')).toBe('token')
})