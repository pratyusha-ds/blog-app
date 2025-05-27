import graphene
from graphene import ObjectType, String, ID, Field, List, Mutation
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from flask import current_app
from .auth import generate_token, decode_token

class User(graphene.ObjectType):
    id = ID()
    username = String()
    displayName = String() 

class Post(graphene.ObjectType):
    id = ID()
    title = String()
    content = String()
    author = Field(User)

class UserWithPosts(ObjectType):
    id = ID()
    username = String()
    displayName = String() 
    posts = List(Post)

# Queries
class Query(ObjectType):
    hello = graphene.String()
    posts = List(Post)
    me = Field(UserWithPosts, token=String(required=True))
    post = Field(Post, id=ID(required=True))

    def resolve_hello(self, info):
        return "Hello from Flask GraphQL!"

    def resolve_posts(self, info):
        db = info.context["db"]
        posts_data = db.posts.find()
        posts_list = []
        for p in posts_data:
            author_data = db.users.find_one({"_id": ObjectId(p["author_id"])})
            author = None
            if author_data:
                author = User(
                    id=str(author_data["_id"]),
                    username=author_data["username"],
                    displayName=author_data.get("display_name", author_data["username"]) 
                )
            posts_list.append(
                Post(id=str(p["_id"]), title=p["title"], content=p["content"], author=author)
            )
        return posts_list

    def resolve_me(self, info, token):
        db = info.context["db"]
        try:
            user_id = decode_token(token)
        except Exception:
            return None

        user_data = db.users.find_one({"_id": ObjectId(user_id)})
        if not user_data:
            return None

        user_posts_cursor = db.posts.find({"author_id": user_id})
        user_posts_list = []

        current_user_as_author = User(
            id=str(user_data["_id"]),
            username=user_data["username"],
            displayName=user_data.get("display_name", user_data["username"])
        )

        for post_data in user_posts_cursor:
            user_posts_list.append(
                Post(id=str(post_data["_id"]), title=post_data["title"], content=post_data["content"], author=current_user_as_author)
            )

        return UserWithPosts(
            id=str(user_data["_id"]),
            username=user_data["username"],
            displayName=user_data.get("display_name", user_data["username"]), 
            posts=user_posts_list,
        )

    def resolve_post(self, info, id):
        db = info.context["db"]
        try:
            post_data = db.posts.find_one({"_id": ObjectId(id)})
            if post_data:
                author_data = db.users.find_one({"_id": ObjectId(post_data["author_id"])})
                author = None
                if author_data:
                    author = User(
                        id=str(author_data["_id"]),
                        username=author_data["username"],
                        displayName=author_data.get("display_name", author_data["username"]) 
                    )
                return Post(
                    id=str(post_data["_id"]),
                    title=post_data["title"],
                    content=post_data["content"],
                    author=author
                )
            return None
        except Exception as e:
            print(f"Error resolving single post with ID {id}: {e}")
            return None


class Register(Mutation):
    class Arguments:
        username = String(required=True)
        password = String(required=True)
        displayName = String()

    ok = graphene.Boolean()
    user = Field(lambda: User)
    token = String()
    message = String()

    def mutate(root, info, username, password, displayName=None): 
        db = info.context["db"]
        if db.users.find_one({"username": username}):
            return Register(ok=False, message="Username already exists")

        hashed = generate_password_hash(password)
        user_doc = {"username": username, "password": hashed}
        if displayName:
            user_doc["display_name"] = displayName 
        else:
            user_doc["display_name"] = username 

        user_id = db.users.insert_one(user_doc).inserted_id
        token = generate_token(str(user_id))

        return Register(
            ok=True,
            user=User(
                id=str(user_id),
                username=username,
                displayName=user_doc["display_name"] 
            ),
            token=token,
            message="User registered successfully",
        )

class Login(Mutation):
    class Arguments:
        username = String(required=True)
        password = String(required=True)

    ok = graphene.Boolean()
    user = Field(lambda: User)
    token = String()
    message = String()

    def mutate(root, info, username, password):
        db = info.context["db"]
        user_data = db.users.find_one({"username": username})
        if not user_data or not check_password_hash(user_data["password"], password):
            return Login(ok=False, message="Invalid credentials")

        token = generate_token(str(user_data["_id"]))
        return Login(
            ok=True,
            user=User(
                id=str(user_data["_id"]),
                username=username,
                displayName=user_data.get("display_name", user_data["username"]) 
            ),
            token=token,
            message="Login successful",
        )

class CreatePost(Mutation):
    class Arguments:
        title = String(required=True)
        content = String(required=True)
        token = String(required=True)
    ok = graphene.Boolean()
    post = Field(lambda: Post)
    message = String()
    def mutate(root, info, title, content, token):
        db = info.context["db"]
        try:
            user_id = decode_token(token)
        except Exception:
            return CreatePost(ok=False, message="Invalid or expired token")
        post_data = {
            "title": title,
            "content": content,
            "author_id": user_id,
        }
        result = db.posts.insert_one(post_data)

        author_data = db.users.find_one({"_id": ObjectId(user_id)})
        author = None
        if author_data:
            author = User(
                id=str(author_data["_id"]),
                username=author_data["username"],
                displayName=author_data.get("display_name", author_data["username"])
            )

        return CreatePost(
            ok=True,
            post=Post(id=str(result.inserted_id), title=title, content=content, author=author),
            message="Post created",
        )

class UpdatePost(Mutation):
    class Arguments:
        id = ID(required=True)
        title = String(required=True)
        content = String(required=True)
        token = String(required=True)

    ok = graphene.Boolean()
    post = Field(lambda: Post)
    message = String()

    def mutate(root, info, id, title, content, token):
        db = info.context["db"]
        try:
            user_id = decode_token(token)
        except Exception:
            return UpdatePost(ok=False, message="Invalid or expired token")

        post_obj_id = ObjectId(id)
        post_data = db.posts.find_one({"_id": post_obj_id})

        if not post_data:
            return UpdatePost(ok=False, message="Post not found")

        if post_data["author_id"] != user_id:
            return UpdatePost(ok=False, message="You are not authorized to edit this post")

        updated_post_data = {
            "title": title,
            "content": content,
        }
        db.posts.update_one({"_id": post_obj_id}, {"$set": updated_post_data})

        author_data = db.users.find_one({"_id": ObjectId(post_data["author_id"])})
        author = None
        if author_data:
            author = User(
                id=str(author_data["_id"]),
                username=author_data["username"],
                displayName=author_data.get("display_name", author_data["username"])
            )

        return UpdatePost(
            ok=True,
            post=Post(id=str(post_obj_id), title=title, content=content, author=author),
            message="Post updated successfully",
        )

class Mutation(ObjectType):
    register = Register.Field()
    login = Login.Field()
    create_post = CreatePost.Field()
    update_post = UpdatePost.Field() 

schema = graphene.Schema(query=Query, mutation=Mutation)