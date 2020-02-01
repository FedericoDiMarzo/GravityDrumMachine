/**
 * Wrapper for an efx send.
 * It contains a delay and a reverb modules
 * connected to Tone.Master
 */
let FxWrapper = {
    delay: new Tone.FeedbackDelay(0.3, 0.4).toMaster(),
    reverb: new Tone.JCReverb(0.8),
};

let convRev = new Tone.Reverb();
convRev.generate();
FxWrapper.reverb.chain(convRev, Tone.Master);



export default FxWrapper;