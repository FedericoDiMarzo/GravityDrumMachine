import SoundModule from "./SoundModule.js";

class MonoSynth extends SoundModule {

    /**
     * Monophonic synth.
     */
    constructor() {
        // passing the module to the superclass
        super(new Tone.MonoSynth({
            frequency: "C4",
            oscillator: {
                type: "fatsawtooth"
            }
        }));
        this.ampAttack = 0.01;
        this.ampRelease = 0.4;
        this.filterAttack = 0.01;
        this.filterRelease = 0.8;
        this.filterEnvAmount = 2.5;
        this.filterCutoff = 100;
        this.detune = 40;
        this.dynamicFilterOn = false;
        this.module.envelope.sustain = 0;
        this.module.filterEnvelope.sustain = 0;
        this.module.volume.value = -6;

        this.updateSynthSettings();
        this.updateEffectChain();
    }

    /**
     * Updates Tone.js parameters.
     */
    updateSynthSettings() {
        this.module.envelope.attack = this.ampAttack;
        this.module.envelope.decay = this.ampRelease;
        this.module.filterEnvelope.attack = this.filterAttack;
        this.module.filterEnvelope.decay = this.filterRelease;
        this.module.filterEnvelope.octaves = this.filterEnvAmount;
        this.module.filter.frequency.value = this.filterCutoff;
        this.module.oscillator.spread = this.detune;
    }

    triggerNote(note) {
        this.module.triggerAttackRelease(note, this.ampRelease);
    }

    setParameters(parameters) {
        super.setParameters(parameters);
        this.ampAttack = parseFloat(parameters.ampAttack);
        this.ampRelease = parseFloat(parameters.ampRelease);
        this.filterAttack = parseFloat(parameters.filterAttack);
        this.filterRelease = parseFloat(parameters.filterRelease);
        this.filterEnvAmount = parseFloat(parameters.filterEnvAmount);
        this.filterCutoff = parseFloat(parameters.filterCutoff);
        this.detune = parseFloat(parameters.detune);
        this.dynamicFilterOn = parameters.dynamicFilterOn;
        this.updateSynthSettings();
    }

    update(distance, initDistance, angle) {
        if (!this.dynamicFilterOn || distance > initDistance) {
            return;
        }

        let val = distance / initDistance * 1000;
        this.module.filter.frequency.value = val;
    }

    exportCopy() {
        let copy = super.exportCopy();
        return {
            ...copy,
            type: "monosynth",
            ampAttack: this.ampAttack,
            ampRelease: this.ampRelease,
            filterAttack: this.filterAttack,
            filterRelease: this.filterRelease,
            filterCutoff: this.filterCutoff,
            filterEnvAmount: this.filterEnvAmount,
            detune: this.detune,
            dynamicFilterOn: this.dynamicFilterOn
        };
    }
}

export default MonoSynth;