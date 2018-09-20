var map
var item
var origem
var rotas = []
var posicaoVendedor
let routesOrder = []

function myLocation() {
    item = document.getElementById('conteudo')
    item.style.visibility = 'hidden'

    var div = document.getElementById('mapa')
    map = plugin.google.maps.Map.getMap(div)
    
    var config = {
        enableHighAccuracy: true
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, config)
}

function onSuccess(position) {
    map.clear()
    rotas = []
    routesOrder = []
    origem = null

    var localizacaoVend = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        distance: (position.coords.latitude + position.coords.longitude)
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
        
    originRoute(position.coords.latitude, position.coords.longitude)    
    localizaFormandos()
}

function onError(error) {
    map.setClickable(false)
    alert({
        id: 'alertMapError',
        title: 'Aviso',
        message: error.message,
        buttons: [
            {
                label: 'OK',
                onclick: function() {
                    map.setClickable(true)
                    closeAlert('alertMapError')
                }
            }
        ] 
    })
}

function originRoute(lat, lng) {
    origem = new google.maps.LatLng(lat, lng)
}

//var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 300000 })

function localizaFormandos() {
    var color = ''

    if (formandos.length > 0) {   
        formandos.forEach(function(fmd) {    
            if (fmd.latitude != null && fmd.longitude != null) {
                fmd.distance = (fmd.latitude + fmd.longitude)
                var localizacaoForm = {
                    lat: fmd.latitude,
                    lng: fmd.longitude
                }

                situacaoVenda(fmd.idStatus)
                map.addMarker({
                    position: localizacaoForm,
                    title: fmd.cont_id + ' - ' + fmd.nome,
                    icon: situacaoVenda(color)
                }, function(marker) {
                    marker.showInfoWindow()
                })
            } 
        })
        
        ordenarRotas()  
        calculateRoute()
       
    } else {
        map.setClickable(false)
        alert({
            id: 'alertValidation',
            title: 'Aviso',
            message: 'Não há formandos disponíveis para localizar!',
            buttons: [
                {
                    label: 'OK',
                    onclick: function() {
                        map.setClickable(true)
                        closeAlert('alertValidation')
                    }
                }
            ] 
        })
    }

    // map.animateCamera({
    //     target: origem, 
    //     zoom: 7, 
    //     duration: 1000
    // })
}

function ordenarRotas() {
    var array = []
    formandos.forEach((formando) => { 
        if (formando.idStatus != 1 && formando.idStatus != 2) {
            array.push(formando.distance)
        }
    });
    
    array.push(posicaoVendedor.distance)
    array.sort()

    var newArray = []
    for (var i = 0; i < array.length; i++) {
        if (array[i] == posicaoVendedor.distance) {
            newArray = array.slice(i, 23)
        }
    }
    
    formandos.forEach(formando => {
        newArray.forEach(position => {
            if (position == formando.distance) {
                routesOrder.push(formando)
            }
        })
    })

    routesOrder.sort(function (a, b) {
        return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0)
    })
}

function calculateRoute() {
    var directionsService = new google.maps.DirectionsService
    var waypts = []
    var destino

    destino = new google.maps.LatLng(routesOrder[routesOrder.length - 1].latitude, routesOrder[routesOrder.length - 1].longitude)
    routesOrder.forEach(function(r) {
        if (r.latitude != null && r.longitude != null) {
            var locRoutes = new google.maps.LatLng(r.latitude, r.longitude)

            waypts.push({
                location: locRoutes
            })
        }
    })

    var latLngBounds  = new plugin.google.maps.LatLngBounds(waypts)
    console.log(latLngBounds)

    map.animateCamera({
        target: latLngBounds.getCenter(), 
        zoom: 7, 
        duration: 1000
    })

    directionsService.route({
        origin: origem,
        waypoints: waypts,
        destination: destino,
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
                
                        rotas.push(cordRota)
                    })
                })
            })

            map.addPolyline({
                'points': rotas,
                'width': 5,
                'geodesic': true
            })

        } else {
            return console.log('Directions request failed due to ' + status)
        }
    })
}

function situacaoVenda(situacao) {

    if (situacao != null) {
        switch (situacao) {
            case 0: //Em Andamento
                color = 'yellow'
                break;
            case 1: //Finalizado com Sucesso
                color = 'green'
                break;
            case 2: //Finalizado com Ressalva
                color = 'blue'
                break;
            case 3: //Suspensa
                color = 'purple'
                break;
            case 4: //Não concretizada
                color = 'orange'
                break;
            case 5: //Aberta
                color = 'red'
                break;
        }
    }
    
    return color
}
