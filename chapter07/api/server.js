
const { GraphQLScalarType } = require('graphql');
const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const proxy = require('http-proxy-middleware');

const apiProxyTarget = process.env.API_PROXY_TARGET;
if (apiProxyTarget) {
 app.use('/graphql', proxy({ target: apiProxyTarget }));
}


const url =  process.env.DB_URL || "mongodb+srv://sechabamadyibi1:1234@cluster0.kus0e2y.mongodb.net/issuetracker?retryWrites=true"
const port = process.env.API_SERVER_PORT || 3000;
let db;

let aboutMessage = 'Issue Tracker API v1.0';


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
        return Number.isNaN(dateValue) ? undefined : dateValue;
    },

    parseLiteral(ast) {
        if (ast.kind == Kind.STRING) {
            const value = new Date(ast.value);
            //validation
            return Number.isNaN(value) ? undefined : value;
        }
        return undefined;
    },
});





//validation errors
function issueValidate(issue) {
    const errors = [];
    if (issue.title.length < 3) {
        errors.push('Field "title" must be at least 3 characters long.');
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
    const newIssue = Object.assign({}, issue);
    newIssue.created = new Date();
    newIssue.id = await getNextSequence('issues');
    
    const result = await db.collection('issues').insertOne(newIssue);
    const savedIssue = await db.collection('issues')
        .findOne({ _id: result.insertedId });
    return savedIssue;
}

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

function setAboutMessage(_, { message }) {
aboutMessage = message;
 return aboutMessage;
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
    typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
    resolvers,
    formatError: (error) => {
        console.log(error);
        return error;
    },
});

const app = express();
app.use(express.static('public'));

const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
console.log('CORS setting:', enableCors);
//appollo server middleware path 
server.applyMiddleware({ app, path: '/graphql', cors: enableCors });

//first connects to database then start the express apllication
(async function start() {
    try {
        await connectToDb();
        app.listen(port, () => {
            console.log(`API server started on port ${port}`);
        });
    } catch (err) {
        console.log('ERROR:', err);
    }
}());