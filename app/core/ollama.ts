

const BASEURL = 'http://localhost:11434/api/'

// for non streaming requests
/**
 * Sends a POST request with JSON body and headers to the specified URL.
 * for non streaming requests only
 * 
 * @param {string} url - The base URL for the request, combined with BASEURL.
 * @param {string} body - The JSON body STRINGIFIED to be sent in the request.
 * @param {Object} [headers={ 'Content-Type': 'application/json' }] - Optional headers for the request.
 * @throws {Error} If the response is not OK (200-299).
 * @returns {*} The parsed JSON response from the server.
 */
export async function fetchJSON(url, body, headers = { 'Content-Type': 'application/json' }) {  
  const options = {
    method: 'POST',
    headers,
    body
  };
  console.log("ollama.server->f(fetchJSON) options ",options)
  const response = await fetch(BASEURL+url, options);

  if (response.ok) {
    return response.json();
  } else {
    console.log("---------------------------")
    console.log(response)
    console.log("---------------------------")
    throw new Error('Failed to load data');
  }
}

/**
 * Initiates a chat request to the server.
 *
 * @param {object} model - The model associated with the chat.
 * @param {array} messages - An array of messages sent in the chat.
 * @param {boolean} [stream=false] - A boolean indicating whether to send a stream of data.
 * @returns {object|object} - An object containing the response from the server or an HTTP response object if streaming.
 */
export async function chat(model, messages, stream = false) {
  // chat
  const url = 'chat';
  const body = JSON.stringify({ model, messages, stream });
  console.log("\nollama.server->f(chat)Body ", body);

  if (!stream) {
    const ret_val = await fetchJSON(url, body);
    return ret_val;
  } else {
    
    const response = await fetch(BASEURL + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    console.log("ollama.server->f(chat) returning \n");
    return response;
    
  }
}

export async function generate(model, prompt,system='you are a helpful assistant', stream = false) {
  // chat
  const url = 'generate';
  const body = JSON.stringify({ model, prompt,system, stream });
  console.log("Body ", body);

  if (!stream) {
    const ret_val = await fetchJSON(url, body);
    return ret_val;
  } else {
    const response = await fetch(BASEURL + url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });
    return response;
    
  }
}
// get models
// curl http://localhost:11434/api/tags
export const get_models = async () => { 
  const url = BASEURL+'tags';
  console.log("ollama.server->f(get_models) url ",url)
  const ret_val = await fetch(url);
  if (!ret_val.ok) {
    console.log("ollama.server->f(get_models) ret_val ",ret_val)
    throw new Error("Failed to fetch models");
  }
  const data = await ret_val.json();
  return data.models;
}

export const get_model_names = async () => {  
  const models = await get_models();
  const model_names = models.map(model => model.name);
  return model_names;
}