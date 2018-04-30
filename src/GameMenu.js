import React from 'react';
import request from 'request';

import { SERVER_HOST } from './Constants';

export default class GameMenu extends React.Component {
    render() {
        return (
            <div className="game-menu">
                <div className="game-type-menu">
                    <button onClick={this.handleCreateGameButtonClick.bind(this)}>Create Game</button>
                    <button>Join Game</button>
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
            console.log(body)
            const gameId = body.id;
            window.location = `#/${gameId}`;
        });
    }
}