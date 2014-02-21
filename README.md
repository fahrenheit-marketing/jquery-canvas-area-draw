jQuery ImageMap Area Canvas Editor
======================

jQuery plugin to create imagemap area polygon coordinates. 
Extends a text input to display an image with a canvas
on which points may be added to create a polygon.

Activates inputs with class `canvas-area` and data attribute
`data-image-url`. Or activate with `$('input').canvasAreaDraw(options)`

Demo at [http://iakob.com/canvas-area-draw/demo.html]

### Examples

Include the javascript file in your page after jQuery and add class and data parameters to your inputs or textareas:

`<textarea class="canvas-area" data-image-url="http://example.com/image.png"></textarea>`

Or using Javascript, include the script after jQuery and activate it on any selection of text inputs or textarea elements. If you are applying it to multiple elements, you may wish to still use the `data-image-url` to set a different image for each input. If you include the `imgUrl` property in the options object, the same image will be applied to all elements in the selection.

```
<input type="text" id="polygon">

<script>
(function(jQuery) {
  $('#polygon').canvasAreaDraw({
    imageUrl: "http://example.com/image.png"
  });
})(jQuery);
</script>
```

_You may want to use a document load or ready event to make sure your elements are already added to the DOM before you invoke the plugin._




