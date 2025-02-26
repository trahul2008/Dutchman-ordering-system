/* ========================
   GLOBAL VARIABLES
   ======================== */
   let currentOrder = [];
   let allBeverages = []; // 改为全局变量
   
   /* ========================
      INITIALIZATION
      ======================== */
   $(document).ready(() => {
     // 优先加载英文数据
     loadBeveragesFile(() => {
       initializeApplication();
       displayMenu();
     }, true); // 强制英文优先
   });
   
   function initializeApplication() {
     if(!localStorage.getItem("selectedLanguage")) {
       localStorage.setItem("selectedLanguage", "en");
     }
     
     bindEventListeners();
     checkLoginStatus();
   }
   
   /* ========================
      DATA MANAGEMENT (关键修改)
      ======================== */
   function loadBeveragesFile(callback, forceEnglish = false) {
     const lang = forceEnglish ? 'en' : localStorage.getItem("selectedLanguage") || "en";
     const filename = lang === "sv" ? "Beverages.js" : "Beverages_eng.js";
     const url = `js/${filename}?v=${Date.now()}`;
   
     // 使用Promise保证加载顺序
     new Promise((resolve, reject) => {
       $.getJSON(url)
         .done(data => {
           const rawData = data.DB2 || data;
           // 数据标准化
           allBeverages = rawData.map(item => ({
             id: item.nr,
             name: item.name || item.namn || "Unnamed Drink",
             price: parseFloat(item.priceinclvat || item.prisinklmoms) || 0,
             category: item.category || item.varugrupp || "Other",
             // 其他字段转换...
           }));
           resolve();
         })
         .fail((jqxhr, textStatus, error) => {
           console.error("Data load failed:", error);
           if(lang !== 'en' && !forceEnglish) {
             console.log("Fallback to English version");
             loadBeveragesFile(callback, true); // 强制回退到英文
           } else {
             alert("无法加载菜单数据");
             reject();
           }
         });
     }).then(callback);
   }
   
   /* ========================
      MENU RENDERING (优化显示)
      ======================== */
   function displayMenu() {
     const $menuContainer = $("#menuItems").empty();
     
     // 按分类分组
     const categorized = allBeverages.reduce((acc, item) => {
       acc[item.category] = acc[item.category] || [];
       acc[item.category].push(item);
       return acc;
     }, {});
   
     Object.entries(categorized).forEach(([category, items]) => {
       $menuContainer.append(`<h3 class="category-title">${category}</h3>`);
       
       items.forEach(item => {
         $menuContainer.append(`
           <div class="menu-item">
             <div class="item-info">
               <div class="item-name">${item.name}</div>
               <div class="item-price">$${item.price.toFixed(2)}</div>
             </div>
             <button class="add-btn" 
                     data-item='${JSON.stringify(item)}'>
               ➕
             </button>
           </div>
         `);
       });
     });
   }
   
   /* ========================
      EVENT HANDLERS (安全绑定)
      ======================== */
   function bindEventListeners() {
     // 使用事件委托处理动态元素
     $("#menuItems").on('click', '.add-btn', function() {
       const itemData = $(this).data('item');
       addToOrder(itemData);
     });
   
     // 其他事件绑定保持不变...
     $("#loginBtn").click(login);
     // ...其余事件绑定
   }
   
   /* ========================
      MENU RENDERING (优化显示)
      ======================== */
   function displayMenu() {
     const $menuContainer = $("#menuItems").empty();
     
     // 按分类分组
     const categorized = allBeverages.reduce((acc, item) => {
       acc[item.category] = acc[item.category] || [];
       acc[item.category].push(item);
       return acc;
     }, {});
   
     Object.entries(categorized).forEach(([category, items]) => {
       $menuContainer.append(`<h3 class="category-title">${category}</h3>`);
       
       items.forEach(item => {
         $menuContainer.append(`
           <div class="menu-item">
             <div class="item-info">
               <div class="item-name">${item.name}</div>
               <div class="item-price">$${item.price.toFixed(2)}</div>
             </div>
             <button class="add-btn" 
                     data-item='${JSON.stringify(item)}'>
               ➕
             </button>
           </div>
         `);
       });
     });
   }
   
   /* ========================
      EVENT HANDLERS (安全绑定)
      ======================== */
   function bindEventListeners() {
     // 使用事件委托处理动态元素
     $("#menuItems").on('click', '.add-btn', function() {
       const itemData = $(this).data('item');
       addToOrder(itemData);
     });
   
     // 其他事件绑定保持不变...
     $("#loginBtn").click(login);
     // ...其余事件绑定
   }
