import MathTools from "./MathTools.js";
import PhysicsConstants from "../utility/PhysicsCostants.js";


let BallCannon = {
    shootBall: function (ball, gravityBall, type) {
        // Computing motion variables
        let vars = {
            //maximum radius in which user can place a ball
            maxR: getMaxRadius(),
            //radial coordinates
            absr: getRadius(ball),
            phi: Math.atan2(-1 * ball.y, ball.x),
            //Potential energy
            potentialConstant: PhysicsConstants.g * ball.getMass() * gravityBall.getMass(),
            potentialEnergy: getPotentialEnergy(ball, gravityBall),
            //Kinetic energy < kinMaxClosed --> collision, elliptical or circular motions; = hyperbolic motion; > parabolic
            kinMaxClosedTraj: -1 * getPotentialEnergy(ball, gravityBall),
            // v < absVMax for circular, elliptic and soft collisions
            absVMax: Math.sqrt(-2 * getPotentialEnergy(ball, gravityBall) / ball.getMass()),
            //inside [-theta, theta] range all vectors starting fom this point to gravity ball
            theta: Math.atan2(-1 * gravityBall.size, getRadius(ball)),
            //Circular total energy eCirc = u + kinEnergy, minimum energy value for closed orbits
            eCirc: getCircularEnergy(ball, gravityBall),
            //intensity parameter for future development, now set being 0 at maxR and increasing getting close to gravity ball
            intensity: 1 - getRadius(ball) / getMaxRadius(),
        };

        BallCannon.shootType[type](ball, gravityBall, vars);
    },

    shootType:  {
        "coll-hard": collHard,
        "coll-soft": collSoft,
        "hyperbole": hyperbole,
        "parabola": parabola,
        "ellipsis": ellipsis
    }
};

/**
 * basic variables tools
 */


function getPotentialEnergy(ball, gravityBall){
   return -1 * (PhysicsConstants.g * ball.getMass() * gravityBall.getMass()) / MathTools.module([ball.x, ball.y]);
}

function getCircularEnergy(ball, gravityBall){
    return getPotentialEnergy(ball, gravityBall) / 2;
}

function getRadius(ball){
    return MathTools.module([ball.x, ball.y]);
}

function getMaxRadius(){
    return MathTools.module([document.getElementById("gravity-canvas").width,
        document.getElementById("gravity-canvas").height]) / 2;
}

function setVelocity(ball, vpol, vars){
    let vret = [vpol[0] * Math.cos(vars.phi) + vpol[1] * Math.sin(vars.phi), vpol[1] * Math.cos(vars.phi) - vpol[0] * Math.sin(vars.phi)];
    ball.initVx = 1e3 * vret[0];
    ball.initVy = 1e3 * vret[1];
    ball.vx = 1e3 * vret[0];
    ball.vy = 1e3 * vret[1];
}

function freeBall(ball){
    ball.isFree = true;
}

/**Handling desired motions**/
//collision cases --> damped
//Hard case
function collHard(ball, gravityBall, vars) {
    //exponential growth with intensity
    let absv = Math.pow(Math.sqrt(vars.absVMax), vars.intensity * 3);
    //random angle between -theta and theta
    let rand = Math.random() * 11;
    let inv = [1, -1];
    let angle = (((Math.random() * 2)<1) ? inv[0] : inv[1]) * vars.theta * rand / 10;
    //velocity in polar frame
    //sure collision having velocity angle with respect to radius between [-theta : theta] range
    let vpol = [-1 * absv * Math.cos(angle), -1 * absv * Math.sin(angle)];

    //going back in x-y frame
    setVelocity(ball, vpol, vars);
}

//soft case
function collSoft(ball, gravityBall, vars) {
    let kinEnergy = vars.eCirc - vars.potentialEnergy;
    //linear growth
    let absv = vars.intensity * 0.99 * Math.sqrt(2 * kinEnergy / ball.getMass());
    //wide angle
    let gamma = (Math.PI * (Math.random() * 1000)) / 1000 - Math.PI / 2;
    let vpol = [-1 * absv * Math.cos(gamma), -1 * absv * Math.sin(gamma)];

    //back to x-y frame
    setVelocity(ball, vpol, vars);
}

