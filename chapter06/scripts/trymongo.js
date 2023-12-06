const { MongoClient } = require('mongodb');
// const url = 'mongodb://localhost/issuetracker';
// const url = 'mongodb://0.0.0.0:27017/issuetracker';
const url = process.env.DB_URL  ||'mongodb+srv://sechabamadyibi1:1234@cluster0.kus0e2y.mongodb.net/'

// Atlas URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';
// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';

function testWithCallbacks(callback) {
    console.log('\n--- testWithCallbacks ---');
    const client = new MongoClient(url, { useNewUrlParser: true },
    );

    //The connect() method is an asynchronous method and needs a callback to receive the result of the connection
    client.connect(function (err, client) {
        if (err) {
            callback(err);
            return;
        }
        console.log('Connected to MongoDB URL', url);
        //a connection to the database can be obtained by calling the db method of the client object
        const db = client.db();
        const collection = db.collection('employees');

        const employee = { id: 1, name: 'A. Callback', age: 23 };
        //insert one document into employees collection
        collection.insertOne(employee, function (err, result) {
            if (err) {
                client.close();
                callback(err);
                return;
            }
            // Within the callback, let’s print the new _id that was created
            // the created ID is returned as part of the result object, in the property called insertedId

            console.log('Result of insert:\n', result.insertedId);

            collection.find({ _id: result.insertedId })
                .toArray(function (err, docs) {
                    if (err) {
                        client.close();
                        callback(err);
                        return;
                    }
                    //print inserted document
                    console.log('Result of find:\n', docs);
                    client.close();
                    callback(err);
                });
        });
    });
}
testWithCallbacks(function (err) {
    if (err) {
        console.log(err);
    }
});


async function testWithAsync() {
    console.log('\n--- testWithAsync ---');
    const client = new MongoClient(url, { useNewUrlParser: true });
    try {
        await client.connect();
        cconsole.log('Connected to MongoDB URL', url);
        const db = client.db();
        const collection = db.collection('employees');
        const employee = { id: 2, name: 'B. Async', age: 16 };
        const result = await collection.insertOne(employee);
        console.log('Result of insert:\n', result.insertedId);
        const docs = await collection.find({ _id: result.insertedId })
            .toArray();
        console.log('Result of find:\n', docs);
    } catch (err) {
        console.log(err);
    } finally {
        client.close();
    }
}

testWithCallbacks(function (err) {
    if (err) {
        console.log(err);
    }
    testWithAsync();
});