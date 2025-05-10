import Prompt from "~/components/Prompt";
import { Route } from "./+types/chat";
import { redirect } from 'react-router'
import { getModel } from "~/core/tasks";
import { getAuth } from '@clerk/react-router/ssr.server'
import { useEffect, useState, useRef } from "react";
import indexedDBService from "~/db/indexedDBService3.client";
import useIndexedDB from "~/hooks/useIndexedDB5";
import ChatComponent from "~/components/ChatOpenRouter";
import ChatOllama from "~/components/ChatOllama";
import MarkDownRenderer from '~/components/MarkDownIt';
import Tablist from "~/components/Tablist";
import CustomDBExample from "~/components/CustomDBExamplex";
import { Message } from "~/db/openRouterTypes";
import { NotebookPen } from "lucide-react";
import { is } from "node_modules/cheerio/dist/esm/api/traversing";
export const handle = {
  ssr: false, // Disable SSR for this route
};
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
  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }

  console.log(`${args.request.method}:${args.request.url}`);
  const formData = await args.request.formData();
  const datajson = Object.fromEntries(formData.entries());
  const prompt = datajson.inputText;
  console.log("formData: ",datajson);

  // There could be multiple tasks, so we need to check for the first one
  const task = datajson['task[0]']!==undefined?datajson['task[0]']:"";
  //const model = "google/gemini-flash-1.5-8b-exp"
  //const model = "google/gemini-2.5-pro-exp-03-25:free"
  const {model,local} = getModel(task);
  //const model = "google/gemini-2.0-flash-thinking-exp-1219:free"

  //const model = "llama3.2"
  /// check for attachments
  const attachments = formData.getAll("attachments");

  // ensure that the first attachment is a file and has a name
  if (attachments.length > 0 && attachments[0] instanceof File && attachments[0].name!=='' ) {
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

  console.log(`${args.request.method}:${args.request.url} : `,{model:model,task:task,local:local,prompt:prompt, userId:userId})
  return {model:model,task:task,local:local,prompt:prompt, userId:userId};
}


// Define custom entity types
const CHAT_ENTITY_TYPES = {
  CHAT: 'chat',
};
// Define custom indexes
const CHAT_INDEXES = {
  'chat': [
    { name: 'createdAt', keyPath: 'createdAt', unique: false },
    { name: 'title', keyPath: 'title', unique: false },
    { name: 'id', keyPath: 'id', unique: true }
]  
};
type Title = 'memory' | 'conversations' | 'settings';
type GenericJsonObject = Record<string, any>;
let didNotRun=true;

