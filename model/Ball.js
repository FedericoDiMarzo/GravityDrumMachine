import Sampler from "../sound/Sampler.js";
import SoundModule from "../sound/SoundModule.js";
import MathTools from "../utility/MathTools.js";
import PhysicsConstants from "../utility/PhysicsCostants.js";

//import MathTools from "./MathTools";


const BALL_COLORS = ["#55828B", "#E3655B", "#F0A202", "#46237A", "#3BAA4C",
    "#B79FAD", "#56A05B", "#F39B6D", "#6F5060"];

class Ball {
    /**
     * Class defining a ball in a canvas object.
     * @param x position
     * @param y position
     * @param vx velocity in x
     * @param vy velocity in y
     * @param size radius in pixel
     * @param color of the ball
     */
    constructor(x, y, vx, vy, size, color) {
        this.initX = x;
        this.initY = y;
        this.initVx = vx || 0;
        this.initVy = vy || 0;

        this.x = x;
        this.y = y;
        this.vx = vx || 0;
        this.vy = vy || 0;
        this.size = size || 30;
        let randColor = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
        this.color = color || randColor;
        this.density = 10e1; // standard density
        this.isSolid = false;
        this.isFixed = false;
        this.isFree = false;
        this.isMuted = false;
        this.isStepTriggered = false;
        this.note = "C3";
        this.soundModule = new Sampler("Perc 1.wav");

    }

    /**
     * Mass of the ball.
     * @return {number}
     */
    getMass() {
        return this.density * Math.pow(this.size, 2) * Math.PI;
    }

    /**
     * Sets ball initial position.
     *
     * @param x
     * @param y
     */
    setPosition(x, y) {
        this.initX = x;
        this.initY = y;
        this.x = x;
        this.y = y;
    }

    /**
     * Trigger a note from sound module.
     *
     * @param note
     */
    play(note) {
        // checks if the correct interface is used
        if (!(this.soundModule instanceof SoundModule)) {
            console.log("A proper sound module must be used.");
            return;
        }

        if (!this.isMuted) {
            this.soundModule.triggerNote(note);
        }
    }



    /**
     * Updates the state of the objects and
     * draws the ball inside the canvas.
     */
    update() {
        let vScale = 7e-6;
        let friction = PhysicsConstants.friction;

        if (!this.isFree) {
            this.vx -= this.vx * friction;
            this.vy -= this.vy * friction;
        }

        this.x += this.vx * vScale;
        this.y += this.vy * vScale;

        if (this.soundModule) {
            // panning
            let maxPan = 200; // in px
            let pan = this.x / maxPan;
            this.soundModule.setPan(pan);
        }

        this.updateSoundModule();
    }

    /**
     * Updates ball's sound module.
     */
    updateSoundModule() {
        if (this.soundModule) {
            let distance = MathTools.module([this.x, this.y]);
            let initDistance = MathTools.module([this.initX, this.initY]);
            let angle = Math.atan2(this.y, this.x);
            this.soundModule.update(distance, initDistance, angle);
        }
    }

    /**
     * Resets the ball to initial state;
     */
    reset() {
        this.x = this.initX;
        this.y = this.initY;
        this.vx = this.initVx;
        this.vy = this.initVy;

    }


    /**
     * Save a copy of the object to be jsonfied.
     *
     * @return {object}
     */
    exportCopy() {

        return {
            initX: this.initX,
            initY: this.initY,
            initVx: this.initVx,
            initVy: this.initVy,
            size: this.size,
            color: this.color,
            note: this.note,
            soundModule: this.soundModule.exportCopy(),
            isFixed: this.isFixed,
            isSolid: this.isSolid,
            isMuted: this.isMuted,
            isStepTriggered: this.isStepTriggered
        };

    }
}


export default Ball;