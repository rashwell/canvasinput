canvasinput
===========

Canvas Input for both WebGL and 2d contexts

Description
-----------
Creates an Input control element for rendering in a graphics HTML5 Canvas context.

This was originally based, and for the moment forked from the exceptional work by James Simpson and GoldFire Studios, Inc.

The original project is here: https://github.com/goldfire/CanvasInput

I have a few major goals (below) that encouraged me to start this effort with typescript rather than javascript directly.  This will make it a little difficult to push back anything but minor fixes back to the original project however after I hit my 4th goal, I'll try and do a merge pull with the original project.

Goals
-----
- [x] Gross conversion of the original project to typescript to add a little type safety
- [x] Add additonal tools and surrounding configs to make it easier to develop and test
- [ ] Add the webgl portions, not only canvas 2d but also canvas webgl to support (pixi, phaser.io, etc).
- [ ] Add some basic test setups
- [ ] Try a pull request from the original project diff'd with the output of the typescript compile to get the webgl feature pushed back to the original in case that project continues development
- [ ] Add a wrapper plugin in for Phaser.io and/or Pixi.js or other frameworks.
- [ ] Misc improvements, like Shift Keyboard highlighting, as well as components for the later (Hard Parts)

The Hard Parts
--------------
James, made great progress through some of the tougher parts of this type of control but here are some hard parts to come

-[ ] Adding alternate non-DOM backend support.  This might make it possible for a control like this to be used with framerworks where DOM access isnt allowed. It's too convient and slick to use the DOM, but maybe and optional method could be added, or perhaps compileing from a different source, to keep the controls light, but with the same api and methods.

Usage
-----

Development Tools
-----------------

License
-------

Continuing with what James Simpson and GoldFire Studios, Inc intended with an MIT license.
