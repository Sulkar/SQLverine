import {
    SqlVerineEditor
} from "./SqlVerineEditor"

const EMPTY_FORM_PARAMETER = {
    name: "param01",
    label: "",
    position: 0
};

const TEST_FORMULAR_DATA = {
    id: 1,
    title: "",
    description: ""
}

export class SqlVerineForms {

    constructor() {

        this.formsEditor = document.querySelector('#forms-editor');
        this.formsSqlVerineEditorContainer = document.querySelector('#forms-sqlVerineEditor');
        this.formsExecution = document.querySelector('#forms-execution');
        this.formsSqlVerineEditorOutput = document.querySelector('#forms-sqlVerineEditorOutput');
        this.formsEditor.style.display = 'none';
        this.formsSqlVerineEditorContainer.style.display = 'none';

        this.formsChooser = document.getElementById("form-chooser");
        this.formsChooser.addEventListener("change", this.formSelected.bind(this));

        this.addFormButton = document.getElementById("btnFormNew");
        this.addFormButton.addEventListener("click", this.addNewForm.bind(this));

        this.deleteFormButton = document.getElementById("btnFormDelete");
        this.deleteFormButton.addEventListener("click", this.deleteForm.bind(this));

        this.downloadFormButton = document.getElementById("btnFormDownload");
        this.uploadFormButton = document.getElementById("uploadForm");


        //Mode Switch - wechselt von Edit zur View Ansicht
        this.modeSwitch = document.querySelector('#formsSwitchMode');
        this.modeSwitch.status = "bearbeiten";
        this.modeSwitch.addEventListener('change', this.switchMode.bind(this));

        this.verineDatabase;
        this.formsParameterListUI = null;

        this.selectedFormularData = undefined;
        this.formsSqlVerineEditor;

        this.allForms = [];
        this.addFormAllowed = true;

    }

    deleteForm() {
        if (this.selectedFormularData != undefined && this.selectedFormularData.id != undefined) {
            this.verineDatabase.deleteFormById(this.selectedFormularData.id);

            for (var i = this.allForms.length - 1; i >= 0; i--) {
                if (this.allForms[i].id == this.selectedFormularData.id || this.allForms[i].title == '') {
                    this.allForms.splice(i, 1);
                }
            }
        } else if (this.selectedFormularData != undefined) {
            for (var i = this.allForms.length - 1; i >= 0; i--) {
                if (this.allForms[i].id == undefined || this.allForms[i].title == '') {
                    this.allForms.splice(i, 1);
                }
            }
        }

        this.addFormAllowed = true;
        this.updateFormChooser();
        if (this.allForms.length == 0)
            this.selectForm(undefined);
        else
            this.selectForm("1")

    }

    loadAllFormsFromDB() {
        this.allForms = [];
        this.setSelectedFormularData(undefined);
        const formsDB = this.verineDatabase.getForms();
        formsDB.forEach(form => {

            const newFormObjectData = JSON.parse(form[1]);
            const newFormData = new FormularData(newFormObjectData.title);
            newFormObjectData.id = form[0]; //sql ID
            newFormData.setObjectData(newFormObjectData);
            this.allForms.push(newFormData);

        });
        if (this.allForms.length > 0)
            this.setSelectedFormularData(this.allForms[0]);
    }

    saveAllFormsToDB() {
        if (this.selectedFormularData != undefined) {
            this.selectedFormularData.query = this.formsSqlVerineEditor.getSqlQueryText();
            this.selectedFormularData.queryHTML = this.formsSqlVerineEditor.getSqlQueryHtml();
            this.selectedFormularData.queryHTMLlastId = this.formsSqlVerineEditor.NR;
        }
        this.findFormsTable();

        this.allForms.forEach(form => {
            const found = this.verineDatabase.getFormById(form.id);
            let result;
            if (found == undefined) {
                result = this.verineDatabase.addForm(JSON.stringify(form));
                form.id = result;
            } else {
                result = this.verineDatabase.updateForm(JSON.stringify(form), form.id);
            }
        });
    }


    findFormsTable() {
        const result = this.verineDatabase.getTableNames();
        if (result.includes("verine_forms")) {

        } else {
            this.createNewVerineFormsTable();
        }
    }

