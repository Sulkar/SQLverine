

class VerineDatabase {

    constructor(name, currentDatabase, type) {
        this.name = name;
        this.database = currentDatabase;
        this.type = type;

        this.activeTable = undefined;
        this.columns = undefined;
        this.values = undefined;

        this.exerciseTable = this.getExerciseTable();
        this.exerciseOrder = this.getExerciseOrder();

        this.updateValues = []; //[sql_id, Spalte, Wert]
        this.insertValues = []; //[auto, Spalte1, Spalte2, ...]
        this.deleteValues = []; //[sql_id, sql_id, ...]
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
    getNextExercise(currentId) {
        let nextExerciseId = undefined;
        this.exerciseOrder.forEach((order, index) => {
            if (order[0] == currentId) {
                if (this.exerciseOrder[index + 1] != null) {
                    nextExerciseId = this.exerciseOrder[index + 1][0];
                } else {
                    nextExerciseId = this.exerciseOrder[0][0];
                }
            }
        });
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

    getTables() {
        let tableNamesArray = [];
        let ececuteSQL = this.database.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
        if (ececuteSQL.length > 0) {
            let tableData = ececuteSQL[0].values;
            tableData.forEach(data => {
                tableNamesArray.push(data[0]);
            });
        }
        return tableNamesArray;
    }

    getExerciseTable() {
        let databaseTables = this.getTables();
        if (databaseTables.includes("verine_exercises")) {
            return "verine_exercises";
        } else {
            return undefined;
        }
    }

    getExerciseById(exerciseId) {
        let exerciseObject = {};
        this.getExercises().forEach(exercise => {
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
            if (solution.loesungString == solutionToTest){
                solutionFound = true;
            } 
        });
        return solutionFound;
    }
    
    addExercise(newExercise, currentExcersiseId) {
        let errorLogArray = [];
        this.exerciseTable = this.getExerciseTable();
        //INSERT INTO pokemon(name, nr, größe, gewicht) VALUES("Pikachu", 3, 34, 4)
        let exerciseValues = '"' + newExercise.titel + '", ' + parseInt(newExercise.reihenfolge) + ', "' + newExercise.beschreibung + '", "'+ newExercise.aufgabenstellung + '", "' + newExercise.informationen + '", "' + newExercise.antworten + '", "' + newExercise.feedback + '",' + newExercise.geloest;
        let addExerciseQuery = 'INSERT INTO ' + this.exerciseTable + ' (titel, reihenfolge, beschreibung, aufgabenstellung, informationen, antworten, feedback, geloest) VALUES (' + exerciseValues + ');';
        try {
            this.database.exec(addExerciseQuery);
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
        if (this.exerciseTable != undefined) {
            return this.database.exec("SELECT * FROM " + this.exerciseTable + ";")[0].values;
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

    createInsertQuery() {
        let insertQuery = "";
        //INSERT INTO pokemon(name, nr, größe, gewicht) VALUES("Pikachu", 3, 34, 4)
        let tableNamesString = "";
        this.columns.forEach(column => {
            if (!column.type.split("|").includes("PRIMARY KEY")) {
                if (tableNamesString == "") tableNamesString += column.name;
                else tableNamesString += ", " + column.name;
            }
        });

        //[auto, Spalte1, Spalte2, ...]
        this.insertValues.forEach(valueArray => {
            let valuesString = "";
            valueArray.forEach((value, index) => {
                if (value != "auto") {
                    if (isNaN(value)) value = '"' + value + '"'; //wenn value keine Zahl ist, muss es mit " " umklammert werden
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

        let tableCreateStatement = this.getTableCreateStatement(tableName);
        let tableData = this.database.exec("SELECT * FROM " + tableName);
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
        let tableCreateStatementArray = tableCreateStatement.split(",");
        tableCreateStatementArray.forEach(createStatementLine => {

            //find types
            let foundColumnName = createStatementLine.match(/\n(\s+|)"([\wöäüß]+)"/); // z.B.: "id" INTEGER NOT NULL UNIQUE,
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
            let foundPrimaryKey = createStatementLine.match(/(PRIMARY KEY\(")(\w+)"/);
            if (foundPrimaryKey != null && foundPrimaryKey[2] == columnName) {
                if (columnObject.type == "") columnObject.type += "PRIMARY KEY";
                else columnObject.type += "|" + "PRIMARY KEY";
            }

        });
        return columnObject;
    }
}
