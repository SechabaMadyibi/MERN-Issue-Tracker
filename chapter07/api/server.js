
const { GraphQLScalarType } = require('graphql');
const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = "mongodb+srv://sechabamadyibi1:1234@cluster0.kus0e2y.mongodb.net/issuetracker?retryWrites=true"
let db;

let aboutMessage = "Issue Tracker API v1.0";


//custom scaler resolver for GraphQL date
const GraphQLDate = new GraphQLScalarType({
    name: 'GraphQLDate',
    description: 'A Date() type in GraphQL as a scalar',
    //returns a string value
    serialize(value) {
        return value.toISOString();
    },

    //called when input is parsed as a variiable
    parseValue(value) {
        const dateValue = new Date(value);
        //validation
        return isNaN(dateValue) ? undefined : dateValue;
    },

    parseLiteral(ast) {
        if (ast.kind == Kind.STRING) {
            const value = new Date(ast.value);
            //validation
            return isNaN(value) ? undefined : value;
        }
    },
});


const resolvers = {
    Query: {
        about: () => aboutMessage,
        issueList,
    },
    Mutation: {
        setAboutMessage,
        issueAdd,
    },
    GraphQLDate,
};


//validation errors
function issueValidate(issue) {
    const errors = [];
    if (issue.title.length < 3) {
        errors.push('Field "title" must be at least 3 characters long.')
    }
    if (issue.status == 'Assigned' && !issue.owner) {
        errors.push('Field "owner" is required when status is "Assigned"');
    }
    if (errors.length > 0) {
        throw new UserInputError('Invalid input(s)', { errors });
    }
}


async function getNextSequence(name) {
    const result = await db.collection('counters').findOneAndUpdate(
        { _id: name },
        { $inc: { current: 1 } },
        { returnOriginal: false },
    );
    return result.value.current;
}

// issue add function 
//validate issue before adding 
async function issueAdd(_, { issue }) {
    issueValidate(issue);
    issue.created = new Date();
    issue.id = await getNextSequence('issues');
    
    const result = await db.collection('issues').insertOne(issue);
    const savedIssue = await db.collection('issues')
        .findOne({ _id: result.insertedId });
    return savedIssue;
}

function setAboutMessage(_, { message }) {
    return aboutMessage = message;
};

//function returning issuedb array
async function issueList() {
    const issues = await db.collection('issues').find({}).toArray();
    return issues;
};

//connect to database
async function connectToDb() {
    const client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();
    console.log('Connected to MongoDB at', url);
    db = client.db();
}

//graphQL server
const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
    resolvers,
    formatError: error => {
        console.log(error);
        return error;
    },
});

const app = express();
app.use(express.static('public'));

//appollo server middleware path 
server.applyMiddleware({ app, path: '/graphql' });

//first connects to database then start the express apllication
(async function () {
    try {
        await connectToDb();
        app.listen(3000, function () {
            console.log('App started on port 3000');
        });
    } catch (err) {
        console.log('ERROR:', err);
    }
})();