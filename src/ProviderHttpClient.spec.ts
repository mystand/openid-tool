import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import ProviderHttpClient from './ProviderHttpClient'

test('should return provider response', async () => {
  const mock = new MockAdapter(axios)
  const providerUri = 'http://provider.test'
  const providerResponse = { response: 'something' }
  const token = 'something'

  mock
    .onGet(providerUri)
    .reply(200, providerResponse)

  const httpClient = new ProviderHttpClient(providerUri)

  expect((await httpClient.getProviderResponse(token)).data).toEqual(providerResponse)

  mock.restore()
})

test('should return 401 if no session created on provider', async () => {
  const mock = new MockAdapter(axios)
  const providerUri = 'http://provider.test'
  const token = 'something'

  mock
    .onGet(providerUri)
    .reply(401)

  const httpClient = new ProviderHttpClient(providerUri)

  expect((await httpClient.getProviderResponse(token)).status).toEqual(401)

  mock.restore()
})