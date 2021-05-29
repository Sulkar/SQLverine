import $ from "jquery";
import { Tab, Modal } from "bootstrap";
import initSqlJs from "sql.js";
import { VerineDatabase } from "./VerineDatabase";
import sqlVerineEditor from "./SqlVerineEditor"



//global variables
var NR = 0;
var NEXT_ELEMENT_NR = 0;
var CURRENT_SELECTED_ELEMENT = undefined;
var CURRENT_SELECTED_SQL_ELEMENT = "START";
var ACTIVE_CODE_VIEW_DATA; // JSON Data holder
var USED_TABLES = []; // listet alle genutzten Tabellen einer DB auf, um SELECTs entsprechend zu befüllen
var CURRENT_VERINE_DATABASE;
var DATABASE_ARRAY = [];
var CURRENT_EXERCISE_ID;
var CURRENT_EXERCISE;


var CURRENT_DATABASE_INDEX = 0;
DATABASE_ARRAY.push(new VerineDatabase("Grundschule.db", null, "server"));
DATABASE_ARRAY.push(new VerineDatabase("SchuleInfo.db", null, "server"));


// für Übungen zum Überprüfen der Eingaben
var SOLUTION_ALL_ARRAY = [];
var SOLUTION_ROW_COUNTER = 0;


//////////
// INIT //
handleUrlParameters();

////////////
// EVENTS //

$(".tab-pane").on("click", ".btnInputCheckExercise", function () {
    //ist die Eingabe vom Inputfeld im exerciseSolutionArray der Übung?
    if (CURRENT_VERINE_DATABASE.isInExerciseSolutionArray(CURRENT_EXERCISE.answerObject.exerciseSolutionArray, $(".input-check").val())) {
        CURRENT_EXERCISE.geloest = 1;
        if ($(".tab-pane.active").attr("id") != "nav-mission") {
            $("#outputInfo").html("<div class='text-center'><button id='btnExerciseSuccess' class=' btn btn-outline-success ' data-toggle='tooltip' data-placement='top'>Super, weiter gehts!</button></div>");
        }
        updateExercise();
    } else {
        $("#outputInfo").html("<p style='color:red;'>Leider falsch! Probiere es nochmal!</p>");
    }
});

$(".outputArea").on("click", "#btnExerciseNext", function () {
    let tab = new Tab(document.querySelector('#nav-mission-tab'));
    tab.show();
});

$(".outputArea").on("click", "#btnExerciseSuccess", function () {
    let tab = new Tab(document.querySelector('#nav-mission-tab'));
    tab.show();
});

$(".tab-content #nav-mission").on("click", ".btnNextExercise", function () {
    CURRENT_EXERCISE_ID = CURRENT_VERINE_DATABASE.getNextExercise(CURRENT_EXERCISE_ID);
    if (CURRENT_EXERCISE_ID != null) {
        CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
        updateExercise();
    }
});

