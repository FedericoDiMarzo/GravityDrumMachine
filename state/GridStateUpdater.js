import SingleStateUpdater from "./SingleStateUpdater.js";

class GridStateUpdater {

    constructor(drumGrid) {
        this.drumGrid = drumGrid;
        this.stateList = [];
        this.updateStateList();
    }

    updateStateList() {
        this.stateList = []; // clearing it first

        this.drumGrid.sequenceList.forEach((s, i) => {
            // pushing a new row
            this.stateList.push([]);
            // adding states
            s.drumUniverseList.forEach(u => {
                this.stateList[i].push(new SingleStateUpdater(u));
            });
        });

    }

    updateState() {
        this.stateList.forEach(array => {
            array.forEach(s => {
               s.updateState();
            });
        });
    }

    updateSoundModule() {
        this.stateList.forEach(array => {
            array.forEach(s => {
                s.updateSoundModule();
            });
        });
    }


}

export default GridStateUpdater;