// MongoDB initialization script
db = db.getSiblingDB('github_webhook_db');

// Create a user for the application
db.createUser({
  user: 'webhook_user',
  pwd: 'webhook_password',
  roles: [
    {
      role: 'readWrite',
      db: 'github_webhook_db'
    }
  ]
});

// Create the webhook_events collection with indexes
db.createCollection('webhook_events');

// Create indexes for better performance
db.webhook_events.createIndex({ "timestamp": -1 });
db.webhook_events.createIndex({ "action": 1 });
db.webhook_events.createIndex({ "author": 1 });
db.webhook_events.createIndex({ "request_id": 1 }, { unique: true });

print('Database initialized successfully');
