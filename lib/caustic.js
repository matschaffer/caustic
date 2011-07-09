
/*!
 * caustic
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

// TODO: compile sub-views such as User etc based on the given
// html, as there's no need to keep traversing each time.

/**
 * Convert callback `fn` to a function when a string is given.
 *
 * @param {Function} fn
 * @return {Function}
 * @api private
 */

function callback(fn) {
  return 'string' == typeof fn
    ? function(obj){ return obj[fn](); }
    : fn;
}

/**
 * Convert callback `fn` to a function when a string is given
 * invoking the method on `obj`.
 *
 * @param {Function} fn
 * @param {Object} obj
 * @return {Function}
 * @api private
 */

function callbackFor(fn, obj) {
  return 'string' == typeof fn
    ? function(){ return obj[fn](); }
    : fn;
}

/**
 * Camel-case the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function camelcase(str) {
  return str.split(/[-\[\]]/).map(function(str, i){
    return i && str[0]
      ? str[0].toUpperCase() + str.slice(1)
      : str;
  }).join('');
}

/**
 * Initialize a new view with the given `name`
 * or string of html. When a `name` is given an element
 * with the id `name + "-template"` will be used.
 *
 * Examples:
 *
 *    var user = new View('user');
 *    var list = new View('<ul class="list"><li></li></ul>');
 *
 * @param {String} name
 * @api public
 */

View = function View(name) {
  if (!(this instanceof View)) return new View(name);
  EventEmitter.call(this);
  var html;
  if (~name.indexOf('<')) html = name;
  else html = $('#' + name + '-template').html(); 
  this.el = $(html);
  this.visit(this.el);
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

View.prototype.__proto__ = EventEmitter.prototype;

/**
 * Visit `el`.
 *
 * @param {jQuery} el
 * @param {Boolean} ignore
 * @api private
 */

View.prototype.visit = function(el, ignore){
  var self = this
    , type = el.get(0).nodeName
    , classes = el.attr('class').split(/ +/)
    , method = 'visit' + type
    , name = camelcase(classes[0]);

  if (this[method] && !ignore) this[method](el, name);

  el.children().each(function(i, el){
    self.visit($(el));
  });
};

/**
 * Visit TABLE.
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitTABLE = function(el, name){
  this[name] = el;

  this[name].add = function(val){
    this.append(val.el || val);
  };
};

/**
 * Visit INPUT tag.
 *
 * @param {jQuery} el
 * @api public
 */

View.prototype.visitINPUT = function(el, name){
  var self = this
    , type = el.attr('type')
    , name = el.attr('name')
      ? camelcase(el.attr('name'))
      : name;

  switch (type) {
    case 'text':
    case 'password':
      this[name] = function(val){
        if (0 == arguments.length) return el.val();
        el.val(val);
        return this;
      };

      this[name].placeholder = function(val){
        el.attr('placeholder', val);
        return this;
      };

      this[name].isEmpty = function(){
        return '' == $.trim(el.val());
      };

      this[name].clear = function(){
        el.val('');
        return self;
      };
      break;
    case 'checkbox':
      this[name] = function(val){
        if (0 == arguments.length) return el.attr('checked');
        switch (typeof val) {
          case 'function':
            el.change(function(e){
              val.call(self, el.attr('checked'), e);
            });
            break;
          default:
            el.attr('checked', val
              ? 'checked'
              : val);
        }
        return this;
      }
      break;
    case 'submit':
      this.visitA(el, name);
  }
};

/**
 * Visit CANVAS.
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitCANVAS = function(el, name){
  this[name] = el.get(0);
};

/**
 * Visit FORM.
 *
 *   - adds `.submit([fn])` to listen for a submission
 *   - adds `.name.values()` to return an array of form values
 *   - adds `.name.values.toString()` to return a x-www-form-urlencoded string
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitFORM = function(el, name){
  var self = this
    , name = name || 'form';

  this[name] = el;

  this[name].values = function(){
    return el.serializeArray();
  };
  this[name].values.toString = function(){
    return el.serialize();
  };

  this.submit = function(val){
    switch (typeof val) {
      case 'function':
        el.submit(function(e){
          val.call(self, e, el);
          return false;
        });
        break;
      default:
        el.submit();
    }
  }
};

/**
 * Visit IMG tag.
 *
 *  - adds `.name([src])` to manipulate the source 
 *  - adds `.name(fn)` to listen for a click 
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitIMG = function(el, name){
  var self = this;

  this[name] = function(val){
    if (0 == arguments.length) return el.attr('src');
    switch (typeof val) {
      case 'function':
        el.click(function(e){
          val.call(self, e, el);
        });
        break;
      default:
        el.attr('src', val);
    }
    return this;
  };
};

/**
 * Visit A tag.
 *
 *  - adds `.name([fn])` to listen or trigger the click event
 *  - emits "name" when triggered
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitA = function(el, name){
  var self = this;

  el.click(function(e){
    self.emit(name, e, el);
  });

  this[name] = function(fn){
    fn = callbackFor(fn, this);
    el.click(function(e){
      fn.call(self, e, el);
      return false;
    });
    return this;
  }
};

/**
 * Visit P, TD, SPAN, or DIV tag.
 *
 *   - adds `.name([val])` to get or set the contents
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitP =
View.prototype.visitTD =
View.prototype.visitSPAN =
View.prototype.visitDIV = function(el, name){
  var self = this;

  this[name] = function(val){
    if (0 == arguments.length) return el;
    el.empty().append(val.el || val);
    return this;
  };

  this[name].text = function(val){
    return el.text(val);
  };
};

/**
 * Visit UL tag.
 *
 *  - adds `.name` to access the element
 *  - adds `.name.add(val)` to append elements (or views)
 *  - adds `.name.items`, an array of the elements as `View`s
 *  - adds `.name.each(fn)` for iteration `fn(view, i)`.
 *  - adds `.name.map(fn)` for mapping values `fn(view, i)`.
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitOL =
View.prototype.visitUL = function(el, name){
  var self = this;
  this.children = [];

  this[name] = el;

  // TODO: move these out

  /**
   * Add `val` to this list.
   *
   * @param {String|jQuery|View} val
   * @return {View} for chaining
   * @api public
   */

  el.add = function(val){
    var li = $('<li>');
    self.children.push(val);
    el.append(li.append(val.el || val));
    return this;
  };

  /**
   * Array of items as `View` objects.
   *
   * @api public
   */

  el.items = this.children;

  /**
   * Iterate the list `View`s, calling `fn(item, i)`.
   *
   * @param {Function} fn
   * @return {View} for chaining
   * @api public
   */

  el.each = function(fn){
    for (var i = 0, len = self.children.length; i < len; ++i) {
      fn(self.children[i], i);
    }
    return this;
  };

  /**
   * Map the list `View`s, calling `fn(item, i)`.
   *
   * @param {String|function} fn
   * @return {Array}
   * @api public
   */

  el.map = function(fn){
    var ret = []
      , fn = callback(fn);

    for (var i = 0, len = self.children.length; i < len; ++i) {
      ret.push(fn(self.children[i], i));
    }

    return ret;
  };
};

