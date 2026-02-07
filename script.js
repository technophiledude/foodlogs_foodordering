// User data management
let currentUser = null;
let cart = [];

// Food items data
const foodItems = [
    {
        id: 1,
        title: "Cheeseburger",
        subtitle: "Wendy's Burger",
        rating: 4.9,
        basePrice: 8.24,
        screen: "product1Screen",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        title: "Hamburger",
        subtitle: "Veggie Burger",
        rating: 4.8,
        basePrice: 9.99,
        screen: "product2Screen",
        image: "images/veggie_burger.jpg"
    },
    {
        id: 3,
        title: "Hamburger",
        subtitle: "Chicken Burger",
        rating: 4.6,
        basePrice: 12.48,
        screen: "product3Screen",
        image: "images/chicken_burger.jpg"
    },
    {
        id: 4,
        title: "Fried Chicken Burger",
        subtitle: "Crispy & Savory",
        rating: 4.5,
        basePrice: 26.99,
        screen: "product4Screen",
        image: "images/fried_chicken_burger.jpg"
    },
    {
        id: 5,
        title: "Custom Burger",
        subtitle: "Build Your Own",
        rating: 5.0,
        basePrice: 16.49,
        screen: "product5Screen",
        image: "images/custom_burger.jpg"
    }
];

// Add this function after your other function declarations
async function submitOrderToAPI(orderData) {
    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        console.log('Order submitted to API:', result);
        return result;
    } catch (error) {
        console.error('Error submitting order:', error);
        return { success: false, message: 'Failed to submit order' };
    }
}

// DOM Elements
const splashScreen = document.getElementById('splashScreen');
const appContainer = document.getElementById('appContainer');
const homeScreen = document.getElementById('homeScreen');
const productDetailScreens = document.getElementById('productDetailScreens');
const paymentScreen = document.getElementById('paymentScreen');
const successPopup = document.getElementById('successPopup');
const profileScreen = document.getElementById('profileScreen');
const foodGrid = document.getElementById('foodGrid');
const cartModal = document.getElementById('cartModal');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartCount = document.getElementById('cartCount');
const cartSummary = document.getElementById('cartSummary');
const closeCartBtn = document.querySelector('.close-cart');
const continueShoppingBtn = document.getElementById('continueShopping');
const checkoutBtn = document.getElementById('checkoutBtn');

// Navigation elements
const homeIcon = document.getElementById('homeIcon');
const profileIcon = document.getElementById('profileIcon');
const cartIcon = document.getElementById('cartIcon');

// Initialize the app
function initApp() {
    // Show splash screen first
    setTimeout(() => {
        splashScreen.style.opacity = '0';
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            
            // Check if user is logged in
            const storedUser = localStorage.getItem('foodlogs_user');
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
                updateProfileDisplay();
                showScreen('homeScreen');
                appContainer.classList.remove('hidden');
                loadCart();
            } else {
                // Redirect to login page if not logged in
                window.location.href = 'login.html';
            }
        }, 500);
    }, 2000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Load food items
    loadFoodItems();
}

function setupEventListeners() {
    // Navigation
    homeIcon.addEventListener('click', () => showScreen('homeScreen'));
    profileIcon.addEventListener('click', () => {
        if (currentUser) {
            updateProfileDisplay();
            showScreen('profileScreen');
        }
    });
    cartIcon.addEventListener('click', () => showCartModal());
    
    // Cart Modal
    closeCartBtn.addEventListener('click', () => hideCartModal());
    continueShoppingBtn.addEventListener('click', () => hideCartModal());
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            hideCartModal();
            showScreen('paymentScreen');
            updatePaymentSummary();
        } else {
            alert('Your cart is empty!');
        }
    });
    
    // Close cart when clicking outside
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            hideCartModal();
        }
    });
    
    // Back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function() {
            const backTo = this.getAttribute('data-back');
            if (backTo === 'home') {
                showScreen('homeScreen');
            }
        });
    });
    
    // Payment button
    document.getElementById('payNowBtn')?.addEventListener('click', () => {
        showScreen('successPopup');
        // Clear cart after successful payment
        cart = [];
        saveCart();
        updateCartCount();
        renderCartItems();
    });
    
    // Success popup button
    document.getElementById('goBackBtn')?.addEventListener('click', () => {
        successPopup.classList.add('hidden');
        showScreen('homeScreen');
    });
    
    // Profile buttons
    editProfileBtn.addEventListener('click', handleEditProfile);
    logoutBtn.addEventListener('click', handleLogout);
    
    // Portion controls
    setupPortionControls();
    
    // Option buttons
    setupOptionButtons();
    
    // Toppings and sides selection
    setupToppingsAndSides();
    
    // Add to cart buttons
    setupAddToCartButtons();
    
    // Category tabs
    setupCategoryTabs();
}

