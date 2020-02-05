import DrumGrid from "../model/DrumGrid.js";
import BallController from "./BallController.js";
import MathTools from "../utility/MathTools.js";
import Screenshot from "../utility/Screenshot.js";
import DrumSequence from "../model/DrumSequence.js";
import FxWrapper from "../sound/FxWrapper.js";
import PhysicsConstants from "../utility/PhysicsCostants.js";

class Controller {

    /**
     * Application's controller.
     *
     * @param grid
     * @param metronome
     * @param renderer
     * @param stateUpdater
     */
    constructor(grid, metronome, renderer, stateUpdater) {
        this.sequenceIndex = 0; // current sequence
        this.grid = grid;
        this.renderer = renderer;
        this.metronome = metronome;
        this.stateUpdater = stateUpdater;
        this.currentView = "grid-view";
        this.sandwichMenuOn = false;
        this.alertOn = false;
        this.alertConfirmFunction = undefined;
        this.copiedUniverse = null;
        this.enlargedViewController = new BallController(this);

        // shared references
        this.container = document.querySelector("#app-container");
        this.externalContainer = document.querySelector("#external-container");
        this.innerContainer = document.querySelector("#app-container-inner");
        this.galaxyNameContainer = document.querySelector("#galaxy-name-container");
        this.galaxyName = document.querySelector("#galaxy-name");
        this.bpmLabel = document.querySelector(".bpm-value");
        this.bpmContainer = document.querySelector(".bpm-container");
        this.playButton = document.querySelector(".play-button");
        this.stopButton = document.querySelector(".stop-button");
        this.alertContainer = document.querySelector("#alert-container");
        this.navIcons = document.querySelectorAll(".nav-icon");

        // side menu references
        this.sandwichMenu = document.querySelector(".sandwich-menu");
        this.saveGalaxyMenuItem = document.querySelector("#save-galaxy");
        this.loadGalaxyMenuItem = document.querySelector("#load-galaxy");
        this.newSequenceMenuItem = document.querySelector("#new-sequence");
        this.deleteSequenceMenuItem = document.querySelector("#delete-sequence");
        this.fxSettingsMenuItem = document.querySelector("#fx-settings");
        this.motionParametersSettings = document.querySelector("#motion-parameters-settings");

        // references from grid view
        this.rowCounter = document.querySelector(".row-counter");
        this.topBar = document.querySelector("#grid-view-container-top");
        this.gridViewContainer = document.querySelector("#grid-view-container-center");
        this.drumSequenceView = document.querySelector("#drum-sequence-universes-container");
        this.drumSequenceViewContainer = document.querySelector("#drum-sequence-container");
        this.drumSequenceSignature = document.querySelector(".drum-sequence-signature");

        // references from universe view
        this.canvas = document.querySelector("#gravity-canvas");
        this.navIconUniverse = document.querySelector(".nav-icon-universe");
        this.backIconUniverse = document.querySelector(".back-icon-universe");


        this.changeRow(0);
        this.metronome.otherEventUpdate.push(this.updateCursor.bind(this)); // needed for updating current position


        // Key Events
        document.body.onkeydown = (e) => {

            // Enter
            if (e.keyCode === 13 && this.alertOn) {
                // confirm alert
                if (this.alertConfirmFunction) {
                    this.alertConfirmFunction();
                }
                this.closeAlert();
            }

            // Esc
            if (e.keyCode === 27 && (this.alertOn || this.sandwichMenuOn)) {
                // close alert and side menu
                this.closeAlert();
                this.closeSandwichMenu();
            }

            // from now on, every key interaction is suspended if
            // there's an alert or the side-menu
            if (this.alertOn || this.sandwichMenuOn) return;

            // Down arrow
            if (e.keyCode === 40) {
                this.changeRow(this.sequenceIndex + 1);
            }

            // Spacebar
            if (e.keyCode === 32) {
                this.metronome.toggle();
                this.updatePlayingState();
            }

            // Up arrow
            if (e.keyCode === 38) {
                this.changeRow(this.sequenceIndex - 1);
            }

            // Right arrow
            if (e.keyCode === 39) {
                if (!this.metronome.playing && !this.alertOn) {
                    this.grid.sequenceList[this.sequenceIndex].changeIndex(this.grid.sequenceList[this.sequenceIndex].index + 1);
                }
            }

            // Left arrow
            if (e.keyCode === 37) {
                if (!this.metronome.playing && !this.alertOn) {
                    this.grid.sequenceList[this.sequenceIndex].changeIndex(this.grid.sequenceList[this.sequenceIndex].index - 1);
                }
            }

            // Tab key
            if (e.keyCode === 9) {
                e.preventDefault();
                let animation = ["animated", "jackInTheBox", "faster"];
                this.container.classList.add(...animation);
                setTimeout(() => {
                    this.container.classList.remove(...animation);
                }, 700);
                this.switchView();
            }
        };

        // Copy
        document.addEventListener("copy", this.copyUniverse.bind(this));

        // Paste
        document.addEventListener("paste", this.pasteUniverse.bind(this));

        // Bpm click
        this.bpmContainer.onclick = this.openBpmAlert.bind(this);

        // Galaxy name click
        this.galaxyNameContainer.onclick = this.openGalaxyNameAlert.bind(this);

        // Signature click
        this.drumSequenceSignature.onclick = this.openSignatureAlert.bind(this);

        // Nav icon click
        this.navIcons.forEach(n => {
            n.onclick = this.openSandwichMenu.bind(this);
        });

        // Save galaxy click
        this.saveGalaxyMenuItem.onclick = this.openSaveGalaxyAlert.bind(this);

        // Load galaxy click
        this.loadGalaxyMenuItem.onclick = this.openLoadGalaxyAlert.bind(this);

        // Delete sequence click
        this.deleteSequenceMenuItem.onclick = this.openDeleteSequenceAlert.bind(this);

        // Fx settings click
        this.fxSettingsMenuItem.onclick = this.openFxSettingsAlert.bind(this);

        // Motion parameters click
        this.motionParametersSettings.onclick = this.openMotionParametersAlert.bind(this);

        // New sequence click
        this.newSequenceMenuItem.onclick = () => {
            this.grid.sequenceList.splice(this.sequenceIndex + 1, 0, new DrumSequence());
            this.stateUpdater.updateStateList();
            this.changeRow(this.sequenceIndex + 1);
        };

        // Play click
        this.playButton.onclick = () => {
            this.metronome.play();
            this.updatePlayingState();
        };

        // Stop click
        this.stopButton.onclick = () => {
            this.metronome.stop();
            this.updatePlayingState();
        };

        // Back button
        this.backIconUniverse.onclick = this.switchView.bind(this);


    }

