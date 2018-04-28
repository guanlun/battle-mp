import React from 'react';
import request from 'request';

function connectToWebSocketServer(gameId) {
    const wsAddr = `ws://localhost:4001`;
    const wsConn = new WebSocket(wsAddr);

    wsConn.onopen = () => {
        console.log('connected to ws server');

        wsConn.send(JSON.stringify({
            type: 'join',
            payload: {
                gameId
            },
        }));
    }

    wsConn.onmessage = event => {
        const data = JSON.parse(event.data);
        console.log(data)
    }

}

export default class MainGame extends React.Component {
    componentWillMount() {
        const gameId = this.props.match.params.gameId;
        connectToWebSocketServer(gameId);
    }

    render() {
        return (
            <div>main</div>
        )
    }
}