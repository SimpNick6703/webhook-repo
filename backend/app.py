from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from datetime import datetime, timezone, timedelta
import json
import os
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/github_webhook_db")
mongo = PyMongo(app)

def format_timestamp(timestamp_str):
    """Convert GitHub timestamp to ISO format for frontend processing."""
    try:
        print(f"DEBUG: Input timestamp: {timestamp_str}")
        
        # Handle different GitHub timestamp formats
        if timestamp_str.endswith('Z'):
            # UTC timestamp format: "2024-01-01T12:00:00Z"
            dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        else:
            # Timestamp with timezone offset: "2025-07-02T14:24:24+05:30"
            dt = datetime.fromisoformat(timestamp_str)
        
        print(f"DEBUG: Parsed datetime: {dt}")
        # Return ISO format for frontend to handle timezone conversion
        result = dt.isoformat()
        print(f"DEBUG: Returning ISO format: {result}")
        return result
    except Exception as e:
        print(f"Error parsing timestamp '{timestamp_str}': {e}")
        # Fallback to current time in ISO format
        return datetime.now().isoformat()

@app.route('/github', methods=['POST'])
def handle_webhook():
    """Handle GitHub webhook events."""
    
    print(f"\n🚀 Webhook received!")
    print(f"📋 Headers: {dict(request.headers)}")
    print(f"📦 Content-Type: {request.content_type}")
    print(f"📏 Content-Length: {request.content_length}")
    
    # Get the event type
    event_type = request.headers.get('X-GitHub-Event')
    payload = request.json
    
    print(f"🎯 Event Type: {event_type}")
    print(f"📄 Payload Keys: {list(payload.keys()) if payload else 'None'}")
    
    try:
        webhook_data = None
        
        if event_type == 'push':
            # Handle push events
            webhook_data = {
                'request_id': payload['head_commit']['id'],
                'author': payload['head_commit']['author']['name'],
                'action': 'PUSH',
                'from_branch': None,  # Push doesn't have a from_branch
                'to_branch': payload['ref'].replace('refs/heads/', ''),
                'timestamp': format_timestamp(payload['head_commit']['timestamp'])
            }
            
        elif event_type == 'pull_request':
            # Handle pull request events
            pr = payload['pull_request']
            action = payload['action']
            
            if action in ['opened', 'reopened']:
                webhook_data = {
                    'request_id': str(pr['id']),
                    'author': pr['user']['login'],
                    'action': 'PULL_REQUEST',
                    'from_branch': pr['head']['ref'],
                    'to_branch': pr['base']['ref'],
                    'timestamp': format_timestamp(pr['created_at'])
                }
            elif action == 'closed' and pr['merged']:
                # Handle merge events
                webhook_data = {
                    'request_id': str(pr['id']),
                    'author': pr['merged_by']['login'] if pr['merged_by'] else pr['user']['login'],
                    'action': 'MERGE',
                    'from_branch': pr['head']['ref'],
                    'to_branch': pr['base']['ref'],
                    'timestamp': format_timestamp(pr['merged_at'])
                }
        
        if webhook_data:
            # Store in MongoDB
            result = mongo.db.webhook_events.insert_one(webhook_data)
            print(f"Stored webhook event: {webhook_data}")
            return jsonify({'status': 'success', 'id': str(result.inserted_id)}), 200
        else:
            return jsonify({'status': 'ignored', 'message': 'Event type not handled'}), 200
            
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/events', methods=['GET'])
def get_events():
    """Get all webhook events from MongoDB."""
    try:
        # Get all events, sorted by timestamp (newest first)
        events = list(mongo.db.webhook_events.find().sort('timestamp', -1))
        
        # Convert ObjectId to string for JSON serialization
        for event in events:
            event['_id'] = str(event['_id'])
            
        return jsonify(events), 200
    except Exception as e:
        print(f"Error fetching events: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        # Test MongoDB connection
        mongo.db.command('ping')
        return jsonify({'status': 'healthy', 'mongodb': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
