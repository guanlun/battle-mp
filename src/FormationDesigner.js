import React from 'react';
import { renderSoidierAdpter } from './DesignerRenderAdapter';

const SOLDIER_TYPES = [
    { weapon: 'sword', displayText: 'Swordsman' },
    { weapon: 'spear', displayText: 'Spear' },
    { weapon: 'shield', displayText: 'Shield' },
    { weapon: 'horse', displayText: 'Horseman' },
];

const KEY_CODE_SOLDIER_TYPE_MAPPING = {
    49: 'sword',
    50: 'spear',
    51: 'shield',
    52: 'horse',
};

const SOLDIER_PRICE = {
    sword: 50,
    spear: 80,
    shield: 70,
    horse: 150,
}

export default class FormationDesigner extends React.Component {
    constructor() {
        super();
        this.soldiers = [];

        this.state = {
            remainingMoney: 3000,

            activeSoldierType: 'sword',
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', event => {
            const activeSoldierType = KEY_CODE_SOLDIER_TYPE_MAPPING[event.keyCode];
            if (activeSoldierType) {
                this.setState({
                    activeSoldierType,
                });
            }
        });
    }

    componentDidUpdate() {
        if (this.props.playerIdx !== undefined && this.props.playerIdx !== null && !this.ctx) {
            this.ctx = this.refs.designerCanvas.getContext('2d');
        }
    }

    render() {
        const { playerIdx } = this.props;
        const { activeSoldierType, remainingMoney } = this.state;

        const leftSection = (playerIdx === 0) ? this.createDesignerSection() : this.createOpponentSection();
        const rightSection = (playerIdx === 1) ? this.createDesignerSection() : this.createOpponentSection();

        return (
            <div className="formation-designer">
                <div>
                    <button onClick={this.handleCompleteFormationButtonClick.bind(this)}>Complete Formation</button>
                    <div>Remaining money: {remainingMoney}</div>
                </div>
                <div className="soldier-selector">
                    {SOLDIER_TYPES.map(st => (
                        <div
                            key={`soldier-type-${st.weapon}`}
                            className={`soldier-selector-option ${st.weapon === activeSoldierType ? 'active' : ''}`}
                            onClick={() => this.handleSoldierTypeSelect(st.weapon)}>
                            {st.displayText}
                        </div>
                    ))}
                </div>
                <div className="design-sections-container">
                    {leftSection}
                    {rightSection}
                </div>
            </div>
        );
    }

    createDesignerSection() {
        return (
            <div className="designer-section">
                <canvas
                    ref="designerCanvas"
                    className="designer-canvas"
                    width="600"
                    height="600"
                    onClick={this.handleCanvasClick.bind(this)} />
            </div>
        )
    }

    createOpponentSection() {
        return (
            <div className="designer-section designer-opponent-section">
                Opponent Army
            </div>
        )
    }

    handleCompleteFormationButtonClick() {
        this.props.onFormationComplete(this.soldiers);
    }

    handleCanvasClick(evt) {
        const { remainingMoney, activeSoldierType} = this.state;
        const price = SOLDIER_PRICE[activeSoldierType];

        if (remainingMoney >= price) {
            const x = evt.nativeEvent.offsetX;
            const y = evt.nativeEvent.offsetY;

            const side = this.props.playerIdx === 0 ? 'red' : 'blue';

            const soldier = {
                x,
                y,
                type: activeSoldierType,
            };

            renderSoidierAdpter(this.ctx, soldier, side);

            this.soldiers.push(soldier);

            this.setState({
                remainingMoney: remainingMoney - price,
            });
        }
    }

    handleSoldierTypeSelect(activeSoldierType) {
        this.setState({ activeSoldierType });
    }
}
