import $ from "jquery";
import { Tab } from "bootstrap";
import initSqlJs from "sql.js";
import { VerineDatabase } from "./VerineDatabase";
import sqlVerineEditor from "./SqlVerineEditor"
//import { SqlVerineEditor } from "./SqlVerineEditor2"
import 'bootstrap/dist/css/bootstrap.min.css';
import "./css/index.css"

//global variables
var ACTIVE_CODE_VIEW_DATA; // JSON Data holder
var CURRENT_VERINE_DATABASE;
var DATABASE_ARRAY = [];

var CURRENT_DATABASE_INDEX = 0;
DATABASE_ARRAY.push(new VerineDatabase("Grundschule.db", null, "server"));
DATABASE_ARRAY.push(new VerineDatabase("SchuleInfo.db", null, "server"));

//////////
// INIT //

//setup SqlVerineEditor
//var sqlVerineEditor = new SqlVerineEditor();
sqlVerineEditor.setEditorContainer("SqlVerineEditor");
sqlVerineEditor.setSchemaContainer("schemaArea");
sqlVerineEditor.setOutputContainer("outputArea");
sqlVerineEditor.setOutputContainerMobile("outputAreaMobile");
sqlVerineEditor.showCodeButton(true);
sqlVerineEditor.init();

//start
handleUrlParameters();

////////////
// EVENTS //

$(".tab-pane").on("click", ".btnInputCheckExercise", function () {
    //ist die Eingabe vom Inputfeld im exerciseSolutionArray der Übung?
    let CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_VERINE_DATABASE.getCurrentExerciseId());
    if (CURRENT_VERINE_DATABASE.isInExerciseSolutionArray(CURRENT_EXERCISE.answerObject.exerciseSolutionArray, $(".input-check").val())) {
        CURRENT_VERINE_DATABASE.setCurrentExerciseAsSolved();
        if ($(".tab-pane.active").attr("id") != "nav-mission") {
            $("#outputInfo").html("<div class='text-center'><button id='btnExerciseSuccess' class=' btn btn-outline-success ' data-toggle='tooltip' data-placement='top'>Super, weiter gehts!</button></div>");
        }
        updateExercise();
    } else {
        $("#outputInfo").html("<p style='color:red;'>Leider falsch! Probiere es nochmal!</p>");
    }
});

$("#outputArea").on("click", "#btnExerciseNext", function () {
    let tab = new Tab(document.querySelector('#nav-mission-tab'));
    tab.show();
});

$("#outputArea").on("click", "#btnExerciseSuccess", function () {
    let tab = new Tab(document.querySelector('#nav-mission-tab'));
    tab.show();
});

$(".tab-content #nav-mission").on("click", ".btnNextExercise", function () {
    CURRENT_VERINE_DATABASE.getNextExerciseId(CURRENT_VERINE_DATABASE.getCurrentExerciseId());
    updateExercise();
});

// Scrollfortschritt als Dots anzeigen
$(".buttonArea.codeComponents").on('scroll', function () {
    let maxWidth = $(".buttonArea.codeComponents").get(0).scrollWidth;
    let dotCount = Math.ceil($(".buttonArea.codeComponents").get(0).scrollWidth / $(".buttonArea.codeComponents").get(0).clientWidth);
    let scrollIndex = Math.ceil(($(".buttonArea.codeComponents").scrollLeft() + ($(".buttonArea.codeComponents").get(0).clientWidth / 2)) / ((maxWidth / dotCount)));
    $(".codeComponentsScrolldots a").removeClass("activeDot");
    $(".codeComponentsScrolldots a").eq(scrollIndex).addClass("activeDot");

});

//Button ist im Infotab und navigiert den Nutzer zum Aufgabentab
$("#btnGotoExerciseTab").on('click', function () {
    let tab = new Tab(document.querySelector('#nav-mission-tab'));
    tab.show();
});


// Scrolldots bei Klick an Position springen lassen
$(".codeComponentsScrolldots").on('click', 'a', function () {
    var dotCountBefore = $(this).prevAll().length;
    var dotCountAfter = $(this).nextAll().length;
    var maxWidth = $(".buttonArea.codeComponents").get(0).scrollWidth;
    var scrollPos = 0;

    if (dotCountBefore == 0) {
        scrollPos = 0;
    } else if (dotCountAfter == 0) {
        scrollPos = maxWidth;
    } else {
        scrollPos = $(".buttonArea.codeComponents").get(0).clientWidth * dotCountBefore;
    }
    $(".buttonArea.codeComponents").scrollLeft(scrollPos);
});

