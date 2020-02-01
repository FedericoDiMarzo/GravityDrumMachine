import MathTools from "./MathTools.js";
import GravityBall from "../model/GravityBall.js";

class GraphicRenderer {

    /**
     * Manage the rendering process.
     */
    constructor(grid) {
        this.canvas = document.querySelector("#gravity-canvas");
        this.isUniverseView = false;
        this.bgColor = "#EFF6E0";
        this.currentRow = 0;
        this.drumGrid = grid;
        this.bgColor = "#FFF";
        this.scaleFactor = 4;
        this.universeBuffer = [];
        this.universeBufferLength = 2;

    }


    /**
     * Function for graphical rendering.
     */
    startRendering() {
        this.enlargedRender();
    }

    /**
     * Rendering for Universe view.
     */
    enlargedRender() {
        if (this.isUniverseView) {
            let currentSequence = this.drumGrid.sequenceList[this.currentRow];
            let currentUniverse = currentSequence.getCurrentUniverse();
            let currentIndex = currentSequence.index;
            this._enlargedRenderer(currentUniverse, 1, true);

            // updating the buffer
            this.universeBuffer = [];
            let count = 0;
            for (let i = currentIndex - 1; i >= 0; i--) {
                this.universeBuffer.push(currentSequence.drumUniverseList[i]);

                if (++count >= this.universeBufferLength) {
                    break;
                }
            }

            // trace of old universes
            let beta = 0.2;
            this.universeBuffer.forEach(bufferedUniverse => {
                let opacity = beta;
                beta *= beta;
                this._enlargedRenderer(bufferedUniverse, opacity, false);
            });

        }


        // looping
        window.requestAnimationFrame(this.enlargedRender.bind(this));
    }

    _enlargedRenderer(universe, opacity, isMainUniverse) {
        let ctx = this.canvas.getContext("2d");
        let drumUniverse = universe;


        if (isMainUniverse) {
            // updated just for current universe
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;

            ctx.fillStyle = this.bgColor;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        let xc = this.canvas.width / 2;
        let yc = this.canvas.height / 2;

        // rendering drumUniverse
        let targets = drumUniverse.balls.concat(drumUniverse.gCenter);

        if (targets) {
            targets.forEach(el => {
                if (!isMainUniverse && (el instanceof GravityBall)) {
                    return;
                }
                // gravity balls are rendered for current universe only
                let color = MathTools.hex2rgba(el.color, opacity);
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.arc(el.x + xc, el.y + yc, el.size, 0, 2 * Math.PI);
                if (el.isMuted) {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }

            });

        }

    }

    /**
     * Renders a particular universe's preview into a canvas.
     *
     * @param canvas
     * @param sequenceIndex
     * @param universeIndex
     */
    renderCanvas(canvas, sequenceIndex, universeIndex) {
        let drumUniverse = this.drumGrid.sequenceList[sequenceIndex].drumUniverseList[universeIndex];
        let cellSize = canvas.width;
        let xc = cellSize / 2;
        let yc = xc;
        let ctx = canvas.getContext("2d");

        // play canvas
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, cellSize, cellSize);


        // rendering drumUniverse
        let targets = drumUniverse.balls.concat(drumUniverse.gCenter);

        if (targets) {
            let sf = this.scaleFactor;
            targets.forEach(el => {
                // drawing liveBalls scaled down by scaleFactor
                ctx.beginPath();
                ctx.fillStyle = el.color;
                ctx.strokeStyle = el.color;
                ctx.lineWidth = 2;
                ctx.arc(el.initX / sf + xc, el.initY / sf + yc, el.size / sf,
                    0, 2 * Math.PI);
                if (el.isMuted) {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
            });
        }
    }


}

export default GraphicRenderer;