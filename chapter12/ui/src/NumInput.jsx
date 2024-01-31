import React from 'react';
//chapter 10
// format function converts to string
function format(num) {
    return num != null ? num.toString() : '';
}

//unformat function converts to number
function unformat(str) {
    const val = parseInt(str, 10);
    return Number.isNaN(val) ? null : val;
}

export default class NumInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: format(props.value) };
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    // set State to input value
    onChange(e) {
        if (e.target.value.match(/^\d*$/)) {
            this.setState({ value: e.target.value });
        }
    }
    //call the unformat function, parse value to it
    onBlur(e) {
        const { onChange } = this.props;
        const { value } = this.state;
        onChange(e, unformat(value));
    }

    render() {
        //get current state value
        const { value } = this.state;
        return (
            <input
                type="text"
                {...this.props}
                value={value}
                onBlur={this.onBlur}
                onChange={this.onChange}
            />
        );
    }
}