    createNewVerineFormsTable() {
        this.verineDatabase.runSqlCode('CREATE TABLE verine_forms ("id" INTEGER, "form_data" TEXT, PRIMARY KEY("id" AUTOINCREMENT));');
    }

    updateFormChooser() {
        this.formsChooser.innerHTML = "";
        const placeholderOption = new Option("Formular wählen");
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        placeholderOption.hidden = true;
        this.formsChooser.append(placeholderOption);

        let formsCounter = 1;
        this.allForms.forEach(form => {
            this.formsChooser.append(new Option(form.title, formsCounter));
            formsCounter++;
        })
    }

    switchMode(event) {
        this.saveAllFormsToDB();
        if (this.modeSwitch.status == "bearbeiten") {
            this.setModeSwitchAnzeigen();
        } else {
            this.setModeSwitchBearbeiten();
        }

    }

    setModeSwitchAnzeigen() {
        this.modeSwitch.status = "anzeigen";
        this.formsEditor.style.display = 'block';
        this.formsExecution.style.display = 'none';
        this.formsSqlVerineEditorContainer.style.display = 'block';
        this.formsSqlVerineEditorOutput.style.display = 'none';

        const switchLabel = this.modeSwitch.nextElementSibling;
        switchLabel.innerHTML = this.modeSwitch.status;
    }

    setModeSwitchBearbeiten() {
        this.createExecUI();
        this.modeSwitch.status = "bearbeiten";
        this.formsEditor.style.display = 'none';
        this.formsExecution.style.display = 'block';
        this.formsSqlVerineEditorContainer.style.display = 'none';
        this.formsSqlVerineEditorOutput.style.display = 'block';

        const switchLabel = this.modeSwitch.nextElementSibling;
        switchLabel.innerHTML = this.modeSwitch.status;
    }

    createSqlVerineEditor() {
        this.formsSqlVerineEditor = new SqlVerineEditor();
        this.formsSqlVerineEditor.setEditorContainer('forms-sqlVerineEditor');
        this.formsSqlVerineEditor.setOutputContainer(this.formsSqlVerineEditorOutput.id);
        this.formsSqlVerineEditor.showCodeButton(false);
        this.formsSqlVerineEditor.showCodeSwitch(false);
        this.formsSqlVerineEditor.showRunButton(false);
        this.formsSqlVerineEditor.init();

    }
    updateSqlVerineEditorDatabase(currenDatabase) {
        this.verineDatabase = currenDatabase;
        this.formsSqlVerineEditor.setVerineDatabase(this.verineDatabase);
        this.formsSqlVerineEditor.reinit();
        this.loadAllFormsFromDB();
        this.updateFormChooser();
        if (this.allForms.length > 0)
            this.selectForm("1");
    }


    createUI() {
        this.deleteFormButton.style.display = "none";
        this.modeSwitch.style.display = "none";
        this.modeSwitch.nextElementSibling.style.display = "none";

        const formsEditorRow = document.createElement("div");
        formsEditorRow.classList.add("row");
        if (this.selectedFormularData !== undefined) {

            this.deleteFormButton.style.display = "block";

            this.modeSwitch.style.display = "block";
            this.modeSwitch.nextElementSibling.style.display = "block";
            formsEditorRow.append(this.createEditorTitleUI());

            formsEditorRow.append(document.createElement("br"));
            formsEditorRow.append(document.createElement("br"));
            formsEditorRow.append(this.createEditorDescriptionUI());


            this.formsParameterListUI = this.createEditorParameterListUI();

            this.selectedFormularData.parameters.sort(function (a, b) {
                return parseInt(a.position) - parseInt(b.position);
            });

            this.selectedFormularData.parameters.forEach(param => {
                const listItem = this.createEditorParameterListitemUI(param);
                this.formsParameterListUI.append(listItem);
            });

            formsEditorRow.append(this.formsParameterListUI);

            //sqlverine editor füllen
            let lastEditorId = 1;
            if (this.selectedFormularData.queryHTMLlastId != undefined) lastEditorId = this.selectedFormularData.queryHTMLlastId;
            this.formsSqlVerineEditor.fillCodeAreaWithCode(this.selectedFormularData.queryHTML, lastEditorId);
            this.formsSqlVerineEditor.CURRENT_SELECTED_SQL_ELEMENT = "START";
            this.formsSqlVerineEditor.updateActiveCodeView();



        }

        this.formsEditor.innerHTML = '';
        this.formsEditor.append(formsEditorRow);
        this.createExecUI();

    }

