
/*!
 * caustic
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

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

function View(name) {
  if (!(this instanceof View)) return new View(name);
  EventEmitter.call(this);
  var html;
  if (~name.indexOf('<')) html = name;
  else html = $('#' + name + '-template').html(); 
  this.el = $(html);
  this.visit(this.el, true);
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

View.prototype.__proto__ = EventEmitter.prototype;

/**
 * Visit `el`.
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visit = function(el, root){
  var self = this
    , type = el.get(0).nodeName
    , classes = el.attr('class').split(/ +/)
    , method = 'visit' + type;

  if (this[method] && !root) this[method](el, classes[0]);

  el.children().each(function(i, el){
    self.visit($(el));
  });
};

/**
 * Visit A tag.
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
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitP =
View.prototype.visitTD =
View.prototype.visitSPAN =
View.prototype.visitDIV = function(el, name){
  var self = this;
  this[name] = function(val){
    if (0 == arguments.length) return el.children();
    el.empty().append(val.el || val);
    return this;
  }
};

/**
 * Visit UL tag.
 *
 * @param {jQuery} el
 * @api private
 */

View.prototype.visitUL = function(el, name){
  var self = this;
  this.children = [];

  this[name] = {
    // TODO: move these out

    /**
     * Add `val` to this list.
     *
     * @param {String|jQuery|View} val
     * @return {View} for chaining
     * @api public
     */

    add: function(val){
      var li = $('<li>');
      self.children.push(val);
      el.append(li.append(val.el || val));
      return this;
    },

    /**
     * Return the list item `View`s as an array.
     *
     * @return {Array} 
     * @api public
     */

    items: function(){
      return self.children;
    },

    /**
     * Return the list length.
     *
     * @return {Number}
     * @api public
     */

    length: function(){
      return this.items().length;
    },

    /**
     * Iterate the list `View`s, calling `fn(item, i)`.
     *
     * @param {Function} fn
     * @return {View} for chaining
     * @api public
     */

    each: function(fn){
      for (var i = 0, len = self.children.length; i < len; ++i) {
        fn(self.children[i], i);
      }
      return this;
    },

    /**
     * Map the list `View`s, calling `fn(item, i)`.
     *
     * @param {String|function} fn
     * @return {Array}
     * @api public
     */

    map: function(fn){
      var ret = []
        , name = fn;

      if ('string' == typeof fn) {
        fn = function(obj){ return obj[name](); };
      };

      for (var i = 0, len = self.children.length; i < len; ++i) {
        ret.push(fn(self.children[i], i));
      }

      return ret;
    }
  };
};

/**
 * Visit H1-H5 tags.
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
 * Append this view's element to `val`.
 *
 * @param {String|jQuery} val
 * @return {View}
 * @api public
 */

View.prototype.appendTo = function(val){
  this.el.appendTo(val.el || val);
  return this;
};

