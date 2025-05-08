// RESOURCE ROUTE: to get list of models

import type { Route } from "./+types/openroutermodels";
import { get_models, } from "~/api/openRouter";
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
  console.log(`${args.request.method}:${args.request.url}`);
  // get models
    const models = await get_models();
    if (Object.keys(models).length === 0) {
        console.log("Cannot find models ")
        throw new Response("Models: Not Found", { status: 404 });
    }
    //console.log("Models: ", models);
    return models;
  
  }
   
   