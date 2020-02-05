import SoundModule from "./SoundModule.js";

class Sampler extends SoundModule {

    /**
     * Sampler instrument.
     *
     * @param sample initial samples
     */
    constructor(sample) {
        // passing the module to the superclass
        super(new Tone.Sampler({
            "C3": "resources/samples/" + (sample || "Kick 1.wav")
        }));
        this.release = 0.2;
        this.randomize = false; // if true, notes are triggered randomly
        this.dynamicPitchOn = false; // pitch morphing based on distance
        this.setSample(sample);

        // builtin effects
        this.pitchShifterNode = new Tone.PitchShift();
        this.pushEffect(this.pitchShifterNode);
        this.updateEffectChain();
    }

    /**
     * Updates the sample.
     *
     * @param sample
     */
    setSample(sample) {
        let defaultSample = "Kick 1.wav";
        this.sample = sample || defaultSample;
        this.module.add("C3", "resources/samples/" + this.sample);
    }


    triggerNote(note) {

        if (!this.sample) {
            return;
        }

        // based on randomize parameter
        if (this.randomize) {
            let noteList = ["C2", "D2", "E2", "F2", "G2", "A2", "B2",
                "C3", "D3", "E3", "F3", "G3", "A3", "B3"];
            note = noteList[Math.floor(Math.random() * noteList.length)];
        }

        this.module.triggerAttackRelease(note, this.release);
    }


    setParameters(parameters) {
        super.setParameters(parameters);
        this.setSample(parameters.sample);
        this.randomize = parameters.randomize;
        this.release = parseFloat(parameters.release);
        this.dynamicPitchOn = parameters.dynamicPitchOn;

    }

    update(distance, initDistance, angle) {
        if (distance > initDistance) return;
        this.pitchShifterNode.wet.value = (this.dynamicPitchOn) ? 1 : 0;

        // pitch shifting based on distance
        let val = ((distance / initDistance) - 0.5) * 12;
        if (val) {
            this.pitchShifterNode.pitch = val;
        }
    }

    exportCopy() {
        let copy = super.exportCopy();
        return {
            ...copy,
            type: "sampler",
            sample: this.sample,
            release: this.release,
            randomize: this.randomize,
            dynamicPitchOn: this.dynamicPitchOn
        };
    }
}

export default Sampler;