//Button: öffnet ein Modal für das anzeigen des atkuellen URLStrings.    
$("#btnCreateUrl").click(function () {
    let sqlVerineUrl = location.protocol + '//' + location.host + location.pathname;
    let urlDatabase = CURRENT_VERINE_DATABASE.name;
    let urlCode = escape($(".codeArea pre code").html().replaceAll("active", ""));
    let urlParameterString = sqlVerineUrl + "?db=" + urlDatabase + "&maxElementNr=" + NR + "&code=" + urlCode;
    let modal = new Modal(document.getElementById('universal-modal'));
    modal.toggle();
    $("#universal-modal .modal-title").html("Link zum aktuellen Code:");
    $("#universal-modal .modal-body").html("<textarea type='text' id='inputCreateUrl' class='form-control input-check' aria-label='' aria-describedby=''>" + urlParameterString + "</textarea>");
    $("#universal-modal .modal-footer").html('<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">schließen</button> <button type="button" id="btnCopyLink" class="btn btn-primary">Link kopieren</button>');
});
$("#universal-modal").on('click', '#btnCopyLink', function () {
    let copyUrl = document.getElementById("inputCreateUrl");
    copyUrl.select();
    copyUrl.setSelectionRange(0, 99999); /* For mobile devices */
    //kopiert den selektierten Text in die Zwischenablage
    document.execCommand("copy");
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





// Button: WHERE ___ ___ ___ 
$(".buttonArea.codeComponents").on('click', '.btnWhere', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementWHERE = "<span class='codeline'>";
    elementWHERE += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='WHERE'>WHERE";
    NR++;
    elementWHERE += addLeerzeichen();
    elementWHERE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='WHERE_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementWHERE += addLeerzeichen();
    elementWHERE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='WHERE_2' data-next-element='" + (NR + 2) + "'>___</span>";
    NR++;
    elementWHERE += addLeerzeichen();
    elementWHERE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='WHERE_3' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementWHERE += "</span></span>";

    if (CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
        CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementWHERE);
    } else {
        CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementWHERE);
    }

    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: JOIN ___ ON ___ ___ ___ 
$(".buttonArea.codeComponents").on('click', '.btnJoin', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementJOIN = "<span class='codeline'>";
    elementJOIN += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='JOIN'>JOIN";
    NR++;
    elementJOIN += addLeerzeichen();
    elementJOIN += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='JOIN_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementJOIN += addLeerzeichen();
    elementJOIN += "<span class='codeElement_" + NR + "' data-goto-element='" + (NR - 4) + "'>ON</span>";
    NR++;
    elementJOIN += addLeerzeichen();
    elementJOIN += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='JOIN_2' data-next-element='" + (NR + 2) + "'>___</span>";
    NR++;
    elementJOIN += addLeerzeichen();
    elementJOIN += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='JOIN_3' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementJOIN += addLeerzeichen();
    elementJOIN += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='JOIN_4' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementJOIN += "</span></span>";

    if (CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
        CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementJOIN);
    } else {
        CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementJOIN);
    }
    setSelection(NEXT_ELEMENT_NR, false);
});

//Button: AND
$(".buttonArea.codeComponents").on('click', '.btnAND', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var parentSqlIdentifier = CURRENT_SELECTED_ELEMENT.data("sql-element");
    var elementWhereAND = "";
    elementWhereAND += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='AND'>";
    NR++;
    elementWhereAND += addLeerzeichen();
    elementWhereAND += "AND";
    elementWhereAND += addLeerzeichen();
    elementWhereAND += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_AND_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementWhereAND += addLeerzeichen();
    elementWhereAND += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_AND_2' data-next-element='" + (NR + 2) + "'>___</span>";
    NR++;
    elementWhereAND += addLeerzeichen();
    elementWhereAND += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_AND_3' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementWhereAND += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementWhereAND);
    setSelection(NEXT_ELEMENT_NR, false);
});

//Button: OR
$(".buttonArea.codeComponents").on('click', '.btnOR', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var parentSqlIdentifier = CURRENT_SELECTED_ELEMENT.data("sql-element");
    var elementWhereOR = "";
    elementWhereOR += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='OR'>";
    NR++;
    elementWhereOR += addLeerzeichen();
    elementWhereOR += "OR";
    elementWhereOR += addLeerzeichen();
    elementWhereOR += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_OR_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementWhereOR += addLeerzeichen();
    elementWhereOR += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_OR_2' data-next-element='" + (NR + 2) + "'>___</span>";
    NR++;
    elementWhereOR += addLeerzeichen();
    elementWhereOR += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_OR_3' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementWhereOR += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementWhereOR);
    setSelection(NEXT_ELEMENT_NR, false);
});

