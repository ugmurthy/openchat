import type { Route } from "./+types/users";

export async function clientLoader({
  params,
}: Route.ClientLoaderArgs) {
  const URL = 'https://jsonplaceholder.typicode.com'
  const res = await fetch(`${URL}/users/${params.pid}`);
  const users = await res.json();
  return users;
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