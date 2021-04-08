$(document).ready(function () {

    //global variables
    var NR = 0;
    var NEXT_ELEMENT_NR = 0;
    var CURRENT_SELECTED_ELEMENT = undefined;
    var CURRENT_SELECTED_SQL_ELEMENT = "START";
    var ACTIVE_CODE_VIEW_DATA; // JSON Data holder
    var USED_TABLES = []; // listet alle genutzten Tabellen einer DB auf, um SELECTs entsprechend zu befüllen
    var CURRENT_SQL_DATABASE; //aktuell geladene DB
    var DATABASE_ARRAY = [];
    var CURRENT_DATABASE_INDEX = 0;
    DATABASE_ARRAY.push(createDatabaseObject("Grundschule.db", null, "server"));
    var CSS_COLOR_ARRAY = ["coral", "tomato", "orange", "gold", "palegreen", "yellowgreen", "mediumaquamarine", "paleturquoise", "skyblue", "cadetblue", "pink", "hotpink", "orchid", "mediumpurple", "lightvoral"];

    // TESTS
    var QUESTION_ARRAY = [];
    var SOLUTION_ALL_ARRAY = [];
    var SOLUTION_ROW_COUNTER = 0;
    var CURRENT_QUESTION_ID = 1;

    function createTasks() {
        var task = {};
        task.id = 1;
        task.question = "Suche alle Schüler, die im Jahr 2013 geboren wurden.";
        task.answer = "2013-07-25|2013-10-25|2013-09-08|2013-06-26|2013-01-17";
        QUESTION_ARRAY.push(task);

        //zeigt Aufgabe an
        $(".tab-content #nav-mission").html(task.question);
    }

    function checkAnswer(taskId) {

        QUESTION_ARRAY.forEach(task => {
            if (task.id == taskId) {
                var currentAnswers = task.answer.split("|");
                var checkSum = currentAnswers.length;
                var currentCheckSum = 0;
                //check solution
                SOLUTION_ALL_ARRAY.forEach(solution => {
                    currentAnswers.forEach(answer => {
                        if (solution == answer) {
                            currentCheckSum++;
                        }
                    });
                });
                if (checkSum == currentCheckSum && SOLUTION_ROW_COUNTER == currentCheckSum) alert("Super, du hast die Aufgabe gelöst.");
            }
        });
    }

    //////////
    // INIT //

    //function: Datenbank und JSON für active code view werden geladen
    async function init(dataPromise) {
        //fetch Database
        const sqlPromise = initSqlJs({
            locateFile: file => `dist/${file}`
        });
        //fetch active code view json
        const activeCodeViewPromise = fetch("data/activeCodeViewData.json");
        const [sql, bufferedDatabase, activeCodeView] = await Promise.all([sqlPromise, dataPromise, activeCodeViewPromise]);
        SQL = sql;
        const jsonData = await activeCodeView.json();

        return [new sql.Database(new Uint8Array(bufferedDatabase)), jsonData];
    }

    // START - erste Datenbank wird geladen und die View wird angepasst
    init(fetch("data/" + DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name).then(res => res.arrayBuffer())).then(function (initObject) {
        CURRENT_SQL_DATABASE = initObject[CURRENT_DATABASE_INDEX];
        ACTIVE_CODE_VIEW_DATA = initObject[1];

        DATABASE_ARRAY[CURRENT_DATABASE_INDEX].database = CURRENT_SQL_DATABASE;

        updateDbChooser();
        updateActiveCodeView();

        // zeigt das Datenbankschema an
        var tempTables = getSqlTables();

        $(".schemaArea").html(createTableInfo(tempTables, "1,2"));
        createTasks();

        //debug:
        $("#jquery-code").html(loadFromLocalStorage("tempSqlCommand"));

    }, function (error) { console.log(error) });

    ////////////
    //   UI   //
    function initScrollDots() {


        var dotCount = Math.ceil($(".buttonArea.codeComponents").get(0).scrollWidth / $(".buttonArea.codeComponents").get(0).clientWidth);
        $(".codeComponentsScrolldots span").html("");
        if (dotCount > 1) {
            for (let index = 0; index < dotCount; index++) {
                if (index == 0) {
                    $(".codeComponentsScrolldots span").append('<a class="activeDot"><svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"> <circle cx="8" cy="8" r="8"/></svg></a>');
                } else {
                    $(".codeComponentsScrolldots span").append('<a><svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"> <circle cx="8" cy="8" r="8"/></svg></a>');
                }

            }
        }

    };


    ////////////
    // EVENTS //

    // Scrollfortschritt als Dots anzeigen
    $(".buttonArea.codeComponents").on('scroll', function () {
        var maxWidth = $(".buttonArea.codeComponents").get(0).scrollWidth;
        var dotCount = Math.ceil($(".buttonArea.codeComponents").get(0).scrollWidth / $(".buttonArea.codeComponents").get(0).clientWidth);


        var scrollIndex = Math.ceil(($(".buttonArea.codeComponents").scrollLeft() + ($(".buttonArea.codeComponents").get(0).clientWidth / 2)) / ((maxWidth / dotCount)));


        $(".codeComponentsScrolldots a").removeClass("activeDot");
        $(".codeComponentsScrolldots a").eq(scrollIndex).addClass("activeDot");

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

    // Button: SELECT ___ FROM ___
    $(".buttonArea.codeComponents").on('click', '.btnSelect', function () {
        var classesFromCodeComponent = getClassesFromElementAsString(this);
        CURRENT_SELECTED_ELEMENT = undefined;
        var elementSELECT_FROM = "<span class='codeline'>";
        elementSELECT_FROM += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " start parent sqlIdentifier inputFields' data-sql-element='SELECT'>SELECT";
        NR++;
        elementSELECT_FROM += addLeerzeichen();
        elementSELECT_FROM += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='SELECT_SELECT' data-next-element='" + (NR + 4) + "'>___</span>";
        NR++;
        elementSELECT_FROM += addLeerzeichen();
        elementSELECT_FROM += "<span class='codeElement_" + NR + "' data-goto-element='" + (NR - 4) + "'>FROM</span>";
        NR++;
        elementSELECT_FROM += addLeerzeichen();
        elementSELECT_FROM += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier active' data-sql-element='SELECT_FROM' data-next-element='" + (NR - 4) + "'>___</span>";
        NEXT_ELEMENT_NR = NR;
        NR++;
        elementSELECT_FROM += "</span></span>";
        $('.codeArea.editor pre code').append(elementSELECT_FROM);
        setSelection(NEXT_ELEMENT_NR, false);
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

    // Button: LIMIT ___ = [offset,] row_count
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
        var elementHAVING = "";
        elementHAVING += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='HAVING'>";
        NR++;
        elementHAVING += addLeerzeichen();
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

        CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementHAVING);
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

    // Select: add dbField, dbTable, Aggregatsfunktion
    $('.buttonArea.codeComponents').on('change', '.codeSelect', function () {
        if (CURRENT_SELECTED_ELEMENT != undefined) {
            var tempSelectField = this;
            var returnObject = {};
            // wich select is triggering?
            // -> selColumn, selTable
            if ($(tempSelectField).hasClass("selColumn") || $(tempSelectField).hasClass("selTable") || $(tempSelectField).hasClass("selOperators")) {

                if (CURRENT_SELECTED_ELEMENT.hasClass("extended") && CURRENT_SELECTED_ELEMENT.hasClass("comma")) { //Feld erweitert ,___
                    returnObject = addSelectValue(tempSelectField);
                    CURRENT_SELECTED_ELEMENT.replaceWith(returnObject.tempSelectValue);
                    CURRENT_SELECTED_ELEMENT = $(returnObject.thisCodeElement);

                    setSelection("next", false);
                } else if (CURRENT_SELECTED_ELEMENT.hasClass("extended")) { //Feld erweitert ___
                    returnObject = addSelectValue(tempSelectField);
                    CURRENT_SELECTED_ELEMENT.replaceWith(returnObject.tempSelectValue);
                    CURRENT_SELECTED_ELEMENT = $(returnObject.thisCodeElement);

                    setSelection("next", false);

                } else if (CURRENT_SELECTED_ELEMENT.hasClass("root")) { //Feld normal ___
                    returnObject = addSelectValue(tempSelectField);
                    CURRENT_SELECTED_ELEMENT.replaceWith(returnObject.tempSelectValue);
                    CURRENT_SELECTED_ELEMENT = $(returnObject.thisCodeElement);

                    setSelection("next", false);
                }
            }
            // -> selAggregate
            else if ($(tempSelectField).hasClass("selAggregate")) {
                CURRENT_SELECTED_ELEMENT.replaceWith(addAggregat(tempSelectField));
                setSelection(NEXT_ELEMENT_NR, false);
            }
        }
        // aktualisiert alle .selColumn <select>
        updateSelectCodeComponents();
        //reset select option
        $(this)[0].selectedIndex = 0;
    });

    //Button: Add Element "inputField"
    $(".btnAdd").click(function () {
        var dataSqlElement = CURRENT_SELECTED_ELEMENT.data("sql-element");

        if (CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {

            if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "_AGGREGAT")) { //...
                CURRENT_SELECTED_ELEMENT.after(addInputField(dataSqlElement, "extendedSpace"));

            } else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "WHERE_3, OR_3, AND_3")) { //...
                CURRENT_SELECTED_ELEMENT.after(addInputField(dataSqlElement, "extendedSpace"));

            } else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "INSERT_1")) {
                CURRENT_SELECTED_ELEMENT.after(addInputField(dataSqlElement, "insertInto"));
            } else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "INSERT_2")) {

                var updateField1 = addLeerzeichenMitKomma();
                updateField1 += "<span class='codeElement_" + NR + " inputField unfilled extended sqlIdentifier' data-sql-element='INSERT_2' data-next-element='" + (NR + 2) + "' data-element-group='" + (NR - 1) + "," + (NR + 1) + "," + (NR + 2) + "'>___</span>";
                NR++;
                CURRENT_SELECTED_ELEMENT.after(updateField1);

                var lastInsert3Field = findElementBySqlData(CURRENT_SELECTED_ELEMENT.closest(".parent").children(), "INSERT_3", "last");

                var updateField2 = addLeerzeichenMitKomma();
                updateField2 += "<span class='codeElement_" + NR + " inputField unfilled extended sqlIdentifier' data-sql-element='INSERT_3' data-next-element='" + (NR + 2) + "' data-element-group='" + (NR - 1) + "," + (NR - 2) + "," + (NR - 3) + "'>___</span>";
                NR++;
                $(lastInsert3Field).after(updateField2);
            } else {
                CURRENT_SELECTED_ELEMENT.after(addInputField(dataSqlElement, "extendedComma"));

            }
            setSelection(NEXT_ELEMENT_NR, false);
        }

        // UPDATE: fügt ", ___ = ___" hinzu
        else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "UPDATE")) {
            var lastUpdateField = findElementBySqlData(CURRENT_SELECTED_ELEMENT.children(), "UPDATE_3", "last");
            var updateFields = addLeerzeichenMitKomma();
            updateFields += "<span class='codeElement_" + NR + " inputField unfilled extended sqlIdentifier' data-sql-element='UPDATE_2' data-next-element='" + (NR + 2) + "' data-element-group='" + (NR - 1) + "," + (NR + 1) + "," + (NR + 2) + "," + (NR + 3) + "," + (NR + 4) + "'>___</span>";
            NR++;
            updateFields += addLeerzeichen();
            updateFields += "<span class='codeElement_" + NR + "' data-goto-element='" + (NR - 8) + "'> = </span>";
            NR++;
            updateFields += addLeerzeichen();
            updateFields += "<span class='codeElement_" + NR + " inputField unfilled extended sqlIdentifier' data-sql-element='UPDATE_3' data-next-element='" + (NR - 4) + "' data-element-group='" + (NR - 1) + "," + (NR - 2) + "," + (NR - 3) + "," + (NR - 4) + "'>___</span>";
            NR++;
            $(lastUpdateField).after(updateFields);
        }
    });

    // Button: Delete Element
    $('.btnDelete').click(function () {
        deleteElement(CURRENT_SELECTED_ELEMENT);
        // aktualisiert alle .selColumn <select>
        updateSelectCodeComponents();
    });

    // on Click Element
    $('.codeArea.editor').on('click', 'span', function (event) {
        event.stopPropagation();
        //
        if ($(this).data("goto-element") == "next") {
            var elementNr = "0";
        } else if ($(this).data("goto-element") != undefined) {
            var elementNr = $(this).data("goto-element");
        } else {
            var elementNr = getElementNr($(this).attr("class"));
        }
        setSelection(elementNr, false);
    });

    // on Click CodeArea - deselct
    $('body').on('click', '.codeArea.editor', function (event) {
        event.stopPropagation();
        removeSelection(false);
        checkCodeAreaSQLElements();
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
            CURRENT_SQL_DATABASE = DATABASE_ARRAY[CURRENT_DATABASE_INDEX].database;
            updateActiveCodeView();

            // zeigt das Datenbankschema an
            var tempTables = getSqlTables();
            $(".schemaArea").html(createTableInfo(tempTables, "1,2"));
        }
        // 2) Datenbank ist auf dem Server und muss noch eingelesen werden
        else if (CURRENT_DATABASE_INDEX != null && DATABASE_ARRAY[CURRENT_DATABASE_INDEX].type == "server") {
            init(fetch("data/" + DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name).then(res => res.arrayBuffer())).then(function (initObject) {
                CURRENT_SQL_DATABASE = initObject[0];
                ACTIVE_CODE_VIEW_DATA = initObject[1];

                DATABASE_ARRAY[CURRENT_DATABASE_INDEX].database = CURRENT_SQL_DATABASE;

                updateActiveCodeView();

                // zeigt das Datenbankschema an
                var tempTables = getSqlTables();
                $(".schemaArea").html(createTableInfo(tempTables, "1,2"));

            }, function (error) { console.log(error) });
        }
    });

    // Datenbankdatei wurde zum Upload ausgewählt
    $("#fileDbUpload").on('change', function () {
        var uploadedFile = this.files[0];

        var fileReader = new FileReader();
        fileReader.onload = function () {
            init(fileReader.result).then(function (initObject) {
                CURRENT_SQL_DATABASE = initObject[0];
                ACTIVE_CODE_VIEW_DATA = initObject[1];

                var uploadedFileName = buildDatabaseName(uploadedFile.name, null);
                DATABASE_ARRAY.push(createDatabaseObject(uploadedFileName, CURRENT_SQL_DATABASE, "local"));
                CURRENT_DATABASE_INDEX = DATABASE_ARRAY.length - 1;

                updateDbChooser(DATABASE_ARRAY[CURRENT_DATABASE_INDEX].name);
                $(".codeArea pre code").html("");
                CURRENT_SELECTED_SQL_ELEMENT = "START";
                updateActiveCodeView();

                // zeigt das Datenbankschema an
                var tempTables = getSqlTables();
                $(".schemaArea").html(createTableInfo(tempTables, "1,2"));

                //debug:
                $("#jquery-code").html(loadFromLocalStorage("tempSqlCommand"));

            }, function (error) { console.log(error) });
        }
        fileReader.readAsArrayBuffer(uploadedFile);

    });

    //Button: lädt die aktuell ausgewählte Datenbank herunter
    $(".btnDbDownload").click(function () {
        var binaryArray = CURRENT_SQL_DATABASE.export();

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
        var tempTables = getSqlTables();
        $(".schemaArea").html(createTableInfo(tempTables, "1,2"));
    });
    $(".btnDbInfoMobile").click(function () {
        var tempTables = getSqlTables();
        $(".schemaArea.dbInfoModal").html(createTableInfo(tempTables, "1,2"));

    });

    // Button: close modal (x - schließen)
    $(".btn-close.dbInfoModal").click(function () {
        //$(".codeArea.resultModal pre code").html("");
    });
    $(".btn.btn-secondary.close.dbInfoModal").click(function () {
        //$(".codeArea.resultModal pre code").html("");
    });

    // Button: run sql command - desktop
    $(".btnRun").click(function () {
        execSqlCommand(null, "desktop");
        checkAnswer(CURRENT_QUESTION_ID);
    });
    // Button: run sql command - mobile 
    $(".btnRunMobile").click(function () {

        var tempCode = $(".codeArea.editor pre code").html().trim();
        $(".codeArea.resultModal pre code").html(tempCode);
        execSqlCommand(null, "mobile");
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

    //function: parst anhand des SQL CREATE Befehls die Foreign Keys 
    function getTableForeignKeyInformation(tableName) {

        var tableForeignKeyInformationArray = [];
        var currentTableColumns = getSqlTableFields(tableName);
        var currentTableCreateStatement = CURRENT_SQL_DATABASE.exec("SELECT sql FROM sqlite_master WHERE name = '" + tableName + "'")[0].values[0][0];

        currentTableColumns.forEach(column => { //id, name, vorname, klasse_id, ...
            var foreignKeyfound = false;
            var newColumnObject = {};
            newColumnObject.name = column[1];
            newColumnObject.tableSelf = tableName;

            var newArray = currentTableCreateStatement.split(",");
            newArray.forEach(element => {
                var regexForeignKeyColumnSelf = element.match(/FOREIGN KEY\((.*?)\)/); //sucht nach FOREIGN KEY ( )
                if (regexForeignKeyColumnSelf != null) {
                    var columnWithForeignKey = regexForeignKeyColumnSelf[1].replaceAll(/"|\s/g, ""); //entfernt alle Anführungszeichen und Leerzeichen 
                    if (newColumnObject.name == columnWithForeignKey) { //Informationen werden nur ergänzt, wenn es sich um die richtige Spalte handelt
                        newColumnObject.columnSelf = columnWithForeignKey;
                        var regexForeignKeyColumnTarget = element.split("REFERENCES")[1].match(/\((.*?)\)/); //sucht nach ( ) 
                        var regexForeignKeyTableTarget = element.split("REFERENCES")[1].match(/^(.*?)\(/); //sucht von vorne bis zur ersten (
                        if (regexForeignKeyColumnTarget != null && regexForeignKeyTableTarget != null) {
                            newColumnObject.columnTarget = regexForeignKeyColumnTarget[1].replaceAll(/"|\s/g, "");
                            newColumnObject.tableTarget = regexForeignKeyTableTarget[1].replaceAll(/"|\s/g, "");
                            foreignKeyfound = true;
                        }
                    }
                }

            });

            if (!foreignKeyfound) {
                newColumnObject.columnSelf = null;
                newColumnObject.columnTarget = null;
                newColumnObject.tableTarget = null;
            }
            tableForeignKeyInformationArray.push(newColumnObject);
        });
        return tableForeignKeyInformationArray;

    }
    //function: Erstellt eine Tabelle mit den Informationen der Tabellen einer SQL Datenbank
    function createTableInfo(tables, indexesToDisplay) {

        var tableCounter = 1;
        var htmlTableInfo = "";
        var databaseForeignKeyInformationArray = [];
        var tableColorArray = [];

        tables.forEach(table => {

            var tableColor = CSS_COLOR_ARRAY[tableCounter % CSS_COLOR_ARRAY.length];

            if (tableCounter % 3 == 0) {
                htmlTableInfo += "</div><div class='row'>";
            } else if (tableCounter == 1) {
                htmlTableInfo += "<div class='row'>";
            }

            var currentTableData = CURRENT_SQL_DATABASE.exec("PRAGMA table_info(" + table + ")");

            htmlTableInfo += "<div class='col-sm'>";

            //ForeignKey Informationen der Tabelle je Spalte wird abgerufen
            var tableForeignKeyInformationArray = getTableForeignKeyInformation(table);

            //erstellt eine Tabelle mit dem Datenbankschema
            for (var i = 0; i < currentTableData.length; i++) {

                if (indexesToDisplay != null) {
                    indexesToDisplayArray = indexesToDisplay.split(",");
                    indexesToDisplayArray = indexesToDisplayArray.map(Number);
                }

                htmlTableInfo += "<table class='table table-bordered schemaTable' style='max-width: 20em;'>";
                htmlTableInfo += "<thead>";

                if (indexesToDisplay == null) {
                    htmlTableInfo += "<tr><th colspan='" + currentTableData[i].columns.length + "' style='background-color: " + tableColor + "'>" + table + "</th></tr>";
                } else {
                    htmlTableInfo += "<tr><th colspan='" + indexesToDisplayArray.length + "' style='background-color: " + tableColor + "'>" + table + "</th></tr>";
                }

                //speichert den Tabellennamen und die gewählte Farbe, um "foreignKeys" zu referenzieren
                var newTableColor = {};
                newTableColor.tableName = table;
                newTableColor.tableColor = tableColor;
                tableColorArray.push(newTableColor);

                htmlTableInfo += "</thead>";
                htmlTableInfo += "<tbody>";
                currentTableData[i].values.forEach((value) => {
                    htmlTableInfo += "<tr>";
                    value.forEach((element, index2) => {


                        //sucht nach "foreign Keys" (z.B.: mitarbeiter_id -> tabellenname + _id) und aktualisiert die Einträge im tableForeignKeyInformationArray                    
                        if (element != null) {
                            var foundForeignKeyReference = element.toString().match(/\_id|\_ID/g);
                            if (foundForeignKeyReference != null) {
                                tableForeignKeyInformationArray.forEach(column => {
                                    if (column.name == element && column.tableTarget == null) {
                                        column.columnSelf = element;
                                        column.tableSelf = table[0];
                                        column.columnTarget = foundForeignKeyReference.toString().replace("_", "");
                                        column.tableTarget = element.toString().replace(/\_id|\_ID/g, "");
                                    }
                                });
                            }
                        }

                        if (indexesToDisplay == null) {
                            htmlTableInfo += "<td id='" + table + "-" + element + "'>" + element + "</td>";
                        } else if (indexesToDisplayArray.includes(index2)) {
                            htmlTableInfo += "<td id='" + table + "-" + element + "'>" + element + "</td>";
                        }
                    });
                    htmlTableInfo += "</tr>";
                });
                htmlTableInfo += "</tbody>";
                htmlTableInfo += "</table>"
            }
            htmlTableInfo += "</div>";

            tableCounter++;
            //Foreign Key Informationen der Tabelle wird dem Foreign Key Database Array hinzugefügt.
            databaseForeignKeyInformationArray.push(tableForeignKeyInformationArray);
        });

        //kennzeichne ForeignKey Verbindungen farblich TODO
        databaseForeignKeyInformationArray.forEach(tableForeignKeyInformationArray => {
            tableForeignKeyInformationArray.forEach(tableColumn => {
                tableColorArray.forEach(tableColor => {
                    if (tableColor.tableName == tableColumn.tableTarget) {
                        var foreignKeyElementId = "id='" + tableColumn.tableSelf + "-" + tableColumn.columnSelf + "'";
                        var backgroundGradient = "background: linear-gradient(90deg, " + tableColor.tableColor + ", " + tableColor.tableColor + " 0.6em, white 0.6em);";
                        var leftBorderColor = "border-left: " + tableColor.tableColor + " 1px solid;";
                        htmlTableInfo = htmlTableInfo.replace(foreignKeyElementId, foreignKeyElementId + " style='" + backgroundGradient + " " + leftBorderColor + "' ");
                    }
                });
            });
        });

        return htmlTableInfo;
    }




    //function: Erstellt eine Tabelle mit den Resultaten einer SQL Abfrage
    function createTableSql(columns, values) {

        SOLUTION_ALL_ARRAY = [];
        SOLUTION_ROW_COUNTER = 0;

        var newTable = "<div class='table-responsive'><table class='table table-bordered tableSql' style=''>";
        newTable += "<thead>";
        columns.forEach((column) => {
            newTable += "<th scope='col'>" + column + "</th>";
        });
        newTable += "</thead>";

        newTable += "<tbody>";
        values.forEach((value) => {
            newTable += "<tr>";
            SOLUTION_ROW_COUNTER++;
            value.forEach((element) => {
                //fügt Elemente dem Ergebnis Array hinzu -> wird für das Überprüfen der Aufgabe benötigt
                SOLUTION_ALL_ARRAY.push(element);
                if (element.length > 200) {
                    newTable += "<td style='min-width: 200px;'>" + element + "</td>";
                } else {
                    newTable += "<td style=''>" + element + "</td>";
                }

            });
            newTable += "</tr>";
        });
        newTable += "</tbody>";
        newTable += "</table></div>"

        return newTable;
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

    //function: fügt der buttonArea aktuell notwendige codeComponents hinzu
    function createCodeComponent(codeComponent, option) {
        switch (codeComponent) {
            case "zeilenumbruch":
                $(".buttonArea.codeComponents").append('<br>');
                break;
            case ".btnSelect":
                $(".buttonArea.codeComponents").append('<button class="btnSelect synSQL sqlSelect codeButton">SELECT ___ FROM ___</button>');
                break;
            case ".btnWhere":
                $(".buttonArea.codeComponents").append('<button class="btnWhere synSQL sqlWhere codeButton">WHERE ___ ___ ___</button>');
                break;
            case ".btnOrder":
                $(".buttonArea.codeComponents").append('<button class="btnOrder synSQL sqlOrder codeButton">ORDER BY ___</button>');
                break;
            case ".btnLimit":
                $(".buttonArea.codeComponents").append('<button class="btnLimit synSQL sqlOrder codeButton">LIMIT ___</button>');
                break;
            case ".btnGroup":
                $(".buttonArea.codeComponents").append('<button class="btnGroup synSQL sqlGroup codeButton">GROUP BY ___</button>');
                break;
            case ".btnJoin":
                $(".buttonArea.codeComponents").append('<button class="btnJoin synSQL sqlJoin codeButton">JOIN ___ ON ___ ___ ___</button>');
                break;
            case ".selColumn":
                var selColumn = "<select class='selColumn synColumns " + option + " codeSelect'>";
                selColumn += "<option value='0' disabled selected hidden>Spalten " + option + "</option>";
                selColumn += "<option value='*'>*</option>";
                selColumn += "</select>";
                var selColumn = $.parseHTML(selColumn);
                $(".buttonArea.codeComponents").append(selColumn);
                fillSelectionFields(option, selColumn);
                break;
            case ".selTable":
                $(".buttonArea.codeComponents").append('<select class="selTable synTables codeSelect"><option value="0" disabled selected hidden>Tabelle wählen</option></select>');
                fillSelectionTables();
                break;
            case ".selAggregate":
                $(".buttonArea.codeComponents").append('<select class="selAggregate synSQL sqlSelect codeSelect"><option value="" disabled selected hidden>Aggregatsfunktion wählen</option><option value="AVG">AVG ( ___ )</option><option value="COUNT">COUNT ( ___ )</option><option value="MIN">MIN ( ___ )</option><option value="MAX">MAX ( ___ )</option><option value="SUM">SUM ( ___ )</option></select>');
                break;
            case ".btnAND":
                $(".buttonArea.codeComponents").append('<button class="btnAND synSQL sqlWhere codeButton">AND</button>');
                break;
            case ".btnOR":
                $(".buttonArea.codeComponents").append('<button class="btnOR synSQL sqlWhere codeButton">OR</button>');
                break;
            case ".btnLeftBracket":
                $(".buttonArea.codeComponents").append('<button class="btnLeftBracket synBrackets sqlWhere codeButton">(</button>');
                break;
            case ".btnRightBracket":
                $(".buttonArea.codeComponents").append('<button class="btnRightBracket synBrackets sqlWhere codeButton">)</button>');
                break;
            case ".selOperators":
                $(".buttonArea.codeComponents").append('<select class="selOperators synOperators sqlWhere codeSelect"><option value="" disabled selected hidden>Operator wählen</option><option value="=">=</option><option value="&gt;">&gt;</option><option value="&lt;">&lt;</option><option value="&gt;=">&gt;=</option><option value="=">&lt;=</option><option value="&lt;&gt;">&lt;&gt;</option><option value="BETWEEN">BETWEEN ___ AND ___</option><option value="LIKE">LIKE</option><option value="IN">IN (___)</option></select>');
                break;
            case ".inputValue":
                $(".buttonArea.codeComponents").append('<input type="text" placeholder="Wert" class="inputValue synValue codeInput"> </input>');
                break;
            case ".btnAsc":
                $(".buttonArea.codeComponents").append('<button class="btnAsc synSQL sqlOrder codeButton">ASC</button>');
                break;
            case ".btnDesc":
                $(".buttonArea.codeComponents").append('<button class="btnDesc synSQL sqlOrder codeButton">DESC</button>');
                break;
            case ".btnHaving":
                $(".buttonArea.codeComponents").append('<button class="btnHaving synSQL sqlGroup codeButton">HAVING ___ ___ ___</button>');
                break;
            case ".btnSQLDelete":
                $(".buttonArea.codeComponents").append('<button class="btnSQLDelete synSQL sqlDelete">DELETE FROM ___</button>');
                break;
            case ".btnUpdate":
                $(".buttonArea.codeComponents").append('<button class="btnUpdate synSQL sqlUpdate">UPDATE ___ SET ___ = ___</button>');
                break;
            case ".btnInsert":
                $(".buttonArea.codeComponents").append('<button class="btnInsert synSQL sqlInsert">INSERT INTO ___ (___) VALUES (___)</button>');
                break;
            default:
            //log("no component found")
        }
    }

    //funtion: Sucht ein Element mit sql-element data attribut
    function findElementBySqlData(elements, attributeValue, position) {
        var tempElement;
        if (position == "first") {
            $(elements).each(function () {
                tempElement = this;
                if ($(tempElement).data("sql-element") == attributeValue) {
                    return false; //found element -> stop loop
                }
            });
        } else if (position == "last") {
            $(elements.get().reverse()).each(function () {
                tempElement = this;
                if ($(tempElement).data("sql-element") == attributeValue) {
                    return false; //found element -> stop loop
                }
            });
        }
        return tempElement;
    }

    //function: delete element from code area
    function deleteElement(elementToDelete) {
        // Element parent
        if (elementToDelete.hasClass("parent")) {
            setSelection("parent", true);
        }
        // Klammern, ... 
        else if (elementToDelete.hasClass("synBrackets") && elementToDelete.hasClass("extended")) {
            setSelection("next", true);
        }
        // spezielle Behandlung des inputFields von INSERT_2
        else if (elementToDelete.hasClass("inputField") && elementToDelete.hasClass("extended") && hasCurrentSelectedElementSqlDataString(elementToDelete, "INSERT_2, UPDATE_2, UPDATE_3")) {
            var elementGroup = elementToDelete.data("element-group");
            if (elementGroup != undefined) {
                var idsToDelete = elementGroup.toString().split(",");
                idsToDelete.forEach(element => {
                    deleteElementById(element);
                });
            }

            setSelection("next", true);
        }
        // extended inputField
        else if (elementToDelete.hasClass("inputField") && elementToDelete.hasClass("extended")) {
            elementToDelete.prev().remove();
            setSelection("next", true);
        }
        // root inputField remove old Element and create new one
        else if (elementToDelete.hasClass("inputField") && elementToDelete.hasClass("root")) {
            var dataSqlElement = elementToDelete.data("sql-element");
            elementToDelete.replaceWith(addInputField(dataSqlElement, "root"));
            setSelection(NEXT_ELEMENT_NR, false);
        }
        // don´t delete, select parent Element
        else {
            var elementNr = getElementNr(elementToDelete.parent().attr('class'));
            setSelection(elementNr, false);
        }

        // deletes all empty <span class="codeline">
        $(".codeline").each(function () {
            if ($(this).children().length == 0) $(this).remove();
        });
    }

    //function: löscht ein Element anhand einer ID z.B.: 5
    function deleteElementById(elementId) {
        $(".codeArea.editor pre code").find(".codeElement_" + elementId).remove();
    }

    //function: befüllt .selTable mit allen Tabellen der Datenbank
    function fillSelectionTables() {
        clearSelectionOptions(".buttonArea .selTable");
        var databaseTables = getSqlTables();
        for (var i = 0; i < databaseTables.length; i++) {
            $(".buttonArea .selTable").append(new Option(databaseTables[i], databaseTables[i]));
        }
    }

    //function: entfernt alle select Optionen außer die erste
    function clearSelectionOptions(selectElement) {
        $(selectElement + ' option[value!="0"]').remove();
    }

    //function: get all used db tables in code area
    function updateUsedTables() {
        USED_TABLES = [];
        $(".codeArea.editor .selTable").each(function () {
            if (!USED_TABLES.includes($(this).html())) {
                USED_TABLES.push($(this).html());
            }
        });
    }

    //function: erstellt neue select elemente basierend auf den gewählten Tabellen in der code area
    function updateSelectCodeComponents() {
        //check all used tables in code area
        updateUsedTables();
        //entfernt alle .inputField die ein Feld einer gelöscht Tabelle haben
        $(".codeArea.editor .selColumn").each(function () {
            var isTableActive = false;
            USED_TABLES.forEach(element => {
                if ($(this).hasClass(element)) {
                    isTableActive = true;
                    var updatedFieldNameBasedOnTableCount = $(this).html().replace(element + ".", "");
                    if (USED_TABLES.length > 1) {
                        $(this).html(element + "." + updatedFieldNameBasedOnTableCount);
                    } else {
                        $(this).html(updatedFieldNameBasedOnTableCount);
                    }
                }
            });
            if (!isTableActive) {
                deleteElement($(this));
            }
        });
    }

    //function: befüllt die .selColumn Element mit Feldern der genutzten Datenbanken
    function fillSelectionFields(tableName, selectFields) {
        var tempTableFields = getSqlTableFields(tableName);
        tempTableFields.forEach(element => {
            $(selectFields).append(new Option(element[1], element[1]));
        });
    }

    //function: checks if data-sql-element contains string i.e. "WHERE_3, OR_3, AND_3"
    function hasCurrentSelectedElementSqlDataString(currentSelectedElement, sqlDataIdentifier) {
        var sqlStringFound = false;
        var tempSqlDataArray = sqlDataIdentifier.replaceAll(" ", "").split(",");
        tempSqlDataArray.forEach(element => {
            if (currentSelectedElement.data("sql-element").includes(element)) {
                sqlStringFound = true;
            }
        });
        return sqlStringFound;
    }

    //function: returns a normal or extended inputField ( ___ or ,___ )
    function addInputField(tempSqlElement, type) {
        if (type == "root") {
            var tempInputField = "<span class='codeElement_" + NR + " inputField unfilled sqlIdentifier root' data-sql-element='" + tempSqlElement + "'>___</span>";
            NEXT_ELEMENT_NR = NR;
            NR++;
        } else if (type == "extendedComma") {
            var tempInputField = addLeerzeichenMitKomma();
            tempInputField += "<span class='codeElement_" + NR + " inputField unfilled sqlIdentifier extended comma' data-sql-element='" + tempSqlElement + "'>___</span>";
            NEXT_ELEMENT_NR = NR;
            NR++;
        } else if (type == "extendedSpace") {
            var tempInputField = addLeerzeichen();
            tempInputField += "<span class='codeElement_" + NR + " inputField unfilled sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>___</span>";
            NEXT_ELEMENT_NR = NR;
            NR++;
        } else if (type == "insertInto") {
            var tempInputField = addLeerzeichen();

            tempInputField += "<span class='codeElement_" + NR + " sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>(</span>";
            NR++;

            tempInputField += "<span class='codeElement_" + NR + " inputField unfilled extended insert2 sqlIdentifier' data-sql-element='INSERT_2' data-next-element='" + (NR + 2) + "' data-element-group='" + (NR - 2) + "," + (NR - 1) + "," + (NR + 1) + "'>___</span>";
            NEXT_ELEMENT_NR = NR;
            NR++;

            tempInputField += "<span class='codeElement_" + NR + " sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>)</span>";
            NR++;
        }

        return tempInputField;

    }
    //function: adds an Aggregat <span> with inputField
    function addAggregat(tempSelectField) {
        var classesFromCodeComponent = getClassesFromElementAsString(tempSelectField);
        var tempSqlElement = CURRENT_SELECTED_ELEMENT.data("sql-element");
        var tempAggregat = "";
        if (CURRENT_SELECTED_ELEMENT.hasClass("extended")) {
            tempAggregat += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " inputField sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>" + tempSelectField.value + "(";
        } else {
            tempAggregat += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " inputField sqlIdentifier root' data-sql-element='" + tempSqlElement + "'>" + tempSelectField.value + "(";
        }
        NR++;
        tempAggregat += addInputField(tempSqlElement + "_AGGREGAT", "root");
        tempAggregat += ")</span>";
        return tempAggregat;
    }

    //function: adds a selected Value from and <select> Component
    function addSelectValue(tempSelectField) {
        var classesFromCodeComponent = getClassesFromElementAsString(tempSelectField);
        var tempElementId = getElementNr(CURRENT_SELECTED_ELEMENT.attr("class"));

        var tempSqlElement = CURRENT_SELECTED_ELEMENT.data("sql-element");
        var tempNextElement = CURRENT_SELECTED_ELEMENT.data("next-element");
        var tempGroupElement = CURRENT_SELECTED_ELEMENT.data("element-group");

        var tempSelectValue = "";
        if (CURRENT_SELECTED_ELEMENT.hasClass("extended")) {
            tempSelectValue += "<span class='codeElement_" + tempElementId + " " + classesFromCodeComponent + " inputField sqlIdentifier extended' data-sql-element='" + tempSqlElement + "' data-next-element='" + tempNextElement + "' data-element-group='" + tempGroupElement + "'>" + tempSelectField.value + "</span>";
        } else {
            tempSelectValue += "<span class='codeElement_" + tempElementId + " " + classesFromCodeComponent + " inputField sqlIdentifier root' data-sql-element='" + tempSqlElement + "' data-next-element='" + tempNextElement + "' data-element-group='" + tempGroupElement + "'>" + tempSelectField.value + "</span>";
        }
        var returnObject = {};
        returnObject.tempSelectValue = tempSelectValue;
        returnObject.thisCodeElement = ".codeElement_" + tempElementId;

        return returnObject;
    }

    //function: liefert alle Klassen eines Elements als Array zurück, außer der letzten Kontrollklasse (codeButton, codeSelect, codeInput)
    function getClassesFromElementAsArray(element) {
        var codeComponentClassesAsArray = $(element).attr("class").split(" ");
        codeComponentClassesAsArray.pop(); //entfernt letzte Kontrollklasse
        return codeComponentClassesAsArray;
    }

    //function: liefert alle Klassen eines Elements als String zurück, außer der letzten Kontrollklasse (codeButton, codeSelect, codeInput)
    function getClassesFromElementAsString(element) {
        var codeComponentClassesAsString = $(element).attr("class").replace(/[\W]*\S+[\W]*$/, '');
        return codeComponentClassesAsString;
    }
    //function: remove Selection from all Elements
    function removeSelection(removeLastSelectedElement) {
        $("[class^='codeElement_']").removeClass("active");
        $(".codeInput").val("");
        if (removeLastSelectedElement) CURRENT_SELECTED_ELEMENT.remove();
        CURRENT_SELECTED_ELEMENT = undefined;
    }

    //function: set Selection to an Element
    function setSelection(elementNr, removeLastSelectedElement) {
        var element;

        //no number is given -> get next unfilled inputField
        if (elementNr == "next") {
            CURRENT_SELECTED_ELEMENT.removeClass("unfilled");
            //find .parent then find .unfilled
            element = CURRENT_SELECTED_ELEMENT.closest(".parent").find(".unfilled").first();
            if (element.length == 0) {
                //find .codeline then find next .unfilled
                element = CURRENT_SELECTED_ELEMENT.closest(".codeline").find(".unfilled").first();
                if (element.length == 0) {
                    //select first parent, if no .unfilled is found
                    element = CURRENT_SELECTED_ELEMENT.parents().closest(".parent").last();
                }
            }
        }
        //.parent ist selektiert
        else if (elementNr == "parent") {
            //select next .parent
            element = CURRENT_SELECTED_ELEMENT.next(".parent");
            if (element.length == 0) {
                //select prev .parent
                element = CURRENT_SELECTED_ELEMENT.prev(".parent");
                if (element.length == 0) {
                    //select last .parent of .codeline before current .codeline
                    element = CURRENT_SELECTED_ELEMENT.parent().prev(".codeline").find(".parent").last();
                    if (element.length == 0) {
                        //select last .parent of .codeline after current .codeline
                        element = CURRENT_SELECTED_ELEMENT.parent().next(".codeline").find(".parent").last();
                    }
                }
            }
        }
        //next element is chosen by number
        else {
            element = $(".codeElement_" + elementNr);
        }

        removeSelection(removeLastSelectedElement);

        if (element.length != 0) {
            element.addClass("active");
            CURRENT_SELECTED_ELEMENT = element;
            CURRENT_SELECTED_SQL_ELEMENT = element.closest(".sqlIdentifier").data("sql-element");
        } else {
            CURRENT_SELECTED_SQL_ELEMENT = "START";
        }
        updateActiveCodeView();
        //DEBUG:
        if (CURRENT_SELECTED_ELEMENT != undefined) {
            $("#debug").html("<span style='font-weight: 700;'>currentSelectedElement:</span><br>" + CURRENT_SELECTED_ELEMENT.attr("class"));
            $("#debug").append("<br><span style='font-weight: 700;'>currentSelectedSQLElement:</span><br>" + CURRENT_SELECTED_SQL_ELEMENT);
        }
    }

    //function: get NextElementNr by data field
    function getNextElementNr() {
        if (CURRENT_SELECTED_ELEMENT != undefined) {
            if (CURRENT_SELECTED_ELEMENT.data("next-element") != undefined) {
                return CURRENT_SELECTED_ELEMENT.data("next-element");
            }
        }
    }

    //function: get Element NR from Element ID
    function getElementNr(elementClasses) {
        return elementClasses.split(" ")[0].split("_")[1];
    }

    //function: add new line <span>
    function addNewLine() {
        var tempLeerzeichen = "<span class='codeElement_" + NR + " newline'><br></span>";
        NR++;
        return tempLeerzeichen;
    }

    //function: add Leerzeichen <span>
    function addLeerzeichen() {
        var tempLeerzeichen = "<span class='codeElement_" + NR + " leerzeichen'>&nbsp;</span>";
        NR++;
        return tempLeerzeichen;
    }

    function addLeerzeichenMitKomma() {
        var tempLeerzeichen = "<span class='codeElement_" + NR + " leerzeichen'>, </span>";
        NR++;
        return tempLeerzeichen;
    }

    //function: loops through JSON Data and shows Elements based on selected SQL Element
    function updateActiveCodeView() {

        if (!isCheckboxChecked("#checkDisplayAllCodeComponents")) {
            //reset add und delete Button
            $(".buttonArea.mainMenu .btnAdd").hide();
            $(".buttonArea.mainMenu .btnDelete").hide();

            $(".buttonArea.codeComponents").html("");

            ACTIVE_CODE_VIEW_DATA.forEach(element => {
                if (element.selectedSQLElement == CURRENT_SELECTED_SQL_ELEMENT) {

                    //Code Components: sollen auf max x (3) Zeilen verteilt werden
                    var maxZeilen = 3;
                    var maxComponents = element.visibleCodeComponents.length;
                    var componentCounter = 0;

                    element.visibleCodeComponents.forEach(element => {

                        //.selColumns werden in Abhängigkeit der USED_TABLES erstellt
                        if (element.codeComponentClass == ".selColumn") {
                            updateUsedTables();
                            USED_TABLES.forEach(elementTable => {
                                createCodeComponent(element.codeComponentClass, elementTable);
                                componentCounter++;
                                //Zeilenumbruch nach x Elementen einfügen
                                if (componentCounter >= Math.ceil(maxComponents / maxZeilen)) {
                                    createCodeComponent("zeilenumbruch", null);
                                    componentCounter = 0;
                                    maxComponents--;
                                }
                            });
                        } else {
                            createCodeComponent(element.codeComponentClass, null);
                            componentCounter++;
                            //Zeilenumbruch nach x Elementen einfügen
                            if (componentCounter >= Math.ceil(maxComponents / maxZeilen)) {
                                createCodeComponent("zeilenumbruch", null);
                                componentCounter = 0;
                                maxComponents--;
                            }
                        }

                        //wenn ein input Feld angezeigt wird:
                        if (element.codeComponentType == "input") {
                            $(element.codeComponentClass).focus();
                            if (CURRENT_SELECTED_ELEMENT != undefined) {
                                if (CURRENT_SELECTED_ELEMENT.hasClass("input")) {
                                    if (CURRENT_SELECTED_ELEMENT.text() == "___") {
                                        $(element.codeComponentClass).val("");
                                    } else {
                                        $(element.codeComponentClass).val(CURRENT_SELECTED_ELEMENT.text().replaceAll("'", "")).select();
                                    }
                                }
                            }
                        }

                    });

                    //Main Controls: btnRun, btnAdd, btnDelete, ...
                    element.visibleMainControls.forEach(element => {
                        $(element.codeComponentClass).show();
                    });

                }
            });
        } else {
            var allCodeComponents = [".btnSelect", ".btnWhere", ".btnOrder", ".btnLimit", ".btnGroup", ".btnJoin", ".selColumn", ".selTable", ".selAggregate", ".btnAND", ".btnOR", ".btnLeftBracket", ".btnRightBracket", ".selOperators", ".inputValue", ".btnAsc", ".btnDesc", ".btnHaving"];
            allCodeComponents.forEach(element => {
                createCodeComponent(element, null);
            });
        }
        initScrollDots();
    }

    //function: checks all Code Elements in the CodeArea, and updates Code View
    function checkCodeAreaSQLElements() {
        if (!isSQLElementInCodeArea("SELECT")) {
            CURRENT_SELECTED_SQL_ELEMENT = "START";
            updateActiveCodeView();
        } else {
            CURRENT_SELECTED_SQL_ELEMENT = "";
            updateActiveCodeView();
        }
    }

    //function: get all SQL Elements in CodeArea
    function getCodeAreaSQLElements() {
        var codeAreaElements = [];
        $('.codeArea.editor').children(".parent").each(function () {
            var tempSqlElement = $(this).data("sql-element");
            codeAreaElements.push(tempSqlElement);
        });
        return codeAreaElements;
    }

    //function: checks if a SQL Element is in CodeArea
    function isSQLElementInCodeArea(sqlElement) {
        if (getCodeAreaSQLElements().includes(sqlElement)) {
            return true;
        } else {
            return false;
        }
    }

    //SQLite functions:
    function getSqlTables() {
        return CURRENT_SQL_DATABASE.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")[0].values;
    }

    function getSqlTableFields(tempTableName) {
        return CURRENT_SQL_DATABASE.exec("PRAGMA table_info(" + tempTableName + ")")[0].values;
    }

    //function: run sql command, type = desktop or mobile
    function execSqlCommand(tempSqlCommand, type) {

        //bereitet den sql Befehl vor
        var re = new RegExp(String.fromCharCode(160), "g"); // entfernt &nbsp;
        if (tempSqlCommand == null) {
            tempSqlCommand = $(".codeArea.editor pre code").clone();
            tempSqlCommand.find(".codeline").prepend("<span>&nbsp;</span>");
            tempSqlCommand = tempSqlCommand.text().replaceAll(re, " ").trim();
        }
        //versucht den sql Befehl auszuführen und gibt im Debugbereich das Ergebnis oder die Fehlermeldung aus
        try {
            var result = CURRENT_SQL_DATABASE.exec(tempSqlCommand);

            //erstellt eine Tabelle mit den Ergebnissen
            $(".resultArea.resultModal").html("");
            $(".outputArea").html("");
            for (var i = 0; i < result.length; i++) {
                if (type == "mobile") $(".resultArea.resultModal").append(createTableSql(result[i].columns, result[i].values));
                else if (type == "desktop") {
                    $(".outputArea").append("" + createTableSql(result[i].columns, result[i].values) + "")
                    var someTabTriggerEl = document.querySelector('#nav-result-tab')
                    var tab = new bootstrap.Tab(someTabTriggerEl)
                    tab.show()
                };
            }
        } catch (err) {
            if (type == "mobile") $(".resultArea.resultModal").html(err.message);
            else if (type == "desktop") {
                $(".outputArea").html("<h4>SQL Fehler:</h4>" + "<span style='color: tomato;'>" + err.message + "</span>")
                var someTabTriggerEl = document.querySelector('#nav-result-tab')
                var tab = new bootstrap.Tab(someTabTriggerEl)
                tab.show()
            };

        }
    }


    /////////
    //DEBUG//

    //display current version
    //$(codeVersion).append("0.5");

    //display debug area with controls
    $("#displayDebug").click(function () {
        if (!isCheckboxChecked("#displayDebug")) {
            $("#debug-area").hide();
        } else {
            $("#debug-area").show();
        }
    });

    //function log
    function log(info, tempValue) {
        console.log(info);
        if (tempValue != undefined) console.log("-> " + tempValue);
    }
    //Debug jquery-code textarea
    $(".btnCode-parent").click(function () {
        CURRENT_SELECTED_ELEMENT.parent().addClass("debug");
    });
    $(".btnCode-closest1").click(function () {
        CURRENT_SELECTED_ELEMENT.closest(".parent").addClass("debug");
    });
    $(".btnCode-closest2").click(function () {
        CURRENT_SELECTED_ELEMENT.closest(".inputFields").addClass("debug");
    });
    $(".btnCode-find1").click(function () {
        CURRENT_SELECTED_ELEMENT.find(".parent").addClass("debug");
    });
    $(".btnCode-copycodeto").click(function () {
        var copyCode = $("#jquery-code").val();
        $(".codeArea.editor pre code").html(copyCode);
    });
    $(".btnCode-copycodefrom").click(function () {
        var tempCode = $(".codeArea.editor pre code").html().trim();
        $("#jquery-code").html(tempCode);
        saveToLocalStorage("tempSqlCommand", tempCode);
    });
    $(".btnCode-getSqlString").click(function () {
        var tempCode = $(".codeArea.editor pre code").clone();
        tempCode.find(".codeline").prepend("<span>&nbsp;</span>");
        $("#jquery-code").html(tempCode.text().trim());
    });
    $(".btnCode-execSql").click(function () {
        var tempSqlCommand = $("#jquery-code").val();
        execSqlCommand(tempSqlCommand, "desktop");
        $("#exampleModal").modal('toggle');
    });
    $(".btnCode-remove").click(function () {
        $("div").removeClass("debug");
        $("[class^='codeElement_']").removeClass("debug");
    });
    $("#checkDisplayAllCodeComponents").click(function () {
        updateActiveCodeView();
    });

    function isCheckboxChecked(tempCheckbox) {
        if ($(tempCheckbox).prop("checked")) return true;
        else return false;
    }
    //function save + load to local storage
    function saveToLocalStorage(key, value) {
        localStorage.setItem(key, value);
    }

    function loadFromLocalStorage(key) {
        return localStorage.getItem(key);
    }





});