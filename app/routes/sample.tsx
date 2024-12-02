// without type safety
export async function loader() {
    return { message: "Hello, world! this is a sample message " };
  }
  
  export default function MyRoute({ loaderData }) {
    
    return (
        <div className="m-4 rounded-lg text-center p-10 bg-slate-200">
            <h1 className=" text-blue-600 text-xl font-thin">{loaderData.message}</h1>
            <div>Route: /sample requires an entry in route.ts that matches path with route filename.</div>
        </div>
    )

  }