from rest_framework import serializers
from core.models import *



"""  Serializers are like forms: they convert json data to python and python data to json!   """


class EventSerializer(serializers.ModelSerializer):

    owner = serializers.HiddenField(default=serializers.CurrentUserDefault()) # this is automatically set to user
    api_url = serializers.HyperlinkedIdentityField(view_name='core:api:event-detail')
    html_url = serializers.HyperlinkedIdentityField(view_name='dashboard:event-detail-html')

    class Meta:
        model = Event
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class SenderIdSerializer(serializers.Serializer):
        sender_id = serializers.CharField(required=True, max_length=2048)




# class SessionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Session
#         fields = '__all__'
#
#
#
#


#
# class CommentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Comment
#         fields = '__all__'
#
#
#
#
# class SpeakerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Speaker
#         fields = '__all__'


