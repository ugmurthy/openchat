import tasks from '../db/tasks.json' assert { type: 'json' }


export function getTasks() {
  return tasks
}
export function getTask (task) {
    const taskFound = tasks.find((t) => t.task === task)
    if (!taskFound) {
        return null
    }
    return taskFound
    }