// Select: Datenbank wird ausgewählt
$('#selDbChooser').on('change', function () {
    $(".codeArea pre code").html("");

    CURRENT_DATABASE_INDEX = getIndexOfDatabaseobject(this.value);

    // 1) Datenbank exisitiert und wurde bereits eingelesen
    if (CURRENT_DATABASE_INDEX != null && DATABASE_ARRAY[CURRENT_DATABASE_INDEX].database != null) {
        CURRENT_VERINE_DATABASE = DATABASE_ARRAY[CURRENT_DATABASE_INDEX];

        //reinit SqlVerineEditor       
        sqlVerineEditor.resetRunFunctions();
        sqlVerineEditor.addRunFunction(() => {
            let someTabTriggerEl = document.querySelector('#nav-result-tab');
            let tab = new Tab(someTabTriggerEl);
            tab.show();
        });
        sqlVerineEditor.addRunFunction(() => {
            if (CURRENT_VERINE_DATABASE.hasExercises()) {
                let CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_VERINE_DATABASE.getCurrentExerciseId());
                checkAnswer(CURRENT_EXERCISE.answerObject.input, sqlVerineEditor.getSolutionAllArray(), sqlVerineEditor.getSolutionRowCounter());
            }
        });
        if (CURRENT_VERINE_DATABASE.hasExercises()) sqlVerineEditor.activateExercises(true);
        else sqlVerineEditor.activateExercises(false);
        sqlVerineEditor.setVerineDatabase(CURRENT_VERINE_DATABASE);
        sqlVerineEditor.reinit();
        ////////////

        updateDbChooser(CURRENT_VERINE_DATABASE.name);
        //updateActiveCodeView();

        // zeigt das Datenbankschema an
        $("#schemaArea").html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));

        if (CURRENT_VERINE_DATABASE.getCurrentExerciseId() != undefined) {
            //$("#nav-mission").show();
            $("#nav-mission-tab").show();
            updateExercise();
        } else {
            //$("#nav-mission").hide();
            $("#nav-mission-tab").hide();
        }

        //wechselt zum Info Tab
        let someTabTriggerEl = document.querySelector('#nav-info-tab')
        let tab = new Tab(someTabTriggerEl)
        tab.show()
    }
    // 2) Datenbank ist auf dem Server und muss noch eingelesen werden
    else if (CURRENT_DATABASE_INDEX != null /*&& DATABASE_ARRAY[CURRENT_DATABASE_INDEX].type == "server"*/) {
        loadDbFromServer(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
    }
});

// Datenbankdatei wurde zum Upload ausgewählt
$("#fileDbUpload").on('change', function () {
    var uploadedFile = this.files[0];

    var fileReader = new FileReader();
    fileReader.onload = function () {
        init(fileReader.result).then(function (initObject) {

            var uploadedFileName = buildDatabaseName(uploadedFile.name, null);

            CURRENT_VERINE_DATABASE = new VerineDatabase(uploadedFileName, initObject[0], "local");
            CURRENT_VERINE_DATABASE.setupExercises();
            ACTIVE_CODE_VIEW_DATA = initObject[1];
            DATABASE_ARRAY.push(CURRENT_VERINE_DATABASE);
            CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

            //reinit SqlVerineEditor       
            sqlVerineEditor.resetRunFunctions();
            sqlVerineEditor.addRunFunction(() => {
                let someTabTriggerEl = document.querySelector('#nav-result-tab');
                let tab = new Tab(someTabTriggerEl);
                tab.show();
            });
            sqlVerineEditor.addRunFunction(() => {
                if (CURRENT_VERINE_DATABASE.hasExercises()) {
                    let CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_VERINE_DATABASE.getCurrentExerciseId());
                    checkAnswer(CURRENT_EXERCISE.answerObject.input, sqlVerineEditor.getSolutionAllArray(), sqlVerineEditor.getSolutionRowCounter());
                }
            });
            if (CURRENT_VERINE_DATABASE.hasExercises()) sqlVerineEditor.activateExercises(true);
            else sqlVerineEditor.activateExercises(false);
            sqlVerineEditor.setVerineDatabase(CURRENT_VERINE_DATABASE);
            sqlVerineEditor.reinit();
            ////////////

            updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);

            // zeigt das Datenbankschema an
            $("#schemaArea").html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));

            if (CURRENT_VERINE_DATABASE.getCurrentExerciseId() != undefined) {
                //$("#nav-mission").show();
                $("#nav-mission-tab").show();
                updateExercise();
            } else {
                //$("#nav-mission").hide();
                $("#nav-mission-tab").hide();
            }

            //wechselt zum Info Tab
            let someTabTriggerEl = document.querySelector('#nav-info-tab')
            let tab = new Tab(someTabTriggerEl)
            tab.show()

        }, function (error) { console.log(error) });
    }
    fileReader.readAsArrayBuffer(uploadedFile);

});

