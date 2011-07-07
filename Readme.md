
# Caustic

  Caustic is a highly experimental JavaScript reflection-based template engine for web applications.

## About

 Caustic generates a `View` simply by providing it html, no other intervention is required. It does this by "reflecting" on the node types, classes, and other attributes in order to build a meaningful and helpful object for interacting with it. This inference is powerful and dramatically reduces boilerplate template logic.

## Example

 An extremely simple example would be building a list of pets. Instead of creating a template with Mustache, EJS, or similar, we simply add some html to our file as script tag, or simply pass a string of html.

```html
<script type="text/template" id="pet-template">
  <div class="pet">
    <h2 class="name"></h2>
    <p class="description"></p>
  </div>
</script>
```

We may then want to add several pets to the following unordered list:

```html
<ul id="pets"></ul>
```

To do this, we simply invoke `View` (with or without `new`) to create our "pet" views. By passing a non-html string (does not contain "<"), Caustic will grab the html from the element with the id `name + "-template"`, so "pet-template". Caustic then provides us with many methods associated to the html provided, in this case simply some methods that allow us to set the text (or html) of the h2 and description paragraph, then appending each to the "#pets" list.

```js
View('pet')
  .name('Tobi')
  .description('A small beige ferret.')
  .appendTo('#pets');

View('pet')
  .name('Jane')
  .description('A small dark bitchy ferret.')
  .appendTo('#pets');
```

Another example of this is a confirmation dialog, with the following logic-less html:

```html
<script type="text/template" id="confirm-template">
  <div class="confirmation dialog">
    <h2 class="title"></h2>
    <a href="#" class="close">Close</a>
    <p class="description"></p>
    <p class="buttons">
      <a href="#" class="cancel">Cancel</a>
      <a href="#" class="ok">Delete</a>
    </p>
  </div>
</script>
```

with the tiny follow snippet we can bring our dialog to life. By doing absolutely _nothing_ but invoking `View()`. Much like before we have auto-generated `.title()` and `.description()` methods to get or set values, as well as three methods bound to clicks on their associated elements. Caustic concludes from the fact that we have an "a" tag, and that we typically bind to the click event as a common behaviour, so Caustic makes this even easier for us. Likewise we could simply invoke `.close()` or `.cancel()` to invoke the callbacks programmatically.

```js
View('confirm')
  .title('Delete this item?')
  .description('Click "cancel" to abort, "delete" otherwise.')
  .close(function(){ this.remove(); })
  .cancel(function(){ this.remove(); })
  .ok(function(){ alert('item removed'); this.remove(); })
  .appendTo('body');
```

## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.