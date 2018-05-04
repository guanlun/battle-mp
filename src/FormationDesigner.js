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
    spear: 90,
    shield: 70,
    horse: 200,
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

const SPACING = 20;

const MAX_MONEY = 3000;

export default class FormationDesigner extends React.Component {
    constructor() {
        super();
        this.soldiers = [];
        this.bufferedSoldiers = [];

        this.dragging = false;
        this.dragStartPos = {
            x: 0,
            y: 0,
        };

        this.state = {
            remainingMoney: MAX_MONEY,
            bufferedSoldiersPrice: 0,
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
                this.soldiers = this.transformFormation(savedFormations[savedFormations.length - 1]);
            }

            this.setState({
                savedFormations,
            })

            this.udpateFormation();
        }
    }

    render() {
        const { playerIdx } = this.props;
        const { activeSoldierType, remainingMoney, bufferedSoldiersPrice, savedFormations } = this.state;

        const leftSection = (playerIdx === 0) ? this.createDesignerSection() : this.createOpponentSection();
        const rightSection = (playerIdx === 1) ? this.createDesignerSection() : this.createOpponentSection();

        return (
            <div className="formation-designer">
                <div>
                    <button onClick={this.handleCompleteFormationButtonClick.bind(this)}>Complete Formation</button>
                    <div>Remaining money: {remainingMoney - bufferedSoldiersPrice}</div>
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
                    <button onClick={this.handleClearButtonClick.bind(this)}>Clear</button>
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
                    onMouseDown={this.handleCanvasMouseDown.bind(this)}
                    onMouseMove={this.handleCanvasMouseMove.bind(this)}
                    onMouseUp={this.handleCanvasMouseUp.bind(this)} />
            </div>
        );
    }

    createOpponentSection() {
        return (
            <div className="designer-section designer-opponent-section">
                {this.props.opponentName}'s Army
            </div>
        );
    }

    udpateFormation(renderBuffered = false) {
        let totalPrice = 0;

        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (const s of this.soldiers) {
            renderSoidierAdpter(this.ctx, s, this.props.playerIdx === 0 ? 'red' : 'blue');

            totalPrice += SOLDIER_PRICE[s.type];
        }

        let bufferedSoldiersPrice = 0;

        if (renderBuffered) {
            for (const s of this.bufferedSoldiers) {
                renderSoidierAdpter(this.ctx, s, this.props.playerIdx === 0 ? 'red' : 'blue');

                bufferedSoldiersPrice += SOLDIER_PRICE[s.type];
            }
        }

        this.setState({
            remainingMoney: MAX_MONEY - totalPrice,
            bufferedSoldiersPrice,
        });
    }

    handleCompleteFormationButtonClick() {
        this.props.onFormationComplete(this.soldiers);
    }

    handleCanvasMouseDown(event) {
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;

        this.dragStartPos = { x, y };
        this.dragging = true;

        if (this.state.remainingMoney - SOLDIER_PRICE[this.state.activeSoldierType] >= 0) {
            this.bufferedSoldiers = [{
                x,
                y,
                type: this.state.activeSoldierType,
            }];
        }

        this.udpateFormation(true);
    }

    handleCanvasMouseMove(event) {
        if (!this.dragging) {
            return;
        }

        const xEnd = event.nativeEvent.offsetX;
        const yEnd = event.nativeEvent.offsetY;

        const xDiff = xEnd - this.dragStartPos.x;
        const yDiff = yEnd - this.dragStartPos.y;

        if (Math.abs(xDiff) + Math.abs(yDiff) < 3) {
            return;
        }

        const dragSlope = Math.atan2(xDiff, yDiff);
        const xStep = SPACING * Math.sin(dragSlope);
        const yStep = SPACING * Math.cos(dragSlope);

        const numSoldiers = Math.floor(xDiff / xStep);

        const soldierType = this.state.activeSoldierType;

        this.bufferedSoldiers = [];

        for (let soldierIdx = 0; soldierIdx < numSoldiers; soldierIdx++) {
            if (this.state.remainingMoney - (soldierIdx + 1) * SOLDIER_PRICE[soldierType] >= 0) {
                this.bufferedSoldiers.push({
                    x: this.dragStartPos.x + soldierIdx * xStep,
                    y: this.dragStartPos.y + soldierIdx * yStep,
                    type: soldierType,
                });
            }
        }

        this.udpateFormation(true);
    }

    handleCanvasMouseUp(event) {
        const x = event.nativeEvent.offsetX;
        const y = event.nativeEvent.offsetY;

        this.dragging = false;

        this.soldiers = this.soldiers.concat(this.bufferedSoldiers);

        this.bufferedSoldiers = [];

        this.udpateFormation();
    }

    handleSoldierTypeSelect(activeSoldierType) {
        this.setState({ activeSoldierType });
    }

    handleClearButtonClick() {
        this.soldiers = [];
        this.udpateFormation();
    }

    handleSaveFormationButtonClick() {
        // TODO: optimize storage space
        if (this.soldiers.length === 0) {
            return;
        }

        const formations = this.loadSavedFormations();
        const formation = this.transformFormation(this.soldiers);

        formations.push(formation);

        window.localStorage.setItem('formations', JSON.stringify(formations));
    }

    handleLoadFormationClick(formation) {
        this.soldiers = this.transformFormation(formation);
        this.udpateFormation();
    }

    loadSavedFormations() {
        const savedFormations = JSON.parse(window.localStorage.getItem('formations'));
        if (Array.isArray(savedFormations)) {
            return savedFormations;
        } else {
            return [];
        }
    }

    transformFormation(formation) {
        return formation.map(s => ({
            x: (this.props.playerIdx === 0) ? s.x : CANVAS_WIDTH - s.x, // reverse formation as blue army
            y: s.y,
            type: s.type,
        }));
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
