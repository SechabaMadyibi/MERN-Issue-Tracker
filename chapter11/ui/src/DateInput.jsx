import React from 'react';
//chapter 10 - convert to string
function displayFormat(date) {
    return (date != null) ? date.toDateString() : '';
}

//convert to string date format
function editFormat(date) {
    return (date != null) ? date.toISOString().substr(0, 10) : '';
}
//convert  date to number type
function unformat(str) {
    const val = new Date(str);
    return Number.isNaN(val.getTime()) ? null : val;
}


export default class DateInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: editFormat(props.value),
            focused: false,
            valid: true,
        };
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    //set state for focused to be true
    onFocus() {
        this.setState({ focused: true });
    }

    //
    onBlur(e) {
        const { value, valid: oldValid } = this.state;
        const { onValidityChange, onChange } = this.props;
        //unformat state value
        const dateValue = unformat(value);

        const valid = value === '' || dateValue != null;
        //call validatity change function when value changes
        if (valid !== oldValid && onValidityChange) {
            onValidityChange(e, valid);
        }
        //set state variables
        this.setState({ focused: false, valid });
        //if valid is true call onchange function
        if (valid) onChange(e, dateValue);
    }

    //check if user value matches regex expression and set state variable
    onChange(e) {
        if (e.target.value.match(/^[\d-]*$/)) {
            this.setState({ value: e.target.value });
        }
    }
    render() {
        const { valid, focused, value } = this.state;
        const { value: origValue, onValidityChange, ...props } = this.props;
        //convert value to format string if neither of the conditions are met else else assign displayValue the current state value
        const displayValue = (focused || !valid) ? value
            : displayFormat(origValue);
        return (
            <input
                {...props}
                value={displayValue}
                placeholder={focused ? 'yyyy-mm-dd' : null}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onChange={this.onChange}
            />
        );
    }
}