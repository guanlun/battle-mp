import React from 'react';
import request from 'request';

export default class MainGame extends React.Component {
    render() {
        console.log(this.props.match.params)
        return (
            <div>main game</div>
        )
    }
}