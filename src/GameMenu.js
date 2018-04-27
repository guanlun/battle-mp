import React from 'react';
import request from 'request';

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
            uri: 'http://localhost:4000/createGame',
            json: {
            }
        }, (err, res, body) => {
            const gameId = body.id;
            window.location = `#/${gameId}`;
        });
    }
}