function showScreen(screenId) {
    // Hide all screens
    homeScreen.classList.add('hidden');
    productDetailScreens.classList.add('hidden');
    paymentScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
    successPopup.classList.add('hidden');
    
    // Hide all product detail screens
    document.querySelectorAll('#productDetailScreens > div').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Show the requested screen
    switch(screenId) {
        case 'homeScreen':
            homeScreen.classList.remove('hidden');
            break;
        case 'paymentScreen':
            paymentScreen.classList.remove('hidden');
            break;
        case 'profileScreen':
            profileScreen.classList.remove('hidden');
            break;
        case 'successPopup':
            successPopup.classList.remove('hidden');
            break;
        default:
            if (screenId.startsWith('product')) {
                productDetailScreens.classList.remove('hidden');
                const screen = document.getElementById(screenId);
                if (screen) screen.classList.remove('hidden');
            }
    }
}

function showCartModal() {
    renderCartItems();
    cartModal.classList.remove('hidden');
}

function hideCartModal() {
    cartModal.classList.add('hidden');
}

function loadFoodItems() {
    foodGrid.innerHTML = '';
    
    foodItems.forEach(item => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.setAttribute('data-id', item.id);
        
        // Generate star rating
        let stars = '';
        const fullStars = Math.floor(item.rating);
        const hasHalfStar = item.rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Set food card content
        foodCard.innerHTML = `
            <div class="food-img">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="food-info">
                <div class="food-title">${item.title}</div>
                <div class="food-subtitle">${item.subtitle}</div>
                <div class="food-rating">
                    ${stars} ${item.rating}
                </div>
                <div class="food-price">$${item.basePrice.toFixed(2)}</div>
            </div>
        `;
        
        // Add click event to show product detail
        foodCard.addEventListener('click', () => {
            showScreen(item.screen);
        });
        
        foodGrid.appendChild(foodCard);
    });
}

function updateProfileDisplay() {
    if (currentUser) {
        profileUserName.textContent = currentUser.name;
        profileName.textContent = currentUser.name;
        profileEmail.textContent = currentUser.email;
        profileAddress.textContent = currentUser.address;
    }
}

function handleEditProfile() {
    const newName = prompt('Enter new name:', currentUser.name);
    if (newName && newName.trim() !== '') {
        currentUser.name = newName.trim();
        localStorage.setItem('foodlogs_user', JSON.stringify(currentUser));
        updateProfileDisplay();
        alert('Profile updated successfully!');
    }
    
    const newAddress = prompt('Enter new delivery address:', currentUser.address);
    if (newAddress && newAddress.trim() !== '') {
        currentUser.address = newAddress.trim();
        localStorage.setItem('foodlogs_user', JSON.stringify(currentUser));
        updateProfileDisplay();
        alert('Address updated successfully!');
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('foodlogs_user');
        window.location.href = 'login.html';
    }
}

// CART FUNCTIONS
function loadCart() {
    const savedCart = localStorage.getItem('foodlogs_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem('foodlogs_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function addToCart(productId, productName, basePrice, portion, spiciness = 'Mild', toppings = [], sides = []) {
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && 
        item.spiciness === spiciness &&
        JSON.stringify(item.toppings) === JSON.stringify(toppings) &&
        JSON.stringify(item.sides) === JSON.stringify(sides)
    );
    
    if (existingItemIndex !== -1) {
        // Update quantity of existing item
        cart[existingItemIndex].quantity += portion;
        cart[existingItemIndex].totalPrice = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
    } else {
        // Add new item to cart
        const itemPrice = calculateItemPrice(productId, basePrice, portion, toppings, sides);
        cart.push({
            id: productId,
            name: productName,
            price: itemPrice / portion, // Price per unit
            quantity: portion,
            totalPrice: itemPrice,
            spiciness: spiciness,
            toppings: toppings,
            sides: sides
        });
    }
    
    saveCart();
    updateCartCount();
    renderCartItems();
    
    // Show confirmation
    const priceElement = document.getElementById(`product${productId}Price`);
    if (priceElement) {
        priceElement.classList.add('price-updated');
        setTimeout(() => {
            priceElement.classList.remove('price-updated');
        }, 300);
    }
    
    // Close product detail screen and go back to home
    showScreen('homeScreen');
    
    // Show confirmation message
    alert(`${productName} added to cart!`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateCartItemQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    
    cart[index].quantity = newQuantity;
    cart[index].totalPrice = cart[index].price * newQuantity;
    saveCart();
    updateCartCount();
    renderCartItems();
}

function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartSummary.classList.add('hidden');
        return;
    }
    
    let cartHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        subtotal += item.totalPrice;
        
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-header">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <div class="cart-item-price">$${item.totalPrice.toFixed(2)}</div>
                </div>
                <div class="cart-item-details">
                    <p>Spiciness: ${item.spiciness}</p>
                    <p>Quantity: ${item.quantity}</p>
                    ${item.toppings.length > 0 ? `<p>Toppings: ${item.toppings.join(', ')}</p>` : ''}
                    ${item.sides.length > 0 ? `<p>Sides: ${item.sides.join(', ')}</p>` : ''}
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="cart-item-quantity-btn" onclick="updateCartItemQuantity(${index}, ${item.quantity - 1})">-</button>
                        <span class="cart-item-quantity-value">${item.quantity}</span>
                        <button class="cart-item-quantity-btn" onclick="updateCartItemQuantity(${index}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = cartHTML;
    cartSummary.classList.remove('hidden');
    
    // Calculate totals
    const tax = subtotal * 0.05; // 5% tax
    const deliveryFee = 1.50;
    const total = subtotal + tax + deliveryFee;
    
    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('cartDelivery').textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
}

