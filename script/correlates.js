var map, po, currentData, geoJson;

$(function(){  
  var mapel = $('div.map');
  po = org.polymaps;
  geoJson = po.geoJson();
  
  var featuresCache = {};

  map = po.map()
      .container($('.map')[0].appendChild(po.svg("svg")))
      .center({lat: 42.3584308, lon: -71.0597732})
      .zoom(17)
      .add(po.interact())
      .add(po.hash());

  map.add(po.image()
      .url(po.url("http://{S}tile.cloudmade.com"
      + "/d3394c6c242a4f26bb7dd4f7e132e5ff" // http://cloudmade.com/register
      + "/998/256/{Z}/{X}/{Y}.png")
      .repeat(false)
      .hosts(["a.", "b.", "c.", ""])));

  map.add(po.compass()
      .pan("none"));
      
  
  function load(e){
    var counts = {};
    $.each(e.features, function( i, feature) {
      var type = this.data.geometry.type.toLowerCase(),
          el = this.element,
          $el   = $(el),
          $cir  = $(el.firstChild),
          text  = po.svg('text'),
          props = $.extend(this.data.properties, {content: 'sadasd'}),
          check = $('span.check[data-code=' + props.code + ']'),
          inact = check.hasClass('inactive');

      if(!counts[props.code]) {
        counts[props.code] = 0
      } 
      counts[props.code]++
      
      // if(inact) {
      //   $el.addSVGClass('inactive')
      // }
      
      // $el.addSVGClass(props.code)
      // $cir.addSVGClass('circle')
      // $cir.addSVGClass(props.code)      
      // $cir[0].setAttribute("r", 12)
      
      $el.bind('click', {props: props, geo: this.data.geometry}, onPointClick)      
          
      text.setAttribute("text-anchor", "middle")
      text.setAttribute("dy", ".35em")
      text.appendChild(document.createTextNode(props.code))
      
      el.appendChild(text)
    })

  }

  function fetchFeatures(bbox, dataset, callback) {
    $.ajax({
      url: "http://civicapi.com/" + dataset,
      dataType: 'jsonp',
      data: {
        "bbox": bbox
      },
      success: callback
    });
  }

  var showDataset = function( dataset ) {
    var bbox = getBB();

    fetchFeatures( bbox, dataset, function( data ){

      var feature = po.geoJson()
            .features( data.features )
            .on( "show", load )

      featuresCache[dataset] = feature;
          
      map.add( feature );

    })
  }
  
  

  var removeDataset = function( dataset ) {
    map.remove( featuresCache[dataset] );
  }

  var getBB = function(){
    return map.extent()[0].lon + "," + map.extent()[0].lat + "," + map.extent()[1].lon + "," + map.extent()[1].lat;
  }
  
  showDataset('bos_bicycle_parking');
  
  var onPointClick = function( event ) {
    
   var coor = event.data.geo.coordinates,
       props = event.data.props;
   console.log(props)
   // if($(event.target).is(':hidden')) {
   //   return      
   // }
   
   mapel
     .maptip(this)
     .map(map)
     .data(props)
     .location({lat: coor[1], lon: coor[0]})
     .classNames(function(d) {
       return d.code
     })
     .top(function(tip) {
       var point = tip.props.map.locationPoint(this.props.location)
       return parseFloat(point.y - 30)
     })
     .left(function(tip) {
       var radius = tip.target.getAttribute('r'),
           point = tip.props.map.locationPoint(this.props.location)
       
       return parseFloat(point.x + (radius / 2.0) + 20)
     })
     .content(function(d) {
       var self = this,
           props = d,
           cnt = $('<div/>'),
           hdr = $('<h2/>'),
           bdy = $('<p/>'),
           check = $('#sbar span[data-code=' + props.code + ']'),
           ctype = check.next().clone(),
           otype = check.closest('li.group').attr('data-code'),
           close = $('<span/>').addClass('close').text('x')


       hdr.append($('<span/>').addClass('badge').text('E').attr('data-code', otype))
         .append(ctype)
         .append(close)
         .addClass(otype) 
       
       bdy.text(props.address)
       bdy.append($('<span />')
         .addClass('date')
         .text(props.properties.neighborhood))
       
       cnt.append($('<div/>').addClass('nub'))
       cnt.append(hdr).append(bdy) 
       
       close.click(function() {
         self.hide()
       })   
   
       return cnt
     }).render()    
  };
  

});