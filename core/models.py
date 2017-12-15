from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import EmailValidator, MinValueValidator
from django.utils.translation import gettext_lazy as _

# **** Each class represents a table in the Relation SQL-Queried backend database ***** #



''' custom user model for later extensibility '''

# Username will be validated as an email
username_validator = EmailValidator()

class User(AbstractUser):

    # same username as AbstractUser - but the validator is an email validator
    username = models.CharField(
        _('username'),
        max_length=150,
        unique=True,
        help_text=_('Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'),
        validators=[username_validator],
        error_messages={
            'unique': _("A user with that username already exists."),
        },
    )



# Events are disjoint scenarios that the user will need to this application
class Event(models.Model):
    name = models.CharField(max_length = 1024)
    
    date_created = models.DateField(auto_now_add = True)
    
    description = models.TextField()
    
    location = models.CharField(max_length = 2048)
    
    owner = models.ForeignKey(User)
    
    event_type = models.CharField(max_length = 1024)
    
    start_date = models.DateField()
    
    end_date = models.DateField()
    
    is_open = models.BooleanField()
    
    time_zone = models.CharField(max_length = 1024) # to allow for users accross the globe
    
    passcode = models.CharField(max_length = 100, unique = True) # how audience will access the event
    
    def get_duration(self):
        return self.end_date - self.start_date
    
    def __str__(self):
        return self.name
    
       
    
# Each session is an instance of a QandA
class Session(models.Model):
    name = models.CharField(max_length = 1024)
    
    event = models.ForeignKey(Event)
    
    description = models.TextField(default = "")
    
    location = models.CharField(max_length = 2048)

    date_created = models.DateField(auto_now_add=True)
    
    allow_anonymous = models.BooleanField(default = False)
    
    allow_comments = models.BooleanField(default = False)
    
    

class Question(models.Model):
    content = models.TextField()
    
    session  = models.ForeignKey(Session, null = True)
    
    date_created = models.DateTimeField(auto_now_add = True)
    
    questioner = models.ForeignKey(User, null = True, blank = True) # allow for anonymous questions
    
    is_anonymous = models.BooleanField(default = True)
    
    upvotes = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    
    downvotes = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])

    sender_id = models.CharField(max_length=2046, default = "")

    answered = models.BooleanField(default=False)
    
    def net_votes(self):
        return self.upvotes - self.downvotes

    def save(self, **kwargs):
        # this needs to be abstracted away into an abstract models class
        if type(self).objects.filter(pk = self.pk).exists():
            self.original_object = type(self).objects.get(pk = self.pk)
        else:
            self.original_object = None
        super(Question, self).save(**kwargs)
    

class Comment(models.Model):
    content = models.TextField()
    
    question = models.ForeignKey(Question)
    
    date_created = models.DateTimeField(auto_now_add = True)
    
    commenter = models.ForeignKey(User, blank = True, null = True)
    
    upvotes = models.PositiveIntegerField()
    
    downvotes = models.PositiveIntegerField()
    
    def net_votes(self):
        return self.upvotes - self.downvotes
    


    
class Speaker(models.Model):
    name = models.CharField(max_length = 256)
    
    session = models.ForeignKey(Session)
    
    title = models.CharField(max_length = 512)
    
    company = models.CharField(max_length = 512)
    
    bio = models.TextField()
    
    

''' ********************************  SIGNALS  ******************************************   '''

# a seperate signals.py file requires us to import it early in the app's startup - pain.

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import json
import ably

from .models import *
from core.api.serializers import QuestionSerializer

@receiver(post_save, sender=Event)
def create_event_main_session(sender, instance, created, **kwargs):
    if created:
        Session.objects.create(event=instance, name = instance.name)



"""

Channel names format: same as api urls but forward slashes replaced with dashes
NOTE: all detail operations are merged with LIST operations - there is only one channel
endpoint for all operations on an object. Listed below

Receiving creations/updates from Questions: "session-<session_pk>-questions"
...
...



"""

@receiver(post_save, sender=Question)
def send_new_question(sender, instance, created, **kwargs):
    orig = instance.original_object
    # Get channel based on API endpoint
    rest = ably.AblyRest('1Y5S8g.dbCwWg:rUcb_d26MjLV0giu')
    channel = rest.channels.get('session-%d-questions' % instance.session.pk)
    if created:
        channel.publish('create', json.dumps(QuestionSerializer(instance).data))
    else:
        if orig and \
                (orig.content != instance.content or
                 orig.upvotes != instance.upvotes or
                 orig.answered != instance.answered):
            channel.publish("update", json.dumps(QuestionSerializer(instance).data))

@receiver(post_delete, sender=Question)
def send_delete_question(sender, instance,**kwargs):
    rest = ably.AblyRest('1Y5S8g.dbCwWg:rUcb_d26MjLV0giu')
    channel = rest.channels.get('session-%d-questions' % instance.session.pk)
    channel.publish('delete', json.dumps(QuestionSerializer(instance).data))
    
    
    