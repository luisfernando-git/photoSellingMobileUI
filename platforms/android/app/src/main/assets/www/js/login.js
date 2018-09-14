var userLogin = {
    username: document.getElementById('username').value,
    password: document.getElementById('password').value
}

var token = null
var usuario = {}
var empresas = []

function login() { 
    loadingElement('btnLogin', 'Authenticating...')
    var url = 'https://myphotos.rfsolutionit.com.br/services/login'

    MobileUI.ajax.post(url).send({
        username: username.value,
        password: password.value
    }).end(returnApi)
}

function returnApi(error, res) {
    closeLoading('btnLogin')

    if (error) {
        if (res.status == null || res.status == 403) {
            alert('Usuário e/ou senha incorretos!')
            return console.log(res.error)
        } else {
            alert('Erro de Autenticação!')
            return console.log(res.error)
        }
    }
    
    if (!error) {
        if (res.status == 200) {
            token = res.header.authorization
            validateVendedor()
            openPage('home', myLocation)
        }
    }
}

function validateVendedor() {
    var url = 'https://myphotos.rfsolutionit.com.br/services/validateVendedor'

    MobileUI.ajax.post(url)
        .set('Authorization', token)
        .query('arg0=' + username.value)
        .end(returnApiValidate)
}

function returnApiValidate(error, res) {
    
    if (error) {
        return console.log(res.body)
    }

    usuario = {
        username: res.body.username,
        email: res.body.email,
        realname: res.body.realname
    }

    empresas = []
    res.body.empresasVendedor.forEach(function (empresa) {
        var empresaVendedor = {}

        empresaVendedor.razaoSocial = empresa.emp_razaonome
        empresaVendedor.id = empresa.emp_id
        empresas.push(empresaVendedor)
    })
        
    findFormVendedor()
}