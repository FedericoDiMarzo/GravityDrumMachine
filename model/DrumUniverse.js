import GravityBall from "./GravityBall.js";

class DrumUniverse {

    /**
     * Cell of the drum machine.
     * Contains all the information about the
     * initial state of the balls.
     *
     * @param balls initial balls
     * @param gCenter gravity center
     */
    constructor(balls, gCenter) {
        // generating the gravity center
        this.gCenter = gCenter || new GravityBall(0, 0, 50);
        this.balls = balls || [];
        this.gCenter.targets = this.balls;
        this.playing = false;

    }

    /**
     * Initialize the drum universe, creating a "living"
     * deepCopy of the initial state.
     */
    play() {
        this.playing = true;
        this.gCenter.play(this.gCenter.note); // first drum hit
        this.balls.filter(b => b.isStepTriggered) // step triggered hits
            .forEach(b => b.play(b.note));
        this.balls.forEach(b => {
            b.reset();
        });

    }

    /**
     * Resets the universe.
     */
    stop() {
        this.playing = false;
        this.balls.forEach(b => {
            b.reset();
        });
    }

    /**
     * Calls update function for every ball,
     * after play function has ran.
     */
    updateLiveState() {
        if (this.playing) {
            let targets = this.balls.concat(this.gCenter);
            targets.forEach(e => {
                e.update()
            });
        }
    }

    /**
     * Calls updateSoundModule function for every ball,
     * after play function has ran.
     */
    updateSoundModule() {
        if (this.playing) {
            let targets = this.balls;
            targets.forEach(e => {
                e.updateSoundModule();
            });
        }
    }

    /**
     * Save copy of the object to be jsonfied.
     *
     * @return {object}
     */
    exportCopy() {
        let copy = {
            gCenter: this.gCenter.exportCopy(),
            balls: []
        };

        this.balls.forEach(b => {
            copy.balls.push(b.exportCopy());
        });

        return copy;
    }
}


export default DrumUniverse;