// DYNAMIC PRICING FUNCTIONS
function setupPortionControls() {
    // Setup portion controls for all products
    for (let i = 1; i <= 5; i++) {
        const decreaseBtn = document.getElementById(`decreasePortion${i}`);
        const increaseBtn = document.getElementById(`increasePortion${i}`);
        const portionValue = document.getElementById(`portionValue${i}`);
        const priceElement = document.getElementById(`product${i}Price`);
        
        if (decreaseBtn && increaseBtn && portionValue && priceElement) {
            decreaseBtn.addEventListener('click', () => {
                let value = parseInt(portionValue.textContent);
                if (value > 1) {
                    portionValue.textContent = value - 1;
                    updateProductPrice(i);
                }
            });
            
            increaseBtn.addEventListener('click', () => {
                let value = parseInt(portionValue.textContent);
                portionValue.textContent = value + 1;
                updateProductPrice(i);
            });
            
            // Initial price calculation
            updateProductPrice(i);
        }
    }
}

function updateProductPrice(productId) {
    const portionValue = document.getElementById(`portionValue${productId}`);
    const priceElement = document.getElementById(`product${productId}Price`);
    
    if (!portionValue || !priceElement) return;
    
    const portion = parseInt(portionValue.textContent);
    const basePrice = parseFloat(priceElement.getAttribute('data-base-price') || foodItems.find(item => item.id === productId)?.basePrice || 0);
    
    let totalPrice = basePrice * portion;
    
    // For custom burger, include toppings and sides
    if (productId === 5) {
        const toppingsCount = document.querySelectorAll('.topping-item.active').length;
        const sidesCount = document.querySelectorAll('.side-item.active').length;
        totalPrice += (toppingsCount * 0.5 * portion) + (sidesCount * 1.5 * portion);
    }
    
    priceElement.textContent = `$${totalPrice.toFixed(2)}`;
    priceElement.classList.add('price-updated');
    setTimeout(() => {
        priceElement.classList.remove('price-updated');
    }, 300);
}

function calculateItemPrice(productId, basePrice, portion, toppings = [], sides = []) {
    let price = basePrice * portion;
    
    if (productId === 5) {
        price += (toppings.length * 0.5 * portion) + (sides.length * 1.5 * portion);
    }
    
    return price;
}

function setupOptionButtons() {
    // Setup option buttons for all products
    document.querySelectorAll('.option-buttons').forEach(container => {
        const buttons = container.querySelectorAll('.option-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons in this group
                buttons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
            });
        });
    });
}

function setupToppingsAndSides() {
    // Toppings selection
    document.querySelectorAll('.topping-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('active');
            updateProductPrice(5); // Update price for custom burger
        });
    });
    
    // Sides selection
    document.querySelectorAll('.side-item').forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('active');
            updateProductPrice(5); // Update price for custom burger
        });
    });
}

function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            const productName = this.getAttribute('data-product-name');
            const basePrice = parseFloat(this.getAttribute('data-base-price'));
            const portion = parseInt(document.getElementById(`portionValue${productId}`).textContent);
            
            // Get selected spiciness
            const spicinessElement = document.querySelector(`#product${productId}Screen .option-btn.active`);
            const spiciness = spicinessElement ? spicinessElement.textContent : 'Mild';
            
            // Get selected toppings and sides for custom burger
            let toppings = [];
            let sides = [];
            
            if (productId === 5) {
                toppings = Array.from(document.querySelectorAll('.topping-item.active'))
                    .map(item => item.textContent);
                sides = Array.from(document.querySelectorAll('.side-item.active'))
                    .map(item => item.textContent);
            }
            
            addToCart(productId, productName, basePrice, portion, spiciness, toppings, sides);
        });
    });
}

function updatePaymentSummary() {
    // Calculate cart total
    const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);
    const tax = subtotal * 0.05; // 5% tax
    const deliveryFee = 1.50;
    const total = subtotal + tax + deliveryFee;
    
    document.getElementById('orderSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('orderTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('paymentTotal').textContent = `$${total.toFixed(2)}`;
}

function setupCategoryTabs() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Filter food items based on category (simplified)
            const category = this.textContent;
            // In a real app, this would filter the food items
            // For now, we'll just show all items
            loadFoodItems();
        });
    });
}

// Make functions available globally for inline onclick handlers
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;

// Initialize the app when page loads

document.addEventListener('DOMContentLoaded', initApp);
