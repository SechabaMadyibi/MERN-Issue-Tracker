import React from 'react';
import URLSearchParams from 'url-search-params';
import { Route } from 'react-router-dom';
import { Panel } from 'react-bootstrap';

import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';

import IssueDetail from './IssueDetail.jsx';
import graphQLFetch from './graphQLFetch.js';
import Toast from './Toast.jsx';


//issue list comp
export default class IssueList extends React.Component {
    constructor() {
        super();
        this.state = {
            issues: [],
            toastVisible: false,
            toastMessage: ' ',
            toastType: 'info',
        };

   
        //chapter 10 - bind closeIssue
        this.closeIssue = this.closeIssue.bind(this);
        //chapter 10
        this.deleteIssue = this.deleteIssue.bind(this);
        //chapter 11
        this.showSuccess = this.showSuccess.bind(this);
        this.showError = this.showError.bind(this);
        this.dismissToast = this.dismissToast.bind(this);
    }
    componentDidUpdate(prevProps) {
        const { location: { search: prevSearch } } = prevProps;
        const { location: { search } } = this.props;
        if (prevSearch !== search) {
            this.loadData();
        }


    }

    componentDidMount() {
        this.loadData();
    }



    //chapter 10 - 
    async closeIssue(index) {
        const query = `mutation issueClose($id: Int!) {
        issueUpdate(id: $id, changes: { status: Closed }) {
        id title status owner
        effort created due description
        }
        }`;
        const { issues } = this.state;
        const data = await graphQLFetch(query, { id: issues[index].id }, this.showError);
        if (data) {
            this.setState((prevState) => {
                const newList = [...prevState.issues];
                newList[index] = data.issueUpdate;
                return { issues: newList };
            });
        } else {
            this.loadData();
        }
    }


    //chapter 10
    async deleteIssue(index) {
        const query = `mutation issueDelete($id: Int!) {
    issueDelete(id: $id)
    }`;
        const { issues } = this.state;
        const { location: { pathname, search }, history } = this.props;
        const { id } = issues[index];
        const data = await graphQLFetch(query, { id }, this.showError);
        if (data && data.issueDelete) {
            this.setState((prevState) => {
                const newList = [...prevState.issues];
                this.showSuccess(`Deleted issue ${id} successfully.`);
                if (pathname === `/issues/${id}`) {
                    history.push({ pathname: '/issues', search });
                }
                newList.splice(index, 1);
                return { issues: newList };
            });
        } else {
            this.loadData();
        }
    }


    //api intengration, query the issue list and fetch from graphql
    async loadData() {
        const { location: { search } } = this.props;
        //call function to search for params in the url
        const params = new URLSearchParams(search);
        const vars = {};
        // After parsing the query string, we’ll have access to the status parameter using the get() method
        // of URLSearchParams, like params.get('status')
        if (params.get('status')) vars.status = params.get('status');

        //chapter 10 - get effort min/max params and if the params are numbers then add effort parameters to vars object
        const effortMin = parseInt(params.get('effortMin'), 10);
        if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
        const effortMax = parseInt(params.get('effortMax'), 10);
        if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;

        //chapter 10 -  change querries ton accommodate for the effort min/max filters
        const query = `query issueList(
            $status: StatusType
            $effortMin: Int
            $effortMax: Int
            ) {

                issueList(
                    status: $status
                    effortMin: $effortMin
                    effortMax: $effortMax
                    ) {
            id title status owner
            created effort due
            }
            }`;


        const data = await graphQLFetch(query, vars, this.showError);
        if (data) {
            this.setState({ issues: data.issueList });
        }
    }

    //chapter 11
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
        const { issues } = this.state;
        //chapter 11
        const { toastVisible, toastType, toastMessage } = this.state;
        const { match } = this.props;
        return (
            <React.Fragment>

                <Panel>
                    <Panel.Heading>
                        <Panel.Title toggle>Filter</Panel.Title>
                    </Panel.Heading>
                    <Panel.Body collapsible>
                        <IssueFilter />
                    </Panel.Body>
                </Panel>
                <hr />
                <IssueTable
                    issues={issues}
                    closeIssue={this.closeIssue}
                    deleteIssue={this.deleteIssue}
                />
               

                <Route path={`${match.path}/:id`} component={IssueDetail} />

                <Toast
                    showing={toastVisible}
                    onDismiss={this.dismissToast}
                    bsStyle={toastType}
                >
                    {toastMessage}
                </Toast>
            </React.Fragment>

        );
    }
}

