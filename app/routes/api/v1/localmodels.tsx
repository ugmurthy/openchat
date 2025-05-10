/// RESOURCE ROUTE: to get list of models

import type { Route } from "./+types/localmodels";
// import { redirect } from 'react-router'
// import { getAuth } from '@clerk/react-router/ssr.server'
// import { Link } from "react-router";
import { get_model_names, chat } from "~/core/ollama.client";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';

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

    export function headers(_: Route.HeadersArgs) {
      return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
    }

    

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

  /* export default function models({
    loaderData,
  }: Route.ComponentProps) {
    const users = loaderData;

  }  //
  */

export default function ClientSideRoute({loaderData}: Route.ComponentProps) {
  const location = useLocation();
  const [models, setModels] = useState<string[]>([]);
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  useEffect(() => {
    async function fetchData() {
      try {
        // const response = await fetch('http://localhost:11434/api/tags');
        // if (!response.ok) throw new Error('Network response was not ok');
        // const data = await response.json();
        // const models = data.models.map((model: { name: string }) => model.name);
        const models = await get_model_names();
        setModels(models);
        console.log(models);
        const messages = [{role:"system",content:"you are a helpful assistant"},{role: "user", content: "Hello, how can u help me?"}]
        const chat_response = await chat("llama3.2",messages,false);
        setChatResponse(chat_response);

      } catch (error) {
        console.error('Fetch error:', error);
      }
    }

    // Only run on specific routes
    if (location.pathname === '/api/v1/localmodels') {
      fetchData();
    }
  }, [location.pathname]);

    //

    return (
      <div className="m-4 rounded-lg p-10 bg-slate-100">
          <h1 className="text-2xl font-bold text-blue-600">Models</h1>
          <pre className=" text-green-600 text-sm font-thin">{JSON.stringify(loaderData,null,2)}</pre>

              <pre className=" text-blue-600 text-sm font-thin">{JSON.stringify(models,null,2)}</pre>
              <pre className=" text-green-600 text-sm font-thin">{chatResponse?.message.content}</pre>
          </div>
    );
}