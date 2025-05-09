/// RESOURCE ROUTE: to get list of models

import type { Route } from "./+types/localmodels";
// import { redirect } from 'react-router'
// import { getAuth } from '@clerk/react-router/ssr.server'
// import { Link } from "react-router";
import { get_model_names } from "~/core/ollama.client";

/* export async function loader(args: Route.LoaderArgs) {
  // Use `getAuth()` to get the user's ID
  const { userId } = await getAuth(args)
  // Protect the route by checking if the user is signed in
  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }
  console.log(`${args.request.method}:${args.request.url}`);
  // get model names
    const models = await get_model_names();
    return models;
  
  } */


  export async function clientLoader({
    params,
  }: Route.ClientLoaderArgs) {
    /* const models = await fetch("http://localhost:11434/api/tags");
    if (!models.ok) {
      throw new Error("Failed to fetch models");
    }
    const data = await models.json();
    return data.models.map((model: { name: string }) => model.name); */
    console.log("clientLoader");
    return get_model_names();
  }
  
  // REMIX will render this during SSR instead of the component and will render
  // the route component once clientLoader completes
  export function HydrateFallback() {
    return <p className="p-20 text-center text-2xl text-blue-600 font-bold">Fetching.... </p>;
  }

  export default function models({
    loaderData,
  }: Route.ComponentProps) {
    const users = loaderData;
    return (
      <div className="m-4 rounded-lg p-10 bg-slate-100">
              <pre className=" text-blue-600 text-sm font-thin">{JSON.stringify(loaderData,null,2)}</pre>
          </div>
    );
  }