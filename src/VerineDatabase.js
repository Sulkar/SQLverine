export class VerineDatabase {

    constructor(name, currentDatabase, type) {

        this.name = name;
        this.database = currentDatabase;
        this.type = type;

        this.activeTable = undefined;
        this.columns = undefined;
        this.values = undefined;

        this.maxLimit = 200;
        this.currentPagination = 0;

        if (this.database != null) {
            this.exerciseTable = this.getExerciseTable();
            this.formTable = this.getFormTable();
            this.exerciseOrder = this.getExerciseOrder();
            this.exerciseArray = this.getExercises();
            this.formArray = this.getForms();
        }

        this.updateValues = []; //[sql_id, Spalte, Wert]
        this.insertValues = []; //[auto, Spalte1, Spalte2, ...]
        this.deleteValues = []; //[sql_id, sql_id, ...]

        this.colorArray = ["coral", "tomato", "palegreen", "orange", "gold", "yellowgreen", "mediumaquamarine", "paleturquoise", "skyblue", "cadetblue", "pink", "hotpink", "orchid", "mediumpurple", "lightoral"];



    }
    getCurrentPagination() {
        return this.currentPagination;
    }
    setCurrentPagination(currentPagination) {
        this.currentPagination = currentPagination;
    }
    getMaxLimit() {
        return this.maxLimit;
    }
    setMaxLimit(maxLimit) {
        this.maxLimit = maxLimit;
    }
    hasExercises() {
        if (this.exerciseArray.length > 0) return true;
        else return false;
    }

    setupExercises() {
        if (this.getExercises().length > 0) {
            this.currentExcersiseId = this.getNextExerciseId(null);
        } else {
            this.currentExcersiseId = undefined;
        }
    }

    getCurrentExerciseId() {
        return this.currentExcersiseId;
    }

    setCurrentExerciseId(currentExcersiseId) {
        this.currentExcersiseId = currentExcersiseId;
    }

    runSqlCode(sqlCode) {
        let result = {};
        result.error = undefined;
        result.query = undefined;
        try {
            result.query = this.database.exec(sqlCode)[0];
            return result;
        } catch (err) {
            result.error = err;
            return result;
        }
    }

    runSqlCodeDirect(sqlCode) {
        let result = {};
        result.error = undefined;
        result.query = undefined;
        try {
            result.query = this.database.exec(sqlCode);
            return result;
        } catch (err) {
            result.error = err;
            return result;
        }
    }

    getExerciseOrder() {
        var exerciseOrderArray = [];
        this.getExercises().forEach(exercise => {
            exerciseOrderArray.push([exercise[1], exercise[0]]); //reihenfolge und id von exercise
        });
        //sortiert die Elemente anhand der Spalte Reihenfolge
        exerciseOrderArray.sort(function (a, b) {
            return a[0] - b[0];
        });
        return exerciseOrderArray;
    }

    getNextExerciseId(currentId) {
        let nextExerciseId = undefined;
        if (currentId != null) {
            this.exerciseOrder.forEach((order, index) => {
                if (order[1] == currentId) {
                    if (this.exerciseOrder[index + 1] != null) {
                        nextExerciseId = this.exerciseOrder[index + 1][1];
                    } else {
                        nextExerciseId = this.exerciseOrder[0][1];
                    }
                }
            });
        } else {
            nextExerciseId = this.exerciseOrder[0][1];
        }
        this.currentExcersiseId = nextExerciseId;
        return nextExerciseId;
    }

    getNewExerciseOrderAfterId(getNewOrderAfterId) {
        this.exerciseOrder = this.getExerciseOrder();
        let orderOfId = undefined;
        let updateQuery = "";
        this.exerciseOrder.forEach(orderElement => {
            if (orderOfId != undefined) { //alle Übungen nach der gesuchten, bekommen eine reihenfolge +1
                orderElement[0] = orderElement[0] + 1;
                updateQuery += 'UPDATE ' + this.exerciseTable + ' SET reihenfolge = ' + orderElement[0] + ' WHERE id = ' + orderElement[1] + ';';
            }
            if (orderElement[1] == getNewOrderAfterId) { //finde Ordernummer der übergebenen ID 
                orderOfId = orderElement[0];
            }
        });
        try {
            this.database.exec(updateQuery);
            return orderOfId + 1;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    reorderExercises(exerciseMoveId, moveDirection) {
        this.exerciseOrder = this.getExerciseOrder();
        let updateQuery = "";
        this.exerciseOrder.forEach((orderElement, index) => {

            if (orderElement[1] == exerciseMoveId) {
                if (moveDirection == "down") {
                    if (index < this.exerciseOrder.length - 1) {
                        //bewegt die Übung eine Position nach unten
                        orderElement[0] = orderElement[0] + 1;
                        updateQuery += 'UPDATE ' + this.exerciseTable + ' SET reihenfolge = ' + orderElement[0] + ' WHERE id = ' + orderElement[1] + ';';
                        //bewegt die Übung hinter der zu bewegenden Übung eins nach oben
                        let indexOfNextExerciseOrder = index + 1;
                        this.exerciseOrder[indexOfNextExerciseOrder][0] = this.exerciseOrder[indexOfNextExerciseOrder][0] - 1;
                        updateQuery += 'UPDATE ' + this.exerciseTable + ' SET reihenfolge = ' + this.exerciseOrder[indexOfNextExerciseOrder][0] + ' WHERE id = ' + this.exerciseOrder[indexOfNextExerciseOrder][1] + ';';
                    }
                } else if (moveDirection == "up") {
                    if (index > 0) {
                        //bewegt die Übung eine Position nach oben
                        orderElement[0] = orderElement[0] - 1;
                        updateQuery += 'UPDATE ' + this.exerciseTable + ' SET reihenfolge = ' + orderElement[0] + ' WHERE id = ' + orderElement[1] + ';';
                        //bewegt die Übung hinter der zu bewegenden Übung eins nach unten
                        let indexOfNextExerciseOrder = index - 1;
                        this.exerciseOrder[indexOfNextExerciseOrder][0] = this.exerciseOrder[indexOfNextExerciseOrder][0] + 1;
                        updateQuery += 'UPDATE ' + this.exerciseTable + ' SET reihenfolge = ' + this.exerciseOrder[indexOfNextExerciseOrder][0] + ' WHERE id = ' + this.exerciseOrder[indexOfNextExerciseOrder][1] + ';';
                    }
                }
            }
        });
        try {
            this.database.exec(updateQuery);
            return true;
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    getTableNames() {
        let tableNamesArray = [];
        let ececuteSQL = this.database.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
        if (ececuteSQL.length > 0) {
            let tableData = ececuteSQL[0].values;
            tableData.forEach(data => {
                tableNamesArray.push(data[0]);
            });
        } else {
            this.activeTable = undefined;
        }
        return tableNamesArray;
    }

    getExerciseTable() {
        let databaseTables = this.getTableNames();
        if (databaseTables.includes("verine_exercises")) {
            return "verine_exercises";
        } else {
            this.exerciseTable = undefined;
            return this.exerciseTable;
        }
    }

    getFormTable() {
        let databaseTables = this.getTableNames();
        if (databaseTables.includes("verine_forms")) {
            return "verine_forms";
        } else {
            this.formTable = undefined;
            return this.formTable;
        }
    }

    getFormById(formId) {
        let formData = undefined;
        this.formArray.forEach(form => {
            if (form[0] == formId) {
                formData = form[1];
            }
        });
        return formData;
    }

    getForms() {
        this.formTable = this.getFormTable();
        if (this.formTable != undefined) {
            try {
                return this.database.exec("SELECT * FROM " + this.formTable + ";")[0].values;
            } catch (err) {
                return [];
            }
        } else {
            return [];
        }
    }

    addForm(newFormData) {
        const errorLogArray = [];
        this.formTable = this.getFormTable();
        const addFormQuery = "INSERT INTO " + this.formTable + " (form_data) VALUES ('" + newFormData + "');";

        try {
            this.database.exec(addFormQuery);
            this.formArray = this.getForms();
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }
        if (errorLogArray.length == 0) {
            //gibt die ID der neu eingefügten Form zurück
            return this.database.exec("SELECT last_insert_rowid()")[0].values[0][0];
        } else {
            return errorLogArray;
        }
    }

    updateForm(updateFormData, id) {
        const errorLogArray = [];
        let updateQuery = "";
        updateQuery += "UPDATE " + this.formTable + " SET form_data = '" + updateFormData + "' WHERE id = " + id + ";";

        try {
            this.database.exec(updateQuery);
            this.formArray = this.getForms();
            return true;
        } catch (err) {
            return errorLogArray.push(err);
        }
    }

    deleteFormById(formId) {
        let errorLogArray = [];
        let deleteExerciseQuery = 'DELETE FROM ' + this.formTable + ' WHERE id = ' + formId + ';';
        try {
            const result = this.database.exec(deleteExerciseQuery);
            this.formArray = this.getForms();
            return result;
        } catch (err) {
            errorLogArray.push(err);
            return errorLogArray;
        }
    }

    getExerciseById(exerciseId) {
        let exerciseObject = {};
        this.exerciseArray.forEach(exercise => {
            if (exercise[0] == exerciseId) {
                exerciseObject.id = exercise[0];
                exerciseObject.reihenfolge = exercise[1];
                exerciseObject.titel = exercise[2];
                exerciseObject.beschreibung = exercise[3];
                exerciseObject.aufgabenstellung = exercise[4]; //
                exerciseObject.informationen = exercise[5];
                exerciseObject.antworten = exercise[6];
                exerciseObject.answerObject = this.getExerciseAnswerObject(exerciseObject.antworten);
                exerciseObject.feedback = exercise[7];
                exerciseObject.geloest = exercise[8]; //
            }
        });
        return exerciseObject;
    }

    getInfo() {
        let verine_info;
        try {
            verine_info = this.database.exec("SELECT * FROM verine_info;")[0].values[0];
        } catch (err) {
            verine_info = [];
        }

        let infoObject = {};
        if (verine_info.length > 0) {
            infoObject.id = verine_info[0];
            infoObject.autor_name = verine_info[1];
            infoObject.autor_url = verine_info[2];
            infoObject.lizenz = verine_info[3];
            infoObject.informationen = verine_info[4];
            infoObject.freie_aufgabenwahl = verine_info[5]
        }

        return infoObject;
    }

    getRows(tableName) {
        if (tableName == undefined) tableName = this.activeTable;
        return this.database.exec("SELECT COUNT(*) FROM " + tableName)[0].values[0][0];
    }

    setLastPaginationPage() {
        const rows = this.getRows();
        const lastPaginationPage = Math.floor(rows / this.getMaxLimit());
        const remainder = rows % this.getMaxLimit();
        if (remainder == 0) {
            this.setCurrentPagination(lastPaginationPage - 1);
        } else {
            this.setCurrentPagination(lastPaginationPage);
        }

    }

    setCurrentExerciseAsSolved() {
        this.exerciseArray.forEach(exercise => {
            if (exercise[0] == this.currentExcersiseId) {
                exercise[8] = true;
            }
        });
    }

    getExerciseAnswerObject(exerciseAnswerString) {
        let answerObject = {};
        answerObject.exerciseSolutionArray = [];

        //&next
        if (exerciseAnswerString.search(/&next/) != -1) answerObject.next = true;
        else answerObject.next = false;

        //&input
        if (exerciseAnswerString.search(/&input/) != -1) answerObject.input = true;
        else answerObject.input = false;

        //&rows=
        if (exerciseAnswerString.search(/&rows=(\d+)/) != -1) answerObject.rows = parseInt(exerciseAnswerString.match(/&rows=(\d+)/)[1]);
        else answerObject.rows = 0;

        exerciseAnswerString.split("|").forEach(solution => {

            let exerciseSolution = {};
            //loesungString = String vor () und &
            exerciseSolution.loesungString = solution.match(/([\d\wöäüÄÖÜß \-]+)(\(+|&+|$)/);
            if (exerciseSolution.loesungString != null) exerciseSolution.loesungString = exerciseSolution.loesungString[1];

            //Werte in Klammern (table.column)
            var tableColumn = solution.match(/\((.+)\)/);
            if (tableColumn != null) {
                exerciseSolution.table = tableColumn[1].split(".")[0];
                exerciseSolution.column = tableColumn[1].split(".")[1];
            } else {
                exerciseSolution.table = undefined;
                exerciseSolution.column = undefined;
            }

            answerObject.exerciseSolutionArray.push(exerciseSolution);
        });

        return answerObject;
    }

    isInExerciseSolutionArray(exerciseSolutionArray, solutionToTest) {
        let solutionFound = false;
        exerciseSolutionArray.forEach(solution => {
            if (solution.loesungString == solutionToTest) {
                solutionFound = true;
            }
        });
        return solutionFound;
    }

    addExercise(newExercise, currentExcersiseId) {
        let errorLogArray = [];
        this.exerciseTable = this.getExerciseTable();
        //INSERT INTO pokemon(name, nr, größe, gewicht) VALUES("Pikachu", 3, 34, 4)
        let exerciseValues = '"' + newExercise.titel + '", ' + parseInt(newExercise.reihenfolge) + ', "' + newExercise.beschreibung + '", "' + newExercise.aufgabenstellung + '", "' + newExercise.informationen + '", "' + newExercise.antworten + '", "' + newExercise.feedback + '",' + newExercise.geloest;
        let addExerciseQuery = 'INSERT INTO ' + this.exerciseTable + ' (titel, reihenfolge, beschreibung, aufgabenstellung, informationen, antworten, feedback, geloest) VALUES (' + exerciseValues + ');';
        try {
            this.database.exec(addExerciseQuery);
            this.exerciseArray = this.getExercises();
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }
        if (errorLogArray.length == 0) {
            //gibt die ID der neu eingefügten Übung zurück
            return this.database.exec("SELECT last_insert_rowid()")[0].values[0][0];
        } else {
            return errorLogArray;
        }
    }

    updateExercise(exerciseUpdateArray) {
        let updateQuery = ""; // UPDATE students SET score1 = 5, score2 = 8 WHERE id = 1;
        exerciseUpdateArray.forEach(updateValue => {
            if (isNaN(updateValue[2]) || updateValue[2] == "") { //[1, "titel", ""]
                //updateQuery += 'UPDATE ' + this.exerciseTable + ' SET ' + updateValue[1] + ' = ' + updateValue[2] + ' WHERE id = ' + updateValue[0] + ';';
                updateQuery += "UPDATE " + this.exerciseTable + " SET " + updateValue[1] + " = '" + updateValue[2] + "' WHERE id = " + updateValue[0] + ";";
            } else {
                updateQuery += 'UPDATE ' + this.exerciseTable + ' SET ' + updateValue[1] + ' = ' + updateValue[2] + ' WHERE id = ' + updateValue[0] + ';';
            }
        });
        try {
            this.database.exec(updateQuery);
            this.exerciseArray = this.getExercises();
            return true;
        } catch (err) {
            console.log(err);
        }
    }

    updateInfo(infoUpdateArray) {
        let updateQuery = ""; // UPDATE students SET score1 = 5, score2 = 8 WHERE id = 1;


        let checkFreieAufgabenwahlSpalte = "SELECT freie_aufgabenwahl FROM verine_info";
        try {
            this.database.exec(checkFreieAufgabenwahlSpalte);
        } catch (err) {
            let alterTable = "ALTER TABLE verine_info ADD 'freie_aufgabenwahl' INTEGER";
            try {
                this.database.exec(alterTable);
            } catch (err) {
                console.log(err);
            }
        }

        infoUpdateArray.forEach(updateValue => {
            updateQuery += "UPDATE verine_info SET " + updateValue[0] + " = '" + updateValue[1] + "' WHERE id = 1;";
        });

        try {
            this.database.exec(updateQuery);
            return true;
        } catch (err) {
            console.log(err);
        }
    }

    deleteExercise(exerciseId) {
        this.exerciseOrder = this.getExerciseOrder();
        // '"DELETE FROM mytable WHERE id IN (?,?,?,...)");'
        let errorLogArray = [];
        let exerciseIdBeforeElement = undefined;
        let deleteExerciseQuery = 'DELETE FROM ' + this.exerciseTable + ' WHERE id = ' + exerciseId + ';';
        try {
            this.database.exec(deleteExerciseQuery);
            this.exerciseArray = this.getExercises();
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }
        if (errorLogArray.length == 0) {
            //gibt die ID der Übung vor oder nach der gelöschten Übung zurück
            this.exerciseOrder.forEach((orderElement, index) => {
                if (orderElement[1] == exerciseId) {
                    if (index > 0) exerciseIdBeforeElement = this.exerciseOrder[index - 1][1];
                    else if (index < this.exerciseOrder.length - 1) exerciseIdBeforeElement = this.exerciseOrder[index + 1][1];
                }
            });
            return exerciseIdBeforeElement;
        } else {
            return errorLogArray;
        }
    }

    getExercises() {
        this.exerciseTable = this.getExerciseTable();
        if (this.exerciseTable != undefined) {
            try {
                return this.database.exec("SELECT * FROM " + this.exerciseTable + ";")[0].values;
            } catch (err) {
                return [];
            }
        } else {
            return [];
        }
    }

    getColumns(tableName) {
        return this.database.exec("PRAGMA table_info(" + tableName + ")")[0].values;
    }

    getTableCreateStatement(tableName) {
        return this.database.exec("SELECT sql FROM sqlite_master WHERE name = '" + tableName + "'")[0].values[0][0];

    }

    persist() {

        let errorLogArray = [];
        //update rows
        try {
            if (this.createUpdateQuery() != undefined) this.database.exec(this.createUpdateQuery());
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }

        //delete rows
        try {
            if (this.createDeleteQuery() != undefined) this.database.exec(this.createDeleteQuery());
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }
        //insert rows
        try {
            if (this.createInsertQuery() != undefined) this.database.exec(this.createInsertQuery());
        } catch (err) {
            errorLogArray.push(err);
            console.log(err);
        }
        return errorLogArray;

    }

    createUpdateQuery() {

        let updateQuery = ""; // UPDATE students SET score1 = 5, score2 = 8 WHERE id = 1;
        this.updateValues.forEach(updateValue => {
            if (isNaN(updateValue[2]) || updateValue[2] == "") {
                updateQuery += 'UPDATE ' + this.activeTable + ' SET ' + updateValue[1] + ' = "' + updateValue[2] + '" WHERE id = ' + updateValue[0] + ';';
            } else {
                updateQuery += 'UPDATE ' + this.activeTable + ' SET ' + updateValue[1] + ' = ' + updateValue[2] + ' WHERE id = ' + updateValue[0] + ';';
            }
        });
        if (updateQuery != "") return updateQuery;
        else return undefined;

    }

    createDeleteQuery() {
        let deleteIds = ""; // '"DELETE FROM mytable WHERE id IN (?,?,?,...)");'
        this.deleteValues.forEach(idToDelete => {
            if (deleteIds == "") deleteIds += idToDelete;
            else deleteIds += ", " + idToDelete;
        });
        if (deleteIds != "") return 'DELETE FROM ' + this.activeTable + ' WHERE id IN (' + deleteIds + ')';
        else return undefined;
    }

    createInsertQuery(insertPrimaryKey = false) {
        let insertQuery = "";
        //INSERT INTO pokemon(name, nr, größe, gewicht) VALUES("Pikachu", 3, 34, 4)
        let tableNamesString = "";
        this.columns.forEach(column => {
            if (insertPrimaryKey || !column.type.split("|").includes("PRIMARY KEY")) {
                if (tableNamesString == "") tableNamesString += column.name;
                else tableNamesString += ", " + column.name;
            }
        });

        //[auto, Spalte1, Spalte2, ...]
        this.insertValues.forEach(valueArray => {
            let valuesString = "";
            valueArray.forEach((value, index) => {
                if (value != "auto") {
                    if (isNaN(value) || value == "") value = '"' + value + '"'; //wenn value keine Zahl ist oder leer ist, muss es mit " " umklammert werden
                    if (valuesString == "") valuesString += '(' + value;
                    else valuesString += ', ' + value;

                    if (index == valueArray.length - 1) valuesString += ')';

                }
            });
            insertQuery += 'INSERT INTO ' + this.activeTable + '(' + tableNamesString + ') VALUES ' + valuesString + ';';
        });

        //build insertQuery
        if (insertQuery != "") return insertQuery;
        else return undefined;
    }

    prepareTableData(tableName) {
        if (tableName == null) {
            tableName = this.activeTable;
        } else {
            this.activeTable = tableName;
        }

        //erstellt einen LIMIT +1 mit OFFSET Befehl für Pagination (+1 ist wichtig, um zu sehen, ob noch mehr Einträge vorhanden sind)
        const tempLimitAndOffset = " LIMIT " + (this.getMaxLimit() + 1) + " OFFSET " + (this.getCurrentPagination() * this.getMaxLimit());

        let tableCreateStatement = this.getTableCreateStatement(tableName);
        let tableData = this.database.exec("SELECT * FROM " + tableName + tempLimitAndOffset);
        if (tableData[0] != undefined) {
            let columnObjects = [];
            tableData[0].columns.forEach(column => {
                let columnObject = this.createColumnObject(column, tableCreateStatement);
                columnObjects.push(columnObject);
            });

            this.columns = columnObjects;
            this.values = tableData[0].values;
        } else { //keine Daten in der Tabelle vorhanden
            let columns = this.getColumns(tableName);
            let columnObjects = [];
            columns.forEach(column => {
                let columnObject = this.createColumnObject(column[1], tableCreateStatement);
                columnObjects.push(columnObject);
            })
            this.columns = columnObjects;
            this.values = [];
        }
    }

    createColumnObject(columnName, tableCreateStatement) {

        let typeArray = ["INTEGER", "TEXT", "REAL", "NOT NULL", "UNIQUE", "PRIMARY KEY"];

        let columnObject = {};
        columnObject.name = columnName;
        columnObject.type = "";

        //untersucht das Table Create Statement
        tableCreateStatement = tableCreateStatement.replace(/CREATE TABLE [^\(]+\(/g, ""); //removes CREATE TABLE ... (
        let tableCreateStatementArray = tableCreateStatement.split(",");
        tableCreateStatementArray.forEach(createStatementLine => {

            //find types
            let foundColumnName = createStatementLine.match(/(\s+|)["']([\wöäüß]+)["']/); // z.B.: "id" INTEGER NOT NULL UNIQUE,
            if (foundColumnName != null && foundColumnName[2] == columnName) {
                typeArray.forEach(sqlType => {
                    var re = new RegExp("\\b" + sqlType + "\\b", "");
                    if (createStatementLine.search(re) != -1) {
                        if (columnObject.type == "") columnObject.type += sqlType;
                        else columnObject.type += "|" + sqlType;
                    }
                });
            }
            //check for primary key, ...
            let foundPrimaryKey = createStatementLine.match(/(PRIMARY KEY\(["'])(\w+)["']/);
            if (foundPrimaryKey != null && foundPrimaryKey[2] == columnName) {
                if (columnObject.type == "") columnObject.type += "PRIMARY KEY";
                else columnObject.type += "|" + "PRIMARY KEY";
            }

        });
        return columnObject;
    }

    //function: Erstellt eine Tabelle mit den Informationen der Tabellen einer SQL Datenbank
    createTableInfo(indexesToDisplay) {

        let tables = this.getTables();
        let tableCounter = 1;
        let htmlTableInfo = "";
        let databaseForeignKeyInformationArray = [];
        let tableColorArray = [];

        tables.forEach(table => {
            if (table != "verine_exercises" && table != "verine_info" && table != "verine_forms") {
                let tableColor = this.colorArray[tableCounter % this.colorArray.length];

                if (tableCounter % 3 == 0) {
                    htmlTableInfo += "</div><div class='row'>";
                } else if (tableCounter == 1) {
                    htmlTableInfo += "<div class='row'>";
                }

                let currentTableData = this.database.exec("PRAGMA table_info(" + table + ")");

                htmlTableInfo += "<div class='col-sm'>";

                //ForeignKey Informationen der Tabelle je Spalte wird abgerufen
                let tableForeignKeyInformationArray = this.getTableForeignKeyInformation(table);
                let indexesToDisplayArray = [];

                //erstellt eine Tabelle mit dem Datenbankschema
                for (let i = 0; i < currentTableData.length; i++) {

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
                    let newTableColor = {};
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
                                let foundForeignKeyReference = element.toString().match(/\_id|\_ID/g);
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
            }
        });

        //kennzeichne ForeignKey Verbindungen farblich
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

    getTables() {
        return this.database.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")[0].values;
    }

    //function: parst anhand des SQL CREATE Befehls die Foreign Keys 
    getTableForeignKeyInformation(tableName) {

        let tableForeignKeyInformationArray = [];
        let currentTableColumns = this.getColumns(tableName);
        let currentTableCreateStatement = this.database.exec("SELECT sql FROM sqlite_master WHERE name = '" + tableName + "'")[0].values[0][0];

        currentTableColumns.forEach(column => { //id, name, vorname, klasse_id, ...
            let foreignKeyfound = false;
            let newColumnObject = {};
            newColumnObject.name = column[1];
            newColumnObject.tableSelf = tableName;

            let newArray = currentTableCreateStatement.split(",");
            newArray.forEach(element => {
                let regexForeignKeyColumnSelf = element.match(/FOREIGN KEY(\s\(|\()(.*?)\)/); //sucht nach FOREIGN KEY ( )
                if (regexForeignKeyColumnSelf != null) {

                    let columnWithForeignKey = regexForeignKeyColumnSelf[2].replaceAll(/"|\s/g, ""); //entfernt alle Anführungszeichen und Leerzeichen 
                    if (newColumnObject.name == columnWithForeignKey) { //Informationen werden nur ergänzt, wenn es sich um die richtige Spalte handelt

                        newColumnObject.columnSelf = columnWithForeignKey;
                        let regexForeignKeyColumnTarget = element.split("REFERENCES")[1].match(/\((.*?)\)/); //sucht nach ( ) 
                        let regexForeignKeyTableTarget = element.split("REFERENCES")[1].match(/^(.*?)\(/); //sucht von vorne bis zur ersten (
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
}