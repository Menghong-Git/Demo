import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

class Database {
  constructor() {
    this.db = new LowSync(new JSONFileSync("db.json"), {});
    this.initialize();
  }

  // Initialize database with default data
  initialize() {
    this.db.read();

    // Set default data if db is empty
    this.db.data ||= {
      users: [],
    };

    this.db.write();
  }

  // Get all records from a collection // db.getAll("users")
  getAll(collection) { 
    return this.db.data[collection] || [];
  }

  // Get a single record by ID
  getById(collection, id) {  // db.getById("users", "123435")
    return this.db.data[collection]?.find((item) => item.id === id);
  }

  // Find records matching criteria (object-based search)
  find(collection, criteria) { // {category: "permium"} // db.find("users", {category: "premium"})
    const records = this.db.data[collection];
    if (!records) return [];

    // Filter records where all criteria match
    return records.filter((record) =>
      Object.entries(criteria).every(([key, value]) => record[key] === value)
    );
  }

  // Find one record matching criteria
  findOne(collection, criteria) {
    const records = this.find(collection, criteria);
    return records.length > 0 ? records[0] : null;
  }

  // Add a new record
  add(collection, data) {
    data.id = Date.now(); // Simple unique ID
    this.db.data[collection].push(data);
    this.db.write();
    return data;
  }

  // Update a record by ID
  update(collection, id, updates) {
    const item = this.db.data[collection].find((item) => item.id === id);
    if (item) {
      Object.assign(item, updates);
      this.db.write();
      return item;
    }
    return null;
  }

  // Delete a record by ID
  delete(collection, id) {
    const index = this.db.data[collection].findIndex((item) => item.id === id);
    if (index !== -1) {
      const deletedItem = this.db.data[collection].splice(index, 1);
      this.db.write();
      return deletedItem[0];
    }
    return null;
  }
}

export default new Database();
