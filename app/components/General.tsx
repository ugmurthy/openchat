// Just copy/paste this as your initial component



export default function Component({loaderData,actionData,params,matches}: Route.ComponentProps) {
  
  return (
    <div className="m-4 rounded-lg p-10 bg-slate-100">
      <div className="text-2xl">General Component</div>
      <div className="text-lg">Exposes all ComponentProps for this route</div>
      <div className="text-sm"></div>
      <div className="text-xs text-red-500 font-thin">
      <hr></hr>
      <pre className="text-red-500">Loader Data: {loaderData?JSON.stringify(loaderData,null,2):"None"}</pre>
      <hr></hr>
<pre className="text-blue-500">Action Data: {actionData?JSON.stringify(actionData,null,2):"None"}</pre>
<hr></hr>
<pre className="text-red-500">Route Parameters: {JSON.stringify(params,null,2)}</pre>
<hr></hr>
<pre className="text-green-500">Matched Routes: {JSON.stringify(matches,null,2)}</pre>
</div>
      
    </div>
  );
}
