import {Route} from "./+types/tasks";
import {getTasks} from '~/api/tasks';

import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'

export async function loader(args: Route.LoaderArgs) {
    const { userId } = await getAuth(args);
    // Protect the route by checking if the user is signed in
    if (!userId) {
        return redirect('/sign-in?redirect_url=' + args.request.url)
    }
    console.log(`${args.request.method}:${args.request.url}`);
    const tasks =  getTasks(userId);
    if (Object.keys(tasks).length === 0) {
        console.log("Cannot find tasks ")
        throw new Response("Tasks: Not Found", { status: 404 });
    }
    const {task,task_description} = tasks;
    const tasknames = tasks.map((t) => t.task)

    return tasknames;
    }