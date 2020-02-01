import FxWrapper from "./FxWrapper.js";

class SoundModule {

    /**
     * Interface used for new sound modules.
     */
    constructor(module) {
        this.effects = [];
        this.gain = null;
        this.gainNode = new Tone.Gain(1).toMaster();
        this.channelNode = new Tone.Channel(0, 0); // used for panning
        this.delaySend = 0;
        this.reverbSend = 0;
        this.delaySendGain = new Tone.Gain(0);
        this.reverbSendGain = new Tone.Gain(0);
        this.module = module;
        this.setGain(0.65); // default gain

        // FX send
        this.gainNode.chain(this.delaySendGain, FxWrapper.delay);
        this.gainNode.chain(this.reverbSendGain, FxWrapper.reverb);
    }

    /**
     * Update function for the sound module
     *
     * @param distance
     * @param initDistance
     * @param angle
     */
    update(distance, initDistance, angle) {
        return;
    }

    /**
     * Sets module gain
     *
     * @param gain
     */
    setGain(gain) {
        if (this.module) {
            this.gain = gain;
            this.gainNode.gain.value = gain;
        }
    }

    /**
     * Sets the pan of the module in [-1, 1]
     * @param value
     */
    setPan(value) {
        if (value < -1) value = -1;
        if (value > 1) value = 1;

        this.channelNode.pan.value = value;
    }

    /**
     * Sets send amount for the delay
     * @param value
     */
    setDelaySend(value) {
        this.delaySend = value;
        this.delaySendGain.gain.value = value;
    }

    /**
     * Sets send amount for the delay
     * @param value
     */
    setReverbSend(value) {
        this.reverbSend = value;
        this.reverbSendGain.gain.value = value;
    }

    /**
     * insert a new effect at the end.
     * @param effect
     */
    pushEffect(effect) {
        this.effects.push(effect);
        this.updateEffectChain();
    }

    /**
     * Insert effect at a position i.
     * @param effect
     * @param i
     */
    insertEffect(effect, i) {
        this.effects.splice(i, 0, effect);
        this.updateEffectChain();
    }

    /**
     * Remove i effect.
     * @param i
     */
    deleteEffect(i) {
        this.effects.splice(i, 1);
        this.updateEffectChain();
    }

    /**
     * Removes all effects.
     */
    clearEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            this.deleteEffect(i);
        }
    }

    /**
     * Swaps effect i with j.
     * @param i
     * @param j
     */
    swapEffect(i, j) {
        let e = this.effects;
        [e[i], e[j]] = [e[j], e[i]];
        this.updateEffectChain();
    }

    /**
     * Reflects the chaining from effects array.
     */
    updateEffectChain() {

        // disconnects all devices first
        this.module.disconnect();
        this.channelNode.disconnect();
        this.gainNode.disconnect(Tone.Master);

        this.effects.forEach(fx => {
            if (fx.numberOfOutputs > 0) {
                fx.disconnect(0)
            }
        });


        // updating the chain
        this.module.chain(...this.effects, this.channelNode, this.gainNode, Tone.Master);


    }


    /**
     * Updates the sound module with new parameters.
     *
     * @param parameters object containing all the parameters to be modified
     */
    setParameters(parameters) {
        this.setGain(parseFloat(parameters.gain));
        this.setDelaySend(parseFloat(parameters.delaySend));
        this.setReverbSend(parseFloat(parameters.reverbSend));
    }

    /**
     * Emits sound.
     *
     * @param note
     */
    triggerNote(note) {
        return;
    };

    /**
     * Save a copy of the object to be jsonfied.
     *
     * @return {object}
     */
    exportCopy() {
        return {
            gain: this.gain,
            delaySend: this.delaySend,
            reverbSend: this.reverbSend
        };
    }

}

export default SoundModule;