    /**
     * Updates the view for a specific index.
     *
     * @param index
     */
    changeRow(index) {
        this.updatePlayingState();
        this.sequenceIndex = Math.abs(index) % this.grid.sequenceList.length;
        let newSequence = this.grid.sequenceList[this.sequenceIndex];
        this.renderer.currentRow = this.sequenceIndex;

        // animation
        this.drumSequenceViewContainer.classList.remove("animated", "flipInX");
        setTimeout(e => {
            this.drumSequenceViewContainer.classList.add("animated", "flipInX");
        }, 1);


        // updating row counter
        this.rowCounter.innerHTML = "";
        this.grid.sequenceList.forEach(() => {
            let rowCounterItem = document.createElement("div");
            rowCounterItem.className = "row-counter-block";
            this.rowCounter.appendChild(rowCounterItem);
        });

        // if there's only one row, sequence delete is disabled
        if (this.grid.sequenceList.length <= 1) {
            this.deleteSequenceMenuItem.classList.add("hidden");
        } else {
            this.deleteSequenceMenuItem.classList.remove("hidden");
        }

        let rowChildren = this.rowCounter.children;
        for (let i = 0; i < rowChildren.length; i++) {
            rowChildren[i].classList.remove("row-counter-block-active");
        }
        this.rowCounter.children[this.sequenceIndex].classList.add("row-counter-block-active");

        // updating bpm
        this.bpmLabel.textContent = this.metronome.bpm.toString();

        // removing previous canvases
        let previousSequenceItems = this.drumSequenceView.querySelectorAll(".drum-sequence-item");
        previousSequenceItems.forEach(child => {
            this.drumSequenceView.removeChild(child);
        });

        // adding new canvases
        newSequence.drumUniverseList.forEach((u, i) => {
            let drumSequenceItem = document.createElement("div");
            drumSequenceItem.className = "drum-sequence-item";
            drumSequenceItem.onclick = this.universeItemOnClick.bind(this);
            this.drumSequenceView.appendChild(drumSequenceItem);

            let drumSequenceCanvas = document.createElement("canvas");
            drumSequenceCanvas.width = drumSequenceItem.offsetWidth;
            drumSequenceCanvas.height = drumSequenceItem.offsetHeight;
            drumSequenceItem.appendChild(drumSequenceCanvas);

            this.renderer.renderCanvas(drumSequenceCanvas, this.sequenceIndex, i);

        });

        this.drumSequenceSignature.textContent = newSequence.timeDivision;
    }

