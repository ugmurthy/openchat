import type { Route } from "./+types/chat";
import { chat, get_models,get_supported_params } from "~/core/openRouter";
import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'


export function meta({}: Route.MetaArgs) {
  return [
    { title: "OpenRouter chat" },
    { name: "description", content: "OpenRouter chat" },
  ];
}

//export async function loader(args: Route.LoaderArgs) {
export async function action(args: Route.ActionArgs) {
  // Use `getAuth()` to get the user's ID
  const { userId } = await getAuth(args);
  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }
  console.log(`${args.request.method}:${args.request.url}`);  
  const body = await args.request.json();  
  const response = await chat(body,true);  
  return response;
}
 