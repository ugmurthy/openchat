import type { Route } from "./+types/models";
import { get_models,get_supported_params } from "~/api/openRouter";
import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'
import { Link } from "react-router";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "OpenRouter models" },
    { name: "description", content: "OpenRouter models" },
  ];
}


export async function loader(args: Route.LoaderArgs) {
  // Use `getAuth()` to get the user's ID
  const { userId } = await getAuth(args)
  // Protect the route by checking if the user is signed in
  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }
  console.log(`${args.request.method}:${args.request.url}`);
  // get models
    const models = await get_models();
    if (Object.keys(models).length === 0) {
        console.log("Cannot find models ")
        throw new Response("Models: Not Found", { status: 404 });
    }
    //console.log("Models: ", models);
    return {models};
  
  }
   
   

export default function Home({actionData,loaderData
}: Route.ComponentProps) {
    const {models} = loaderData;

    const m_div = models.map((m)=> 
                      <div className="text-xs" key={m.id}>
                          
                          <pre>{new Date(m.created*1000).toDateString().split(" ").slice(1,4).join("-")}{" "}<Link className="text-blue-600 underline" to={"/api/v1/models/"+m.id}>{m.id}</Link>{" "}{m.context_length}{" "}{m.architecture.modality}</pre>
                      </div>)
  return <div>
    <div className="p-10 ">
      <div className="text-2xl">Models</div>
      <div className="text-lg">List of available models</div>
      <div>No. of Models = {models.length}</div>
    <div className="px-4">{m_div}</div>
      
    </div>
    </div>;
}