    createExecUI() {
        const formsExecRow = document.createElement("div");
        formsExecRow.classList.add("row");

        if (this.selectedFormularData !== undefined) {
            formsExecRow.append(this.createExecTitleUI());
            formsExecRow.append(this.createExecDescriptionUI());

            const formsExecParametersList = this.createExecListUI();

            this.selectedFormularData.parameters.sort(function (a, b) {
                return parseInt(a.position) - parseInt(b.position);
            });

            this.selectedFormularData.parameters.forEach(param => {
                const execParamListItem = this.createExecParameterListitemUI(param);
                formsExecParametersList.append(execParamListItem);
            });

            formsExecRow.append(formsExecParametersList);
            formsExecRow.append(this.createExecRunButtonUI());

            this.formsExecution.innerHTML = '';
            this.formsExecution.append(formsExecRow);

        } else {
            const noselectedFormularData = document.createElement("p");
            noselectedFormularData.innerHTML = "Es wurde noch kein Formular erstellt oder ausgewählt. Informationen zur Formularerstellung findest du in der Doku unter <a href='https://sqlverine.org/docs/intro'>Formulare erstellen</a>.";
            formsExecRow.append(noselectedFormularData);
            this.formsExecution.innerHTML = '';
            this.formsExecution.append(formsExecRow);
        }
    }

    createExecTitleUI() {
        const formsExecTitle = document.createElement("h4");
        formsExecTitle.innerHTML = this.selectedFormularData.title;
        return formsExecTitle;
    }

    createExecDescriptionUI() {
        const formsExecDescription = document.createElement("p");
        formsExecDescription.innerHTML = this.selectedFormularData.description;
        return formsExecDescription;
    }


    createExecListUI() {
        const formularParameterListe = document.createElement("ul");
        formularParameterListe.classList.add("form-params");


        return formularParameterListe;

    }
    createExecRunButtonUI() {
        const runButton = document.createElement("button");
        runButton.id = "btnExecRun";
        runButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16"><path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" /> <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" /></svg>';

        runButton.addEventListener('click', this.executeDatabaseQuery.bind(this));

        return runButton;
    }

    executeDatabaseQuery() {
        this.verineDatabase.setCurrentPagination(0);
        this.formsSqlVerineEditor.execSqlCommand(this.selectedFormularData.getQueryWithParams(), "desktop");
    }



    createEditorTitleUI() {
        //erstelle Formulartitel Input
        const formularTitel = document.createElement("div");
        formularTitel.classList.add("col-12");
        const formularTitelInput = document.createElement("input");
        formularTitelInput.id = "form-title";
        formularTitelInput.classList.add('form-control');
        formularTitelInput.type = "text";
        formularTitelInput.placeholder = "Formular Titel";
        formularTitelInput.value = this.selectedFormularData.title;
        formularTitel.append(formularTitelInput);

        formularTitelInput.addEventListener('focusout', this.changeTitle.bind(this));

        return formularTitel;
    }

    createEditorDescriptionUI() {
        const formularDescrition = document.createElement("div");
        formularDescrition.classList.add("col-12");
        const formularDescritionTextarea = document.createElement("textarea");
        formularDescritionTextarea.id = "form-description";
        formularDescritionTextarea.classList.add("form-control");
        formularDescritionTextarea.placeholder = "Formular Beschreibung";
        if (this.selectedFormularData.description != undefined)
            formularDescritionTextarea.value = this.selectedFormularData.description;
        formularDescrition.append(formularDescritionTextarea);

        formularDescrition.addEventListener('focusout', this.changeDescription.bind(this));

        return formularDescrition;

    }

