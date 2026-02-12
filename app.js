// Data structures
let currentUser = null;
let mealTrains = [];
let joinRequests = [];

// Load data from localStorage
function loadData() {
    const savedMeals = localStorage.getItem('mealTrains');
    const savedRequests = localStorage.getItem('joinRequests');
    
    if (savedMeals) {
        mealTrains = JSON.parse(savedMeals);
    }
    
    if (savedRequests) {
        joinRequests = JSON.parse(savedRequests);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('mealTrains', JSON.stringify(mealTrains));
    localStorage.setItem('joinRequests', JSON.stringify(joinRequests));
}

// Initialize app
function init() {
    loadData();
    
    // Event listeners
    document.getElementById('loginBtn').addEventListener('click', login);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('createMealForm').addEventListener('submit', createMealTrain);
    
    // Check if user was logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showLoggedInView();
    }
}

// Login function
function login() {
    const username = document.getElementById('usernameInput').value.trim();
    
    if (username === '') {
        alert('Please enter a username');
        return;
    }
    
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    showLoggedInView();
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoggedOutView();
}

// Show logged in view
function showLoggedInView() {
    document.getElementById('userSection').style.display = 'none';
    document.getElementById('loggedInSection').style.display = 'flex';
    document.getElementById('currentUser').textContent = `Welcome, ${currentUser}!`;
    
    document.getElementById('createSection').style.display = 'block';
    document.getElementById('mealsSection').style.display = 'block';
    document.getElementById('myMealsSection').style.display = 'block';
    document.getElementById('requestsSection').style.display = 'block';
    
    renderMeals();
    renderMyMeals();
    renderRequests();
}

// Show logged out view
function showLoggedOutView() {
    document.getElementById('userSection').style.display = 'flex';
    document.getElementById('loggedInSection').style.display = 'none';
    document.getElementById('usernameInput').value = '';
    
    document.getElementById('createSection').style.display = 'none';
    document.getElementById('mealsSection').style.display = 'none';
    document.getElementById('myMealsSection').style.display = 'none';
    document.getElementById('requestsSection').style.display = 'none';
}

// Create meal train
function createMealTrain(e) {
    e.preventDefault();
    
    const mealName = document.getElementById('mealName').value.trim();
    const ingredientsText = document.getElementById('ingredients').value.trim();
    
    const ingredients = ingredientsText.split('\n').filter(i => i.trim() !== '');
    
    const newMeal = {
        id: Date.now(),
        name: mealName,
        ingredients: ingredients,
        creator: currentUser,
        members: [currentUser],
        createdAt: new Date().toISOString()
    };
    
    mealTrains.push(newMeal);
    saveData();
    
    // Reset form
    document.getElementById('createMealForm').reset();
    
    // Refresh displays
    renderMeals();
    renderMyMeals();
    
    alert('Meal train created successfully!');
}

// Render all meal trains (except user's own)
function renderMeals() {
    const mealsList = document.getElementById('mealsList');
    const otherMeals = mealTrains.filter(meal => meal.creator !== currentUser);
    
    if (otherMeals.length === 0) {
        mealsList.innerHTML = '<div class="empty-message">No meal trains available yet. Check back later!</div>';
        return;
    }
    
    mealsList.innerHTML = otherMeals.map(meal => {
        const userRequest = joinRequests.find(
            req => req.mealId === meal.id && req.username === currentUser
        );
        
        let joinButtonHTML = '';
        if (!userRequest) {
            joinButtonHTML = `<button class="join-btn" onclick="requestToJoin(${meal.id})">Request to Join</button>`;
        } else if (userRequest.status === 'pending') {
            joinButtonHTML = `<button class="join-btn" disabled>Request Pending</button>`;
        } else if (userRequest.status === 'approved') {
            joinButtonHTML = `<span class="status-badge status-approved">Joined</span>`;
        } else if (userRequest.status === 'rejected') {
            joinButtonHTML = `<span class="status-badge status-rejected">Request Rejected</span>`;
        }
        
        return `
            <div class="meal-card">
                <h3>${meal.name}</h3>
                <div class="creator">Created by: ${meal.creator}</div>
                <div class="ingredients">
                    <h4>Ingredients:</h4>
                    <ul>
                        ${meal.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
                <div class="members">
                    <h4>Members (${meal.members.length}):</h4>
                    <ul>
                        ${meal.members.map(member => `<li>👤 ${member}</li>`).join('')}
                    </ul>
                </div>
                <div class="actions">
                    ${joinButtonHTML}
                </div>
            </div>
        `;
    }).join('');
}

// Render user's own meal trains
function renderMyMeals() {
    const myMealsList = document.getElementById('myMealsList');
    const myMeals = mealTrains.filter(meal => meal.creator === currentUser);
    
    if (myMeals.length === 0) {
        myMealsList.innerHTML = '<div class="empty-message">You haven\'t created any meal trains yet.</div>';
        return;
    }
    
    myMealsList.innerHTML = myMeals.map(meal => {
        return `
            <div class="meal-card">
                <h3>${meal.name}</h3>
                <div class="ingredients">
                    <h4>Ingredients:</h4>
                    <ul>
                        ${meal.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
                <div class="members">
                    <h4>Members (${meal.members.length}):</h4>
                    <ul>
                        ${meal.members.map(member => `<li>👤 ${member}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }).join('');
}

// Render pending requests for user's meal trains
function renderRequests() {
    const requestsList = document.getElementById('requestsList');
    const myMealIds = mealTrains
        .filter(meal => meal.creator === currentUser)
        .map(meal => meal.id);
    
    const pendingRequests = joinRequests.filter(
        req => myMealIds.includes(req.mealId) && req.status === 'pending'
    );
    
    if (pendingRequests.length === 0) {
        requestsList.innerHTML = '<div class="empty-message">No pending join requests.</div>';
        return;
    }
    
    requestsList.innerHTML = pendingRequests.map(request => {
        const meal = mealTrains.find(m => m.id === request.mealId);
        
        return `
            <div class="request-card">
                <div class="request-info">
                    <strong>${request.username}</strong> wants to join <strong>${meal.name}</strong>
                </div>
                <div class="actions">
                    <button class="approve-btn" onclick="approveRequest(${request.id})">Approve</button>
                    <button class="reject-btn" onclick="rejectRequest(${request.id})">Reject</button>
                </div>
            </div>
        `;
    }).join('');
}

// Request to join a meal train
function requestToJoin(mealId) {
    const newRequest = {
        id: Date.now(),
        mealId: mealId,
        username: currentUser,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    joinRequests.push(newRequest);
    saveData();
    
    renderMeals();
    alert('Join request sent!');
}

// Approve a join request
function approveRequest(requestId) {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;
    
    request.status = 'approved';
    
    // Add user to meal members
    const meal = mealTrains.find(m => m.id === request.mealId);
    if (meal && !meal.members.includes(request.username)) {
        meal.members.push(request.username);
    }
    
    saveData();
    
    renderMeals();
    renderMyMeals();
    renderRequests();
    
    alert(`${request.username} has been approved to join!`);
}

// Reject a join request
function rejectRequest(requestId) {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;
    
    request.status = 'rejected';
    
    saveData();
    
    renderMeals();
    renderRequests();
    
    alert(`Join request from ${request.username} has been rejected.`);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
