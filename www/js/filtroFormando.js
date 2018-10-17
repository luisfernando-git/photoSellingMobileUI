var filtroContrato
var filtroNome
var optionSelected

function findFormando() {
    map.setClickable(false)
    alert({
        id: 'alertFormando',
        title: 'Formandos',
        message: 'Realize a busca de formandos! <br>                                                  '+ 
                ' <div class="list">                                                                  '+
                '   <div class="item">                                                                '+
                '       <label class="text-strong">Contrato:</label>                                  '+ 
                '       <input id="codContrato" type="search" placeholder="Digite para pesquisar..."> '+
                '   </div>                                                                            '+
                '   <div class="item">                                                                '+
                '       <label for="nomeFormando" class="text-strong">Formando:</label>               '+
                '       <input id="nomeFormando" type="search" placeholder="Digite para pesquisar...">'+        
                '   </div>                                                                            '+ 
                '   <div class="item">                                                                '+ 
                '       <label for="situacaoVenda" class="text-strong">Situação Venda:</label>        '+
                '       <select id="situacaoVenda">                                                   '+ 
                '           <option value="">Selecione uma opção:</option>                            '+ 
                '           <option value="0">Em Andamento</option>                                   '+ 
                '           <option value="1">Finalizado com Sucesso</option>                         '+ 
                '           <option value="2">Finalizado com Ressalva</option>                        '+ 
                '           <option value="3">Suspensa</option>                                       '+ 
                '           <option value="4">Não Concretizada</option>                               '+ 
                '           <option value="5">Aberta</option>                                         '+ 
                '       </select>                                                                     '+      
                '    </div>                                                                           '+ 
                ' </div> ',
        width: '60%',
        buttons: [
            {
                label: 'Buscar',
                onclick: function() {
                    map.clear()
                    filtroContrato = document.getElementById('codContrato').value
                    filtroNome = document.getElementById('nomeFormando').value
                    optionSelected = document.getElementById('situacaoVenda').value

                    if (filtroContrato == '' && filtroNome == '' && optionSelected == '') {
                        myLocation()
                        closeAlert('alertFormando')
                        map.setClickable(true)
                    } else {
                        selectSituacaoVenda()
                        filtrarFormando()
                        closeAlert('alertFormando')
                        map.setClickable(true)
                    }
                }
            },
            {
                label:'Cancelar',
                onclick: function(){
                    closeAlert('alertFormando')
                    map.setClickable(true)
                }
            }
        ]
    })
}    

document.addEventListener('backPage', function () {
    closeAlert('alertFormando')
})

function filtrarFormando() {
    var center = []

    if (filtroContrato != '' || filtroNome != '') {
        myLocationFilter()
        center.push(posicaoVendedor)
    }

    if (filtroContrato != '') {
        formandos.forEach(function (element) {
            if (element['cont_id'] === filtroContrato) {
                if (element.latitude != null && element.longitude != null) {
                    var localizacaoForm = {
                        lat: element.latitude,
                        lng: element.longitude
                    }

                    center.push({
                        lat: element.latitude,
                        lng: element.longitude
                    })

                    calculateRouteFilter(element.latitude, element.longitude)
                    situacaoVenda(element.idStatus)
                    map.addMarker({
                        position: localizacaoForm,
                        title: element.cont_id + ' - ' + element.nome,
                        icon: situacaoVenda(color)
                    }, function(marker) {
                        marker.showInfoWindow()
                    }) 
                }
            }
        })
        
        var latLngBounds = new plugin.google.maps.LatLngBounds(center)
        map.animateCamera({
            target: latLngBounds.getCenter(), 
            zoom: 7, 
            duration: 1000
        })
    }

    if (filtroNome != '') {
        formandos.forEach(function (element) { 
            if (element['nome'] === filtroNome) {
                if (element.latitude != null && element.longitude != null) {
                    var localizacaoForm = {
                        lat: element.latitude,
                        lng: element.longitude
                    }

                    center.push({
                        lat: element.latitude,
                        lng: element.longitude
                    })

                    calculateRouteFilter(element.latitude, element.longitude)
                    situacaoVenda(element.idStatus)
                    map.addMarker({
                        position: localizacaoForm,
                        title: element.cont_id + ' - ' + element.nome,
                        icon: situacaoVenda(color)
                    }, function(marker) {
                        marker.showInfoWindow()
                    })
                }
            }
        })
        
        latLngBounds = new plugin.google.maps.LatLngBounds(center)
        map.animateCamera({
            target: latLngBounds.getCenter(), 
            zoom: 7, 
            duration: 1000
        })
    }  
}

