const axios = require('axios');
require('dotenv').config();

// Telegram Bot Token (.env)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function getChatId() {
    /**
     * Get the Chat ID of a user who sends a message to your bot.
     */
    if (!TELEGRAM_BOT_TOKEN) {
        console.log('❌ TELEGRAM_BOT_TOKEN is missing in .env');
        return null;
    }

    console.log('='.repeat(60));
    console.log('📱 TELEGRAM CHAT ID FINDER');
    console.log('='.repeat(60));
    console.log('\n1. Open your bot in Telegram');
    console.log('2. Send any message to the bot (e.g. \'Hello\' or \'/start\')');
    console.log('3. After sending, this program will automatically show your Chat ID');
    console.log('\n⏳ Waiting for a message... (Ctrl+C to exit)\n');
    
    let lastUpdateId = 0;
    
    try {
        while (true) {
            // Get updates from bot
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`;
            const params = {
                offset: lastUpdateId + 1,
                timeout: 30
            };
            
            const response = await axios.get(url, { params });
            
            if (response.status === 200) {
                const data = response.data;
                
                if (data.ok && data.result && data.result.length > 0) {
                    for (const update of data.result) {
                        lastUpdateId = update.update_id;
                        
                        // If there is a message
                        if (update.message) {
                            const chatId = update.message.chat.id;
                            const user = update.message.from;
                            const username = user.username || 'N/A';
                            const firstName = user.first_name || '';
                            const lastName = user.last_name || '';
                            
                            console.log('='.repeat(60));
                            console.log('✅ CHAT ID FOUND!');
                            console.log('='.repeat(60));
                            console.log(`\n📋 Chat ID: ${chatId}`);
                            console.log(`👤 Name: ${firstName} ${lastName}`.trim());
                            console.log(`🔗 Username: @${username}`);
                            console.log('\n' + '='.repeat(60));
                            console.log('Add this Chat ID to your .env file:');
                            console.log(`TELEGRAM_CHAT_ID="${chatId}"`);
                            console.log('='.repeat(60));
                            
                            // Send chat ID back to user
                            const sendUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
                            const message = `✅ Connection successful!\n\n📋 Your Chat ID: <code>${chatId}</code>\n\nYou can add this ID to your code.`;
                            const payload = {
                                chat_id: chatId,
                                text: message,
                                parse_mode: 'HTML'
                            };
                            await axios.post(sendUrl, payload);
                            
                            return chatId;
                        }
                    }
                }
            } else {
                console.log(`❌ Error: ${response.status}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        if (error.message === 'SIGINT') {
            console.log('\n\n⛔ Program stopped');
        } else {
            console.log(`\n❌ An error occurred: ${error.message}`);
        }
        return null;
    }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n⛔ Program stopped');
    process.exit(0);
});

if (require.main === module) {
    getChatId();
}

module.exports = { getChatId };
