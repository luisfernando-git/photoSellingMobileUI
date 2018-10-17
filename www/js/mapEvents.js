function destruirMapa() {
    map.remove()
}

document.addEventListener('backPage', function() {
    destruirMapa()
    item.style.visibility = 'visible'
    empresaSelect = null
    posicaoVendedor.lat = null
    posicaoVendedor.lng = null
})

document.addEventListener('popoverOpened', function() {
    map.setClickable(false)
})

document.addEventListener('popoverClosed', function() {
    map.setClickable(true)
})

document.addEventListener('openMenu', function() {
    map.setClickable(false)
})

document.addEventListener('closeMenu', function() {
    map.setClickable(true)
})

function myLocationFilter() {
    var config = {
        enableHighAccuracy: true
    }
    navigator.geolocation.getCurrentPosition(onSuccessFilter, onError, config)
}

function onSuccessFilter(position) {
    var localizacaoVend = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        distance: (position.coords.latitude + position.coords.longitude),
        accuracy: position.coords.accuracy,
        timeposition: position.timestamp
    }

    posicaoVendedor = localizacaoVend
    
    var nomeVendedor = usuario.realname
    map.addMarker({
        position: localizacaoVend,
        title: nomeVendedor,
    }, function(marker) {

        marker.setIcon("img/myLocation.png")
        marker.showInfoWindow()
    })
    
    insertLocation()
    originRoute(position.coords.latitude, position.coords.longitude)
}

function calculateRouteFilter(latitude, longitude) {
    var directionsService = new google.maps.DirectionsService
    var destinoFilter
    var rotasFilter = []

    destinoFilter = new google.maps.LatLng(latitude, longitude) 

    directionsService.route({
        origin: origem,
        destination: destinoFilter,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            response.routes[0].legs.forEach(function(r) {
                r.steps.forEach(function(s) {
                    s.lat_lngs.forEach(function(cord) {
                        var cordRota = {
                            lat: cord.lat(),
                            lng: cord.lng()
                        }
                
                        rotasFilter.push(cordRota)
                    })
                })
            })

            map.addPolyline({
                'points': rotasFilter,
                'width': 5,
                'geodesic': true
            })

        } else {
            return console.log('Directions request failed due to ' + status)
        }
    })
}

var intervalo = window.setInterval(function() {
    myLocation()
}, 60000 * 30);
    
