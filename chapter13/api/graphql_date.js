const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

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
module.exports = GraphQLDate;