from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from datetime import datetime
from django.core import serializers
import time

from .models import User, Posts, Followers, Liked_Posts

from .forms import CommentForm, FollowerForm


def index(request):
    posts = Posts.objects.all().order_by("-time")
    if request.method == "POST":
        comment_form = CommentForm(request.POST)
        if comment_form.is_valid():
            user = request.user
            time = datetime.now()
            comment = comment_form.cleaned_data["comment"]
            post = Posts(username = user, time = time, content = comment)
            post.save()
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/index.html",{
                "posts": posts,
                "form": comment_form
            })
    else:
        return render(request, "network/index.html",{
                "posts": posts,
                "form": CommentForm()
            })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def profile(request, username):
    posts = Posts.objects.filter(username__username = username).order_by("-time")
    following_check = Followers.objects.filter(follower = request.user, following__username = username)
    total_followers = Followers.objects.filter(following__username = username)
    total_following = Followers.objects.filter(follower__username = username)
    if request.method == "POST":
        follower_form = FollowerForm(request.POST)
        if not following_check:
            if follower_form.is_valid():
                following = get_object_or_404(User, username=username)
                follower = request.user
                followers = Followers(following = following, follower = follower)
                followers.save()
                return HttpResponseRedirect(request.path_info)
        else:
            if follower_form.is_valid():
                Followers.objects.get(following = get_object_or_404(User, username=username), follower = request.user).delete()
                return HttpResponseRedirect(request.path_info)
    else:
        return render(request, "network/profile.html",{
            "posts": posts,
            "username": username,
            "form": FollowerForm(),
            "following_check": following_check,
            "total_followers": total_followers.count(),
            "total_following": total_following.count(),
            "following": total_following,
            "followers": total_followers
        })

@login_required(login_url="/login")
def following(request):
    # related filtering - don't delete
    followed_users = Posts.objects.filter(username__following__follower = request.user)
    # # For loop - out of date
    # followed_list = []
    # for follow in following:
    #     followed = Posts.objects.filter(username = follow.following.id)
    #     # followed = list(followed)
    #     followed_list += followed
    return render(request, "network/following.html",{
        "followed_users": followed_users
    })

# APIs
def get_followers(request, username):
    followers = Followers.objects.filter(following__username = username)
    return JsonResponse([follower.serialize() for follower in followers], safe=False)

def get_following(request, username):
    followings = Followers.objects.filter(follower__username = username)
    return JsonResponse([following.serialize() for following in followings], safe=False)

def get_posts(request):

    # Get start and end points from request
    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))

    # Get the posts and filter by time - newer first
    posts = Posts.objects.all().order_by("-time")[start:end]

    # Artificially delay speed of response - try this later
    # time.sleep(1)

    return JsonResponse([post.serialize() for post in posts], safe = False)

def get_user_posts(request):

    # Get start and end points from request
    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))
    user = request.GET.get("user")

    # Get the posts and filter by time - newer first
    posts = Posts.objects.all().filter(username__username = user).order_by("-time")[start:end]

    # Artificially delay speed of response - try this later
    # time.sleep(1)

    return JsonResponse([post.serialize() for post in posts], safe = False)

def get_post_count(request):
    posts = Posts.objects.all()
    return HttpResponse(len(posts))

def edit_post(request):
    text_value = str(request.GET.get("start"))
    post_id = str(request.GET.get("end"))
    post = Posts.objects.get(pk = post_id)
    post.content = text_value
    post.save()
    return HttpResponse()

def like_post(request):
    post_like = int(request.GET.get("like"))
    post_id = str(request.GET.get("id"))
    user_like = str(request.GET.get("user"))

    # Update the models
    try:
        check_likes = Liked_Posts.objects.get(post_id = post_id, liker = user_like)
    except Liked_Posts.DoesNotExist:
        check_likes = None

    if check_likes == None:
        liked_post = Liked_Posts(post_id = post_id, liker = user_like)
        liked_post.save()
        post = Posts.objects.get(pk = post_id)
        post.likes = post.likes + post_like
        post.save()
        heart = 1
    else:
        check_likes.delete()
        post = Posts.objects.get(pk = post_id)
        post.likes = post.likes - post_like
        post.save()
        heart = 0

    return JsonResponse(heart, safe=False)

def default_heart(request):
    post_id = str(request.GET.get("id"))
    user_like = str(request.GET.get("user"))

    # Update the models
    try:
        check_likes = Liked_Posts.objects.get(post_id = post_id, liker = user_like)
    except Liked_Posts.DoesNotExist:
        check_likes = None

    if check_likes == None:
        heart = 1
    else:
        heart = 0
    return JsonResponse(heart, safe=False)

def get_single_post(request):
    post_id = str(request.GET.get("post_id"))
    post = Posts.objects.get(pk = post_id)
    return JsonResponse(post.likes, safe=False)

def get_user_post_count(request):
    user = request.GET.get("user")
    posts = Posts.objects.all().filter(username__username = user)
    return HttpResponse(len(posts))
