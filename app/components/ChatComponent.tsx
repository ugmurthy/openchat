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
import { useState,useRef} from 'react'
import { useOpenRouter } from "~/hooks/useOpenRouter"; 
import MarkDownRenderer from '~/components/MarkDownIt';

/*
sample error object: this is returned when the rate limit is exceeded : return value of function parseStreamData.
{"error":{"message":"Rate limit exceeded: limit_rpd/google/gemini-2.0-flash-thinking-exp-01-21/54276bca-abd7-4aa6-a6b5-1b8f898f1395","code":429,"metadata":{"headers":{"X-RateLimit-Limit":"80","X-RateLimit-Remaining":"0","X-RateLimit-Reset":"1743638400000"},"provider_name":"Google AI Studio"}},"user_id":"user_2mBdBPxBH7eLf6NvkErkltzOCzu"}
*/


function parseStreamData(messages) {
    return messages
        .filter(message => message.startsWith('data: '))
        .map(message => {
            // Remove 'data: ' prefix and parse the JSON
            const jsonString = message.substring(6);
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


export default function ChatComponent({prompt,model,task,showStats=false}) {
    
    const abortControllerRef = useRef(null);
    if (!model || !prompt) return <div></div>
    const [messages,error,isLoading,isConnected,abort] = useOpenRouter(
        prompt,
        model,
        task,
        true
    )

    if (error) return <pre>Error: {JSON.stringify(error,null,2)}</pre>
    //const idArray = Array.from(idSet);
    if (!messages) return <div>Loading...</div>
    const promptStr = prompt.length>100?prompt.slice(0,100)+'...':prompt;
    
    const mjson = parseStreamData(messages )
    const content = mjson.map((message) => message.choices[0]?.delta.content).join('');
    const usage = mjson[mjson.length-1]?.usage;
    
    if (usage) {
        usage.id = mjson[mjson.length-1]?.id;
    }
    return (
        <div>
        <div className='flex flex-row justify-left space-x-4'> 
        <button className='btn btn-circle btn-error' onClick={abort}>x</button>
        <div>{isLoading?"Loading....":""}</div>
        <div>{isConnected?"Connected":"Disconnected"}</div>
        <div className='text-red-500 text-xs font-thin font-mono'>{error&&JSON.stringify(error)}</div>
        </div>
        <div className="p-4 text-sm font-thin">
            {/*mjson.map((message, index) => (<div>{JSON.stringify(message)}</div>))*/}
            <MarkDownRenderer markdown={content} 
                                    className="max-w-2xl mx-auto" // Additional Tailwind classes
                                    fontSize="text-lg"
                                    fontFamily="font-serif"
                                    textColor="text-blue-900"/>
        
        </div>
        <div className='p-4 text-xs font-mono font-thin'>
            {showStats&&JSON.stringify(usage)}
        </div>
        </div>
        )

} 