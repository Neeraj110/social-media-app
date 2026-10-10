# Import all models here so that Base.metadata has all tables
from models.user import User
from models.post import Post, PostMedia, Reaction, Comment, SavedPost
from models.social import Follow, FriendRequest, Friendship, Block
from models.message import Conversation, ConversationParticipant, Message
from models.notification import Notification
from models.extra import Hashtag, PostHashtag, Mention, Report, UserSettings, DeviceToken
from models.ai_chat import AIChat, AIMessage
