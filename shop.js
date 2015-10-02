var geocoder = null;
var map;
var markers = [];

function initialize()
{
  var latlng = new google.maps.LatLng(-14.235004, -51.92528);
  var mapOptions = {
      zoom: 4,
    center: latlng,
    scrollwheel: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

// Add a marker to the map and push to the array.
function addMarker( location, city_name, state_name )
{
  var marker = new google.maps.Marker({
    position: location,
      map: map
    });
  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function() {
    abrirModal();

    // retorna a cidade selecinada
    $(" #city_selected ").val(city_name);

    // verifica o valor data-state e manipula a exibição das cidades
    $( '#city_selected option' ).each
    (
      function()
      {
        if ( $( this ).attr( 'data-state' ) == state_name )
        {
          $( this ).show();
        }
      }
    );

  });

  return marker
}

// Sets the map on all markers in the array.
function setAllMap(map)
{
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers()
{
  setAllMap(null);
}

// Shows any markers currently in the array.
function showMarkers()
{
  setAllMap(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers()
{
  clearMarkers();
  markers = [];
}

initialize();

// callback da planilha
function loadShops(places)
{
  //var map = initMap();
  var states = {}

  // percorre os dados
  $.each(places, function (i, place) {
    // pega as cordenadas
    var coords = [place.lat, place.lon];

    // pega o estado atual
    var state = place.state;

    // verifica se já existe o estado no array/objeto
    if ( !states[state] )
    {
      // cria o objeto dentro do objeto de estados
      states[state] = {};

      // cria a option para o select de estados
      $( '<option data-coords="' + coords + '">' ).val( state ).text( state ).appendTo( $( '#state' ) );

    }

    // pega a cidade
    var city = place.city;

    // monta a listagem de cidades
    if( !states[state][city] )
    {
       states[state][city] = [];

      $( '<li data-state="' + state + '"><h3>' + city  + '</h3><a href="#" class="btn show_map" rel="' + coords + '" data-city="' + city + '">Receber Listas de Lojas <span></span></a></li>' ).appendTo( "#resultset" );

    }

    // esconde todas as cidades
    $( '#resultset li' ).hide();

      // adiciona no mapa as lojas
    var latlng = new google.maps.LatLng( parseFloat( coords[0] ), parseFloat( coords[1] ) );
    addMarker(latlng, city, state );


    // configura o objeto com informações da loja
    var shop = {
      name:        place.name,
      description: place.description,
      address:     place.address_line_1,
      address2:    place.district,
      zip:         place.postal_code,
      phone:       place.main_phone,
      latlng:      coords.join(',')
    };

    // adiciona a loja no array de cidades
    states[state][city].push( shop );
  });

  // controla o evento de change do select de estados
  $( "#state" ).change
  (
    function()
    {
      geocoder = new google.maps.Geocoder();
 
      // pega as coordenadas do estado
      var coords = $( this ).find( 'option:selected' ).attr('data-coords' ).split( ',' );
      var latlng = new google.maps.LatLng( parseFloat( coords[0] ), parseFloat( coords[1] ) );

      map.panTo( latlng );
      map.setZoom( 6 );

      // deixa visiveis todas as marcações do mapa, senão esconde todas elas
      if( $( this ).find( 'option:selected' ).val() == "Todos")
      {
        showMarkers();
        map.setZoom(4);
      } else
      {
        clearMarkers();
      }

      var acronym = $(this).val();

      // esconde todas as cidades e mostrar cidades do mesmo Estado
      $( '#resultset li' ).hide();
      $( '#resultset li' ).each
      (
        function()
        {
          if ( $( this ).attr( 'data-state' ) == acronym )
          {
            $( this ).show();
          }
        }
      );

      // cria o elemento <option> dentro da <select> cidade
      $( '#city_selected' ).empty();
      $( '#neighborhood' ).empty();

      // percorre o objeto estado pegando todas as suas cidades
      var cities = states[acronym];

      for( var city in cities )
        {

            // adiciona as cidades no select
            $( '<option>' ).val( city ).text( city ).appendTo( $( '#city_selected' ) );

            for ( var shop in cities )
            {

              $('#where_to_find #list ol li:visible').each(function(){

              var coordscity = $( this ).find( 'a' ).attr( 'rel' ).split( ',' );

            var latlng = new google.maps.LatLng( parseFloat( coordscity[0] ), parseFloat( coordscity[1] ) );
                addMarker( latlng , city );

              });
             }

         }

    }
  );


  // adiciona controle no select das cidades
  $( '#city_selected' ).change
  (
    function()
    {
      var state   = $( '#state' ).val();
      var city  = $( this ).val();
      var shops = states[ state ][ city ];

      var shops_at_select = [];

      // remove todos os bairros
      $( '#neighborhood' ).empty();

      // adiciona o "selecione"
      $( '#neighborhood' ).prepend( '<option value="" selected="selected">Bairro</option>');

        for(var i = 0; i < shops.length; i++)
        {

          var shop = shops[i];

          $( '#neighborhood option' ).each
          (
          function()
          {
            console.log(shop.address2)

            if ( $( this ).text() == shop.address2 )
            {
              verdadeiro = false;
              console.log( 'ja existe' )
              // $("<option value=\"" + shop.address2 + "\">" + shop.address2  + "</option>").appendTo("#neighborhood");
            }
            else
            {
                verdadeiro = true;
            }
          }
        );

        if ( verdadeiro ) {

          $( "<option value=\"" + shop.address2 + "\">" + shop.address2  + "</option>" ).appendTo("#neighborhood");
          console.log('add')
        }

        }

      // verifica se existe mais de um bairro, caso contrário esconde
          if ( $( '#neighborhood' ).children().length > 2 )
          {
            $( '#neighborhood' ).show();
          }
            else
          {
            $( '#neighborhood' ).hide();
          }
    }
  );

  // mostra modal
  $( 'a.btn.show_map' ).on
  (
    'click',
    function()
    {
      // Visualização Padrão Form
      $( '#formulario-encontrar-loja .wp-form' ).show();
      $( '#msg-sucesso' ).hide();
      $( '.fancybox-inner' ).height( 'auto' );

        // verifica o valor data-city e manipula a select cidade selecionada
        var city = $(this).attr( 'data-city' )
        $( "#city_selected ").val(city);

        var state = $( "#state" ).val();
        var shops = states[state][city];

        $( '#neighborhood' ).empty();
        $( '#neighborhood' ).prepend('<option value="" selected="selected">Bairro</option>');

        var verdadeiro = true;

        for(var i = 0; i < shops.length; i++)
        {

          var shop = shops[i];

          $( '#neighborhood option' ).each
          (
          function()
          {

            if ( $( this ).text() == shop.address2 )
            {

              verdadeiro = false;
              console.log( 'ja existe' )

            }
            else
            {

                verdadeiro = true;

            }

          }
        );

        if ( verdadeiro )
        {

          $("<option value=\"" + shop.address2 + "\">" + shop.address2  + "</option>").appendTo("#neighborhood");

          }

        }

          // verifica se existe mais de um bairro, caso contrário esconde
          if ( $( '#neighborhood' ).children().length > 2 )
          {
            $( '#neighborhood' ).show();
          }
            else
          {
            $( '#neighborhood' ).hide();
          }

      abrirModal();

      return false;

    }
  );
}
