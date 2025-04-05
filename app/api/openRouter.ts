const DEFAULT_MODEL = 'google/gemini-2.0-flash-thinking-exp:free';

function createOpenRouterClient(apiKey, options = {}) {
    const {
      apiBase = 'https://openrouter.ai/api/v1',
      siteUrl,
      siteName
    } = options;
  
    if (!apiKey) throw new Error('API key is required');
  
    const headers = {
      'Authorization': `Bearer ${apiKey}`, // Now apiKey is accessible
      'Content-Type': 'application/json',
      ...(siteUrl && { 'HTTP-Referer': siteUrl }),
      ...(siteName && { 'X-Title': siteName })
    }

    console.log("createOpenRouterClient: ", headers)

    // Define getResponse inside the factory function
    async function getResponse(messages, requestOptions = {}) {
      const defaultOptions = {
        model: DEFAULT_MODEL,
        temperature: 0.7,
        maxTokens: 100
      };
      const mergedOptions = { ...defaultOptions, ...requestOptions };
  
      const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          messages,
          ...mergedOptions
        })
      });
  
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        model: data.model,
        usage: data.usage
      };
    }
  
    async function streamResponse1(messages){
      console.log("streamResponse: entry" ,messages)
      return new Promise((resolve, reject) => {
        resolve({messages})
      })
    }
    // Define streamResponse inside the factory function
    async function* streamResponse(messages, requestOptions = {}) {
      console.log("streamResponse: entry" )
      const defaultOptions = {
        model: 'google/gemini-2.0-flash-thinking-exp:free',
        temperature: 0.7,
        maxTokens: 100
      };
      const mergedOptions = { ...defaultOptions, ...requestOptions };
      console.log("streamResponse: ", defaultOptions.model)
      const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`, // Now apiKey is accessible
          'Content-Type': 'application/json',
          ...(siteUrl && { 'HTTP-Referer': siteUrl }),
          ...(siteName && { 'X-Title': siteName })
        },
        body: JSON.stringify({
          messages,
          ...mergedOptions,
          stream: true
        })
      });
  
      if (!response.ok) throw new Error(`API error: ${response.statusText}`);
      //console.log("streamResponse: ", response)
      //return response;
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Placeholder: Adjust parsing based on actual stream format
        yield chunk;
      }
    }
  
    // Return the client object with the methods
    return {
      getResponse,
      streamResponse
    };
  }
  export default createOpenRouterClient;
  