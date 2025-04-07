import type { Route } from "./+types/models.author.model";
import { get_models,get_supported_params } from "~/api/openRouter";
import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'

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
  const {author,model} = args.params;
  const model_name = model as string;
  const author_name = author as string;
  if (!model_name || !author_name) {
    console.log("Model name or provider author name is missing")
    throw new Response("Model name or author name is missing", { status: 400 });
  }
  // get models
    const parameters = await get_supported_params(author_name+"/"+model_name);
    if (Object.keys(parameters).length === 0) {
        console.log("Cannot find model parameters ")
        throw new Response("Model parameters: Not Found", { status: 404 });
    }
    console.log("Model parameters: ", parameters);
    return {parameters};
  
  }
   
   

export default function Home({actionData,loaderData
}: Route.ComponentProps) {
    const {parameters} = loaderData;
  return <div>
    <div className="p-10 ">
      <div className="text-2xl">Model parameters</div>
      <div className="text-xl font-thin text-blue-600">
        <div>Model: {parameters.data.name}</div>
      <div className="italics">{parameters.data.description}</div>
      </div>
      <pre className="text-xs text-gray-600">{JSON.stringify(parameters,null,2)}</pre>
    </div>
    </div>;
}
