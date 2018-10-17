let map = undefined
let item
let origem
let rotas = []
let posicaoVendedor
let routesOrder = []
let updatedLatitude
let updatedLongitude

function myLocation() {
    item = document.getElementById('conteudo')
    item.style.visibility = 'hidden'

    if (map != undefined) {
        destruirMapa()
    }

    let div = document.getElementById('mapa')
    map = plugin.google.maps.Map.getMap(div)
    
    let config = {
        enableHighAccuracy: true
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, config)
}

function onSuccess(position) {           
    map.clear()
    rotas = []
    routesOrder = []
    origem = null

    let localizacaoVend = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        distance: (position.coords.latitude + position.coords.longitude),
        accuracy: position.coords.accuracy,
        timeposition: position.timestamp
    }

    posicaoVendedor = localizacaoVend

    let nomeVendedor = usuario.realname
    map.addMarker({
        position: localizacaoVend,
        title: nomeVendedor,
    }, function(marker) {

        marker.setIcon("img/myLocation.png")
        marker.showInfoWindow()

    })
    
    insertLocation()
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

function localizaFormandos() {
    let color = ''

    if (formandos.length > 0) {   
        formandos.forEach(function(fmd) {    
            if (fmd.latitude != null && fmd.longitude != null) {
                fmd.distance = (fmd.latitude + fmd.longitude)
                let localizacaoForm = {
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
}

function ordenarRotas() {
    let array = []
    formandos.forEach((formando) => { 
        if (formando.idStatus != 1 && formando.idStatus != 2) {
            array.push(formando.distance)
        }
    });
    
    array.sort()
    array.splice(0, 0, posicaoVendedor.distance)

    let newArray = []
    for (let i = 0; i < array.length; i++) {
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
        return (a.distance < b.distance) ? 1 : ((b.distance < a.distance) ? -1 : 0)
    })
}

function calculateRoute() {
    let directionsService = new google.maps.DirectionsService
    let waypts = []
    let center = []
    let destino

    center.push(posicaoVendedor)
    destino = new google.maps.LatLng(routesOrder[routesOrder.length - 1].latitude, routesOrder[routesOrder.length - 1].longitude)

    routesOrder.forEach(function(r) {
        if (r.latitude != null && r.longitude != null) {
            let locRoutes = new google.maps.LatLng(r.latitude, r.longitude)

            center.push({
                lat: r.latitude,
                lng: r.longitude
            })

            waypts.push({
                location: locRoutes
            })
        }
    })

    let latLngBounds = new plugin.google.maps.LatLngBounds(center)

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
                        let cordRota = {
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
