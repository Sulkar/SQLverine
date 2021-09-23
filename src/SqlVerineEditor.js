import $ from "jquery";
import {
    Modal
} from "bootstrap";
import "./css/SqlVerineEditor.css"

export class SqlVerineEditor {

    constructor() {
        this.NR = 0;
        this.NEXT_ELEMENT_NR = 0;
        this.CURRENT_SELECTED_ELEMENT = undefined;
        this.CURRENT_SELECTED_SQL_ELEMENT = "START";
        this.ACTIVE_CODE_VIEW_DATA;
        this.CURRENT_VERINE_DATABASE;
        this.USED_TABLES = [];
        this.EDITOR_CONTAINER;
        this.SCHEMA_CONTAINER;
        this.OUTPUT_CONTAINER;
        this.OUTPUT_CONTAINER_MOBILE;
        this.RUN_FUNCTIONS_DESKTOP = [];
        this.RUN_FUNCTIONS_MOBILE = [];
        this.URLCODE = undefined;
        this.URL_CURRENT_ID = undefined;
        this.SOLUTION_ALL_ARRAY = [];
        this.SOLUTION_ROW_COUNTER = 0;
        this.ACTIVATE_EXERCISES = false;
        this.SHOW_CODE_BTN = true;
        this.SHOW_RUN_BTN = true;
        this.SHOW_CODE_SWITCH = true;
        this.SHOW_EXERCISE_TABLE = false;
        this.FORMULAR_DATA;
    }

    //Initialisierung des SqlVerineEditors
    init() {
        this.NR = 0;
        this.NEXT_ELEMENT_NR = 0;
        this.CURRENT_SELECTED_ELEMENT = undefined;
        this.CURRENT_SELECTED_SQL_ELEMENT = "START";
        this.USED_TABLES = [];
        //
        this.loadActiveCodeViewData();
        this.setupEditor();
        //
        this.initEvents(this);
        this.initCodeComponentsButtons(this);
        //

    }
    //Initialisierung des SqlVerineEditors
    reinit() {
        this.NR = 0;
        this.NEXT_ELEMENT_NR = 0;
        this.CURRENT_SELECTED_ELEMENT = undefined;
        this.CURRENT_SELECTED_SQL_ELEMENT = "START";
        this.USED_TABLES = [];
        //
        $(this.EDITOR_CONTAINER).find('.codeArea.editor pre code').html("");
        this.updateActiveCodeView();
        if (this.URLCODE != undefined) {
            this.fillCodeAreaWithCode(unescape(this.URLCODE), this.URL_CURRENT_ID);
        }
    }

    setVerineDatabase(verineDatabase) {
        this.CURRENT_VERINE_DATABASE = verineDatabase;
    }
    setEditorContainer(editorContainer) {
        this.EDITOR_CONTAINER = document.getElementById(editorContainer);
    }
    setSchemaContainer(schemaContainer) {
        this.SCHEMA_CONTAINER = document.getElementById(schemaContainer);
    }
    setOutputContainer(outputContainer) {
        this.OUTPUT_CONTAINER = document.getElementById(outputContainer);
    }
    setOutputContainerMobile(outputContainerMobile) {
        this.OUTPUT_CONTAINER_MOBILE = document.getElementById(outputContainerMobile);
    }
    addRunFunctionDesktop(runFunction) {
        this.RUN_FUNCTIONS_DESKTOP.push(runFunction);
    }
    addRunFunctionMobile(runFunction) {
        this.RUN_FUNCTIONS_MOBILE.push(runFunction);
    }
    resetRunFunctions() {
        this.RUN_FUNCTIONS_DESKTOP = [];
        this.RUN_FUNCTIONS_MOBILE = [];
    }
    setUrlCodeParameters(code, currentID) {
        this.URLCODE = code;
        this.URL_CURRENT_ID = currentID;
    }
    getSolutionAllArray() {
        return this.SOLUTION_ALL_ARRAY;
    }
    getSolutionRowCounter() {
        return this.SOLUTION_ROW_COUNTER;
    }
    activateExercises(activate) {
        this.ACTIVATE_EXERCISES = activate;
    }
    showCodeButton(showCodeButton) {
        this.SHOW_CODE_BTN = showCodeButton;
    }
    showCodeSwitch(showCodeSwtich) {
        this.SHOW_CODE_SWITCH = showCodeSwtich;
    }
    showRunButton(showRunButton){
        this.SHOW_RUN_BTN = showRunButton;
    }
    showExerciseTable() {
        this.SHOW_EXERCISE_TABLE = true;
    }
    hideExerciseTable() {
        this.SHOW_EXERCISE_TABLE = false;
    }

    loadActiveCodeViewData() {
        //load json synchronously
        var request = new XMLHttpRequest();
        request.open('GET', "data/activeCodeViewData.json", false);
        request.send(null);

        if (request.status === 200) {
            this.ACTIVE_CODE_VIEW_DATA = JSON.parse(request.responseText);
        }
    }

    fillCodeAreaWithCode(code, currentId) {
        $(this.EDITOR_CONTAINER).find('.codeArea.editor pre code').html(code); //unescape(this.URLCODE)
        this.NR = currentId; //this.URL_CURRENT_ID
    }

    setupEditor() {
        let sqlVerineEditor = this.setupCodeArea() + this.setupMainMenu() + this.setupButtonArea() + this.setupScrollDots() + this.setupCodeModal();
        this.EDITOR_CONTAINER.innerHTML = sqlVerineEditor;
    }

    setupCodeArea() {
        let codeArea = '<div class="codeAreaWrapper">';
        //text to code switch
        if (this.SHOW_CODE_SWITCH) {
            codeArea += '<div id="sqlVerineSwitchForm" class="form-check form-switch d-none d-lg-inline-block"><input class="form-check-input" type="checkbox" id="sqlVerineSwitch"><label class="form-check-label" for="sqlVerineSwitch">Aa</label></div>';
        }

        //button create url
        if (this.SHOW_CODE_BTN) {
            codeArea += '<button id="btnCreateUrl" class="btnCreateUrl d-none d-lg-inline-block" data-toggle="tooltip" data-placement="top" title="Download Database">'
            codeArea += '<svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">';
            codeArea += '<path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />';
            codeArea += '<path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />';
            codeArea += '</svg>';
            codeArea += '</button>';
        }

        codeArea += '<div id="codeAreaText"><textarea class="form-control" rows="3"></textarea></div>';

        //code area
        codeArea += '<div class="codeArea editor">';
        codeArea += '<pre><code></code></pre>';
        codeArea += '</div>';
        codeArea += '</div>';

        return codeArea;
    }

    setupMainMenu() {
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
        if (this.SHOW_RUN_BTN) {
            mainMenu += '<button class="btnRun">';
            mainMenu += ' <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16"><path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" /> <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" /></svg>';
            mainMenu += '</button>';
        }
        mainMenu += '</div>';
        mainMenu += '<div class="col rightMenu d-md-none">';
        mainMenu += '<button class="btnRunMobile">';
        mainMenu += '<svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16"><path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" /><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" /> </svg>';
        mainMenu += '</button>';
        mainMenu += '</div>';
        mainMenu += '</div>';

        return mainMenu;
    }

    setupButtonArea() {
        let buttonArea = '<div class="buttonArea codeComponents"></div>';
        return buttonArea;
    }