//Button: LeftBracket
$(".buttonArea.codeComponents").on('click', '.btnLeftBracket', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    if (CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {
        CURRENT_SELECTED_ELEMENT.before("<span class='codeElement_" + NR + "  " + classesFromCodeComponent + " sqlIdentifier extended' data-sql-element='LEFTBRACKET'> ( </span>");
        NR++;
    }
});
//Button: RightBracket
$(".buttonArea.codeComponents").on('click', '.btnRightBracket', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    if (CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {
        CURRENT_SELECTED_ELEMENT.after("<span class='codeElement_" + NR + "  " + classesFromCodeComponent + " sqlIdentifier extended' data-sql-element='RIGHTBRACKET'> ) </span>");
        NR++;
    }
});

// Button: ORDER BY ___ 
$(".buttonArea.codeComponents").on('click', '.btnOrder', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementORDER = "";
    elementORDER += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='ORDER'>";
    NR++;
    elementORDER += addLeerzeichen();
    elementORDER += "ORDER BY";
    elementORDER += addLeerzeichen();
    elementORDER += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='ORDER_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementORDER += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementORDER);
    setSelection(NEXT_ELEMENT_NR, false);
});

//Button: ASC
$(".buttonArea.codeComponents").on('click', '.btnAsc', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementOrderAsc = "";
    elementOrderAsc += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='ASC'>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementOrderAsc += addLeerzeichen();
    elementOrderAsc += "ASC";
    elementOrderAsc += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementOrderAsc);
    setSelection(NEXT_ELEMENT_NR, false);
});

//Button: DESC
$(".buttonArea.codeComponents").on('click', '.btnDesc', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementOrderDesc = "";
    elementOrderDesc += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DESC'>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementOrderDesc += addLeerzeichen();
    elementOrderDesc += "DESC";
    elementOrderDesc += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementOrderDesc);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: LIMIT ___ 
$(".buttonArea.codeComponents").on('click', '.btnLimit', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementLIMIT = "";
    elementLIMIT += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='LIMIT'>";
    NR++;
    elementLIMIT += addLeerzeichen();
    elementLIMIT += "LIMIT";
    elementLIMIT += addLeerzeichen();
    elementLIMIT += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='LIMIT_1' >___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementLIMIT += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementLIMIT);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: OFFSET ___ 
$(".buttonArea.codeComponents").on('click', '.btnOffset', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementOFFSET = "";
    elementOFFSET += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='OFFSET'>";
    NR++;
    elementOFFSET += addLeerzeichen();
    elementOFFSET += "OFFSET";
    elementOFFSET += addLeerzeichen();
    elementOFFSET += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='OFFSET_1' >___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementOFFSET += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementOFFSET);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: GROUP BY ___ 
$(".buttonArea.codeComponents").on('click', '.btnGroup', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementGROUP = "";
    elementGROUP += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='GROUP'>";
    NR++;
    elementGROUP += addLeerzeichen();
    elementGROUP += "GROUP BY";
    elementGROUP += addLeerzeichen();
    elementGROUP += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='GROUP_1'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementGROUP += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementGROUP);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: HAVING ___ ___ ___ = like WHERE but can handle Aggregate functions
$(".buttonArea.codeComponents").on('click', '.btnHaving', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementHAVING = "<span class='codeline'>";
    elementHAVING += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='HAVING'>";
    NR++;
    elementHAVING += "HAVING";
    elementHAVING += addLeerzeichen();
    elementHAVING += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='HAVING_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementHAVING += addLeerzeichen();
    elementHAVING += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='HAVING_2' data-next-element='" + (NR + 2) + "'>___</span>";
    NR++;
    elementHAVING += addLeerzeichen();
    elementHAVING += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='HAVING_3' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementHAVING += "</span>";

    if (CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
        CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementHAVING);
    } else {
        CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementHAVING);
    }

    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: DELETE FROM ___ 
