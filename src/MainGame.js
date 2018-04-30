import React from 'react';

import FormationDesigner from './FormationDesigner';
// import BattleField from './BattleField';

export default class MainGame extends React.Component {
    constructor() {
        super();
        this.state = {
            status: 'none',
            playerIdx: null,
        };
    }

    componentDidMount() {
        this.refs.usernameInput.value = 'test1';

        this.ctx = this.refs.battleCanvas.getContext('2d');
    }

    displayStyleOfState(status) {
        return {
            display: (this.state.status === status) ? 'block' : 'none',
        };
    }

    render() {
        const { status, playerIdx, battleState } = this.state;

        return (
            <div>
                <div style={this.displayStyleOfState('none')}>
                    <input
                        ref="usernameInput"
                        type="text"
                        placeholder="Your name here" />
                    <button onClick={this.handleJoinButtonClick.bind(this)}>Join</button>
                </div>
                <div style={this.displayStyleOfState('waiting')}>
                    Waiting for the other player
                </div>
                <div style={this.displayStyleOfState('ready')}>
                    <FormationDesigner
                        playerIdx={playerIdx}
                        onFormationComplete={this.handleFormationComplete.bind(this)} />
                </div>
                <div style={this.displayStyleOfState('fighting')}>
                    <canvas ref="battleCanvas" width="1200" height="600" />
                </div>
            </div>
        )
    }

    updateBattleState(battleState) {
        this.ctx.clearRect(0, 0, 1200, 600);

        this.ctx.fillStyle = 'red';
        for (const rs of battleState.red) {
            this.ctx.fillRect(rs.x - 5, rs.y - 5, 10, 10);
        }

        this.ctx.fillStyle = 'blue';
        for (const bs of battleState.blue) {
            this.ctx.fillRect(bs.x - 5, bs.y - 5, 10, 10);
        }
    }

    handleJoinButtonClick() {
        const gameId = this.props.match.params.gameId;
        this.username = this.refs.usernameInput.value;

        if (!this.username) {
            return;
        }

        this.wsConn = new WebSocket(`ws://localhost:4001`);

        this.wsConn.onopen = () => {
            console.log('connected to ws server');

            this.wsConn.send(JSON.stringify({
                type: 'join',
                payload: { gameId, username: this.username },
            }));
        }

        this.wsConn.onmessage = event => {
            const data = JSON.parse(event.data);
            this.processWebSocketMessage(data);
        }
    }

    handleFormationComplete(soldiers) {
        const gameId = this.props.match.params.gameId;

        this.wsConn.send(JSON.stringify({
            type: 'formationComplete',
            payload: {
                gameId,
                username: this.username,
                soldiers
            },
        }));

        this.setState({
            status: 'fighting',
        });
    }

    processWebSocketMessage(msg) {
        switch (msg.type) {
            case 'joined':
                this.setState({
                    status: 'waiting',
                });
                break;
            case 'ready':
                const playerIdx = msg.payload.playerIdx;
                this.setState({
                    status: 'ready',
                    playerIdx,
                });
                break;
            case 'battleUpdate':
                const battleState = msg.payload.battleState;

                this.updateBattleState(battleState);
                break;
        }
    }
}