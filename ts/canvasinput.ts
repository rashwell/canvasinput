/*!
 *  Converted to Typescript and added support for both rendering 2d and webgl
 *  by: All original Licenses still apply
 *  work by Richard F. Ashwell III
 *
 *  Based on:
 *  CanvasInput v1.2.0
 *  http://goldfirestudios.com/blog/108/CanvasInput-HTML5-Canvas-Text-Input
 *
 *  (c) 2013-2015, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

class CanvasInput {
    static inputs: CanvasInput[] = [];
    static _inputsIndex: number = 0;
    _canvas: HTMLCanvasElement = null;
    _renderCanvas: HTMLCanvasElement = null;
    _shadowCanvas: HTMLCanvasElement = null;
    _hiddenInput: HTMLInputElement;
    _ctx: any = null;
    _renderCtx: any = null;
    _shadowCtx: any = null;
    _x: number = 0;
    _y: number = 0;
    _extraX: number = 0;
    _extraY: number = 0;
    _fontSize: number = 14;
    _fontFamily: string = 'Arial';
    _fontColor: string = '#000';
    _placeHolderColor: string = '#bfbebd';
    _fontWeight: string = 'normal';
    _fontStyle: string = 'normal';
    _readonly: boolean = false;
    _maxlength: any = null;
    _width: number = 150;
    _height: number = 14;
    _padding: number = 5;
    _borderWidth: number = 1;
    _borderColor: string = '#959595';
    _borderRadius: number = 3;
    _backgroundImage: string = '';
    _backgroundColor: any;
    _boxShadow: string = '1px 1px 0px rgba(255, 255, 255, 1)';
    _boxShadowObj: any = null;
    _innerShadow: string = '0px 0px 4px rgba(0, 0, 0, 0.4)';
    _selectionColor: string  = 'rgba(179, 212, 253, 0.8)';
    _placeHolder: string  = '';
    _value: string  = '';
    _onsubmit: any;
    _onkeydown: any;
    _onkeyup: any;
    _onfocus: any;
    _onblur: any;
    _cursor: boolean  = false;
    _cursorPos: number  = 0;
    _hasFocus: boolean = false;
    _selection: number[] = [0, 0];
    _wasOver: boolean = false;
    _mouseDown: boolean = false;
    _renderType: string = '2d';

    shadowL: number = 0;
    shadowR: number = 0;
    shadowT: number = 0;
    shadowB: number = 0;
    shadowH: number = 0;
    shadowW: number = 0;
    outerW: number = 0;
    outerH: number = 0;

    constructor(options?: any) {

        // Load in property overrides
        // This looked like a cool idea but I guess with Implicit Any
        // Its a bad idea to do this loading them all explictly below
        // which I guess is more typesafe anyway
        // for (var prop in options) {
        //    if (options.hasOwnProperty(prop)) {
        //        if (this['_' + prop] !== undefined) {
        //            this['_' + prop] = options[prop];
        //        }
        //    }
        //}

        // Set the context for the attached canvas
        if (options.canvas) { this._canvas = options.canvas; }

        if (this._canvas) {
            // For Testing check to see if default is forced back to 2d
            if (this._renderType === '2d') {
                this._ctx = this._canvas.getContext('2d');
            } else {
            if ('WebGLRenderingContext' in window) {
                // Browser doesn't support webgl so only try for 2d context
                this._ctx = this._canvas.getContext('2d');
                this._renderType = '2d';
            } else {
                var testctx = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
                if (testctx !== undefined) {
                    // browser supports webgl, however can't be setup on this graphics combination
                    this._ctx = this._canvas.getContext('2d');
                    this._renderType = '2d';
                } else {
                    this._ctx = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
                }
            }
            }
            // Some sort of sanity check here because if we have a canvas without context we should abort
        }

        if (options.x) { this._x = options.x; }
        if (options.y) { this._y = options.y; }
        if (options.extraX) { this._extraX = options.extraX; }
        if (options.extraY) { this._extraY = options.extraY; }
        if (options.fontSize) { this._fontSize = options.fontSize; }
        if (options.fontFamily) { this._fontFamily = options.fontFamily; }
        if (options.fontColor) { this._fontColor = options.fontColor; }
        if (options.placeHolderColor) { this._placeHolderColor = options.placeHolderColor; }
        if (options.fontWeight) { this._fontWeight = options.fontWeight; }
        if (options.fontStyle) { this._fontStyle = options.fontStyle; }
        if (options.readonly) { this._readonly = options.readonly; }
        if (options.maxlength) { this._maxlength = options.maxlength; }
        if (options.width) { this._width = options.width; }
        if (options.height) { this._height = options.height; } // default set to height of font in orig and above
        if (options.padding) { if (options.padding >= 0) { this._padding = options.padding; } }
        if (options.borderWidth) { if (options.borderWidth >= 0) { this._borderWidth = options.borderWidth; } }
        if (options.borderColor) { this._borderColor = options.borderColor; }
        if (options.borderRadius) { if (options.borderRadius >= 0) { this._borderRadius = options.borderRadius; } }
        if (options.backgroundImage) { this._backgroundImage = options.backgroundImage; }
        if (options.boxShadow) { this._boxShadow = options.boxShadow; }
        if (options.innerShadow) { this._innerShadow = options.innerShadow; }
        if (options.selectionColor) { this._selectionColor = options.selectionColor; }
        if (options.placeHolder) { this._placeHolder = options.placeHolder; }
        if (options.value) { this._value = (options.value || this._placeHolder) + ''; }
        if (options.onsubmit) { this._onsubmit = options.onsubmit; } else { this._onsubmit = function() {}; }
        if (options.onkeydown) { this._onkeydown = options.onkeydown; } else { this._onkeydown = function() {}; }
        if (options.onkeyup) { this._onkeyup = options.onkeyup; } else { this._onkeyup = function() {}; }
        if (options.onfocus) { this._onfocus = options.onfocus; } else { this._onfocus = function() {}; }
        if (options.onblur) { this._onblur = options.onblur; } else { this._onblur = function() {}; }

        // parse box shadow
        this.boxShadow(this._boxShadow, true);

        // calculate the full width and height with padding, borders and shadows
        this._calcWH();

        // setup the off-DOM canvas
        this._renderCanvas = document.createElement('canvas');
        this._renderCanvas.setAttribute('width', this.outerW.toString());
        this._renderCanvas.setAttribute('height', this.outerH.toString());
        if (this._renderType === '2d') {
            this._renderCtx = this._renderCanvas.getContext('2d');
        } else {
            this._renderCtx = this._renderCanvas.getContext('webgl') || this._renderCanvas.getContext('experimental-webgl');
        }

        // setup another off-DOM canvas for inner-shadows
        this._shadowCanvas = document.createElement('canvas');
        this._shadowCanvas.setAttribute('width', (this._width + this._padding * 2).toString());
        this._shadowCanvas.setAttribute('height', (this._height + this._padding * 2).toString());
        if (this._renderType === '2d') {
            this._shadowCtx = this._shadowCanvas.getContext('2d');
        } else {
            this._shadowCtx = this._shadowCanvas.getContext('webgl') || this._shadowCanvas.getContext('experimental-webgl');
        }

        // setup the background color or gradient
        if (typeof options.backgroundGradient !== 'undefined') {
            this._backgroundColor = this._renderCtx.createLinearGradient(
                    0,
                    0,
                    0,
                    this.outerH
                    );
            this._backgroundColor.addColorStop(0, options.backgroundGradient[0]);

            this._backgroundColor.addColorStop(1, options.backgroundGradient[1]);
        } else {
            this._backgroundColor = options.backgroundColor || '#fff';
        }

        // setup main canvas events
        if (this._canvas) {
            var _this = this;
            this._canvas.addEventListener('mousemove', function(ev: MouseEvent) {
                var e = ev || window.event;
                _this.mousemove(e, _this);
            }, false);

            this._canvas.addEventListener('mousedown', function(ev: MouseEvent) {
                var e = ev || window.event;
                _this.mousedown(e, _this);
            }, false);

            this._canvas.addEventListener('mouseup', function(ev: MouseEvent) {
                var e = ev || window.event;
                _this.mouseup(e, _this);
            }, false);
        }

        // setup a global mouseup to blur the input outside of the canvas
        var _this = this;
        window.addEventListener('mouseup', function(ev: MouseEvent) {
            var e = ev || window.event;
            if (_this._hasFocus && !_this._mouseDown) {
                _this.blur();
            }
        }, true);

        // create the hidden input element
        this._hiddenInput = document.createElement('input');
        this._hiddenInput.type = 'text';
        this._hiddenInput.style.position = 'absolute';
        this._hiddenInput.style.opacity = '0';
        this._hiddenInput.style.pointerEvents = 'none';
        this._hiddenInput.style.left = (this._x + this._extraX + (this._canvas ? this._canvas.offsetLeft : 0)) + 'px';
        this._hiddenInput.style.top = (this._y + this._extraY + (this._canvas ? this._canvas.offsetTop : 0)) + 'px';
        this._hiddenInput.style.width = this._width + 'px';
        this._hiddenInput.style.height = this._height + 'px';
        this._hiddenInput.style.zIndex = '0';
        if (this._maxlength) {
            this._hiddenInput.maxLength = this._maxlength;
        }
        document.body.appendChild(this._hiddenInput);
        this._hiddenInput.value = this._value;

        // setup the keydown listener
        var _this = this;
        this._hiddenInput.addEventListener('keydown', function(ev: KeyboardEvent) {
            var e = ev || window.event;
            if (_this._hasFocus) {
                _this.keydown(e, _this);
            }
        });

        // setup the keyup listener
        this._hiddenInput.addEventListener('keyup', function(ev: KeyboardEvent) {
            var e = ev || window.event;
            // update the canvas input state information from the hidden input
            _this._value = _this._hiddenInput.value;
            _this._cursorPos = _this._hiddenInput.selectionStart;
            _this.render();

            if (_this._hasFocus) {
                _this._onkeyup(e, _this);
            }
        });

        // add this to the buffer
        CanvasInput.inputs.push(this);
        CanvasInput._inputsIndex = CanvasInput.inputs.length - 1;

        // draw the text box
        this.render();
}

// Setters and Getters for properties that can be changed after the fact
// Wrote these depending on ECMAScript 5 so tsc needs --target ES5
// public get name():string { return this._name; }
// public set name(value: string) { this._name = value; }

// Canvas get or set
public get canvas():any { return this._canvas; }
public set canvas(value: any) {
    if (typeof value !== undefined) {
        this._canvas = value;

        // Recheck here in case the new canvas is switched between 2d and webgl
        if ('WebGLRenderingContext' in window) {
           // Browser doesn't support webgl so only try for 2d context
           this._ctx = this._canvas.getContext('2d');
           this._renderType = '2d';
        } else {
           var testctx = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
           if (testctx !== undefined) {
             // browser supports webgl, however can't be setup on this graphics combination with this canvas
             this._ctx = this._canvas.getContext('2d');
             this._renderType = '2d';
           } else {
             this._ctx = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
           }
        }
        // Most like the offscreen canvas and shadow canvas if set prior can remain unchanged.
        this.render();
    } else {
        // setting shouldn't return a value this might break current usage which should use
        // the getter to retrieve canvas all of the elses in the setters below will
        // be removed just to get rid of clutter.  This remains just to remind of the potential
        // breakage.
        // return this._canvas;
    }
}

// X and Y location on Canvas
public get x():number { return this._x; }
public set x(value: number) {
    if (typeof value !== 'undefined') {
        this._x = value;
        this.render();
    }
}

public get y():number { return this._y; }
public set y(value: number) {
    if (typeof value !== 'undefined') {
        this._y = value;
        this.render();
    }
}

// extraX and extraY location on Canvas
public get extraX():number { return this._extraX; }
public set extraX(value: number) {
    if (typeof value !== 'undefined') {
        this._extraX = value;
        this.render();
    }
}

public get extraY():number { return this._extraY; }
public set extraY(value: number) {
    if (typeof value !== 'undefined') {
        this._extraY = value;
        this.render();
    }
}

// font setters and getters
// TODO: Potentially constrain font size to limits of field height etc to maintain sanity
public get fontSize():number { return this._fontSize; }
public set fontSize(value: number) {
    if (typeof value !== 'undefined') {
        this._fontSize = value;
        this.render();
    }
}

public get fontFamily():string { return this._fontFamily; }
public set fontFamily(value: string) {
    if (typeof value !== 'undefined') {
        this._fontFamily = value;
        this.render();
    }
}

public get fontColor():string { return this._fontColor; }
public set fontColor(value: string) {
    if (typeof value !== 'undefined') {
        this._fontColor = value;
        this.render();
    }
}

public get placeHolderColor():string { return this._placeHolderColor; }
public set placeHolderColor(value: string) {
    if (typeof value !== 'undefined') {
        this._placeHolderColor = value;
        this.render();
    }
}

public get fontWeight():string { return this._fontWeight; }
public set fontWeight(value: string) {
    if (typeof value !== 'undefined') {
        this._fontWeight = value;
        this.render();
    }
}

public get fontStyle():string { return this._fontStyle; }
public set fontStyle(value: string) {
    if (typeof value !== 'undefined') {
        this._fontStyle = value;
        this.render();
    }
}

// size setters and getters
public get width():number { return this._width; }
public set width(value: number) {
    if (typeof value !== 'undefined') {
        this._width = value;
        this._calcWH();
        this._updateCanvasWH();
        this.render();
    }
}


public get height():number { return this._height; }
public set height(value: number) {
    if (typeof value !== 'undefined') {
        this._height = value;
        this._calcWH();
        this._updateCanvasWH();
        this.render();
    }
}

public get padding():number { return this._padding; }
public set padding(value: number) {
    if (typeof value !== 'undefined') {
        this._padding = value;
        this._calcWH();
        this._updateCanvasWH();
        this.render();
    }
}

public get borderWidth():number { return this._borderWidth; }
public set borderWidth(value: number) {
    if (typeof value !== 'undefined') {
        this._borderWidth = value;
        this._calcWH();
        this._updateCanvasWH();
        this.render();
    }
}

public get borderColor():string { return this._borderColor; }
public set borderColor(value: string) {
    if (typeof value !== 'undefined') {
        this._borderColor = value;
        this.render();
    }
}

public get borderRadius():number { return this._borderRadius; }
public set borderRadius(value: number) {
    if (typeof value !== 'undefined') {
        this._borderRadius = value;
        this.render();
    }
}

public get backgroundColor():string { return this._backgroundColor; }
public set backgroundColor(value: string) {
    if (typeof value !== 'undefined') {
        this._backgroundColor = value;
        this.render();
    }
}

public get backgroundGradient():any { return this._backgroundColor; }
public set backgroundGradient(value: any) {
      if (typeof value !== 'undefined') {
        this._backgroundColor = this._renderCtx.createLinearGradient(
          0,
          0,
          0,
          this.outerH
        );
        this._backgroundColor.addColorStop(0, value[0]);
        this._backgroundColor.addColorStop(1, value[1]);

        this.render();
      }
}

// internal boxShadow setup parse only creating private setter no get/set for now
// mainly because the return on the set is required during constructor
// TODO: Potentially create seperate internal function for construction and standard get/set
private boxShadow(data: string, doReturn: boolean): any {
    if (typeof data !== 'undefined') {
        // parse box shadow
        var boxShadow = data.split('px ');
        this._boxShadowObj = {
            x: this._boxShadow === 'none' ? 0 : parseInt(boxShadow[0], 10),
            y: this._boxShadow === 'none' ? 0 : parseInt(boxShadow[1], 10),
            blur: this._boxShadow === 'none' ? 0 : parseInt(boxShadow[2], 10),
            color: this._boxShadow === 'none' ? '' : boxShadow[3]
        };

        // take into account the shadow and its direction
        if (this._boxShadowObj.x < 0) {
            this.shadowL = Math.abs(this._boxShadowObj.x) + this._boxShadowObj.blur;
            this.shadowR = this._boxShadowObj.blur + this._boxShadowObj.x;
        } else {
            this.shadowL = Math.abs(this._boxShadowObj.blur - this._boxShadowObj.x);
            this.shadowR = this._boxShadowObj.blur + this._boxShadowObj.x;
        }
        if (this._boxShadowObj.y < 0) {
            this.shadowT = Math.abs(this._boxShadowObj.y) + this._boxShadowObj.blur;
            this.shadowB = this._boxShadowObj.blur + this._boxShadowObj.y;
        } else {
            this.shadowT = Math.abs(this._boxShadowObj.blur - this._boxShadowObj.y);
            this.shadowB = this._boxShadowObj.blur + this._boxShadowObj.y;
        }

        this.shadowW = this.shadowL + this.shadowR;
        this.shadowH = this.shadowT + this.shadowB;

        this._calcWH();

        if (!doReturn) {
            this._updateCanvasWH();

            return this.render();
        }
    } else {
        return this._boxShadow;
    }
}

public get innerShadow():string { return this._innerShadow; }
public set innerShadow(value: string) {
    if (typeof value !== 'undefined') {
        this._innerShadow = value;
        this.render();
    }
}

public get selectionColor():string { return this._selectionColor; }
public set selectionColor(value: string) {
    if (typeof value !== 'undefined') {
        this._selectionColor = value;
        this.render();
    }
}

public get placeHolder():string { return this._placeHolder; }
public set placeHolder(value: string) {
    if (typeof value !== 'undefined') {
        this._placeHolder = value;
        this.render();
    }
}

public get value():string { return (this._value === this._placeHolder) ? '' : this._value; }
public set value(data: string) {
    if (typeof data !== 'undefined') {
        this._value = data + '';
        this._hiddenInput.value = data + '';
        this._cursorPos = this._clipText().length;
        this.render();
    }
}

public get onsubmit():any { return this._onsubmit; }
public set onsubmit(fn: any) {
    if (typeof fn !== 'undefined') {
        this._onsubmit = fn;
    }
}

public get onkeydown():any { return this._onkeydown; }
public set onkeydown(fn: any) {
    if (typeof fn !== 'undefined') {
        this._onkeydown = fn;
    }
}

public get onkeyup():any { return this._onkeyup; }
public set onkeyup(fn: any) {
    if (typeof fn !== 'undefined') {
        this._onkeyup = fn;
    }
}

public focus = function(pos?: number):any {

      // only fire the focus event when going from unfocussed
      if (!this._hasFocus) {
        this._onfocus(this);

        // remove focus from all other inputs
        for (var i = 0; i < CanvasInput.inputs.length; i++) {
          if (CanvasInput.inputs[i]._hasFocus) {
            CanvasInput.inputs[i].blur();
          }
        }
      }

      // remove selection
      if (!this._selectionUpdated) {
        this._selection = [0, 0];
      } else {
        delete this._selectionUpdated;
      }

      // if this is readonly, don't allow it to get focus
      this._hasFocus = true;
      if (this._readonly) {
        this._hiddenInput.readOnly = true;
        return;
      } else {
        this._hiddenInput.readOnly = false;
      }

      // update the cursor position
      this._cursorPos = (typeof pos === 'number') ? pos : this._clipText().length;

      // clear the place holder
      if (this._placeHolder === this._value) {
        this._value = '';
        this._hiddenInput.value = '';
      }

      this._cursor = true;

      // setup cursor interval
      if (this._cursorInterval) {
        clearInterval(this._cursorInterval);
      }
      var _this = this;
      this._cursorInterval = setInterval(function() {
        _this._cursor = !_this._cursor;
        _this.render();
      }, 500);

      // move the real focus to the hidden input
      var hasSelection = (this._selection[0] > 0 || this._selection[1] > 0);
      this._hiddenInput.focus();
      this._hiddenInput.selectionStart = hasSelection ? this._selection[0] : this._cursorPos;
      this._hiddenInput.selectionEnd = hasSelection ? this._selection[1] : this._cursorPos;

      return this.render();
}

public blur = function(cinput?:any) {
      var _this = cinput || this;

      _this._onblur(_this);

      if (_this._cursorInterval) {
        clearInterval(_this._cursorInterval);
      }
      _this._hasFocus = false;
      _this._cursor = false;
      _this._selection = [0, 0];
      _this._hiddenInput.blur();

      // fill the place holder
      if (_this._value === '') {
        _this._value = _this._placeHolder;
      }

      return this.render();
}

private keydown = function(e: any, _this: any):any {
      var keyCode = e.which,
        isShift = e.shiftKey,
        key = null,
        startText, endText;

      // make sure the correct text field is being updated
      if (this._readonly || !this._hasFocus) {
        return;
      }

      // fire custom user event
      this._onkeydown(e, this);

      // add support for Ctrl/Cmd+A selection
      if (keyCode === 65 && (e.ctrlKey || e.metaKey)) {
        this.selectText();
        e.preventDefault();
        return this.render();
      }

      // block keys that shouldn't be processed
      if (keyCode === 17 || e.metaKey || e.ctrlKey) {
        return this;
      }

      if (keyCode === 13) { // enter key
        e.preventDefault();
        this._onsubmit(e, this);
      } else if (keyCode === 9) { // tab key
        e.preventDefault();
        if (CanvasInput.inputs.length > 1) {
          var next = (CanvasInput.inputs[this._inputsIndex + 1]) ? this._inputsIndex + 1 : 0;
          this.blur();
          setTimeout(function() {
            CanvasInput.inputs[next].focus();
          }, 10);
        }
      }

      // update the canvas input state information from the hidden input
      this._value = this._hiddenInput.value;
      this._cursorPos = this._hiddenInput.selectionStart;
      this._selection = [0, 0];

      return this.render();
}

private click = function(e: any, _this: any):any {
      var mouse = _this._mousePos(e),
        x = mouse.x,
        y = mouse.y;

      if (_this._endSelection) {
        delete _this._endSelection;
        delete _this._selectionUpdated;
        return;
      }

      if (_this._canvas && _this._overInput(x, y) || !_this._canvas) {
        if (_this._mouseDown) {
          _this._mouseDown = false;
          _this.click(e, _this);
          return _this.focus(_this._clickPos(x, y));
        }
      } else {
        return _this.blur();
      }
}

private mousemove = function(e: any, _this):any {
      var mouse = _this._mousePos(e),
        x = mouse.x,
        y = mouse.y,
        isOver = _this._overInput(x, y);

      if (isOver && _this._canvas) {
        _this._canvas.style.cursor = 'text';
        _this._wasOver = true;
      } else if (_this._wasOver && _this._canvas) {
        _this._canvas.style.cursor = 'default';
        _this._wasOver = false;
      }

      if (_this._hasFocus && _this._selectionStart >= 0) {
        var curPos = _this._clickPos(x, y),
          start = Math.min(_this._selectionStart, curPos),
          end = Math.max(_this._selectionStart, curPos);

        if (!isOver) {
          _this._selectionUpdated = true;
          _this._endSelection = true;
          delete _this._selectionStart;
          _this.render();
          return;
        }

        if (_this._selection[0] !== start || _this._selection[1] !== end) {
          _this._selection = [start, end];
          _this.render();
        }
      }
}

private mousedown = function(e: any, _this: any) {
      var mouse = _this._mousePos(e),
        x = mouse.x,
        y = mouse.y,
        isOver = _this._overInput(x, y);

      // setup the 'click' event
      _this._mouseDown = isOver;

      // start the selection drag if inside the input
      if (_this._hasFocus && isOver) {
        _this._selectionStart = _this._clickPos(x, y);
      }
}

private mouseup = function(e: any, _this: any) {
      var mouse = _this._mousePos(e),
        x = mouse.x,
        y = mouse.y;

      // update selection if a drag has happened
      var isSelection = _this._clickPos(x, y) !== _this._selectionStart;
      if (_this._hasFocus && _this._selectionStart >= 0 && _this._overInput(x, y) && isSelection) {
        _this._selectionUpdated = true;
        delete _this._selectionStart;
        _this.render();
      } else {
        delete _this._selectionStart;
      }
      _this.click(e, _this);
}

private selectText = function(range?: number[]):any {
      var _range = range || [0, this._value.length];

      // select the range of text specified (or all if none specified)
      setTimeout(function() {
        this._selection = [_range[0], _range[1]];
        this._hiddenInput.selectionStart = _range[0];
        this._hiddenInput.selectionEnd = _range[1];
        this.render();
      }, 1);

      return this;
}

public get renderCanvas():HTMLCanvasElement {
    return this._renderCanvas;
}

public destroy = function() {
      // pull from the inputs array
      var index = CanvasInput.inputs.indexOf(this);
      if (index) {
        CanvasInput.inputs.splice(index, 1);
      }

      // remove focus
      if (this._hasFocus) {
        this.blur();
      }

      // remove the hidden input box
      document.body.removeChild(this._hiddenInput);

      // remove off-DOM canvas
      this._renderCanvas = null;
      this._shadowCanvas = null;
      this._renderCtx = null;
}

private _textWidth = function(text: string): number {
      var ctx = this._renderCtx;

      ctx.font = this._fontStyle + ' ' + this._fontWeight + ' ' + this._fontSize + 'px ' + this._fontFamily;
      ctx.textAlign = 'left';

      return ctx.measureText(text).width;
}



private _clipText = function(value?: string): string {
      value = (typeof value === 'undefined') ? this._value : value;

      var textWidth = this._textWidth(value),
        fillPer = textWidth / (this._width - this._padding),
        text = fillPer > 1 ? value.substr(-1 * Math.floor(value.length / fillPer)) : value;

      return text + '';
}

private _overInput = function(x: number, y: number): boolean {
        var xLeft = x >= this._x + this._extraX,
        xRight = x <= this._x + this._extraX + this._width + this._padding * 2,
        yTop = y >= this._y + this._extraY,
        yBottom = y <= this._y + this._extraY + this._height + this._padding * 2;

      return xLeft && xRight && yTop && yBottom;
}

 private _clickPos = function(x: number, y: number): number {
      var value = this._value;

      // don't count placeholder text in this
      if (this._value === this._placeHolder) {
        value = '';
      }

      // determine where the click was made along the string
      var text = this._clipText(value),
        totalW = 0,
        pos = text.length;

      if (x - (this._x + this._extraX) < this._textWidth(text)) {
        // loop through each character to identify the position
        for (var i=0; i<text.length; i++) {
          totalW += this._textWidth(text[i]);
          if (totalW >= x - (this._x + this._extraX)) {
            pos = i;
            break;
          }
        }
      }

      return pos;
 }


private _drawTextBox = function(fn: any) {
        var ctx = this._renderCtx,
        w = this.outerW,
        h = this.outerH,
        br = this._borderRadius,
        bw = this._borderWidth,
        sw = this.shadowW,
        sh = this.shadowH;

      // only draw the background shape if no image is being used
      if (this._backgroundImage === '') {
        ctx.fillStyle = this._backgroundColor;
        this._roundedRect(ctx, bw + this.shadowL, bw + this.shadowT, w - bw * 2 - sw, h - bw * 2 - sh, br);
        ctx.fill();

        fn();
      } else {
        var img = new Image();
        img.src = this._backgroundImage;
        img.onload = function() {
          ctx.drawImage(img, 0, 0, img.width, img.height, bw + this.shadowL, bw + this.shadowT, w, h);

          fn();
        };
      }
}

private _roundedRect = function(ctx, x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;

      ctx.beginPath();

      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);

      ctx.closePath();
}

private _clearSelection = function(): boolean {

      if (this._selection[1] > 0) {
        // clear the selected contents
        var start = this._selection[0],
          end = this._selection[1];

        this._value = this._value.substr(0, start) + this._value.substr(end);
        this._cursorPos = start;
        this._cursorPos = (this._cursorPos < 0) ? 0 : this._cursorPos;
        this._selection = [0, 0];

        return true;
      }

      return false;
}


private _mousePos(e: any):any {
      var elm = e.target,
        style = document.defaultView.getComputedStyle(elm, undefined),
        paddingLeft = parseInt(style['paddingLeft'], 10) || 0,
        paddingTop = parseInt(style['paddingLeft'], 10) || 0,
        borderLeft = parseInt(style['borderLeftWidth'], 10) || 0,
        borderTop = parseInt(style['borderLeftWidth'], 10) || 0,
        offsetX = 0,
        offsetY = 0,
        htmlTop = 0,
        htmlLeft = 0,
        x, y;

        // TODO: This needs to be retested but the original
        // document.body.parentNode.offsetTop throws errors
        var htmlrec = document.body.getBoundingClientRect();
        htmlTop = htmlrec.top || 0;
        htmlLeft = htmlrec.left || 0;

        // calculate the total offset
      if (typeof elm.offsetParent !== 'undefined') {
        do {
          offsetX += elm.offsetLeft;
          offsetY += elm.offsetTop;
        } while ((elm = elm.offsetParent));
      }

      // take into account borders and padding
      offsetX += paddingLeft + borderLeft + htmlLeft;
      offsetY += paddingTop + borderTop + htmlTop;

      return {
        x: e.pageX - offsetX,
        y: e.pageY - offsetY
      };
}

private _calcWH = function () {
    // calculate the full width and height with padding, borders and shadows
    this.outerW = this._width + this._padding * 2 + this._borderWidth * 2 + this.shadowW;
    this.outerH = this._height + this._padding * 2 + this._borderWidth * 2 + this.shadowH;
};

private _updateCanvasWH = function() {
    var oldW = this._renderCanvas.width;
    var oldH = this._renderCanvas.height;

    // update off-DOM canvas
    this._renderCanvas.setAttribute('width', <string> this.outerW);
    this._renderCanvas.setAttribute('height', <string> this.outerH);
    this._shadowCanvas.setAttribute('width', <string> this._width + this._padding * 2);
    this._shadowCanvas.setAttribute('height', <string> this._height + this._padding * 2);

    // clear the main canvas
    if (this._ctx) {
        if (this._renderType === '2d') {
            this._ctx.clearRect(this._x, this._y, oldW, oldH);
        } else {
            // Possibly create a webgl clearRect here
        }
    }
};

public render = function(): any {
    var ctx = this._renderCtx,
    w = this.outerW,
    h = this.outerH,
    br = this._borderRadius,
    bw = this._borderWidth,
    sw = this.shadowW,
    sh = this.shadowH;

    if (!ctx) {
        return;
    }

    // clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // setup the box shadow
    ctx.shadowOffsetX = this._boxShadow.x;
    ctx.shadowOffsetY = this._boxShadow.y;
    ctx.shadowBlur = this._boxShadow.blur;
    ctx.shadowColor = this._boxShadow.color;

    // draw the border
    if (this._borderWidth > 0) {
        ctx.fillStyle = this._borderColor;
        this._roundedRect(ctx, this.shadowL, this.shadowT, w - sw, h - sh, br);
        ctx.fill();

        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
    }

    // draw the text box background
    var _this = this;
    this._drawTextBox(function() {
        // make sure all shadows are reset
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        // clip the text so that it fits within the box
        var text = _this._clipText();

        // draw the selection
        var paddingBorder = _this._padding + _this._borderWidth + _this.shadowT;
        if (_this._selection[1] > 0) {
            var selectOffset = _this._textWidth(text.substring(0, _this._selection[0])),
            selectWidth = _this._textWidth(text.substring(_this._selection[0], _this._selection[1]));

            ctx.fillStyle = _this._selectionColor;
            ctx.fillRect(paddingBorder + selectOffset, paddingBorder, selectWidth, _this._height);
        }

        // draw the cursor
        if (_this._cursor) {
            var cursorOffset = _this._textWidth(text.substring(0, _this._cursorPos));
            ctx.fillStyle = _this._fontColor;
            ctx.fillRect(paddingBorder + cursorOffset, paddingBorder, 1, _this._height);
        }

        // draw the text
        var textX = _this._padding + _this._borderWidth + _this.shadowL,
        textY = Math.round(paddingBorder + _this._height / 2);

        // only remove the placeholder text if they have typed something
        text = (text === '' && _this._placeHolder) ? _this._placeHolder : text;

        ctx.fillStyle = (_this._value !== '' && _this._value !== _this._placeHolder) ? _this._fontColor : _this._placeHolderColor;
        ctx.font = _this._fontStyle + ' ' + _this._fontWeight + ' ' + _this._fontSize + 'px ' + _this._fontFamily;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, textX, textY);

        // parse inner shadow
        var innerShadow = _this._innerShadow.split('px '),
        isOffsetX = _this._innerShadow === 'none' ? 0 : parseInt(innerShadow[0], 10),
        isOffsetY = _this._innerShadow === 'none' ? 0 : parseInt(innerShadow[1], 10),
        isBlur = _this._innerShadow === 'none' ? 0 : parseInt(innerShadow[2], 10),
        isColor = _this._innerShadow === 'none' ? '' : innerShadow[3];

        // draw the inner-shadow (damn you canvas, this should be easier than this...)
        if (isBlur > 0) {
            var shadowCtx = _this._shadowCtx,
            scw = shadowCtx.canvas.width,
            sch = shadowCtx.canvas.height;

            shadowCtx.clearRect(0, 0, scw, sch);
            shadowCtx.shadowBlur = isBlur;
            shadowCtx.shadowColor = isColor;

            // top shadow
            shadowCtx.shadowOffsetX = 0;
            shadowCtx.shadowOffsetY = isOffsetY;
            shadowCtx.fillRect(-1 * w, -100, 3 * w, 100);

            // right shadow
            shadowCtx.shadowOffsetX = isOffsetX;
            shadowCtx.shadowOffsetY = 0;
            shadowCtx.fillRect(scw, -1 * h, 100, 3 * h);

            // bottom shadow
            shadowCtx.shadowOffsetX = 0;
            shadowCtx.shadowOffsetY = isOffsetY;
            shadowCtx.fillRect(-1 * w, sch, 3 * w, 100);

            // left shadow
            shadowCtx.shadowOffsetX = isOffsetX;
            shadowCtx.shadowOffsetY = 0;
            shadowCtx.fillRect(-100, -1 * h, 100, 3 * h);

            // create a clipping mask on the main canvas
            _this._roundedRect(ctx, bw + _this.shadowL, bw + _this.shadowT, w - bw * 2 - sw, h - bw * 2 - sh, br);
            ctx.clip();

            // draw the inner-shadow from the off-DOM canvas
            ctx.drawImage(_this._shadowCanvas, 0, 0, scw, sch, bw + _this.shadowL, bw + _this.shadowT, scw, sch);
        }

        // draw to the visible canvas
        if (_this._ctx) {
            _this._ctx.clearRect(_this._x, _this._y, ctx.canvas.width, ctx.canvas.height);
            _this._ctx.drawImage(_this._renderCanvas, _this._x, _this._y);
        }

        return _this;
    });
};
}
