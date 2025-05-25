import {useState, useEffect, useRef} from 'react';
import _ from 'lodash';
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

// set this url to the url that provides the stream
const BASE_URL='/api/v1/chat';

//var _useOpenRouter_toBeRun = 1;


export const useOpenRouter = (messages:any,prompt:string, model:string,task:string="",url=BASE_URL, debug=false) => {
    // array of json strings : for ndjson
    const [data,setData]=useState([])
    const [error,setError]=useState(null);
    const [done,setDone]=useState(false);
    const abortControllerRef = useRef(null);
    //const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const [contentType, setContentType] = useState("");


    function parseNDjson(dataArray:string[]) {
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


function getNDjsonContent(jsonArray:[]) {
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

function getStreamContent(jsonArray:[]) {
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



    useEffect(() => {
      
        /* if (!_useOpenRouter_toBeRun) {
            return ()=>{ console.log("useOpenRouter: exiting early");}
        }
        _useOpenRouter_toBeRun=false; */

        //console.log("useOpenRouter: useEffect", _useOpenRouter_toBeRun);
        //_useOpenRouter_toBeRun+=1;

        // Create abort controller for fetch
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;
        
        // Custom stream handling using fetch instead of EventSource
        const fetchStream = async () => {
          try {
            setIsConnected(true);
            //const url = BASE_URL
            
            debug && console.log("fetchStream url",url);
            //const body = JSON.stringify({ prompt, model, task });
            const body = JSON.stringify({
              "model": model,
              "messages": messages,
              "temperature": 0.3,
              "max_tokens": 2048,
              "stream":true,
          })
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Accept': 'text/event-stream, application/x-ndjson, application/json',
              },
              body,
              signal,
            });
            console.log("useOpenRouter: fetchStream response",response);
            if (!response.ok) {
              setError(`HTTP error! Status: ${response.status}`);
              //throw new Error(`HTTP error! Status: ${response.status}`);
            }
           
            let ctype=response.headers.get('Content-Type');
            console.log("useOpenRouter: fetchStream response,ok content-type ",response.headers.get('Content-Type'));
            // FUTURE TODO: check for content-type and enable parser 
            setContentType(ctype);

            // Get the reader from the response body stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            // Process the stream
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log('Stream finished');
                setDone(true);
                setIsConnected(false);
                //setIsLoading(false);
                break;
              }
    
              // Decode the value(chunk) and add it to our buffer
              buffer += decoder.decode(value, { stream: true });
              // Process any complete JSON objects in the buffer
              let lines = buffer.split('\n');
              // Keep the last line in the buffer if it's incomplete
              buffer = lines.pop() || '';
              // Process complete lines
              debug && console.log("lines",lines);
              setData(prevLines =>  [...prevLines, ...lines]); // store all lines as array of strings

            }
          } catch (err) {
            if (err?.name === 'AbortError') {
              //setError('Chat aborted');
              console.log('Fetch aborted', err);
              
            } else {
              console.error('Stream error:', err);
              setError(`Connection error: ${err?.message}`);
              setIsConnected(false);
              // Try to reconnect after a delay
              //console.log('Reconnecting in 3 seconds...');
              //setTimeout(fetchStream, 10000);
            }
          }
        };
    
        
          fetchStream();
        
        // Clean up the connection when component unmounts
        return () => {
          console.log("useOpenRouter: cleanup on unmount");
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          setIsConnected(false);
        };
      }, [prompt, model, task, BASE_URL]);
      //console.log("useOpenRouter compact messages",_.compact(messages));
      const compactData = _.compact(data);
      
      function abort () {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setIsConnected(false);
          //setIsLoading(false);
        }
      }
      
      let content = null
      let usage=null
      let chaterror=null;
      if (contentType === 'application/x-ndjson') {
        [content, usage] = getNDjsonContent(parseNDjson(compactData));
        debug&&console.log("useOpenRouter: NDJSON content \n------\n",content,'\n------\n',usage,'\n------\n');
        
      }
      if (contentType === 'text/event-stream') {
        [content, chaterror] = getStreamContent(parseStreamData(compactData));
        let lastString = done && compactData[compactData.length-2].substring(6);
        usage = done && JSON.parse(lastString)
        debug&&console.log("useOpenRouter: text/event-stream content \n------\n",content,'\n------\n',usage,'\n------\n');
       
      }
      //console.log("useOpenRouter: \n------\n",content,'\n------\n',usage,'\n------\n');
      let isLoading = compactData.length === 0 && !done;
      return [content,chaterror,isLoading,usage,abort]
      //return [compactData,error, isLoading, isConnected,abort]
}            

export default useOpenRouter;