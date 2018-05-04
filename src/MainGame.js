import React from 'react';

import FormationDesigner from './FormationDesigner';
import { SERVER_HOST } from './Constants';
import { renderSoldier } from './SoldierRenderer';

const CANVAS_WIDTH = 1250;
const CANVAS_HEIGHT = 600;

export default class MainGame extends React.Component {
    constructor() {
        super();
        this.state = {
            status: 'none',
            playerIdx: null,
            opponentName: '',
        };
    }

    componentDidMount() {
        this.wsConn = new WebSocket(`ws://${SERVER_HOST}:4001`);
        this.wsConn.onopen = () => {
            console.log('connected to ws server');
        }

        this.refs.usernameInput.value = 'test1';

        this.ctx = this.refs.battleCanvas.getContext('2d');

        window.onbeforeunload = () => {
            this.wsConn.send(JSON.stringify({
                type: 'exit',
                payload: { gameId: this.props.match.params.gameId, username: this.username },
            }));
        }
    }

    displayStyleOfState(...status) {
        return {
            display: (status.indexOf(this.state.status) !== -1) ? 'block' : 'none',
        };
    }

    render() {
        const { status, playerIdx, opponentName, battleState } = this.state;

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
                        opponentName={opponentName}
                        onFormationComplete={this.handleFormationComplete.bind(this)} />
                </div>
                <div style={this.displayStyleOfState('deployed')}>
                    Waiting for the enemy to deploy
                </div>
                <div style={this.displayStyleOfState('fighting', 'ended')}>
                    <canvas ref="battleCanvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
                    <div style={this.displayStyleOfState('ended')}>
                        <div className="game-ended-overlay">
                            Game Ended
                            <button onClick={this.handleRematchButtonClick.bind(this)}>Rematch</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    updateBattleState(battleState) {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        for (const rs of battleState.red) {
            renderSoldier(this.ctx, rs, 'red');
        }

        for (const bs of battleState.blue) {
            renderSoldier(this.ctx, bs, 'blue');
        }
    }

    handleJoinButtonClick() {
        const gameId = this.props.match.params.gameId;
        this.username = this.refs.usernameInput.value;

        if (!this.username) {
            return;
        }

        this.wsConn.send(JSON.stringify({
            type: 'join',
            payload: { gameId, username: this.username },
        }));

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
            status: 'deployed',
        });
    }

    handleRematchButtonClick() {
        const gameId = this.props.match.params.gameId;

        this.wsConn.send(JSON.stringify({
            type: 'rematch',
            payload: {
                gameId,
                username: this.username,
            },
        }));
    }

    processWebSocketMessage(msg) {
        switch (msg.type) {
            case 'joined':
                this.setState({
                    status: 'waiting',
                });
                break;
            case 'ready':
                this.setState({
                    status: 'ready',
                    playerIdx: msg.payload.playerIdx,
                    opponentName: msg.payload.opponentName,
                });
                break;
            case 'duplicatedPlayer':
                alert('This username has been taken');
                break;
            case 'maxPlayerNum':
                alert('Max player number reached');
                break;
            case 'opponentExit':
                alert('opponent left')
                break;
            case 'rejoin':
                this.setState({
                    status: 'fighting',
                });
                break;
            case 'battleStarted':
                this.setState({
                    status: 'fighting',
                });
                break;
            case 'battleUpdate':
                const battleState = msg.payload.battleState;

                this.updateBattleState(battleState);
                break;
            case 'ended':
                this.setState({
                    status: 'ended',
                    winner: msg.payload.winner,
                });
                break;
            case 'rematchReady':
                this.setState({
                    status: 'ready',
                });
                break;
        }
    }
}