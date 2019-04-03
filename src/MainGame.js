import React from 'react';

import Simulator from './Simulator';
import FormationDesigner from './FormationDesigner';
import { SERVER_HOST } from './Constants';
import { renderSoldier, renderProjectile } from './SoldierRenderer';

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

    opacityStyleOfState(...status) {
        return {
            opacity: (status.indexOf(this.state.status) !== -1) ? 1 : 0,
        };
    }

    render() {
        const { status, playerIdx, opponentName, battleState } = this.state;

        return (
            <div className="main-game-container">
                <div className="game-status-item" style={this.displayStyleOfState('none', 'waiting')}>
                    <div className="game-menu-container">
                        <div className="game-menu">
                            <div className="game-menu-field">
                                <p>Enter your nickname:</p>
                            </div>
                            <div className="game-menu-field">
                                <input
                                    ref="usernameInput"
                                    type="text"
                                    placeholder="Your name here" />
                            </div>
                            <div className="game-menu-field">
                                <button
                                    disabled={status === 'waiting'}
                                    onClick={this.handleJoinButtonClick.bind(this)}>
                                    Join
                                </button>
                            </div>
                            <div className="game-menu-field game-status-item" style={this.opacityStyleOfState('waiting')}>
                                Waiting for the other player to join
                            </div>
                        </div>
                    </div>
                </div>
                <div className="game-status-item" style={this.displayStyleOfState('readyToDesignFormation')}>
                    <FormationDesigner
                        playerIdx={playerIdx}
                        opponentName={opponentName}
                        onFormationComplete={this.handleFormationComplete.bind(this)} />
                </div>
                <div className="game-status-item" style={this.displayStyleOfState('deployed')}>
                    Waiting for the enemy to deploy
                </div>
                <div className="game-status-item" style={this.displayStyleOfState('fighting', 'ended', 'waitingForOpponentRematch')}>
                    <canvas ref="battleCanvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
                    <div style={this.displayStyleOfState('ended', 'waitingForOpponentRematch')}>
                        <div className="game-ended-overlay">
                            <div className="game-menu">
                                <h3>Game Ended</h3>
                                <button onClick={this.handleRematchButtonClick.bind(this)}>Rematch</button>
                                <div style={this.displayStyleOfState('waitingForOpponentRematch')}>
                                    Waiting for opponent to click rematch
                                </div>
                            </div>
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

        for (const projectile of battleState.projectiles) {
            renderProjectile(this.ctx, projectile);
        }
    }

    handleGameEnd() {
        const gameId = this.props.match.params.gameId;

        this.wsConn.send(JSON.stringify({
            type: 'simulationEnded',
            payload: { gameId, username: this.username },
        }));
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

        this.setState({
            status: 'waitingForOpponentRematch',
        });

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
                    status: 'readyToDesignFormation',
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

                this.simulator = new Simulator(msg.payload.soldiers, msg.payload.randomSeed, this);
                this.simulator.start();

                break;
            case 'ended':
                this.setState({
                    status: 'ended',
                    winner: msg.payload.winner,
                });
                break;
            case 'rematchReady':
                this.setState({
                    status: 'readyToDesignFormation',
                });
                break;
        }
    }
}