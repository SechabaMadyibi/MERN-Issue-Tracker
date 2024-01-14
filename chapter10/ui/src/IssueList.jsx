import React from 'react';
import URLSearchParams from 'url-search-params';
import { Route } from 'react-router-dom';

import IssueFilter from './IssueFilter.jsx';
import IssueTable from './IssueTable.jsx';
import IssueAdd from './IssueAdd.jsx';
import IssueDetail from './IssueDetail.jsx';
import graphQLFetch from './graphQLFetch.js';

//issue list comp
export default class IssueList extends React.Component {
    constructor() {
        super();
        this.state = { issues: [] };
        this.createIssue = this.createIssue.bind(this);
        //chapter 10 - bind closeIssue
        this.closeIssue = this.closeIssue.bind(this);
        //chapter 10
        this.deleteIssue = this.deleteIssue.bind(this);
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
        const data = await graphQLFetch(query, { id: issues[index].id });
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
        const data = await graphQLFetch(query, { id });
        if (data && data.issueDelete) {
            this.setState((prevState) => {
                const newList = [...prevState.issues];
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


        const data = await graphQLFetch(query, vars);
        if (data) {
            this.setState({ issues: data.issueList });
        }
    }


    async createIssue(issue) {
        const query = `mutation issueAdd($issue: IssueInputs!) {
            issueAdd(issue: $issue) {
            id
            }
            }`;

        const data = await graphQLFetch(query, { issue });
        if (data) {
            this.loadData();
        }
    }

    render() {
        const { issues } = this.state;
        const { match } = this.props;
        return (
            <React.Fragment>
                <h1>Issue Tracker</h1>
                <IssueFilter />
                <hr />
                <IssueTable
                    issues={issues}
                    closeIssue={this.closeIssue}
                    deleteIssue={this.deleteIssue}
                />
                <hr />
                <IssueAdd createIssue={this.createIssue} />
                <hr />
                <Route path={`${match.path}/:id`} component={IssueDetail} />
            </React.Fragment>

        );
    }
}

