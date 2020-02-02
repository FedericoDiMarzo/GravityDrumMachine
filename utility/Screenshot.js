import DrumGrid from "../model/DrumGrid.js";
import Ball from "../model/Ball.js";
import DrumSequence from "../model/DrumSequence.js";
import DrumUniverse from "../model/DrumUniverse.js";
import GravityBall from "../model/GravityBall.js";
import MathTools from "./MathTools.js";
import Sampler from "../sound/Sampler.js";
import MonoSynth from "../sound/MonoSynth.js";
import FxWrapper from "../sound/FxWrapper.js";
import PhysicsConstants from "./PhysicsCostants.js";

class Screenshot {
    /**
     * Class used for exporting and loading copies
     * of the model.
     */
    constructor() {
        this.reader = new FileReader();
        this.loadedScreenshot = new Promise(resolve => {

            this.reader.onload = () => {
                resolve(JSON.parse(this.reader.result));
            };
        });
    }


    /**
     * Saves a deepCopy of the model into a blob, and
     * creates a download url.
     *
     * @param grid
     * @param metronome
     * @param name
     * @return {string} url
     */
    generateUrl(grid, metronome, name) {
        let data = [];
        data.push(grid.exportCopy()); // grid data
        data.push({
            bpm: metronome.bpm,
            name: name,
            delayTime: FxWrapper.delay.delayTime.value,
            delayFeedback: FxWrapper.delay.feedback.value,
            reverbSize: FxWrapper.reverb.roomSize.value,
            g: PhysicsConstants.g,
            friction: PhysicsConstants.friction
        });

        let blob = new Blob(
            [JSON.stringify(data)],
            {
                type: "application/json",
                name: name
            });
        return URL.createObjectURL(blob);
    }

    /**
     * Load a json file from filesystem.
     *
     * @param e input event
     */
    load(e) {
        this.reader.readAsText(e.target.files[0]);
    }


    /**
     * Generates an universe from a object loaded from
     * a JSON file
     *
     * @param obj
     * @return {DrumUniverse}
     */
    getUniverse(obj) {

        // balls
        let balls = [];
        obj.balls.forEach(b => {
            let ball = new Ball(
                parseFloat(b.initX),
                parseFloat(b.initY),
                parseFloat(b.initVx),
                parseFloat(b.initVy),
                parseFloat(b.size),
                b.color
            );

            ball.note = b.note;
            // ball.isFixed = b.isFixed;
            // ball.isSolid = b.isSolid;
            // ball.isMuted = b.isMuted;
            ball.isFree = b.isFree;
            ball.isStepTriggered = b.isStepTriggered;
            ball.soundModule = this.getSoundModule(b.soundModule);
            balls.push(ball);
        });

        // gCenter
        let gCenter = new GravityBall(
            parseFloat(obj.gCenter.initX),
            parseFloat(obj.gCenter.initY),
            parseFloat(obj.gCenter.size),
        );
        gCenter.isMuted = obj.gCenter.isMuted;
        gCenter.note = obj.gCenter.note;
        gCenter.soundModule = this.getSoundModule(obj.gCenter.soundModule);
        gCenter.targets = balls;

        return new DrumUniverse(balls, gCenter);

    }

    /**
     * Generate a sound module from json object
     *
     * @param obj
     * @return {SoundModule}
     */
    getSoundModule(obj) {
        let soundModule = null;

        switch (obj.type) {
            case "sampler":
                soundModule = new Sampler();
                break;

            case "monosynth":
                soundModule = new MonoSynth();
                break;

            default:
                console.log("Sound Module type not recognized");
        }

        if (soundModule) {
            soundModule.setParameters(obj);
        }

        return soundModule;
    }

    /**
     * Generates a grid from an object loaded from
     * a JSON file
     *
     * @param obj
     * @return {DrumGrid}
     */
    getGrid(obj) {
        let object = obj[0];

        let sequenceList = [];
        object.sequenceList.forEach(s => {
            let drumUniverseList = [];
            s.universeList.forEach(u => {
                drumUniverseList.push(this.getUniverse(u));
            });
            let drumSequence = new DrumSequence(drumUniverseList);
            let timeDivision = MathTools.string2Fraction(s.timeDivision);
            drumSequence.setTimeDivision(timeDivision.num, timeDivision.den);
            sequenceList.push(drumSequence);
        });

        return new DrumGrid(sequenceList);
    }

    /**
     * Returns the name of the loaded project.
     *
     * @param obj
     * @return {String}
     */
    getName(obj) {
        return obj[1].name;
    }

    /**
     * Returns the bpm of the loaded project.
     *
     * @param obj
     * @return {number}
     */
    getBpm(obj) {
        return obj[1].bpm;
    }

    /**
     * Returns fx settings of loaded project.
     *
     * @param obj
     * @return {{delayFeedback: *, delayTime: *, reverbSize: *}}
     */
    getFxSettings(obj) {
        return {
            delayTime: obj[1].delayTime,
            delayFeedback: obj[1].delayFeedback,
            reverbSize: obj[1].reverbSize
        }
    }

    /**
     * Returns physics settings of loaded project.
     *
     * @param obj
     * @return {{g: *, friction: *}}
     */
    getPhysicConstants(obj) {
        return {//TODO: remove comment
            g: obj[1].g,
            friction: obj[1].friction
        }
    }


}

export default Screenshot;