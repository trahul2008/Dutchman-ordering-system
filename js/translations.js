// Define translations for English and Swedish
const translations = {
    en: {
        welcome: "🍻 Welcome to SmartBar",
        drinkMenu: "🍺 Drink Menu",
        currentOrder: "📝 Current Order",
        submitOrder: "🚀 Submit Order",
        useBalance: "💰 Use Balance",
        vipLogin: "🔑 VIP Login",
        usernamePlaceholder: "Username",
        passwordPlaceholder: "Password",
        register: "Register",
        login: "Login",
        balance: "💰 Balance:",
        addFunds: "💳 Add Funds",
        specialDrink: "🍸 Special drink",
        logout: "🚪 Log out"
    },
    sv: {
        welcome: "🍻 Välkommen till SmartBar",
        drinkMenu: "🍺 Dryckesmeny",
        currentOrder: "📝 Nuvarande beställning",
        submitOrder: "🚀 Skicka beställning",
        useBalance: "💰 Använd saldo",
        vipLogin: "🔑 VIP-inloggning",
        usernamePlaceholder: "Användarnamn",
        passwordPlaceholder: "Lösenord",
        register: "Registrera",
        login: "Logga in",
        balance: "💰 Saldo:",
        addFunds: "💳 Lägg till pengar",
        specialDrink: "🍸 Specialdryck",
        logout: "🚪 Logga ut"
    }
};

// Function to change language
function changeLanguage(lang) {
    document.getElementById("welcomeBar").querySelector(".welcome-text").textContent = translations[lang].welcome;
    document.querySelector("#menu h2").textContent = translations[lang].drinkMenu;
    document.querySelector("#orderBox h2").textContent = translations[lang].currentOrder;
    document.getElementById("submitOrderBtn").textContent = translations[lang].submitOrder;
    document.getElementById("useBalanceBtn").textContent = translations[lang].useBalance;
    document.querySelector(".login-form h3").textContent = translations[lang].vipLogin;
    
    // Change placeholders
    document.getElementById("username").placeholder = translations[lang].usernamePlaceholder;
    document.getElementById("password").placeholder = translations[lang].passwordPlaceholder;

    // Change button text
    document.getElementById("registerBtn").textContent = translations[lang].register;
    document.getElementById("loginBtn").textContent = translations[lang].login;
    document.querySelector(".user-info p").innerHTML = translations[lang].balance + " $<span id='displayBalance'>0.00</span>";
    document.getElementById("addFundsBtn").textContent = translations[lang].addFunds;
    document.getElementById("specialDrinkBtn").textContent = translations[lang].specialDrink;
    document.getElementById("logoutBtn").textContent = translations[lang].logout;

    // Store selected language in localStorage
    localStorage.setItem("selectedLanguage", lang);
}

// Event listener for language selection dropdown
document.getElementById("languageSelect").addEventListener("change", function () {
    changeLanguage(this.value);
});

// Set default language on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en"; // Default to English
    document.getElementById("languageSelect").value = savedLanguage;
    changeLanguage(savedLanguage);
});
