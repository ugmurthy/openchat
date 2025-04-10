import Prompt from "~/components/Prompt";
import { Route } from "./+types/chat";
import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'
import ChatComponent from "~/components/ChatComponent";

export async function loader(args: Route.LoaderArgs) {
  const {userId} = await getAuth(args);
  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }
  console.log(`${args.request.method}:${args.request.url}: ${userId}`);
  console.log(`${args.request.method}:${args.request.url}`);
  return args.params;
}

export async function action(args: Route.ActionArgs) {
  // Use `getAuth()` to get the user's ID
  const { userId } = await getAuth(args);
  // Protect the route by checking if the user is signed in
  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }
  console.log(`${args.request.method}:${args.request.url}`);
  const formData = await args.request.formData();
  const datajson = Object.fromEntries(formData.entries());
  const prompt = datajson.inputText;
  console.log("\t actionData",datajson);
  const task = "summarise"
  //const model = "moonshotai/kimi-vl-a3b-thinking:free"
  const model = "google/gemini-flash-1.5-8b-exp"
  return {model:model,task:task,prompt:prompt, userId:userId};
}




export default function Component({loaderData,actionData,params,matches}: Route.ComponentProps) {
  const data = actionData;
  const task = data?.task || "";
  const model = data?.model || "";
  const prompt = data?.prompt || "";
  const userId = data?.userId || "";
  
  return (
    <div className="m-4 rounded-lg p-10 bg-slate-100">
       {prompt&&<ChatComponent prompt={prompt} model={model} task={task} showStats={true}></ChatComponent>}
       <Prompt url="/chat"></Prompt>
    <div className="text-2xl">General Component</div>
    <div className="text-lg">Exposes all ComponentProps for this route</div>
    <div className="text-sm"></div>
    <div className="text-xs text-red-500 font-thin">
    <hr></hr>
    <pre className="text-red-500">Loader Data: {loaderData?JSON.stringify(loaderData,null,2):"None"}</pre>
    <hr></hr>
<pre className="text-blue-500">Action Data: {actionData?JSON.stringify(actionData,null,2):"None"}</pre>
<hr></hr>
<pre className="text-red-500">Route Parameters: {JSON.stringify(params,null,2)}</pre>
<hr></hr>
<pre className="text-green-500">Matched Routes: {JSON.stringify(matches,null,2)}</pre>
</div>
    
  </div>  );
}
