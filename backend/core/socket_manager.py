import socketio
from fastapi import FastAPI

# Create a Socket.IO ASGI app
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# This will hold connected users: {user_id: [sid_list]}
connected_users = {}

@sio.event
async def connect(sid, environ, auth):
    # We can handle authentication here by checking auth dict or headers in environ
    # For now, just accept
    print(f"Client connected: {sid}")
    # In real impl, parse auth for token and get user_id
    if auth and "token" in auth:
        # verify token...
        pass
    return True

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    # Remove from connected_users if present
    for user_id, sids in list(connected_users.items()):
        if sid in sids:
            sids.remove(sid)
            if not sids:
                del connected_users[user_id]
            break

@sio.event
async def join_conversation(sid, data):
    conversation_id = data.get("conversation_id")
    if conversation_id:
        await sio.enter_room(sid, f"conversation_{conversation_id}")
        print(f"Client {sid} joined conversation {conversation_id}")

@sio.event
async def leave_conversation(sid, data):
    conversation_id = data.get("conversation_id")
    if conversation_id:
        await sio.leave_room(sid, f"conversation_{conversation_id}")
        print(f"Client {sid} left conversation {conversation_id}")

@sio.event
async def send_message(sid, data):
    # Receives message from a client
    # Expected data: conversation_id, content, sender_id, etc.
    # In a full impl, we'd save to DB via API endpoint, and this socket just broadcasts
    pass

async def notify_new_message(conversation_id: int, message_data: dict):
    # Server-side function to emit to a room
    await sio.emit("new_message", message_data, room=f"conversation_{conversation_id}")

def attach_socketio(app: FastAPI):
    # Mount the Socket.IO app to the FastAPI app
    socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
    return socket_app
