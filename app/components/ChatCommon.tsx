/*
//////////////////////////////////////////////////////////////////////
This component renders LLM generated content using the useOpenRouter hook.
The openRouter hook is general enough to be used with any LLM that
supports the openRouter API. and Ollama API.
//////////////////////////////////////////////////////////////////////

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


let toBeRun = true;

export default function ChatComponent({local,messages,prompt,model,task,update,cls="max-w-5xl mx-auto",textColor="text-blue-900",showStats=false}) {
    

    const url = local? "http://localhost:11434/api/chat":"/api/v1/chat"
    const textColorClass = local ? "text-green-900" : textColor;
    console.log("ChatCommon->: url: ",url)
    const [content,error,isLoading,usage,abort] = useOpenRouter(
        messages,
        prompt,
        model,
        task,
        url,
        true
       // default url=BASE_URL
       // defaule debug=false
    )
    console.log("ChatCommon->: content: ",content)
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

   const message:Message = [{role:'user',content:prompt},{role:'assistant',content:content}]
    
    useEffect(()=>{
        if (usage && toBeRun) {
            //console.log("updating parent component : ",message)
            update([message,usage,error])
            toBeRun=false;
        }
    },[usage])

    return (
        <div>
           {isLoading &&
            <div className='text-center text-sm font-mono font-thin'>
                <span className='loading loading-spinner text-gray-500 loading-xl py-20'></span>
            </div>}
            
            <div className="p-4 text-sm ">
                <MarkDownRenderer markdown={content??""} 
                                    className={cls} // Additional Tailwind classes
                                    fontSize="text-sm"
                                    fontFamily="font-sans"
                                    textColor={textColorClass}/>        
            </div>

            <div className='flex flex-row justify-center items-center space-x-2'>
                    {usage&&<CommandCopy txt={content} btnTxt="Copy"></CommandCopy>}
                    {usage&&<DownLoadmd txt={content} filename={extractFilename(prompt)+'.md'}></DownLoadmd>}
                    {/*usage&&(typeof window !== 'undefined')&&<Memory message={message}></Memory>*/}
            </div>

            {usage&&<div className='p-4 text-xs font-mono font-thin text-center'>{JSON.stringify(usage)}</div>}
            {error&& <div className='text-red-500 text-xs font-thin font-mono text-center'>{JSON.stringify(error)}</div>}
        
        </div>
        )

} 