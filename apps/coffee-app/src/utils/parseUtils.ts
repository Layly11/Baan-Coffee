interface IAutoFetchData {
  query: object
  fetchData: () => Promise<void>
  didFetch?: () => void
}

export const checkRouterQueryAndAutoFetchData = async ({query, fetchData, didFetch}: IAutoFetchData): Promise<void> => {
 const searchParams: Array<Record<string, string | number>> = []
 Object.keys(query).forEach((key) => {
    const _key = key as keyof typeof query
    searchParams.push({ [key]: query[_key]})
 })

 if(searchParams.length !== 0) {
     await fetchData()
     if (didFetch !== undefined) didFetch()
 }
}

export const parseToArrayAndRemoveSelectAllValue = (val: any): string[] | undefined => {
  if (val === undefined) return undefined

  if (Array.isArray(val)) {
    return val?.filter((i) => i !== '*')
  }
  return [val]
}

export const checkNullUndefiendEmptyString = (val: any): any | undefined => {
  if (val !== undefined && val !== null && val !== '') return val
  return undefined
}