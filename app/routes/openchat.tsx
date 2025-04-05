import type { Route } from "./+types/susers";
import {sleep} from "../utils/utility"
import createOpenRouterClient from "../api/openRouter";

export async function loader({
  params,
}: Route.ClientLoaderArgs) {
  console.log("loader: /openchat", process.env.USER)
  const client = createOpenRouterClient(process.env.OPENROUTER_API_KEY,{siteName:"OpenChat",siteUrl:"https://openchat.ai"});
  const messages = [{role: "user", content: "write a short story for a five year old boy"}];
  const response = await client.getResponse(messages);
  return response;
}

export default function susers({
  loaderData,
}: Route.ComponentProps) {
  
  return (
        <div className="m-4 rounded-lg p-10 bg-slate-100">
            <div className="pb-4 text-2xl">Route: /openchat loader = Server Loader</div>
            <div>route("/openchat","routes/openchat.tsx"),</div>
            <pre className=" text-blue-600 text-sm font-thin">{JSON.stringify(loaderData,null,2)}</pre>
        </div>
  );
}