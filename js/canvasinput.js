/**
 * @fileOverview canvasinput compiled from typescript
 * @author {@link mailto:rashwell@gmail.com|Richard F. Ashwell III}
 * @version 1.0.0
 * @see The original inspiration for this project {@link http://goldfirestudios.com/blog/108/CanvasInput-HTML5-Canvas-Text-Input|CanvusInput HTML5 Canvas Text Input}
 * @license MIT
 * @example
 * var input = new CanvasInput({
 *      canvas: document.getElementById('canvasid'),
 *      onsubmit: function() { alert(this.value); }
 *      });
 */
/**
 *  Class for the CanvasInput object
 *  @class CanvasInput
 */
var CanvasInput = (function () {
    function CanvasInput(options) {
        this._canvas = null;
        this._renderCanvas = null;
        this._shadowCanvas = null;
        this._ctx = null;
        this._renderCtx = null;
        this._shadowCtx = null;
        this._x = 0;
        this._y = 0;
        this._extraX = 0;
        this._extraY = 0;
        this._fontSize = 14;
        this._fontFamily = 'Arial';
        this._fontColor = '#000';
        this._placeHolderColor = '#bfbebd';
        this._fontWeight = 'normal';
        this._fontStyle = 'normal';
        this._readonly = false;
        this._maxlength = null;
        this._width = 150;
        this._height = 14;
        this._padding = 5;
        this._borderWidth = 1;
        this._borderColor = '#959595';
        this._borderRadius = 3;
        this._backgroundImage = '';
        this._boxShadow = '1px 1px 0px rgba(255, 255, 255, 1)';
        this._boxShadowObj = null;
        this._innerShadow = '0px 0px 4px rgba(0, 0, 0, 0.4)';
        this._selectionColor = 'rgba(179, 212, 253, 0.8)';
        this._placeHolder = '';
        this._value = '';
        this._cursor = false;
        this._cursorPos = 0;
        this._hasFocus = false;
        this._selection = [0, 0];
        this._wasOver = false;
        this._mouseDown = false;
        this._renderType = '2d';
        this.shadowL = 0;
        this.shadowR = 0;
        this.shadowT = 0;
        this.shadowB = 0;
        this.shadowH = 0;
        this.shadowW = 0;
        this.outerW = 0;
        this.outerH = 0;
        this.focus = function (pos) {
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
            }
            else {
                delete this._selectionUpdated;
            }
            // if this is readonly, don't allow it to get focus
            this._hasFocus = true;
            if (this._readonly) {
                this._hiddenInput.readOnly = true;
                return;
            }
            else {
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
            this._cursorInterval = setInterval(function () {
                _this._cursor = !_this._cursor;
                _this.render();
            }, 500);
            // move the real focus to the hidden input
            var hasSelection = (this._selection[0] > 0 || this._selection[1] > 0);
            this._hiddenInput.focus();
            this._hiddenInput.selectionStart = hasSelection ? this._selection[0] : this._cursorPos;
            this._hiddenInput.selectionEnd = hasSelection ? this._selection[1] : this._cursorPos;
            return this.render();
        };
        this.blur = function (cinput) {
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
        };
        this.keydown = function (e, _this) {
            var keyCode = e.which, isShift = e.shiftKey, key = null, startText, endText;
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
            if (keyCode === 13) {
                e.preventDefault();
                this._onsubmit(e, this);
            }
            else if (keyCode === 9) {
                e.preventDefault();
                if (CanvasInput.inputs.length > 1) {
                    var next = (CanvasInput.inputs[this._inputsIndex + 1]) ? this._inputsIndex + 1 : 0;
                    this.blur();
                    setTimeout(function () {
                        CanvasInput.inputs[next].focus();
                    }, 10);
                }
            }
            // update the canvas input state information from the hidden input
            this._value = this._hiddenInput.value;
            this._cursorPos = this._hiddenInput.selectionStart;
            this._selection = [0, 0];
            return this.render();
        };
        this.click = function (e, _this) {
            var mouse = _this._mousePos(e), x = mouse.x, y = mouse.y;
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
            }
            else {
                return _this.blur();
            }
        };
        this.mousemove = function (e, _this) {
            var mouse = _this._mousePos(e), x = mouse.x, y = mouse.y, isOver = _this._overInput(x, y);
            if (isOver && _this._canvas) {
                _this._canvas.style.cursor = 'text';
                _this._wasOver = true;
            }
            else if (_this._wasOver && _this._canvas) {
                _this._canvas.style.cursor = 'default';
                _this._wasOver = false;
            }
            if (_this._hasFocus && _this._selectionStart >= 0) {
                var curPos = _this._clickPos(x, y), start = Math.min(_this._selectionStart, curPos), end = Math.max(_this._selectionStart, curPos);
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
        };
        this.mousedown = function (e, _this) {
            var mouse = _this._mousePos(e), x = mouse.x, y = mouse.y, isOver = _this._overInput(x, y);
            // setup the 'click' event
            _this._mouseDown = isOver;
            // start the selection drag if inside the input
            if (_this._hasFocus && isOver) {
                _this._selectionStart = _this._clickPos(x, y);
            }
        };
        this.mouseup = function (e, _this) {
            var mouse = _this._mousePos(e), x = mouse.x, y = mouse.y;
            // update selection if a drag has happened
            var isSelection = _this._clickPos(x, y) !== _this._selectionStart;
            if (_this._hasFocus && _this._selectionStart >= 0 && _this._overInput(x, y) && isSelection) {
                _this._selectionUpdated = true;
                delete _this._selectionStart;
                _this.render();
            }
            else {
                delete _this._selectionStart;
            }
            _this.click(e, _this);
        };
        this.selectText = function (range) {
            var _range = range || [0, this._value.length];
            // select the range of text specified (or all if none specified)
            setTimeout(function () {
                this._selection = [_range[0], _range[1]];
                this._hiddenInput.selectionStart = _range[0];
                this._hiddenInput.selectionEnd = _range[1];
                this.render();
            }, 1);
            return this;
        };
        this.destroy = function () {
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
        };
        this._textWidth = function (text) {
            var ctx = this._renderCtx;
            ctx.font = this._fontStyle + ' ' + this._fontWeight + ' ' + this._fontSize + 'px ' + this._fontFamily;
            ctx.textAlign = 'left';
            return ctx.measureText(text).width;
        };
        this._clipText = function (value) {
            value = (typeof value === 'undefined') ? this._value : value;
            var textWidth = this._textWidth(value), fillPer = textWidth / (this._width - this._padding), text = fillPer > 1 ? value.substr(-1 * Math.floor(value.length / fillPer)) : value;
            return text + '';
        };
        this._overInput = function (x, y) {
            var xLeft = x >= this._x + this._extraX, xRight = x <= this._x + this._extraX + this._width + this._padding * 2, yTop = y >= this._y + this._extraY, yBottom = y <= this._y + this._extraY + this._height + this._padding * 2;
            return xLeft && xRight && yTop && yBottom;
        };
        this._clickPos = function (x, y) {
            var value = this._value;
            // don't count placeholder text in this
            if (this._value === this._placeHolder) {
                value = '';
            }
            // determine where the click was made along the string
            var text = this._clipText(value), totalW = 0, pos = text.length;
            if (x - (this._x + this._extraX) < this._textWidth(text)) {
                // loop through each character to identify the position
                for (var i = 0; i < text.length; i++) {
                    totalW += this._textWidth(text[i]);
                    if (totalW >= x - (this._x + this._extraX)) {
                        pos = i;
                        break;
                    }
                }
            }
            return pos;
        };
        this._drawTextBox = function (fn) {
            var ctx = this._renderCtx, w = this.outerW, h = this.outerH, br = this._borderRadius, bw = this._borderWidth, sw = this.shadowW, sh = this.shadowH;
            // only draw the background shape if no image is being used
            if (this._backgroundImage === '') {
                ctx.fillStyle = this._backgroundColor;
                this._roundedRect(ctx, bw + this.shadowL, bw + this.shadowT, w - bw * 2 - sw, h - bw * 2 - sh, br);
                ctx.fill();
                fn();
            }
            else {
                var img = new Image();
                img.src = this._backgroundImage;
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, img.width, img.height, bw + this.shadowL, bw + this.shadowT, w, h);
                    fn();
                };
            }
        };
        this._roundedRect = function (ctx, x, y, w, h, r) {
            if (w < 2 * r)
                r = w / 2;
            if (h < 2 * r)
                r = h / 2;
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
        };
        this._clearSelection = function () {
            if (this._selection[1] > 0) {
                // clear the selected contents
                var start = this._selection[0], end = this._selection[1];
                this._value = this._value.substr(0, start) + this._value.substr(end);
                this._cursorPos = start;
                this._cursorPos = (this._cursorPos < 0) ? 0 : this._cursorPos;
                this._selection = [0, 0];
                return true;
            }
            return false;
        };
        this._calcWH = function () {
            // calculate the full width and height with padding, borders and shadows
            this.outerW = this._width + this._padding * 2 + this._borderWidth * 2 + this.shadowW;
            this.outerH = this._height + this._padding * 2 + this._borderWidth * 2 + this.shadowH;
        };
        this._updateCanvasWH = function () {
            var oldW = this._renderCanvas.width;
            var oldH = this._renderCanvas.height;
            // update off-DOM canvas
            this._renderCanvas.setAttribute('width', this.outerW);
            this._renderCanvas.setAttribute('height', this.outerH);
            this._shadowCanvas.setAttribute('width', this._width + this._padding * 2);
            this._shadowCanvas.setAttribute('height', this._height + this._padding * 2);
            // clear the main canvas
            if (this._ctx) {
                if (this._renderType === '2d') {
                    this._ctx.clearRect(this._x, this._y, oldW, oldH);
                }
                else {
                }
            }
        };
        this.render = function () {
            var ctx = this._renderCtx, w = this.outerW, h = this.outerH, br = this._borderRadius, bw = this._borderWidth, sw = this.shadowW, sh = this.shadowH;
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
            this._drawTextBox(function () {
                // make sure all shadows are reset
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;
                // clip the text so that it fits within the box
                var text = _this._clipText();
                // draw the selection
                var paddingBorder = _this._padding + _this._borderWidth + _this.shadowT;
                if (_this._selection[1] > 0) {
                    var selectOffset = _this._textWidth(text.substring(0, _this._selection[0])), selectWidth = _this._textWidth(text.substring(_this._selection[0], _this._selection[1]));
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
                var textX = _this._padding + _this._borderWidth + _this.shadowL, textY = Math.round(paddingBorder + _this._height / 2);
                // only remove the placeholder text if they have typed something
                text = (text === '' && _this._placeHolder) ? _this._placeHolder : text;
                ctx.fillStyle = (_this._value !== '' && _this._value !== _this._placeHolder) ? _this._fontColor : _this._placeHolderColor;
                ctx.font = _this._fontStyle + ' ' + _this._fontWeight + ' ' + _this._fontSize + 'px ' + _this._fontFamily;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, textX, textY);
                // parse inner shadow
                var innerShadow = _this._innerShadow.split('px '), isOffsetX = _this._innerShadow === 'none' ? 0 : parseInt(innerShadow[0], 10), isOffsetY = _this._innerShadow === 'none' ? 0 : parseInt(innerShadow[1], 10), isBlur = _this._innerShadow === 'none' ? 0 : parseInt(innerShadow[2], 10), isColor = _this._innerShadow === 'none' ? '' : innerShadow[3];
                // draw the inner-shadow (damn you canvas, this should be easier than this...)
                if (isBlur > 0) {
                    var shadowCtx = _this._shadowCtx, scw = shadowCtx.canvas.width, sch = shadowCtx.canvas.height;
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
        // Set the context for the attached canvas
        if (options.canvas) {
            this._canvas = options.canvas;
        }
        if (this._canvas) {
            // For Testing check to see if default is forced back to 2d
            if (this._renderType === '2d') {
                this._ctx = this._canvas.getContext('2d');
            }
            else {
                if ('WebGLRenderingContext' in window) {
                    // Browser doesn't support webgl so only try for 2d context
                    this._ctx = this._canvas.getContext('2d');
                    this._renderType = '2d';
                }
                else {
                    var testctx = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
                    if (testctx !== undefined) {
                        // browser supports webgl, however can't be setup on this graphics combination
                        this._ctx = this._canvas.getContext('2d');
                        this._renderType = '2d';
                    }
                    else {
                        this._ctx = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
                    }
                }
            }
        }
        if (options.x) {
            this._x = options.x;
        }
        if (options.y) {
            this._y = options.y;
        }
        if (options.extraX) {
            this._extraX = options.extraX;
        }
        if (options.extraY) {
            this._extraY = options.extraY;
        }
        if (options.fontSize) {
            this._fontSize = options.fontSize;
        }
        if (options.fontFamily) {
            this._fontFamily = options.fontFamily;
        }
        if (options.fontColor) {
            this._fontColor = options.fontColor;
        }
        if (options.placeHolderColor) {
            this._placeHolderColor = options.placeHolderColor;
        }
        if (options.fontWeight) {
            this._fontWeight = options.fontWeight;
        }
        if (options.fontStyle) {
            this._fontStyle = options.fontStyle;
        }
        if (options.readonly) {
            this._readonly = options.readonly;
        }
        if (options.maxlength) {
            this._maxlength = options.maxlength;
        }
        if (options.width) {
            this._width = options.width;
        }
        if (options.height) {
            this._height = options.height;
        } // default set to height of font in orig and above
        if (options.padding) {
            if (options.padding >= 0) {
                this._padding = options.padding;
            }
        }
        if (options.borderWidth) {
            if (options.borderWidth >= 0) {
                this._borderWidth = options.borderWidth;
            }
        }
        if (options.borderColor) {
            this._borderColor = options.borderColor;
        }
        if (options.borderRadius) {
            if (options.borderRadius >= 0) {
                this._borderRadius = options.borderRadius;
            }
        }
        if (options.backgroundImage) {
            this._backgroundImage = options.backgroundImage;
        }
        if (options.boxShadow) {
            this._boxShadow = options.boxShadow;
        }
        if (options.innerShadow) {
            this._innerShadow = options.innerShadow;
        }
        if (options.selectionColor) {
            this._selectionColor = options.selectionColor;
        }
        if (options.placeHolder) {
            this._placeHolder = options.placeHolder;
        }
        if (options.value) {
            this._value = (options.value || this._placeHolder) + '';
        }
        if (options.onsubmit) {
            this._onsubmit = options.onsubmit;
        }
        else {
            this._onsubmit = function () { };
        }
        if (options.onkeydown) {
            this._onkeydown = options.onkeydown;
        }
        else {
            this._onkeydown = function () { };
        }
        if (options.onkeyup) {
            this._onkeyup = options.onkeyup;
        }
        else {
            this._onkeyup = function () { };
        }
        if (options.onfocus) {
            this._onfocus = options.onfocus;
        }
        else {
            this._onfocus = function () { };
        }
        if (options.onblur) {
            this._onblur = options.onblur;
        }
        else {
            this._onblur = function () { };
        }
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
        }
        else {
            this._renderCtx = this._renderCanvas.getContext('webgl') || this._renderCanvas.getContext('experimental-webgl');
        }
        // setup another off-DOM canvas for inner-shadows
        this._shadowCanvas = document.createElement('canvas');
        this._shadowCanvas.setAttribute('width', (this._width + this._padding * 2).toString());
        this._shadowCanvas.setAttribute('height', (this._height + this._padding * 2).toString());
        if (this._renderType === '2d') {
            this._shadowCtx = this._shadowCanvas.getContext('2d');
        }
        else {
            this._shadowCtx = this._shadowCanvas.getContext('webgl') || this._shadowCanvas.getContext('experimental-webgl');
        }
        // setup the background color or gradient
        if (typeof options.backgroundGradient !== 'undefined') {
            this._backgroundColor = this._renderCtx.createLinearGradient(0, 0, 0, this.outerH);
            this._backgroundColor.addColorStop(0, options.backgroundGradient[0]);
            this._backgroundColor.addColorStop(1, options.backgroundGradient[1]);
        }
        else {
            this._backgroundColor = options.backgroundColor || '#fff';
        }
        // setup main canvas events
        if (this._canvas) {
            var _this = this;
            this._canvas.addEventListener('mousemove', function (ev) {
                var e = ev || window.event;
                _this.mousemove(e, _this);
            }, false);
            this._canvas.addEventListener('mousedown', function (ev) {
                var e = ev || window.event;
                _this.mousedown(e, _this);
            }, false);
            this._canvas.addEventListener('mouseup', function (ev) {
                var e = ev || window.event;
                _this.mouseup(e, _this);
            }, false);
        }
        // setup a global mouseup to blur the input outside of the canvas
        var _this = this;
        window.addEventListener('mouseup', function (ev) {
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
        this._hiddenInput.addEventListener('keydown', function (ev) {
            var e = ev || window.event;
            if (_this._hasFocus) {
                _this.keydown(e, _this);
            }
        });
        // setup the keyup listener
        this._hiddenInput.addEventListener('keyup', function (ev) {
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
    Object.defineProperty(CanvasInput.prototype, "canvas", {
        // Setters and Getters for properties that can be changed after the fact
        // Wrote these depending on ECMAScript 5 so tsc needs --target ES5
        // public get name():string { return this._name; }
        // public set name(value: string) { this._name = value; }
        /**
         * Canvas getter.
         * @method canvas
         * @return Returns the current canvas that the CanvasInput object is rendering too.
         */
        /**
         * Canvas setter.
         * @method canvas
         * @param canvas object
         */
        get: function () { return this._canvas; },
        set: function (value) {
            if (typeof value !== undefined) {
                this._canvas = value;
                // Recheck here in case the new canvas is switched between 2d and webgl
                if ('WebGLRenderingContext' in window) {
                    // Browser doesn't support webgl so only try for 2d context
                    this._ctx = this._canvas.getContext('2d');
                    this._renderType = '2d';
                }
                else {
                    var testctx = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
                    if (testctx !== undefined) {
                        // browser supports webgl, however can't be setup on this graphics combination with this canvas
                        this._ctx = this._canvas.getContext('2d');
                        this._renderType = '2d';
                    }
                    else {
                        this._ctx = this._canvas.getContext('webgl') || this._canvas.getContext('experimental-webgl');
                    }
                }
                // Most like the offscreen canvas and shadow canvas if set prior can remain unchanged.
                this.render();
            }
            else {
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "x", {
        // X and Y location on Canvas
        get: function () { return this._x; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._x = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "y", {
        get: function () { return this._y; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._y = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "extraX", {
        // extraX and extraY location on Canvas
        get: function () { return this._extraX; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._extraX = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "extraY", {
        get: function () { return this._extraY; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._extraY = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "fontSize", {
        // font setters and getters
        // TODO: Potentially constrain font size to limits of field height etc to maintain sanity
        get: function () { return this._fontSize; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._fontSize = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "fontFamily", {
        get: function () { return this._fontFamily; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._fontFamily = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "fontColor", {
        get: function () { return this._fontColor; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._fontColor = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "placeHolderColor", {
        get: function () { return this._placeHolderColor; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._placeHolderColor = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "fontWeight", {
        get: function () { return this._fontWeight; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._fontWeight = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "fontStyle", {
        get: function () { return this._fontStyle; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._fontStyle = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "width", {
        // size setters and getters
        get: function () { return this._width; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._width = value;
                this._calcWH();
                this._updateCanvasWH();
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "height", {
        get: function () { return this._height; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._height = value;
                this._calcWH();
                this._updateCanvasWH();
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "padding", {
        get: function () { return this._padding; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._padding = value;
                this._calcWH();
                this._updateCanvasWH();
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "borderWidth", {
        get: function () { return this._borderWidth; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._borderWidth = value;
                this._calcWH();
                this._updateCanvasWH();
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "borderColor", {
        get: function () { return this._borderColor; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._borderColor = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "borderRadius", {
        get: function () { return this._borderRadius; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._borderRadius = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "backgroundColor", {
        get: function () { return this._backgroundColor; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._backgroundColor = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "backgroundGradient", {
        get: function () { return this._backgroundColor; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._backgroundColor = this._renderCtx.createLinearGradient(0, 0, 0, this.outerH);
                this._backgroundColor.addColorStop(0, value[0]);
                this._backgroundColor.addColorStop(1, value[1]);
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Internal boxShadow setup parse only creating private setter no get/set for now
     * mainly because the return on the set is required during constructor
     * @method boxShadow
     * @param {string} data
     * @param {boolean} doReturn
     * @inner
     * @todo Potentially create seperate internal function for construction and standard get/set
     */
    CanvasInput.prototype.boxShadow = function (data, doReturn) {
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
            }
            else {
                this.shadowL = Math.abs(this._boxShadowObj.blur - this._boxShadowObj.x);
                this.shadowR = this._boxShadowObj.blur + this._boxShadowObj.x;
            }
            if (this._boxShadowObj.y < 0) {
                this.shadowT = Math.abs(this._boxShadowObj.y) + this._boxShadowObj.blur;
                this.shadowB = this._boxShadowObj.blur + this._boxShadowObj.y;
            }
            else {
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
        }
        else {
            return this._boxShadow;
        }
    };
    Object.defineProperty(CanvasInput.prototype, "innerShadow", {
        get: function () { return this._innerShadow; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._innerShadow = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "selectionColor", {
        get: function () { return this._selectionColor; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._selectionColor = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "placeHolder", {
        get: function () { return this._placeHolder; },
        set: function (value) {
            if (typeof value !== 'undefined') {
                this._placeHolder = value;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "value", {
        get: function () { return (this._value === this._placeHolder) ? '' : this._value; },
        set: function (data) {
            if (typeof data !== 'undefined') {
                this._value = data + '';
                this._hiddenInput.value = data + '';
                this._cursorPos = this._clipText().length;
                this.render();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "onsubmit", {
        get: function () { return this._onsubmit; },
        set: function (fn) {
            if (typeof fn !== 'undefined') {
                this._onsubmit = fn;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "onkeydown", {
        get: function () { return this._onkeydown; },
        set: function (fn) {
            if (typeof fn !== 'undefined') {
                this._onkeydown = fn;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "onkeyup", {
        get: function () { return this._onkeyup; },
        set: function (fn) {
            if (typeof fn !== 'undefined') {
                this._onkeyup = fn;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasInput.prototype, "renderCanvas", {
        get: function () {
            return this._renderCanvas;
        },
        enumerable: true,
        configurable: true
    });
    CanvasInput.prototype._mousePos = function (e) {
        var elm = e.target, style = document.defaultView.getComputedStyle(elm, undefined), paddingLeft = parseInt(style['paddingLeft'], 10) || 0, paddingTop = parseInt(style['paddingLeft'], 10) || 0, borderLeft = parseInt(style['borderLeftWidth'], 10) || 0, borderTop = parseInt(style['borderLeftWidth'], 10) || 0, offsetX = 0, offsetY = 0, htmlTop = 0, htmlLeft = 0, x, y;
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
    };
    CanvasInput.inputs = [];
    CanvasInput._inputsIndex = 0;
    return CanvasInput;
})();
//# sourceMappingURL=canvasinput.js.map