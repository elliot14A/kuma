import { Schema } from 'effect'
import { HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi'
import { PaginationQuery, PaginationResult } from '../common/pagination'
import { DomainError } from '../error'
import {
  Assessment,
  AssessmentId,
  CreateAssessmentInput,
  PatchAssessmentInput,
} from './schema'

export const AssessmentsGroup = HttpApiGroup.make('assessments')
  .add(
    HttpApiEndpoint.get('list', '/assessments', {
      query: PaginationQuery,
      success: PaginationResult(Assessment),
      error: [DomainError],
    }),
  )
  .add(
    HttpApiEndpoint.get('fetch', '/assessments/:id', {
      params: Schema.Struct({ id: AssessmentId }),
      success: Assessment,
      error: [DomainError],
    }),
  )
  .add(
    HttpApiEndpoint.post('create', '/assessments', {
      payload: CreateAssessmentInput,
      success: Assessment,
      error: [DomainError],
    }),
  )
  .add(
    HttpApiEndpoint.patch('patch', '/assessments/:id', {
      params: Schema.Struct({ id: AssessmentId }),
      payload: PatchAssessmentInput,
      success: Assessment,
      error: [DomainError],
    }),
  )
  .add(
    HttpApiEndpoint.delete('del', '/assessments/:id', {
      params: Schema.Struct({ id: AssessmentId }),
      error: [DomainError],
    }),
  )
