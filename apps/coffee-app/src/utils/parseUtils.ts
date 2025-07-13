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