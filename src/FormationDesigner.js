import React from 'react';
import { renderSoidierAdpter } from './DesignerRenderAdapter';

const SOLDIER_TYPES = [
    { weapon: 'sword', displayText: 'Swordsman' },
    { weapon: 'spear', displayText: 'Spear' },
    { weapon: 'shield', displayText: 'Shield' },
    { weapon: 'horse', displayText: 'Horseman' },
];

export default class FormationDesigner extends React.Component {
    constructor() {
        super();
        this.soldiers = [];

        this.state = {
            activeSoldierType: 'sword',
        }
    }

    componentDidUpdate() {
        if (this.props.playerIdx !== undefined && this.props.playerIdx !== null && !this.ctx) {
            this.ctx = this.refs.designerCanvas.getContext('2d');
        }
    }

    render() {
        const { playerIdx } = this.props;
        const { activeSoldierType } = this.state;

        const leftSection = (playerIdx === 0) ? this.createDesignerSection() : this.createOpponentSection();
        const rightSection = (playerIdx === 1) ? this.createDesignerSection() : this.createOpponentSection();

        return (
            <div className="formation-designer">
                <div>
                    <button onClick={this.handleCompleteFormationButtonClick.bind(this)}>Complete Formation</button>
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
        const x = evt.nativeEvent.offsetX;
        const y = evt.nativeEvent.offsetY;

        const side = this.props.playerIdx === 0 ? 'red' : 'blue';

        const soldier = {
            x,
            y,
            type: this.state.activeSoldierType,
        }

        renderSoidierAdpter(this.ctx, soldier, side);

        this.soldiers.push(soldier);
    }

    handleSoldierTypeSelect(activeSoldierType) {
        this.setState({ activeSoldierType });
    }
}
