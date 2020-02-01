# Gravity Drum Machine

*Jacopo Piccirillo*

*Federico Di Marzo*

*February 2020*


## Introduction
Linearity is not the most enjoyed parameterization when it comes to perception of sound. Complex is -somehow- a more enjoyed and natural behavior. Nevertheless, modern drum-machines don't explore beyond linear tempos that, if they stand *of course* as fundamental part of a musical piece, can also not be the only texture of rhythm in music. It is possible to superimpose over them different, more chaotic, rhythmic evolutions and exploring this and other concepts is the main purpose of this project. 

Much automatization has been developed in the audio field with the possibility of following an exponential pattern. We anyway wandered more and thought about: what if we could develop a system that automates sound according to the laws of nature? 

From this idea the gravity drum machine concept was born.

   <img src = "images/galaxy.jpg" width = "600" >

* ### Main features
 
    *Gravity field*
    
   * The basic concept of this software is to simulate a small galaxy in which motion is determined by a **gravity field**. The universe has a signature associated (*e.g. 3/4:5/8*) which can be determined by the user. Every step in the signature is associated to a different system which starts its motion when tempo triggers the associated step. In every system there is a black ball which generates the gravity field and, when turned on, gets triggered emitting a sound every time the simulation starts. User can put other (randomly coloured) balls inside which will move according to the laws of gravitational motion and sound when they'll collide with the black ball.
    
    *Polyrhythms*
    
   * The software can simulate more than a galaxy at the same time, everyone associated with his own time signature. This will result in the capability of generating a universe sounding as every kind of **polyrhythm**, whith the possibility of the superposition of **linear** and **non-linear** behaviours with the addition of moving balls by the user.
   
    *Positional panning*
     
    * Sound emitted by moving objects can be **panned as their position** in the simulation, resulting in a dynamic stereo pan effect, improving audio/video perception.
    
     *Motion modulation*
     
    * Behaviours can be automatized following **gravity-motion equations patterns**, resulting in complex exponential behaviours. There will be a damped behaviour in colliding balls, which go subject also to a friction force. Non-colliding balls will not be subject to friction (having so periodic motion when orbiting). 
    
     *Double view*
     
    * There are two views in this drum machine, the first called **Galaxy view** which has a standard -*sequencer fashioned*- architecture. Inside the **Galaxy view** there will be one or more systems (*e.g. three for a 3/4 galaxy, one for every step of the sequence*), and all of them will be accessible via the **System view**. Inside the **System view** gravity motion happens. Systems get triggered, starting and ending their sounds and motions, by the **metronome**.
 
* ### Limits and future features
   Along with the physical impossibility of subdividing time under certain orders, the "**tone.js**" library we used does not support infinite time subdivision. Supporting polyrhythms leads to frequencies of the order from *pow(2,n)* to *pow(n,n)*, n being how many prime numbers are divisors of at least one denominator, which tone magnifies 127 times by the "**tone.js**" library object used to handle tempo. Frequencies can become very high especially when metric measure subdivisions (*i.e. denominator of metric signatures*) **are (or are divided by) lots of different prime numbers**, leading to very small time subdivisions and possible errors.   
 
  Balls can now be created only with zero-velocity and will be able to generate only percussive sounds. However, we are currently focused on developing a way for the user to put non-zero initial velocity balls whith sub-options of orbiting or colliding in the systems, along with adding synth sounds, the possibility of automating according to ball motion, doppler-effect features and the possibility of filtering with orbiting filters.
  
  *More will come*

## Overview

<figure>
  <figcaption>-->Figure 1: New project<-- </figcaption>
  <img src = "images/gdm.PNG" width = "600" >
</figure>

When loaded the software will display a black screen in which the universe will be composed of a single **galaxy** associated with a 1/4 signature. Therefore the newborn universe will be started containing one single galaxy which will herself contain one single system, this represented by the single green-margined central square shown in the center of Figure 1. We will call in this text what is shown in Figure 1 and 2 "***Galaxy view***" to distinguish it from the "***System view***", which usage will become clear later in this overview.

