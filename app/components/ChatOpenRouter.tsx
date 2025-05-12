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
/*
sample error object: this is returned when the rate limit is exceeded : return value of function parseStreamData.
{"error":{"message":"Rate limit exceeded: limit_rpd/google/gemini-2.0-flash-thinking-exp-01-21/54276bca-abd7-4aa6-a6b5-1b8f898f1395","code":429,"metadata":{"headers":{"X-RateLimit-Limit":"80","X-RateLimit-Remaining":"0","X-RateLimit-Reset":"1743638400000"},"provider_name":"Google AI Studio"}},"user_id":"user_2mBdBPxBH7eLf6NvkErkltzOCzu"}
*/

function parseStreamData(dataArray:string[]) {
    return dataArray
        .filter(d => d.startsWith('data: '))
        .map(d => {
            // Remove 'data: ' prefix and parse the JSON
            //console.log("ChatComponent:f(parseStreamData): d: ",d)
            const jsonString = d.substring(6);
            try {
                if (jsonString === '[DONE]') {
                    return null; // Handle end of stream
                }
                // Parse the JSON string
                return JSON.parse(jsonString);
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
    
    for (const item of jsonArray) {
        if (Object.keys(item).includes("error")) {
            chatError=item
        } else {
           content=content + item.choices[0]?.delta.content
        }
    }
    
    return [content,chatError] 
}

let toBeRun = true;

export default function ChatComponent({local,messages,prompt,model,task,update,cls="max-w-5xl mx-auto",textColor="text-blue-900",showStats=false}) {
    

    const url = "/api/v1/chat"
    const [responseData,openRouterError,isLoading,isConnected,abort] = useOpenRouter(
        messages,
        prompt,
        model,
        task,
        url,
        true
       // default url=BASE_URL
       // defaule debug=false
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
    //const idArray = Array.from(idSet);
    if (!responseData) return <div>Loading...</div>
    //const promptStr = prompt.length>100?prompt.slice(0,100)+'...':prompt;
    
    const responseJSON = parseStreamData(responseData )
    const usageAvaialble = responseJSON.length && Object.keys(responseJSON[responseJSON.length-1]).includes("usage")


    const [content, chatError] = getContent(responseJSON)
    //console.log("ChatComponent: content: ",content)
    //const content = responseJSON.map((r) => r.choices[0]?.delta.content).join('');
    const message:Message = [{role:'user',content:prompt},{role:'assistant',content:content}]
    
    const usage = responseJSON[responseJSON.length-1]
    
    /* if (usage) {
        usage.id = responseJSON[responseJSON.length-1]?.id;
        update([message,chatError])
        console.log("Write this to memory : ",message)
    } */
    useEffect(()=>{
        if (usageAvaialble && toBeRun) {
            //console.log("updating parent component : ",message)
            update([message,responseJSON[responseJSON.length-1],responseJSON,chatError])
            toBeRun=false;
        }
    },[usageAvaialble])

    return (
        <div>
           
           <div className="p-4 text-sm ">
            {/*responseJSON.map((message, index) => (<div>{JSON.stringify(message)}</div>))*/}
            <MarkDownRenderer markdown={content} 
                                    className={cls} // Additional Tailwind classes
                                    fontSize="text-sm"
                                    fontFamily="font-sans"
                                    textColor={textColor}/>
        
           </div>
           <div className='flex flex-row justify-center items-center space-x-2'>
          {usage&&<CommandCopy txt={content} btnTxt="Copy"></CommandCopy>}
          {usage&&<DownLoadmd txt={content} filename={extractFilename(prompt)+'.md'}></DownLoadmd>}
          {/*usage&&(typeof window !== 'undefined')&&<Memory message={message}></Memory>*/}
          </div>

        <div className='p-4 text-xs font-mono font-thin text-center'>
            {showStats&&JSON.stringify(usage)}
        </div>
        <div className='text-red-500 text-xs font-thin font-mono text-center'>{openRouterError&&JSON.stringify(openRouterError)}</div>
        <div className='text-red-500 text-xs font-thin font-mono text-center'>{chatError&&chatError?.error?.message}</div>
        
        </div>
        )

} 