    createEditorParameterListUI() {
        //erstellt Forms Parameter Liste
        const formularParameterListe = document.createElement("ul");
        formularParameterListe.classList.add("form-params");

        //ToDo: Listenerstellung so umbauen, dass diese Paramter übernehmen kann
        //this.createParameterListitemUI(formularParameterListe);

        return formularParameterListe;
    }

    createExecParameterListitemUI(formParameter) {
        const parameterListitem = document.createElement("li");

        parameterListitem.id = formParameter.name;

        const parameterBootstrapRow = document.createElement("div");
        parameterBootstrapRow.classList.add("row");
        parameterListitem.append(parameterBootstrapRow);

        //Col 1: Label
        const parameterCol1 = document.createElement("div");
        parameterCol1.classList.add("col-2");
        parameterBootstrapRow.append(parameterCol1);
        const parameterLabel = document.createElement("label");
        parameterLabel.for = "form-exec-" + formParameter.name;
        parameterLabel.id = "label-exec-" + formParameter.name;
        //parameterLabel.classList.add("col-form-label", "form-param");
        parameterLabel.innerHTML = formParameter.label;
        parameterCol1.append(parameterLabel);

        //Col 2: Input
        const parameterCol2 = document.createElement("div");
        parameterCol2.classList.add("col-5");
        parameterBootstrapRow.append(parameterCol2);
        const parameterInput = document.createElement("input");
        parameterInput.classList.add("form-control", "param-name");
        parameterInput.id = "form-exec-" + formParameter.name;
        parameterInput.type = "text";
        parameterInput.placeholder = "Wert eingbeben";

        parameterInput.addEventListener('focusout', this.setParameterValue.bind(this));

        parameterCol2.append(parameterInput);

        return parameterListitem;
    }

    createEditorParameterListitemUI(formParameter) {
        const parameterListitem = document.createElement("li");
        //formularParameterListe.append(parameterListitem);
        parameterListitem.id = formParameter.name;

        const parameterBootstrapRow = document.createElement("div");
        parameterBootstrapRow.classList.add("row");
        parameterListitem.append(parameterBootstrapRow);

        //Col 1: Label
        const parameterCol1 = document.createElement("div");
        parameterCol1.classList.add("col-2");
        parameterBootstrapRow.append(parameterCol1);
        const parameterLabel = document.createElement("label");
        parameterLabel.for = "form-" + formParameter.name;
        parameterLabel.id = "label-" + formParameter.name;
        parameterLabel.classList.add("col-form-label", "form-param");
        parameterLabel.innerHTML = formParameter.name;
        parameterCol1.append(parameterLabel);

        //Col 2: Input
        const parameterCol2 = document.createElement("div");
        parameterCol2.classList.add("col-5");
        parameterBootstrapRow.append(parameterCol2);
        const parameterInput = document.createElement("input");
        parameterInput.classList.add("form-control", "param-name");
        parameterInput.id = "form-" + formParameter.name;
        parameterInput.type = "text";
        parameterInput.placeholder = "Parameterlabel";

        if (formParameter.label != undefined)
            parameterInput.value = formParameter.label;

        parameterInput.addEventListener('focusout', this.changeParameterLabel.bind(this));

        parameterCol2.append(parameterInput);

        //Col 3: Move Up/Down
        const parameterCol3 = document.createElement("div");
        parameterCol3.classList.add("col-auto");
        parameterBootstrapRow.append(parameterCol3);

        const buttonsUpDown = [{
            btnClass: 'btnFormElementUp',
            btnColorClass: 'blue',
            btnFunction: this.moveParameterUp.bind(this),
            btnHTML: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"></path></svg>'
        }, {
            btnClass: 'btnFormElementDown',
            btnColorClass: 'blue',
            btnFunction: this.moveParameterDown.bind(this),
            btnHTML: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"></path></svg>'
        }];
        parameterCol3.append(this.createBtnGroup(buttonsUpDown));

        //Col 4: Add/Remove Formelement

        const parameterCol4 = document.createElement("div");
        parameterCol4.classList.add("col-auto");
        parameterBootstrapRow.append(parameterCol4);

        const buttonsAddRemove = [{
            btnClass: 'btnFormElementAdd',
            btnColorClass: 'green',
            btnFunction: this.addParameter.bind(this),
            btnHTML: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"></path></svg>'
        }, {
            btnClass: 'btnFormElementRemove',
            btnColorClass: 'red',
            btnFunction: this.deleteParameter.bind(this),
            btnHTML: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg>'
        }];
        parameterCol4.append(this.createBtnGroup(buttonsAddRemove));

        return parameterListitem;
    }

