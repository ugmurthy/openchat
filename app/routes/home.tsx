import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Use `getAuth()` to get the user's ID
  const { userId } = await getAuth(args)

  // Protect the route by checking if the user is signed in
  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url)
  }
  return {};
}


export default function Home() {
  return <div><Welcome /></div>;
}
