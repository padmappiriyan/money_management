const mongoose = require('mongoose');
const { Platform } = require('../models/platform.model.js');

const logos = {
    'WESTERN UNION': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Western_Union_logo.svg/1024px-Western_Union_logo.svg.png',
    'MONEYGRAM': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/MoneyGram_Logo.svg/1200px-MoneyGram_Logo.svg.png',
    'RIA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Ria_Money_Transfer_logo.svg/1200px-Ria_Money_Transfer_logo.svg.png'
};

//const MONGO_URI = 'mongodb+srv://selvakumarpadmappiriyan_db_user:9nQJ0ngu0zdldwnq@mmts.giz24cq.mongodb.net/';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to Atlas.');

        for (const [name, url] of Object.entries(logos)) {
            const result = await Platform.updateOne(
                { name }, 
                { $set: { logoUrl: url } }
            );
            console.log(`Updated ${name}: ${result.modifiedCount} document(s) changed.`);
        }

        console.log('Logo update completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
}

run();
