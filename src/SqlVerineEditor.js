import $ from "jquery";
import { Modal } from "bootstrap";
import "./css/SqlVerineEditor.css"

export default (function () {

    var sqlVerineEditor = {};

    var NR = 0;
    var NEXT_ELEMENT_NR = 0;
    var CURRENT_SELECTED_ELEMENT = undefined;
    var CURRENT_SELECTED_SQL_ELEMENT = "START";
    var ACTIVE_CODE_VIEW_DATA;
    var CURRENT_VERINE_DATABASE;
    var USED_TABLES = [];
    var EDITOR_CONTAINER;
    var SCHEMA_CONTAINER;
    var OUTPUT_CONTAINER;
    var OUTPUT_CONTAINER_MOBILE;
    var RUN_FUNCTIONS = [];
    var URLCODE = undefined;
    var URL_CURRENT_ID = undefined;
    var SOLUTION_ALL_ARRAY = [];
    var SOLUTION_ROW_COUNTER = 0;
    var ACTIVATE_EXERCISES = false;
    var SHOW_CODE_BTN = true;

    //Initialisierung des SqlVerineEditors
    sqlVerineEditor.init = () => {
        NR = 0;
        NEXT_ELEMENT_NR = 0;
        CURRENT_SELECTED_ELEMENT = undefined;
        CURRENT_SELECTED_SQL_ELEMENT = "START";
        USED_TABLES = [];
        //
        loadActiveCodeViewData();
        setupEditor();
        //
        initEvents();
        initCodeComponentsButtons();
        //

    }
    //Initialisierung des SqlVerineEditors
    sqlVerineEditor.reinit = () => {
        NR = 0;
        NEXT_ELEMENT_NR = 0;
        CURRENT_SELECTED_ELEMENT = undefined;
        CURRENT_SELECTED_SQL_ELEMENT = "START";
        USED_TABLES = [];
        //
        updateActiveCodeView();
        if (URLCODE != undefined) {
            fillCodeAreaWithCode();
        }
    }

    sqlVerineEditor.setVerineDatabase = (verineDatabase) => {
        CURRENT_VERINE_DATABASE = verineDatabase;
    }
    sqlVerineEditor.setEditorContainer = (editorContainer) => {
        EDITOR_CONTAINER = document.getElementById(editorContainer);
    }
    sqlVerineEditor.setSchemaContainer = (schemaContainer) => {
        SCHEMA_CONTAINER = document.getElementById(schemaContainer);
    }
    sqlVerineEditor.setOutputContainer = (outputContainer) => {
        OUTPUT_CONTAINER = document.getElementById(outputContainer);
    }
    sqlVerineEditor.setOutputContainerMobile = (outputContainerMobile) => {
        OUTPUT_CONTAINER_MOBILE = document.getElementById(outputContainerMobile);
    }
    sqlVerineEditor.addRunFunction = (runFunction) => {
        RUN_FUNCTIONS.push(runFunction);
    }
    sqlVerineEditor.resetRunFunctions = () => {
        RUN_FUNCTIONS = [];
    }
    sqlVerineEditor.setUrlCodeParameters = (code, currentID) => {
        URLCODE = code;
        URL_CURRENT_ID = currentID;
    }
    sqlVerineEditor.getSolutionAllArray = () => {
        return SOLUTION_ALL_ARRAY;
    }
    sqlVerineEditor.getSolutionRowCounter = () => {
        return SOLUTION_ROW_COUNTER;
    }
    sqlVerineEditor.activateExercises = (activate) => {
        ACTIVATE_EXERCISES = activate;
    }
    sqlVerineEditor.showCodeButton = (showCodeButton) => {
        SHOW_CODE_BTN = showCodeButton;
    }

    function loadActiveCodeViewData() {
        $.getJSON("data/activeCodeViewData.json", function (json) {
            ACTIVE_CODE_VIEW_DATA = json; // this will show the info it in firebug console
        });
    }

    function fillCodeAreaWithCode() {
        $(EDITOR_CONTAINER).find('.codeArea.editor pre code').html(unescape(URLCODE));
        NR = URL_CURRENT_ID;
    }

    function setupEditor() {
        let sqlVerineEditor = setupCodeArea() + setupMainMenu() + setupButtonArea() + setupScrollDots() + setupCodeModal();
        EDITOR_CONTAINER.innerHTML = sqlVerineEditor;
    }

    function setupCodeArea() {
        let codeArea = '<div class="codeAreaWrapper">';
        if (SHOW_CODE_BTN) {
            codeArea += '<button id="btnCreateUrl" class="btnCreateUrl d-none d-md-inline-block" data-toggle="tooltip" data-placement="top" title="Download Database">'
            codeArea += '<svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">';
            codeArea += '<path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />';
            codeArea += '<path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />';
            codeArea += '</svg>';
            codeArea += '</button>';
        }
        codeArea += '<div class="codeArea editor">';
        codeArea += '<pre><code></code></pre>';
        codeArea += '</div>';
        codeArea += '</div>';

        return codeArea;
    }

    function setupMainMenu() {
        let mainMenu = '<div class="row buttonArea mainMenu">';
        mainMenu += '<div class="col leftMenu">';
        mainMenu += '<button class="btnDelete codeButton" style="display: none;">';
        mainMenu += '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" fill="currentColor" class="bi bi-backspace" viewBox="0 0 16 16"><path d="M5.83 5.146a.5.5 0 0 0 0 .708L7.975 8l-2.147 2.146a.5.5 0 0 0 .707.708l2.147-2.147 2.146 2.147a.5.5 0 0 0 .707-.708L9.39 8l2.146-2.146a.5.5 0 0 0-.707-.708L8.683 7.293 6.536 5.146a.5.5 0 0 0-.707 0z" /><path d="M13.683 1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-7.08a2 2 0 0 1-1.519-.698L.241 8.65a1 1 0 0 1 0-1.302L5.084 1.7A2 2 0 0 1 6.603 1h7.08zm-7.08 1a1 1 0 0 0-.76.35L1 8l4.844 5.65a1 1 0 0 0 .759.35h7.08a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-7.08z" /></svg>';
        mainMenu += '</button>';
        mainMenu += '<button class="btnAdd codeButton" style="display: none;">';
        mainMenu += '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" fill="currentColor" class="bi bi-plus-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" /> <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" /></svg>';
        mainMenu += '</button>';
        mainMenu += '</div>';
        mainMenu += '<div class="col centerMenu d-none d-md-inline-block">';
        mainMenu += '<button style="display:none;" class="btnUndo ">';
        mainMenu += '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" fill="currentColor" class="bi bi-arrow-90deg-left" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z" /></svg>';
        mainMenu += '</button>';
        mainMenu += '<button style="display:none;" class="btnRedo ">';
        mainMenu += '<svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" fill="currentColor" class="bi bi-arrow-90deg-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4z" /></svg>';
        mainMenu += '</button>';
        mainMenu += '</div>';
        mainMenu += '<div class="col rightMenu d-none d-md-inline-block">';
        mainMenu += '<button class="btnRun">';
        mainMenu += ' <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16"><path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" /> <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" /></svg>';
        mainMenu += '</button>';
        mainMenu += '</div>';
        mainMenu += '<div class="col rightMenu d-md-none">';
        mainMenu += '<button class="btnRunMobile" data-toggle="modal" data-bs-toggle="modal" data-bs-target="#resultModal">';
        mainMenu += '<svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16"><path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" /><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" /> </svg>';
        mainMenu += '</button>';
        mainMenu += '</div>';
        mainMenu += '</div>';

        return mainMenu;
    }

    function setupButtonArea() {
        let buttonArea = '<div class="buttonArea codeComponents"></div>';

        return buttonArea;
    }

    function setupCodeModal() {
        let codeModal = '<div class="modal fade" id="universal-modal" tabindex="-1" aria-labelledby="universal-modal-label" aria-hidden="true">';
        codeModal += '<div class="modal-dialog">';
        codeModal += '<div class="modal-content">';
        codeModal += '<div class="modal-header">';
        codeModal += '<h5 class="modal-title" id="universal-modal-label">Modal title</h5>';
        codeModal += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
        codeModal += '</div>';
        codeModal += '<div class="modal-body"></div>';
        codeModal += '<div class="modal-footer">';
        codeModal += '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>';
        codeModal += '<button type="button" class="btn btn-primary">Save changes</button>';
        codeModal += '</div>';
        codeModal += '</div>';
        codeModal += '</div>';
        codeModal += '</div>';

        return codeModal;
    }

    function setupScrollDots() {
        let scrollDots = '<div class="row codeComponentsScrolldots d-md-none">'
        scrollDots += '<span><a class="activeDot">';
        scrollDots += '<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" /></svg>';
        scrollDots += '</a><a>';
        scrollDots += '<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" /></svg>';
        scrollDots += '</a><a>';
        scrollDots += '<svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" /></svg>';
        scrollDots += '</a></span>';
        scrollDots += '</div>';

        return scrollDots;
    }

    //////////
    //EVENTS//
    function initEvents() {
        //span click
        $(EDITOR_CONTAINER).on('click', '.codeArea.editor span', function (event) {

            event.stopPropagation();
            let elementNr;
            //
            if ($(this).data("goto-element") == "next") {
                elementNr = "0";
            }
            if ($(this).data("goto-element") == "parent") {
                elementNr = getElementNr($(this).parents().closest(".parent").last().attr("class"));
            } else if ($(this).data("goto-element") != undefined) {
                elementNr = $(this).data("goto-element");
            } else {
                elementNr = getElementNr($(this).attr("class"));
            }
            setSelection(elementNr, false);
        });

        // Select: change dbField, dbTable, Aggregatsfunktion
        $(EDITOR_CONTAINER).on('change', '.codeSelect', function () {

            if (CURRENT_SELECTED_ELEMENT != undefined) {
                let tempSelectField = this;
                let returnObject = {};
                // wich select is triggering?
                // -> selColumn, selTable
                if ($(tempSelectField).hasClass("selColumn") || $(tempSelectField).hasClass("selTable") || $(tempSelectField).hasClass("selOperators") || $(tempSelectField).hasClass("selTyp") || $(tempSelectField).hasClass("selConstraint") || $(tempSelectField).hasClass("selColumnCreate")) {

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

        // Button: run sql command - desktop
        $(EDITOR_CONTAINER).on('click', '.btnRun', function (event) {
            execSqlCommand(null, "desktop");
            RUN_FUNCTIONS.forEach(runFunction => {
                runFunction();
            });
        });
        // Button: run sql command - mobile 
        $(EDITOR_CONTAINER).on('click', '.btnRunMobile', function (event) {
            let tempCode = $(EDITOR_CONTAINER).find(".codeArea.editor pre code").html().trim();
            $(OUTPUT_CONTAINER_MOBILE).find(".codeArea pre code").html(tempCode);
            execSqlCommand(null, "mobile");
        });
        // Button: Delete Element
        $(EDITOR_CONTAINER).on('click', '.btnDelete', function (event) {
            deleteElement(CURRENT_SELECTED_ELEMENT);
            // aktualisiert alle .selColumn <select>
            updateSelectCodeComponents();
        });

        //Button: Add Element "inputField"
        $(EDITOR_CONTAINER).on('click', '.btnAdd', function (event) {
            let dataSqlElement = CURRENT_SELECTED_ELEMENT.data("sql-element");

            if (CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {

                if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "_AGGREGAT")) { //...
                    CURRENT_SELECTED_ELEMENT.after(addInputField(dataSqlElement, "extendedSpace"));

                } else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "WHERE_3, OR_3, AND_3")) { //...
                    CURRENT_SELECTED_ELEMENT.after(addInputField(dataSqlElement, "extendedSpace"));

                } else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "INSERT_1")) {
                    CURRENT_SELECTED_ELEMENT.after(addInputField(dataSqlElement, "insertInto"));
                } else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "INSERT_2")) {

                    let updateField1 = addLeerzeichenMitKomma();
                    updateField1 += "<span class='codeElement_" + NR + " inputField unfilled extended sqlIdentifier' data-sql-element='INSERT_2' data-next-element='" + (NR + 2) + "' data-element-group='" + (NR - 1) + "," + (NR + 1) + "," + (NR + 2) + "'>___</span>";
                    NR++;
                    CURRENT_SELECTED_ELEMENT.after(updateField1);

                    let lastInsert3Field = findElementBySqlData(CURRENT_SELECTED_ELEMENT.closest(".parent").children(), "INSERT_3", "last");

                    let updateField2 = addLeerzeichenMitKomma();
                    updateField2 += "<span class='codeElement_" + NR + " inputField unfilled extended sqlIdentifier' data-sql-element='INSERT_3' data-next-element='" + (NR + 2) + "' data-element-group='" + (NR - 1) + "," + (NR - 2) + "," + (NR - 3) + "'>___</span>";
                    NR++;
                    $(lastInsert3Field).after(updateField2);
                }
                //Create Table Spalte Typ ist gewählt, Feld für Einschränkung wird hinzugefügt
                else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "CREATE_COLUMN_2, CREATE_COLUMN_3")) {
                    let updateField1 = addLeerzeichen();
                    updateField1 += "<span class='codeElement_" + NR + " inputField unfilled extended sqlIdentifier' data-sql-element='CREATE_COLUMN_3' data-next-element='" + (NR + 2) + "' data-element-group=''>___</span>";
                    NEXT_ELEMENT_NR = NR;
                    NR++;
                    CURRENT_SELECTED_ELEMENT.after(updateField1);

                } else {
                    CURRENT_SELECTED_ELEMENT.after(addInputField(dataSqlElement, "extendedComma"));
                }
                setSelection(NEXT_ELEMENT_NR, false);
            }

            // UPDATE: fügt ", ___ = ___" hinzu
            else if (hasCurrentSelectedElementSqlDataString(CURRENT_SELECTED_ELEMENT, "UPDATE")) {
                let lastUpdateField = findElementBySqlData(CURRENT_SELECTED_ELEMENT.children(), "UPDATE_3", "last");
                let updateFields = addLeerzeichenMitKomma();
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

        // Input: add text to Selected Element span
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('keyup', '.codeInput', function (e) {
            if (CURRENT_SELECTED_ELEMENT != undefined) {
                let tempValue = $(this).val();
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
                    let classesFromCodeComponent = getClassesFromElementAsString(this);
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

        //Button: öffnet ein Modal für das anzeigen des atkuellen URLStrings.    
        $(EDITOR_CONTAINER).find("#btnCreateUrl").on("click", function () {
            let sqlVerineUrl = location.protocol + '//' + location.host + location.pathname;
            let urlDatabase = CURRENT_VERINE_DATABASE.name;
            let urlCode = escape($(".codeArea pre code").html().replaceAll("active", ""));
            let urlParameterString = sqlVerineUrl + "?db=" + urlDatabase + "&maxElementNr=" + NR + "&code=" + urlCode;
            let modal = new Modal(document.getElementById('universal-modal'));
            modal.toggle();
            $(EDITOR_CONTAINER).find("#universal-modal .modal-title").html("Link zum aktuellen Code:");
            $(EDITOR_CONTAINER).find("#universal-modal .modal-body").html("<textarea type='text' id='inputCreateUrl' class='form-control input-check' aria-label='' aria-describedby=''>" + urlParameterString + "</textarea>");
            $(EDITOR_CONTAINER).find("#universal-modal .modal-footer").html('<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">schließen</button> <button type="button" id="btnCopyLink" class="btn btn-primary">Link kopieren</button>');
        });
        $(EDITOR_CONTAINER).find("#universal-modal").on('click', '#btnCopyLink', function () {
            let copyUrl = document.getElementById("inputCreateUrl");
            copyUrl.select();
            copyUrl.setSelectionRange(0, 99999); /* For mobile devices */
            //kopiert den selektierten Text in die Zwischenablage
            document.execCommand("copy");
        });
    }

    /////////////
    //FUNCTIONS//

    //funtion: Sucht ein Element mit sql-element data attribut
    function findElementBySqlData(elements, attributeValue, position) {
        let tempElement;
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

    //function: get Element NR from Element ID
    function getElementNr(elementClasses) {
        return elementClasses.split(" ")[0].split("_")[1];
    }

    //function: add new line <span>
    function addNewLine() {
        let tempLeerzeichen = "<span class='codeElement_" + NR + " newline'><br></span>";
        NR++;
        return tempLeerzeichen;
    }

    //function: add Leerzeichen, Leerzeichen mit Komma, Komma <span>
    function addLeerzeichen() {
        let tempLeerzeichen = "<span class='codeElement_" + NR + " leerzeichen' data-goto-element='parent'>&nbsp;</span>";
        NR++;
        return tempLeerzeichen;
    }
    function addLeerzeichenMitKomma() {
        let tempLeerzeichen = "<span class='codeElement_" + NR + " leerzeichen' data-goto-element='parent'>, </span>";
        NR++;
        return tempLeerzeichen;
    }
    function addKomma() {
        let tempKomma = "<span class='codeElement_" + NR + " komma' data-goto-element='parent'>,</span>";
        NR++;
        return tempKomma;
    }

    //function: checks if data-sql-element contains string i.e. "WHERE_3, OR_3, AND_3"
    function hasCurrentSelectedElementSqlDataString(currentSelectedElement, sqlDataIdentifier) {
        let sqlStringFound = false;
        let tempSqlDataArray = sqlDataIdentifier.replaceAll(" ", "").split(",");
        tempSqlDataArray.forEach(element => {
            if (currentSelectedElement.data("sql-element").includes(element)) {
                sqlStringFound = true;
            }
        });
        return sqlStringFound;
    }

    //function: run sql command, type = desktop or mobile
    function execSqlCommand(tempSqlCommand, type) {
        //bereitet den sql Befehl vor
        let re = new RegExp(String.fromCharCode(160), "g"); // entfernt &nbsp;
        if (tempSqlCommand == null) {
            tempSqlCommand = $(EDITOR_CONTAINER).find(".codeArea.editor pre code").clone();
            tempSqlCommand.find(".codeline").prepend("<span>&nbsp;</span>");
            tempSqlCommand = tempSqlCommand.text().replaceAll(re, " ").trim();
        }
        //versucht den sql Befehl auszuführen und gibt im Debugbereich das Ergebnis oder die Fehlermeldung aus
        try {
            //löscht alte Ausgabe
            $(OUTPUT_CONTAINER_MOBILE).find(".resultArea").html("");
            $(OUTPUT_CONTAINER).html("");

            let result = CURRENT_VERINE_DATABASE.database.exec(tempSqlCommand);
            //wurde ein delete, insert, update Befehl ausgeführt?
            let modifiedRows = CURRENT_VERINE_DATABASE.database.getRowsModified();
            if (modifiedRows > 0) {

                let deleteSQL = tempSqlCommand.match(/(DELETE FROM)\s(.*?)/);
                let updateSQL = tempSqlCommand.match(/(UPDATE)\s(.*?)/);
                let insertSQL = tempSqlCommand.match(/(INSERT INTO)\s(.*?)/);

                if (insertSQL != null && insertSQL.length > 0) {
                    $(OUTPUT_CONTAINER).append("<h5>" + modifiedRows + " Zeilen wurden in der Tabelle: " + insertSQL[2] + " eingefügt.</h5><br>");
                    result = CURRENT_VERINE_DATABASE.database.exec("SELECT * FROM " + insertSQL[2]);
                } else if (updateSQL != null && updateSQL.length > 0) {
                    $(OUTPUT_CONTAINER).append("<h5>" + modifiedRows + " Zeilen wurden in der Tabelle: " + updateSQL[2] + " aktualisiert.</h5><br>");
                    result = CURRENT_VERINE_DATABASE.database.exec("SELECT * FROM " + updateSQL[2]);
                } else if (deleteSQL != null && deleteSQL.length > 0) {
                    $(OUTPUT_CONTAINER).append("<h5>" + modifiedRows + " Zeilen wurden aus der Tabelle: " + deleteSQL[2] + " gelöscht.</h5><br>");
                    result = CURRENT_VERINE_DATABASE.database.exec("SELECT * FROM " + deleteSQL[2]);
                }
            }

            //wurde drop, create, alter table ausgeführt?
            let dropTableSQL = tempSqlCommand.match(/(DROP TABLE)\s(.*?)/);
            let createTableSQL = tempSqlCommand.match(/(CREATE TABLE)\s'(.*?)'/);
            let alterTableSQL = tempSqlCommand.match(/(ALTER TABLE)\s(.*?)/);
            let tablesChanged = false;

            if (dropTableSQL != null && dropTableSQL.length > 0) {
                $(OUTPUT_CONTAINER).append("<h5>Die Tabelle: " + dropTableSQL[2] + " wurde gelöscht.</h5><br>");
                tablesChanged = true;
            } else if (createTableSQL != null && createTableSQL.length > 0) {
                $(OUTPUT_CONTAINER).append("<h5>Die Tabelle: " + createTableSQL[2] + " wurde neu erstellt.</h5><br>");
                tablesChanged = true;
            } else if (alterTableSQL != null && alterTableSQL.length > 0) {
                $(OUTPUT_CONTAINER).append("<h5>Die Tabelle: " + alterTableSQL[2] + " wurde verändert.</h5><br>");
                tablesChanged = true;
                result = CURRENT_VERINE_DATABASE.database.exec("SELECT * FROM " + alterTableSQL[2]);
            }
            //Datenbankschema wird aktualisiert, wenn sich etwas an den Tabellen geändert hat
            if (tablesChanged) {
                $(SCHEMA_CONTAINER).html(CURRENT_VERINE_DATABASE.createTableInfo("1,2"));
            }

            //erstellt eine Tabelle mit den Ergebnissen
            for (let i = 0; i < result.length; i++) {
                if (type == "mobile") $(OUTPUT_CONTAINER_MOBILE).find(".resultArea").append(createTableSql(result[i].columns, result[i].values));
                else if (type == "desktop") {
                    $(OUTPUT_CONTAINER).append("" + createTableSql(result[i].columns, result[i].values) + "");
                };
            }

        } catch (err) {
            if (type == "mobile") $(OUTPUT_CONTAINER_MOBILE).find(".resultArea").html(err.message);
            else if (type == "desktop") {
                $(OUTPUT_CONTAINER).html("<h4>SQL Fehler:</h4>" + "<span style='color: tomato;'>" + err.message + "</span>");
            };
        }
    }

    //function: Erstellt eine Tabelle mit den Resultaten einer SQL Abfrage
    function createTableSql(columns, values) {

        SOLUTION_ALL_ARRAY = [];
        SOLUTION_ROW_COUNTER = 0;

        let newTable = "<div class='table-responsive'><table class='table table-bordered tableSql' style=''>";
        newTable += "<thead>";
        columns.forEach((column) => {
            newTable += "<th scope='col'>" + column + "</th>";
        });
        newTable += "</thead>";

        newTable += "<tbody>";
        values.forEach((value) => {
            newTable += "<tr>";
            SOLUTION_ROW_COUNTER++;
            value.forEach((element, indexColumn) => {
                //fügt Elemente dem Ergebnis Array hinzu -> wird für das Überprüfen der Aufgabe benötigt
                if (ACTIVATE_EXERCISES) checkElement(element, columns[indexColumn]);
                if (element != null && element.length > 200) {
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

    function checkElement(value, column) {
        let CURRENT_EXERCISE = CURRENT_VERINE_DATABASE.getExerciseById(CURRENT_VERINE_DATABASE.getCurrentExerciseId());
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

    //function: erstellt neue select elemente basierend auf den gewählten Tabellen in der code area
    function updateSelectCodeComponents() {
        //check all used tables in code area
        updateUsedTables();
        //entfernt alle .inputField die ein Feld einer gelöscht Tabelle haben
        $(EDITOR_CONTAINER).find(".codeArea.editor .selColumn").each(function () {
            let isTableActive = false;
            USED_TABLES.forEach(element => {
                if ($(this).hasClass(element)) {
                    isTableActive = true;
                    let updatedFieldNameBasedOnTableCount = $(this).html().replace(element + ".", "");
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
            let elementGroup = elementToDelete.data("element-group");
            if (elementGroup != undefined) {
                let idsToDelete = elementGroup.toString().split(",");
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
            let dataSqlElement = elementToDelete.data("sql-element");
            elementToDelete.replaceWith(addInputField(dataSqlElement, "root"));
            setSelection(NEXT_ELEMENT_NR, false);
        }
        // don´t delete, select parent Element
        else {
            let elementNr = getElementNr(elementToDelete.parent().attr('class'));
            setSelection(elementNr, false);
        }

        //überprüft den eingegebenen Code und passt diesen ggf. an 
        cleanSQLCode();
    }

    //function: returns a normal or extended inputField ( ___ or ,___ )
    function addInputField(tempSqlElement, type) {
        let tempInputField = "";
        if (type == "root") {
            tempInputField = "<span class='codeElement_" + NR + " inputField unfilled sqlIdentifier root' data-sql-element='" + tempSqlElement + "'>___</span>";
            NEXT_ELEMENT_NR = NR;
            NR++;
        } else if (type == "extendedComma") {
            tempInputField = addLeerzeichenMitKomma();
            tempInputField += "<span class='codeElement_" + NR + " inputField unfilled sqlIdentifier extended comma' data-sql-element='" + tempSqlElement + "'>___</span>";
            NEXT_ELEMENT_NR = NR;
            NR++;
        } else if (type == "extendedSpace") {
            tempInputField = addLeerzeichen();
            tempInputField += "<span class='codeElement_" + NR + " inputField unfilled sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>___</span>";
            NEXT_ELEMENT_NR = NR;
            NR++;
        } else if (type == "insertInto") {
            tempInputField = addLeerzeichen();
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
        let classesFromCodeComponent = getClassesFromElementAsString(tempSelectField);
        let tempSqlElement = CURRENT_SELECTED_ELEMENT.data("sql-element");
        let tempAggregat = "";
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


    //function: überprüft den eingegebenen Code und passt diesen ggf. an
    function cleanSQLCode() {
        //sucht alle Elemente mit Klasse .createComma und fügt im .komma span ein Komma hinzu
        $(EDITOR_CONTAINER).find('.createComma').each(function () {
            $(this).find(".komma").html(",")
        });
        //entfernt das letzte Komma der .createComma Klassen
        $(EDITOR_CONTAINER).find(".codeArea pre code").find(".createComma .komma").last().html("");

        // deletes all empty <span class="codeline">
        $(EDITOR_CONTAINER).find(".codeline").each(function () {
            if ($(this).children().length == 0) $(this).remove();
        });
    }

    //function: löscht ein Element anhand einer ID z.B.: 5
    function deleteElementById(elementId) {
        $(EDITOR_CONTAINER).find(".codeArea.editor pre code").find(".codeElement_" + elementId).remove();
    }

    //function: adds a selected Value from and <select> Component
    function addSelectValue(tempSelectField) {
        let classesFromCodeComponent = getClassesFromElementAsString(tempSelectField);
        let tempElementId = getElementNr(CURRENT_SELECTED_ELEMENT.attr("class"));

        let tempSqlElement = CURRENT_SELECTED_ELEMENT.data("sql-element");
        let tempNextElement = CURRENT_SELECTED_ELEMENT.data("next-element");
        let tempGroupElement = CURRENT_SELECTED_ELEMENT.data("element-group");

        let tempSelectValue = "";
        if (CURRENT_SELECTED_ELEMENT.hasClass("extended")) {
            tempSelectValue += "<span class='codeElement_" + tempElementId + " " + classesFromCodeComponent + " inputField sqlIdentifier extended' data-sql-element='" + tempSqlElement + "' data-next-element='" + tempNextElement + "' data-element-group='" + tempGroupElement + "'>" + tempSelectField.value + "</span>";
        } else {
            tempSelectValue += "<span class='codeElement_" + tempElementId + " " + classesFromCodeComponent + " inputField sqlIdentifier root' data-sql-element='" + tempSqlElement + "' data-next-element='" + tempNextElement + "' data-element-group='" + tempGroupElement + "'>" + tempSelectField.value + "</span>";
        }
        let returnObject = {};
        returnObject.tempSelectValue = tempSelectValue;
        returnObject.thisCodeElement = ".codeElement_" + tempElementId;

        return returnObject;
    }

    //function: get Element NR from Element ID
    function getElementNr(elementClasses) {
        return elementClasses.split(" ")[0].split("_")[1];
    }

    //function: add Leerzeichen <span>
    function addLeerzeichen() {
        let tempLeerzeichen = "<span class='codeElement_" + NR + " leerzeichen' data-goto-element='parent'>&nbsp;</span>";
        NR++;
        return tempLeerzeichen;
    }

    //function: liefert alle Klassen eines Elements als String zurück, außer der letzten Kontrollklasse (codeButton, codeSelect, codeInput)
    function getClassesFromElementAsString(element) {
        let codeComponentClassesAsString = $(element).attr("class").replace(/[\W]*\S+[\W]*$/, '');
        return codeComponentClassesAsString;
    }

    //function: set Selection to an Element
    function setSelection(elementNr, removeLastSelectedElement) {
        let element;

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
        else if (elementNr == "parent2") {
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

        //erstes .parent element in .codeline ist selektiert
        else if (elementNr == "parent") {
            //erstes .parent der .codeline?
            if (CURRENT_SELECTED_ELEMENT.prev(".parent").length == 0) {
                //erste .codeline in der CodeArea?
                if (CURRENT_SELECTED_ELEMENT.parent().prev(".codeline").length == 0) {
                    if (removeLastSelectedElement) $(EDITOR_CONTAINER).find('.codeArea.editor pre code').html(""); // lösche alles, keine neue 
                } else { //hat ein prev .codeline                    
                    element = CURRENT_SELECTED_ELEMENT.parent().prev(".codeline").find(".parent").last();
                    CURRENT_SELECTED_ELEMENT = CURRENT_SELECTED_ELEMENT.parent(); //aktuelle Codeline
                }
            } else { //hat ein prev .parent

            }
        }

        //next element is chosen by number
        else {
            element = $(EDITOR_CONTAINER).find(".codeArea.editor pre code .codeElement_" + elementNr);
        }

        removeSelection(removeLastSelectedElement);

        if (element != undefined && element.length != 0) {
            element.addClass("active");
            CURRENT_SELECTED_ELEMENT = element;
            CURRENT_SELECTED_SQL_ELEMENT = element.closest(".sqlIdentifier").data("sql-element");
        } else {
            CURRENT_SELECTED_SQL_ELEMENT = "START";
        }
        updateActiveCodeView();
    }

    //function: remove Selection from all Elements
    function removeSelection(removeLastSelectedElement) {
        $(EDITOR_CONTAINER).find("[class^='codeElement_']").removeClass("active");
        $(EDITOR_CONTAINER).find(".codeInput").val("");
        if (removeLastSelectedElement) CURRENT_SELECTED_ELEMENT.remove();
        CURRENT_SELECTED_ELEMENT = undefined;
    }

    //function: loops through JSON Data and shows Elements based on selected SQL Element
    function updateActiveCodeView() {

        //reset add und delete Button
        $(EDITOR_CONTAINER).find(".buttonArea.mainMenu .btnAdd").hide();
        $(EDITOR_CONTAINER).find(".buttonArea.mainMenu .btnDelete").hide();

        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").html("");

        ACTIVE_CODE_VIEW_DATA.forEach(element => {
            if (element.selectedSQLElement == CURRENT_SELECTED_SQL_ELEMENT) {

                //Code Components: sollen auf max x (3) Zeilen verteilt werden
                let maxZeilen = 3;
                let maxComponents = element.visibleCodeComponents.length;
                let componentCounter = 0;

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

        initScrollDots();
    }

    //function: befüllt .selTable mit allen Tabellen der Datenbank
    function fillSelectionTables() {
        clearSelectionOptions(".buttonArea .selTable");
        let databaseTables = getSqlTables();
        for (let i = 0; i < databaseTables.length; i++) {
            if (databaseTables[i] != "verine_exercises") {
                $(EDITOR_CONTAINER).find(".buttonArea .selTable").append(new Option(databaseTables[i], databaseTables[i]));
            }
        }
    }

    //function: befüllt die .selColumn Element mit Feldern der genutzten Datenbanken
    function fillSelectionFields(tableName, selectFields) {
        let tempTableFields = getSqlTableFields(tableName);
        tempTableFields.forEach(element => {
            $(selectFields).append(new Option(element[1], element[1]));
        });
    }

    //function: befüllt .selColumnCreate mit allen Spalten im SQL Crate Statement
    function fillSelectionCreateColumns() {
        let createSQLStatementLines = $(EDITOR_CONTAINER).find(".codeArea.editor pre code").text().replace(/CREATE TABLE\s'(.*?)'/, "").split(",");
        createSQLStatementLines.forEach(element => {
            let currentLineColumn = element.match(/'(.*?)'/);
            if (currentLineColumn != null && currentLineColumn.length > 0) {
                $(EDITOR_CONTAINER).find(".buttonArea .selColumnCreate").append(new Option(currentLineColumn[1], currentLineColumn[1]));
            }

        });
    }

    //function: entfernt alle select Optionen außer die erste
    function clearSelectionOptions(selectElement) {
        $(selectElement + ' option[value!="0"]').remove();
    }

    //SQLite functions:
    function getSqlTables() {
        return CURRENT_VERINE_DATABASE.database.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")[0].values;
    }

    function getSqlTableFields(tempTableName) {
        return CURRENT_VERINE_DATABASE.database.exec("PRAGMA table_info(" + tempTableName + ")")[0].values;
    }

    //function: In der mobilen Ansicht werden Dots anstelle einer horizontalen Scrollbar für die CodeComponents angezeigt.
    function initScrollDots() {
        let dotCount = Math.ceil($(EDITOR_CONTAINER).find(".buttonArea.codeComponents").get(0).scrollWidth / $(".buttonArea.codeComponents").get(0).clientWidth);
        $(EDITOR_CONTAINER).find(".codeComponentsScrolldots span").html("");
        if (dotCount > 1) {
            for (let index = 0; index < dotCount; index++) {
                if (index == 0) {
                    $(EDITOR_CONTAINER).find(".codeComponentsScrolldots span").append('<a class="activeDot"><svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"> <circle cx="8" cy="8" r="8"/></svg></a>');
                } else {
                    $(EDITOR_CONTAINER).find(".codeComponentsScrolldots span").append('<a><svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"> <circle cx="8" cy="8" r="8"/></svg></a>');
                }
            }
        }
    }

    //function: get all used db tables in code area
    function updateUsedTables() {
        USED_TABLES = [];
        $(EDITOR_CONTAINER).find(".codeArea.editor .selTable").each(function () {
            if (!USED_TABLES.includes($(this).html())) {
                USED_TABLES.push($(this).html());
            }
        });
    }


    ///////////////////
    //Code Components//

    //function: fügt der buttonArea aktuell notwendige codeComponents hinzu
    function createCodeComponent(codeComponent, option) {
        switch (codeComponent) {
            case "zeilenumbruch":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<br>');
                break;
            case ".btnSelect":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnSelect synSQL sqlSelect codeButton">SELECT ___ FROM ___</button>');
                break;
            case ".btnWhere":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnWhere synSQL sqlWhere codeButton">WHERE ___ ___ ___</button>');
                break;
            case ".btnOrder":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnOrder synSQL sqlOrder codeButton">ORDER BY ___</button>');
                break;
            case ".btnLimit":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnLimit synSQL sqlOrder codeButton">LIMIT ___</button>');
                break;
            case ".btnOffset":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnOffset synSQL sqlOrder codeButton">OFFSET ___</button>');
                break;
            case ".btnGroup":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnGroup synSQL sqlGroup codeButton">GROUP BY ___</button>');
                break;
            case ".btnJoin":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnJoin synSQL sqlJoin codeButton">JOIN ___ ON ___ ___ ___</button>');
                break;
            case ".selColumn":
                let selColumn = "<select class='selColumn synColumns " + option + " codeSelect'>";
                selColumn += "<option value='0' disabled selected hidden>Spalten " + option + "</option>";
                selColumn += "<option value='*'>*</option>";
                selColumn += "</select>";
                let selColumnDom = $.parseHTML(selColumn);
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append(selColumnDom);
                fillSelectionFields(option, selColumnDom);
                break;
            case ".selTable":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selTable synTables codeSelect"><option value="0" disabled selected hidden>Tabelle wählen</option></select>');
                fillSelectionTables();
                break;
            case ".selColumnCreate":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selColumnCreate synColumns codeSelect"><option value="0" disabled selected hidden>Spalte wählen</option></select>');
                fillSelectionCreateColumns();
                break;
            case ".selAggregate":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selAggregate synSQL sqlSelect codeSelect"><option value="" disabled selected hidden>Aggregatsfunktion wählen</option><option value="AVG">AVG ( ___ )</option><option value="COUNT">COUNT ( ___ )</option><option value="MIN">MIN ( ___ )</option><option value="MAX">MAX ( ___ )</option><option value="SUM">SUM ( ___ )</option></select>');
                break;
            case ".btnAND":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnAND synSQL sqlWhere codeButton">AND</button>');
                break;
            case ".btnOR":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnOR synSQL sqlWhere codeButton">OR</button>');
                break;
            case ".btnLeftBracket":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnLeftBracket synBrackets sqlWhere codeButton">(</button>');
                break;
            case ".btnRightBracket":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnRightBracket synBrackets sqlWhere codeButton">)</button>');
                break;
            case ".selOperators":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selOperators synOperators sqlWhere codeSelect"><option value="" disabled selected hidden>Operator wählen</option><option value="=">=</option><option value="&gt;">&gt;</option><option value="&lt;">&lt;</option><option value="&gt;=">&gt;=</option><option value="=">&lt;=</option><option value="&lt;&gt;">&lt;&gt;</option><option value="BETWEEN">BETWEEN ___ AND ___</option><option value="LIKE">LIKE</option><option value="IN">IN (___)</option></select>');
                break;
            case ".inputValue":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<input type="text" placeholder="Wert" class="inputValue synValue codeInput"> </input>');
                break;
            case ".btnAsc":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnAsc synSQL sqlOrder codeButton">ASC</button>');
                break;
            case ".btnDesc":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnDesc synSQL sqlOrder codeButton">DESC</button>');
                break;
            case ".btnHaving":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnHaving synSQL sqlGroup codeButton">HAVING ___ ___ ___</button>');
                break;
            case ".btnSQLDelete":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnSQLDelete synSQL sqlDelete">DELETE FROM ___</button>');
                break;
            case ".btnUpdate":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnUpdate synSQL sqlUpdate">UPDATE ___ SET ___ = ___</button>');
                break;
            case ".btnInsert":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnInsert synSQL sqlInsert">INSERT INTO ___ (___) VALUES (___)</button>');
                break;
            case ".btnDropTable":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnDropTable synSQL sqlDelete">DROP TABLE ___</button>');
                break;
            case ".btnAlterTable":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnAlterTable synSQL sqlDelete">ALTER TABLE ___</button>');
                break;
            case ".btnDropColumn":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnDropColumn synSQL sqlDelete">DROP COLUMN ___</button>');
                break;
            case ".btnRenameTo":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnRenameTo synSQL sqlDelete">RENAME ___ TO ___</button>');
                break;
            case ".btnAddColumn":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnAddColumn synSQL sqlDelete">ADD ___ TYP</button>');
                break;
            case ".selTyp":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selTyp synTyp codeSelect"><option value="" disabled selected hidden>Typ wählen</option><option value="INTEGER">INTEGER</option><option value="TEXT">TEXT</option><option value="REAL">REAL</option><option value="BLOB">BLOB</option></select>');
                break;
            case ".selConstraint":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selConstraint synTyp codeSelect"><option value="" disabled selected hidden>Typ wählen</option><option value="UNIQUE">UNIQUE</option><option value="PRIMARY KEY">PRIMARY KEY</option><option value="AUTOINCREMENT">AUTOINCREMENT</option><option value="FOREIGN KEY">FOREIGN KEY</option><option value="NOTT NULL">NOT NULL</option></select>');
                break;
            case ".btnCreateTable":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnCreateTable synSQL sqlDelete">CREATE TABLE ___ ( )</button>');
                break;
            case ".btnCreateColumn":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnCreateColumn synSQL sqlDelete"> NEUE SPALTE ___ </button>');
                break;
            case ".btnCreateForeignKey":
                $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnCreateForeignKey synSQL sqlDelete"> FOREIGN KEY ___ REFERENCES ___ (___)</button>');
                break;
            default:
            //log("no component found")
        }
    }

    //initialisiert die Events für die CodeComponents Buttons
    function initCodeComponentsButtons() {
        // Button: SELECT ___ FROM ___
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnSelect', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            CURRENT_SELECTED_ELEMENT = undefined;
            let elementSELECT_FROM = "<span class='codeline'>";
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
            $(EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementSELECT_FROM);
            setSelection(NEXT_ELEMENT_NR, false);
        });

        // Button: WHERE ___ ___ ___ 
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnWhere', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementWHERE = "<span class='codeline'>";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnJoin', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementJOIN = "<span class='codeline'>";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnAND', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let parentSqlIdentifier = CURRENT_SELECTED_ELEMENT.data("sql-element");
            let elementWhereAND = "";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnOR', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let parentSqlIdentifier = CURRENT_SELECTED_ELEMENT.data("sql-element");
            let elementWhereOR = "";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnLeftBracket', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            if (CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {
                CURRENT_SELECTED_ELEMENT.before("<span class='codeElement_" + NR + "  " + classesFromCodeComponent + " sqlIdentifier extended' data-sql-element='LEFTBRACKET'> ( </span>");
                NR++;
            }
        });
        //Button: RightBracket
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnRightBracket', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            if (CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {
                CURRENT_SELECTED_ELEMENT.after("<span class='codeElement_" + NR + "  " + classesFromCodeComponent + " sqlIdentifier extended' data-sql-element='RIGHTBRACKET'> ) </span>");
                NR++;
            }
        });

        // Button: ORDER BY ___ 
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnOrder', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementORDER = "";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnAsc', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementOrderAsc = "";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnDesc', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementOrderDesc = "";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnLimit', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementLIMIT = "";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnOffset', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementOFFSET = "";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnGroup', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementGROUP = "";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnHaving', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementHAVING = "<span class='codeline'>";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnSQLDelete', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementDELETE_FROM = "<span class='codeline'>";
            elementDELETE_FROM += "<span class='codeElement_" + NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DELETE_FROM'>";
            NR++;
            elementDELETE_FROM += "DELETE FROM";
            elementDELETE_FROM += addLeerzeichen();
            elementDELETE_FROM += "<span class='codeElement_" + NR + " inputField unfilled root sqlIdentifier' data-sql-element='DELETE_FROM_1' data-next-element='" + (NR + 2) + "'>___</span>";
            NEXT_ELEMENT_NR = NR;
            NR++;
            elementDELETE_FROM += "</span></span>";

            $(EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementDELETE_FROM);
            setSelection(NEXT_ELEMENT_NR, false);
        });

        // Button: UPDATE ___ SET ___ = ___ 
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnUpdate', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementUPDATE = "<span class='codeline'>";
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

            $(EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementUPDATE);
            setSelection(NEXT_ELEMENT_NR, false);
        });

        // Button: INSERT INTO ___ (___) VALUES (___) 
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnInsert', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementINSERT = "<span class='codeline'>";
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

            $(EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementINSERT);
            setSelection(NEXT_ELEMENT_NR, false);
        });

        // Button: DROP TABLE ___ 
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnDropTable', function () {
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

            $(EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementDROP_TABLE);
            setSelection(NEXT_ELEMENT_NR, false);
        });

        // Button: ALTER TABLE ___ 
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnAlterTable', function () {
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

            $(EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementALTER_TABLE);
            setSelection(NEXT_ELEMENT_NR, false);
        });

        // Button: DROP COLUMN ___ 
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnDropColumn', function () {
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnRenameTo', function () {
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnAddColumn', function () {
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnCreateTable', function () {
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

            $(EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementCREATE_TABLE);
            setSelection(NEXT_ELEMENT_NR, false);
        });
        // Button: CREATE... spaltenname TYP EINSCHRÄNKUNG 
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnCreateColumn', function () {
            let classesFromCodeComponent = getClassesFromElementAsString(this);
            let elementCREATE_COLUMN = "<span class='codeline'>";
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
        $(EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnCreateForeignKey', function () {
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

    }

    // returns Editor Object
    return sqlVerineEditor;

}());