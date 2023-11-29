const { Kind } = require('graphql/language');
const { GraphQLScalarType } = require('graphql');
const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
let aboutMessage = "Issue Tracker API v1.0";

const issuesDB = [
    {
        id: 1, status: 'New', owner: 'Ravan', effort: 5,
        created: new Date('2019-01-15'), due: undefined,
        title: 'Error in console when clicking Add',
    },
    {
        id: 2, status: 'Assigned', owner: 'Eddie', effort: 14,
        created: new Date('2019-01-16'), due: new Date('2019-02-01'),
        title: 'Missing bottom border on panel',
    },
];

//custom scaler resolver for GraphQL date
const GraphQLDate = new GraphQLScalarType({
    name: 'GraphQLDate',
    description: 'A Date() type in GraphQL as a scalar',
    //returns a string value
    serialize(value) {
        return value.toISOString();
    },

    //called when input is parsed as a variable
    parseValue(value) {
        const dateValue = new Date(value);
         //validation
        return isNaN(dateValue) ? undefined : dateValue;
    },
    //pass strings back to dates
    parseLiteral(ast) {
        if (ast.kind == Kind.STRING) {
            const value = new Date(ast.value);
            //validation
            return isNaN(value) ? undefined : value;
        }
    },
});

//resolve a query to a field with real values
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
function issueValidate(_, { issue }) {
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

// (resolver function)issue add 
//validate issue before adding it to issueDB
function issueAdd(_, { issue }) {
    issueValidate(_, {issue});
    issue.created = new Date();
    issue.id = issuesDB.length + 1;
    if (issue.status == undefined) issue.status = 'New';
    issuesDB.push(issue);
    return issue;
}

//resolver function 
function setAboutMessage(_, { message }) {
    return aboutMessage = message;
};

//function returning issuedb array
function issueList() {
    return issuesDB;
};

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

app.listen(3000, function () {
    console.log('App started on port 3000');
});