/**
 * Visit H1-H5 tags.
 *
 *   - adds `.name([val])` to get / set text
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitH1 =
View.prototype.visitH2 =
View.prototype.visitH3 =
View.prototype.visitH4 =
View.prototype.visitH5 = function(el, name){
  var self = this;
  this[name] = function(val){
    if (0 == arguments.length) return el.text();
    el.text(val.el || val);
    return this;
  };
};

/**
 * Remove the view from the DOM.
 *
 * @return {View}
 * @api public
 */

View.prototype.remove = function(){
  var parent = this.el.parent()
    , type = parent.get(0).nodeName;
  if ('LI' == type) parent.remove();
  else this.el.remove();
  return this;
};

/**
 * Add this view to the given `list`.
 *
 * @param {View} list
 * @return {View}
 * @api public
 */

View.prototype.addTo = function(list){
  if (!list.add) throw new Error('.addTo() requires a list');
  list.add(this);
  return this;
};

/**
 * Replace the children of `val` with this view's element.
 *
 * TODO: rename me
 *
 * @param {String|jQuery|View} val
 * @return {View} for chaining
 * @api public
 */

View.prototype.replace = function(val){
  $(val.el || val).children().replaceWith(this.el);
  return this;
};

/**
 * Hide the element.
 *
 * @return {View} for chaining
 * @api public
 */

View.prototype.hide = function(){
  this.el.hide();
  return this;
};

/**
 * Hide the element.
 *
 * @return {View} for chaining
 * @api public
 */

View.prototype.show = function(){
  this.el.show();
  return this;
};

/**
 * Center the element relative to `other`, or the window.
 *
 * @param {jQuery} other
 * @return {View} for chaining
 * @api public
 */

View.prototype.center = function(other){
  var self = this
    , el = this.el
    , other = other || window;

  if (!this._resize) {
    $(other).resize(function(){
      self.center();
    });
    this._resize = true;
  }

  el.css({
      top: (other.innerHeight / 2) - el.height() / 2
    , left: (other.innerWidth / 2) - el.width() / 2
  });

  return this;
};

/**
 * Prepend this view's element to `val`.
 *
 * @param {String|jQuery|View} val
 * @return {View} for chaining
 * @api public
 */

View.prototype.prependTo = function(val){
  this.el.prependTo(val.el || val);
  return this;
};

/**
 * Append this view's element to `val`.
 *
 * @param {String|jQuery|View} val
 * @return {View} for chaining
 * @api public
 */

View.prototype.appendTo = function(val){
  this.el.appendTo(val.el || val);
  return this;
};
