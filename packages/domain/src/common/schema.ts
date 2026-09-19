import { Schema } from 'effect'

export const LanguageRuntime = Schema.Literals(['typescript', 'python'])
export type LanguageRuntime = typeof LanguageRuntime.Type

export const FileMap = Schema.Record(Schema.String, Schema.String)
export type FileMap = typeof FileMap.Type
