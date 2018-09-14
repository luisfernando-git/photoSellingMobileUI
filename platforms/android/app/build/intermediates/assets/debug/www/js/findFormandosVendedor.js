var formandos = []

function findFormVendedor() {
    var url = 'https://myphotos.rfsolutionit.com.br/services/findFormandosVendedor'

    empresas.forEach(function (empresa) {

        MobileUI.ajax.post(url).send()
            .set('Authorization', token)
            .query('arg0=' + usuario.username)
            .query('arg1=' + empresa.id)
            .end(returnFormandos)
    })
}

function returnFormandos(error, res) {
    
    if (error) {
        return console.log(res.body)
    }

    formandos = []
    res.body.forEach(function (fmd) {
        var formando = {}

        formando.nome = fmd.foc_nome
        formando.cont_id = fmd.cont_id
        formando.latitude = fmd.foc_end_latitude
        formando.longitude = fmd.foc_end_longitude
        formando.situacao = fmd.situacao
        formando.idStatus = fmd.vnd_status

        formandos.push(formando)
    })
}