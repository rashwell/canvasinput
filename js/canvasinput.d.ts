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
declare class CanvasInput {
    static inputs: CanvasInput[];
    static _inputsIndex: number;
    _canvas: HTMLCanvasElement;
    _renderCanvas: HTMLCanvasElement;
    _shadowCanvas: HTMLCanvasElement;
    _hiddenInput: HTMLInputElement;
    _ctx: any;
    _renderCtx: any;
    _shadowCtx: any;
    _x: number;
    _y: number;
    _extraX: number;
    _extraY: number;
    _fontSize: number;
    _fontFamily: string;
    _fontColor: string;
    _placeHolderColor: string;
    _fontWeight: string;
    _fontStyle: string;
    _readonly: boolean;
    _maxlength: any;
    _width: number;
    _height: number;
    _padding: number;
    _borderWidth: number;
    _borderColor: string;
    _borderRadius: number;
    _backgroundImage: string;
    _backgroundColor: any;
    _boxShadow: string;
    _boxShadowObj: any;
    _innerShadow: string;
    _selectionColor: string;
    _placeHolder: string;
    _value: string;
    _onsubmit: any;
    _onkeydown: any;
    _onkeyup: any;
    _onfocus: any;
    _onblur: any;
    _cursor: boolean;
    _cursorPos: number;
    _hasFocus: boolean;
    _selection: number[];
    _wasOver: boolean;
    _mouseDown: boolean;
    _renderType: string;
    shadowL: number;
    shadowR: number;
    shadowT: number;
    shadowB: number;
    shadowH: number;
    shadowW: number;
    outerW: number;
    outerH: number;
    constructor(options?: any);
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
    canvas: any;
    x: number;
    y: number;
    extraX: number;
    extraY: number;
    fontSize: number;
    fontFamily: string;
    fontColor: string;
    placeHolderColor: string;
    fontWeight: string;
    fontStyle: string;
    width: number;
    height: number;
    padding: number;
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
    backgroundColor: string;
    backgroundGradient: any;
    /**
     * Internal boxShadow setup parse only creating private setter no get/set for now
     * mainly because the return on the set is required during constructor
     * @method boxShadow
     * @param {string} data
     * @param {boolean} doReturn
     * @inner
     * @todo Potentially create seperate internal function for construction and standard get/set
     */
    private boxShadow(data, doReturn);
    innerShadow: string;
    selectionColor: string;
    placeHolder: string;
    value: string;
    onsubmit: any;
    onkeydown: any;
    onkeyup: any;
    focus: (pos?: number) => any;
    blur: (cinput?: any) => any;
    private keydown;
    private click;
    private mousemove;
    private mousedown;
    private mouseup;
    private selectText;
    renderCanvas: HTMLCanvasElement;
    destroy: () => void;
    private _textWidth;
    private _clipText;
    private _overInput;
    private _clickPos;
    private _drawTextBox;
    private _roundedRect;
    private _clearSelection;
    private _mousePos(e);
    private _calcWH;
    private _updateCanvasWH;
    render: () => any;
}