//Button: lädt die aktuell ausgewählte Datenbank herunter
$(".btnDbDownload").click(function () {
    var binaryArray = CURRENT_VERINE_DATABASE.database.export();

    var blob = new Blob([binaryArray]);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = window.URL.createObjectURL(blob);
    a.download = DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name;
    a.onclick = function () {
        setTimeout(function () {
            window.URL.revokeObjectURL(a.href);
        }, 1500);
    };
    a.click();
});

// Button: Info - lässt ein Modal mit dem aktuellen Datenbankschema erscheinen
$(".btnDbInfo").click(function () {
    $("#schemaArea").html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));
});
$(".btnDbInfoMobile").click(function () {
    $("#schemaAreaMobile").html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));

});

// Button: close modal (x - schließen)
$(".btn-close.dbInfoModal").click(function () {
    //$(".codeArea.resultModal pre code").html("");
});
$(".btn.btn-secondary.close.dbInfoModal").click(function () {
    //$(".codeArea.resultModal pre code").html("");
});
// Button: close modal (x - schließen)
$(".btn-close.resultModal").click(function () {
    $(".codeArea.resultModal pre code").html("");
});
$(".btn.btn-secondary.close.resultModal").click(function () {
    $(".codeArea.resultModal pre code").html("");
});


///////////////
// FUNCTIONS //

//function: Datenbank und JSON für active code view werden geladen
async function init(dataPromise) {
    //fetch Database
    const sqlPromise = initSqlJs({
        locateFile: file => `${file}`
    });
    //fetch active code view json
    const activeCodeViewPromise = fetch("data/activeCodeViewData.json");
    const [sql, bufferedDatabase, activeCodeView] = await Promise.all([sqlPromise, dataPromise, activeCodeViewPromise]);

    const jsonData = await activeCodeView.json();

    return [new sql.Database(new Uint8Array(bufferedDatabase)), jsonData];
}

//function: Aktualisierung der Übungen und der Progressbar
function updateExercise() {
    let CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_VERINE_DATABASE.getCurrentExerciseId());
    let allExercises = CURRENT_VERINE_DATABASE.getExerciseOrder();
    let progressBarPercentage = CURRENT_EXERCISE.reihenfolge / allExercises.length * 100;

    $(".progress-bar-exercise").css('width', progressBarPercentage + "%");
    $(".exercise-content .exercise-title").html(CURRENT_EXERCISE.titel);
    //Beschreibung
    if (removeEmptyTags(CURRENT_EXERCISE.beschreibung) != "") {
        $(".exercise-description").show();
        $(".exercise-content .exercise-description").html(CURRENT_EXERCISE.beschreibung);
    } else $(".exercise-description").hide();
    //Aufgabenstellung
    if (removeEmptyTags(CURRENT_EXERCISE.aufgabenstellung) != "") {
        $(".exercise-task").show();
        $(".exercise-content .exercise-task").html(CURRENT_EXERCISE.aufgabenstellung);
    } else $(".exercise-task").hide();
    //Informationen
    if (removeEmptyTags(CURRENT_EXERCISE.informationen) != "") {
        $(".exercise-meta").show();
        $(".exercise-content .exercise-meta").html(CURRENT_EXERCISE.informationen);
    } else $(".exercise-meta").hide();

    //Antworten werden im Log angezeigt -> fürs Testen
    $(".exercise-output").html("");

    $(".exercise-feedback").hide();
    if (CURRENT_EXERCISE.geloest) {
        $(".exercise-feedback").show();
        $(".exercise-feedback-text").html(CURRENT_EXERCISE.feedback);
        $(".exercise-output").append("<div class='text-center'><button id='btnNextExercise' class='btnNextExercise btn btn-outline-success ' data-toggle='tooltip' data-placement='top'>nächste Aufgabe</button></div>");

    } else if (CURRENT_EXERCISE.answerObject.input) {
        $(".exercise-output").html("<div class='text-center'><div class='input-group mb-3 input-check-exercise'><input type='text' id='input-check' class='form-control input-check' placeholder='Antwort...' aria-label='' aria-describedby=''><button class='btn btn-outline-secondary btnInputCheckExercise' type='button' id='btnInputCheckExercise'>check</button></div></div><div id='outputInfo' class='text-center'></div>");
    } //next Button zum weiterspringen zur nächsten Übung wird angezeigt = Einleitungsübung, ohne Abfragen..
    else if (CURRENT_EXERCISE.answerObject.next) {
        $(".exercise-output").append("<div class='text-center'><button id='btnExerciseNext' class='btnNextExercise btn btn-outline-success ' data-toggle='tooltip' data-placement='top'>Weiter</button></div>");
    }
}

