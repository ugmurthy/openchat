import type { Route } from "./+types/susers";
import {sleep} from "../utils/utility"

export async function loader({
  params,
}: Route.ClientLoaderArgs) {
  //await sleep(3000)
  const URL = 'https://jsonplaceholder.typicode.com'
  const res = await fetch(`${URL}/users`);
  const users = await res.json();
  return users;
}

export default function susers({
  loaderData,
}: Route.ComponentProps) {
  const users = loaderData;
  return (
    <div className="m-4 rounded-lg p-10 bg-slate-100">
            <div className="pb-4 text-2xl">Route: /susers/:pid  loader = Server Loader</div>
            <pre className=" text-green-600 text-sm font-thin">{JSON.stringify(loaderData,null,2)}</pre>
        </div>
  );
}