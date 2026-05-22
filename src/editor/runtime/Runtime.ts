(function() {
  "use strict";

  var runtime = b3e.runtime = b3e.runtime || {};

  runtime.buttons = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
  };

  runtime.keys = {
    BACKSPACE: 8,
    TAB: 9,
    RETURN: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    ESC: 27,
    SPACE: 32,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90
  };

  runtime.clip = function(value, min, max) {
    return Math.max(Math.min(value, max), min);
  };

  runtime.merge = function(target) {
    target = target || {};

    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (!source) continue;

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  function StateTracker() {
    this._state = {};
    this._lastState = {};
  }

  var state = StateTracker.prototype;

  state._has = function(code, source) {
    return !!source[code];
  };

  state._set = function(code, value) {
    if (typeof code === "undefined" || code === null) return;

    if (value) {
      this._state[code] = true;
    } else {
      delete this._state[code];
    }
  };

  state.clear = function() {
    this._state = {};
  };

  state.postUpdate = function() {
    var next = {};
    for (var code in this._state) {
      if (Object.prototype.hasOwnProperty.call(this._state, code)) {
        next[code] = true;
      }
    }
    this._lastState = next;
  };

  state.isDown = function(code) {
    return this._has(code, this._state);
  };

  state.isUp = function(code) {
    return !this.isDown(code);
  };

  state.isPressed = function(code) {
    return this._has(code, this._state) && !this._has(code, this._lastState);
  };

  state.isReleased = function(code) {
    return !this._has(code, this._state) && this._has(code, this._lastState);
  };

  state.isAnyDown = function() {
    return Object.keys(this._state).length > 0;
  };

  state.isAnyPressed = function() {
    for (var code in this._state) {
      if (Object.prototype.hasOwnProperty.call(this._state, code) && !this._has(code, this._lastState)) {
        return true;
      }
    }
    return false;
  };

  state.isAnyReleased = function() {
    for (var code in this._lastState) {
      if (Object.prototype.hasOwnProperty.call(this._lastState, code) && !this._has(code, this._state)) {
        return true;
      }
    }
    return false;
  };

  function KeyboardState(game) {
    StateTracker.call(this);
    createjs.EventDispatcher.initialize(this);

    this.game = game;

    var self = this;
    game.canvas.addEventListener("blur", function() {
      self.clear();
    }, false);
    game.canvas.addEventListener("keydown", function(event) {
      self._onKeyDown(event);
    }, false);
    game.canvas.addEventListener("keyup", function(event) {
      self._onKeyUp(event);
    }, false);
  }

  KeyboardState.prototype = Object.create(StateTracker.prototype);
  KeyboardState.prototype.constructor = KeyboardState;

  KeyboardState.prototype._makeEvent = function(name, nativeEvent) {
    var event = new createjs.Event(name);
    event.code = nativeEvent.keyCode;
    event.shift = nativeEvent.shiftKey;
    event.ctrl = nativeEvent.ctrlKey;
    event.meta = nativeEvent.metaKey;
    event.alt = nativeEvent.altKey;
    event.nativeEvent = nativeEvent;
    return event;
  };

  KeyboardState.prototype._onKeyDown = function(event) {
    var code = event.keyCode;
    var name = this.isDown(code) ? "keyhold" : "keydown";
    this._set(code, true);
    this.dispatchEvent(this._makeEvent(name, event));
  };

  KeyboardState.prototype._onKeyUp = function(event) {
    this._set(event.keyCode, false);
    this.dispatchEvent(this._makeEvent("keyup", event));
  };

  function MouseState(game) {
    StateTracker.call(this);
    createjs.EventDispatcher.initialize(this);

    this.game = game;
    this.x = 0;
    this.y = 0;

    var self = this;
    game.canvas.addEventListener("blur", function() {
      self.clear();
    }, false);
    game.canvas.addEventListener("mousedown", function(event) {
      self._onMouseDown(event);
    }, false);
    game.canvas.addEventListener("mouseup", function(event) {
      self._onMouseUp(event);
    }, false);
    game.canvas.addEventListener("click", function(event) {
      self._dispatchMouseEvent("click", event);
    }, false);
    game.canvas.addEventListener("dblclick", function(event) {
      self._dispatchMouseEvent("dblclick", event);
    }, false);
    game.canvas.addEventListener("mousemove", function(event) {
      self._dispatchMouseEvent("mousemove", event);
    }, false);
    game.canvas.addEventListener("mouseout", function(event) {
      self._dispatchMouseEvent("mouseout", event);
    }, false);
    game.canvas.addEventListener("mouseover", function(event) {
      self._dispatchMouseEvent("mouseover", event);
    }, false);
    game.canvas.addEventListener("wheel", function(event) {
      self._onWheel(event);
    }, false);
  }

  MouseState.prototype = Object.create(StateTracker.prototype);
  MouseState.prototype.constructor = MouseState;

  MouseState.prototype.preUpdate = function() {
    this.x = this.game.stage.mouseX;
    this.y = this.game.stage.mouseY;
  };

  MouseState.prototype._makeEvent = function(name, nativeEvent) {
    var event = new createjs.Event(name);
    event.button = nativeEvent.button;
    event.x = this.x;
    event.y = this.y;
    event.nativeEvent = nativeEvent;
    return event;
  };

  MouseState.prototype._dispatchMouseEvent = function(name, nativeEvent) {
    this.dispatchEvent(this._makeEvent(name, nativeEvent));
    nativeEvent.preventDefault();
  };

  MouseState.prototype._onMouseDown = function(event) {
    this._set(event.button, true);
    this._dispatchMouseEvent("mousedown", event);
  };

  MouseState.prototype._onMouseUp = function(event) {
    this._set(event.button, false);
    this._dispatchMouseEvent("mouseup", event);
  };

  MouseState.prototype._onWheel = function(nativeEvent) {
    var event = new createjs.Event("wheel");
    event.deltaMode = nativeEvent.deltaMode;
    event.deltaX = nativeEvent.deltaX || nativeEvent.wheelDeltaX;
    event.deltaY = nativeEvent.deltaY || nativeEvent.wheelDeltaY;
    event.deltaZ = nativeEvent.deltaZ || nativeEvent.wheelDeltaZ;
    event.x = nativeEvent.x;
    event.y = nativeEvent.y;
    event.nativeEvent = nativeEvent;
    this.dispatchEvent(event);
    nativeEvent.preventDefault();
  };

  function TimeState() {
    createjs.EventDispatcher.initialize(this);
    this.delta = 0;
    this.fdelta = 0;
  }

  TimeState.prototype.update = function(event) {
    this.delta = event.delta;
    this.fdelta = event.delta / 1000;
    this.dispatchEvent(event);
  };

  function EditorRuntime(options) {
    options = runtime.merge({
      width: 800,
      height: 600,
      container: null,
      framerate: 60,
      backgroundColor: "#000",
      update: null
    }, options);

    this.config = options;
    this.canvas = document.createElement("canvas");
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    this.canvas.style.backgroundColor = options.backgroundColor;
    this.canvas.style.outline = "none";
    this.canvas.setAttribute("tabindex", "0");

    var self = this;
    this.canvas.addEventListener("mousedown", function() {
      self.canvas.focus();
    }, false);

    var container = document.getElementById(options.container) || document.body;
    container.appendChild(this.canvas);
    this.canvas.focus();

    this.stage = new createjs.Stage(this.canvas);
    this.stage.snapToPixelEnabled = true;

    if (createjs.Touch && createjs.Touch.enable) {
      createjs.Touch.enable(this.stage);
    }
    if (createjs.Sound && createjs.Sound.initializeDefaultPlugins) {
      createjs.Sound.initializeDefaultPlugins();
    }

    createjs.Ticker.framerate = options.framerate;

    this.time = new TimeState();
    this.keyboard = new KeyboardState(this);
    this.mouse = new MouseState(this);
    this.update = options.update;

    createjs.Ticker.on("tick", this._onTick, this);
  }

  EditorRuntime.prototype._onTick = function(event) {
    this.time.update(event);
    this.mouse.preUpdate();

    if (this.update) {
      this.update(this);
    }

    this.stage.update(event);
    this.keyboard.postUpdate();
    this.mouse.postUpdate();
  };

  runtime.EditorRuntime = EditorRuntime;
  runtime.createEditorRuntime = function(options) {
    return new EditorRuntime(options);
  };
})();
