import React from 'react';

import FormationDesigner from './FormationDesigner';
// import BattleField from './BattleField';

const CROSS_SIZE = 5;

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

    renderWeapon(weapon, ctx) {
        weapon.offsetAngle = Math.PI / 4 * (1 - weapon.currAttackFrame / 30);
        ctx.save();
        ctx.rotate(weapon.offsetAngle);

        ctx.beginPath();
        ctx.moveTo(weapon.startPos.x, weapon.startPos.y);
        ctx.lineTo(weapon.startPos.x, weapon.startPos.y - weapon.length);
        ctx.quadraticCurveTo(weapon.startPos.x - 5, weapon.startPos.y + 3, weapon.startPos.x, weapon.startPos.y);
        ctx.closePath();

        ctx.moveTo(weapon.startPos.x - 4, weapon.startPos.y - 2);
        ctx.lineTo(weapon.startPos.x + 3, weapon.startPos.y - 2);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
    }

    renderSoldier(soldier, ctx, color) {
        const {x, y} = soldier.position;

        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        ctx.save();

        const facing = Math.atan2(soldier.facing.y, soldier.facing.x) + Math.PI / 2;
        ctx.translate(x, y);
        ctx.rotate(facing);

        ctx.beginPath();
        if (soldier.alive) {
            ctx.arc(0, 0, soldier.dimension, 0, Math.PI * 2);
            ctx.fill();

            this.renderWeapon(soldier.weapon, ctx);
        } else {
            ctx.moveTo(-CROSS_SIZE, -CROSS_SIZE);
            ctx.lineTo(CROSS_SIZE, CROSS_SIZE);
            ctx.closePath();

            ctx.moveTo(-CROSS_SIZE, CROSS_SIZE);
            ctx.lineTo(CROSS_SIZE, -CROSS_SIZE);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    }

    updateBattleState(battleState) {
        this.ctx.clearRect(0, 0, 1200, 600);

        // this.ctx.fillStyle = 'red';
        for (const rs of battleState.red) {
            // this.ctx.fillRect(rs.x - 5, rs.y - 5, 10, 10);
            this.renderSoldier(rs, this.ctx, 'red');
        }

        // this.ctx.fillStyle = 'blue';
        for (const bs of battleState.blue) {
            // this.ctx.fillRect(bs.x - 5, bs.y - 5, 10, 10);
            this.renderSoldier(bs, this.ctx, 'blue');
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