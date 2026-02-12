from django.test import TestCase, Client
from django.urls import reverse
from .models import Task
import json

# Create your tests here.

class TaskModelTest(TestCase):
    """Test cases for Task model"""
    
    def setUp(self):
        """Set up test data"""
        self.task = Task.objects.create(
            title="Test Task",
            description="Test Description",
            completed=False
        )
    
    def test_task_creation(self):
        """Test that a task can be created"""
        self.assertEqual(self.task.title, "Test Task")
        self.assertEqual(self.task.description, "Test Description")
        self.assertFalse(self.task.completed)
    
    def test_task_str(self):
        """Test the string representation of a task"""
        self.assertEqual(str(self.task), "Test Task")
    
    def test_task_ordering(self):
        """Test that tasks are ordered by creation date (newest first)"""
        task2 = Task.objects.create(title="Second Task")
        tasks = Task.objects.all()
        self.assertEqual(tasks[0], task2)
        self.assertEqual(tasks[1], self.task)


class TaskViewTest(TestCase):
    """Test cases for Task views"""
    
    def setUp(self):
        """Set up test client and data"""
        self.client = Client()
        self.task1 = Task.objects.create(
            title="Task 1",
            description="Description 1",
            completed=False
        )
        self.task2 = Task.objects.create(
            title="Task 2",
            description="Description 2",
            completed=True
        )
    
    def test_index_view(self):
        """Test the index view returns correct JSON"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('message', data)
        self.assertIn('endpoints', data)
    
    def test_task_list_view(self):
        """Test the task list view returns all tasks"""
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('tasks', data)
        self.assertEqual(len(data['tasks']), 2)
    
    def test_task_list_content(self):
        """Test the task list contains correct data"""
        response = self.client.get('/api/tasks/')
        data = json.loads(response.content)
        tasks = data['tasks']
        
        # Check first task (should be task2 due to ordering)
        self.assertEqual(tasks[0]['title'], 'Task 2')
        self.assertEqual(tasks[0]['completed'], True)
        
        # Check second task
        self.assertEqual(tasks[1]['title'], 'Task 1')
        self.assertEqual(tasks[1]['completed'], False)

