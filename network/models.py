from tkinter import CASCADE, Widget
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Posts(models.Model):
    username = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    content = models.CharField(max_length=1000)
    time = models.DateTimeField()
    likes = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username.username,
            "content": self.content,
            "time": self.time,
            "likes": self.likes
        }

class Followers(models.Model):
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")

    def serialize(self):
        return {
            "id": self.id,
            "following": self.following.username,
            "follower": self.follower.username
        }

class Liked_Posts(models.Model):
    post_id = models.IntegerField()
    liker = models.CharField(max_length=100)

    def serialize(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "liker": self.liker
        }