/* ========================
   MENU MANAGEMENT
   ======================== */
function displayMenu() {
    const $menuContainer = $("#menuItems").empty();

    // Iterate through each category
    Object.entries(window.allBeverages).forEach(([category, items]) => {
        // Add category header
        $menuContainer.append(`<div class="menu-category">${category.toUpperCase()}</div>`);

        // Add items for each category
        items.forEach(beverage => {
            const price = parseFloat(beverage.prisinklmoms).toFixed(2);
            const volume = beverage.volymiml || "700";
            const escapedItem = JSON.stringify(beverage).replace(/"/g, '&quot;');

            $menuContainer.append(`
                <div class="menu-item">
                    <div class="item-details">
                        <div class="item-name">${beverage.namn}</div>
                        <div class="item-meta">
                            ${volume}ml | ${beverage.alkoholhalt} 
                            ${beverage.ursprunglandnamn ? `| ${beverage.ursprunglandnamn}` : ''}
                        </div>
                    </div>
                    <div class="item-price">
                        <span>$${price}</span>
                        <button class="add-button" onclick="addToOrder('${escapedItem}')">
                            ➕ Add
                        </button>
                    </div>
                </div>
            `);
        });
    });
}

/* ========================
   ORDER MANAGEMENT
   ======================== */
function addToOrder(itemStr) {
    try {
        const rawItem = JSON.parse(itemStr.replace(/&quot;/g, '"'));
        
        // Normalize item structure
        const item = {
            id: rawItem.nr, // Unique identifier
            name: rawItem.namn,
            price: parseFloat(rawItem.prisinklmoms),
            volume: rawItem.volymiml || "700",
            category: rawItem.varugrupp
        };

        // Check for existing item in order
        const existingItem = currentOrder.find(i => i.id === item.id);
        
        if(existingItem) {
            existingItem.quantity++;
        } else {
            currentOrder.push({...item, quantity: 1});
        }
        
        updateOrderDisplay();
    } catch(e) {
        console.error("Error adding item:", e);
        alert("Failed to add item to order");
    }
}

function updateOrderDisplay() {
    const $orderContainer = $("#orderItems").empty();
    let total = 0;

    currentOrder.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        $orderContainer.append(`
            <div class="item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">
                        ${item.quantity} × $${item.price.toFixed(2)}
                    </div>
                </div>
                <div class="item-controls">
                    <span class="item-total">$${itemTotal.toFixed(2)}</span>
                    <button class="btn-remove" onclick="removeItem(${index})">❌</button>
                </div>
            </div>
        `);
    });

    $("#totalAmount").text(total.toFixed(2));
}

function removeItem(index) {
    if (index >= 0 && index < currentOrder.length) {
        currentOrder.splice(index, 1);
        updateOrderDisplay();
    }
}

/* ========================
   PAYMENT PROCESSING
   ======================== */
function submitOrder() {
    const total = parseFloat($("#totalAmount").text());
    
    if (total === 0) {
        alert("Please add items to your order first");
        return;
    }

    localStorage.getItem("VIP_user") 
        ? showPaymentOptions(total)
        : processCashPayment(total);
}

function showPaymentOptions(total) {
    const balance = parseFloat(localStorage.getItem("accountBalance"));
    $("#orderItems").html(`
        <div class="payment-option" onclick="processAccountPayment()">
            <div class="payment-method">
                💳 Account Balance ($${balance.toFixed(2)})
            </div>
        </div>
        <div class="payment-option" onclick="processCashPayment(${total})">
            <div class="payment-method">
                💵 Cash Payment
            </div>
        </div>
    `);
}

