import React from 'react';

export default class FormationDesigner extends React.Component {
    constructor() {
        super();
        this.soldiers = [
            { x: 300, y: 100 },
            { x: 400, y: 200 },
            { x: 300, y: 300 },
        ];
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

        const leftSection = (playerIdx === 0) ? this.createDesignerSection() : this.createOpponentSection();
        const rightSection = (playerIdx === 1) ? this.createDesignerSection() : this.createOpponentSection();

        return (
            <div className="formation-designer">
                {leftSection}
                {rightSection}
            </div>
        );
    }

    createDesignerSection() {
        return (
            <div className="designer-section">
                <div>
                    <button onClick={this.handleCompleteFormationButtonClick.bind(this)}>Complete Formation</button>
                </div>
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

        this.soldiers.push({ x, y });
    }
}
