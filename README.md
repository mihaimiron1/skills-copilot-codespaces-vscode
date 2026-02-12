# skills-copilot-codespaces-vscode

Django Backend Application

## Setup Instructions

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

4. Run the development server:
```bash
python manage.py runserver
```

## API Endpoints

- `/` - Home page with API information
- `/api/tasks/` - List all tasks (GET)
- `/admin/` - Django admin interface

## Features

- Django 4.2 backend
- SQLite database
- Task management API
- Django admin interface
- RESTful API endpoints

