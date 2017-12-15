from django.shortcuts import get_object_or_404
from rest_framework import viewsets, generics

from core.api.serializers import *




class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def get_queryset(self):
        return self.request.user.event_set.all() # limit query


class QuestionListCreate(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    filter_fields = ("answered",)

    def get_queryset(self):
        session_pk = self.kwargs.get("session_pk", None)
        if session_pk:
            session = get_object_or_404(Session, pk = session_pk)
            return session.question_set.all().order_by("-upvotes", "date_created")
        return []


    def list(self, request, *args, **kwargs):
        return super(QuestionListCreate, self).list(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(session = get_object_or_404(Session, pk=self.kwargs.get("session_pk", None)))



class QuestionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    lookup_url_kwarg = "question_pk"


    def destroy(self, request, *args, **kwargs):
        question = get_object_or_404(Question, pk = self.kwargs.get("question_pk", None))
        serializer = SenderIdSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        question.sender_id = serializer.validated_data['sender_id']
        question.save()
        return super(QuestionRetrieveUpdateDestroy, self).destroy(request, *args, **kwargs)

# class SessionViewSet(viewsets.ModelViewSet):
#     queryset = Session.objects.all()
#     serializer_class = SessionSerializer
#
#
# class QuestionViewSet(viewsets.ModelViewSet):
#     queryset = Question.objects.all()
#     serializer_class = QuestionSerializer
#
#
# class CommentViewSet(viewsets.ModelViewSet):
#     queryset = Comment.objects.all()
#     serializer_class = CommentSerializer
#
#
# class SpeakerViewSet(viewsets.ModelViewSet):
#     queryset = Speaker.objects.all()
#     serializer_class = SpeakerSerializer
