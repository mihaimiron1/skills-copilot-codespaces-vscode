// Data structures
let currentUser = null;
let mealTrains = [];
let joinRequests = [];
let idCounter = Date.now();

// Utility function to escape HTML and prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Generate unique ID
function generateId() {
    return idCounter++;
}

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
        alert('Username cannot be empty. Please enter a valid username.');
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
        id: generateId(),
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
    
    mealsList.innerHTML = '';
    otherMeals.forEach(meal => {
        const userRequest = joinRequests.find(
            req => req.mealId === meal.id && req.username === currentUser
        );
        
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        
        const title = document.createElement('h3');
        title.textContent = meal.name;
        mealCard.appendChild(title);
        
        const creator = document.createElement('div');
        creator.className = 'creator';
        creator.textContent = `Created by: ${meal.creator}`;
        mealCard.appendChild(creator);
        
        const ingredientsSection = document.createElement('div');
        ingredientsSection.className = 'ingredients';
        const ingredientsTitle = document.createElement('h4');
        ingredientsTitle.textContent = 'Ingredients:';
        ingredientsSection.appendChild(ingredientsTitle);
        const ingredientsList = document.createElement('ul');
        meal.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing;
            ingredientsList.appendChild(li);
        });
        ingredientsSection.appendChild(ingredientsList);
        mealCard.appendChild(ingredientsSection);
        
        const membersSection = document.createElement('div');
        membersSection.className = 'members';
        const membersTitle = document.createElement('h4');
        membersTitle.textContent = `Members (${meal.members.length}):`;
        membersSection.appendChild(membersTitle);
        const membersList = document.createElement('ul');
        meal.members.forEach(member => {
            const li = document.createElement('li');
            li.textContent = `👤 ${member}`;
            membersList.appendChild(li);
        });
        membersSection.appendChild(membersList);
        mealCard.appendChild(membersSection);
        
        const actionsSection = document.createElement('div');
        actionsSection.className = 'actions';
        
        if (!userRequest) {
            const joinBtn = document.createElement('button');
            joinBtn.className = 'join-btn';
            joinBtn.textContent = 'Request to Join';
            joinBtn.addEventListener('click', () => requestToJoin(meal.id));
            actionsSection.appendChild(joinBtn);
        } else if (userRequest.status === 'pending') {
            const joinBtn = document.createElement('button');
            joinBtn.className = 'join-btn';
            joinBtn.textContent = 'Request Pending';
            joinBtn.disabled = true;
            actionsSection.appendChild(joinBtn);
        } else if (userRequest.status === 'approved') {
            const badge = document.createElement('span');
            badge.className = 'status-badge status-approved';
            badge.textContent = 'Joined';
            actionsSection.appendChild(badge);
        } else if (userRequest.status === 'rejected') {
            const badge = document.createElement('span');
            badge.className = 'status-badge status-rejected';
            badge.textContent = 'Request Rejected';
            actionsSection.appendChild(badge);
        }
        
        mealCard.appendChild(actionsSection);
        mealsList.appendChild(mealCard);
    });
}

// Render user's own meal trains
function renderMyMeals() {
    const myMealsList = document.getElementById('myMealsList');
    const myMeals = mealTrains.filter(meal => meal.creator === currentUser);
    
    if (myMeals.length === 0) {
        myMealsList.innerHTML = '<div class="empty-message">You haven\'t created any meal trains yet.</div>';
        return;
    }
    
    myMealsList.innerHTML = '';
    myMeals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.className = 'meal-card';
        
        const title = document.createElement('h3');
        title.textContent = meal.name;
        mealCard.appendChild(title);
        
        const ingredientsSection = document.createElement('div');
        ingredientsSection.className = 'ingredients';
        const ingredientsTitle = document.createElement('h4');
        ingredientsTitle.textContent = 'Ingredients:';
        ingredientsSection.appendChild(ingredientsTitle);
        const ingredientsList = document.createElement('ul');
        meal.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing;
            ingredientsList.appendChild(li);
        });
        ingredientsSection.appendChild(ingredientsList);
        mealCard.appendChild(ingredientsSection);
        
        const membersSection = document.createElement('div');
        membersSection.className = 'members';
        const membersTitle = document.createElement('h4');
        membersTitle.textContent = `Members (${meal.members.length}):`;
        membersSection.appendChild(membersTitle);
        const membersList = document.createElement('ul');
        meal.members.forEach(member => {
            const li = document.createElement('li');
            li.textContent = `👤 ${member}`;
            membersList.appendChild(li);
        });
        membersSection.appendChild(membersList);
        mealCard.appendChild(membersSection);
        
        myMealsList.appendChild(mealCard);
    });
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
    
    requestsList.innerHTML = '';
    pendingRequests.forEach(request => {
        const meal = mealTrains.find(m => m.id === request.mealId);
        
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        
        const requestInfo = document.createElement('div');
        requestInfo.className = 'request-info';
        
        const usernameStrong = document.createElement('strong');
        usernameStrong.textContent = request.username;
        requestInfo.appendChild(usernameStrong);
        
        requestInfo.appendChild(document.createTextNode(' wants to join '));
        
        const mealNameStrong = document.createElement('strong');
        mealNameStrong.textContent = meal.name;
        requestInfo.appendChild(mealNameStrong);
        
        requestCard.appendChild(requestInfo);
        
        const actionsSection = document.createElement('div');
        actionsSection.className = 'actions';
        
        const approveBtn = document.createElement('button');
        approveBtn.className = 'approve-btn';
        approveBtn.textContent = 'Approve';
        approveBtn.addEventListener('click', () => approveRequest(request.id));
        actionsSection.appendChild(approveBtn);
        
        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'reject-btn';
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click', () => rejectRequest(request.id));
        actionsSection.appendChild(rejectBtn);
        
        requestCard.appendChild(actionsSection);
        requestsList.appendChild(requestCard);
    });
}

// Request to join a meal train
function requestToJoin(mealId) {
    const newRequest = {
        id: generateId(),
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
