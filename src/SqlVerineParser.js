
//parse Textarea nach DIV
document.querySelector('#btnParse').addEventListener("click", function () {
    let test = document.querySelector('#sqlToParse').value;
    document.querySelector('#sqlParserOutput').innerHTML = test;
});