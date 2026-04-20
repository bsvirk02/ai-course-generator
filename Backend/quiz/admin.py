from django.contrib import admin
from .models import User, Quiz, Answer, Question, Course

# Register your models here.
admin.site.register(User)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(Quiz)
admin.site.register(Course)