//function: entfernt Tags aus Daten von der Datenbank, um zu prüfen ob ein Inhalt vorhanden ist.
function removeEmptyTags(stringToTest) {
    return stringToTest.replaceAll(/[<p>|<br>|</p>|\s]/g, "");
}

//function: Überprüft ob die Antwort richtig ist
function checkAnswer(answerInput, solutionAllArray, solutionRowCounter) {
    let CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_VERINE_DATABASE.getCurrentExerciseId());
    let solutionRows = CURRENT_EXERCISE.answerObject.rows;
    let solutionStrings = CURRENT_EXERCISE.answerObject.exerciseSolutionArray.length;
    //check solution
    // 1) ausgegebene Zeilen gleich in der Übung angegebenen Zeilen
    // 2) gefundene Values/Elemente größer gleich in der Übung angegebenen Zeilen
    // z.B.: gesucht wird Richard Mayer -> "Richard(lehrer.vornamen)|Mayer(lehrer.nachnamen)&rows=1"
    if (solutionRows == solutionRowCounter && solutionStrings == solutionAllArray.length && !answerInput) {
        CURRENT_VERINE_DATABASE.setCurrentExerciseAsSolved();
        $("#outputArea").append("<div class='text-center'><button id='btnExerciseSuccess' class=' btn btn-outline-success ' data-toggle='tooltip' data-placement='top'>Super, weiter gehts!</button></div>");
        updateExercise();
    }
    //inputFeld zur direkten Eingabe der Lösung wird angezeigt.
    else if (answerInput) {
        $("#outputArea").append("<div class='text-center'><div class='input-group mb-3 input-check-exercise'><input type='text' id='input-check' class='form-control input-check' placeholder='Antwort...' aria-label='' aria-describedby=''><button class='btn btn-outline-secondary btnInputCheckExercise' type='button' id='btnInputCheckExercise'>check</button></div></div><div id='outputInfo' class='text-center'></div>");
    }
}