export default function Component({loaderData,actionData,params,matches}: Route.ComponentProps) {
  const data = actionData;
  const task = data?.task || "";
  const local = data?.local || false;
  const model = data?.model || "";
  const prompt = data?.prompt || "";
  const userId = data?.userId || "";
  //console.log("Component:actionData",data);
  // updated by chatComponent
  const [messageAndError,setMessageAndError]=useState([[],null,[],null]); // message,usage,responseJSON an array of all response lines, chatError
  const noMessage = messageAndError[0]?.length===0?true:false;
  const [newConversaton,setNewConversation]=useState(true); // whenever component mounts 
  const divRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  //update from child component
  const updateMessageAndError = (newData)=> {
    setMessageAndError(newData);
  }
  
  // Use our custom DB service with the hook
  const {
    items,
    loading,
    error,
    save,
    findByRange,
    findRecent,
    getById,
    find,
    remove,
    update,
    clear
} = useIndexedDB(CHAT_ENTITY_TYPES.CHAT, indexedDBService);

// saves 'memory' , 'conversations' or 'settings'
const saveData = async (title:Title,data:GenericJsonObject) => {
  const record = {
    id: `${Date.now()}`,
    title: `${title}`,
    data: data,
  };
  
  await save(record);
};

const saveConversation = async(data:Message,usage:GenericJsonObject ,title='conversations') => {
  // create a conversation id if needed and save conversation
  let id = null
  if (newConversaton) {
    const record = {
      id: `${Date.now()}`,
      title: `${title}`,
      data: data,
      usage:usage,
    };
    setNewConversation(false);
    const ret_val = await save(record);
    //console.log("id :", record.id)
    //console.log("ret_val :",JSON.stringify(ret_val,null,2))
    return ret_val
  } else {
    // get existing conversation based on conversationID
    let prevData = await getById(conversationID);
    if (prevData) {
      // add the data to existing data
      const updatedData = [...prevData?.data,...data]
      // update conversation
      const ret_val = await update(conversationID,)
      return ret_val
    }
  }
}

const allItems = (items:any[],noMessage:Boolean) => {
  if (items.length<2) return <div>Less than 2 items</div>
  let pru_messages = items.map((i)=>[i.data[0].content,i.data[1].content,i.usage])  /// prompt, generated content, usage stats
  //const conversationComponent = pru_messages.map((pru)=> <div>pru[0]</div>)
  pru_messages = noMessage?pru_messages:pru_messages.slice(0,pru_messages.length-1);
  let comp = pru_messages.map((pru,key)=><><div id={key+"-0"} className="p-2 rounded-lg">
                                                <MarkDownRenderer markdown={pru[0]} 
                                          className={"max-w-5xl flex justify-end "} // Additional Tailwind classes
                                          fontSize="text-sm"
                                          fontFamily="font-sans"
                                          textColor={"text-gray-700"}/>
                                      </div>
                                    
                                      <div id={key+"-1"}>
                                      <MarkDownRenderer markdown={pru[1]} 
                                          className={"max-w-5xl mx-auto"} // Additional Tailwind classes
                                          fontSize="text-sm"
                                          fontFamily="font-sans"
                                          textColor={"text-blue-800"}/>
                                      </div>
                                       </>
                                    
                                    )      
  comp = <div>  {comp}
                {prompt &&
                  <div className="p-2 rounded-lg justify-end text-gray-500 bg-gray-50 max-w-4xl">
                          <MarkDownRenderer markdown={prompt} 
                                          className={"max-w-5xl"} // Additional Tailwind classes
                                          fontSize="text-sm"
                                          fontFamily="font-sans"
                                          textColor={"text-gray-500"}/>
                  </div>}
                  
                {prompt &&
                  <ChatComponent prompt={prompt} model={model} task={task} showStats={true} update={updateMessageAndError}></ChatComponent>}
          </div>              
  return comp
  
}
//const [message,usage,responseJSON,chatError] = messageAndError;
useEffect(()=>{
    const [message,usage,responseJSON,chatError] = messageAndError;
    if (chatError===null && didNotRun && message.length==2) {
        // add message
        const addit = async()=> {
            //await saveData('memory',message);
            await saveConversation(message,usage)
        }
        addit();
        didNotRun=false;
       
    }
 },[messageAndError[0]])

  // set this to true to see all the data passed to this component
  const debug = true;;
  const tabs = [
             {name:"Chat",content:allItems(items,noMessage)},
              {name:"messageAndError",content:<pre>{JSON.stringify(messageAndError,null,2)}</pre>},
              {name:"responseJSON",content:<pre className="text-xs font-thin text-blue-800">{JSON.stringify(messageAndError[2],null,2)}</pre>},
              {name:"items",content:<pre className="text-xs font-thin text-blue-500">{items?JSON.stringify(items,null,2):"None"} </pre>},
              {name:"loaderData",
              content: <pre className="text-xs font-thin text-red-500">Loader Data: {loaderData?JSON.stringify(loaderData,null,2):"None"}</pre>},
  
              {name:"actionData",
              content: <pre className="text-xs font-thin text-blue-500">Action Data: {actionData?JSON.stringify(actionData,null,2):"None"}</pre>},
              {name:"params",
              content: <pre className="text-xs font-thin text-red-500">Route Parameters: {JSON.stringify(params,null,2)}</pre>},
              {name:"matches",
              content: <pre className="text-xs font-thin text-green-500">Matched Routes: {JSON.stringify(matches,null,2)}</pre>},]
  
  
 useEffect(() => {
  // Check if the ref is valid and the element exists
  if (divRef.current) {
    // 3. Use the `scrollIntoView` method with `behavior: 'smooth'`
    //console.log(`scrollIntoView method with behavior: 'smooth' divRef`)
    divRef.current.scrollIntoView({
      behavior: 'smooth', // Smooth scrolling animation
      block: 'end',   // Align the top of the element to the top of the viewport
      inline: 'nearest' // Scroll the least amount possible in the inline direction
    });
    if (outerRef.current) {
        //console.log(`scrollTo method with behavior: 'smooth' - outerRef`)
        outerRef.current.scrollTo({
        top: outerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }
}, []); // Empty dependency array ensures this runs only once after the initial render



  return (
    <div ref={outerRef} className="m-4 rounded-lg p-10 bg-blue-50 ">
        {prompt && 
                  <div className="p-2 rounded-lg justify-end text-gray-500 bg-gray-50 max-w-4xl">
                          <MarkDownRenderer markdown={prompt} 
                                          className={"max-w-5xl"} // Additional Tailwind classes
                                          fontSize="text-sm"
                                          fontFamily="font-sans"
                                          textColor={"text-gray-500"}/>
                  </div>}
                  {/* Local=false Implies use OpenRouter component*/} 
                  {prompt && !local &&
                  <ChatComponent prompt={prompt} model={model} task={task} showStats={true} update={updateMessageAndError}></ChatComponent>}
                  {/*LOCAL MODEL implies use ChatOllama component*/}
                  {prompt && local &&
                  <ChatOllama prompt={prompt} model={model} task={task} showStats={true} update={updateMessageAndError}></ChatOllama>}
        
        <div ref={divRef} className="btn btn-circle"><NotebookPen /></div>
       <div className="relative h-screen ">
          <div className="px-10 fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full  max-w-7xl">
          <Prompt url="/chat"></Prompt>
          </div>
      </div>
   
    
  </div>  );
}
