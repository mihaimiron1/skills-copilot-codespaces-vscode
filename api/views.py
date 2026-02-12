from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Task

# Create your views here.

def index(request):
    """Home page view"""
    return JsonResponse({
        'message': 'Welcome to the Django Backend API',
        'endpoints': {
            'tasks': '/api/tasks/',
            'admin': '/admin/',
        }
    })

@require_http_methods(["GET"])
def task_list(request):
    """List all tasks"""
    tasks = Task.objects.all()
    data = [{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'completed': task.completed,
        'created_at': task.created_at.isoformat(),
        'updated_at': task.updated_at.isoformat(),
    } for task in tasks]
    return JsonResponse({'tasks': data})

