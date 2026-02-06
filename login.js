// DOM Elements
const splashScreen = document.getElementById('splashScreen');
const authScreen = document.getElementById('authScreen');
const signinTab = document.getElementById('signinTab');
const signupTab = document.getElementById('signupTab');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const switchToSignup = document.getElementById('switchToSignup');
const switchToSignin = document.getElementById('switchToSignin');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');

// Initialize the login page
function initLoginPage() {
    // Show splash screen first
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            authScreen.classList.remove('hidden');
            
            // Check if user is already logged in
            const storedUser = localStorage.getItem('foodlogs_user');
            if (storedUser) {
                // Redirect to main app
                window.location.href = 'index.html';
            }
        }, 500);
    }, 2000);
    
    // Setup event listeners
    setupLoginEventListeners();
    
    // Initialize demo users if needed
    initDemoUsers();
}

function setupLoginEventListeners() {
    // Auth tab switching
    signinTab.addEventListener('click', () => switchAuthTab('signin'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));
    switchToSignup.addEventListener('click', () => switchAuthTab('signup'));
    switchToSignin.addEventListener('click', () => switchAuthTab('signin'));
    
    // Auth buttons
    loginBtn.addEventListener('click', handleLogin);
    signupBtn.addEventListener('click', handleSignup);
    
    // Enter key support
    document.getElementById('loginEmail')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    
    document.getElementById('signupName')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
    
    document.getElementById('signupEmail')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
    
    document.getElementById('signupPassword')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
    
    document.getElementById('signupAddress')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup();
    });
}

function switchAuthTab(tab) {
    if (tab === 'signin') {
        signinTab.classList.add('active');
        signupTab.classList.remove('active');
        signinForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        signupTab.classList.add('active');
        signinTab.classList.remove('active');
        signupForm.classList.add('active');
        signinForm.classList.remove('active');
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    // Simple validation
    if (!email || !password) {
        showError('login', 'Please fill in all fields');
        return;
    }
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('foodlogs_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Remove password from user object before storing
        const {password, ...userWithoutPassword} = user;
        localStorage.setItem('foodlogs_user', JSON.stringify(userWithoutPassword));
        
        // Redirect to main app
        window.location.href = 'index.html';
    } else {
        showError('login', 'Invalid email or password');
    }
}

function handleSignup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const address = document.getElementById('signupAddress').value.trim();
    
    // Validation
    if (!name || !email || !password || !address) {
        showError('signup', 'Please fill in all fields');
        return;
    }
    
    if (password.length < 6) {
        showError('signup', 'Password must be at least 6 characters');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('signup', 'Please enter a valid email address');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('foodlogs_users') || '[]');
    if (users.some(u => u.email === email)) {
        showError('signup', 'User with this email already exists');
        return;
    }
    
    // Create new user
    const newUser = {
        name,
        email,
        password,
        address
    };
    
    users.push(newUser);
    localStorage.setItem('foodlogs_users', JSON.stringify(users));
    
    // Remove password from user object before storing
    const {password: pwd, ...userWithoutPassword} = newUser;
    localStorage.setItem('foodlogs_user', JSON.stringify(userWithoutPassword));
    
    alert('Account created successfully!');
    window.location.href = 'index.html';
}

function showError(formType, message) {
    // In a real app, you'd show error messages near the form fields
    alert(message);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function initDemoUsers() {
    // Initialize demo users if none exist
    if (!localStorage.getItem('foodlogs_users')) {
        const demoUsers = [
            {
                name: "Min",
                email: "Min@gmail.com",
                password: "password123",
                address: "street 123, barcelona"
            },
            {
                name: "Alex Johnson",
                email: "alex@example.com",
                password: "demo123",
                address: "456 Oak Avenue, New York"
            }
        ];
        localStorage.setItem('foodlogs_users', JSON.stringify(demoUsers));
    }
}

// Initialize the login page when DOM is loaded
document.addEventListener('DOMContentLoaded', initLoginPage);