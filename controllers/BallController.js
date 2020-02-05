import CollisionChecker from "../state/CollisionChecker.js";
import Controller from "./Controller.js";
import Ball from "../model/Ball.js";
import GravityBall from "../model/GravityBall.js";
import MathTools from "../utility/MathTools.js";
import BallCannon from "../utility/BallCannon.js";
import Screenshot from "../utility/Screenshot.js";
import Sampler from "../sound/Sampler.js";
import MonoSynth from "../sound/MonoSynth.js";

class BallController {

    /**
     * Sub-controller used for balls handling.
     *
     * @param mainController
     */
    constructor(mainController) {
        this.mainController = mainController;
        this.canvas = document.querySelector("#gravity-canvas");
        this.currentUniverse = null;
        this.editedBall = null;
        this.dragEvent = null;
        this.dragging = false;
        this.collisionChecker = new CollisionChecker();
        this.minimumDraggingDistance = 10; // in px
        this.canvas.addEventListener("mousedown", this.canvasOnClick.bind(this));
        this.canvas.addEventListener("mouseup", this.canvasOnMouseup.bind(this));
        this.canvas.addEventListener("mousemove", this.canvasOnMousemove.bind(this));
        this.canvas.addEventListener("contextmenu", this.canvasRightClick.bind(this)); // right click

    }

    /**
     * Handles canvas left click.
     *
     * @param e mouse event
     */
    canvasOnClick(e) {
        if (this.mainController.metronome.playing ||
            this.mainController.alertOn ||
            this.mainController.sandwichMenuOn) {
            return;
        }

        let rightClick = e.which === 3;
        if (rightClick) {
            return;
        }

        this.dragEvent = null; // reset drag state


        let xc = this.mainController.canvas.width / 2;
        let yc = this.mainController.canvas.height / 2;
        let randSize = Math.round(Math.random() * 10) + 15;
        let ball = new Ball(e.offsetX - xc, e.offsetY - yc, 0, 0, randSize);
        let seqIndex = this.mainController.sequenceIndex;
        this.currentUniverse = this.mainController.grid.sequenceList[seqIndex].getCurrentUniverse();
        let universe = this.currentUniverse;
        this.collisionChecker.drumUniverse = universe;

        let flag = this.collisionChecker.checkSpace(ball);
        // there's room for an other ball
        if (flag === "no-ball") {
            universe.balls.push(ball);
        }
        // no room
        else if (flag === "ball-near") {
            console.log("No room for an other ball there.");
        }
        // ball clicked
        else {

            // selecting the ball to delete/drag
            if (!(flag instanceof GravityBall)) {
                this.dragEvent = {
                    ball: flag,
                    initDragX: e.offsetX,
                    initDragY: e.offsetY,
                    initBallX: flag.initX,
                    initBallY: flag.initY
                };
            }
            // muting/un-muting the gravity ball
            else {
                flag.isMuted = !flag.isMuted;
            }
        }

        // this.mainController.stateUpdater.updateStateList();
    }

    /**
     * Event on mouse up.
     *
     * @param e mouse event
     */
    canvasOnMouseup(e) {
        if (!this.dragEvent) {
            return;
        }

        if (!this.dragging) {
            // deleting the ball
            let index1 = this.currentUniverse.balls.indexOf(this.dragEvent.ball);
            this.currentUniverse.balls.splice(index1, 1);
        }

        // ends the dragging
        this.dragging = false;
        this.dragEvent = null;

    }

    /**
     * Event on mouse move.
     *
     * @param e mouse event
     */
    canvasOnMousemove(e) {
        if (!this.dragEvent) {
            return;
        }
        let xc = this.mainController.canvas.width / 2;
        let yc = this.mainController.canvas.height / 2;

        let drg = this.dragEvent;
        let distanceVector = [e.offsetX - drg.initDragX, e.offsetY - drg.initDragY];
        let dragDistance = MathTools.module(distanceVector);

        if (dragDistance > this.minimumDraggingDistance) {
            let radius = MathTools.module([drg.ball.x, drg.ball.y]);

            if (radius > this.currentUniverse.gCenter.size + drg.ball.size + 3) { // 3px added to avoid bugs
                // moving the ball
                this.dragging = true;

                drg.ball.setPosition(e.offsetX - xc, e.offsetY - yc);
            } else {
                // error on dragging
                drg.ball.setPosition(drg.initBallX, drg.initBallY);
                this.dragging = false;
                this.dragEvent = null;
            }

        }


    }

    /**
     * Handles canvas right click.
     *
     * @param e mouse event
     */
    canvasRightClick(e) {
        e.preventDefault();

        let xc = this.mainController.canvas.width / 2;
        let yc = this.mainController.canvas.height / 2;
        let ball = new Ball(e.offsetX - xc, e.offsetY - yc, 0, 0, 2);
        let seqIndex = this.mainController.sequenceIndex;
        let universe = this.mainController.grid.sequenceList[seqIndex].getCurrentUniverse();
        let collisionChecker = new CollisionChecker(universe);
        let targetBall = collisionChecker.checkSpace(ball);

        if (targetBall instanceof Ball) {
            this.editedBall = targetBall;
            this.openPlanetSettingsAlert();

        }

    }