$(".buttonArea.codeComponents").on('click', '.btnSQLDelete', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementDELETE_FROM = "<span class='codeline'>";
    elementDELETE_FROM += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DELETE_FROM'>";
    NR++;
    elementDELETE_FROM += "DELETE FROM";
    elementDELETE_FROM += addLeerzeichen();
    elementDELETE_FROM += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='DELETE_FROM_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementDELETE_FROM += "</span></span>";

    $('.codeArea.editor pre code').append(elementDELETE_FROM);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: UPDATE ___ SET ___ = ___ 
$(".buttonArea.codeComponents").on('click', '.btnUpdate', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementUPDATE = "<span class='codeline'>";
    elementUPDATE += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='UPDATE'>UPDATE";
    NR++;
    elementUPDATE += addLeerzeichen();
    elementUPDATE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='UPDATE_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementUPDATE += addLeerzeichen();
    elementUPDATE += "<span class='codeElement_" + NR + "' data-goto-element='" + (NR - 4) + "'>SET</span>";
    NR++;
    elementUPDATE += addLeerzeichen();
    elementUPDATE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='UPDATE_2' data-next-element='" + (NR + 2) + "'>___</span>";
    NR++;
    elementUPDATE += addLeerzeichen();
    elementUPDATE += "<span class='codeElement_" + NR + "' data-goto-element='" + (NR - 8) + "'> = </span>";
    NR++;
    elementUPDATE += addLeerzeichen();
    elementUPDATE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='UPDATE_3' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementUPDATE += "</span></span>";

    $('.codeArea.editor pre code').append(elementUPDATE);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: INSERT INTO ___ (___) VALUES (___) 
$(".buttonArea.codeComponents").on('click', '.btnInsert', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementINSERT = "<span class='codeline'>";
    elementINSERT += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='INSERT'>INSERT INTO";
    NR++;
    elementINSERT += addLeerzeichen();
    elementINSERT += "<span class='codeElement_" + NR + " inputField unfilled root insert1 sqlIdentifier' data-sql-element='INSERT_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementINSERT += addLeerzeichen();

    elementINSERT += "<span class='codeElement_" + NR + " sqlIdentifier extended'>(</span>";
    NR++;

    elementINSERT += "<span class='codeElement_" + NR + " inputField unfilled extended insert2 sqlIdentifier' data-sql-element='INSERT_2' data-next-element='" + (NR + 2) + "' data-element-group='" + (NR - 2) + "," + (NR - 1) + "," + (NR + 1) + "'>___</span>";
    NR++;

    elementINSERT += "<span class='codeElement_" + NR + " sqlIdentifier extended'>)</span>";
    NR++;

    elementINSERT += addLeerzeichen();
    elementINSERT += "<span class='codeElement_" + NR + "' data-goto-element='" + (NR - 6) + "'>VALUES</span>";
    NR++;
    elementINSERT += addLeerzeichen();
    elementINSERT += "(<span class='codeElement_" + NR + " inputField unfilled root insert3 sqlIdentifier' data-sql-element='INSERT_3' data-next-element='" + (NR - 4) + "'>___</span>)";
    NR++;
    elementINSERT += "</span></span>";

    $('.codeArea.editor pre code').append(elementINSERT);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: DROP TABLE ___ 
$(".buttonArea.codeComponents").on('click', '.btnDropTable', function () {
    let classesFromCodeComponent = getClassesFromElementAsString(this);
    let elementDROP_TABLE = "<span class='codeline'>";
    elementDROP_TABLE += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DROP_TABLE'>";
    NR++;
    elementDROP_TABLE += "DROP TABLE";
    elementDROP_TABLE += addLeerzeichen();
    elementDROP_TABLE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='DROP_TABLE_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementDROP_TABLE += "</span></span>";

    $('.codeArea.editor pre code').append(elementDROP_TABLE);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: ALTER TABLE ___ 
$(".buttonArea.codeComponents").on('click', '.btnAlterTable', function () {
    let classesFromCodeComponent = getClassesFromElementAsString(this);
    let elementALTER_TABLE = "<span class='codeline'>";
    elementALTER_TABLE += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='ALTER_TABLE'>";
    NR++;
    elementALTER_TABLE += "ALTER TABLE";
    elementALTER_TABLE += addLeerzeichen();
    elementALTER_TABLE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='ALTER_TABLE_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementALTER_TABLE += "</span></span>";

    $('.codeArea.editor pre code').append(elementALTER_TABLE);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: DROP COLUMN ___ 
$(".buttonArea.codeComponents").on('click', '.btnDropColumn', function () {
    let classesFromCodeComponent = getClassesFromElementAsString(this);
    let elementDROP_COLUMN = "";
    elementDROP_COLUMN += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DROP_COLUMN'>";
    NR++;
    elementDROP_COLUMN += addLeerzeichen();
    elementDROP_COLUMN += "DROP COLUMN";
    elementDROP_COLUMN += addLeerzeichen();
    elementDROP_COLUMN += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='DROP_COLUMN_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementDROP_COLUMN += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementDROP_COLUMN);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: RENAME ___ TO ___ 
$(".buttonArea.codeComponents").on('click', '.btnRenameTo', function () {
    let classesFromCodeComponent = getClassesFromElementAsString(this);
    let elementRENAME_TO = "";
    elementRENAME_TO += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='RENAME_TO'>";
    NR++;
    elementRENAME_TO += addLeerzeichen();
    elementRENAME_TO += "RENAME";
    elementRENAME_TO += addLeerzeichen();
    elementRENAME_TO += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='RENAME_TO_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementRENAME_TO += addLeerzeichen();
    elementRENAME_TO += "<span class='codeElement_" + NR + "' data-goto-element='" + (NR - 6) + "'>TO</span>";
    NR++;
    elementRENAME_TO += addLeerzeichen();
    elementRENAME_TO += "<span class='codeElement_" + NR + " inputField unfilled root insert2 sqlIdentifier' data-sql-element='RENAME_TO_2' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementRENAME_TO += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementRENAME_TO);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: ADD ___ ___ (TYP) 
$(".buttonArea.codeComponents").on('click', '.btnAddColumn', function () {
    let classesFromCodeComponent = getClassesFromElementAsString(this);
    let elementADD_COLUMN = "";
    elementADD_COLUMN += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='ADD_COLUMN'>";
    NR++;
    elementADD_COLUMN += addLeerzeichen();
    elementADD_COLUMN += "ADD";
    elementADD_COLUMN += addLeerzeichen();
    elementADD_COLUMN += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='ADD_COLUMN_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementADD_COLUMN += addLeerzeichen();
    elementADD_COLUMN += "<span class='codeElement_" + NR + " inputField unfilled root insert2 sqlIdentifier' data-sql-element='ADD_COLUMN_2' data-next-element='" + (NR - 4) + "'>___</span>";
    NR++;
    elementADD_COLUMN += "</span>";

    CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementADD_COLUMN);
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: CREATE TABLE ___ (
$(".buttonArea.codeComponents").on('click', '.btnCreateTable', function () {
    let classesFromCodeComponent = getClassesFromElementAsString(this);
    let elementCREATE_TABLE = "<span class='codeline'>";
    elementCREATE_TABLE += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='CREATE_TABLE'>";
    NR++;
    elementCREATE_TABLE += "CREATE TABLE";
    elementCREATE_TABLE += addLeerzeichen();
    elementCREATE_TABLE += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_TABLE_1' data-next-element='" + (NR + 2) + "'>___</span> (";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementCREATE_TABLE += "</span></span>";

    //
    elementCREATE_TABLE += "<span class='codeline'>";
    elementCREATE_TABLE += "<span class='codeElement_" + NR + " sqlIdentifier extended' data-sql-element='CREATE_END_BRACKET'>)</span>";
    NR++;
    elementCREATE_TABLE += "</span>";

    $('.codeArea.editor pre code').append(elementCREATE_TABLE);
    setSelection(NEXT_ELEMENT_NR, false);
});
// Button: CREATE... spaltenname TYP EINSCHRÄNKUNG 
$(".buttonArea.codeComponents").on('click', '.btnCreateColumn', function () {
    var classesFromCodeComponent = getClassesFromElementAsString(this);
    var elementCREATE_COLUMN = "<span class='codeline'>";
    elementCREATE_COLUMN += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields createComma' data-sql-element='CREATE_COLUMN'>";
    NR++;
    elementCREATE_COLUMN += addLeerzeichen();
    elementCREATE_COLUMN += addLeerzeichen();
    elementCREATE_COLUMN += addLeerzeichen();
    elementCREATE_COLUMN += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_COLUMN_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;

    elementCREATE_COLUMN += addLeerzeichen();
    elementCREATE_COLUMN += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_COLUMN_2' data-next-element='" + (NR + 2) + "'>___</span>";
    NR++;

    elementCREATE_COLUMN += addKomma();
    elementCREATE_COLUMN += "</span>";
    elementCREATE_COLUMN += "</span>";

    if (CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
        CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementCREATE_COLUMN);
    } else {
        CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementCREATE_COLUMN);
    }

    //passt Kommas an
    cleanSQLCode();
    setSelection(NEXT_ELEMENT_NR, false);
});

// Button: CREATE... FOREIGN KEY spalte REFERENCES tabelle (spalte) 
$(".buttonArea.codeComponents").on('click', '.btnCreateForeignKey', function () {
    let classesFromCodeComponent = getClassesFromElementAsString(this);
    let elementFOREIGN_KEY = "<span class='codeline'>";;
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields createComma' data-sql-element='CREATE_FOREIGN_KEY'>";
    NR++;
    elementFOREIGN_KEY += addLeerzeichen();
    elementFOREIGN_KEY += addLeerzeichen();
    elementFOREIGN_KEY += addLeerzeichen();
    elementFOREIGN_KEY += "FOREIGN KEY";
    elementFOREIGN_KEY += addLeerzeichen();
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + " sqlIdentifier extended'>(</span>";
    NR++;
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_FOREIGN_KEY_1' data-next-element='" + (NR + 2) + "'>___</span>";
    NEXT_ELEMENT_NR = NR;
    NR++;
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + " sqlIdentifier extended'>)</span>";
    NR++;
    elementFOREIGN_KEY += addLeerzeichen();
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + "' data-goto-element='" + (NR - 9) + "'>REFERENCES</span>";
    NR++;
    elementFOREIGN_KEY += addLeerzeichen();
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_FOREIGN_KEY_2' data-next-element='" + (NR + 2) + "'>___</span>";
    NR++;
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + " sqlIdentifier extended'>(</span>";
    NR++;
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + " inputField unfilled extended insert2 sqlIdentifier' data-sql-element='CREATE_FOREIGN_KEY_3' data-next-element='" + (NR + 2) + "' data-element-group=''>___</span>";
    NR++;
    elementFOREIGN_KEY += "<span class='codeElement_" + NR + " sqlIdentifier extended'>)</span>";
    NR++;
    elementFOREIGN_KEY += addKomma();
    elementFOREIGN_KEY += "</span>";
    elementFOREIGN_KEY += "</span>";

    if (CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
        CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementFOREIGN_KEY);
    } else {
        CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementFOREIGN_KEY);
    }

    //passt Kommas an
    cleanSQLCode();
    setSelection(NEXT_ELEMENT_NR, false);
});






// Input: add text to Selected Element span
$(".buttonArea.codeComponents").on('keyup', '.codeInput', function (e) {
    if (CURRENT_SELECTED_ELEMENT != undefined) {
        var tempValue = $(this).val();
        if (tempValue != "") {
            if (isNaN(tempValue)) {
                CURRENT_SELECTED_ELEMENT.html("'" + tempValue + "'");
            } else {
                CURRENT_SELECTED_ELEMENT.html(tempValue);
            }
        } else {
            CURRENT_SELECTED_ELEMENT.html("___");
        }
        CURRENT_SELECTED_ELEMENT.addClass("input");
        if (e.key === 'Enter' || e.keyCode === 13) {
            var classesFromCodeComponent = getClassesFromElementAsString(this);
            if (tempValue != "") {
                CURRENT_SELECTED_ELEMENT.removeClass("unfilled");
                CURRENT_SELECTED_ELEMENT.addClass(classesFromCodeComponent);
            } else {
                CURRENT_SELECTED_ELEMENT.addClass("unfilled");
                CURRENT_SELECTED_ELEMENT.removeClass(classesFromCodeComponent);
            }
            setSelection("next", false);
        }
    }
});

// Select: Datenbank wird ausgewählt
$('#selDbChooser').on('change', function () {
    $(".codeArea pre code").html("");

    CURRENT_SELECTED_SQL_ELEMENT = "START";
    CURRENT_DATABASE_INDEX = getIndexOfDatabaseobject(this.value);

    // 1) Datenbank exisitiert und wurde bereits eingelesen
    if (CURRENT_DATABASE_INDEX != null && DATABASE_ARRAY[CURRENT_DATABASE_INDEX].database != null) {
        CURRENT_VERINE_DATABASE = DATABASE_ARRAY[CURRENT_DATABASE_INDEX];

        updateDbChooser(CURRENT_VERINE_DATABASE.name);
        //updateActiveCodeView();

        // zeigt das Datenbankschema an
        $("#schemaArea").html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));

        let exercises = CURRENT_VERINE_DATABASE.getExercises();
        if (exercises.length > 0) {
            //$("#nav-mission").show();
            $("#nav-mission-tab").show();
            CURRENT_EXERCISE_ID = 1;
            CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
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
            ACTIVE_CODE_VIEW_DATA = initObject[1];

            DATABASE_ARRAY.push(createDatabaseObject(uploadedFileName, CURRENT_VERINE_DATABASE, "local"));
            CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

            updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
            $(".codeArea pre code").html("");
            CURRENT_SELECTED_SQL_ELEMENT = "START";

            //updateActiveCodeView();

            // zeigt das Datenbankschema an
            $("#schemaArea").html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));

            let exercises = CURRENT_VERINE_DATABASE.getExercises();
            if (exercises.length > 0) {
                $("#nav-mission-tab").show();
                CURRENT_EXERCISE_ID = 1;
                CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
                updateExercise();
            } else {
                $("#nav-mission-tab").hide();
            }

            //wechselt zum Info Tab
            let someTabTriggerEl = document.querySelector('#nav-info-tab')
            let tab = new Tab(someTabTriggerEl)
            tab.show()

            //debug:
            $("#jquery-code").html(loadFromLocalStorage("tempSqlCommand"));

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
    if (CURRENT_EXERCISE.geloest == 1) {

        $(".exercise-feedback").show();
        $(".exercise-feedback div").html(CURRENT_EXERCISE.feedback);
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
function checkAnswer(answerInput) {
    let solutionRows = CURRENT_EXERCISE.answerObject.rows;
    let solutionStrings = CURRENT_EXERCISE.answerObject.exerciseSolutionArray.length;
    //check solution
    // 1) ausgegebene Zeilen gleich in der Übung angegebenen Zeilen
    // 2) gefundene Values/Elemente größer gleich in der Übung angegebenen Zeilen
    // z.B.: gesucht wird Richard Mayer -> "Richard(lehrer.vornamen)|Mayer(lehrer.nachnamen)&rows=1"
    if (solutionRows == SOLUTION_ROW_COUNTER && solutionStrings == SOLUTION_ALL_ARRAY.length && !answerInput) {
        CURRENT_EXERCISE.geloest = 1;
        $(".outputArea").append("<div class='text-center'><button id='btnExerciseSuccess' class=' btn btn-outline-success ' data-toggle='tooltip' data-placement='top'>Super, weiter gehts!</button></div>");

        updateExercise();
    }
    //inputFeld zur direkten Eingabe der Lösung wird angezeigt.
    else if (answerInput) {
        $(".outputArea").append("<div class='text-center'><div class='input-group mb-3 input-check-exercise'><input type='text' id='input-check' class='form-control input-check' placeholder='Antwort...' aria-label='' aria-describedby=''><button class='btn btn-outline-secondary btnInputCheckExercise' type='button' id='btnInputCheckExercise'>check</button></div></div><div id='outputInfo' class='text-center'></div>");
    }

}


//function: lädt eine DB vom Server
function loadDbFromServer(dbName) {
    init(fetch("data/" + dbName).then(res => res.arrayBuffer())).then(function (initObject) {

        CURRENT_VERINE_DATABASE = new VerineDatabase(dbName, initObject[0], "server");
        ACTIVE_CODE_VIEW_DATA = initObject[1];
        CURRENT_DATABASE_INDEX = getIndexOfDatabaseobject(CURRENT_VERINE_DATABASE.name);
        DATABASE_ARRAY[CURRENT_DATABASE_INDEX] = CURRENT_VERINE_DATABASE;


        ///////////




        sqlVerineEditor.setEditorContainer("SqlVerineEditor");
        sqlVerineEditor.setSchemaContainer("schemaArea");
        sqlVerineEditor.setOutputContainer("outputArea");
        sqlVerineEditor.setOutputContainerMobile("outputAreaMobile");

        sqlVerineEditor.addRunFunction(() => {
            let someTabTriggerEl = document.querySelector('#nav-result-tab');
            let tab = new Tab(someTabTriggerEl);
            tab.show();
        });

        sqlVerineEditor.init(ACTIVE_CODE_VIEW_DATA, CURRENT_VERINE_DATABASE);




        ////////////

        updateDbChooser(CURRENT_VERINE_DATABASE.name);
        //updateActiveCodeView();

        // zeigt das Datenbankschema an
        $("#schemaArea").html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));

        let exercises = CURRENT_VERINE_DATABASE.getExercises();
        if (exercises.length > 0) {
            //$("#nav-mission").show();
            $("#nav-mission-tab").show();
            CURRENT_EXERCISE_ID = 1;
            CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_EXERCISE_ID);
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
            $(".codeArea pre code").html(unescape(urlCode));
            NR = urlMaxElementNr;
        }

    } catch (err) {
        loadDbFromServer("Grundschule.db");
    };
}







function checkElement(value, column) {

    CURRENT_EXERCISE.answerObject.exerciseSolutionArray.forEach(solution => {
        //ist vale im LösungsString
        if (solution.loesungString == value) {
            //ist eine Tabelle im Antwortobjekt definiert ?
            if (solution.table != undefined) {
                //checkt ob der aktuelle Wert in der Tabelle des Antwortobjekt ist
                if (USED_TABLES.includes(solution.table)) {
                    if (solution.column != undefined) {
                        if (solution.column == column) {
                            if (!SOLUTION_ALL_ARRAY.includes(String(value))) SOLUTION_ALL_ARRAY.push(String(value));
                        }
                    } else {
                        if (!SOLUTION_ALL_ARRAY.includes(String(value))) SOLUTION_ALL_ARRAY.push(String(value));
                    }
                }
            }
            //keine Tabelle nötig
            else {
                //ist der aktuelle Wert in der richtigen Spalte?
                if (solution.column != undefined) {
                    if (solution.column == column) {
                        if (!SOLUTION_ALL_ARRAY.includes(String(value))) SOLUTION_ALL_ARRAY.push(String(value));
                    }
                } else {
                    if (!SOLUTION_ALL_ARRAY.includes(String(value))) SOLUTION_ALL_ARRAY.push(String(value));
                }
            }
        }
    });
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


