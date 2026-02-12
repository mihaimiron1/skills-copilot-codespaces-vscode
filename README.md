# Meal Train Application

A web-based meal train application that allows users to create and join meal trains.

## Features

- **User Authentication**: Simple username-based login system
- **Create Meal Trains**: Users can create meal trains with a name and list of ingredients
- **Browse Meal Trains**: View all available meal trains created by other users
- **Request to Join**: Users can request to join meal trains they're interested in
- **Approval System**: Meal train creators can approve or reject join requests
- **Data Persistence**: All data is stored in browser localStorage
- **Responsive Design**: Beautiful gradient UI that works on all devices

## How to Use

1. **Login**: Enter your username and click "Login"
2. **Create a Meal Train**: Fill in the meal name and ingredients (one per line), then click "Create Meal Train"
3. **Join a Meal Train**: Browse available meal trains and click "Request to Join"
4. **Manage Requests**: As a meal train creator, view pending join requests and approve or reject them

## Running the Application

Simply open `index.html` in a web browser, or serve it using a local web server:

```bash
python3 -m http.server 8080
```

Then navigate to `http://localhost:8080/index.html`

## Files

- `index.html` - Main HTML structure
- `styles.css` - Styling and responsive design
- `app.js` - Application logic and functionality

## Security

The application includes:
- XSS protection through DOM manipulation instead of innerHTML
- Secure ID generation to prevent collisions
- Input validation