    /**
     * Handles the click on an universe.
     *
     * @param e click event
     */
    universeItemOnClick(e) {
        let index = [...this.drumSequenceView.children].indexOf(e.currentTarget);
        this.grid.sequenceList[this.sequenceIndex].changeIndex(index);
        this.switchView();
    }

    /**
     * Switches from grid to universe view.
     */
    switchView() {

        if (this.currentView === "grid-view") {
            this.currentView = "universe-view";
            this.renderer.isUniverseView = true;

            // hiding grid view
            this.gridViewContainer.classList.add("hidden");
            this.topBar.classList.add("hidden");

            // showing universe view
            this.canvas.classList.remove("hidden");
            this.navIconUniverse.classList.remove("hidden");
            this.backIconUniverse.classList.remove("hidden");

        } else {
            this.currentView = "grid-view";
            this.renderer.isUniverseView = false;

            // hiding universe view
            this.canvas.classList.add("hidden");
            this.navIconUniverse.classList.add("hidden");
            this.backIconUniverse.classList.add("hidden");


            // showing grid view
            this.gridViewContainer.classList.remove("hidden");
            this.topBar.classList.remove("hidden");

            this.changeRow(this.sequenceIndex);
        }
    }

    /**
     * Updates play and stop buttons.
     */
    updatePlayingState() {
        if (this.metronome.playing) {
            this.stopButton.classList.remove("stop-button-active");
            this.playButton.classList.add("play-button-active");
        } else {
            this.playButton.classList.remove("play-button-active");
            this.stopButton.classList.add("stop-button-active");
        }
    }

    /**
     * Updates sequencer's cursor of the current row.
     */
    updateCursor() {
        let i = this.grid.sequenceList[this.sequenceIndex].index;
        let universes = this.drumSequenceView.querySelectorAll(".drum-sequence-item");
        universes.forEach(u => {
            u.classList.remove("drum-sequence-item-active");
        });
        let currentUniverse = universes[i];
        currentUniverse.classList.add("drum-sequence-item-active");
    }

    /**
     * Opens side menu.
     */
    openSandwichMenu() {
        this.sandwichMenuOn = true;
        this.metronome.stop();
        this.updatePlayingState();
        this.innerContainer.classList.add("blurred");
        this.sandwichMenu.classList.add("sandwich-menu-active");

        // Close sandwich menu binding
        setTimeout(() => {
            this.externalContainer.onclick = this.closeSandwichMenu.bind(this);
        }, 20);

    }

