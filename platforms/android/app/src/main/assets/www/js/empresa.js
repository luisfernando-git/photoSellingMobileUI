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
                    closeAlert()
                    map.setClickable(true)
                }
            },
            {
                label: 'Cancelar',
                onclick: function() {
                    closeAlert()
                    map.setClickable(true)
                }
            }
        ]
    })
}

document.addEventListener('backPage', function (){
    closeAlert('alertEmpresa')
})