    formSelected(event) {
        this.formsSqlVerineEditor.clearOutputContainer();
        //speichert die aktuellen Formdaten in die DB, wenn welche existieren
        this.saveAllFormsToDB();

        if (this.formsChooser.value !== undefined && this.allForms[this.formsChooser.value - 1] !== undefined) {
            this.setSelectedFormularData(this.allForms[this.formsChooser.value - 1]);
        } else {
            this.setSelectedFormularData(undefined);
            this.setModeSwitchBearbeiten();
        }
    }

    selectForm(valueToSelect) {
        if (valueToSelect != undefined)
            this.formsChooser.selectedIndex = valueToSelect;
        this.formSelected();
    }

    addNewForm(event) {

        if (this.addFormAllowed) {
            //speichert die aktuellen Formdaten in die DB, wenn welche existieren

            this.saveAllFormsToDB();


            const optionVal = this.allForms.length + 1;

            const initialFormData = new FormularData(TEST_FORMULAR_DATA.title, "", "", TEST_FORMULAR_DATA.description);
            initialFormData.addParameter(new ParameterData(EMPTY_FORM_PARAMETER.name, EMPTY_FORM_PARAMETER.label, EMPTY_FORM_PARAMETER.position));

            this.allForms.push(initialFormData);
            this.setSelectedFormularData(initialFormData);

            this.setModeSwitchAnzeigen();

            const newFormOption = document.createElement("option");
            newFormOption.value = optionVal;
            newFormOption.innerHTML = "Neues Formular";

            this.formsChooser.append(newFormOption);
            this.formsChooser.value = optionVal;

            document.getElementById("form-title").focus();
            this.addFormAllowed = false;
        }

    }

    changeDescription(event) {
        const input = event.target || event.srcElement;
        this.selectedFormularData.description = input.value;
    }

    changeTitle(event) {


        const input = event.target || event.srcElement;
        if (input.value.trim().length > 0) {
            this.selectedFormularData.title = input.value;

            this.formsChooser.options[this.formsChooser.selectedIndex].innerHTML = input.value;
            this.addFormAllowed = true;
        }
    }

    changeParameterLabel(event) {
        const input = event.target || event.srcElement;
        const paramName = input.id.replace("form-", "");
        const param = this.selectedFormularData.findParameterByName(paramName);

        param.label = input.value;

    }

    setParameterValue(event) {
        const input = event.target || event.srcElement;
        const paramName = input.id.replace("form-exec-", "");
        const param = this.selectedFormularData.findParameterByName(paramName);

        param.value = input.value;
    }

    addParameter(event) {
        const buttonClicked = event.target || event.srcElement;
        const paramListElement = buttonClicked.closest("li");

        const nodes = Array.from(paramListElement.closest('ul').children);
        const position = nodes.indexOf(paramListElement) + 1;

        const parameterToAdd = new ParameterData(this.selectedFormularData.findNextParameterName(), "", position);

        this.selectedFormularData.addParameter(parameterToAdd);

        const listItem = this.createEditorParameterListitemUI(parameterToAdd);


        paramListElement.after(listItem);

    }
    deleteParameter(event) {
        const buttonClicked = event.target || event.srcElement;
        const paramListElement = buttonClicked.closest("li");

        if (this.selectedFormularData.parameters.length > 1) {

            this.selectedFormularData.deleteParameterByName(paramListElement.querySelector("label").textContent);

            paramListElement.remove();
        }
    }
    moveParameterUp(event) {

        const buttonClicked = event.target || event.srcElement;
        const paramListElement = buttonClicked.closest("li");

        if (paramListElement.previousElementSibling) {
            paramListElement.parentNode.insertBefore(paramListElement, paramListElement.previousElementSibling);
            const parameter = this.selectedFormularData.findParameterByName(paramListElement.querySelector("label").textContent);
            this.selectedFormularData.swapParameterPosition(parameter, parameter.position - 1)
        }
    }
    moveParameterDown(event) {

        const buttonClicked = event.target || event.srcElement;
        const paramListElement = buttonClicked.closest("li");

        if (paramListElement.nextElementSibling) {
            paramListElement.parentNode.insertBefore(paramListElement.nextElementSibling, paramListElement);
            const parameter = this.selectedFormularData.findParameterByName(paramListElement.querySelector("label").textContent);
            this.selectedFormularData.swapParameterPosition(parameter, parameter.position + 1)
        }
    }

