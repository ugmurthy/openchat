import useSWR from 'swr';
async function fetcher(url:string) {
    if (url==="") {
      console.log("useModels no url",)
      return {}
    }
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error ("Failed to fetch model data")
      }
      return await response.json()
    } catch (e) {
      throw new Error("Failed to fetch model data")
    }
    
}
export function useModels (urlModels:string) {
    const { data, error, isLoading } = useSWR(`${urlModels}`, fetcher)
   
    return {
      models:data,
      isLoadingModel:isLoading,
      modelError:error
    }
  }
