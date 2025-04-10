import {useState, useEffect, useRef} from 'react';
import _ from 'lodash';

// set this url to the url that provides the stream
const BASE_URL='/api/v1/chat';

export const useOpenRouter = (prompt:string, model:string,task:string="", debug=false) => {
    const [messages, setMessages] = useState([]);
    const [error,setError]=useState(null);
    
    const abortControllerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    
    
    useEffect(() => {
        // Create abort controller for fetch
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;
        
        // Custom stream handling using fetch instead of EventSource
        const fetchStream = async () => {
          try {
            setIsConnected(true);
            const url = BASE_URL
            
            debug && console.log("fetchStream url",url);
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Accept': 'text/event-stream, application/x-ndjson, application/json',
              },
              body: JSON.stringify({ prompt, model, task }),
              signal,
            });
    
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // Get the reader from the response body stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            // Process the stream
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
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
              setMessages(prevMessages =>  [...prevMessages, ...lines]);
            }
          } catch (err) {
            if (err?.name === 'AbortError') {
              console.log('Fetch aborted');
            } else {
              console.error('Stream error:', err);
              setError(`Connection error: ${err?.message}`);
              setIsConnected(false);
              // Try to reconnect after a delay
              console.log('Reconnecting in 3 seconds...');
              setTimeout(fetchStream, 3000);
            }
          }
        };
    
        fetchStream();
    
        // Clean up the connection when component unmounts
        return () => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          setIsConnected(false);
        };
      }, [prompt, model, task, BASE_URL]);
      console.log("useOpenRouter compact messages",_.compact(messages));
      const compactMessages = _.compact(messages);
      
      function abort () {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setIsConnected(false);
          setIsLoading(false);
        }
      }
      // Cleanup function to abort the fetch when the component unmounts
      return [compactMessages,error, isLoading, isConnected,abort]
}            

