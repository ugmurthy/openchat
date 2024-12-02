// provides type safety/inference
import type { Route } from "./+types/samplesplat";


type params = {
    id:string,
}
export async function loader({params}:Route.LoaderArgs) {
    return { message: "list of params "+JSON.stringify(params,null,0 )};
  }
  
  export default function MyRoute({ loaderData }: Route.ComponentProps) {
    
    return (
        <div className="m-4 rounded-lg text-center p-10 bg-slate-200">
            <pre className=" text-blue-600 text-xl font-thin">{(loaderData.message)}</pre>
            <div>Route: /samplesplat/*</div>
        </div>
    )

  }