import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import conexao from './database/conexao.js';
import bodyParser from 'body-parser';
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var logado = false;
var nome = "";
var emai = "";
var pass = "";
var admin = "0";
var onde = "/";
var refresh = 0;
var verificarlogin = "";
var erros = false;

app.listen(5500, function () {
    console.log("Executando na porta 5500!");
});
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '/public')));
// CARREGANDO VIEW  ENGINE EJS

app.get('/', function (req, res) {
    if (onde != "/") {
        erros = false;
    }
    onde = "/";
    var errinho = "";
    if (erros == true) {
        errinho = "Dados inválidos";
    }
    refresh = 0;
    if (!logado) {
        res.render('../views/index', { tagValue: '#', tagErro: errinho });
    } else if (admin == "0") {
        res.render('../views/index', { tagValue: '/user', tagErro: errinho });
    } else {
        res.render('../views/index', { tagValue: '/admin', tagErro: errinho });
    }
});

var valid = "";
app.post('/login', (req, res) => {
    const { email, password } = req.body; // Recupera os dados do formulário
    const sql = 'SELECT * FROM login';
    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            const lista = resultado;
            for (let i = 0; i < lista.length; i++) {
                if (email.trim() == lista[i].email && password.trim() == lista[i].senha) {
                    // logado
                    logado = true;
                    nome = lista[i].nome;
                    emai = lista[i].email;
                    pass = lista[i].senha;
                    admin = lista[i].admin;
                    if (admin == "1") {
                        valid = "admin";

                    } else {
                        valid = "user";
                    }
                    i = lista.length;
                    erros = false;
                } else {
                    erros = true;
                    valid = "";

                }
            }
            if (valid === "admin") {
                admin = "1";
                logado = true;
                res.redirect('/admin');
            } else if (valid === "user") {
                logado = true;
                admin = "0";
                res.redirect('/user');
            } else {
                admin = "0";
                logado = false;
                if (onde == "/") {
                    res.redirect('/');
                } else {
                    res.redirect('/filtrar');
                }
            }
        }
    });
});
app.post('/cadastro', (req, res) => {
    const selecoes = req.body;
    console.log(selecoes);
    selecoes.admin = '0';
    const sql = 'INSERT INTO login SET ?;';
    conexao.query(sql, selecoes, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            res.redirect('/');
        }
    });
});
app.get('/filtrar/:estado', (req, res) => {
    refresh++;
    var htmlContent = fs.readFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', 'utf8');;
    var novoHtmlContent = fs.readFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', 'utf8');;
    const sql = 'SELECT id_universidade, nome_universidade, sigla_estado, nome_campus, site FROM universidade, cidade, campus, address, estado WHERE id_universidade = universidade_id_universidade AND address_cep = cep AND cidade_id_cidade = id_cidade AND estado_sigla_estado = sigla_estado AND estado_sigla_estado = "' + req.params.estado + '";';
    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            var expressaoRegular = /var filtro.*;/;
            // Substitui a variável no HTML
            novoHtmlContent = htmlContent.replace(
                expressaoRegular, // A variável que você deseja substituir
                `var filtro = ${JSON.stringify(resultado)};`// O JSON que substituirá a variável
            );
            htmlContent = novoHtmlContent;
            fs.writeFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', novoHtmlContent, 'utf8');
            if (!logado) {
                res.redirect('/filtrar');
            } else {
                res.redirect('/filtrar');
            }
        }
    });
});
app.post('/filtrar', (req, res) => {

    var htmlContent = fs.readFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', 'utf8');;
    var novoHtmlContent = fs.readFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', 'utf8');;
    const selecoes = req.body;
    var sql = '';
    if (selecoes.cbState != undefined && selecoes.cbUni == undefined && selecoes.cbCurso == undefined && selecoes.privado == undefined) {
        sql = 'SELECT id_universidade, nome_universidade, sigla_estado, nome_campus, site FROM universidade, cidade, campus, address, estado WHERE id_universidade = universidade_id_universidade AND address_cep = cep AND cidade_id_cidade = id_cidade AND estado_sigla_estado = sigla_estado AND estado_sigla_estado = "' + selecoes.cbState + '";';
    } else if (selecoes.cbState == undefined && selecoes.cbUni != undefined && selecoes.cbCurso == undefined && selecoes.privado == undefined) {
        sql = 'SELECT * FROM universidade WHERE sigla_universidade = "' + selecoes.cbUni + '";';
    } else if (selecoes.cbState == undefined && selecoes.cbUni == undefined && selecoes.cbCurso != undefined && selecoes.privado == undefined) {
        sql = 'SELECT id_universidade, nome_curso, site, nome_campus FROM campus, curso, universidade, campus_has_curso WHERE id_curso = curso_id_curso AND universidade_id_universidade = id_universidade AND nome_curso = "' + selecoes.cbCurso + '" AND universidade_id_universidade = campus_universidade_id_universidade AND campus_address_cep = address_cep;';
    } else if (selecoes.cbState == undefined && selecoes.cbUni == undefined && selecoes.cbCurso == undefined && selecoes.privado != undefined) {
        sql = 'SELECT * FROM universidade WHERE privada = "' + (selecoes.privado == 'privado' ? "1" : "0") + '";';
    } else if (selecoes.cbState != undefined && selecoes.cbUni == undefined && selecoes.cbCurso != undefined && selecoes.privado == undefined) {
        sql = 'SELECT id_universidade, nome_universidade, site, nome_estado, nome_curso FROM universidade, cidade, campus, address, estado, campus_has_curso, curso WHERE id_universidade = universidade_id_universidade AND address_cep = cep AND cidade_id_cidade = id_cidade AND estado_sigla_estado = sigla_estado AND universidade_id_universidade = campus_universidade_id_universidade AND address_cep = campus_address_cep AND id_curso = curso_id_curso AND sigla_estado="' + selecoes.cbState + '" AND nome_curso="' + selecoes.cbCurso + '";';
    } else if (selecoes.cbState != undefined && selecoes.cbUni == undefined && selecoes.cbCurso == undefined && selecoes.privado != undefined) {
        sql = 'SELECT id_universidade, nome_campus, site, nome_estado FROM universidade, cidade, campus, address, estado WHERE id_universidade = universidade_id_universidade AND address_cep = cep AND cidade_id_cidade = id_cidade AND estado_sigla_estado = sigla_estado AND privada = "' + (selecoes.privado == 'privado' ? "1" : "0") + '" AND sigla_estado = "' + selecoes.cbState + '";';
    } else if (selecoes.cbState == undefined && selecoes.cbUni != undefined && selecoes.cbCurso != undefined && selecoes.privado == undefined) {
        sql = 'SELECT id_universidade, nome_curso, site, nome_campus FROM universidade, campus, curso, campus_has_curso WHERE id_curso = curso_id_curso AND universidade_id_universidade = campus_universidade_id_universidade AND universidade_id_universidade = id_universidade AND campus_address_cep = address_cep AND sigla_universidade = "' + selecoes.cbUni + '" AND nome_curso = "' + selecoes.cbCurso + '";';
    } else if (selecoes.cbState == undefined && selecoes.cbUni == undefined && selecoes.cbCurso != undefined && selecoes.privado != undefined) {
        sql = 'SELECT id_universidade, nome_curso, site, nome_campus FROM carolinemarques_graduation.campus, universidade, curso, campus_has_curso WHERE id_curso = curso_id_curso AND universidade_id_universidade = campus_universidade_id_universidade AND campus_address_cep = address_cep AND universidade_id_universidade = id_universidade AND universidade_id_universidade = id_universidade AND privada = "' + (selecoes.privado == 'privado' ? "1" : "0") + '"AND nome_curso = "' + selecoes.cbCurso + '";';
    } else if (selecoes.cbState != undefined && selecoes.cbUni == undefined && selecoes.cbCurso != undefined && selecoes.privado != undefined) {
        sql = 'SELECT id_universidade, sigla_estado, nome_curso, nome_campus, site FROM campus, estado, cidade, universidade, curso, campus_has_curso, address WHERE id_curso = curso_id_curso AND cidade_id_cidade = id_cidade AND estado_sigla_estado = sigla_estado AND universidade_id_universidade = campus_universidade_id_universidade AND campus_address_cep = address_cep AND cep = address_cep AND universidade_id_universidade = id_universidade AND privada = "' + (selecoes.privado == 'privado' ? "1" : "0") + '" AND sigla_estado = "' + selecoes.cbState + '" AND nome_curso = "' + selecoes.cbCurso + '";';
    }
    if (sql != "") {
        conexao.query(sql, (erro, resultado) => {
            if (erro) {
                console.log(erro);
            } else {
                var expressaoRegular = /var filtro.*;/;
                // Substitui a variável no HTML
                novoHtmlContent = htmlContent.replace(
                    expressaoRegular, // A variável que você deseja substituir
                    `var filtro = ${JSON.stringify(resultado)};`// O JSON que substituirá a variável
                );
                htmlContent = novoHtmlContent;
                fs.writeFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', novoHtmlContent, 'utf8');
                res.redirect('/filtrar');
            }
        });
    } else {
        res.redirect('/filtrar');
    }
});

