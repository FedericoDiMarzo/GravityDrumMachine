import CanvasTools from "./CanvasTools.js"
import MathTools from "../utility/MathTools.js"
import PhysicsConstants from "../utility/PhysicsCostants.js";

/**
 * TODO: change Physicsconstants.g to a multiplicative factor (aesthetic)
 */

let BallCannon = {
    shootBall: function (ball, gravityBall, type) {
        // Computing motion variables
        let vars = {
            //maximum radius in which user can place a ball
            maxR: getMaxRadius(),
            //radial coordinates
            absr: getRadius(ball),
            phi: Math.atan2(-1 * ball.y, ball.x),
            //Potential constant
            potentialConstant: ball.getMass() * gravityBall.getMass() / PhysicsConstants.g ,
            //Potential energy
            potentialEnergy: getPotentialEnergy(ball, gravityBall),
            //Kinetic energy < kinMaxClosed --> collision, elliptical or circular motions; = hyperbolic motion; > parabolic
            kinMaxClosedTraj: -1 * getPotentialEnergy(ball, gravityBall),
            // v < absVMax for circular, elliptic and soft collisions
            absVMax: Math.sqrt(-2 * getPotentialEnergy(ball, gravityBall) / ball.getMass()),
            //inside [-theta, theta] range all vectors starting fom this point to gravity ball
            theta: Math.atan2(gravityBall.size, MathTools.module([getRadius(ball), ball.size])),
            //intensity parameter for future development, now set being 0 at maxR and increasing getting close to gravity ball
            intensity: 1 - getRadius(ball) / getMaxRadius(),
            //computational parameter
            vScale: 7e-6,
        };

        BallCannon.shootType[type](ball, gravityBall, vars);
    },

    shootType:  {
        "coll-hard": collHard,
        "coll-soft": collSoft,
        "hyperbole": hyperbole,
        "parabola": parabola,
        "ellipsis": ellipsis,
        "circular": circular,
        "free-fall": freeFall
    }
};

/**
 * basic variables tools
 */

//Potential energy
function getPotentialEnergy(ball, gravityBall){
   return -1 * (ball.getMass() * gravityBall.getMass()) / (PhysicsConstants.g * MathTools.module([ball.x, ball.y]));
}

//Distance from gravity ball
function getRadius(ball){
    return MathTools.module([ball.x, ball.y]);
}

//canvas diagonal /2
function getMaxRadius(){
    return CanvasTools.getHalfDiagonal();
}

// Sets desired velocity, check correction parameter
function setVelocity(ball, vpol, vars, check){
    let vret = [vpol[0] * Math.cos(vars.phi) + vpol[1] * Math.sin(vars.phi),
                vpol[1] * Math.cos(vars.phi) - vpol[0] * Math.sin(vars.phi)];
    ball.initVx = vars.vScale * vret[0];
    ball.initVy = vars.vScale * vret[1];
    if(check){
        ball.initVx *= 10;
        ball.initVy *= 10;
    }
    ball.vx = ball.initVx;
    ball.vy = ball.initVy;
}

//Frees ball from friction
function freeBall(ball){
    ball.isFree = true;
}

//Let the ball be subject to friction
function frictionBall(ball){
    ball.isFree = false;
}

//Angle tool to avoid collisions
function randAngle(theta, rnd, ball){
    let angle = theta;
    if((ball.x < 0 && ball.y<0) || !(ball.x < 0 && ball.y<0)){
        angle *= -1;
        angle -= rnd;
    }
    else{
        angle += rnd;
    }
    return angle;
}

/**Handling desired motions**/
//collision cases --> damped
//Hard case
function collHard(ball, gravityBall, vars) {
    //ball is again subject to friction
    frictionBall(ball);
    //computes module of velocity
    let absv = 2 * Math.sqrt(-2 * vars.potentialEnergy / ball.getMass()) / (vars.intensity + 0.7);
    //random angle between -theta and theta
    let rand = Math.random();
    let inv = [1, -1];
    let angle = (((Math.random() * 2)<1) ? inv[0] : inv[1]) * vars.theta * (1 - 1 / 10) * rand;
    //velocity in polar frame
    //sure collision having velocity angle with respect to radius between [-theta : theta] range
    let vpol = [-1 * absv * Math.cos(angle), -1 * absv * Math.sin(angle)];

    //going back in x-y frame
    setVelocity(ball, vpol, vars, true);
}

