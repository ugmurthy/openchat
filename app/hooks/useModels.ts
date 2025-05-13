import useSWR from 'swr';
async function fetcher(url:string) {
    if (!url) {
      return {}
    }
    const response = await fetch(url)
    if (!response.ok) {
    throw new Error('Failed to fetch data')
    }
    return await response.json()
}
export function useModels (urlModels:string) {
    const { data, error, isLoading } = useSWR(`${urlModels}`, fetcher)
   
    return {
      models:data,
      isLoadingModel:isLoading,
      modelError:error
    }
  }
