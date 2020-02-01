import CollisionChecker from "./CollisionChecker.js";

class SingleStateUpdater {

    /**
     * This class abstracts the concept of dynamical state.
     * It allows for playing and restarting instances of
     * a single DrumUniverse.
     *
     * @param drumUniverse current universe
     */
    constructor(drumUniverse) {
        this.collisionChecker = new CollisionChecker(drumUniverse);
        this.drumUniverse = drumUniverse;
    }

    /**
     * Changes universe.
     *
     * @param drumUniverse
     */
    setDrumUniverse(drumUniverse) {
        this.drumUniverse = drumUniverse;
        this.collisionChecker.drumUniverse = drumUniverse;
    }

    /**
     * Updates universe's live state and checks for collisions.
     */
    updateState() {
        if (!this.collisionChecker.collisionDetected) {
            this.drumUniverse.updateLiveState();
            this.collisionChecker.collisionCheck();
        }
    }

    /**
     * Updates sound module parameters.
     */
    updateSoundModule() {
        if (!this.collisionChecker.collisionDetected) {
            this.drumUniverse.updateSoundModule();
        }
    }

}

export default SingleStateUpdater;