On the top right corner we find an icon that will show a menu when clicked, giving the option of **saving** the current project or **loading** a previously saved one, along with the option of **creating** or destroying **sequences** (*i.e. **galaxies***). 

Under that icon we find the rhythmic metric associated with the newborn **galaxy**, which can be modified by clicking on it: a popup will appear in which the metric will be reset. By doing that new systems will be spawned (or canceled if the numerator of the metric gets decreased), all of them composed in the beginning just by a central, gravity attracting, black ball.

<figure>
  <figcaption>-->Figure 2: 3/4 galaxy<-- </figcaption>
  <img src = "images/3_4.PNG" width = "600" >
</figure>

Moving towards the bottom right corner we find **play** and **stop** buttons, which can be toggled also by pressing the **spacebar**. **BPMs** are located left of them; a pop-up will spawn when clicking  giving the possibility of changing them. On the bottom right we find the **galaxy name**, which can be reset by clicking on it and typing the desired name in the pop-up that will appear.

On the top-left we find just the name of the project and under that -*i.e. center left*- a thin **bar**. Usage of aforementioned **bar** will be clear when how to generate **polyrhythms** will be discussed.



We have so covered the **galaxy view** and move now forward towards the **system view**.

<figure>
  <figcaption>-->Figure 3: System view<-- </figcaption>
  <img src = "images/empty.PNG" width = "600" >
</figure>

Clicking on one of the systems the user will be projected into the **system view** which will appear populated initially only by the central gravity ball.

We here find the same already described features of the **galaxy view**, with no thin bar displayed and with the software name substituted by a left-pointing arrow, which gives the possibility of going back to galaxy view when clicked on.

The central ball will emit a sound when the **metronome** steps on its system. Central balls can also be muted: when in pause, clicking on the central ball will cause it to go white, representing the fact that the ball is now muted (but still attracting other balls). Clicking on it again will unmute it. Always when in pause, clicking everywhere in the blank space will generate other balls, that will be attracted by the central ball, emitting a sound when colliding. Clicking on them again will remove them, clicking and holding will give the possibility of dragging them around.

Right clicking on a ball generates a pop-up menu which gives, among the other options, the possibility of changing sample and note triggered by the balls. This menu will be better explanated later in the **Sound Module** section.

<figure>
  <figcaption>-->Figure 4: Adding balls<-- </figcaption>
  <img src = "images/niceballs.PNG" width = "600" >
</figure>

You are now **Up&Going**! Open your software, set your rhythmic signature, place balls inside the system and hit play to watch them sound as the galaxy evolves, or enjoy a more broad view stepping in the galaxy. Have fun! 

<figure>
  <figcaption>-->Figure 5: Muted gravity ball<-- </figcaption>
  <img src = "images/muted.PNG" width = "600" >
</figure>

## Advanced usage

<figure>
  <figcaption>-->Figure 6: Menu<-- </figcaption>
  <img src = "images/menu.PNG" width = "600" >
</figure>

We until now have understood how to initiate and make a single galaxy sound. Now we will focus on a deeper usage.

### Multiple galaxies and polyrhythms
We already talked about the possibility of simulating more than one galaxy in order to obtain a more-complex, polyrhythmical behaviour. To do so, all we have to do is to add other galaxies, set all of them as we already discussed previously for a single one and hit play.

<figure>
  <figcaption>-->Figure 7: 3/4 galaxy in a 3/4:5/8 universe<-- </figcaption>
  <img src = "images/3_4_2.PNG" width = "600" >
</figure>

To create a new galaxy we have to click on "***New Sequence***" from the menu (Fig.6). This will generate an entire new galaxy, superimposed  with the previous one. You will see the white bar in the middle left now having the possibility of moving through 2 different states, indexing the two currently existing galaxies. every time we want to create a galaxy we have to iterate the process. States will increase by 1 every time a new galaxy gets created in the universe. 

To remove a galaxy scroll to it and click "***Delete Sequence***" from the menu.

<figure>
  <figcaption>-->Figure 1: 5/8 galaxy in a 3/4:5/8 universe<-- </figcaption>
  <img src = "images/5_8.PNG" width = "600" >
