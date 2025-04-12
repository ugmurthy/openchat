// indexedDBService.js

/**
 * A service to handle IndexedDB operations for different entities
 * Supports: conversations, memory, and settings
 */
class IndexedDBService {
    ENTITY_TYPES: { CONVERSATIONS: string; MEMORY: string; SETTINGS: string; };
    DB_NAME: string;
    DB_VERSION: number;
    db: null;
    constructor() {
      this.DB_NAME = 'AppDatabase';
      this.DB_VERSION = 1;
      this.db = null;
      this.ENTITY_TYPES = {
        CONVERSATIONS: 'conversations',
        MEMORY: 'memory',
        SETTINGS: 'settings'
      };
      
      // Initialize the database
      this.init();
    }
  
    /**
     * Initialize the database
     * @returns {Promise} - Promise that resolves when the database is ready
     */
    init(): Promise<any> {
      return new Promise((resolve, reject) => {
        if (this.db) {
          resolve(this.db);
          return;
        }
  
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
  
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Create object stores if they don't exist
          if (!db.objectStoreNames.contains(this.ENTITY_TYPES.CONVERSATIONS)) {
            db.createObjectStore(this.ENTITY_TYPES.CONVERSATIONS, { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains(this.ENTITY_TYPES.MEMORY)) {
            db.createObjectStore(this.ENTITY_TYPES.MEMORY, { keyPath: 'id' });
          }
          
          if (!db.objectStoreNames.contains(this.ENTITY_TYPES.SETTINGS)) {
            db.createObjectStore(this.ENTITY_TYPES.SETTINGS, { keyPath: 'id' });
          }
        };
  
        request.onsuccess = (event) => {
          this.db = event.target.result;
          resolve(this.db);
        };
  
        request.onerror = (event) => {
          console.error('IndexedDB error:', event.target.error);
          reject(event.target.error);
        };
      });
    }
  
    /**
     * Get a reference to an object store
     * @param {string} entityType - The entity type (object store name)
     * @param {string} mode - Transaction mode ('readonly' or 'readwrite')
     * @returns {Promise<IDBObjectStore>} - Promise that resolves with the object store
     */
    async getObjectStore(entityType: string, mode: string = 'readonly'): Promise<IDBObjectStore> {
      await this.init();
      const transaction = this.db.transaction(entityType, mode);
      return transaction.objectStore(entityType);
    }
  
    /**
     * Get all items for a specific entity type
     * @param {string} entityType - The type of entity to retrieve
     * @returns {Promise<Array>} - Promise that resolves with an array of items
     */
    async getAll(entityType: string): Promise<Array<any>> {
      const store = await this.getObjectStore(entityType);
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = (event) => {
          console.error(`Error getting all ${entityType}:`, event.target.error);
          reject(event.target.error);
        };
      });
    }
  
    /**
     * Get a specific item by ID from an entity type
     * @param {string} entityType - The type of entity
     * @param {string} id - The ID of the item to retrieve
     * @returns {Promise<Object|null>} - Promise that resolves with the item or null
     */
    async getById(entityType: string, id: string): Promise<object | null> {
      const store = await this.getObjectStore(entityType);
      return new Promise((resolve, reject) => {
        const request = store.get(id);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        
        request.onerror = (event) => {
          console.error(`Error getting ${entityType} by ID:`, event.target.error);
          reject(event.target.error);
        };
      });
    }
  
    /**
     * Check if a value matches criteria with support for nested properties
     * @param {Object} item - The item to check
     * @param {Object} criteria - The criteria to match against
     * @returns {boolean} - Whether the item matches the criteria
     */
    matchesCriteria(item: object, criteria: object): boolean {
      return Object.keys(criteria).every(key => {
        // Handle nested properties using dot notation (e.g., 'user.name')
        if (key.includes('.')) {
          const props = key.split('.');
          let value = item;
          for (const prop of props) {
            if (value === undefined || value === null) return false;
            value = value[prop];
          }
          return value === criteria[key];
        }
        
        return item[key] === criteria[key];
      });
    }
  
    /**
     * Find items that match certain criteria
     * @param {string} entityType - The type of entity
     * @param {Object} criteria - Key-value pairs to match against items
     * @returns {Promise<Array>} - Promise that resolves with an array of matching items
     */
    async find(entityType: string, criteria: object): Promise<Array<any>> {
      const items = await this.getAll(entityType);
      return items.filter(item => this.matchesCriteria(item, criteria));
    }
  
    /**
     * Save an item to the database
     * @param {string} entityType - The type of entity
     * @param {Object} item - The item to save (must have an id property)
     * @returns {Promise<Object>} - Promise that resolves with the saved item
     */
    async save(entityType: string, item: object): Promise<object> {
      if (!item.id) {
        throw new Error('Item must have an id property');
      }
  
      const store = await this.getObjectStore(entityType, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.put(item);
        
        request.onsuccess = () => {
          resolve(item);
        };
        
        request.onerror = (event) => {
          console.error(`Error saving ${entityType}:`, event.target.error);
          reject(event.target.error);
        };
      });
    }
  
    /**
     * Update an existing item
     * @param {string} entityType - The type of entity
     * @param {string} id - The ID of the item to update
     * @param {Object} updates - The properties to update
     * @returns {Promise<Object|null>} - Promise that resolves with the updated item or null
     */
    async update(entityType: string, id: string, updates: object): Promise<object | null> {
      const item = await this.getById(entityType, id);
      
      if (!item) {
        return null;
      }
      
      const updatedItem = { ...item, ...updates };
      return this.save(entityType, updatedItem);
    }
  
    /**
     * Delete an item by ID
     * @param {string} entityType - The type of entity
     * @param {string} id - The ID of the item to delete
     * @returns {Promise<boolean>} - Promise that resolves with true if deleted
     */
    async delete(entityType: string, id: string): Promise<boolean> {
      const store = await this.getObjectStore(entityType, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.delete(id);
        
        request.onsuccess = () => {
          resolve(true);
        };
        
        request.onerror = (event) => {
          console.error(`Error deleting ${entityType}:`, event.target.error);
          reject(event.target.error);
        };
      });
    }
  
    /**
     * Clear all items of a specific entity type
     * @param {string} entityType - The type of entity to clear
     * @returns {Promise<void>} - Promise that resolves when cleared
     */
    async clear(entityType: string): Promise<void> {
      const store = await this.getObjectStore(entityType, 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error(`Error clearing ${entityType}:`, event.target.error);
          reject(event.target.error);
        };
      });
    }
  
    /**
     * Clear all data from the database
     * @returns {Promise<void>} - Promise that resolves when all data is cleared
     */
    async clearAll(): Promise<void> {
      const entityTypes = Object.values(this.ENTITY_TYPES);
      await Promise.all(entityTypes.map(type => this.clear(type)));
    }
  }
  
  const indexedDBService = new IndexedDBService();
  export default indexedDBService;
  