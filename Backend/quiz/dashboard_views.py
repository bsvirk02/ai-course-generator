# dashboard_views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Group
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def group_progress(request):
    user = request.user

    # Get all groups the user is a member of
    user_groups = user.group_course.all()

    group_data = []
    for group in user_groups:
        progress = group.get_group_progress()  # Get the group's progress
        group_data.append({
            'group_name': group.name,
            'group_progress': round(progress, 2)  # Round the progress for clarity
        })

    return Response({
        'group_progress': group_data
    })
