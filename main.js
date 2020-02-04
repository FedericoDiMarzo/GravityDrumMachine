import Ball from "./model/Ball.js";
import GravityBall from "./model/GravityBall.js";
import GraphicRenderer from "./utility/GraphicRenderer.js";
import DrumUniverse from "./model/DrumUniverse.js";
import Metronome from "./utility/Metronome.js";
import CollisionChecker from "./state/CollisionChecker.js";
import SingleStateUpdater from "./state/SingleStateUpdater.js";
import MathTools from "./utility/MathTools.js";
import DrumSequence from "./model/DrumSequence.js";
import DrumGrid from "./model/DrumGrid.js";
import GridStateUpdater from "./state/GridStateUpdater.js";
import BallController from "./controllers/BallController.js";
import Controller from "./controllers/Controller.js";

// http://0.0.0.0:8000/Documents/Universita%CC%80/Advanced%20Coding/project/GravityDrumMachine/index.html
// http://localhost:8000/Documents/GitHub/GravityDrumMachine/index.html

// setting up the drumGrid //
let sequenceList = [new DrumSequence()];
let grid = new DrumGrid(sequenceList);


// linking GridStateUpdater with our drumGrid  //
let gridStateUpdater = new GridStateUpdater(grid);


// let's setup the rendering engine //
let renderer = new GraphicRenderer(grid);


// time to set up our metronome //
let metronome = new Metronome(grid);
metronome.stateUpdate.push(gridStateUpdater.updateState.bind(gridStateUpdater));

// adding the controller //
// let controller = new EnlargedViewController(grid, metronome);
let controller = new Controller(grid, metronome, renderer, gridStateUpdater);

// starting our app //
document.onclick = () => {
    Tone.start();
    renderer.startRendering();
    metronome.initialize();
    // grid.play();
    // metronome.play();

    document.onclick = undefined;
};

// setInterval(() => {
//     console.log(Tone.Transport.position)
// }, 500);

