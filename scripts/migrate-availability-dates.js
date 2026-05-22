import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

const availabilitySchema = new mongoose.Schema({
  date: Date,
});

const Availability = mongoose.model('Availability', availabilitySchema);

await mongoose.connect(MONGODB_URL);
console.log('Connected to MongoDB');

const docs = await Availability.find({});
console.log(`Found ${docs.length} availability docs`);

let updated = 0;
for (const doc of docs) {
  const fixed = new Date(doc.date.getTime() + 60 * 60 * 1000);
  await Availability.updateOne({ _id: doc._id }, { $set: { date: fixed } });
  console.log(`  ${doc._id}: ${doc.date.toISOString()} → ${fixed.toISOString()}`);
  updated++;
}

console.log(`Done. Updated ${updated} availability dates.`);
await mongoose.disconnect();