    setupCodeModal() {
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

    setupScrollDots() {
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
    initEvents(sqlVerineEditor) {

        //Switch codeAreaText -> Codearea
        $(sqlVerineEditor.EDITOR_CONTAINER).find('#sqlVerineSwitchForm').on('change', '#sqlVerineSwitch', function (event) {
            $(sqlVerineEditor.EDITOR_CONTAINER).find("#codeAreaText").toggle();
            $(sqlVerineEditor.EDITOR_CONTAINER).find(".codeArea").toggle();
        });

        //codeAreaText: strg + enter führt sql Code aus
        $(sqlVerineEditor.EDITOR_CONTAINER).find("#codeAreaText").on('keydown', 'textarea', function (event) {
            if (event.ctrlKey && event.keyCode === 13) {
                sqlVerineEditor.execSqlCommand(null, "desktop");
                sqlVerineEditor.RUN_FUNCTIONS_DESKTOP.forEach(runFunction => {
                    runFunction();
                });
            }
        });

        //span click
        $(sqlVerineEditor.EDITOR_CONTAINER).on('click', '.codeArea.editor span', function (event) {
            let self = this;
            event.stopPropagation();
            let elementNr;
            //
            if ($(self).attr("data-goto-element") == "next") {
                elementNr = "0";
            }
            if ($(self).attr("data-goto-element") == "parent") {
                elementNr = sqlVerineEditor.getElementNr($(self).parents().closest(".parent").last().attr("class"));
            } else if ($(self).attr("data-goto-element") != undefined) {
                elementNr = $(self).attr("data-goto-element");
            } else {
                elementNr = sqlVerineEditor.getElementNr($(self).attr("class"));
            }
            sqlVerineEditor.setSelection(elementNr, false);
        });

        // Select: change dbField, dbTable, Aggregatsfunktion
        $(sqlVerineEditor.EDITOR_CONTAINER).on('change', '.codeSelect', function () {
            let self = this;

            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT != undefined) {
                let tempSelectField = self;
                let returnObject = {};
                // wich select is triggering?
                // -> selColumn, selTable
                if ($(tempSelectField).hasClass("selColumn") || $(tempSelectField).hasClass("selTable") /*|| $(tempSelectField).hasClass("selOperators")*/ || $(tempSelectField).hasClass("selTyp") || $(tempSelectField).hasClass("selConstraint") || $(tempSelectField).hasClass("selColumnCreate")) {

                    if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.hasClass("extended") && sqlVerineEditor.CURRENT_SELECTED_ELEMENT.hasClass("comma")) { //Feld erweitert ,___
                        returnObject = sqlVerineEditor.addSelectValue(tempSelectField);
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.replaceWith(returnObject.tempSelectValue);
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT = $(returnObject.thisCodeElement);

                        sqlVerineEditor.setSelection("next", false);
                    } else if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.hasClass("extended")) { //Feld erweitert ___
                        returnObject = sqlVerineEditor.addSelectValue(tempSelectField);
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.replaceWith(returnObject.tempSelectValue);
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT = $(returnObject.thisCodeElement);

                        sqlVerineEditor.setSelection("next", false);

                    } else if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.hasClass("root")) { //Feld normal ___
                        returnObject = sqlVerineEditor.addSelectValue(tempSelectField);
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.replaceWith(returnObject.tempSelectValue);
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT = $(returnObject.thisCodeElement);

                        sqlVerineEditor.setSelection("next", false);
                    }
                }

                // -> selOperators
                else if ($(tempSelectField).hasClass("selOperators")) {
                    returnObject = sqlVerineEditor.addSelectValue(tempSelectField);
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.replaceWith(returnObject.tempSelectValue);
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT = $(returnObject.thisCodeElement);

                    //get current SQL Command: WHERE, JOIN, ... and change data of next inputField after operator               
                    let currentSqlCommand = sqlVerineEditor.CURRENT_SELECTED_ELEMENT.parent().attr("data-sql-element");
                    let inputFieldDataChange = sqlVerineEditor.CURRENT_SELECTED_ELEMENT.nextAll('.inputField:first');
                    if(currentSqlCommand == "WHERE") inputFieldDataChange.attr('data-sql-element', 'WHERE_3');
                    else if(currentSqlCommand == "JOIN") inputFieldDataChange.attr('data-sql-element', 'JOIN_4');
                    else if(currentSqlCommand == "AND") inputFieldDataChange.attr('data-sql-element', 'WHERE_AND_3');
                    else if(currentSqlCommand == "OR") inputFieldDataChange.attr('data-sql-element', 'WHERE_OR_3');
                    //...

                    
                    //remove all EXP_IN
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.nextAll('[data-sql-element="EXP_IN"]').each(function () {
                        let prevElement = $(this).prev();
                        //Komma entfernen, wenn vorhanden
                        if (prevElement.text() == ", ") {
                            prevElement.remove();
                        }
                        $(this).remove();
                        sqlVerineEditor.NR--;
                    });
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.nextAll('[data-sql-element="EXP_IN_BRACKET"]').each(function () {
                        $(this).remove();
                        sqlVerineEditor.NR--;
                    });

                    //remove all EXP_BETWEEN
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.nextAll('[data-sql-element="EXP_BETWEEN"]').each(function () {
                        $(this).remove();
                        sqlVerineEditor.NR--;
                    });

                    // Operator IN ( ___, ___ ) 
                    if (tempSelectField.value == "IN") {
                        let expressionIN = sqlVerineEditor.CURRENT_SELECTED_ELEMENT.nextAll('.inputField:first');
                        expressionIN.attr('data-sql-element', 'EXP_IN')

                        //Klammern                                          
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.after("<span class='codeElement_" + sqlVerineEditor.NR + " btnLeftBracket synBrackets sqlIdentifier extended' data-sql-element='EXP_IN_BRACKET'> (</span>");
                        sqlVerineEditor.NR++;
                        expressionIN.after("<span class='codeElement_" + sqlVerineEditor.NR + " btnRightBracket synBrackets sqlIdentifier extended' data-sql-element='EXP_IN_BRACKET'> )</span>");
                        sqlVerineEditor.NR++;
                        sqlVerineEditor.setSelection("next", false);
                    }
                    // Operator BETWEEN ___ AND ___
                    else if (tempSelectField.value == "BETWEEN") {
                        let expressionBETWEEN = sqlVerineEditor.CURRENT_SELECTED_ELEMENT.nextAll('.inputField:first');
                        expressionBETWEEN.attr('data-sql-element', 'EXP_BETWEEN');

                        // AND ___
                        let betweenStructure = "";
                        betweenStructure += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 7) + "' data-sql-element='EXP_BETWEEN'> AND </span>";
                        sqlVerineEditor.NR++;
                        betweenStructure += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-next-element='" + (sqlVerineEditor.NR - 4) + "' data-sql-element='EXP_BETWEEN'>___</span>";
                        sqlVerineEditor.NR++;

                        expressionBETWEEN.after(betweenStructure);
                        sqlVerineEditor.setSelection("next", false);

                    }
                    // 
                    else {
                        sqlVerineEditor.setSelection("next", false);
                    }
                }

                // -> selAggregate
                else if ($(tempSelectField).hasClass("selAggregate")) {
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.replaceWith(sqlVerineEditor.addAggregat(tempSelectField));
                    sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
                }
            }
            // aktualisiert alle .selColumn <select>
            sqlVerineEditor.updateSelectCodeComponents(sqlVerineEditor);
            //reset select option
            $(self)[0].selectedIndex = 0;
        });

        // Button: run sql command - desktop
        $(sqlVerineEditor.EDITOR_CONTAINER).on('click', '.btnRun', function (event) {
            sqlVerineEditor.execSqlCommand(null, "desktop");
            sqlVerineEditor.RUN_FUNCTIONS_DESKTOP.forEach(runFunction => {
                runFunction();
            });
        });
        // Button: run sql command - mobile 
        $(sqlVerineEditor.EDITOR_CONTAINER).on('click', '.btnRunMobile', function (event) {
            let tempCode = $(sqlVerineEditor.EDITOR_CONTAINER).find(".codeArea.editor pre code").html().trim();
            $(sqlVerineEditor.OUTPUT_CONTAINER_MOBILE).find(".codeArea pre code").html(tempCode);
            sqlVerineEditor.execSqlCommand(null, "mobile");
            sqlVerineEditor.RUN_FUNCTIONS_MOBILE.forEach(runFunction => {
                runFunction();
            });
        });
        // Button: Delete Element
        $(sqlVerineEditor.EDITOR_CONTAINER).on('click', '.btnDelete', function (event) {
            sqlVerineEditor.deleteElement(sqlVerineEditor.CURRENT_SELECTED_ELEMENT);
            // aktualisiert alle .selColumn <select>
            sqlVerineEditor.updateSelectCodeComponents(sqlVerineEditor);
        });

        //Button: Add Element "inputField"
        $(sqlVerineEditor.EDITOR_CONTAINER).on('click', '.btnAdd', function (event) {
            let dataSqlElement = sqlVerineEditor.CURRENT_SELECTED_ELEMENT.attr("data-sql-element"); //.data

            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {

                if (sqlVerineEditor.hasCurrentSelectedElementSqlDataString(sqlVerineEditor.CURRENT_SELECTED_ELEMENT, "_AGGREGAT")) { //...
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.after(sqlVerineEditor.addInputField(dataSqlElement, "extendedSpace"));

                } else if (sqlVerineEditor.hasCurrentSelectedElementSqlDataString(sqlVerineEditor.CURRENT_SELECTED_ELEMENT, "WHERE_3, OR_3, AND_3")) { //...
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.after(sqlVerineEditor.addInputField(dataSqlElement, "extendedSpace"));

                } else if (sqlVerineEditor.hasCurrentSelectedElementSqlDataString(sqlVerineEditor.CURRENT_SELECTED_ELEMENT, "INSERT_1")) {
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.after(sqlVerineEditor.addInputField(dataSqlElement, "insertInto"));
                } else if (sqlVerineEditor.hasCurrentSelectedElementSqlDataString(sqlVerineEditor.CURRENT_SELECTED_ELEMENT, "INSERT_2")) {

                    let updateField1 = sqlVerineEditor.addLeerzeichenMitKomma();
                    updateField1 += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled extended sqlIdentifier' data-sql-element='INSERT_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "' data-element-group='" + (sqlVerineEditor.NR - 1) + "," + (sqlVerineEditor.NR + 1) + "," + (sqlVerineEditor.NR + 2) + "'>___</span>";
                    sqlVerineEditor.NR++;
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.after(updateField1);

                    let lastInsert3Field = sqlVerineEditor.findElementBySqlData(sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").children(), "INSERT_3", "last");

                    let updateField2 = sqlVerineEditor.addLeerzeichenMitKomma();
                    updateField2 += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled extended sqlIdentifier' data-sql-element='INSERT_3' data-next-element='" + (sqlVerineEditor.NR + 2) + "' data-element-group='" + (sqlVerineEditor.NR - 1) + "," + (sqlVerineEditor.NR - 2) + "," + (sqlVerineEditor.NR - 3) + "'>___</span>";
                    sqlVerineEditor.NR++;
                    $(lastInsert3Field).after(updateField2);
                }
                //Create Table Spalte Typ ist gewählt, Feld für Einschränkung wird hinzugefügt
                else if (sqlVerineEditor.hasCurrentSelectedElementSqlDataString(sqlVerineEditor.CURRENT_SELECTED_ELEMENT, "CREATE_COLUMN_2, CREATE_COLUMN_3")) {
                    let updateField1 = sqlVerineEditor.addLeerzeichen();
                    updateField1 += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled extended sqlIdentifier' data-sql-element='CREATE_COLUMN_3' data-next-element='" + (sqlVerineEditor.NR + 2) + "' data-element-group=''>___</span>";
                    sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
                    sqlVerineEditor.NR++;
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.after(updateField1);

                } else {
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.after(sqlVerineEditor.addInputField(dataSqlElement, "extendedComma"));
                }
                sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
            }

            // UPDATE: fügt ", ___ = ___" hinzu
            else if (sqlVerineEditor.hasCurrentSelectedElementSqlDataString(sqlVerineEditor.CURRENT_SELECTED_ELEMENT, "UPDATE")) {
                let lastUpdateField = sqlVerineEditor.findElementBySqlData(sqlVerineEditor.CURRENT_SELECTED_ELEMENT.children(), "UPDATE_3", "last");
                let updateFields = sqlVerineEditor.addLeerzeichenMitKomma();
                updateFields += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled extended sqlIdentifier' data-sql-element='UPDATE_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "' data-element-group='" + (sqlVerineEditor.NR - 1) + "," + (sqlVerineEditor.NR + 1) + "," + (sqlVerineEditor.NR + 2) + "," + (sqlVerineEditor.NR + 3) + "," + (sqlVerineEditor.NR + 4) + "'>___</span>";
                sqlVerineEditor.NR++;
                updateFields += sqlVerineEditor.addLeerzeichen();
                updateFields += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 8) + "'> = </span>";
                sqlVerineEditor.NR++;
                updateFields += sqlVerineEditor.addLeerzeichen();
                updateFields += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled extended sqlIdentifier' data-sql-element='UPDATE_3' data-next-element='" + (sqlVerineEditor.NR - 4) + "' data-element-group='" + (sqlVerineEditor.NR - 1) + "," + (sqlVerineEditor.NR - 2) + "," + (sqlVerineEditor.NR - 3) + "," + (sqlVerineEditor.NR - 4) + "'>___</span>";
                sqlVerineEditor.NR++;
                $(lastUpdateField).after(updateFields);
            }
        });

        // Input: add text to Selected Element span
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('keyup', '.codeInput', function (e) {
            let self = this;
            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT != undefined) {
                let tempValue = $(self).val();
                if (tempValue != "") {
                    if (isNaN(tempValue)) {
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.html("'" + tempValue + "'");
                    } else {
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.html(tempValue);
                    }
                } else {
                    sqlVerineEditor.CURRENT_SELECTED_ELEMENT.html("___");
                }
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.addClass("input");
                if (e.key === 'Enter' || e.keyCode === 13) {
                    let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
                    if (tempValue != "") {
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.removeClass("unfilled");
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.addClass(classesFromCodeComponent);
                    } else {
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.addClass("unfilled");
                        sqlVerineEditor.CURRENT_SELECTED_ELEMENT.removeClass(classesFromCodeComponent);
                    }
                    sqlVerineEditor.setSelection("next", false);
                }
            }
        });

        //Button: öffnet ein Modal für das anzeigen des atkuellen URLStrings.    
        $(sqlVerineEditor.EDITOR_CONTAINER).find("#btnCreateUrl").on("click", function () {
            let sqlVerineUrl = location.protocol + '//' + location.host + location.pathname;
            let urlDatabase = sqlVerineEditor.CURRENT_VERINE_DATABASE.name;
            let URLCODE = escape($(".codeArea pre code").html().replaceAll("active", ""));
            let urlParameterString = sqlVerineUrl + "?db=" + urlDatabase + "&maxElementNr=" + sqlVerineEditor.NR + "&code=" + URLCODE;
            let modal = new Modal(document.getElementById('universal-modal'));
            modal.toggle();
            $(sqlVerineEditor.EDITOR_CONTAINER).find("#universal-modal .modal-title").html("Link zum aktuellen Code:");
            $(sqlVerineEditor.EDITOR_CONTAINER).find("#universal-modal .modal-body").html("<textarea type='text' id='inputCreateUrl' class='form-control input-check' aria-label='' aria-describedby=''>" + urlParameterString + "</textarea>");
            $(sqlVerineEditor.EDITOR_CONTAINER).find("#universal-modal .modal-footer").html('<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">schließen</button> <button type="button" id="btnCopyLink" class="btn btn-primary">Link kopieren</button>');
        });
        $(sqlVerineEditor.EDITOR_CONTAINER).find("#universal-modal").on('click', '#btnCopyLink', function () {
            let copyUrl = document.getElementById("inputCreateUrl");
            copyUrl.select();
            copyUrl.setSelectionRange(0, 99999); /* For mobile devices */
            //kopiert den selektierten Text in die Zwischenablage
            document.execCommand("copy");
        });

        // Scrollfortschritt als Dots anzeigen
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('scroll', function () {
            let maxWidth = $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").get(0).scrollWidth;
            let dotCount = Math.ceil($(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").get(0).scrollWidth / $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").get(0).clientWidth);
            let scrollIndex = Math.ceil(($(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").scrollLeft() + ($(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").get(0).clientWidth / 2)) / ((maxWidth / dotCount))) - 1;
            $(sqlVerineEditor.EDITOR_CONTAINER).find(".codeComponentsScrolldots a").removeClass("activeDot");
            $(sqlVerineEditor.EDITOR_CONTAINER).find(".codeComponentsScrolldots a").eq(scrollIndex).addClass("activeDot");
        });

        // Scrolldots bei Klick an Position springen lassen
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".codeComponentsScrolldots").on('click', 'a', function () {
            let self = this;
            let dotCountBefore = $(self).prevAll().length;
            let dotCountAfter = $(self).nextAll().length;
            let maxWidth = $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").get(0).scrollWidth;
            let scrollPos = 0;

            if (dotCountBefore == 0) {
                scrollPos = 0;
            } else if (dotCountAfter == 0) {
                scrollPos = maxWidth;
            } else {
                scrollPos = $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").get(0).clientWidth * dotCountBefore;
            }
            $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").scrollLeft(scrollPos);
        });
    }

    /////////////
    //FUNCTIONS//

    //funtion: Sucht ein Element mit sql-element data attribut
    findElementBySqlData(elements, attributeValue, position) {
        let tempElement;
        if (position == "first") {
            $(elements).each(function () {
                let self = this;
                tempElement = self;
                if ($(tempElement).attr("data-sql-element") == attributeValue) {
                    return false; //found element -> stop loop
                }
            });
        } else if (position == "last") {
            $(elements.get().reverse()).each(function () {
                let self = this;
                tempElement = self;
                if ($(tempElement).attr("data-sql-element") == attributeValue) {
                    return false; //found element -> stop loop
                }
            });
        }
        return tempElement;
    }

    //function: add new line <span>
    addNewLine() {
        let tempLeerzeichen = "<span class='codeElement_" + this.NR + " newline'><br></span>";
        this.NR++;
        return tempLeerzeichen;
    }

    //function: add Leerzeichen, Leerzeichen mit Komma, Komma <span>
    addLeerzeichen() {
        let tempLeerzeichen = "<span class='codeElement_" + this.NR + " leerzeichen' data-goto-element='parent'>&nbsp;</span>";
        this.NR++;
        return tempLeerzeichen;
    }

    addLeerzeichenMitKomma() {
        let tempLeerzeichen = "<span class='codeElement_" + this.NR + " leerzeichen' data-goto-element='parent'>, </span>";
        this.NR++;
        return tempLeerzeichen;
    }

    addKomma() {
        let tempKomma = "<span class='codeElement_" + this.NR + " komma' data-goto-element='parent'>,</span>";
        this.NR++;
        return tempKomma;
    }

    //function: checks if data-sql-element contains string i.e. "WHERE_3, OR_3, AND_3"
    hasCurrentSelectedElementSqlDataString(currentSelectedElement, sqlDataIdentifier) {
        let sqlStringFound = false;
        let tempSqlDataArray = sqlDataIdentifier.replaceAll(" ", "").split(",");
        tempSqlDataArray.forEach(element => {
            if (currentSelectedElement.attr("data-sql-element").includes(element)) {
                sqlStringFound = true;
            }
        });
        return sqlStringFound;
    }

    //function: get current Sql Query
    getSqlQuery(){        
        let sqlQuery = $(this.EDITOR_CONTAINER).find(".codeArea.editor pre code").clone();
        let re = new RegExp(String.fromCharCode(160), "g"); // entfernt &nbsp;
        return sqlQuery.text().replaceAll(re, " ").trim();
    }

    getSqlQueryHtml(){
        return $(this.EDITOR_CONTAINER).find(".codeArea.editor pre code").html().replaceAll("active", "");
    }
    getSqlQueryText(){
        let tempSqlCommand;
        const re = new RegExp(String.fromCharCode(160), "g"); // entfernt &nbsp;
        if ($(this.EDITOR_CONTAINER).find(".codeArea").css('display') != 'none') {
            tempSqlCommand = $(this.EDITOR_CONTAINER).find(".codeArea.editor pre code").clone();
            tempSqlCommand.find(".codeline").prepend("<span>&nbsp;</span>");
            tempSqlCommand = tempSqlCommand.text().replaceAll(re, " ").trim();
        } else {
            tempSqlCommand = $(this.EDITOR_CONTAINER).find("#codeAreaText textarea");
            tempSqlCommand = tempSqlCommand.val().replaceAll(re, " ").trim();
            this.updateUsedTables(this);
        }
        return tempSqlCommand;
    }
    //function: run sql command, type = desktop or mobile
    execSqlCommand(tempSqlCommand, type) {
        //bereitet den sql Befehl vor
        
        if (tempSqlCommand == null) {
            tempSqlCommand = this.getSqlQueryText();
        }
        //versucht den sql Befehl auszuführen und gibt im Debugbereich das Ergebnis oder die Fehlermeldung aus
        try {
            //löscht alte Ausgabe
            $(this.OUTPUT_CONTAINER_MOBILE).find(".resultArea").html("");
            $(this.OUTPUT_CONTAINER).html("");            

            let result = this.CURRENT_VERINE_DATABASE.database.exec(tempSqlCommand);
           
            //wurde ein delete, insert, update Befehl ausgeführt?
            let modifiedRows = this.CURRENT_VERINE_DATABASE.database.getRowsModified();
            if (modifiedRows > 0) {

                let deleteSQL = tempSqlCommand.match(/(DELETE FROM)\s(\w+)/);
                let updateSQL = tempSqlCommand.match(/(UPDATE)\s(\w+)/);
                let insertSQL = tempSqlCommand.match(/(INSERT INTO)\s(\w+)/);

                if (insertSQL != null && insertSQL.length > 0) {
                    $(this.OUTPUT_CONTAINER).append("<h5>" + modifiedRows + " Zeilen wurden in der Tabelle: " + insertSQL[2] + " eingefügt.</h5><br>");
                    result = this.CURRENT_VERINE_DATABASE.database.exec("SELECT * FROM " + insertSQL[2]);
                } else if (updateSQL != null && updateSQL.length > 0) {
                    $(this.OUTPUT_CONTAINER).append("<h5>" + modifiedRows + " Zeilen wurden in der Tabelle: " + updateSQL[2] + " aktualisiert.</h5><br>");
                    result = this.CURRENT_VERINE_DATABASE.database.exec("SELECT * FROM " + updateSQL[2]);
                } else if (deleteSQL != null && deleteSQL.length > 0) {
                    $(this.OUTPUT_CONTAINER).append("<h5>" + modifiedRows + " Zeilen wurden aus der Tabelle: " + deleteSQL[2] + " gelöscht.</h5><br>");
                    result = this.CURRENT_VERINE_DATABASE.database.exec("SELECT * FROM " + deleteSQL[2]);
                }
            }

            //wurde drop, create, alter table ausgeführt?
            let dropTableSQL = tempSqlCommand.match(/(DROP TABLE)\s(\w+)/);
            let createTableSQL = tempSqlCommand.match(/(CREATE TABLE)\s['"](\w+)['"]/);
            let alterTableSQL = tempSqlCommand.match(/(ALTER TABLE)\s(\w+)/);
            let tablesChanged = false;

            if (dropTableSQL != null && dropTableSQL.length > 0) {
                $(this.OUTPUT_CONTAINER).append("<h5>Die Tabelle: " + dropTableSQL[2] + " wurde gelöscht.</h5><br>");
                tablesChanged = true;
            } else if (createTableSQL != null && createTableSQL.length > 0) {
                $(this.OUTPUT_CONTAINER).append("<h5>Die Tabelle: " + createTableSQL[2] + " wurde neu erstellt.</h5><br>");
                tablesChanged = true;
            } else if (alterTableSQL != null && alterTableSQL.length > 0) {
                $(this.OUTPUT_CONTAINER).append("<h5>Die Tabelle: " + alterTableSQL[2] + " wurde verändert.</h5><br>");
                tablesChanged = true;
                result = this.CURRENT_VERINE_DATABASE.database.exec("SELECT * FROM " + alterTableSQL[2]);
            }
            //Datenbankschema wird aktualisiert, wenn sich etwas an den Tabellen geändert hat
            if (tablesChanged) {
                $(this.SCHEMA_CONTAINER).html(this.CURRENT_VERINE_DATABASE.createTableInfo("1,2"));
            }

            //erstellt eine Tabelle mit den Ergebnissen
            for (let i = 0; i < result.length; i++) {
                if (type == "mobile") $(this.OUTPUT_CONTAINER_MOBILE).find(".resultArea").append(this.createTableSql(result[i].columns, result[i].values));
                else if (type == "desktop") {
                    $(this.OUTPUT_CONTAINER).append("" + this.createTableSql(result[i].columns, result[i].values) + "");
                };
            }

        } catch (err) {
            if (type == "mobile") $(this.OUTPUT_CONTAINER_MOBILE).find(".resultArea").html(err.message);
            else if (type == "desktop") {
                $(this.OUTPUT_CONTAINER).html("<h4>SQL Fehler:</h4>" + "<span style='color: tomato;'>" + err.message + "</span>");
            };
        }
    }

    //function: Erstellt eine Tabelle mit den Resultaten einer SQL Abfrage
    createTableSql(columns, values) {

        this.SOLUTION_ALL_ARRAY = [];
        this.SOLUTION_ROW_COUNTER = 0;

        let newTable = "<div class='table-responsive'><table class='table table-bordered tableSql' style=''>";
        newTable += "<thead>";
        columns.forEach((column) => {
            newTable += "<th scope='col'>" + column + "</th>";
        });
        newTable += "</thead>";

        newTable += "<tbody>";
        values.forEach((value) => {
            newTable += "<tr>";
            this.SOLUTION_ROW_COUNTER++;
            value.forEach((element, indexColumn) => {
                //fügt Elemente dem Ergebnis Array hinzu -> wird für das Überprüfen der Aufgabe benötigt
                if (this.ACTIVATE_EXERCISES) this.checkElement(element, columns[indexColumn]);
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

    checkElement(value, column) {
        let CURRENT_EXERCISE = this.CURRENT_VERINE_DATABASE.getExerciseById(this.CURRENT_VERINE_DATABASE.getCurrentExerciseId());
        CURRENT_EXERCISE.answerObject.exerciseSolutionArray.forEach(solution => {
            //ist vale im LösungsString
            if (solution.loesungString == value) {
                //ist eine Tabelle im Antwortobjekt definiert ?
                if (solution.table != undefined) {
                    //checkt ob der aktuelle Wert in der Tabelle des Antwortobjekt ist
                    if (this.USED_TABLES.includes(solution.table)) {
                        if (solution.column != undefined) {
                            if (solution.column == column) {
                                if (!this.SOLUTION_ALL_ARRAY.includes(String(value))) this.SOLUTION_ALL_ARRAY.push(String(value));
                            }
                        } else {
                            if (!this.SOLUTION_ALL_ARRAY.includes(String(value))) this.SOLUTION_ALL_ARRAY.push(String(value));
                        }
                    }
                }
                //keine Tabelle nötig
                else {
                    //ist der aktuelle Wert in der richtigen Spalte?
                    if (solution.column != undefined) {
                        if (solution.column == column) {
                            if (!this.SOLUTION_ALL_ARRAY.includes(String(value))) this.SOLUTION_ALL_ARRAY.push(String(value));
                        }
                    } else {
                        if (!this.SOLUTION_ALL_ARRAY.includes(String(value))) this.SOLUTION_ALL_ARRAY.push(String(value));
                    }
                }
            }
        });
    }

    //function: erstellt neue select elemente basierend auf den gewählten Tabellen in der code area
    updateSelectCodeComponents(sqlVerineEditor) {
        //check all used tables in code area
        sqlVerineEditor.updateUsedTables(sqlVerineEditor);
        //entfernt alle .inputField die ein Feld einer gelöscht Tabelle haben
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".codeArea.editor .selColumn").each(function () {
            let self = this;
            let isTableActive = false;
            sqlVerineEditor.USED_TABLES.forEach(element => {                
                if ($(self).hasClass(element)) {
                    isTableActive = true;
                    let updatedFieldNameBasedOnTableCount = $(self).html().replace(element + ".", "");
                    if (sqlVerineEditor.USED_TABLES.length > 1) {
                        $(self).html(element + "." + updatedFieldNameBasedOnTableCount);
                    } else {
                        $(self).html(updatedFieldNameBasedOnTableCount);
                    }
                }
            });
            if (!isTableActive) {
                sqlVerineEditor.deleteElement($(self));
            }
        });
    }

    //function: delete element from code area
    deleteElement(elementToDelete) {
        // Element parent
        if (elementToDelete.hasClass("parent")) {
            this.setSelection("parent", true);
        }
        // Klammern, ... 
        else if (elementToDelete.hasClass("synBrackets") && elementToDelete.hasClass("extended")) {
            this.setSelection("next", true);
        }
        // spezielle Behandlung des inputFields von INSERT_2
        else if (elementToDelete.hasClass("inputField") && elementToDelete.hasClass("extended") && this.hasCurrentSelectedElementSqlDataString(elementToDelete, "INSERT_2, UPDATE_2, UPDATE_3")) {
            let elementGroup = elementToDelete.attr("data-element-group");
            if (elementGroup != undefined) {
                let idsToDelete = elementGroup.toString().split(",");
                idsToDelete.forEach(element => {
                    this.deleteElementById(element);
                });
            }
            this.setSelection("next", true);
        }
        // extended inputField
        else if (elementToDelete.hasClass("inputField") && elementToDelete.hasClass("extended")) {
            elementToDelete.prev().remove();
            this.setSelection("next", true);
        }
        // root inputField remove old Element and create new one
        else if (elementToDelete.hasClass("inputField") && elementToDelete.hasClass("root")) {
            let dataSqlElement = elementToDelete.attr("data-sql-element");
            elementToDelete.replaceWith(this.addInputField(dataSqlElement, "root"));
            this.setSelection(this.NEXT_ELEMENT_NR, false);
        }
        // don´t delete, select parent Element
        else {
            let elementNr = getElementNr(elementToDelete.parent().attr('class'));
            this.setSelection(elementNr, false);
        }

        //überprüft den eingegebenen Code und passt diesen ggf. an 
        this.cleanSQLCode();
    }

    //function: returns a normal or extended inputField ( ___ or ,___ )
    addInputField(tempSqlElement, type) {
        let tempInputField = "";
        if (type == "root") {
            tempInputField = "<span class='codeElement_" + this.NR + " inputField unfilled sqlIdentifier root' data-sql-element='" + tempSqlElement + "'>___</span>";
            this.NEXT_ELEMENT_NR = this.NR;
            this.NR++;
        } else if (type == "extendedComma") {
            tempInputField = this.addLeerzeichenMitKomma();
            tempInputField += "<span class='codeElement_" + this.NR + " inputField unfilled sqlIdentifier extended comma' data-sql-element='" + tempSqlElement + "'>___</span>";
            this.NEXT_ELEMENT_NR = this.NR;
            this.NR++;
        } else if (type == "extendedSpace") {
            tempInputField = this.addLeerzeichen();
            tempInputField += "<span class='codeElement_" + this.NR + " inputField unfilled sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>___</span>";
            this.NEXT_ELEMENT_NR = this.NR;
            this.NR++;
        } else if (type == "insertInto") {
            tempInputField = this.addLeerzeichen();
            tempInputField += "<span class='codeElement_" + this.NR + " sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>(</span>";
            this.NR++;
            tempInputField += "<span class='codeElement_" + this.NR + " inputField unfilled extended insert2 sqlIdentifier' data-sql-element='INSERT_2' data-next-element='" + (this.NR + 2) + "' data-element-group='" + (this.NR - 2) + "," + (this.NR - 1) + "," + (this.NR + 1) + "'>___</span>";
            this.NEXT_ELEMENT_NR = this.NR;
            this.NR++;
            tempInputField += "<span class='codeElement_" + this.NR + " sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>)</span>";
            this.NR++;
        }
        return tempInputField;
    }

    //function: adds an Aggregat <span> with inputField
    addAggregat(tempSelectField) {
        let classesFromCodeComponent = this.getClassesFromElementAsString(tempSelectField);
        let tempSqlElement = this.CURRENT_SELECTED_ELEMENT.attr("data-sql-element");
        let tempAggregat = "";
        if (this.CURRENT_SELECTED_ELEMENT.hasClass("extended")) {
            tempAggregat += "<span class='codeElement_" + this.NR + " " + classesFromCodeComponent + " inputField sqlIdentifier extended' data-sql-element='" + tempSqlElement + "'>" + tempSelectField.value + "(";
        } else {
            tempAggregat += "<span class='codeElement_" + this.NR + " " + classesFromCodeComponent + " inputField sqlIdentifier root' data-sql-element='" + tempSqlElement + "'>" + tempSelectField.value + "(";
        }
        this.NR++;
        tempAggregat += this.addInputField(tempSqlElement + "_AGGREGAT", "root");
        tempAggregat += ")</span>";
        return tempAggregat;
    }

    //function: überprüft den eingegebenen Code und passt diesen ggf. an
    cleanSQLCode() {
        //sucht alle Elemente mit Klasse .createComma und fügt im .komma span ein Komma hinzu
        $(this.EDITOR_CONTAINER).find('.createComma').each(function () {
            let self = this;
            $(self).find(".komma").html(",")
        });
        //entfernt das letzte Komma der .createComma Klassen
        $(this.EDITOR_CONTAINER).find(".codeArea pre code").find(".createComma .komma").last().html("");

        // deletes all empty <span class="codeline">
        $(this.EDITOR_CONTAINER).find(".codeline").each(function () {
            if ($(this).children().length == 0){
                let self = this;
                $(self).remove();
            } 
        });
    }

    //function: löscht ein Element anhand einer ID z.B.: 5
    deleteElementById(elementId) {
        $(this.EDITOR_CONTAINER).find(".codeArea.editor pre code").find(".codeElement_" + elementId).remove();
    }

    //function: adds a selected Value from and <select> Component
    addSelectValue(tempSelectField) {
        let classesFromCodeComponent = this.getClassesFromElementAsString(tempSelectField);
        let tempElementId = this.getElementNr(this.CURRENT_SELECTED_ELEMENT.attr("class"));

        let tempSqlElement = this.CURRENT_SELECTED_ELEMENT.attr("data-sql-element");
        let tempNextElement = this.CURRENT_SELECTED_ELEMENT.attr("data-next-element");
        let tempGroupElement = this.CURRENT_SELECTED_ELEMENT.attr("data-element-group");

        let tempSelectValue = "";
        if (this.CURRENT_SELECTED_ELEMENT.hasClass("extended")) {
            tempSelectValue += "<span class='codeElement_" + tempElementId + " " + classesFromCodeComponent + " inputField sqlIdentifier extended' data-sql-element='" + tempSqlElement + "' data-next-element='" + tempNextElement + "' data-element-group='" + tempGroupElement + "'>" + tempSelectField.value + "</span>";
        } else {
            tempSelectValue += "<span class='codeElement_" + tempElementId + " " + classesFromCodeComponent + " inputField sqlIdentifier root' data-sql-element='" + tempSqlElement + "' data-next-element='" + tempNextElement + "' data-element-group='" + tempGroupElement + "'>" + tempSelectField.value + "</span>";
        }
        let returnObject = {};
        returnObject.tempSelectValue = tempSelectValue;
        returnObject.thisCodeElement = ".codeElement_" + tempElementId;

        return returnObject;
    }

    //function: get Element this.NR from Element ID
    getElementNr(elementClasses) {
        return elementClasses.split(" ")[0].split("_")[1];
    }

    //function: add Leerzeichen <span>
    addLeerzeichen() {
        let tempLeerzeichen = "<span class='codeElement_" + this.NR + " leerzeichen' data-goto-element='parent'>&nbsp;</span>";
        this.NR++;
        return tempLeerzeichen;
    }

    //function: liefert alle Klassen eines Elements als String zurück, außer der letzten Kontrollklasse (codeButton, codeSelect, codeInput)
    getClassesFromElementAsString(element) {
        let codeComponentClassesAsString = $(element).attr("class").replace(/[\W]*\S+[\W]*$/, '');
        return codeComponentClassesAsString;
    }

    //function: set Selection to an Element
    setSelection(elementNr, removeLastSelectedElement) {
        let element;

        //no number is given -> get next unfilled inputField
        if (elementNr == "next") {
            this.CURRENT_SELECTED_ELEMENT.removeClass("unfilled");
            //find .parent then find .unfilled
            element = this.CURRENT_SELECTED_ELEMENT.closest(".parent").find(".unfilled").first();
            if (element.length == 0) {
                //find .codeline then find next .unfilled
                element = this.CURRENT_SELECTED_ELEMENT.closest(".codeline").find(".unfilled").first();
                if (element.length == 0) {
                    //select first parent, if no .unfilled is found
                    element = this.CURRENT_SELECTED_ELEMENT.parents().closest(".parent").last();
                }
            }
        }
        //.parent ist selektiert
        else if (elementNr == "parent2") {
            //select next .parent
            element = this.CURRENT_SELECTED_ELEMENT.next(".parent");
            if (element.length == 0) {
                //select prev .parent
                element = this.CURRENT_SELECTED_ELEMENT.prev(".parent");
                if (element.length == 0) {
                    //select last .parent of .codeline before current .codeline
                    element = this.CURRENT_SELECTED_ELEMENT.parent().prev(".codeline").find(".parent").last();
                    if (element.length == 0) {
                        //select last .parent of .codeline after current .codeline
                        element = this.CURRENT_SELECTED_ELEMENT.parent().next(".codeline").find(".parent").last();
                    }
                }
            }
        }

        //erstes .parent element in .codeline ist selektiert
        else if (elementNr == "parent") {
            //erstes .parent der .codeline?
            if (this.CURRENT_SELECTED_ELEMENT.prev(".parent").length == 0) {
                //erste .codeline in der CodeArea?
                if (this.CURRENT_SELECTED_ELEMENT.parent().prev(".codeline").length == 0) {
                    if (removeLastSelectedElement) $(this.EDITOR_CONTAINER).find('.codeArea.editor pre code').html(""); // lösche alles, keine neue 
                } else { //hat ein prev .codeline                    
                    element = this.CURRENT_SELECTED_ELEMENT.parent().prev(".codeline").find(".parent").last();
                    this.CURRENT_SELECTED_ELEMENT = this.CURRENT_SELECTED_ELEMENT.parent(); //aktuelle Codeline
                }
            } else { //hat ein prev .parent

            }
        }

        //next element is chosen by number
        else {
            element = $(this.EDITOR_CONTAINER).find(".codeArea.editor pre code .codeElement_" + elementNr);
        }

        this.removeSelection(removeLastSelectedElement);

        if (element != undefined && element.length != 0) {
            element.addClass("active");
            this.CURRENT_SELECTED_ELEMENT = element;
            this.CURRENT_SELECTED_SQL_ELEMENT = element.attr("data-sql-element");
        } else {
            this.CURRENT_SELECTED_SQL_ELEMENT = "START";
        }
        this.updateActiveCodeView();
    }

    //function: remove Selection from all Elements
    removeSelection(removeLastSelectedElement) {
        $(this.EDITOR_CONTAINER).find("[class^='codeElement_']").removeClass("active");
        $(this.EDITOR_CONTAINER).find(".codeInput").val("");
        if (removeLastSelectedElement) this.CURRENT_SELECTED_ELEMENT.remove();
        this.CURRENT_SELECTED_ELEMENT = undefined;
    }

    //function: loops through JSON Data and shows Elements based on selected SQL Element
    updateActiveCodeView() {

        //reset add und delete Button
        $(this.EDITOR_CONTAINER).find(".buttonArea.mainMenu .btnAdd").hide();
        $(this.EDITOR_CONTAINER).find(".buttonArea.mainMenu .btnDelete").hide();

        $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").html("");

        this.ACTIVE_CODE_VIEW_DATA.forEach(element => {
            if (element.selectedSQLElement == this.CURRENT_SELECTED_SQL_ELEMENT) {

                //Code Components: sollen auf max x (3) Zeilen verteilt werden
                let maxZeilen = 3;
                let maxComponents = element.visibleCodeComponents.length;
                let componentCounter = 0;

                element.visibleCodeComponents.forEach(element => {
                    //.selColumns werden in Abhängigkeit der this.USED_TABLES erstellt
                    if (element.codeComponentClass == ".selColumn") {
                        this.updateUsedTables(this);
                        this.USED_TABLES.forEach(elementTable => {
                            this.createCodeComponent(element.codeComponentClass, elementTable);
                            componentCounter++;
                            //Zeilenumbruch nach x Elementen einfügen
                            if (componentCounter >= Math.ceil(maxComponents / maxZeilen)) {
                                this.createCodeComponent("zeilenumbruch", null);
                                componentCounter = 0;
                                maxComponents--;
                            }
                        });
                    } else {
                        this.createCodeComponent(element.codeComponentClass, null);
                        componentCounter++;
                        //Zeilenumbruch nach x Elementen einfügen
                        if (componentCounter >= Math.ceil(maxComponents / maxZeilen)) {
                            this.createCodeComponent("zeilenumbruch", null);
                            componentCounter = 0;
                            maxComponents--;
                        }
                    }

                    //wenn ein input Feld angezeigt wird:
                    if (element.codeComponentType == "input") {
                        $(element.codeComponentClass).focus();
                        if (this.CURRENT_SELECTED_ELEMENT != undefined) {
                            if (this.CURRENT_SELECTED_ELEMENT.hasClass("input")) {
                                if (this.CURRENT_SELECTED_ELEMENT.text() == "___") {
                                    $(element.codeComponentClass).val("");
                                } else {
                                    $(element.codeComponentClass).val(this.CURRENT_SELECTED_ELEMENT.text().replaceAll("'", "")).select();
                                }
                            }
                        }
                    }

                });

                //Main Controls: btnRun, btnAdd, btnDelete, ...
                element.visibleMainControls.forEach(element => {
                    $(this.EDITOR_CONTAINER).find(element.codeComponentClass).show();
                });

            }
        });

        this.initScrollDots();
    }

    //function: befüllt .selTable mit allen Tabellen der Datenbank
    fillSelectionTables() {
        this.clearSelectionOptions(".buttonArea .selTable");
        let databaseTables = this.getSqlTables();
        for (let i = 0; i < databaseTables.length; i++) {
            if ((databaseTables[i] != "verine_exercises" && databaseTables[i] != "verine_info") || this.SHOW_EXERCISE_TABLE) {
                $(this.EDITOR_CONTAINER).find(".buttonArea .selTable").append(new Option(databaseTables[i], databaseTables[i]));
            }
        }
    }

    //function: befüllt die .selColumn Element mit Feldern der genutzten Datenbanken
    fillSelectionFields(tableName, selectFields) {
        let tempTableFields = this.getSqlTableFields(tableName);
        tempTableFields.forEach(element => {
            $(selectFields).append(new Option(element[1], element[1]));
        });
    }

    //function: befüllt .selColumnCreate mit allen Spalten im SQL Crate Statement
    fillSelectionCreateColumns() {
        let createSQLStatementLines = $(this.EDITOR_CONTAINER).find(".codeArea.editor pre code").text().replace(/CREATE TABLE\s'(.*?)'/, "").split(",");
        createSQLStatementLines.forEach(element => {
            let currentLineColumn = element.match(/'(.*?)'/);
            if (currentLineColumn != null && currentLineColumn.length > 0) {
                $(this.EDITOR_CONTAINER).find(".buttonArea .selColumnCreate").append(new Option(currentLineColumn[1], currentLineColumn[1]));
            }

        });
    }

    //function: entfernt alle select Optionen außer die erste
    clearSelectionOptions(selectElement) {
        $(selectElement + ' option[value!="0"]').remove();
    }

    //SQLite functions:
    getSqlTables() {
        return this.CURRENT_VERINE_DATABASE.database.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")[0].values;
    }

    getSqlTableFields(tempTableName) {
        return this.CURRENT_VERINE_DATABASE.database.exec("PRAGMA table_info(" + tempTableName + ")")[0].values;
    }

    //function: In der mobilen Ansicht werden Dots anstelle einer horizontalen Scrollbar für die CodeComponents angezeigt.
    initScrollDots() {
        let dotCount = Math.ceil($(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").get(0).scrollWidth / $(".buttonArea.codeComponents").get(0).clientWidth);
        $(this.EDITOR_CONTAINER).find(".codeComponentsScrolldots span").html("");
        if (dotCount > 1) {
            for (let index = 0; index < dotCount; index++) {
                if (index == 0) {
                    $(this.EDITOR_CONTAINER).find(".codeComponentsScrolldots span").append('<a class="activeDot"><svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"> <circle cx="8" cy="8" r="8"/></svg></a>');
                } else {
                    $(this.EDITOR_CONTAINER).find(".codeComponentsScrolldots span").append('<a><svg xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16"> <circle cx="8" cy="8" r="8"/></svg></a>');
                }
            }
        }
    }

    //function: get all used db tables in code area
    updateUsedTables(sqlVerineEditor) {
        sqlVerineEditor.USED_TABLES = [];

        if ($(sqlVerineEditor.EDITOR_CONTAINER).find(".codeArea").css('display') != 'none') {
            //check used tables -> codeArea
            $(sqlVerineEditor.EDITOR_CONTAINER).find(".codeArea.editor .selTable").each(function () {
                let self = this;
                if (!sqlVerineEditor.USED_TABLES.includes($(self).html())) {
                    sqlVerineEditor.USED_TABLES.push($(self).html());
                }
            });
        } else {
            //check used tables -> codeAreaText
            let databaseTables = sqlVerineEditor.getSqlTables();
            let codeAreaTextValue = $(sqlVerineEditor.EDITOR_CONTAINER).find("#codeAreaText textarea").val();
            databaseTables.forEach(table => {
                if (codeAreaTextValue.includes(table.toString())) {
                    if (!sqlVerineEditor.USED_TABLES.includes(table.toString())) {
                        sqlVerineEditor.USED_TABLES.push(table.toString());
                    }
                }
            });
        }
    }


    ///////////////////
    //Code Components//

    //function: fügt der buttonArea aktuell notwendige codeComponents hinzu
    createCodeComponent(codeComponent, option) {
        switch (codeComponent) {
            case "zeilenumbruch":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<br>');
                break;
            case ".btnSelect":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnSelect synSQL sqlSelect codeButton">SELECT ___ FROM ___</button>');
                break;
            case ".btnWhere":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnWhere synSQL sqlWhere codeButton">WHERE ___ ___ ___</button>');
                break;
            case ".btnOrder":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnOrder synSQL sqlOrder codeButton">ORDER BY ___</button>');
                break;
            case ".btnLimit":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnLimit synSQL sqlOrder codeButton">LIMIT ___</button>');
                break;
            case ".btnOffset":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnOffset synSQL sqlOrder codeButton">OFFSET ___</button>');
                break;
            case ".btnGroup":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnGroup synSQL sqlGroup codeButton">GROUP BY ___</button>');
                break;
            case ".btnJoin":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnJoin synSQL sqlJoin codeButton">JOIN ___ ON ___ ___ ___</button>');
                break;
            case ".selColumn":
                let selColumn = "<select class='selColumn synColumns " + option + " codeSelect'>";
                selColumn += "<option value='0' disabled selected hidden>Spalten " + option + "</option>";
                selColumn += "<option value='*'>*</option>";
                selColumn += "</select>";
                let selColumnDom = $.parseHTML(selColumn);
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append(selColumnDom);
                this.fillSelectionFields(option, selColumnDom);
                break;
            case ".selTable":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selTable synTables codeSelect"><option value="0" disabled selected hidden>Tabelle wählen</option></select>');
                this.fillSelectionTables();
                break;
            case ".selColumnCreate":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selColumnCreate synColumns codeSelect"><option value="0" disabled selected hidden>Spalte wählen</option></select>');
                this.fillSelectionCreateColumns();
                break;
            case ".selAggregate":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selAggregate synSQL sqlSelect codeSelect"><option value="" disabled selected hidden>Aggregatsfunktion wählen</option><option value="AVG">AVG ( ___ )</option><option value="COUNT">COUNT ( ___ )</option><option value="MIN">MIN ( ___ )</option><option value="MAX">MAX ( ___ )</option><option value="SUM">SUM ( ___ )</option></select>');
                break;
            case ".btnAND":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnAND synSQL sqlWhere codeButton">AND</button>');
                break;
            case ".btnOR":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnOR synSQL sqlWhere codeButton">OR</button>');
                break;
            case ".btnLeftBracket":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnLeftBracket synBrackets sqlWhere codeButton">(</button>');
                break;
            case ".btnRightBracket":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnRightBracket synBrackets sqlWhere codeButton">)</button>');
                break;
            case ".selOperators":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selOperators synOperators sqlWhere codeSelect"><option value="" disabled selected hidden>Operator wählen</option><option value="=">=</option><option value="&gt;">&gt;</option><option value="&lt;">&lt;</option><option value="&gt;=">&gt;=</option><option value="&lt;=">&lt;=</option><option value="&lt;&gt;">&lt;&gt;</option><option value="BETWEEN">BETWEEN ___ AND ___</option><option value="LIKE">LIKE</option><option value="IN">IN (___)</option></select>');
                break;
            case ".inputValue":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<input type="text" placeholder="Wert" class="inputValue synValue codeInput"> </input>');
                break;
            case ".btnAsc":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnAsc synSQL sqlOrder codeButton">ASC</button>');
                break;
            case ".btnDesc":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnDesc synSQL sqlOrder codeButton">DESC</button>');
                break;
            case ".btnHaving":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnHaving synSQL sqlGroup codeButton">HAVING ___ ___ ___</button>');
                break;
            case ".btnSQLDelete":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnSQLDelete synSQL sqlDelete">DELETE FROM ___</button>');
                break;
            case ".btnUpdate":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnUpdate synSQL sqlUpdate">UPDATE ___ SET ___ = ___</button>');
                break;
            case ".btnInsert":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnInsert synSQL sqlInsert">INSERT INTO ___ (___) VALUES (___)</button>');
                break;
            case ".btnDropTable":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnDropTable synSQL sqlDelete">DROP TABLE ___</button>');
                break;
            case ".btnAlterTable":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnAlterTable synSQL sqlDelete">ALTER TABLE ___</button>');
                break;
            case ".btnDropColumn":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnDropColumn synSQL sqlDelete">DROP COLUMN ___</button>');
                break;
            case ".btnRenameTo":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnRenameTo synSQL sqlDelete">RENAME ___ TO ___</button>');
                break;
            case ".btnAddColumn":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnAddColumn synSQL sqlDelete">ADD ___ TYP</button>');
                break;
            case ".selTyp":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selTyp synTyp codeSelect"><option value="" disabled selected hidden>Typ wählen</option><option value="INTEGER">INTEGER</option><option value="TEXT">TEXT</option><option value="REAL">REAL</option><option value="BLOB">BLOB</option></select>');
                break;
            case ".selConstraint":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<select class="selConstraint synTyp codeSelect"><option value="" disabled selected hidden>Typ wählen</option><option value="UNIQUE">UNIQUE</option><option value="PRIMARY KEY">PRIMARY KEY</option><option value="NOTT NULL">NOT NULL</option></select>');
                break;
            case ".btnCreateTable":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnCreateTable synSQL sqlDelete">CREATE TABLE ___ ( )</button>');
                break;
            case ".btnCreateColumn":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnCreateColumn synSQL sqlDelete"> NEUE SPALTE ___ </button>');
                break;
            case ".btnCreateForeignKey":
                $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").append('<button class="btnCreateForeignKey synSQL sqlDelete"> FOREIGN KEY ___ REFERENCES ___ (___)</button>');
                break;
            default:
                //log("no component found")
        }
    }

    //initialisiert die Events für die CodeComponents Buttons
    initCodeComponentsButtons(sqlVerineEditor) {
        // Button: SELECT ___ FROM ___
        $(this.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnSelect', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            sqlVerineEditor.CURRENT_SELECTED_ELEMENT = undefined;
            let elementSELECT_FROM = "<span class='codeline'>";
            elementSELECT_FROM += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " start parent sqlIdentifier inputFields' data-sql-element='SELECT'>SELECT";
            sqlVerineEditor.NR++;
            elementSELECT_FROM += sqlVerineEditor.addLeerzeichen();
            elementSELECT_FROM += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='SELECT_SELECT' data-next-element='" + (sqlVerineEditor.NR + 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementSELECT_FROM += sqlVerineEditor.addLeerzeichen();
            elementSELECT_FROM += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 4) + "'>FROM</span>";
            sqlVerineEditor.NR++;
            elementSELECT_FROM += sqlVerineEditor.addLeerzeichen();
            elementSELECT_FROM += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier active' data-sql-element='SELECT_FROM' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementSELECT_FROM += "</span></span>";
            $(sqlVerineEditor.EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementSELECT_FROM);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: WHERE ___ ___ ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnWhere', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementWHERE = "<span class='codeline'>";
            elementWHERE += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='WHERE'>WHERE";
            sqlVerineEditor.NR++;
            elementWHERE += sqlVerineEditor.addLeerzeichen();
            elementWHERE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='WHERE_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementWHERE += sqlVerineEditor.addLeerzeichen();
            elementWHERE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='WHERE_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementWHERE += sqlVerineEditor.addLeerzeichen();
            elementWHERE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='WHERE_3' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementWHERE += "</span></span>";

            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementWHERE);
            } else {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementWHERE);
            }

            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: JOIN ___ ON ___ ___ ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnJoin', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementJOIN = "<span class='codeline'>";
            elementJOIN += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='JOIN'>JOIN";
            sqlVerineEditor.NR++;
            elementJOIN += sqlVerineEditor.addLeerzeichen();
            elementJOIN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='JOIN_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementJOIN += sqlVerineEditor.addLeerzeichen();
            elementJOIN += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 4) + "'>ON</span>";
            sqlVerineEditor.NR++;
            elementJOIN += sqlVerineEditor.addLeerzeichen();
            elementJOIN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='JOIN_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementJOIN += sqlVerineEditor.addLeerzeichen();
            elementJOIN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='JOIN_3' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementJOIN += sqlVerineEditor.addLeerzeichen();
            elementJOIN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='JOIN_4' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementJOIN += "</span></span>";

            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementJOIN);
            } else {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementJOIN);
            }
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        //Button: AND
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnAND', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let parentSqlIdentifier = sqlVerineEditor.CURRENT_SELECTED_ELEMENT.attr("data-sql-element");
            let elementWhereAND = "";
            elementWhereAND += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='AND'>";
            sqlVerineEditor.NR++;
            //elementWhereAND += addLeerzeichen();
            elementWhereAND += " AND";
            elementWhereAND += sqlVerineEditor.addLeerzeichen();
            elementWhereAND += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_AND_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementWhereAND += sqlVerineEditor.addLeerzeichen();
            elementWhereAND += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_AND_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementWhereAND += sqlVerineEditor.addLeerzeichen();
            elementWhereAND += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_AND_3' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementWhereAND += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementWhereAND);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        //Button: OR
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnOR', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let parentSqlIdentifier = sqlVerineEditor.CURRENT_SELECTED_ELEMENT.attr("data-sql-element");
            let elementWhereOR = "";
            elementWhereOR += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='OR'>";
            sqlVerineEditor.NR++;
            //elementWhereOR += addLeerzeichen();
            elementWhereOR += " OR";
            elementWhereOR += sqlVerineEditor.addLeerzeichen();
            elementWhereOR += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_OR_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementWhereOR += sqlVerineEditor.addLeerzeichen();
            elementWhereOR += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_OR_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementWhereOR += sqlVerineEditor.addLeerzeichen();
            elementWhereOR += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='" + parentSqlIdentifier + "_OR_3' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementWhereOR += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementWhereOR);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        //Button: LeftBracket
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnLeftBracket', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.before("<span class='codeElement_" + sqlVerineEditor.NR + "  " + classesFromCodeComponent + " sqlIdentifier extended' data-sql-element='LEFTBRACKET'> ( </span>");
                sqlVerineEditor.NR++;
            }
        });
        //Button: RightBracket
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnRightBracket', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.hasClass("inputField")) {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.after("<span class='codeElement_" + sqlVerineEditor.NR + "  " + classesFromCodeComponent + " sqlIdentifier extended' data-sql-element='RIGHTBRACKET'> ) </span>");
                sqlVerineEditor.NR++;
            }
        });

        // Button: ORDER BY ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnOrder', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementORDER = "";
            elementORDER += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='ORDER'>";
            sqlVerineEditor.NR++;
            elementORDER += sqlVerineEditor.addLeerzeichen();
            elementORDER += "ORDER BY";
            elementORDER += sqlVerineEditor.addLeerzeichen();
            elementORDER += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='ORDER_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementORDER += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementORDER);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        //Button: ASC
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnAsc', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementOrderAsc = "";
            elementOrderAsc += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='ASC'>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementOrderAsc += sqlVerineEditor.addLeerzeichen();
            elementOrderAsc += "ASC";
            elementOrderAsc += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementOrderAsc);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        //Button: DESC
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnDesc', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementOrderDesc = "";
            elementOrderDesc += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DESC'>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementOrderDesc += sqlVerineEditor.addLeerzeichen();
            elementOrderDesc += "DESC";
            elementOrderDesc += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementOrderDesc);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: LIMIT ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnLimit', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementLIMIT = "";
            elementLIMIT += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='LIMIT'>";
            sqlVerineEditor.NR++;
            elementLIMIT += sqlVerineEditor.addLeerzeichen();
            elementLIMIT += "LIMIT";
            elementLIMIT += sqlVerineEditor.addLeerzeichen();
            elementLIMIT += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='LIMIT_1' >___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementLIMIT += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementLIMIT);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: OFFSET ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnOffset', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementOFFSET = "";
            elementOFFSET += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='OFFSET'>";
            sqlVerineEditor.NR++;
            elementOFFSET += sqlVerineEditor.addLeerzeichen();
            elementOFFSET += "OFFSET";
            elementOFFSET += sqlVerineEditor.addLeerzeichen();
            elementOFFSET += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='OFFSET_1' >___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementOFFSET += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementOFFSET);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: GROUP BY ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnGroup', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementGROUP = "";
            elementGROUP += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='GROUP'>";
            sqlVerineEditor.NR++;
            elementGROUP += sqlVerineEditor.addLeerzeichen();
            elementGROUP += "GROUP BY";
            elementGROUP += sqlVerineEditor.addLeerzeichen();
            elementGROUP += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='GROUP_1'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementGROUP += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementGROUP);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: HAVING ___ ___ ___ = like WHERE but can handle Aggregate functions
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnHaving', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementHAVING = "<span class='codeline'>";
            elementHAVING += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='HAVING'>";
            sqlVerineEditor.NR++;
            elementHAVING += "HAVING";
            elementHAVING += sqlVerineEditor.addLeerzeichen();
            elementHAVING += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='HAVING_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementHAVING += sqlVerineEditor.addLeerzeichen();
            elementHAVING += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='HAVING_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementHAVING += sqlVerineEditor.addLeerzeichen();
            elementHAVING += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='HAVING_3' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementHAVING += "</span>";

            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementHAVING);
            } else {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementHAVING);
            }

            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: DELETE FROM ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnSQLDelete', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementDELETE_FROM = "<span class='codeline'>";
            elementDELETE_FROM += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DELETE_FROM'>";
            sqlVerineEditor.NR++;
            elementDELETE_FROM += "DELETE FROM";
            elementDELETE_FROM += sqlVerineEditor.addLeerzeichen();
            elementDELETE_FROM += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='DELETE_FROM_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementDELETE_FROM += "</span></span>";

            $(sqlVerineEditor.EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementDELETE_FROM);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: UPDATE ___ SET ___ = ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnUpdate', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementUPDATE = "<span class='codeline'>";
            elementUPDATE += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='UPDATE'>UPDATE";
            sqlVerineEditor.NR++;
            elementUPDATE += sqlVerineEditor.addLeerzeichen();
            elementUPDATE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='UPDATE_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementUPDATE += sqlVerineEditor.addLeerzeichen();
            elementUPDATE += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 4) + "'>SET</span>";
            sqlVerineEditor.NR++;
            elementUPDATE += sqlVerineEditor.addLeerzeichen();
            elementUPDATE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='UPDATE_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementUPDATE += sqlVerineEditor.addLeerzeichen();
            elementUPDATE += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 8) + "'> = </span>";
            sqlVerineEditor.NR++;
            elementUPDATE += sqlVerineEditor.addLeerzeichen();
            elementUPDATE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='UPDATE_3' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementUPDATE += "</span></span>";

            $(sqlVerineEditor.EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementUPDATE);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: INSERT INTO ___ (___) VALUES (___) 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnInsert', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementINSERT = "<span class='codeline'>";
            elementINSERT += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='INSERT'>INSERT INTO";
            sqlVerineEditor.NR++;
            elementINSERT += sqlVerineEditor.addLeerzeichen();
            elementINSERT += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root insert1 sqlIdentifier' data-sql-element='INSERT_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementINSERT += sqlVerineEditor.addLeerzeichen();

            elementINSERT += "<span class='codeElement_" + sqlVerineEditor.NR + " sqlIdentifier extended'>(</span>";
            sqlVerineEditor.NR++;

            elementINSERT += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root insert2 sqlIdentifier' data-sql-element='INSERT_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "' data-element-group='" + (sqlVerineEditor.NR - 2) + "," + (sqlVerineEditor.NR - 1) + "," + (sqlVerineEditor.NR + 1) + "'>___</span>";
            sqlVerineEditor.NR++;

            elementINSERT += "<span class='codeElement_" + sqlVerineEditor.NR + " sqlIdentifier extended'>)</span>";
            sqlVerineEditor.NR++;

            elementINSERT += sqlVerineEditor.addLeerzeichen();
            elementINSERT += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 6) + "'>VALUES</span>";
            sqlVerineEditor.NR++;
            elementINSERT += sqlVerineEditor.addLeerzeichen();
            elementINSERT += "(<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root insert3 sqlIdentifier' data-sql-element='INSERT_3' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>)";
            sqlVerineEditor.NR++;
            elementINSERT += "</span></span>";

            $(sqlVerineEditor.EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementINSERT);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: DROP TABLE ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnDropTable', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementDROP_TABLE = "<span class='codeline'>";
            elementDROP_TABLE += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DROP_TABLE'>";
            sqlVerineEditor.NR++;
            elementDROP_TABLE += "DROP TABLE";
            elementDROP_TABLE += sqlVerineEditor.addLeerzeichen();
            elementDROP_TABLE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='DROP_TABLE_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementDROP_TABLE += "</span></span>";

            $(sqlVerineEditor.EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementDROP_TABLE);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: ALTER TABLE ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnAlterTable', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementALTER_TABLE = "<span class='codeline'>";
            elementALTER_TABLE += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='ALTER_TABLE'>";
            sqlVerineEditor.NR++;
            elementALTER_TABLE += "ALTER TABLE";
            elementALTER_TABLE += sqlVerineEditor.addLeerzeichen();
            elementALTER_TABLE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='ALTER_TABLE_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementALTER_TABLE += "</span></span>";

            $(sqlVerineEditor.EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementALTER_TABLE);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: DROP COLUMN ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnDropColumn', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementDROP_COLUMN = "";
            elementDROP_COLUMN += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='DROP_COLUMN'>";
            sqlVerineEditor.NR++;
            elementDROP_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementDROP_COLUMN += "DROP COLUMN";
            elementDROP_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementDROP_COLUMN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='DROP_COLUMN_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementDROP_COLUMN += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementDROP_COLUMN);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: RENAME ___ TO ___ 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnRenameTo', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementRENAME_TO = "";
            elementRENAME_TO += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='RENAME_TO'>";
            sqlVerineEditor.NR++;
            elementRENAME_TO += sqlVerineEditor.addLeerzeichen();
            elementRENAME_TO += "RENAME";
            elementRENAME_TO += sqlVerineEditor.addLeerzeichen();
            elementRENAME_TO += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='RENAME_TO_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementRENAME_TO += sqlVerineEditor.addLeerzeichen();
            elementRENAME_TO += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 6) + "'>TO</span>";
            sqlVerineEditor.NR++;
            elementRENAME_TO += sqlVerineEditor.addLeerzeichen();
            elementRENAME_TO += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root insert2 sqlIdentifier' data-sql-element='RENAME_TO_2' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementRENAME_TO += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementRENAME_TO);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: ADD ___ ___ (TYP) 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnAddColumn', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementADD_COLUMN = "";
            elementADD_COLUMN += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='ADD_COLUMN'>";
            sqlVerineEditor.NR++;
            elementADD_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementADD_COLUMN += "ADD";
            elementADD_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementADD_COLUMN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='ADD_COLUMN_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementADD_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementADD_COLUMN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root insert2 sqlIdentifier' data-sql-element='ADD_COLUMN_2' data-next-element='" + (sqlVerineEditor.NR - 4) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementADD_COLUMN += "</span>";

            sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".parent").first().after(elementADD_COLUMN);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: CREATE TABLE ___ (
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnCreateTable', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementCREATE_TABLE = "<span class='codeline'>";
            elementCREATE_TABLE += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields' data-sql-element='CREATE_TABLE'>";
            sqlVerineEditor.NR++;
            elementCREATE_TABLE += "CREATE TABLE";
            elementCREATE_TABLE += sqlVerineEditor.addLeerzeichen();
            elementCREATE_TABLE += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_TABLE_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span> (";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementCREATE_TABLE += "</span></span>";

            //
            elementCREATE_TABLE += "<span class='codeline'>";
            elementCREATE_TABLE += "<span class='codeElement_" + sqlVerineEditor.NR + " sqlIdentifier extended' data-sql-element='CREATE_END_BRACKET'>)</span>";
            sqlVerineEditor.NR++;
            elementCREATE_TABLE += "</span>";

            $(sqlVerineEditor.EDITOR_CONTAINER).find('.codeArea.editor pre code').append(elementCREATE_TABLE);
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });
        // Button: CREATE... spaltenname TYP EINSCHRÄNKUNG 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnCreateColumn', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementCREATE_COLUMN = "<span class='codeline'>";
            elementCREATE_COLUMN += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields createComma' data-sql-element='CREATE_COLUMN'>";
            sqlVerineEditor.NR++;
            elementCREATE_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementCREATE_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementCREATE_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementCREATE_COLUMN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_COLUMN_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;

            elementCREATE_COLUMN += sqlVerineEditor.addLeerzeichen();
            elementCREATE_COLUMN += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_COLUMN_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NR++;

            elementCREATE_COLUMN += sqlVerineEditor.addKomma();
            elementCREATE_COLUMN += "</span>";
            elementCREATE_COLUMN += "</span>";

            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementCREATE_COLUMN);
            } else {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementCREATE_COLUMN);
            }

            //passt Kommas an
            sqlVerineEditor.cleanSQLCode();
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

        // Button: CREATE... FOREIGN KEY spalte REFERENCES tabelle (spalte) 
        $(sqlVerineEditor.EDITOR_CONTAINER).find(".buttonArea.codeComponents").on('click', '.btnCreateForeignKey', function () {
            let self = this;
            let classesFromCodeComponent = sqlVerineEditor.getClassesFromElementAsString(self);
            let elementFOREIGN_KEY = "<span class='codeline'>";;
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + " " + classesFromCodeComponent + " parent sqlIdentifier inputFields createComma' data-sql-element='CREATE_FOREIGN_KEY'>";
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += sqlVerineEditor.addLeerzeichen();
            elementFOREIGN_KEY += sqlVerineEditor.addLeerzeichen();
            elementFOREIGN_KEY += sqlVerineEditor.addLeerzeichen();
            elementFOREIGN_KEY += "FOREIGN KEY";
            elementFOREIGN_KEY += sqlVerineEditor.addLeerzeichen();
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + " sqlIdentifier extended'>(</span>";
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_FOREIGN_KEY_1' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NEXT_ELEMENT_NR = sqlVerineEditor.NR;
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + " sqlIdentifier extended'>)</span>";
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += sqlVerineEditor.addLeerzeichen();
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + "' data-goto-element='" + (sqlVerineEditor.NR - 9) + "'>REFERENCES</span>";
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += sqlVerineEditor.addLeerzeichen();
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled root sqlIdentifier' data-sql-element='CREATE_FOREIGN_KEY_2' data-next-element='" + (sqlVerineEditor.NR + 2) + "'>___</span>";
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + " sqlIdentifier extended'>(</span>";
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + " inputField unfilled extended insert2 sqlIdentifier' data-sql-element='CREATE_FOREIGN_KEY_3' data-next-element='" + (sqlVerineEditor.NR + 2) + "' data-element-group=''>___</span>";
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += "<span class='codeElement_" + sqlVerineEditor.NR + " sqlIdentifier extended'>)</span>";
            sqlVerineEditor.NR++;
            elementFOREIGN_KEY += sqlVerineEditor.addKomma();
            elementFOREIGN_KEY += "</span>";
            elementFOREIGN_KEY += "</span>";

            if (sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().length > 0) {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.find(".codeline").first().before(elementFOREIGN_KEY);
            } else {
                sqlVerineEditor.CURRENT_SELECTED_ELEMENT.closest(".codeline").after(elementFOREIGN_KEY);
            }

            //passt Kommas an
            sqlVerineEditor.cleanSQLCode();
            sqlVerineEditor.setSelection(sqlVerineEditor.NEXT_ELEMENT_NR, false);
        });

    }

    // returns Editor Object
    //return sqlVerineEditor;

}