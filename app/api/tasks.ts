import tasks from '../db/tasks.json' assert { type: 'json' }


export function getTasks() {
  return tasks
}
export function getTask (task:string):string|null {
    const taskFound = tasks.find((t) => t.task === task)
    if (!taskFound) {
        return null
    }
    return taskFound
    }

export function getModel (task:string):object|null {
    const taskFound = tasks.find((t) => t.task === task)
    if (!taskFound) {
        return null
    }
    return {model:taskFound.model,local:taskFound.local}
}