    /**
     * Opens alert for editing ball settings.
     */
    openPlanetSettingsAlert() {

        let mainController = this.mainController; // shortcut

        if (!mainController.alertOn) {

            let index = mainController.grid.sequenceList[mainController.sequenceIndex].index;
            mainController.metronome.stop();

            // sets back the index to current position
            mainController.grid.sequenceList[mainController.sequenceIndex].changeIndex(index);

            mainController.alertOn = true;
            fetch('alerts/planet-settings.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {
                    mainController.alertContainer.innerHTML = html;

                    let cancelButton = document.querySelector(".btn-press-no");
                    let sizeInput = document.querySelector("#size-input");
                    let noteInput = document.querySelector("#note-input");
                    let gainInput = document.querySelector("#gain-input");
                    let delayInput = document.querySelector("#delay-input");
                    let reverbInput = document.querySelector("#reverb-input");
                    let soundModuleSelect = document.querySelector("#audio-module-select");
                    let audioModuleContainer = document.querySelector("#audio-module-container");
                    let autoUpdatableFields = document.querySelectorAll(".auto-update");
                    let shootingStyleContainer = document.querySelector(".shooting-style-container");

                    // every update on the view will be reflected on the model
                    autoUpdatableFields.forEach(field => {
                        field.onchange = this.updateModel.bind(this);
                    });

                    // hiding shooting-style for gGenter
                    if (this.editedBall instanceof GravityBall) {
                        shootingStyleContainer.style.display = "none";
                    }

                    // current values
                    sizeInput.value = this.editedBall.size;
                    noteInput.value = this.editedBall.note;
                    gainInput.value = this.editedBall.soundModule.gain;
                    delayInput.value = this.editedBall.soundModule.delaySend;
                    reverbInput.value = this.editedBall.soundModule.reverbSend;

                    // selecting sound module in the select tag
                    let soundModuleType = this.editedBall.soundModule.exportCopy().type;
                    let soundModuleIndex = Array.from(soundModuleSelect.options)
                        .map(opt => opt.value)
                        .indexOf(soundModuleType);
                    soundModuleSelect.selectedIndex = soundModuleIndex;

                    // audio module setting loading
                    let screenshot = new Screenshot();

                    /**
                     * Used for loading the correct view for a soundmodule
                     */
                    function loadSoundModule() {
                        let self = this;

                        let url = {
                            sampler: "alerts/planet-settings/sampler-settings.html",
                            monosynth: "alerts/planet-settings/monosynth-settings.html"
                        };
                        let choice = soundModuleSelect.value;
                        fetch(url[choice])
                            .then(response => {
                                return response.text();
                            })
                            .then(html => {
                                audioModuleContainer.innerHTML = html;

                                // updates module
                                self.updateSoundModule.bind(self)();

                                // creating the layout for editing the sound module
                                switch (choice) {
                                    case "sampler" :
                                        let sampleInput = document.querySelector("#sample-input");
                                        let releaseInput = document.querySelector("#release-input");
                                        let randomizeInput = document.querySelector("#randomize-input");
                                        let dynamicPitchInput = document.querySelector("#dynamic-pitch-input");
                                        let dynamicPitchContainer = document.querySelector(".dynamic-pitch-container");

                                        // G-Balls can't have dynamic pitch input
                                        if (this.editedBall instanceof GravityBall) {
                                            dynamicPitchContainer.style.display = "none";
                                        }

                                        self.fillSampleList(sampleInput);
                                        releaseInput.value = this.editedBall.soundModule.release;
                                        randomizeInput.checked = this.editedBall.soundModule.randomize;
                                        dynamicPitchInput.checked = this.editedBall.soundModule.dynamicPitchOn;
                                        break;

                                    case "monosynth":
                                        let ampAttackInput = document.querySelector("#amp-attack-input");
                                        let ampReleaseInput = document.querySelector("#amp-release-input");
                                        let filterAttackInput = document.querySelector("#filter-attack-input");
                                        let filterReleaseInput = document.querySelector("#filter-release-input");
                                        let filterCutoffInput = document.querySelector("#filter-cutoff-input");
                                        let filterEnvAmountInput = document.querySelector("#filter-env-input");
                                        let detune = document.querySelector("#detune-input");
                                        let dynamicFilterInput = document.querySelector("#dynamic-filter-input");
                                        let dynamicFilterContainer = document.querySelector(".dynamic-filter-container");

                                        // G-Balls can't have dynamic filter input
                                        if (this.editedBall instanceof GravityBall) {
                                            dynamicFilterContainer.style.display = "none";
                                        }

                                        ampAttackInput.value = this.editedBall.soundModule.ampAttack;
                                        ampReleaseInput.value = this.editedBall.soundModule.ampRelease;
                                        filterAttackInput.value = this.editedBall.soundModule.filterAttack;
                                        filterReleaseInput.value = this.editedBall.soundModule.filterRelease;
                                        filterCutoffInput.value = this.editedBall.soundModule.filterCutoff;
                                        filterEnvAmountInput.value = this.editedBall.soundModule.filterEnvAmount;
                                        detune.value = this.editedBall.soundModule.detune;
                                        dynamicFilterInput.value = this.editedBall.soundModule.dynamicFilterOn;

                                        break;
                                }

                                // updates the reference to all auto-update input fields
                                autoUpdatableFields = document.querySelectorAll(".auto-update");
                                autoUpdatableFields.forEach(field => {
                                    field.onchange = self.updateModel.bind(self);
                                });

                            });

                    }


                    loadSoundModule.bind(this)();
                    soundModuleSelect.onchange = loadSoundModule.bind(this);

                    // closing alert
                    cancelButton.onclick = mainController.closeAlert.bind(mainController);

                    // update model on close
                    this.mainController.alertConfirmFunction = e => {
                        this.updateModel();
                    };

                    this.mainController.container.classList.add("blurred");
                });
        }
    }

    /**
     * Updates the model following the settings.
     */
    updateModel() {
        // filter for autoUpdatableFields
        function nodeFilter(id) {
            return f => {
                return f.id === id;
            }
        }

        let autoUpdatableFields = Array.from(document.querySelectorAll(".auto-update"));

        // size field
        let size = autoUpdatableFields.filter(nodeFilter("size-input"))[0].value;

        // note field
        let note = autoUpdatableFields.filter(nodeFilter("note-input"))[0].value;

        // gain field
        let gain = autoUpdatableFields.filter(nodeFilter("gain-input"))[0].value;

        // delay send field
        let delay = autoUpdatableFields.filter(nodeFilter("delay-input"))[0].value;

        // reverb send field
        let reverb = autoUpdatableFields.filter(nodeFilter("reverb-input"))[0].value;

        // shooting style field
        let shootingStyle = autoUpdatableFields.filter(nodeFilter("shooting-style-select"))[0].value;


        // setting the size
        this.editedBall.size = parseFloat(size);

        // validating the note before changes
        let regex = new RegExp("^[CDEFGAB|cdefgab]#?[1-5]$")
        if (regex.test(note)) {
            this.editedBall.note = note;
        }

        // changing shooting style
        if (shootingStyle !== "no-value") {
            let gCenter = this.mainController.grid
                .sequenceList[this.mainController.sequenceIndex].getCurrentUniverse().gCenter;
            BallCannon.shootBall(this.editedBall, gCenter, shootingStyle);
        }


        let soundModuleSettings = {};
        let soundModuleFields = autoUpdatableFields.slice(6); // common parameters are excluded
        soundModuleFields.push(autoUpdatableFields.filter(nodeFilter("gain-input"))[0]); // putting gain field inside again
        soundModuleFields.push(autoUpdatableFields.filter(nodeFilter("delay-input"))[0]); // putting delay field inside again
        soundModuleFields.push(autoUpdatableFields.filter(nodeFilter("reverb-input"))[0]); // putting reverb field inside again

        soundModuleFields
            .forEach(field => {

                if (field.type === "checkbox") {
                    soundModuleSettings[field.dataset.parameter] = field.checked;
                } else {
                    soundModuleSettings[field.dataset.parameter] = field.value;
                }
            });

        this.editedBall.soundModule.setParameters(soundModuleSettings);
    }

    /**
     * Checks if a new sound module is selected, and updates the model.
     */
    updateSoundModule() {
        // audio module field
        let soundModule = document.querySelector("#audio-module-select").value;

        // changing audio module
        if (this.editedBall.soundModule.exportCopy().type !== soundModule) {
            switch (soundModule) {
                case "sampler":
                    this.editedBall.soundModule = new Sampler();
                    break;

                case "monosynth":
                    this.editedBall.soundModule = new MonoSynth();
                    break;
                default:
                    console.log("Sound Module type not recognized");
            }
        }
    }

    /**
     * Fills select with all samples.
     *
     * @param sampleInput node
     */
    fillSampleList(sampleInput) {

        // TODO: that's a github pages quick fix

        // let url = "./resources/samples";
        let url = "./resources/github_pages_fix.html";

        fetch(url)
            .then(response => {
                return response.text();
            })
            .then(html => {
                let container = document.createElement("div");
                container.innerHTML = html;

                let samples = Array.from(container.querySelectorAll("a"))
                    .map(s => s.text)
                    .filter(s => s.endsWith("wav"));

                let i = 0;
                samples.forEach(s => {
                    let option = document.createElement("option");
                    option.value = s;
                    option.text = s;

                    sampleInput.appendChild(option);

                    if (s === this.editedBall.soundModule.sample) {
                        sampleInput.selectedIndex = i;
                    }
                    i++;
                });

            })
    }

}

export default BallController;