    createBtnGroup(buttons) {
        const btnGroup = document.createElement("div");
        btnGroup.classList.add("btn-group", "mb-3");
        buttons.forEach(btn => {
            const button = document.createElement("button");
            button.type = "button";
            button.classList.add("btn", "btn-outline-secondary", btn.btnColorClass, btn.btnClass);
            button.innerHTML = btn.btnHTML;
            button.addEventListener("click", btn.btnFunction);

            const hiddenSpan = document.createElement("span");
            hiddenSpan.classList.add("visually-hidden");
            hiddenSpan.innerHTML = "Button";
            button.append(hiddenSpan);

            btnGroup.append(button);
        });
        return btnGroup;
    }

    setSelectedFormularData(selectedFormularData) {
        this.selectedFormularData = selectedFormularData;
        this.createUI();
    }


}

class FormularData {

    constructor(title, query, queryHTML, description) {
        this.title = title;
        this.id = undefined;
        this.parameters = [];
        this.query = query;
        this.queryHTML = queryHTML;
        this.queryHTMLlastId = undefined;
        this.description = description;
    }

    setObjectData(formularObjectData) {
        this.title = formularObjectData.title;
        this.id = formularObjectData.id;
        this.parameters = formularObjectData.parameters;
        this.query = formularObjectData.query;
        this.queryHTML = formularObjectData.queryHTML;
        this.queryHTMLlastId = formularObjectData.queryHTMLlastId;
        this.description = formularObjectData.description;
    }

    addParameter(parameter) {
        this.updateParameterPositions(parameter.position, 1);
        this.parameters.push(parameter);
    }

    findParameterByName(name) {
        let parameter;
        this.parameters.forEach(param => {
            if (param.name === name) parameter = param;
        });
        return parameter;
    }

    deleteParameterByName(name) {
        let para;
        this.parameters.forEach((param, index) => {
            if (param.name === name) {
                this.parameters.splice(index, 1);
                para = param;
            }
        });
        this.updateParameterPositions(para.position, -1);

    }

    deleteParameter(parameter) {
        deleteParameterByName(parameter.name)
        //updateParameterPositions(parameter.position, -1);

    }

    updateParameterPositions(position, direction) {
        this.parameters.forEach(param => {
            if (param.position >= position) {
                param.position = param.position + direction;
            }
        });

    }

    swapParameterPosition(parameter, newPosition) {

        const paramToSwapWith = this.parameters.find(param => param.position == newPosition);
        if (paramToSwapWith != undefined) {
            paramToSwapWith.position = parameter.position;
        }
        parameter.position = newPosition;
    }

    findNextParameterName() {
        const paramNumbers = [];
        this.parameters.forEach(param => {
            const paramNameNumber = parseInt(param.name.replace("param", ""));
            if (!isNaN(paramNameNumber)) {
                paramNumbers.push(paramNameNumber);
            }
        });

        if (paramNumbers.length == 0) {
            return "param01";
        }
        return "param" + this.pad(Math.max.apply(Math, paramNumbers) + 1);

    }

    getQueryWithParams() {
        let queryWithParams = this.query;

        this.parameters.forEach(param => {
            queryWithParams = queryWithParams.replace(param.name, param.value);
        });

        return queryWithParams;
    }


    pad(n) {
        return (n < 10) ? ("0" + n) : n;
    }

}

class ParameterData {
    constructor(name, label, position, value) {
        this.name = name;
        this.position = position;
        this.label = label;
        this.value = value;
    }
}