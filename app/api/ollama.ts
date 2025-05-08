

const BASEURL = 'http://localhost:11434/api/'
export async function fetchJSON(url, body, headers = { 'Content-Type': 'application/json' }) {
  const response = await fetch(BASEURL+url, {
    method: 'POST',
    headers,
    body
  });

  if (response.ok) {
    return response.json();
  } else {
    console.log("---------------------------")
    console.log(response)
    console.log("---------------------------")
    throw new Error('Failed to load data');
  }
}

/* export async function chat(model,messages,stream=false) {
    // chat
    const url = 'chat'
    const body = JSON.stringify({model,messages,stream})
    console.log("Body ",body)
    if (!stream) {
    const ret_val = await fetchJSON(url,body);
    } else {

    }
    return ret_val
} */

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