import {Route} from "./+types/tasks";
import {getTasks} from '~/api/tasks';

import { redirect } from 'react-router'
import { getAuth } from '@clerk/react-router/ssr.server'
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router';
import MarkDownIt from "~/components/MarkDownIt";


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

    return tasks;
    }


const TaskList = ({loaderData}:Route.ComponentProps) => {
  const [tasks, setTasks] = useState(loaderData|| []);
  //const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const navigate = useNavigate();
/* 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('Fetching tasks from API...');
        setLoading(true);
        
        const response = await fetch('/api/v1/tasks');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Successfully loaded ${data.length} tasks`);
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);
 */
  const handleRowClick = async (task) => {
    try {
      console.log(`Navigating to settings with task: ${task.id}`, task);
      
      // Send POST request to settings endpoint
      const response = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error(`Navigation error: ${response.status} ${response.statusText}`);
      }
      
      console.log('POST request successful, navigating to settings page');
      // Navigate to settings page
      navigate('/api/v1/settings');
    } catch (err) {
      console.error('Navigation failed:', err);
      setError('Failed to navigate to settings. Please try again.');
    }
  };

  const handleDescriptionClick = (e, task) => {
    e.stopPropagation(); // Prevent row click handler from firing
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  // Truncate description to first 40 characters
  const truncateDescription = (description) => {
    return description.length > 40 ? `${description.substring(0, 40)}...` : description;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      
      {/*loading && (
        <div className="flex justify-center items-center py-8" aria-live="polite" aria-busy="true">
          <span className="loading loading-spinner loading-xs" aria-label="Loading tasks"></span>
          <span className="sr-only">Loading tasks...</span>
        </div>
      )*/}
      
      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      { !error && (
        <div className="overflow-x-auto">
          <table className="table w-full" aria-label="Tasks list">
            <thead>
              <tr>
                <th scope="col">Task</th>
                <th scope="col">Description</th>
                <th scope="col">Local</th>
                <th scope="col">Model</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className="hover cursor-pointer"
                    onClick={() => handleRowClick(task)}
                    aria-label={`Task: ${task.task}`}
                    tabIndex="0"
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleRowClick(task);
                      }
                    }}
                  >
                    <td>{task.task}</td>
                    <td 
                      className="text-blue-500 underline"
                      onClick={(e) => handleDescriptionClick(e, task)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleDescriptionClick(e, task);
                        }
                      }}
                      tabIndex="0"
                      role="button"
                      aria-label={`View description for ${task.task}`}
                    >
                      {truncateDescription(task.description)}
                    </td>
                    <td>{task.local ? 'Yes' : 'No'}</td>
                    <td>{task.model}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Description Modal */}
      {showModal && selectedTask && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 id="modal-title" className="text-xl font-bold">{selectedTask.task}</h3>
              <button 
                className="btn btn-sm btn-circle" 
                onClick={closeModal}
                aria-label="Close description modal"
              >
                ✕
              </button>
            </div>
            <div className="divider"></div>
            <div className="mt-4">
              <MarkDownIt markdown={selectedTask.description} />
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                className="btn btn-primary"
                onClick={closeModal}
                aria-label="Close description modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;

