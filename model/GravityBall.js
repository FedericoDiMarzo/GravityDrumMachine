import Ball from "./Ball.js";
import Sampler from "../sound/Sampler.js";
import PhysicsConstants from "../utility/PhysicsCostants.js";

class GravityBall extends Ball {
    /**
     * Ball that attracts other non target initBalls.
     *
     * @param targets array of initBalls
     */
    constructor(x, y, size, targets) {
        super(x, y, 0, 0, size, "#000");
        this.isSolid = true;
        this.isFixed = true;
        this.targets = targets || [];
        this.density = 10e10; // standard density for a GravityBall
        this.soundModule = new Sampler();

    }

    /**
     * Variates the state for drumUniverse.
     */
    attract() {
        this.targets.forEach(el => {
            // gravitational forces
            let d2 = Math.pow(el.x - this.x, 2) + Math.pow(el.y - this.y, 2);
            d2 /= PhysicsConstants.g; // G Constant
            let phi = Math.atan2(this.y - el.y, this.x - el.x);
            let f = this.getMass() * el.getMass() / d2;
            let fx = f * Math.cos(phi);
            let fy = f * Math.sin(phi);

            // affecting velocity
            el.vx += fx / el.getMass();
            el.vy += fy / el.getMass();
        });
    }

    /**
     * Overloading update.
     */
    update() {
        super.update();
        this.attract();
    }

}


export default GravityBall;