app.get('/filtrar', function (req, res) {
    onde = "";

    var htmlContent = fs.readFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', 'utf8');
    var novoHtmlContent = fs.readFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', 'utf8');
    const sql1 = 'SELECT sigla_estado FROM estado;';
    // Adicione as opções com base nos dados recebidos
    conexao.query(sql1, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            // Aqui, você pode substituir a variável `dados` pelo JSON desejado
            var expressaoRegular = /var lista.*;/;
            // Substitui a variável no HTML
            novoHtmlContent = htmlContent.replace(
                expressaoRegular, // A variável que você deseja substituir
                `var lista = ${JSON.stringify(resultado)};`// O JSON que substituirá a variável
            );
        }
    });
    const sql2 = 'SELECT nome_curso FROM curso;';
    // Adicione as opções com base nos dados recebidos
    conexao.query(sql2, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            // Aqui, você pode substituir a variável `dados` pelo JSON desejado
            var expressaoRegular = /var lista2.*;/;
            // Substitui a variável no HTML
            novoHtmlContent = htmlContent.replace(
                expressaoRegular, // A variável que você deseja substituir
                `var lista2 = ${JSON.stringify(resultado)};`// O JSON que substituirá a variável
            );
            htmlContent = novoHtmlContent;
        }
    });
    const sql3 = 'SELECT sigla_universidade FROM universidade;';
    // Adicione as opções com base nos dados recebidos
    conexao.query(sql3, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            // Aqui, você pode substituir a variável `dados` pelo JSON desejado
            var expressaoRegular = /var lista3.*;/;
            // Substitui a variável no HTML
            novoHtmlContent = htmlContent.replace(
                expressaoRegular, // A variável que você deseja substituir
                `var lista3 = ${JSON.stringify(resultado)};`// O JSON que substituirá a variável
            );
            htmlContent = novoHtmlContent;
        }
    });
    if (refresh == 0) {
        var expressaoRegular2 = /var filtro.*;/;
        // Substitui a variável no HTML
        novoHtmlContent = htmlContent.replace(
            expressaoRegular2, // A variável que você deseja substituir
            `var filtro = ${JSON.stringify("")};`// O JSON que substituirá a variável
        );
        htmlContent = novoHtmlContent;
    }
    refresh++;
    fs.writeFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagfiltragem.ejs', novoHtmlContent, 'utf8');
    var errinho = "";
    if (erros == true) {
        errinho = "Dados inválidos";
    }
    if (verificarlogin != "") {
        res.render('../views/pagfiltragem', { tagValue: '#', tagErro: "Necessário realizar o login" });
        verificarlogin = "";
    } else if (!logado) {
        res.render('../views/pagfiltragem', { tagValue: '#', tagErro: errinho });
    } else if (logado && admin == "0") {
        res.render('../views/pagfiltragem', { tagValue: '/user', tagErro: errinho });
    } else {
        res.render('../views/pagfiltragem', { tagValue: '/admin', tagErro: errinho });;
    }
});

