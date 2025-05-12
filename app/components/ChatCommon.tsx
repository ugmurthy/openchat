/*
//////////////////////////////////////////////////////////////////////
- this component is derived from GenerateNew.tsx of Rungie project 
//////////////////////////////////////////////////////////////////////
Sample component on how to use the useOpenRouter hook
- given a prompt and model it will respond with
- the content of the response
- the usage of the response
- the id of response to get more info on inference - such as tokens, latency, model name

*/
import { useEffect } from 'react';
import  useOpenRouter  from "~/hooks/useOpenRouter"; 
import MarkDownRenderer from '~/components/MarkDownIt';
import CommandCopy from "~/components/CommandCopy"
import DownLoadmd from "~/components/DownLoadmd";
import Memory from "~/components/Memory"
import {extractFilename} from "~/helpers/webUtilsServer"
import {Message} from "~/db/openRouterTypes"
import { get } from 'http';

/*
sample error object: this is returned when the rate limit is exceeded : return value of function parseStreamData.
{"error":{"message":"Rate limit exceeded: limit_rpd/google/gemini-2.0-flash-thinking-exp-01-21/54276bca-abd7-4aa6-a6b5-1b8f898f1395","code":429,"metadata":{"headers":{"X-RateLimit-Limit":"80","X-RateLimit-Remaining":"0","X-RateLimit-Reset":"1743638400000"},"provider_name":"Google AI Studio"}},"user_id":"user_2mBdBPxBH7eLf6NvkErkltzOCzu"}
*/

function parseStreamData(dataArray:string[]) {
    return dataArray
        .map(d => {
            // Remove 'data: ' prefix and parse the JSON
            //console.log("ChatComponent:f(parseStreamData): d: ",d)
            //const jsonString = d.substring(6);
            try {
                //if (jsonString === '[DONE]') {
                //    return null; // Handle end of stream
                //}
                // Parse the JSON string
                return JSON.parse(d);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return null;
            }
        })
        .filter(item => item !== null); // Remove any failed parses
}

function getContent(jsonArray:[]) {
    // convert json array to content, error if present
    if (jsonArray.length===0) return ["",null];
    let chatError=null
    let content=""
    let usage=null;
    for (const item of jsonArray) {
        switch (item.done) {
            case false:
                content += item.message.content;
                break;
            case true:
                usage = item
                break;
            default:
                console.log("ChatComponent:f(getContent): default: ",item)
                break;
        }
        
    }
    
    return [content,usage] 
}

let toBeRun = true;

export default function ChatOllama({prompt,model,task,update,cls="max-w-5xl mx-auto",textColor="text-green-900",showStats=false}) {
    

    const url = "/api/v1/ollama"
    
    const [responseData,openRouterError,isLoading,isConnected,abort] = useOpenRouter(
        prompt,
        model,
        task,
        url,
        true
    ) 

    //console.log("ChatComponent: responseData: ",prompt,model,task);
    // CTRL-C to abort streaming
    useEffect(() => {
        const handleKeyDown = (event:any) => {
            // Check if Ctrl key is pressed AND 'c' key is pressed
            if (event.ctrlKey && event.key === 'c') {
              // Prevent default copy behavior 
              event.preventDefault();
              
              // Trigger abort
              abort()
              console.log('Operation aborted via Ctrl+C');
            }
          };
      
          // Add event listener
          window.addEventListener('keydown', handleKeyDown);
      
          // Cleanup: remove event listener and abort on unmount
          return () => {
            abort();
            window.removeEventListener('keydown', handleKeyDown);
            
          };
    },[]) // empty array to run only once on mount

    if (openRouterError) return <pre>Error: {JSON.stringify(openRouterError,null,2)}</pre>
    
    if (responseData.length===0) return <div>Loading...</div>
    
    ////
    const responseJSON = parseStreamData(responseData )
    const [content,usage]=getContent(responseJSON)

    
    //const usageAvaialble = responseJSON.length && Object.keys(responseJSON[responseJSON.length-1]).includes("usage")
    const usageAvaialble=false;

    //const [content, chatError] = getContent(responseJSON)
    //console.log("ChatComponent: content: ",content)
    
    //const message:Message = [{role:'user',content:prompt},{role:'assistant',content:content}]
    
    //const usage = responseJSON[responseJSON.length-1]
    
    /* if (usage) {
        usage.id = responseJSON[responseJSON.length-1]?.id;
        update([message,chatError])
        console.log("Write this to memory : ",message)
    } */
   /*  useEffect(()=>{
        if (usageAvaialble && toBeRun) {
            //console.log("updating parent component : ",message)
            update([message,responseJSON[responseJSON.length-1],responseJSON,chatError])
            toBeRun=false;
        }
    },[usageAvaialble]) */

    return (
        <div>
           <MarkDownRenderer markdown={content} 
                                    className={cls} // Additional Tailwind classes
                                    fontSize="text-sm"
                                    fontFamily="font-sans"
                                    textColor={textColor}/>

         <div className='flex flex-row justify-center items-center space-x-2'>
                  {usage&&<CommandCopy txt={content} btnTxt="Copy"></CommandCopy>}
                  {usage&&<DownLoadmd txt={content} filename={extractFilename(prompt)+'.md'}></DownLoadmd>}
                  {/*usage&&(typeof window !== 'undefined')&&<Memory message={message}></Memory>*/}
        </div>
        <div className='flex flex-row justify-center items-center space-x-2'>
        {usage&&<pre className='text-xs font-thin'>{JSON.stringify(usage,null,2)}</pre>}
        </div>
        </div>
        )

} 