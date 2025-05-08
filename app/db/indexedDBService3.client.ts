// indexedDBService.js

/**
 * Interface for entity types
 */
export interface EntityTypes {
    [key: string]: string;
  }
  
  /**
   * Interface for index definition
   */
  export interface IndexDefinition {
    name: string;
    keyPath: string | string[];
    unique: boolean;
  }
  
  /**
   * Interface for indexes by entity type
   */
  export interface IndexesByEntityType {
    [entityType: string]: IndexDefinition[];
  }
  
  /**
   * A service to handle IndexedDB operations for different entities
   * Supports configurable entity types and indexes for efficient querying
   */
  class IndexedDBService {
      ENTITY_TYPES: EntityTypes;
      DB_NAME: string;
      DB_VERSION: number;
      db: any;
      INDEXES: IndexesByEntityType;
      
      /**
       * Create a new IndexedDBService
       * @param {string} dbName - Name of the IndexedDB database
       * @param {number} dbVersion - Version of the database
       * @param {EntityTypes} entityTypes - Object containing entity type definitions
       * @param {IndexesByEntityType} indexes - Object containing index definitions by entity type
       */
      constructor(
        dbName: string = 'ChatManager',
        dbVersion: number = 1,
        entityTypes: EntityTypes = {
          CHAT: 'chat',
        },
        indexes: IndexesByEntityType = { 'chat': [
          { name: 'createdAt', keyPath: 'createdAt', unique: false },
          { name: 'title', keyPath: 'title', unique: false },
          { name: 'id', keyPath: 'id', unique: true }
      ]}
      ) {
        this.DB_NAME = dbName;
        this.DB_VERSION = dbVersion;
        this.db = null;
        this.ENTITY_TYPES = entityTypes;
        
        // Initialize with default indexes if not provided
        this.INDEXES = indexes;
        
        // Create default indexes if not provided
        Object.values(this.ENTITY_TYPES).forEach(entityType => {
          if (!this.INDEXES[entityType]) {
            this.INDEXES[entityType] = [];
          }
          
          // Add default timestamp indexes if not already defined
          const hasCreatedAtIndex = this.INDEXES[entityType].some(idx => idx.name === 'createdAt');
          const hasUpdatedAtIndex = this.INDEXES[entityType].some(idx => idx.name === 'updatedAt');
          
          if (!hasCreatedAtIndex) {
            this.INDEXES[entityType].push({ name: 'createdAt', keyPath: 'createdAt', unique: false });
          }
          
          if (!hasUpdatedAtIndex) {
            this.INDEXES[entityType].push({ name: 'updatedAt', keyPath: 'updatedAt', unique: false });
          }
        });
        
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
    
          const request = window.indexedDB.open(this.DB_NAME, this.DB_VERSION);
    
          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores if they don't exist and add indexes
            Object.values(this.ENTITY_TYPES).forEach(entityType => {
              let objectStore;
              
              if (!db.objectStoreNames.contains(entityType)) {
                objectStore = db.createObjectStore(entityType, { keyPath: 'id' });
                console.log(`Created object store: ${entityType}`);
              } else {
                // Get existing object store for adding indexes
                objectStore = event.target.transaction.objectStore(entityType);
              }
              
              // Add indexes to the object store
              const indexes = this.INDEXES[entityType] || [];
              indexes.forEach(indexDef => {
                // Skip if index already exists
                if (!objectStore.indexNames.contains(indexDef.name)) {
                  objectStore.createIndex(indexDef.name, indexDef.keyPath, { unique: indexDef.unique });
                  console.log(`Created index: ${indexDef.name} for ${entityType}`);
                }
              });
            });
          };
    
          request.onsuccess = (event) => {
            this.db = event.target.result;
            console.log(`Database opened: ${this.DB_NAME}`);
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
        const store = await this.getObjectStore(entityType);
        
        // Check if we can use an index for this query
        const criteriaKeys = Object.keys(criteria);
        if (criteriaKeys.length === 1) {
          const key = criteriaKeys[0];
          const value = criteria[key];
          
          // If the key has a direct index, use it
          if (!key.includes('.') && store.indexNames.contains(key)) {
            return new Promise((resolve, reject) => {
              const index = store.index(key);
              const request = index.getAll(value);
              
              request.onsuccess = () => {
                resolve(request.result);
              };
              
              request.onerror = (event) => {
                console.error(`Error finding ${entityType} by index:`, event.target.error);
                reject(event.target.error);
              };
            });
          }
        }
        
        // Fallback to in-memory filtering for complex criteria
        const items = await this.getAll(entityType);
        return items.filter(item => this.matchesCriteria(item, criteria));
      }
      
      /**
       * Find items by using an index range
       * @param {string} entityType - The type of entity
       * @param {string} indexName - The name of the index to use
       * @param {IDBKeyRange} range - The range to query (use IDBKeyRange methods)
       * @returns {Promise<Array>} - Promise that resolves with an array of matching items
       */
      async findByRange(entityType: string, indexName: string, range: IDBKeyRange): Promise<Array<any>> {
        const store = await this.getObjectStore(entityType);
        
        if (!store.indexNames.contains(indexName)) {
          throw new Error(`Index '${indexName}' does not exist on entity type '${entityType}'`);
        }
        
        return new Promise((resolve, reject) => {
          const index = store.index(indexName);
          const request = index.getAll(range);
          
          request.onsuccess = () => {
            resolve(request.result);
          };
          
          request.onerror = (event) => {
            console.error(`Error finding ${entityType} by range:`, event.target.error);
            reject(event.target.error);
          };
        });
      }
      
      /**
       * Find items using a cursor for more complex queries
       * @param {string} entityType - The type of entity
       * @param {string} indexName - The name of the index to use
       * @param {IDBKeyRange} range - The range to query (optional)
       * @param {Function} filterFn - Function to filter results (receives item, returns boolean)
       * @returns {Promise<Array>} - Promise that resolves with an array of matching items
       */
      async findWithCursor(
        entityType: string, 
        indexName: string, 
        range: IDBKeyRange | null = null, 
        filterFn: (item: any) => boolean = () => true
      ): Promise<Array<any>> {
        const store = await this.getObjectStore(entityType);
        
        let source = store;
        if (indexName) {
          if (!store.indexNames.contains(indexName)) {
            throw new Error(`Index '${indexName}' does not exist on entity type '${entityType}'`);
          }
          source = store.index(indexName);
        }
        
        return new Promise((resolve, reject) => {
          const results = [];
          const request = source.openCursor(range);
          
          request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              if (filterFn(cursor.value)) {
                results.push(cursor.value);
              }
              cursor.continue();
            } else {
              resolve(results);
            }
          };
          
          request.onerror = (event) => {
            console.error(`Error using cursor for ${entityType}:`, event.target.error);
            reject(event.target.error);
          };
        });
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
        
        // Add timestamps if they don't exist
        const now = new Date().toISOString();
        const updatedItem = {
          ...item,
          updatedAt: now
        };
        
        // Add createdAt only if it's a new item
        if (!await this.getById(entityType, item.id)) {
          updatedItem.createdAt = now;
        }
    
        const store = await this.getObjectStore(entityType, 'readwrite');
        return new Promise((resolve, reject) => {
          const request = store.put(updatedItem);
          
          request.onsuccess = () => {
            resolve(updatedItem);
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
        
        const updatedItem = { 
          ...item, 
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
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
      
      /**
       * Create a new index on an entity type (only works when upgrading DB version)
       * @param {string} entityType - The type of entity
       * @param {string} indexName - The name of the index
       * @param {string|string[]} keyPath - The property or properties to index
       * @param {boolean} unique - Whether the index should enforce uniqueness
       */
      addIndex(entityType: string, indexName: string, keyPath: string | string[], unique: boolean = false): void {
        if (!this.INDEXES[entityType]) {
          this.INDEXES[entityType] = [];
        }
        
        this.INDEXES[entityType].push({
          name: indexName,
          keyPath,
          unique
        });
        
        console.warn('Index added to configuration. You need to increment DB_VERSION to apply changes.');
      }
    }
    
  // Default entity types
  const DEFAULT_ENTITY_TYPES =
    {
      CHAT: 'chat',
    };
  
  
  // Default indexes for each entity type
  const DEFAULT_INDEXES = {
    'chat': [
      { name: 'createdAt', keyPath: 'createdAt', unique: false },
      { name: 'title', keyPath: 'title', unique: false },
      { name: 'id', keyPath: 'id', unique: true }
  ]
  };
  
  // Create the default instance
  const indexedDBService = new IndexedDBService(
    'ChatManager',
    2, // Version 2 to ensure indexes are created
    DEFAULT_ENTITY_TYPES,
    DEFAULT_INDEXES
  );
  
  export default indexedDBService;
  
  // Also export the class for custom instantiation
  export { IndexedDBService };
