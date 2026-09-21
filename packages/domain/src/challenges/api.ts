import { Schema } from 'effect'
import { HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi'
import { PaginationQuery, PaginationResult } from '../common/pagination'
import { DomainError } from '../error'
import {
  Challenge,
  ChallengeId,
  CreateChallengeInput,
  PatchChallengeInput,
} from './schema'

export const ChallengesGroup = HttpApiGroup.make('challenges')
  .add(
    HttpApiEndpoint.get('list', '/challenges', {
      query: PaginationQuery,
      success: PaginationResult(Challenge),
      error: [DomainError],
    }),
  )
  .add(
    HttpApiEndpoint.get('fetch', '/challenges/:id', {
      params: Schema.Struct({ id: ChallengeId }),
      success: Challenge,
      error: [DomainError],
    }),
  )
  .add(
    HttpApiEndpoint.post('create', '/challenges', {
      payload: CreateChallengeInput,
      success: Challenge,
      error: [DomainError],
    }),
  )
  .add(
    HttpApiEndpoint.patch('patch', '/challenges/:id', {
      params: Schema.Struct({ id: ChallengeId }),
      payload: PatchChallengeInput,
      success: Challenge,
      error: [DomainError],
    }),
  )
  .add(
    HttpApiEndpoint.delete('del', '/challenges/:id', {
      params: Schema.Struct({ id: ChallengeId }),
      success: Challenge,
      error: [DomainError],
    }),
  )
