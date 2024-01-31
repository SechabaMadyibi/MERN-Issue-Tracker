
/* eslint "react/prefer-stateless-function": "off" */

import React from 'react';
import { withRouter } from 'react-router-dom';
import {
    ButtonToolbar, Button, FormGroup, FormControl, ControlLabel, InputGroup,
    Row, Col,
} from 'react-bootstrap';
import URLSearchParams from 'url-search-params';

class IssueFilter extends React.Component {
    //chapter 10 - add paramaeters to construcctor 
    constructor({ location: { search } }) {
        super();
        const params = new URLSearchParams(search);
        this.state = {
            status: params.get('status') || '',
            //chapter 10 - add effortmin/max properties to state variable
            effortMin: params.get('effortMin') || '',
            effortMax: params.get('effortMax') || '',
            changed: false,
        };
        this.onChangeStatus = this.onChangeStatus.bind(this);
        // chapter 10-  bind 'this' to the two functions (onChangeEffortMi and onChangeEffortMax)
        this.onChangeEffortMin = this.onChangeEffortMin.bind(this);
        this.onChangeEffortMax = this.onChangeEffortMax.bind(this);
        //chapter10 - bind apply filter and showOriginal functions
        this.applyFilter = this.applyFilter.bind(this);
        this.showOriginalFilter = this.showOriginalFilter.bind(this);

    }
    //chapter10 -compare prop values before calling showOrriginal filter function
    componentDidUpdate(prevProps) {
        const { location: { search: prevSearch } } = prevProps;
        const { location: { search } } = this.props;
        if (prevSearch !== search) {
            this.showOriginalFilter();
        }
    }

    onChangeStatus(e) {
        //chapter10  -set state
        this.setState({ status: e.target.value, changed: true });
    }

    //chapter 10- set state variable to user input 
    onChangeEffortMin(e) {
        const effortString = e.target.value;
        if (effortString.match(/^\d*$/)) {
            this.setState({ effortMin: e.target.value, changed: true });
        }
    }

    //chapter 10- set state variable to user input 
    onChangeEffortMax(e) {
        const effortString = e.target.value;
        if (effortString.match(/^\d*$/)) {
            this.setState({ effortMax: e.target.value, changed: true });
        }
    }

    //chapter10 - setState to original filter  using query params
    showOriginalFilter() {
        const { location: { search } } = this.props;
        const params = new URLSearchParams(search);
        this.setState({
            status: params.get('status') || '',
            //chapter 10 set state variables of effort min / max
            effortMin: params.get('effortMin') || '',
            effortMax: params.get('effortMax') || '',
            changed: false,
        });
    }
    //chapter10- apply status of the state variable
    applyFilter() {
        const { status, effortMin, effortMax } = this.state;
        const { history } = this.props;
        //chapter 10 - check state variables have values for status, effortMin/Max
        //check if params are back to strings 
        //push params to history 
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (effortMin) params.set('effortMin', effortMin);
        if (effortMax) params.set('effortMax', effortMax);
        const search = params.toString() ? `?${params.toString()}` : '';
        history.push({ pathname: '/issues', search });
    }

    render() {
        //chapter 10 - get these values from state variables
        const { status, changed } = this.state;
        const { effortMin, effortMax } = this.state;
        return (
            <Row>
                <Col xs={6} sm={4} md={3} lg={2}>
                    {/* chapter11 */}
                    <FormGroup>
                        <ControlLabel>Status:</ControlLabel>
                        <FormControl
                            componentClass="select"
                            value={status}
                            onChange={this.onChangeStatus}
                        >
                            <option value="">(All)</option>
                            <option value="New">New</option>
                            <option value="Assigned">Assigned</option>
                            <option value="Fixed">Fixed</option>
                            <option value="Closed">Closed</option>
                        </FormControl>
                    </FormGroup>
                    {/* chapter11 -*/}
                </Col>
                <Col xs={6} sm={4} md={3} lg={2}>
                        <FormGroup>
                            <ControlLabel>Effort between:</ControlLabel>
                            <InputGroup>
                                <FormControl value={effortMin} onChange={this.onChangeEffortMin} />
                                <InputGroup.Addon>-</InputGroup.Addon>
                                <FormControl value={effortMax} onChange={this.onChangeEffortMax} />
                            </InputGroup>
                        </FormGroup>
                </Col>
                <Col xs={6} sm={4} md={3} lg={2}>
                    <FormGroup>
                        <ControlLabel>&nbsp;</ControlLabel>

                        <ButtonToolbar>
                            <Button bsStyle="primary" type="button" onClick={this.applyFilter}>
                                Apply
                            </Button>
                            {' '}
                            <Button
                                type="button"
                                onClick={this.showOriginalFilter}
                                disabled={!changed}
                            >
                                Reset
                            </Button>
                        </ButtonToolbar>

                    </FormGroup>
                </Col>
            </Row>
        );
    }
}
export default withRouter(IssueFilter);
