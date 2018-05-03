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

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

export default class FormationDesigner extends React.Component {
    constructor() {
        super();
        this.soldiers = [];

        this.state = {
            remainingMoney: 3000,
            activeSoldierType: 'sword',
            savedFormations: [],
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

            const savedFormations = this.loadSavedFormations();
            if (savedFormations.length > 0) {
                this.soldiers = savedFormations[savedFormations.length - 1];
            }

            this.setState({
                savedFormations,
            })

            this.renderCurrentFormation();
        }
    }

    render() {
        const { playerIdx } = this.props;
        const { activeSoldierType, remainingMoney, savedFormations } = this.state;

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
                <div className="designer-adv-control">
                    <button onClick={this.handleSaveFormationButtonClick.bind(this)}>Save Formation</button>
                    <div className="designer-load-formation">
                        <div>Load Formation</div>
                        <div className="saved-formation-list">
                            {savedFormations.map((formation, idx) => (
                                <div
                                    key={`saved-formation-${idx}`}
                                    className="saved-formation-item"
                                    onClick={() => this.handleLoadFormationClick(formation)}>
                                    <div className="formation-summary-text">{this.summarizeFormation(formation)}</div>
                                    <div className="formation-delete-btn">x</div>
                                </div>
                            ))}
                        </div>
                    </div>
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
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onClick={this.handleCanvasClick.bind(this)} />
            </div>
        );
    }

    createOpponentSection() {
        return (
            <div className="designer-section designer-opponent-section">
                Opponent Army
            </div>
        );
    }

    renderCurrentFormation() {
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (const s of this.soldiers) {
            renderSoidierAdpter(this.ctx, s, this.props.playerIdx === 0 ? 'red' : 'blue');
        }
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

    handleSaveFormationButtonClick() {
        // TODO: optimize storage space
        if (this.soldiers.length === 0) {
            return;
        }

        const formations = this.loadSavedFormations();
        formations.push(this.soldiers);

        window.localStorage.setItem('formations', JSON.stringify(formations));
    }

    handleLoadFormationClick(formation) {
        this.soldiers = formation;
        this.renderCurrentFormation();
    }

    loadSavedFormations() {
        const savedFormationStr = window.localStorage.getItem('formations');
        return savedFormationStr ? JSON.parse(savedFormationStr) : [];
    }

    summarizeFormation(formation) {
        const typeCount = {};
        for (const soldier of formation) {
            if (typeCount[soldier.type]) {
                typeCount[soldier.type]++;
            } else {
                typeCount[soldier.type] = 1;
            }
        }

        let summary = '';

        for (const type of SOLDIER_TYPES) {
            const numInType = typeCount[type.weapon];

            if (numInType > 0) {
                summary += `${type.displayText} x ${numInType}  `;
            }
        }

        return summary;
    }
}
