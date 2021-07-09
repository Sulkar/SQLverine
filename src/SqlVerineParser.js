var parseElements = [];
var elementIndex = 0;
var parsedOutput = "";

var aggregateOptions = ["AVG", "COUNT", "MIN", "MAX", "SUM"];
var klammerAuf = "<span>(</span>";
var klammerZu = "<span>)</span>";
var leerzeichen = "<span>&nbsp;</span>";
var leerzeichenMitKomma = "<span>,&nbsp;</span>";

//tests
document.querySelector('#sqlToParse').value = "SELECT MAX(id), * FROM schueler WHERE id IN (2,4,5)";

//parse Textarea nach DIV
document.querySelector('#btnParse').addEventListener("click", function () {
    let zuParsendenString = document.querySelector('#sqlToParse').value;

    //
    parseElements = zuParsendenString.split(" ");
    elementIndex = 0;
    parsedOutput = "";
    parse();

});


// SELECT id FROM lehrer
// SELECT id FROM lehrer WHERE id = 5
function parse() {

    if (parseElements.length > elementIndex) {
        switch (parseElements[elementIndex].toUpperCase()) {
            case "SELECT":
                parseSelect()
                break;
            case "WHERE":
                parseWhere()
                break;

            default:
                break;
        }
    }
    document.querySelector('#sqlParserOutput').innerHTML = parsedOutput;
}



function parseSelect() {
    parseElements[elementIndex]; //SELECT
    parsedOutput += "<span>SELECT";
    elementIndex++;
    parsedOutput += leerzeichen;

    while (parseElements[elementIndex].toUpperCase() != "FROM") {
        if (checkElement(parseElements[elementIndex], aggregateOptions) != null) {
            parseAggregate();
        } else {
            let komma = parseElements[elementIndex].includes(",");
            parsedOutput += "<span class='column'>" + parseElements[elementIndex].replaceAll(",", "") + "</span>";
            elementIndex++;
            if (komma) parsedOutput += leerzeichenMitKomma;
            else parsedOutput += leerzeichen;
        }
    }

    parsedOutput += "FROM";
    elementIndex++;
    parsedOutput += leerzeichen;
    parsedOutput += "<span class='table'>" + parseElements[elementIndex] + "</span>";
    parsedOutput += "</span>";
    elementIndex++;
    parsedOutput += leerzeichen;

    parse();
}


// where id = 2
// WHERE id IN (5,4,3,1,6)
// WHERE  ( id = 123 AND vorname = 'Richi' ) OR ( id = 123 AND vorname = 'Benni' )

function parseWhere() {
    parseElements[elementIndex]; //WHERE

    parsedOutput += "<span>WHERE";
    elementIndex++;
    parsedOutput += leerzeichen;

    parsedOutput += "<span class='column'>" + parseElements[elementIndex] + "</span>";
    elementIndex++;
    parsedOutput += leerzeichen;

    //check IN (...
    let IN = parseElements[elementIndex] == "IN" ? true : false;
    parsedOutput += "<span class='operator'>" + parseElements[elementIndex] + "</span>";;
    elementIndex++;
    parsedOutput += leerzeichen;

    if (IN) {
        let inWerte = parseElements[elementIndex].replaceAll("(", "").replaceAll(")", "").split(",");
        parsedOutput += klammerAuf;
        inWerte.forEach((inWert, index) => {
            parsedOutput += "<span class='wert'>" + inWert + "</span>";
            if(index != inWerte.length - 1){ 
                parsedOutput += leerzeichenMitKomma;
            }
            
        });
        parsedOutput += klammerZu;
        elementIndex++;
        parsedOutput += leerzeichen;
    } else {
        parsedOutput += "<span class='wert'>" + parseElements[elementIndex] + "</span>";
        elementIndex++;
        parsedOutput += leerzeichen;
    }

    parse();
}


function parseAggregate() {
    parseElements[elementIndex]; //AVG(...),
    let komma = parseElements[elementIndex].includes(",");
    let currentAggregate = checkElement(parseElements[elementIndex], aggregateOptions);
    let currentElement = parseElements[elementIndex].replaceAll(currentAggregate + "(", "").replaceAll(")", "").replaceAll(",", "");
    parsedOutput += "<span>" + currentAggregate + "(";
    parsedOutput += "<span>" + currentElement + "</span>)</span>";
    elementIndex++;
    if (komma) parsedOutput += leerzeichenMitKomma;
    else parsedOutput += leerzeichen;
}





function checkElement(element, wordsToCheck) { //AVG(id)
    let found = null;
    wordsToCheck.forEach(wordToCheck => {
        if (element.includes(wordToCheck)) {
            found = wordToCheck;
        }
    });
    return found;
}