    /**
     * Closes side menu.
     *
     * @param e event
     */
    closeSandwichMenu(e) {

        let sandwichMenuClicked = e ? e.target === this.sandwichMenu : false;
        if (sandwichMenuClicked) {
            // avoid closing the menu if it's clicked
            return;
        }

        this.sandwichMenuOn = false;
        this.innerContainer.classList.remove("blurred");
        this.sandwichMenu.classList.remove("sandwich-menu-active");

        this.externalContainer.onclick = undefined;
    }

    /**
     * Closes an alert.
     */
    closeAlert() {

        this.alertContainer.innerHTML = "";
        this.container.classList.remove("blurred");
        this.alertOn = false;
        this.changeRow(this.sequenceIndex);
    }

    /**
     * Opens alert for changing bpm.
     */
    openBpmAlert() {
        if (!this.alertOn) {
            this.metronome.stop();
            this.alertOn = true;
            fetch('alerts/bpm-alert.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {
                    this.alertContainer.innerHTML = html;

                    let cancelButton = document.querySelector(".btn-press-no");
                    let confirmButton = document.querySelector(".btn-press-ok");
                    let input = document.querySelector("#bpm-input");

                    input.value = this.metronome.bpm;

                    // closing alert
                    cancelButton.onclick = this.closeAlert.bind(this);

                    // confirm bpm change
                    this.alertConfirmFunction = () => {

                        if (!input.value || !input.checkValidity()) return;

                        let bpmValue = parseInt(input.value);
                        this.metronome.updateBpm(bpmValue);

                    };
                    confirmButton.onclick = this.alertConfirmFunction.bind(this);


                });
            this.container.classList.add("blurred");
        }
    }

    /**
     * Copy selected universe.
     */
    copyUniverse() {
        if (this.metronome.playing) {
            return;
        }

        this.copiedUniverse = this.grid.sequenceList[this.sequenceIndex].getCurrentUniverse();
    }

    pasteUniverse() {
        if (this.metronome.playing) {
            return;
        }

        let screenshot = new Screenshot();
        let currentUniverse = this.grid.sequenceList[this.sequenceIndex].getCurrentUniverse();
        let copyIndex = this.grid.sequenceList[this.sequenceIndex].drumUniverseList.indexOf(currentUniverse);
        let deepCopy = screenshot.getUniverse(this.copiedUniverse.exportCopy());
        this.grid.sequenceList[this.sequenceIndex].drumUniverseList.splice(copyIndex, 1, deepCopy);
        this.stateUpdater.updateStateList();
        this.changeRow(this.sequenceIndex);
    }

    /**
     * Opens alert for modifying signature.
     */
    openSignatureAlert() {
        if (!this.alertOn) {
            this.metronome.stop();
            this.alertOn = true;
            fetch('alerts/signature-alert.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {
                    this.alertContainer.innerHTML = html;

                    let cancelButton = document.querySelector(".btn-press-no");
                    let confirmButton = document.querySelector(".btn-press-ok");
                    let inputNum = document.querySelector("#num-input");
                    let inputDen = document.querySelector("#den-input");

                    let currentTimeDivision = MathTools.string2Fraction(this.grid.sequenceList[this.sequenceIndex].timeDivision);
                    inputNum.value = currentTimeDivision.num;
                    inputDen.value = currentTimeDivision.den;

                    // closing alert
                    cancelButton.onclick = this.closeAlert.bind(this);

                    // confirm signature change
                    this.alertConfirmFunction = e => {
                        if (!inputNum.value ||
                            !inputDen.value ||
                            !inputNum.checkValidity() ||
                            !inputDen.checkValidity()) {
                            return;
                        }

                        let signatureTxt = inputNum.value + "/" + inputDen.value;
                        let signature = MathTools.string2Fraction(signatureTxt);
                        this.grid.sequenceList[this.sequenceIndex].setTimeDivision(signature.num, signature.den);
                        this.metronome.updateMetronome();
                        this.stateUpdater.updateStateList();
                        this.closeAlert();
                    };
                    confirmButton.onclick = this.alertConfirmFunction.bind(this);

                });
            this.container.classList.add("blurred");
        }
    }

    /**
     * Opens alert for changing the name of the project.
     */
    openGalaxyNameAlert() {
        if (!this.alertOn) {
            this.metronome.stop();
            this.alertOn = true;
            fetch('alerts/name-alert.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {
                    this.alertContainer.innerHTML = html;

                    let cancelButton = document.querySelector(".btn-press-no");
                    let confirmButton = document.querySelector(".btn-press-ok");
                    let input = document.querySelector("#galaxy-input");

                    input.value = this.galaxyName.textContent;

                    // closing alert
                    cancelButton.onclick = this.closeAlert.bind(this);

                    // confirm name change
                    this.alertConfirmFunction = e => {

                        if (!input.value || !input.checkValidity()) return;

                        this.galaxyName.textContent = input.value;
                        this.closeAlert();
                    };
                    confirmButton.onclick = this.alertConfirmFunction.bind(this);

                });
            this.container.classList.add("blurred");
        }
    }

    /**
     * Opens alert for saving the galaxy.
     */
    openSaveGalaxyAlert() {
        if (!this.alertOn) {
            this.metronome.stop();
            this.alertOn = true;
            fetch('alerts/save-alert.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {

                    this.alertContainer.innerHTML = html;

                    let cancelButton = document.querySelector(".btn-press-no");
                    let saveScreenshotLink = document.querySelector("#save-screenshot-link");

                    let screenshot = new Screenshot();
                    let name = this.galaxyName.textContent;
                    let url = screenshot.generateUrl(this.grid, this.metronome, name);
                    saveScreenshotLink.download = name + ".galaxy";
                    saveScreenshotLink.href = url;

                    // closing alert
                    cancelButton.onclick = this.closeAlert.bind(this);
                });
            this.container.classList.add("blurred");
        }
    }

    /**
     * Opens alert for loading a galaxy.
     */
    openLoadGalaxyAlert() {
        if (!this.alertOn) {
            this.metronome.stop();
            this.alertOn = true;
            fetch('alerts/load-alert.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {

                    this.alertContainer.innerHTML = html;

                    let cancelButton = document.querySelector(".btn-press-no");
                    let loadScreenshotInput = document.querySelector("#load-screenshot-input");
                    let chooseButton = document.querySelector("#load-screenshot-input-label");
                    let loadButton = document.querySelector(".btn-press-ok");


                    let screenshot = new Screenshot();
                    loadScreenshotInput.addEventListener('change', screenshot.load.bind(screenshot));
                    screenshot.loadedScreenshot.then(obj => {
                        chooseButton.classList.add("hidden");
                        loadButton.classList.remove("hidden");
                        this.alertConfirmFunction = function () {
                            let fxSettings = screenshot.getFxSettings(obj);
                            let physicsSettings = screenshot.getPhysicConstants(obj);

                            let grid = screenshot.getGrid(obj);
                            let bpm = screenshot.getBpm(obj);
                            let name = screenshot.getName(obj);
                            FxWrapper.delay.delayTime.value = fxSettings.delayTime;
                            FxWrapper.delay.feedback.value = fxSettings.delayFeedback;
                            FxWrapper.reverb.roomSize.value = fxSettings.reverbSize;
                            PhysicsConstants.g = physicsSettings.g;
                            PhysicsConstants.friction = physicsSettings.friction;

                            this.grid = grid;
                            this.metronome.drumGrid = grid;
                            this.renderer.drumGrid = grid;
                            this.stateUpdater.drumGrid = grid;
                            this.stateUpdater.updateStateList();
                            this.metronome.updateBpm(bpm);
                            this.metronome.updateMetronome();
                            this.galaxyName.textContent = name;

                            this.changeRow(0);
                            this.closeAlert();
                        }.bind(this);


                        loadButton.onclick = this.alertConfirmFunction;
                    });


                    // closing alert
                    cancelButton.onclick = this.closeAlert.bind(this);
                });
            this.container.classList.add("blurred");
        }
    }

    /**
     * Opens alert for deleting current sequence.
     */
    openDeleteSequenceAlert() {
        if (!this.alertOn) {
            this.metronome.stop();
            this.alertOn = true;
            fetch('alerts/delete-sequence-alert.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {
                    this.alertContainer.innerHTML = html;

                    let cancelButton = document.querySelector(".btn-press-no");
                    let confirmButton = document.querySelector(".btn-press-ok");

                    // closing alert
                    cancelButton.onclick = this.closeAlert.bind(this);

                    // confirm sequence delete
                    this.alertConfirmFunction = e => {
                        this.grid.sequenceList.splice(this.sequenceIndex, 1);
                        this.changeRow(0);
                        this.closeAlert();
                    };
                    confirmButton.onclick = this.alertConfirmFunction.bind(this);

                });
            this.container.classList.add("blurred");
        }
    }

    /**
     * Opens alert for editing fx settings.
     */
    openFxSettingsAlert() {
        if (!this.alertOn) {
            this.metronome.stop();
            this.alertOn = true;
            fetch('alerts/fx-alert.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {
                    this.alertContainer.innerHTML = html;

                    let delayTimeInput = document.querySelector("#delay-time-input");
                    let delayFeedbackInput = document.querySelector("#delay-feedback-input");
                    let reverbSizeInput = document.querySelector("#reverb-size-input");
                    let cancelButton = document.querySelector(".btn-press-no");
                    let confirmButton = document.querySelector(".btn-press-ok");

                    // loading values
                    delayTimeInput.value = FxWrapper.delay.delayTime.value;
                    delayFeedbackInput.value = FxWrapper.delay.feedback.value;
                    reverbSizeInput.value = FxWrapper.reverb.roomSize.value;

                    // closing alert
                    cancelButton.onclick = this.closeAlert.bind(this);

                    // confirm edits
                    this.alertConfirmFunction = e => {
                        FxWrapper.delay.delayTime.value = delayTimeInput.value;
                        FxWrapper.delay.feedback.value = delayFeedbackInput.value;
                        FxWrapper.reverb.roomSize.value = reverbSizeInput.value;
                        this.closeAlert();
                    };
                    confirmButton.onclick = this.alertConfirmFunction.bind(this);

                });
            this.container.classList.add("blurred");
        }
    }

    /**
     * Opens alert for modifying physics parameters.
     */
    openMotionParametersAlert() {
        if (!this.alertOn) {
            this.metronome.stop();
            this.alertOn = true;
            fetch('alerts/motion-parameters-alert.html')
                .then(response => {
                    return response.text()
                })
                .then(html => {
                    this.alertContainer.innerHTML = html;

                    let gInput = document.querySelector("#g-input");
                    let frictionInput = document.querySelector("#friction-input");
                    let cancelButton = document.querySelector(".btn-press-no");
                    let confirmButton = document.querySelector(".btn-press-ok");

                    // loading values
                    gInput.value = PhysicsConstants.g / PhysicsConstants.defaultG;
                    frictionInput.value = PhysicsConstants.friction / PhysicsConstants.defaultFriction;

                    // closing alert
                    cancelButton.onclick = this.closeAlert.bind(this);

                    // confirm edits
                    this.alertConfirmFunction = e => {
                        PhysicsConstants.g = PhysicsConstants.defaultG * gInput.value;
                        PhysicsConstants.friction = PhysicsConstants.defaultFriction * frictionInput.value;
                        this.closeAlert();
                    };
                    confirmButton.onclick = this.alertConfirmFunction.bind(this);

                });
            this.container.classList.add("blurred");
        }
    }

}

export default Controller;