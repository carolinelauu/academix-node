let sign_login = document.querySelector('#ativarlogin')
let popupfr = document.querySelector('.popup')
let close_btnfr = document.querySelector('.close-btn')
let abrir_cadastro = document.querySelector('#abrir-cadastro')
let popup2 = document.querySelector('.popup2')
let cancelar = document.querySelector('#cancel')
let icone_dois = document.querySelector('#icone2')//botão novo
let abrir_perfil = document.querySelector('#save')//botão salvar do cadastro
let bookmark = document.querySelector('#bookmarkthingy')//botão bookmark sei la como chama

sign_login.addEventListener('click', function () {
    popupfr.classList.add('active')
})
close_btnfr.addEventListener('click', function () {
    popupfr.classList.remove('active')
})
abrir_cadastro.addEventListener('click', function () {
    popup2.classList.add('active')
    popupfr.classList.remove('active')
})
cancelar.addEventListener('click', function () {
    popup2.classList.remove('active')
})
abrir_perfil.addEventListener('click', function () {
    popupfr.classList.remove('active')
})