var empresaSelect

function trocarEmpresa(){
    map.setClickable(false)
    alert({
        id: 'alertEmpresa',
        title: 'Trocar Empresa',
        message: 'Realize a troca de empresa!',
        template: 'empresaVendedor',
        width: '60%',
        buttons:[
            {
                label: 'OK',
                onclick: function() {
                    closeAlert('alertEmpresa')
                    map.setClickable(true)
                    findFormVendedor()
                    myLocation()
                }
            },
            {
                label: 'Cancelar',
                onclick: function() {
                    closeAlert('alertEmpresa')
                    map.setClickable(true)
                }
            }
        ]
    })
}

function selectedEmpresa(index) {
    
    empresas.forEach(function(e) {
        e.checked = false
    })

    empresaSelect = empresas.filter(function (e, i) {
        return i == index ? e : null
    })

    empresaSelect = empresaSelect[0]
    empresaSelect.checked = true
}

MobileUI.validaselected = function(c) {
    if (c === 'true') {
        return "checked"
    }    
}

document.addEventListener('backPage', function() {
    closeAlert('alertEmpresa')
})
