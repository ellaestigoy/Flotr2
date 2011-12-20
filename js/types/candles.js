/** Candles **/
Flotr.addType('candles', {
  options: {
    show: false,           // => setting to true will show candle sticks, false will hide
    lineWidth: 1,          // => in pixels
    wickLineWidth: 1,      // => in pixels
    candleWidth: 0.6,      // => in units of the x axis
    fill: true,            // => true to fill the area from the line to the x axis, false for (transparent) no fill
    upFillColor: '#00A8F0',// => up sticks fill color
    downFillColor: '#CB4B4B',// => down sticks fill color
    fillOpacity: 0.5,      // => opacity of the fill color, set to 1 for a solid fill, 0 hides the fill
    // TODO Test this barcharts option.
    barcharts: false       // => draw as barcharts (not standard bars but financial barcharts)
  },

  draw : function (options) {

    var
      context = options.context;

    context.save();
    context.translate(options.offsetLeft, options.offsetTop);
    context.lineJoin = 'miter';
    context.lineCap = 'butt';
    // @TODO linewidth not interpreted the right way.
    context.lineWidth = options.wickLineWidth || options.lineWidth;

    this.plot(options);

    context.restore();
  },

  plot : function (options) {

    var
      data          = options.data,
      context       = options.context,
      xScale        = options.xScale,
      yScale        = options.yScale,
      width         = options.candleWidth / 2,
      shadowSize    = options.shadowSize,
      wickLineWidth = options.wickLineWidth,
      pixelOffset   = (wickLineWidth % 2) / 2,
      color,
      datum, x, y,
      open, high, low, close,
      left, right, bottom, top, bottom2, top2,
      i;

    if (data.length < 1) return;

    for (i = 0; i < data.length; i++) {
      datum   = data[i];
      x       = datum[0];
      open    = datum[1];
      high    = datum[2];
      low     = datum[3];
      close   = datum[4];
      left    = xScale(x - width);
      right   = xScale(x + width);
      bottom  = yScale(low);
      top     = yScale(high);
      bottom2 = yScale(Math.min(open, close));
      top2    = yScale(Math.max(open, close));

      /*
      TODO old min / max
      bottom  = Math.max(ya.min, low),
      top     = Math.min(ya.max, high),
      bottom2 = Math.max(ya.min, Math.min(open, close)),
      top2    = Math.min(ya.max, Math.max(open, close));
      */

      /*
      // TODO skipping
      if(right < xa.min || left > xa.max || top < ya.min || bottom > ya.max)
        continue;
      */

      color = options[open > close ? 'downFillColor' : 'upFillColor'];

      // Fill the candle.
      // TODO Test the barcharts option
      if (options.fill && !options.barcharts) {
        context.fillStyle = 'rgba(0,0,0,0.05)';
        context.fillRect(left + shadowSize, top2 + shadowSize, right - left, bottom2 - top2);
        context.save();
        context.globalAlpha = options.fillOpacity;
        context.fillStyle = color;
        context.fillRect(left, top2 + width, right - left, bottom2 - top2);
        context.restore();
      }

      // Draw candle outline/border, high, low.
      if (options.lineWidth || wickLineWidth) {

        x = Math.floor((left + right) / 2) + pixelOffset;

        context.strokeStyle = color;
        context.beginPath();

        // TODO Again with the bartcharts
        if (options.barcharts) {
          
          context.moveTo(x, Math.floor(top + width));
          context.lineTo(x, Math.floor(bottom + width));
          
          y = Math.floor(open + width) + 0.5;
          context.moveTo(Math.floor(left) + pixelOffset, y);
          context.lineTo(x, y);
          
          y = Math.floor(close + width) + 0.5;
          context.moveTo(Math.floor(right) + pixelOffset, y);
          context.lineTo(x, y);
        } else {
          context.strokeRect(left, top2 + width, right - left, bottom2 - top2);

          context.moveTo(x, Math.floor(top2 + width));
          context.lineTo(x, Math.floor(top + width));
          context.moveTo(x, Math.floor(bottom2 + width));
          context.lineTo(x, Math.floor(bottom + width));
        }
        
        context.closePath();
        context.stroke();
      }
    }
  },
  extendXRange: function (axis, data, options) {
    if (axis.options.max == null) {
      axis.max = Math.max(axis.datamax + 0.5, axis.max);
      axis.min = Math.min(axis.datamin - 0.5, axis.min);
    }
  }
});
