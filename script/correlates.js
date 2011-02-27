var map, po, currentData, geoJson;

$(function() {
  var mapel = $('div.map_container');
  po = org.polymaps;
  geoJson = po.geoJson();
  
  var featuresCache = {};

  map = po.map()
      .container($('.map_container')[0].appendChild(po.svg("svg")))
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
      
  
  function randomColor(colors) {
    var sick_neon_colors = ["#CB3301", "#FF0066", "#FF6666", "#FEFF99", "#FFFF67", "#CCFF66", "#99FE00", "#EC8EED", "#FF99CB", "#FE349A", "#CC99FE", "#6599FF", "#03CDFF"];
    return sick_neon_colors[Math.floor(Math.random()*sick_neon_colors.length)];
  };
  
  function load(e){
    var cssObj = randColor = randomColor();
    
    for (var i = 0; i < e.features.length; i++) {
      
      var feature = e.features[i];
      
      //console.log(feature.data.geometry.type == 'LineString' ? 'none' : randColor)
      
      if( feature.data.geometry.type == 'LineString' || feature.data.geometry.type == 'MultiLineString' ) {
        cssObj = {
          fill: 'none',
          stroke: randColor,
          strokeWidth:2,
          opacity: .9 
        }
      } else {
        cssObj = {
          fill: randColor,
          opacity: .9 
        }
      }

      $( feature.element )
        .css( cssObj )
    }
    
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
  })}

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
            .on( "show", load );

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
  
  var onPointClick = function( event ) {

    var coor = event.data.geo.coordinates,
        props = event.data.props;
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
          .append('pizza')
          .append(ctype)
          .append(close)
          .addClass(otype) 
  
        bdy.text(props.address)
        bdy.append($('<span />')
          .addClass('date')
          .text("woooo"))
  
        cnt.append($('<div/>').addClass('nub'))
        cnt.append(hdr).append(bdy) 
  
        close.click(function() {
          self.hide()
        })   
  
        return cnt
      }).render()    
  };

  // Get all sets
  $.ajax({ 
    url: "http://civicapi.com/datasets",
    dataType: 'jsonp', 
    success: function(data){ 
      $.each(data.datasets, function( i, item ){
        $('<li>', {
          class: item.name,
          html: '<input type="checkbox"/>' + item.name.replace('_', ' ')
        })
        .appendTo('.sidebar')
      })
    } 
  }); 
  
  // Interaction/event binding
  $('[type=checkbox]').live('click', function(){
    if($(this).parents('li').hasClass('live_trains')) {
      $.ajax({                                                                                      
        url: "http://jsonpify.heroku.com?resource=http://openmbta.org/ocd/train_trajectories.json",
        dataType: 'jsonp',                                                                          
        success: function(data){                                                                    
          var t = JSON.parse(data);
          $.each(["Red", "Blue", "Orange"], function(i, color){
            var r = t[color].map(function(col) { 
              var l = col.arriving.geo;
              return { "type": "Feature",
                "geometry": {'type': 'Point', 'coordinates': [l[0], l[1]]}
              };
            })
            
            map.add( po.geoJson().features( r ).on('load', load));
          })
          
        }
      });
    } else {
      var input = $(this)
          dataSet = 'bos_' + input.parent().attr('class');
      if( $(this).attr('checked') ) {
        showDataset( dataSet );
      } else {
        removeDataset( dataSet );
      }      
    }
  });

  //Slider
  $( ".slider" ).slider({
    range: true,
    min: 1900,
    max: 2011,
    values: [ 2003, 2008 ],
    slide: function( event, ui ) {
      $( ".date" ).html( ui.values[ 0 ] + " - "+ ui.values[ 1 ] );
    }
  });
  
  $( ".date" ).html( $( ".slider" ).slider('values')[ 0 ] + " - "+ $( ".slider" ).slider('values')[ 1 ] );

  $(".gencalls").click(function(){
    $('#dialog ul').html("");
    $('[type=checkbox]').each(function(i, item){
      var input = $(this),
          dataSet = 'bos_' + input.parent().attr('class');

      if( $(this).attr('checked') ) {
        $('#dialog ul').append( "<li><a href='http://civicapi.com/" + dataSet + "?" + $.param({"bbox": getBB()}) + "'>" + dataSet + "</a></li>" );
      }
    });
    
    $('#dialog').dialog({
      modal: true,
      title: 'API Calls',
      widht: 400
    })
  })
  
});