app.get('/user', function (req, res) {
    var htmlContent = fs.readFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagperfiluser.ejs', 'utf8');;
    var novoHtmlContent = fs.readFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagperfiluser.ejs', 'utf8');;
    var sql = "SELECT id_universidade, nome_universidade, sigla_universidade, site, privada FROM carolinemarques_graduation.universidade_has_login, universidade, login WHERE id_universidade = universidade_id_universidade AND email = login_email AND email = '" + emai + "';";
    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            console.log(resultado);
            var expressaoRegular = /var filtro.*;/;
            // Substitui a variável no HTML
            novoHtmlContent = htmlContent.replace(
                expressaoRegular, // A variável que você deseja substituir
                `var filtro = ${JSON.stringify(resultado)};`// O JSON que substituirá a variável
            );
            htmlContent = novoHtmlContent;
            fs.writeFileSync('C:/Users/LOUISE/OneDrive/DW Projeto Final/Academix/views/pagperfiluser.ejs', novoHtmlContent, 'utf8');
            if (logado && admin == "0") {
                res.render('../views/pagperfiluser', {
                    tagNome: nome,
                    tagEmail: emai,
                    tagSenha: pass
                });
            } else if (admin == "1") {
                res.redirect('/admin')
            } else {
                res.redirect('/');
            }
        }
    });
});

