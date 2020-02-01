import DrumUniverse from "./DrumUniverse.js";
import MathTools from "../utility/MathTools.js";

class DrumSequence {

    /**
     * Contains various universes and the subdivision.
     *
     * @param drumUniverseList
     */
    constructor(drumUniverseList) {

        this.drumUniverseList = drumUniverseList || [new DrumUniverse()];
        this.timeDivision = "";
        this.index = 0; // current index;

        this.setTimeDivision(this.drumUniverseList.length, 4);
    }

    /**
     * Gets indexed universe.
     * @return {DrumUniverse}
     */
    getCurrentUniverse() {
        return this.drumUniverseList[this.index];
    }


    /**
     * Initialize current universe.
     */
    play() {
        this.reset();
        if (this.drumUniverseList.length !== 0) {
            this.drumUniverseList[this.index].play();
        }
    }

    /**
     * Stops all the simulations.
     */
    reset() {
        this.index = 0;
        this.drumUniverseList.forEach(e => {
            e.stop();
        });
    }

    /**
     * Used for animating the sequence.
     */
    next() {
        this.index = ++this.index % this.drumUniverseList.length;
        if (this.index === 0) {
            this.play();
        } else {
            this.getCurrentUniverse().play();
        }
    }

    /**
     * Change sequence position, useful for
     * editing while the sequencer is stopped.
     *
     * @param index
     */
    changeIndex(index) {
        if (index >= 0) {
            this.index = index % this.drumUniverseList.length;
        } else {
            this.index = (this.drumUniverseList.length + index) % this.drumUniverseList.length;
        }
    }

    /**
     * Changes the time division, morphing the
     * data structure in reflection with the numerator.
     *
     * @param num
     * @param den
     */
    setTimeDivision(num, den) {
        this.timeDivision = MathTools.fraction2String(num, den);

        let l = this.drumUniverseList.length;
        let n = l - num;
        if (n < 0) {
            // adding universes according to num
            for (let i = 0; i < -n; i++) {
                this.drumUniverseList.push(new DrumUniverse());
            }
        } else if (n > 0) {
            // removing universes according to num
            this.drumUniverseList.splice(num, n);
        }
    }

    /**
     * Save deepCopy of the object to be jsonfied.
     *
     * @return {object}
     */
    exportCopy() {
        let copy = {
            universeList: [],
            timeDivision: this.timeDivision
        };

        this.drumUniverseList.forEach(u => {
           copy.universeList.push(u.exportCopy());
        });

        return copy;
    }


}

export default DrumSequence;