import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import { Transaction } from './models/transaction.model.js';

async function audit() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check all stats
    const all = await Transaction.find({});
    console.log(`Total DB transactions: ${all.length}`);
    
    const byStatus = {};
    const byStaff = {};

    all.forEach(t => {
       byStatus[t.status] = (byStatus[t.status] || 0) + 1;
       
       const staffId = t.staffId?.toString() || 'Unknown';
       byStaff[staffId] = (byStaff[staffId] || 0) + 1;
       
       console.log(`ID: ${t._id}, Status: ${t.status}, Staff: ${staffId}, Volume: ${t.totalPayout}`);
    });
    
    console.log('Status breakdown:', byStatus);
    console.log('Staff breakdown:', byStaff);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

audit();
