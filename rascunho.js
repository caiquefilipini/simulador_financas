inputCarteira.setAttribute('data-carteira-real', item.carteira);
let previousValueCarteira = '';
// Adicionar validação para aceitar apenas números com sinal
inputCarteira.addEventListener('input', (e) => {
    // Permitir apenas dígitos, sinal de menos e vírgula/ponto
    // console.log(e)
    const regex = /^-?\d*$/;
    // if (e.key === '-' && this.selectionStart === 0) {
    //     // console.log(this.selectionStart)
    //     return true;
    // } else
    // console.log((!regex.test(e.target.value) && e.target.value !== ''))
    
    console.log((regex.test(e.target.value)))
    if (!regex.test(e.target.value)) {
        // Se não for válido, limpe caracteres inválidos
        // e.target.value = e.target.value.replace(/[^\d]/g, '');
        e.target.value = previousValueCarteira;
    } else {
        // Se for válido, armazene o valor atual
        previousValueCarteira = e.target.value;
    }
    console.log("previous", previousValueCarteira)

});