function selectSituacaoVenda() {
    var directionsService = new google.maps.DirectionsService
    var wayptsFilter = []
    var rotasFilter = []
    var array = []
    var routesOrderFilter = []
    var center = []
    var destinoSV

    if (optionSelected != '') {
        myLocationFilter()
        center.push(posicaoVendedor)
        formandos.forEach(function (element) { 
            if (element['idStatus'] == optionSelected) {
                if (element.latitude != null && element.longitude != null) {
                    
                    var localizacaoForm = {
                        lat: element.latitude,
                        lng: element.longitude
                    }

                    array.push(element.distance)

                    situacaoVenda(element.idStatus)
                    map.addMarker({
                        position: localizacaoForm,
                        title: element.cont_id + ' - ' + element.nome,
                        icon: situacaoVenda(color)
                    }, function(marker) {
                        marker.showInfoWindow()
                    })
                }
            }
        })

        array.sort()
        array.splice(0, 0, posicaoVendedor.distance)

        var newArray = []
        for (var i = 0; i < array.length; i++) {
            if (array[i] == posicaoVendedor.distance) {
                newArray = array.slice(i, 21)
            }
        }

        formandos.forEach(formando => {
            newArray.forEach(position => {
                if (position == formando.distance) {
                    routesOrderFilter.push(formando)
                }
            })
        })
    
        routesOrderFilter.sort(function (a, b) {
            return (a.distance < b.distance) ? 1 : ((b.distance < a.distance) ? -1 : 0)
        })

        if (routesOrderFilter.length > 0) {
            destinoSV = new google.maps.LatLng(routesOrderFilter[routesOrderFilter.length - 1].latitude, 
                routesOrderFilter[routesOrderFilter.length - 1].longitude);   
        }

        routesOrderFilter.forEach(function(r) {
            if (r.latitude != null && r.longitude != null) {
                var locRoutesFilter = new google.maps.LatLng(r.latitude, r.longitude)
    
                center.push({
                    lat: r.latitude,
                    lng: r.longitude
                })
    
                wayptsFilter.push({
                    location: locRoutesFilter
                })
            }
        })

        var latLngBounds = new plugin.google.maps.LatLngBounds(center)

        map.animateCamera({
            target: latLngBounds.getCenter(), 
            zoom: 7, 
            duration: 1000
        })

        directionsService.route({
            origin: origem,
            waypoints: wayptsFilter,
            destination: destinoSV,
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
}

document.addEventListener('alertOpened', function() {
    var contratos = []
    formandos.forEach(function(f) {
        if (f.cont_id != null || f.cont_id != undefined) {
            contratos.push(f.cont_id)
        }
    })
    
    $("#codContrato").autocomplete({
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(contratos, request.term)
            response(results.slice(0, 5))
        }
    })
})

document.addEventListener('alertOpened', function() {
    var nomes = []
    formandos.forEach(function(f) {
        if (f.nome != null || f.nome != undefined) {
            nomes.push(f.nome)
        }
    })

    $("#nomeFormando").autocomplete({
        source: function(request, response) {
            var results = $.ui.autocomplete.filter(nomes, request.term)
            response(results.slice(0, 5))
        }
    })
})
