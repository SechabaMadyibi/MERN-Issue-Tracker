import React from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';
import Toast from './Toast.jsx';
import {
    Col, Panel, Form, FormGroup, FormControl, ControlLabel,
    ButtonToolbar, Button, Alert,
} from 'react-bootstrap';


//chapter 10
export default class IssueEdit extends React.Component {
    constructor() {
        super();
        //state variable
        this.state = {
            issue: {},
            invalidFields: {},
            showingValidation: false,
            toastVisible: false,
            toastMessage: ' ',
            toastType: 'success',
        };
        //bind 'this' submit and onchange function
        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onValidityChange = this.onValidityChange.bind(this);

        //chapter 11 toasts
        this.showSuccess = this.showSuccess.bind(this);
        this.showError = this.showError.bind(this);
        this.dismissToast = this.dismissToast.bind(this);
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
        this.showValidation();
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
        const data = await graphQLFetch(query, { changes, id }, this.showError);
        if (data) {
            this.setState({ issue: data.issueUpdate });
            this.showSuccess('Updated issue successfully');
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
        const data = await graphQLFetch(query, { id }, this.showError);
        //set state
        this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
    }

    //chapter 11 validation
    showValidation() {
        this.setState({ showingValidation: true });
    }
    dismissValidation() {
        this.setState({ showingValidation: false });
    }
    //chapter 11 -toasts
    showSuccess(message) {
        this.setState({
            toastVisible: true, toastMessage: message, toastType: 'success',
        });
    }
    showError(message) {
        this.setState({
            toastVisible: true, toastMessage: message, toastType: 'danger',
        });
    }
    dismissToast() {
        this.setState({ toastVisible: false });
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
        const { invalidFields, showingValidation } = this.state;
        let validationMessage;
        if (Object.keys(invalidFields).length !== 0 && showingValidation) {
            validationMessage = (
                <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
                    Please correct invalid fields before submitting.
                </Alert>
            );
        }

        const { issue: { title, status } } = this.state;
        const { issue: { owner, effort, description } } = this.state;
        const { issue: { created, due } } = this.state;
        //chapter 11 toasts
        const { toastVisible, toastMessage, toastType } = this.state;
        return (
            <Panel>
                <Panel.Heading>
                    <Panel.Title>{`Editing issue: ${id}`}</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <Form horizontal onSubmit={this.handleSubmit}>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Created</Col>
                            <Col sm={9}>
                                <FormControl.Static>
                                    {created.toDateString()}
                                </FormControl.Static>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Status</Col>
                            <Col sm={9}>
                                <FormControl
                                    componentClass="select"
                                    name="status"
                                    value={status}
                                    onChange={this.onChange}
                                >
                                    <option value="New">New</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Closed">Closed</option>
                                </FormControl>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Owner</Col>
                            <Col sm={9}>
                                <FormControl
                                    componentClass={TextInput}
                                    name="owner"
                                    value={owner}
                                    onChange={this.onChange}
                                    key={id}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Effort</Col>
                            <Col sm={9}>
                                <FormControl
                                    componentClass={NumInput}
                                    name="effort"
                                    value={effort}
                                    onChange={this.onChange}
                                    key={id}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup validationState={
                            invalidFields.due ? 'error' : null
                        }
                        >
                            <Col componentClass={ControlLabel} sm={3}>Due</Col>
                            <Col sm={9}>
                                <FormControl
                                    componentClass={DateInput}
                                    onValidityChange={this.onValidityChange}
                                    name="due"
                                    value={due}
                                    onChange={this.onChange}
                                    key={id}
                                />
                                <FormControl.Feedback />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Title</Col>
                            <Col sm={9}>
                                <FormControl
                                    componentClass={TextInput}
                                    size={50}
                                    name="title"
                                    value={title}
                                    onChange={this.onChange}
                                    key={id}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={3}>Description</Col>
                            <Col sm={9}>
                                <FormControl
                                    componentClass={TextInput}
                                    tag="textarea"
                                    rows={4}
                                    cols={50}
                                    name="description"
                                    value={description}
                                    onChange={this.onChange}
                                    key={id}
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col smOffset={3} sm={6}>
                                <ButtonToolbar>
                                    <Button bsStyle="primary" type="submit">Submit</Button>
                                    <LinkContainer to="/issues">
                                        <Button bsStyle="link">Back</Button>
                                    </LinkContainer>
                                </ButtonToolbar>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col smOffset={3} sm={9}>{validationMessage}</Col>
                        </FormGroup>
                    </Form>
                </Panel.Body>
                <Panel.Footer>
                    <Link to={`/edit/${id - 1}`}>Prev</Link>
                    {' | '}
                    <Link to={`/edit/${id + 1}`}>Next</Link>
                </Panel.Footer>
                <Toast
                    showing={toastVisible}
                    onDismiss={this.dismissToast}
                    bsStyle={toastType}
                >
                    {toastMessage}
                </Toast>
            </Panel>
        );
    }
}