import DrumSequence from "./DrumSequence.js";
import DrumUniverse from "./DrumUniverse.js";

class DrumGrid {

    /**
     * Contains all the drum sequences.
     * Must be sequenced externally by the Metronome.
     *
     * @param sequenceList
     */
    constructor(sequenceList) {
        this.sequenceList = sequenceList || [];
    }

    /**
     * Adds a new sequence.
     */
    addSequence() {
        let drumUniverseList = [];
        drumUniverseList.push(new DrumUniverse());
        let newSequence = new DrumSequence(drumUniverseList);
        this.sequenceList.push(newSequence);
    }

    /**
     * Removes a sequence.
     * @param index
     */
    removeSequence(index) {
        this.sequenceList.splice(index, 1);
    }

    /**
     * Resets all the sequences and inits their universes.
     */
    play() {
        this.sequenceList.forEach(s => {
            s.play();
        });
    }

    /**
     * Stop the simulations and resets the sequences.
     */
    stop() {
        this.sequenceList.forEach(s => {
            s.reset();
        });
    }

    /**
     * Calls next of a certain sequence.
     * @param index
     */
    next(index) {
        this.sequenceList[index].next();
    }

    /**
     * Save copy of the object to be jsonfied.
     *
     * @return {string}
     */
    exportCopy() {
        let copy = {
            sequenceList: []
        };

        this.sequenceList.forEach(s => {
            copy.sequenceList.push(s.exportCopy());
        });

        return copy;
    }
}

export default DrumGrid;