import React from 'react';
import request from 'request';

import { SERVER_HOST } from './Constants';

export default class GameMenu extends React.Component {
    render() {
        return (
            <div className="game-menu-container">
                <div className="game-menu">
                    <div className="game-menu-field">
                        <h1>Battle Simulator</h1>
                        <p>Invite your friends to fight you on the field.</p>
                    </div>
                    <div className="game-menu-field">
                        <button onClick={this.handleCreateGameButtonClick.bind(this)}>Create Game</button>
                    </div>
                    <div className="game-menu-field">
                        <button>Join Game</button>
                    </div>
                </div>
            </div>
        )
    }

    handleCreateGameButtonClick() {
        request({
            uri: `http://${SERVER_HOST}:4000/createGame`,
            method: 'POST',
            json: {
            }
        }, (err, res, body) => {
            const gameId = body.id;
            window.location = `#/${gameId}`;
        });
    }
}