function processCashPayment(total) {
    const payment = prompt(`Please enter cash amount (Total: $${total.toFixed(2)}):`);
    const amount = parseFloat(payment) || 0;

    if (amount >= total) {
        const change = amount - total;
        alert(`Payment received. Change: $${change.toFixed(2)}`);
        currentOrder = [];
        updateOrderDisplay();
    } else {
        alert("Insufficient cash amount");
    }
}

/* ========================
   USER MANAGEMENT
   ======================== */
function login() {
    const username = $("#username").val().trim();
    const password = $("#password").val().trim();

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    const storedPassword = localStorage.getItem(username);
    if (!storedPassword || storedPassword === password) {
        handleSuccessfulLogin(username);
    } else {
        alert("Invalid credentials");
    }
}

function handleSuccessfulLogin(username) {
    localStorage.setItem("VIP_user", username);
    initializeAccountBalance();
    updateUserPanel();
    alert(`Welcome back, ${username}!`);
}

function initializeAccountBalance() {
    if (!localStorage.getItem("accountBalance")) {
        localStorage.setItem("accountBalance", "100.00");
    }
}

function logout() {
    localStorage.removeItem("VIP_user");
    currentOrder = [];
    updateOrderDisplay();
    updateUserPanel();
    alert("Successfully logged out");
}

function updateUserPanel() {
    const user = localStorage.getItem("VIP_user");
    if(user) {
        $(".login-form").hide();
        $(".user-info").show();
        $("#displayName").text(user);
        $("#displayBalance").text(
            parseFloat(localStorage.getItem("accountBalance")).toFixed(2)
        );
    } else {
        $(".login-form").show();
        $(".user-info").hide();
    }
}

/* ========================
   ACCOUNT MANAGEMENT
   ======================== */
function addFunds() {
    const amount = parseFloat(prompt("Enter amount to add:") || 0);
    
    if (amount > 0) {
        const currentBalance = parseFloat(localStorage.getItem("accountBalance") || 0);
        const newBalance = currentBalance + amount;
        localStorage.setItem("accountBalance", newBalance.toFixed(2));
        updateUserPanel();
        alert(`Added $${amount.toFixed(2)}! New balance: $${newBalance.toFixed(2)}`);
    }
}

function processAccountPayment() {
    const total = parseFloat($("#totalAmount").text());
    const balance = parseFloat(localStorage.getItem("accountBalance"));

    if (balance >= total) {
        const newBalance = balance - total;
        localStorage.setItem("accountBalance", newBalance.toFixed(2));
        currentOrder = [];
        updateOrderDisplay();
        updateUserPanel();
        alert(`Payment successful! New balance: $${newBalance.toFixed(2)}`);
    } else {
        alert("Insufficient balance. Please add funds first.");
    }
}

/* ========================
   SPECIAL FEATURES
   ======================== */
function fetchSpecialDrink() {
    const enteredPassword = prompt("Enter special access password:");
    const storedPassword = localStorage.getItem("specialPassword") || "1234";

    if (enteredPassword === storedPassword) {
        alert("Access granted! Enjoy your special drink 🍸");
        const newPassword = prompt("Set new access password:");
        if(newPassword) {
            localStorage.setItem("specialPassword", newPassword);
        }
    } else {
        alert("Invalid password");
    }
}

/* ========================
   UTILITIES
   ======================== */
function handleLanguageChange() {
    const lang = this.value;
    localStorage.setItem("selectedLanguage", lang);
    loadBeveragesFile(displayMenu);
}

function showRegister() {
    const username = prompt("Enter new username:").trim();
    const password = prompt("Enter new password:").trim();

    if (!username || !password) return;

    if (localStorage.getItem(username)) {
        alert("Username already exists");
    } else {
        localStorage.setItem(username, password);
        alert("Registration successful! Please login.");
    }
}