//function: lädt eine DB vom Server
function loadDbFromServer(dbName) {
    init(fetch("data/" + dbName).then(res => res.arrayBuffer())).then(function (initObject) {

        CURRENT_VERINE_DATABASE = new VerineDatabase(dbName, initObject[0], "server");
        CURRENT_VERINE_DATABASE.setupExercises();
        ACTIVE_CODE_VIEW_DATA = initObject[1];
        CURRENT_DATABASE_INDEX = getIndexOfDatabaseobject(CURRENT_VERINE_DATABASE.name);
        DATABASE_ARRAY[CURRENT_DATABASE_INDEX] = CURRENT_VERINE_DATABASE;

        //reinit SqlVerineEditor       
        sqlVerineEditor.resetRunFunctions();
        sqlVerineEditor.addRunFunction(() => {
            let someTabTriggerEl = document.querySelector('#nav-result-tab');
            let tab = new Tab(someTabTriggerEl);
            tab.show();
        });
        sqlVerineEditor.addRunFunction(() => {
            if (CURRENT_VERINE_DATABASE.hasExercises()) {
                let CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_VERINE_DATABASE.getCurrentExerciseId());
                checkAnswer(CURRENT_EXERCISE.answerObject.input, sqlVerineEditor.getSolutionAllArray(), sqlVerineEditor.getSolutionRowCounter());
            }
        });
        if (CURRENT_VERINE_DATABASE.hasExercises()) sqlVerineEditor.activateExercises(true);
        else sqlVerineEditor.activateExercises(false);
        sqlVerineEditor.setVerineDatabase(CURRENT_VERINE_DATABASE);
        sqlVerineEditor.reinit();
        ////////////

        updateDbChooser(CURRENT_VERINE_DATABASE.name);
        //updateActiveCodeView();

        // zeigt das Datenbankschema an
        $("#schemaArea").html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));

        if (CURRENT_VERINE_DATABASE.getCurrentExerciseId() != undefined) {
            //$("#nav-mission").show();
            $("#nav-mission-tab").show();
            updateExercise();
        } else {
            //$("#nav-mission").hide();
            $("#nav-mission-tab").hide();
        }

        //wechselt zum Info Tab
        let someTabTriggerEl = document.querySelector('#nav-info-tab')
        let tab = new Tab(someTabTriggerEl)
        tab.show()

    }, function (error) { console.log(error) });
}

//function: sucht nach Parametern in der URL, wenn gefunden wird zur DB gewechselt und Code geladen
function handleUrlParameters() {
    //Verarbeitet URL Parameter
    const urlQueryString = window.location.search;
    const urlParams = new URLSearchParams(urlQueryString);
    const urlDb = urlParams.get('db');
    const urlMaxElementNr = urlParams.get('maxElementNr');
    const urlCode = urlParams.get('code');
    try {
        if (urlDb != null && urlDb != "") {
            loadDbFromServer(urlDb);
        } else {
            loadDbFromServer("Grundschule.db");
        }
        if (urlCode != null && urlCode != "") {
            //befüllt die Code Area mit Code aus der URL
            sqlVerineEditor.setUrlCodeParameters(urlCode, urlMaxElementNr);
        }

    } catch (err) {
        loadDbFromServer("Grundschule.db");
    };
}

//function: aktualisiert das #selDbChooser select Feld
function updateDbChooser(selected) {
    $("#selDbChooser").html("");
    DATABASE_ARRAY.forEach(element => {
        $("#selDbChooser").append(new Option(element.name, element.name));
    })
    if (selected != null) $("#selDbChooser").val(selected);
}

// function: liefert den Index eines Datenbankobjekts aus dem DATABASE_ARRAY anhand des Namens zurück
function getIndexOfDatabaseobject(databaseName) {
    var indexOfDatabaseobject = null;
    DATABASE_ARRAY.forEach((element, index) => {
        if (element.name == databaseName) {
            indexOfDatabaseobject = index;
        }
    });
    return indexOfDatabaseobject;
}

// function: erstellt ein database Objekt und gibt dieses zurück, wird dann im DATABASE_ARRAY gespeichert
function createDatabaseObject(name, database, type) {
    var databaseObject = {};
    databaseObject.name = name;
    databaseObject.database = database;
    databaseObject.type = type; //server, local, new
    return databaseObject;
}

// function: testet ob es beim Upload eine Datenbank mit dem gleichen Namen gibt, wenn ja, dann wird ein Appendix hinzugefügt
function buildDatabaseName(name, appendix) {
    var found = false;

    if (appendix != null) {
        var nameArray = name.split(".");
        var fileEnding = nameArray[nameArray.length - 1];

        if (appendix == 1) {
            name = name.replace("." + fileEnding, "_" + appendix + "." + fileEnding);
        } else {
            name = name.replace("_" + (appendix - 1) + "." + fileEnding, "_" + appendix + "." + fileEnding);
        }
    }

    DATABASE_ARRAY.forEach(element => {
        if (element.name == name) {
            if (appendix == null) {
                appendix = 1;
            } else {
                appendix++;
            }
            found = true;
        }
    });

    if (found) {
        return buildDatabaseName(name, appendix);
    } else {
        return name;

    }
}

