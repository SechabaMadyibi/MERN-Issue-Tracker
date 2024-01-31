require('dotenv').config();
const { MongoClient } = require('mongodb');
let db;

//connect to database
async function connectToDb() {
    const url = process.env.DB_URL || "mongodb+srv://sechabamadyibi1:1234@cluster0.kus0e2y.mongodb.net/issuetracker?retryWrites=true"
    const client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();
    console.log('Connected to MongoDB at', url);
    db = client.db();
}

async function getNextSequence(name) {
    const result = await db.collection('counters').findOneAndUpdate(
        { _id: name },
        { $inc: { current: 1 } },
        { returnOriginal: false },
    );
    return result.value.current;
}

function getDb() {
    return db;
}
module.exports = { connectToDb, getNextSequence, getDb };