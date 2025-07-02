
export type query_type = {
  include?: Array<object>
  where?: any
  limit?: number
  offset?: number
  order?: Array<[string, string] | [string, string, string]>
}