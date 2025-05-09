// Resource Route for Ollama API

import type {Route} from "./+types/chat";
import { generate, chat } from "~/core/ollama";
import {getTask} from "~/core/tasks";
import {replaceUrlsWithContent} from "~/helpers/webUtilsServer";
export async function action(args:  Route.ActionArgs) {
  console.log(`${args.request.method}:${args.request.url}`);
    //let {prompt,model, task,temperature, max_tokens} =  args.params;
      let {prompt,model, task,temperature, max_tokens} = await args.request.json();
      let features = {temperature,max_tokens}
      // console.log("\t formData: task : ", task);
      // console.log("\t formData: model: ", model);
      // console.log("\t formData: prompt: ", prompt);
      // console.log("\t formData: features: ", features);
      features = {model,...features}
  
      // check if promot contains urls
      const text = await replaceUrlsWithContent(prompt);
      if (text) {
          prompt = text;
      }


      // get the task record from the database and update the system prompt
      const task_record = await getTask(task);
      const system = task_record?.description ? task_record.description : "you are a helpful assistant";
      
      // prepare the messages for the LOCAL Chat API
      const messages = [
          {role: "system", content: system},
          {role: "user", content: prompt}
      ]
      features = {model,...features};
      console.log("\tfeatures",features);
      console.log("\tmessages",messages);
      return {model,messages}
    }