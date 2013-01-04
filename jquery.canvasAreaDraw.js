(function( $ ){
  
  var $input, methods, $modal, $canvas, ctx, $overlay, image, points;

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
        points.push(x, y);
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
        ctx.fillRect(points[i]-2, points[i+1]-2, 4, 4);
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
})( jQuery );
