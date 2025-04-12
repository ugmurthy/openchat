import Prompt from "~/components/Prompt";
import { Route } from "./+types/chat";
import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'
import ChatComponent from "~/components/ChatComponent";
import MarkDownRenderer from '~/components/MarkDownIt';
import Tablist from "~/components/Tablist";

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
  const task = "story"
  const model = "google/gemini-flash-1.5-8b-exp"

  /// check for attachments
  const attachments = formData.getAll("attachments");
  if (attachments.length > 0) {
    console.log("number of attachments", attachments.length);
    for (const file of attachments) {
       // check if file is a file
       let i = 0;
      if (file instanceof File && file.size > 0) {
        i=i+1;
        //const fileContents = await readFileAsDataURL(file);
        console.log(`${i} :`, file.type, file.size,file.name);
      }
    }
  } else {
    console.log("no attachments");
  }
  return {model:model,task:task,prompt:prompt, userId:userId};
}




export default function Component({loaderData,actionData,params,matches}: Route.ComponentProps) {
  const data = actionData;
  const task = data?.task || "";
  const model = data?.model || "";
  const prompt = data?.prompt || "";
  const userId = data?.userId || "";
  
  // set this to true to see all the data passed to this component
  const debug = true;;
  const tabs = [
              {name:"prompt",content: <>{prompt && <div className="p-2 rounded-lg justify-end text-gray-500 bg-gray-50 max-w-4xl">
                <MarkDownRenderer markdown={prompt} 
                                          className={"max-w-5xl"} // Additional Tailwind classes
                                          fontSize="text-sm"
                                          fontFamily="font-sans"
                                          textColor={"text-gray-500"}/>
      
                </div>}</>},
              {name:"loaderData",
              content: <pre className="text-xs font-thin text-red-500">Loader Data: {loaderData?JSON.stringify(loaderData,null,2):"None"}</pre>},
  
              {name:"actionData",
              content: <pre className="text-xs font-thin text-blue-500">Action Data: {actionData?JSON.stringify(actionData,null,2):"None"}</pre>},
              {name:"params",
              content: <pre className="text-xs font-thin text-red-500">Route Parameters: {JSON.stringify(params,null,2)}</pre>},
              {name:"matches",
              content: <pre className="text-xs font-thin text-green-500">Matched Routes: {JSON.stringify(matches,null,2)}</pre>},]
  
  return (
    <div className="m-4 rounded-lg p-10 bg-blue-50 ">
        {prompt && <div className="p-2 rounded-lg justify-end text-gray-500 bg-gray-50 max-w-4xl">
          <MarkDownRenderer markdown={prompt} 
                                    className={"max-w-5xl"} // Additional Tailwind classes
                                    fontSize="text-sm"
                                    fontFamily="font-sans"
                                    textColor={"text-gray-500"}/>

          </div>}
        {prompt&&<ChatComponent prompt={prompt} model={model} task={task} showStats={true}></ChatComponent>}
        <Tablist tabs={tabs}/>
       <div className="relative h-screen ">
          <div className="px-2 fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full">
          <Prompt url="/chat"></Prompt>
          </div>
      </div>
   
    
  </div>  );
}
