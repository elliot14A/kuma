import { KumaApi } from '@kuma/domain'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'
import { AtomHttpApi } from 'effect/unstable/reactivity'

export class ApiClient extends AtomHttpApi.Service<ApiClient>()('ApiClient', {
  api: KumaApi,
  httpClient: FetchHttpClient.layer,
  baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
}) {}
