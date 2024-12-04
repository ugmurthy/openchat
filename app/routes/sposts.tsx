import type { Route } from "./+types/sposts";
import { data } from "react-router";

export async function loader({
  params,
}: Route.LoaderArgs) {
  const URL = 'https://jsonplaceholder.typicode.com'
  const res = await fetch(`${URL}/posts`);
  const posts = await res.json();
  if (Object.keys(posts).length===0) {
    console.log("Cannot find posts ")
    throw data(`Posts: Not Found`, { status: 404 });
  }
  return posts;
}
 
export async function action({request}:Route.ActionArgs) {
    const formdata = await request.formData();
    const title = formdata.get('title');
    const userId = formdata.get('userid');
    const body = formdata.get('body');

    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          body,
          userId,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
    
    if (response.ok) {
        const data= await response.json()
        console.log(data);
        return data;
    } else {
        return {error:"Error: could not add post"}
    }
}

export default function posts({
  actionData,loaderData
}: Route.ComponentProps) {
  
  return (
    <div>
        <div className="p-10 ">
            <form className="flex flex-col items-center space-y-2" method="POST">
                <div>Add Post</div>
                <input className="pl-2 border border-1" placeholder="Title" type="text" name="title"/>
                <input className="pl-2 border border-1" placeholder="Body" type="text" name="body"/>
                <input className="pl-2 border border-1" placeholder="userId" type="number" name="userid"/>
                <button className="px-2 border border-1 border-blue-600">Submit</button>
            </form>
        </div>

      <div className="m-4 rounded-lg p-10 bg-slate-100">
            <div className="pb-4 text-2xl">Route: /sposts/  Server action </div>
            <div>route("sposts","routes/sposts.tsx"),</div>
            <pre className=" text-green-600 text-sm font-thin">{JSON.stringify(actionData,null,2)}</pre>
        </div>

        <div className="m-4 rounded-lg p-10 bg-slate-100">
            <div className="pb-4 text-2xl">Route: /sposts/  Server loader </div>
            <div>route("sposts","routes/sposts.tsx"),</div>
            <pre className=" text-green-600 text-sm font-thin">{JSON.stringify(loaderData,null,2)}</pre>
        </div>
        </div>
  );
}