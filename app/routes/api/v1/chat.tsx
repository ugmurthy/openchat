import type { Route } from "./+types/chat";
import { chat, get_models,get_supported_params } from "~/api/openRouter";
import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'
import { Link } from "react-router";
import {getTask} from "~/api/tasks";

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
  // Protect the route by checking if the user is signed in
  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  //let {prompt,model, task,temperature, max_tokens} =  args.params;
    let {prompt,model, task,temperature, max_tokens} = await args.request.json();
    let features = {temperature,max_tokens}
    console.log("/chat_action formData: task : ", task);
    console.log("/chat_action formData: model: ", model);
    console.log("/chat_action formData: prompt: ", prompt);
    console.log("/chat_action formData: features: ", features);
    features = {model,...features}


    const task_record = await getTask(task);
    const system = task_record?.system ? task_record.system : "you are a helpful assistant";
    
    const messages = [
        {role: "system", content: system},
        {role: "user", content: prompt}
    ]
    features = {model,...features};

    const response = await chat(features,messages);
    return response;
    
   }
      /* 

export default function Componet({actionData,loaderData
}: Route.ComponentProps) {
    const data = actionData;
    console.log("actionData",actionData);
   
  return <div>
    <div className="flex flex-col items-center space-y-2">
        <div className="text-2xl">Chat</div>
        <div className="text-lg">Chat with OpenRouter models</div>
        <pre className=" text-green-600 text-sm font-thin">{JSON.stringify(data,null,2)}</pre>
    </div>
    <div className="px-4">
        <form method="POST">
            <div className="flex flex-col items-center space-y-2">
                <input className="pl-2 border border-1" placeholder="Model" type="text" name="model"/>
                <input className="pl-2 border border-1" placeholder="Temperature" type="number" name="temperature"/>
                <input className="pl-2 border border-1" placeholder="Max Tokens" type="number" name="max_tokens"/>
                <textarea className="pl-2 border border-1" placeholder="Message" name="messages"></textarea>
                <button className="px-2 border border-1 border-blue-600">Submit</button>
            </div>
        </form>
    </div>
    </div>
}
 */