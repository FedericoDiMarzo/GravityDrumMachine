import Ball from "../model/Ball.js";
import MathTools from "../utility/MathTools.js"


class CollisionChecker {

    /**
     * Class for handling collision between balls.
     * @param drumUniverse array of balls
     */
    constructor(drumUniverse) {
        this.drumUniverse = drumUniverse;
        this.collisionDetected = false;
    }


    /**
     * Handle the collision between two elements.
     * @param el1
     * @param el2
     */
    elCheckUpdate(el1, el2) {

        // if both elements are not solid, they don't bounce
        if (!el1.isSolid && !el2.isSolid) {
            return;
        }

        let d = Math.sqrt(Math.pow(el1.x - el2.x, 2) + Math.pow(el1.y - el2.y, 2));

        // collision between balls detected
        if (d - el1.size - el2.size <= 0) {
            this.collisionDetected = true;

            let m1 = el1.getMass();
            let m2 = el2.getMass();
            let v1 = [el1.vx, el1.vy];
            let v2 = [el2.vx, el2.vy];
            let r1 = [el1.x, el1.y];
            let r2 = [el2.x, el2.y];

            /**
             * Function to make balls bounce
             * @param el1
             * @param v1
             * @param v2
             * @param r1
             * @param r2
             * @param m1
             * @param m2
             */
            function bounce(el1, v1, v2, r1, r2, m1, m2) {

                if (el2.isFixed) {
                    el1.play(el1.note); // note triggered

                    let i = [1, 0]; //x-axis

                    let diffPos = MathTools.difference(r1, r2); // vector r1-r2
                    let diffVel = MathTools.difference(v1, v2); // vector v1-v2
                    let absDP = MathTools.module(MathTools.difference(r1, r2)); // module r1-r2
                    let absDV = MathTools.module(MathTools.difference(v1, v2)); // module v1-v2
                    let cosAlpha = MathTools.dot(diffVel, diffPos) / ((absDP) * (absDV)); //Cosine of angle between r1-r2 and v1-v2
                    cosAlpha = MathTools.clipAngle(cosAlpha); // avoid clipping
                    let senAlpha = Math.sqrt(1 - Math.pow(cosAlpha, 2));
                    let cosBeta = MathTools.dot(i, diffPos) / absDP; //angle between radial-tangent and x-y frame
                    cosBeta = MathTools.clipAngle(cosBeta);
                    let senBeta = Math.sqrt(1 - Math.pow(cosBeta, 2));
                    senBeta = (el1.vy <= 0) ? -senBeta : senBeta; //two solution for sine for fixed cosine,
                    // depending on if collision happens on top or bottom of gravity ball
                    let Vpl = [absDV * cosAlpha, absDV * senAlpha]; //velocity in radial-tangent frame

                    Vpl[0] = -Vpl[0]; //collision inverts radial velocity

                    //inverse rotation: Cos --> Cos && Sen --> -Sen
                    //going back to x-y axis
                    el1.vx = Vpl[0] * cosBeta + Vpl[1] * senBeta;
                    el1.vy = Vpl[1] * cosBeta - Vpl[0] * senBeta;

                }
            }

            if (!el1.isFixed) {
                bounce(el1, v1, v2, r1, r2, m1, m2);
            }

            if (!el2.isFixed) {
                bounce(el2, v2, v1, r2, r1, m2, m1);
            }

            this.collisionDetected = false;
        }
    }

    /**
     * Check the collision for every target
     */
    collisionCheck() {
        let windowBounce = false; // set to true for window bouncing

        let targets = this.drumUniverse.balls.concat(this.drumUniverse.gCenter);
        for (let i = 0; i < targets.length; i++) {
            let el1 = targets[i];
            for (let j = i + 1; j < targets.length; j++) {
                let el2 = targets[j];
                this.elCheckUpdate(el1, el2);
            }

            // collision with the boundaries of the canvas
            if (windowBounce) {
                if (this.xCollision(el1)) {
                    el1.vx = -el1.vx;
                }
                if (this.yCollision(el1)) {
                    el1.vy = -el1.vy;
                }
            }
        }
    }

    /**
     * Checks collisions with x boundaries.
     * @param el
     * @return {boolean}
     */
    xCollision(el) {
        let flag = false;
        if (el.x - el.size < 0 ||
            el.x + el.size > window.innerWidth) {
            flag = true;
        }
        return flag;
    }

    /**
     * Checks collisions with x boundaries.
     * @param el
     * @return {boolean}
     */
    yCollision(el) {
        let flag = false;
        if (el.y - el.size < 0 ||
            el.y + el.size > window.innerHeight) {
            flag = true;
        }
        return flag;
    }

    /**
     * Checks if a ball is clicked or near a test ball.
     * In case a ball is clicked, it's returned as a flag.
     *
     * @param ball, test ball
     * @return {"no-ball" | "ball-near" | Ball }
     */
    checkSpace(ball) {
        let flag = "no-ball";
        this.drumUniverse.balls.concat(this.drumUniverse.gCenter).forEach(b => {
            let d = Math.sqrt(Math.pow(ball.x - b.x, 2) + Math.pow(ball.y - b.y, 2));
            if (d - b.size <= 0) {
                flag = b;
            } else if (d - b.size - ball.size <= 0) {
                flag = "ball-near";
            }
        });

        return flag
    }
}

export default CollisionChecker;