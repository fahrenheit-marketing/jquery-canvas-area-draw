(function( $ ){

  var $input, methods, $modal, $canvas, ctx, $overlay, image, points, activePoint;

  $.fn.canvasAreaDraw = function(method) {

    if ( methods[method] ) {
      return methods[ method ].apply(this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' + method + ' does not exist on jQuery.canvasAreaDraw' );
    }

  };

  methods = {

    init: function(options) {
      if ( ! $('#canvasAreaDrawModal').length ) {
        // create modal
        $overlay = $('<div id="canvasAreaDrawOverlay"/>');
        $modal = $('<div id="canvasAreaDrawModal"/>');
        $close = $('<a id="canvasAreaDrawModalClose" href="#">X</a>');
        $canvas = $('<canvas>');
        $overlay.hide(); $modal.hide();
        $modal.append( $canvas, $close );
        image = new Image();
        $(image).load(methods.imageLoaded);

        $(document).ready( function() {
          $('body').append( $overlay, $modal );
        });

        $close.click(methods.hide);
        $canvas.bind('mousedown', methods.draw);
        $canvas.bind('contextmenu', methods.reset);
        $canvas.bind('mouseup', methods.stopDrag);

        $close.css({
          position: 'absolute',
          display: 'block',
          left: '100%',
          'margin-left': '-8px',
          top: '0',
          'margin-top': '-8px',
          padding: '4px',
          background: '#000',
          color: '#FFF',
          'border-radius': '50%',
          width: '15px',
          height: '15px',
          'font-size': '13px',
          'text-align': 'center',
          'text-decoration': 'none'
        });

        $overlay.css({
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)'
        });

        $modal.css({
          position: 'absolute',
          background: '#FFF',
          'border-radius': '10px',
          padding: '10px'
        });

      }

      this.focus(function() {
        methods.show.apply($(this), arguments);
      });
    },

    show: function(options) {
      $input = this;
      var settings = $.extend({
        imageUrl: $input.attr('data-image-url')
      }, options);

      if ($input.val().length > 0) {
        points = $input.val().split(',');
      } else points = [];

      if (!settings.imageUrl) {
        $.error('No image url provided for canvasAreaDrawModal.show.');
      }

      $(image).attr('src', settings.imageUrl);
      if (image.complete) {
        methods.imageLoaded.apply(image);
      }
    },

    imageLoaded: function() {

      $modal.show();
      $overlay.show();

      $canvas.attr('width', this.width)
        .attr('height', this.height);
      ctx = $canvas[0].getContext('2d');

      methods.draw();

      var top, left;
      top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
      left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;

      $modal.css({
        top: top + $(window).scrollTop(),
        left: left + $(window).scrollLeft(),
      });

    },

    hide: function() {
      $modal.hide();
      $overlay.hide();
    },

    reset: function(e) {
      ctx.drawImage(image,0,0);
      points = [];
      methods.record();
      return false;
    },

    record: function() {
      $input.val(points.join(','));
    },

    move: function(e) {
      if(!e.offsetX) {
        e.offsetX = (e.pageX - $(e.target).offset().left);
        e.offsetY = (e.pageY - $(e.target).offset().top);
      }
      points[activePoint] = e.offsetX;
      points[activePoint+1] = e.offsetY;
      methods.draw.apply(this);
    },

    stopDrag: function() {
      $(this).unbind('mousemove');
      activePoint = null;
    },

    draw: function(e) {
      if (e) {
        e.preventDefault();
        if (e.which == 3) {
          return methods.reset.apply(this, e);
        }
        if(!e.offsetX) {
          e.offsetX = (e.pageX - $(e.target).offset().left);
          e.offsetY = (e.pageY - $(e.target).offset().top);
        }
        var x = e.offsetX, y = e.offsetY;
        var dis, lineDis, insertAt = points.length;
        for (var i = 0; i < points.length; i+=2) {
          dis = Math.sqrt(Math.pow(x - points[i], 2) + Math.pow(y - points[i+1], 2));
          if ( dis < 6 ) {
            activePoint = i;
            $(this).bind('mousemove', methods.move);
            return false;
          }
          if (i > 1) {
            lineDis = dotLineLength(x, y, points[i], points[i+1], points[i-2], points[i-1], true);
            if (lineDis < 6) {
              insertAt = i;
            }
          }
        }
        points.splice(insertAt, 0, x, y);
        activePoint = insertAt;
        $(this).bind('mousemove', methods.move);
      }

      ctx.drawImage(image,0,0);

      if (points.length < 2) {
        return false;
      }

      ctx.fillStyle = ctx.strokeStyle = 'rgb(200,30,30)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      for (var i = 0; i < points.length; i+=2) {
        ctx.fillRect(points[i]-4, points[i+1]-4, 8, 8);
        if (points.length > 2 && i > 1) {
          ctx.lineTo(points[i], points[i+1]);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(200,0,0,0.4)';
      ctx.fill();

      methods.record();


      return false;
    }

  };
  $(document).ready(function() {
    $('input.canvas-area[data-image-url]').canvasAreaDraw();
  });

  var dotLineLength = function(x, y, x0, y0, x1, y1, o) {
    function lineLength(x, y, x0, y0){
      return Math.sqrt((x -= x0) * x + (y -= y0) * y);
    }
    if(o && !(o = function(x, y, x0, y0, x1, y1){
      if(!(x1 - x0)) return {x: x0, y: y};
      else if(!(y1 - y0)) return {x: x, y: y0};
      var left, tg = -1 / ((y1 - y0) / (x1 - x0));
      return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
    }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
      var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
      return l1 > l2 ? l2 : l1;
    }
    else {
      var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
      return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
    }
  };
})( jQuery );
