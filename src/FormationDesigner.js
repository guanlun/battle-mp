import React from 'react';

const SOLDIER_TYPES = [
    { weapon: 'sword', displayText: 'Swordsman' },
    { weapon: 'spear', displayText: 'Spear' },
    { weapon: 'shield', displayText: 'Shield' },
    { weapon: 'horse', displayText: 'Horseman' },
];

export default class FormationDesigner extends React.Component {
    constructor() {
        super();
        this.soldiers = [
            { x: 300, y: 100, type: 'sword' },
            { x: 400, y: 200, type: 'sword' },
            { x: 300, y: 300, type: 'sword' },
        ];

        this.state = {
            activeSoldierType: 'sword',
        }
    }

    componentDidUpdate() {
        if (this.props.playerIdx !== undefined && this.props.playerIdx !== null && !this.ctx) {
            this.ctx = this.refs.designerCanvas.getContext('2d');
            this.ctx.fillStyle = 'red';

            for (const s of this.soldiers) {
                this.ctx.fillRect(s.x, s.y, 10, 10);
            }
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
            <div className="designer-section">
                opponent
            </div>
        )
    }

    handleCompleteFormationButtonClick() {
        this.props.onFormationComplete(this.soldiers);
    }

    handleCanvasClick(evt) {
        const x = evt.nativeEvent.offsetX;
        const y = evt.nativeEvent.offsetY;

        this.ctx.fillRect(x, y, 10, 10);

        this.soldiers.push({
            x,
            y,
            type: this.state.activeSoldierType,
        });
    }

    handleSoldierTypeSelect(activeSoldierType) {
        this.setState({ activeSoldierType });
    }
}
