import $ from "jquery";

(function () {
    // my special code
    $('.codeArea.editor').on('click', 'span', function (event) {
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
}());

export class SqlVerineEditor {

    constructor(activeCodeViewData, currentVerineDatabase) {
        this.NR = 0;
        this.NEXT_ELEMENT_NR = 0;
        this.CURRENT_SELECTED_ELEMENT = undefined;
        this.CURRENT_SELECTED_SQL_ELEMENT = "START";
        this.ACTIVE_CODE_VIEW_DATA = activeCodeViewData;
        this.CURRENT_VERINE_DATABASE = currentVerineDatabase;
        this.USED_TABLES = [];

        this.codeAreaEditor;
    }

    setupEditor() {
        let sqlVerineEditor = this.setupCodeArea() + this.setupMainMenu() + this.setupButtonArea() + '<br><div id="sqlTest">Richi</div>';
        return sqlVerineEditor;
    }


    //function: get Element NR from Element ID
    getElementNr(elementClasses) {
        return elementClasses.split(" ")[0].split("_")[1];
    }

    setupCodeArea() {
        let codeArea = '<div class="codeAreaWrapper">';
        codeArea += '<button id="btnCreateUrl" class="btnCreateUrl d-none d-md-inline-block" data-toggle="tooltip" data-placement="top" title="Download Database">'
        codeArea += '<svg xmlns="http://www.w3.org/2000/svg" width="1.6em" height="1.6em" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">';
        codeArea += '<path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />';
        codeArea += '<path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />';
        codeArea += '</svg>';
        codeArea += '</button>';
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

    setupButtonArea() {
        let buttonArea = '<div class="buttonArea codeComponents"></div>';

        return buttonArea;
    }

    // Button: SELECT ___ FROM ___
    createSelectButton() {

        //button for Button Area
        let selectButton = document.createElement('button');
        selectButton.setAttribute("class", "btnSelect synSQL sqlSelect codeButton")
        selectButton.innerHTML = 'SELECT ___ FROM ___';

        //element for Code Editor
        let elementSELECT_FROM = "";
        let classesFromCodeComponent = this.getClassesFromElementAsString(selectButton);
        this.CURRENT_SELECTED_ELEMENT = undefined;
        elementSELECT_FROM += "<span class='codeline'>";
        elementSELECT_FROM += "<span class='codeElement_" + this.NR + " " + classesFromCodeComponent + " start parent sqlIdentifier inputFields' data-sql-element='SELECT'>SELECT";
        this.NR++;
        elementSELECT_FROM += this.addLeerzeichen();
        elementSELECT_FROM += "<span class='codeElement_" + this.NR + " inputField unfilled root sqlIdentifier' data-sql-element='SELECT_SELECT' data-next-element='" + (this.NR + 4) + "'>___</span>";
        this.NR++;
        elementSELECT_FROM += this.addLeerzeichen();
        elementSELECT_FROM += "<span class='codeElement_" + this.NR + "' data-goto-element='" + (this.NR - 4) + "'>FROM</span>";
        this.NR++;
        elementSELECT_FROM += this.addLeerzeichen();
        elementSELECT_FROM += "<span class='codeElement_" + this.NR + " inputField unfilled root sqlIdentifier active' data-sql-element='SELECT_FROM' data-next-element='" + (this.NR - 4) + "'>___</span>";
        this.NEXT_ELEMENT_NR = this.NR;
        this.NR++;
        elementSELECT_FROM += "</span></span>";

        selectButton.onclick = event => {

            $('.codeArea.editor pre code').append(elementSELECT_FROM);
            this.setSelection(this.NEXT_ELEMENT_NR, false);

        };

        $(".buttonArea.codeComponents").append(selectButton);
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
                    if (removeLastSelectedElement) $('.codeArea.editor pre code').html(""); // lösche alles, keine neue 
                } else { //hat ein prev .codeline                    
                    element = this.CURRENT_SELECTED_ELEMENT.parent().prev(".codeline").find(".parent").last();
                    this.CURRENT_SELECTED_ELEMENT = this.CURRENT_SELECTED_ELEMENT.parent(); //aktuelle Codeline
                }
            } else { //hat ein prev .parent

            }
        }

        //next element is chosen by number
        else {
            element = $(".codeArea.editor pre code .codeElement_" + elementNr);
        }

        this.removeSelection(removeLastSelectedElement);

        if (element != undefined && element.length != 0) {
            element.addClass("active");
            this.CURRENT_SELECTED_ELEMENT = element;
            this.CURRENT_SELECTED_SQL_ELEMENT = element.closest(".sqlIdentifier").data("sql-element");
        } else {
            this.CURRENT_SELECTED_SQL_ELEMENT = "START";
        }
        this.updateActiveCodeView();
    }

    //function: remove Selection from all Elements
    removeSelection(removeLastSelectedElement) {
        $("[class^='codeElement_']").removeClass("active");
        $(".codeInput").val("");
        if (removeLastSelectedElement) this.CURRENT_SELECTED_ELEMENT.remove();
        this.CURRENT_SELECTED_ELEMENT = undefined;
    }


    //function: loops through JSON Data and shows Elements based on selected SQL Element
    updateActiveCodeView() {

        //reset add und delete Button
        $(".buttonArea.mainMenu .btnAdd").hide();
        $(".buttonArea.mainMenu .btnDelete").hide();

        $(".buttonArea.codeComponents").html("");

        this.ACTIVE_CODE_VIEW_DATA.forEach(element => {
            if (element.selectedSQLElement == this.CURRENT_SELECTED_SQL_ELEMENT) {

                //Code Components: sollen auf max x (3) Zeilen verteilt werden
                var maxZeilen = 3;
                var maxComponents = element.visibleCodeComponents.length;
                var componentCounter = 0;

                element.visibleCodeComponents.forEach(element => {

                    //.selColumns werden in Abhängigkeit der USED_TABLES erstellt
                    if (element.codeComponentClass == ".selColumn") {
                        this.updateUsedTables();
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
                    $(element.codeComponentClass).show();
                });

            }
        });

        this.initScrollDots();
    }


    //function: fügt der buttonArea aktuell notwendige codeComponents hinzu
    createCodeComponent(codeComponent, option) {
        switch (codeComponent) {
            case "zeilenumbruch":
                $(".buttonArea.codeComponents").append('<br>');
                break;
            case ".btnSelect":
                this.createSelectButton();
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
            case ".btnOffset":
                $(".buttonArea.codeComponents").append('<button class="btnOffset synSQL sqlOrder codeButton">OFFSET ___</button>');
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
                this.fillSelectionFields(option, selColumn);
                break;
            case ".selTable":
                $(".buttonArea.codeComponents").append('<select class="selTable synTables codeSelect"><option value="0" disabled selected hidden>Tabelle wählen</option></select>');
                this.fillSelectionTables();
                break;
            case ".selColumnCreate":
                $(".buttonArea.codeComponents").append('<select class="selColumnCreate synColumns codeSelect"><option value="0" disabled selected hidden>Spalte wählen</option></select>');
                this.fillSelectionCreateColumns();
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
            case ".btnDropTable":
                $(".buttonArea.codeComponents").append('<button class="btnDropTable synSQL sqlDelete">DROP TABLE ___</button>');
                break;
            case ".btnAlterTable":
                $(".buttonArea.codeComponents").append('<button class="btnAlterTable synSQL sqlDelete">ALTER TABLE ___</button>');
                break;
            case ".btnDropColumn":
                $(".buttonArea.codeComponents").append('<button class="btnDropColumn synSQL sqlDelete">DROP COLUMN ___</button>');
                break;
            case ".btnRenameTo":
                $(".buttonArea.codeComponents").append('<button class="btnRenameTo synSQL sqlDelete">RENAME ___ TO ___</button>');
                break;
            case ".btnAddColumn":
                $(".buttonArea.codeComponents").append('<button class="btnAddColumn synSQL sqlDelete">ADD ___ TYP</button>');
                break;
            case ".selTyp":
                $(".buttonArea.codeComponents").append('<select class="selTyp synTyp codeSelect"><option value="" disabled selected hidden>Typ wählen</option><option value="INTEGER">INTEGER</option><option value="TEXT">TEXT</option><option value="REAL">REAL</option><option value="BLOB">BLOB</option></select>');
                break;
            case ".selConstraint":
                $(".buttonArea.codeComponents").append('<select class="selConstraint synTyp codeSelect"><option value="" disabled selected hidden>Typ wählen</option><option value="UNIQUE">UNIQUE</option><option value="PRIMARY KEY">PRIMARY KEY</option><option value="AUTOINCREMENT">AUTOINCREMENT</option><option value="FOREIGN KEY">FOREIGN KEY</option><option value="NOTT NULL">NOT NULL</option></select>');
                break;
            case ".btnCreateTable":
                $(".buttonArea.codeComponents").append('<button class="btnCreateTable synSQL sqlDelete">CREATE TABLE ___ ( )</button>');
                break;
            case ".btnCreateColumn":
                $(".buttonArea.codeComponents").append('<button class="btnCreateColumn synSQL sqlDelete"> NEUE SPALTE ___ </button>');
                break;
            case ".btnCreateForeignKey":
                $(".buttonArea.codeComponents").append('<button class="btnCreateForeignKey synSQL sqlDelete"> FOREIGN KEY ___ REFERENCES ___ (___)</button>');
                break;
            default:
            //log("no component found")
        }
    }

    //function: befüllt .selTable mit allen Tabellen der Datenbank
    fillSelectionTables() {
        this.clearSelectionOptions(".buttonArea .selTable");
        var databaseTables = this.getSqlTables();
        for (var i = 0; i < databaseTables.length; i++) {
            if (databaseTables[i] != "verine_exercises") {
                $(".buttonArea .selTable").append(new Option(databaseTables[i], databaseTables[i]));
            }
        }
    }

    //function: befüllt .selColumnCreate mit allen Spalten im SQL Crate Statement
    fillSelectionCreateColumns() {
        let createSQLStatementLines = $(".codeArea.editor pre code").text().replace(/CREATE TABLE\s'(.*?)'/, "").split(",");
        createSQLStatementLines.forEach(element => {
            let currentLineColumn = element.match(/'(.*?)'/);
            if (currentLineColumn != null && currentLineColumn.length > 0) {
                $(".buttonArea .selColumnCreate").append(new Option(currentLineColumn[1], currentLineColumn[1]));
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
    }


    //function: get all used db tables in code area
    updateUsedTables() {
        this.USED_TABLES = [];
        $(".codeArea.editor .selTable").each(function () {
            if (!this.USED_TABLES.includes($(this).html())) {
                this.USED_TABLES.push($(this).html());
            }
        });
    }

}