</figure>

Hitting up and down arrow will scroll through the index, currispondent galaxy showing on the screen. 

### Sound modules and their menu
Either attracting and moving balls contain a **sound module**. This will contain a sound source or an effect along with the possibility of changing some of its parameters and the possibility of automating them over time.

**Right clicking** on a ball will pop-up a menu which will give the possibility of changing the size of the ball (*we feel free to remind here that an increased size will not affect acceleration of the object*), the note triggered, the audio module contained (sample, synth, filter...). Along with the size slider there will be another two, one regulating a gain node and another the release of the note (attack will be triggered by **collisions** or **metronome**).

* #### Every audio module will have some other options inside this menu:

   *Sampler*
    
   * Selectable sample.
   
### Copy-paste
Hitting left and right arrow in the galaxy view will scroll through galaxy's systems, the selected one being surrounded by a green margin. Pressing **cmd(ctrl) + c** will copy the selected system, which can be pasted in another one by moving over it and pressing **cmd(ctrl) + v**.

### Saving and loading universes
It is possible to save the configuration obtained for future usages, by clicking on "***Save Universe***" from the menu. Doing so will spawn a pop-up containing a link which will download a "***.galaxy***" object. Name of the object will be the same as the universe.

To reload the configuration, it is sufficient to click on "***Load Universe***" from the menu and load the object back from where it was stored through the pop-up that will appear. 

### Keyboard shortcuts

   - Press "***u***" to switch from **system** to **galaxy view** and vice-versa.
   - Press "***spacebar***" to toggle play and stop.
   - Press "***cmd(ctrl) + c***" to copy a system and "***cmd(ctrl) + v***" to paste it.
   - Select **System** with **left** and **right** arrow.
   - Select **Galaxy** with **up** and **down** arrow.
   
## Physics' insights

Everything here works under rigorous physical laws. For a deeper understanding of the automation possibility of this software it is worth having a look at its physics. We will enumerate the different possible types of motion and what kind of automation one can get from it.

**All** automatization are taken in this software as the temporal evolution of coordinates and velocities of the objects. The graph **coordinate(velocity)-time** will correspond to the envelope obtained.

* #### Colliding Motion
   This motion will be an *harmonic damped oscillator*. An exact **harmonic damped envelope** can be found in the time-evolution of the radius of a colliding ball.
   
* #### Circular motion 
   Both x and y coordinates follow a periodic sine-cosine behaviour. From x and y coordinates we can get a **sine wave** behaviour (**y**) and a **cosine wave** one (**x**), so the second one having PI/2 phase shift from the first one. Frequency will be the frequency of the motion.
   
   *More*, from the angle we can get a linear behaviour, wich will result in a **sawtooth-wave modulation**. Frequency of the wave will be proportional directly to velocity and inversely to radius of the ball, slope inverting according to clockwise/conuter-clockwise motion. 
   
* #### Elliptical motion
   Elliptical motion can be decomposed over the superposition of two perpendicular harmonic motions at different frequencies. This means that in general one will get linear combinations of two different sine-fashioned waves in the time evolution of x and y, and so an automatization following a pattern of the sum (or difference) of **two sine oscillators with a different gain**.
   
  Radius and angle will follow more complex (and worth exploring) **periodic** patterns. Same can be said about the slope of the angular evolution as in the circular case.
  
* #### Hyperbolic motion
   The ball will describe a parabola with one focus situated where the gravity ball is. Radius will be equivalent to the distance of the ball by the focus. From this case  can be computed a non.linear **hyperbolic** behaviour.
   
   Velocity tends to zero without never actually becoming zero in this case.
   
* #### Parabolic motion
   In this case balls follow the pattern of a parabola in which the radius represents the distance from its focus. From this case can be computed a non-linear ***pow(x,2)*** behaviour.
   
   Velocity doesn't tend to zero in this case.

## Authors' notes

This project started as an examination and ended up in something we will further develop and expand; having it we believe an undercover potential much bigger than what this first version is exploiting, and being a perfect playground for sound/gravity-motion experiments. 

*Jacopo Piccirillo*

*Federico Di Marzo*