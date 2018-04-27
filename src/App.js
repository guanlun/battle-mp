import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import GameMenu from './GameMenu';
import MainGame from './MainGame';
import './App.css';

class App extends Component {
    render() {
        return (
            <div className="App">
                <Switch>
                    <Route path="/:gameId" component={MainGame} />
                    <Route path="/" component={GameMenu} />
                </Switch>
            </div>
        );
    }
}

export default App;