app.get('/admin', (req, res) => {
    if ((logado == true) && (admin == "1")) {
        res.render("../views/admin");
    } else {
        res.redirect("/");
    }
});

app.get('/logout', (req, res) => {
    logado = false;
    res.redirect("/");
});

app.post('/delete', (req, res) => {
    const email = req.body;
    const sql = 'DELETE FROM `carolinemarques_graduation`.`universidade_has_login` WHERE (`login_email` = "'+email.email+'");';
    console.log(sql);
    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            console.log(resultado);
        }
    });
    sql = 'DELETE FROM `carolinemarques_graduation`.`login` WHERE (`email` = "' + email.email + '");';
    console.log(sql);
    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            logado = false;
            res.redirect('/');
        }
    });
});

app.post('/update', (req, res) => {
    const email = req.body;
    console.log(email);
    const sql = 'UPDATE `carolinemarques_graduation`.`login` SET `senha` = "' + email.password + '", `nome` = "' + email.nome + '" WHERE (`email` = "' + email.email + '");';
    console.log(sql);
    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            nome = email.nome;
            pass = email.password;
            res.redirect('/user');
        }
    });
});

app.post('/favoritos', (req, res) => {
    const selecoes = req.body;
    if (selecoes.length == 0) {
        res.redirect("/filtrar");
    } else if (logado == false) {
        verificarlogin = "nop";
        res.redirect("/filtrar");
    } else {
        console.log(selecoes);
        for (let chave in selecoes) {
            if (selecoes[chave] == 'on') {
                var x = "site" + chave;
                const sql = 'SELECT * FROM carolinemarques_graduation.universidade WHERE `site` = "' + selecoes[x] + '";';
                conexao.query(sql, (erro, resultado) => {
                    if (erro) {
                        console.log(erro);
                    } else {
                        console.log(resultado[0]);
                        const sql1 = 'INSERT INTO `carolinemarques_graduation`.`universidade_has_login` (`universidade_id_universidade`, `login_email`) VALUES ("' + (resultado[0].id_universidade) + '", "' + emai + '");';
                        conexao.query(sql1, (erro1, resultado1) => {
                            if (erro1) {
                                console.log(erro1);
                                
                            } else {
                                console.log(resultado1);
                                
                            }
                        });
                    }
                });

            }
        }
        res.redirect('/filtrar');
    }
});

app.post('/deletefav', (req, res) => {
    const email = req.body;
    var s = "";
    console.log(email);
    for (let chave in email) {
        s = chave;
    }
    const sql = 'DELETE FROM `carolinemarques_graduation`.`universidade_has_login` WHERE (`universidade_id_universidade` = "' + s + '") and (`login_email` = "' + emai + '");';
    console.log(sql);
    conexao.query(sql, (erro, resultado) => {
        if (erro) {
            console.log(erro);
        } else {
            res.redirect('/user');
        }
    });
});

app.addListener

export default app;