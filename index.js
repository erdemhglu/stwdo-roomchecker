require('dotenv').config();
const axios = require('axios');

// Configuration
const BASE_URL = "https://www.stwdo.de";
const FORM_ACTION = "/wohnen/aktuelle-wohnangebote";
const URL = `${BASE_URL}${FORM_ACTION}`;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) * 1000; // Seconds to milliseconds

// Form data
const formData = {
    "tx_openimmo_list[city]": "",
    "tx_openimmo_list[residentialComplex]": ""
};

// Headers
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": `${BASE_URL}/wohnen/aktuelle-wohnangebote`
};

// Axios instance
const axiosInstance = axios.create({
    timeout: 30000,
    headers: headers
});

/**
 * Send Telegram notification
 */
async function sendTelegramMessage(message) {
    try {
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await axios.post(telegramUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "HTML"
        });
        
        if (response.status === 200) {
            console.log("✓ Telegram notification sent");
        }
    } catch (error) {
        console.error(`✗ Telegram error: ${error.message}`);
    }
}

/**
 * Check room availability
 */
async function checkRooms() {
    try {
        const currentTime = new Date().toLocaleString('tr-TR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        console.log(`\n[${currentTime}] Checking...`);
        
        // Convert form data to URLSearchParams format
        const params = new URLSearchParams(formData);
        
        const response = await axiosInstance.post(URL, params.toString());
        
        console.log(`Status Code: ${response.status}`);
        
        const responseText = response.data;
        
        // Check: Is there any available room?
        if (responseText.includes("keine freien Plätze zu vermieten") || 
            responseText.includes('"notification__header">Keine Angebote')) {
            console.log("⚠️  No available room at the moment");
            return false;
        } else {
            console.log("✅ AVAILABLE ROOM FOUND!");
            
            const message = `🎉 <b>AVAILABLE ROOM FOUND!</b>\n\n` +
                          `⏰ Time: ${currentTime}\n` +
                          `🔗 Link: ${URL}\n\n` +
                          `Check it now!`;
            
            await sendTelegramMessage(message);
            return true;
        }
        
    } catch (error) {
        console.error(`❌ An error occurred: ${error.message}`);
        
        // Error notification (optional - disable if too frequent)
        if (error.response?.status >= 500) {
            await sendTelegramMessage(`⚠️ Server error: ${error.message}`);
        }
        
        return false;
    }
}

/**
 * Main function
 */
async function main() {
    console.log("=".repeat(60));
    console.log("🏠 ROOM CHECKER STARTED (Node.js)");
    console.log("=".repeat(60));
    console.log(`Check interval: ${CHECK_INTERVAL / 1000} seconds (${CHECK_INTERVAL / 60000} minutes)`);
    console.log(`Target URL: ${URL}`);
    console.log(`Started at: ${new Date().toLocaleString('tr-TR')}`);
    console.log("=".repeat(60));
    console.log("\nProcess ID:", process.pid);
    console.log("Node Version:", process.version);
    console.log("\nTo stop: pm2 stop roomchecker or Ctrl+C\n");
    
    // Startup notification
    await sendTelegramMessage("🚀 Room checker started!");
    
    // Initial check
    await checkRooms();
    
    // Periodic check
    setInterval(async () => {
        console.log(`\n💤 Next check...`);
        await checkRooms();
    }, CHECK_INTERVAL);
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log("\n\n" + "=".repeat(60));
    console.log("⛔ Program stopped");
    console.log("=".repeat(60));
    await sendTelegramMessage("⛔ Room checker stopped.");
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log("\n\n" + "=".repeat(60));
    console.log("⛔ Program terminated");
    console.log("=".repeat(60));
    await sendTelegramMessage("⛔ Room checker terminated.");
    process.exit(0);
});

// Error handling
process.on('uncaughtException', async (error) => {
    console.error('Uncaught error:', error);
    await sendTelegramMessage(`🚨 Critical error: ${error.message}`);
});

process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
});

// Start
main().catch(async (error) => {
    console.error('Startup error:', error);
    await sendTelegramMessage(`🚨 Startup error: ${error.message}`);
    process.exit(1);
});
