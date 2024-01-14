import React from 'react';
import { Link } from 'react-router-dom';
import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';

//chapter 10
export default class IssueEdit extends React.Component {
    constructor() {
        super();
        //state variable
        this.state = {
            issue: {},
            invalidFields: {},
        };
        //bind 'this' submit and onchange function
        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onValidityChange = this.onValidityChange.bind(this);
    }

    //call load data on componentDidMount
    componentDidMount() {
        this.loadData();
    }
    //compare variable of previous props and current props and call loadData
    componentDidUpdate(prevProps) {
        const { match: { params: { id: prevId } } } = prevProps;
        const { match: { params: { id } } } = this.props;
        if (id !== prevId) {
            this.loadData();
        }
    }

    //set issue to  previous State issue and add name value from the input of the user
    onChange(event, naturalValue) {
        const { name, value: textValue } = event.target;
        //numinputs chapter 10 - assign value to value varialable
        const value = naturalValue === undefined ? textValue : naturalValue;
        this.setState(prevState => ({
            issue: { ...prevState.issue, [name]: value },
        }));
    }

    //date inputs- onvalidityChange function 
    onValidityChange(event, valid) {
        const { name } = event.target;
        this.setState((prevState) => {
            const invalidFields = { ...prevState.invalidFields, [name]: !valid };
            if (valid) delete invalidFields[name];
            return { invalidFields };
        });
    }


    //submit: grab issue from state and print on the console
    async handleSubmit(e) {
        e.preventDefault();
        const { issue, invalidFields } = this.state;
        if (Object.keys(invalidFields).length !== 0) return;

        const query = `mutation issueUpdate(
            $id: Int!
            $changes: IssueUpdateInputs!
          ) {
            issueUpdate(
              id: $id
              changes: $changes
            ) {
              id title status owner
              effort created due description
            }
          }`;

        const { id, created, ...changes } = issue;
        const data = await graphQLFetch(query, { changes, id });
        if (data) {
            this.setState({ issue: data.issueUpdate });
            alert('Updated issue successfully'); // eslint-disable-line no-alert
        }
    }


    // query the issue on graphql
    async loadData() {
        const query = `query issue($id: Int!) {
    issue(id: $id) {
    id title status owner
    effort created due description
 }
 }`;
        //grab id from props
        const { match: { params: { id } } } = this.props;
        //call graphqlFetch to fetch queried data
        const data = await graphQLFetch(query, { id });
        //set state
        this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
    }

    render() {

        //grab id from state variabled
        const { issue: { id } } = this.state;
        //grab id from  props in params object and store value in propsId
        const { match: { params: { id: propsId } } } = this.props;
        //check if theres id value in state variable 
        //and if propsID is not null in  return the message 
        if (id == null) {
            if (propsId != null) {
                return <h3>{`Issue with ID ${propsId} not found.`}</h3>;
            }
            return null;
        }

        //date inputs
        const { invalidFields } = this.state;
        let validationMessage;
        if (Object.keys(invalidFields).length !== 0) {
            validationMessage = (
                <div className="error">
                    Please correct invalid fields before submitting.
                </div>
            );
        }

        const { issue: { title, status } } = this.state;
        const { issue: { owner, effort, description } } = this.state;
        const { issue: { created, due } } = this.state;

        return (
            <form onSubmit={this.handleSubmit}>
                <h3>{`Editing issue: ${id}`}</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>Created:</td>
                            <td>{created.toDateString()}</td>
                        </tr>
                        <tr>
                            <td>Status:</td>
                            <td>
                                <select name="status" value={status} onChange={this.onChange}>
                                    <option value="New">New</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>Owner:</td>
                            <td>
                                <TextInput
                                    name="owner"
                                    value={owner}
                                    onChange={this.onChange}
                                    key={id}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Effort:</td>
                            <td>
                                <NumInput
                                    name="effort"
                                    value={effort}
                                    onChange={this.onChange}
                                    key={id}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Due:</td>
                            <td>
                                <DateInput
                                    name="due"
                                    value={due}
                                    onChange={this.onChange}
                                    onValidityChange={this.onValidityChange}
                                    key={id}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Title:</td>
                            <td>
                                <TextInput
                                    size={50}
                                    name="title"
                                    value={title}
                                    onChange={this.onChange}
                                    key={id}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>Description:</td>
                            <td>
                                <TextInput
                                    tag="textarea"
                                    rows={8}
                                    cols={50}
                                    name="description"
                                    value={description}
                                    onChange={this.onChange}
                                    key={id}
                                />
                            </td>
                        </tr>
                        <tr>
                            <td />
                            <td><button type="submit">Submit</button></td>
                        </tr>
                    </tbody>
                </table>
                {validationMessage}
                <Link to={`/edit/${id - 1}`}>Prev</Link>
                {' | '}
                <Link to={`/edit/${id + 1}`}>Next</Link>
            </form>
        );
    }
}