//soft case
function collSoft(ball, gravityBall, vars) {
    //ball is again subject to friction
    frictionBall(ball);
    //wide angle
    let gamma = Math.PI * Math.random() - Math.PI / 2;
    //computes kinetic energy
    let kinEnergy = -1 * vars.potentialEnergy / 4;
    //linear growth, angular correction reduces velocity for wide angles --> early collisions
    let absv = vars.intensity * ((1.5 - Math.abs(gamma) / Math.PI < 1) ? (1.5 - Math.abs(gamma) / Math.PI < 1) : 1)
        * 0.99 * Math.sqrt(2 * kinEnergy / ball.getMass());
    absv = (absv > (0.9 * vars.absVMax)) ? (0.9 * vars.absVMax) : absv;
    //velocity in polar frame
    let vpol = [-1 * absv * Math.cos(gamma), -1 * absv * Math.sin(gamma)];

    //back to x-y frame
    setVelocity(ball, vpol, vars, true);
}

//gravity motion cases --> NOT damped
function hyperbole(ball, gravityBall, vars) {
    //frees from friction
    freeBall(ball);
    //handling angle
    let angle = randAngle(vars.theta, Math.PI / 8, ball);
    //velocity in polar frame
    let vpol = [-1 * vars.absVMax  * Math.cos(angle),
       -1 * vars.absVMax  * Math.sin(angle)];
    //back to x-y frame
    setVelocity(ball, vpol, vars, true);
}

function parabola(ball, gravityBall, vars) {
    //frees from friction
    freeBall(ball);
    //handling angle
    let angle = randAngle(vars.theta, Math.PI / 6 * Math.random() + Math.PI / 32, ball);
    //velocity in polar frame
    let vpol = [-1 * vars.absVMax * (1 + vars.intensity / 5) * Math.cos(angle),
        -1 * vars.absVMax * (1 + vars.intensity / 5) * Math.sin(angle)];

    //back to x-y frame
    setVelocity(ball, vpol, vars, true);
}

function ellipsis(ball, gravityBall, vars) {
    //avoiding collisions if choosing ellipsis being too close to gravity ball
    if(vars.absr >= 192) {
        //frees from friction
        freeBall(ball);
        //handling angle
        let inv = [1, -1];
        //random clockwise/counter-clockwise motion
        let gamma = (((Math.random() * 2) < 1) ? inv[0] : inv[1]) * Math.PI / 2;
        //computes module of velocity
        let absv = Math.sqrt(2 * (vars.intensity * 0.9) * vars.kinMaxClosedTraj * vars.absr / (gravityBall.size * ball.getMass()));
        //velocity in polar frame
        let vpol = [-1 * absv * Math.cos(gamma), -1 * absv * Math.sin(gamma)];

        //back to x-y frame
        setVelocity(ball, vpol, vars, false);
    }
    //too close motions decades in circular
    else{
        circular(ball, gravityBall, vars);
    }
}

function circular(ball, gravityBall, vars){
    //frees from friction
    freeBall(ball);
    //computes energy
    let kinEnergy = -1 * vars.potentialEnergy / 2;
    //computes module of velocity, 3.5 empiric correction
    let absv = 3.5 * Math.sqrt(2 * kinEnergy / ball.getMass());
    //random clockwise/counter-clockwise motion
    let inv = [1, -1];
    let gamma = (((Math.random() * 2)<1) ? inv[0] : inv[1]) * Math.PI / 2;
    //velocity in polar frame
    let vpol = [-1 * absv * Math.cos(gamma), -1 * absv * Math.sin(gamma)];

    //back to x-y frame
    setVelocity(ball, vpol, vars, false);
}

function freeFall(ball, gravityBall, vars){
    //ball is again subject to friction
    frictionBall(ball);
    //sets velocity
    setVelocity(ball, [0, 0], vars);
}

export default BallCannon;