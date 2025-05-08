// CustomDBExample.tsx
import React, { useEffect, useState } from 'react';
import { IndexedDBService } from '../db/indexedDBService3.client';
import useIndexedDB from '../hooks/useIndexedDB5';
// Define custom entity types
const TASK_ENTITY_TYPES = {
  TASKS: 'tasks',
  PROJECTS: 'projects',
  CATEGORIES: 'categories'
};

// Define custom indexes
const TASK_INDEXES = {
  'tasks': [
    { name: 'createdAt', keyPath: 'createdAt', unique: false },
    { name: 'updatedAt', keyPath: 'updatedAt', unique: false },
    { name: 'dueDate', keyPath: 'dueDate', unique: false },
    { name: 'status', keyPath: 'status', unique: false },
    { name: 'priority', keyPath: 'priority', unique: false },
    { name: 'projectId', keyPath: 'projectId', unique: false },
    { name: 'categoryId', keyPath: 'categoryId', unique: false }
  ],
  'projects': [
    { name: 'createdAt', keyPath: 'createdAt', unique: false },
    { name: 'updatedAt', keyPath: 'updatedAt', unique: false },
    { name: 'name', keyPath: 'name', unique: true }
  ],
  'categories': [
    { name: 'name', keyPath: 'name', unique: true }
  ]
};

// Create a custom IndexedDBService instance
const taskDBService = new IndexedDBService(
  'TaskManager',
  1,
  TASK_ENTITY_TYPES,
  TASK_INDEXES
);

// Sample Task Interface
interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 1 | 2 | 3; // 1=High, 2=Medium, 3=Low
  projectId?: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TaskManagerExample: React.FC = () => {
  // Use our custom DB service with the hook
  const {
    items: tasks,
    loading,
    error,
    save,
    findByRange,
    findRecent,
    find
  } = useIndexedDB(TASK_ENTITY_TYPES.TASKS, taskDBService);
  
  const [priorityTasks, setPriorityTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  
  // Create an example task
  const createTask = async () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: `New Task ${tasks.length + 1}`,
      description: 'This is a sample task',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      status: 'todo',
      priority: Math.floor(Math.random() * 3 + 1) as 1 | 2 | 3
    };
    
    await save(newTask);
  };
  
  // Load high priority tasks
  const loadPriorityTasks = async () => {
    const highPriorityTasks = await find({ priority: 1 });
    setPriorityTasks(highPriorityTasks);
  };
  
  // Load upcoming tasks (due in the next 3 days)
  const loadUpcomingTasks = async () => {
    const now = new Date().toISOString();
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    
    const dateRange = IDBKeyRange.bound(now, threeDaysLater);
    const upcoming = await findByRange('dueDate', dateRange);
    setUpcomingTasks(upcoming);
  };
  
  // Load tasks on mount
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      loadPriorityTasks();
      loadUpcomingTasks();
    }
  }, [loading, tasks]);
  
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="task-manager">
      <h1>Task Manager</h1>
      
      <button onClick={createTask}>Create Sample Task</button>
      
      <h2>All Tasks ({tasks.length})</h2>
      <ul>
        {tasks.map((task: Task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> - 
            Priority: {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'} - 
            Status: {task.status}
          </li>
        ))}
      </ul>
      
      <h2>High Priority Tasks ({priorityTasks.length})</h2>
      <ul>
        {priorityTasks.map((task: Task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> - 
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
      
      <h2>Upcoming Tasks ({upcomingTasks.length})</h2>
      <ul>
        {upcomingTasks.map((task: Task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> - 
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManagerExample;