import React from 'react'
import { useState,useEffect} from 'react'

//import { IndexedDBService } from '../db/indexedDBService3.client';
import indexedDBService from '~/db/indexedDBService3.client';
import useIndexedDB from '../hooks/useIndexedDB5';


let hasNotRun = true;
/// FOR IndexedDB ///////
// Define custom entity types
const CHAT_ENTITY_TYPES = {
    CHAT: 'chat',
  };
  // Define custom indexes
  const CHAT_INDEXES = {
    'chat': [
      { name: 'createdAt', keyPath: 'createdAt', unique: false },
      { name: 'title', keyPath: 'title', unique: false },
      { name: 'id', keyPath: 'id', unique: true }
  ]  
  };
/*
  Notes:
  1. index id will be Date.now()
  2. title will be any of the following strings 'memory' , 'conversations', 'settings'
  3. 'memory' - will contain parts of the current conversation but not stored as 'conversations'  as yet
  4. 'memory' will be of type:Message and total number of objects in indexedDB will be less than or equal to settings.memoryLength
  5. 'conversations' will have a conversation_name, and an object of type: Message[], task, and all model parameters used for the chat (features)
  6. 'settings' will contain necessary settings for generation 
  */
////////////////////////  

const Memory: React.FC = ({message}) => {
        const [written,setWritten]=useState(false)
        console.log("Memory Component ",message.length, hasNotRun)
        // Create a custom IndexedDBService instance
       /*  const [chatDBService,setChatDBService] = useState(new IndexedDBService(
                'ChatManager',
                1,
                CHAT_ENTITY_TYPES,
                CHAT_INDEXES
            )); */
                
        // Use our custom DB service with the hook
        const {
                items,
                loading,
                error,
                save,
                findByRange,
                findRecent,
                find,
                remove,
                update,
                clear
            } = useIndexedDB(CHAT_ENTITY_TYPES.CHAT, indexedDBService);
            
  // helpers
  const addMessage = async (msg) => {
    const newMessage = {
      id: `${Date.now()}`,
      title: `memory`,
      message: msg,
    };
    
    await save(newMessage);
  };
  
  const clearAll = async() => {
    await clear();
  }

 useEffect(()=>{
    if (hasNotRun && message.length==2) {
        // add message
        const addit = async()=> {
            await addMessage(message);
        }
        addit();
        hasNotRun=false;
        setWritten(true)
    }
 },[])

  console.log(items)
  return (
    <div>
      Memory : {items.length}
      <div className='flex space-x-4'>
      <button className='btn btn-xs btn-outline' onClick={addMessage}>Save</button>
      <button className='btn btn-xs btn-outline btn-error' onClick={clear}>Clear</button>
      </div>
    </div>

  )
}

export default Memory
