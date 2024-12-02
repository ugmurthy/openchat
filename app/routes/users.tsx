import type { Route } from "./+types/users";
import {sleep} from "../utils/utility"

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {
  await sleep(3000)
  const URL = 'https://jsonplaceholder.typicode.com'
  const res = await fetch(`${URL}/users`);
  const users = await res.json();
  return users;
}

// REMIX will render this during SSR instead of the component and will render
// the route component once clientLoader completes
export function HydrateFallback() {
  return <p className="p-20 text-center text-2xl text-blue-600 font-bold">Fetching.... </p>;
}

export default function users({
  loaderData,
}: Route.ComponentProps) {
  const users = loaderData;
  return (
    <div className="m-4 rounded-lg p-10 bg-slate-100">
            <div className="pb-4 text-2xl">Route: /users/:pid  loader = clientLoader</div>
            <pre className=" text-blue-600 text-sm font-thin">{JSON.stringify(loaderData,null,2)}</pre>
        </div>
  );
}