//gravity motion cases
function hyperbole(ball, gravityBall, vars) {
    freeBall(ball);
    let vpol = [vars.absVMax * (1 + vars.intensity / 2) * Math.cos(vars.theta + Math.PI / 16),
        vars.absVMax * (1 + vars.intensity / 2) * Math.sin(vars.theta + Math.PI / 16)];

    //back to x-y frame
    setVelocity(ball, vpol, vars);
}

function parabola(ball, gravityBall, vars) {

}

function ellipsis(ball, gravityBall, vars) {

}



/**
 * Sets trajectory
 * TODO: test
 * @param graveLer gravity center
 * @param str desired trajectory
 * @param intensity parameter between 0 and 1

function setPeculiarVelocity(graveLer, str, intensity) {


    // let shootingStyle = {
    //     "chiave": sparaN1
    // };
    //
    // shootingStyle[type]();

    if (!graveLer.isFixed)
        return;
    let r = [this.x - graveLer.x, this.y - graveLer.y];
    // radial coordinates absr and phi
    let absr = MathTools.module(r);
    let phi = Math.atan2(-r[1], r[0]);
    let k = 6.67e8 * this.getMass() * graveLer.getMass();
    //potential energy
    let u = -k / absr;
    //maximum kinetic energy in order to have closed trajectory
    let kinMaxClosedTraj = -u;
    // v <= absVMax for circular and elliptic
    let absVMax = Math.sqrt(2 * kinMaxClosedTraj / this.getMass());
    //inside [-theta, theta] range all vectors starting fom this point to gravity ball
    let theta = Math.atan2(-1 * graveLer.size, absr);
    //Circular total energy eCirc = u + kinEnergy, minimum energy value for closed orbits
    let eCirc = -k / (2 * absr);

    //collision case
    //hard case: exponential velocity, pointed in [-theta, theta] range from gravity center
    //algorithm can be used with any absv >= 0 parameter
    if (str === "coll-hard") {

        //exponential growth with intensity
        let absv = Math.pow(Math.sqrt(absVMax), intensity * 3);
        //random angle between -theta and theta
        let rand = Math.random() % 11;
        let inv = [1, -1];
        theta = inv[Math.random() % 2] * theta * rand / 10;
        //velocity in polar frame
        //sure collision having velocity angle with respect to radius between [-theta : theta] range
        let vpol = [absv * Math.cos(theta), absv * Math.sin(theta)];

        //going back in x-y frame
        vpol = MathTools.changeFrame(vpol, phi);
        this.vx = vpol[0];
        this.vy = vpol[1];
    }
    //soft case: linear velocity, wide angle
    else if (str === "coll-soft") {
        let kinEnergy = eCirc - u;
        //linear growth
        let absv = intensity * 0.99 * Math.sqrt(2 * kinEnergy / this.getMass());
        //wide angle
        let gamma = Math.PI * (Math.random() % 1001) / 1000 - Math.PI / 2;
        let vpol = [absv * Math.cos(gamma), absv * Math.sin(gamma)];

        //back to x-y frame
        vpol = MathTools.changeFrame(vpol, phi);

        this.vx = vpol[0];
        this.vy = vpol[1];

    }
    //gravity motion case
    else {
        //removing friction
        this.isFree = true;
        let vpol = [0, 0];
        //handling cases
        if (str === "hyp") {
            vpol = [absVMax * (1 + intensity / 2) * Math.cos(theta + Math.PI / 16),
                absVMax * (1 + intensity / 2) * Math.sin(theta + Math.PI / 16)];
        } else if (str === "par") {
            vpol = [0, absVMax]
        } else if (str === "ell") {
            intensity *= 0.99;
            let gamma = theta + (Math.PI / 2 - theta) * (Math.random() % 1001) / 1000 - Math.PI / 2;
            //explores different elliptic trajectories according to intensity; intensity = 0 circular trajectory
            let kinEnergy = eCirc - u * (1 + intensity);
            let absv = Math.sqrt(2 * kinEnergy / this.getMass());
            vpol = [absv * Math.cos(gamma), absv * Math.sin(gamma)];
        } else {
            //default circular
            let kinEnergy = eCirc - u;
            let absv = Math.sqrt(2 * kinEnergy / this.getMass());
            vpol = [0, absv];
        }

        //back to x-y frame
        vpol = MathTools.changeFrame(vpol, phi);

        this.vx = vpol[0];
        this.vy = vpol[1];
    }
}*/

export default BallCannon;