import MathTools from "./MathTools.js";

class Metronome {

    /**
     * A Metronome emits groups of functions
     * based on a certain bpm and fps setting.
     */
    constructor(grid) {
        this.drumGrid = grid;
        this.bpm = 70;
        this.stateRate = 5; // in milliseconds
        this.stateUpdate = [];
        this.otherEventRate = 150; // in milliseconds
        this.otherEventUpdate = [];
        this.signatures = [];   //current signatures
        this.multiplier = []; //multiplier[i] / tatum = 1 / this.signatures[i].den
        this.denLcm = 4; // needed for bpm calculation
        this.eventsId = []; // contains every event id from Tone.Transport
        this.playing = false;
    }


    /**
     * Initializes the metronome.
     */
    initialize() {
        //this.sequenceList.push(this.gridStateUpdater.drumGrid.sequenceList[0]);
        //this.stateUpdate.push(this.gridStateUpdater.updateState());
        this.fireStateEvent();
        setInterval(this.fireStateEvent.bind(this), this.stateRate);
        this.fireOtherEvent();
        setInterval(this.fireOtherEvent.bind(this), this.otherEventRate);
        this.updateBpm(this.bpm);
        this.updateMetronome();
    }

    /** Gets current signatures.
     * @returns {[]} array of signatures
     */
    getSignatures() {
        let sign = [];
        this.drumGrid.sequenceList.forEach(function (x) {
            sign.push(MathTools.string2Fraction(x.timeDivision))
        });
        return sign;
    }

    /**
     * Schedules rhythms from multipliers
     */
    scheduleTransport() {
        this.multiplier.forEach((x, j) => {
            let t = "0:" + x.toString();
            let eventId = Tone.Transport.scheduleRepeat(function () {
                this.drumGrid.next(j);
            }.bind(this), t, t);
            this.eventsId.push(eventId);
        });
    }

    /**
     * Sets metronome from signatures' array.
     */
    updateMetronome() {
        // this.stop();

        // reset transport first
        this.eventsId.forEach(id => {
            Tone.Transport.clear(id);
        });

        this.multiplier = []; // used to put all denominators at the same value
        this.signatures = this.getSignatures();
        let den = [];
        let num = [];
        let mult = [];
        let denLcm = 0;

        // splitting the signatures
        this.signatures.forEach(function (x) {
            den.push(x.den);
            num.push(x.num);
        });

        // gets denLcm as low common multiple of denominators
        denLcm = MathTools.lcmMultiple(den);
        this.denLcm = denLcm;

        // gets measure as lowest common multiple of signatures'
        // (expressed as fractions with denLcm denominator) numerators
        let measure = num[0] * denLcm / den[0];
        num.forEach(function (x, i) {
            measure = MathTools.lcm(measure, x * denLcm / den [i]);
        });

        // updates multiplier
        this.signatures.forEach(function (x) {
            mult.push(denLcm / x.den);
        });
        this.multiplier = mult;
        // sets transport
        Tone.Transport.timeSignature = [measure, denLcm];
        this.scheduleTransport();
        this.updateBpm(this.bpm);

    }

    /**
     * Changes bpm.
     * @param n new value
     */
    updateBpm(n) {
        this.bpm = n;
        Tone.Transport.bpm.value = n * this.denLcm / 4; // scales bpm for different denominators
    }

    /**
     * Play the DrumGrid and starts the
     * Transport.
     */
    play() {
        this.drumGrid.play();
        Tone.Transport.start();
        this.playing = true;
    }

    /**
     * Stops both the DrumGrid and the
     * Transport.
     */
    stop() {
        this.drumGrid.stop();
        Tone.Transport.stop();
        this.playing = false;
        this.updateMetronome();
    }

    /**
     * Switch from play to stop, or
     * from stop to play depending on
     * Metronome's state.
     */
     toggle() {
        if (this.playing) {
            this.stop();
        } else {
            this.play();
        }
    }

    /**
     * Fires all listener's functions for state.
     */
    fireStateEvent() {
        //this.gridStateUpdater.updateState();
        this.stateUpdate.forEach(e => {
            e();
        });
    }

    /**
     * Fires all listener's functions for additional events.
     */
    fireOtherEvent() {
        this.otherEventUpdate.forEach(e => {
            e();
        });
    }

}

export default Metronome;