const EMPTY_FORM_PARAMETER = 
{
    name: "param01",
    label: "",
    position: 1
};

/*
const TEST_FORMULAR_DATA = {
    id: 1,
    name: "Test Formular",
    parameters:[
        {
            name: "param01",
            label: "Parameter 1",
            position: 1
        },
        {
            name: "param02",
            label: "Parameter 2",
            position: 2
        },
        {
            name: "param03",
            label: "Parameter 3",
            position: 3
        },
    ]
}*/
export class SqlVerineForms {


    constructor() {

        this.formsEditor = document.querySelector('#forms-editor');
        this.formsExecution = document.querySelector('#forms-execution');

        this.formsParameterList = null;

    }


    createUI() {

        const formsEditorRow = document.createElement("div");
        formsEditorRow.classList.add("row");

        formsEditorRow.append(this.createTitleUI());


        this.formsParameterList = this.createParameterListUI();


        const defaultFormParam = new ParameterData(EMPTY_FORM_PARAMETER.name,EMPTY_FORM_PARAMETER.label,EMPTY_FORM_PARAMETER.position);
        const listItem = this.createParameterListitemUI(defaultFormParam);

        this.formsParameterList.append(listItem);

        formsEditorRow.append(this.formsParameterList);

        this.formsEditor.append(formsEditorRow);


        //this.createParameterListUI();
        //...
    }

    createTitleUI() {
        //erstelle Formulartitel Input


        const formularTitel = document.createElement("div");
        formularTitel.classList.add("col-12");
        const formularTitelInput = document.createElement("input");
        formularTitelInput.id = "form-title";
        formularTitelInput.classList.add('form-control');
        formularTitelInput.type = "text";
        formularTitelInput.placeholder = "Formular Titel";
        formularTitel.append(formularTitelInput);

        return formularTitel;
    }

    createParameterListUI() {
        //erstellt Forms Parameter Liste
        const formularParameterListe = document.createElement("ul");
        formularParameterListe.classList.add("form-params");

        //ToDo: Listenerstellung so umbauen, dass diese Paramter übernehmen kann
        //this.createParameterListitemUI(formularParameterListe);

        return formularParameterListe;
    }


    createParameterListitemUI(formParameter) {
        const parameterListitem = document.createElement("li");
        //formularParameterListe.append(parameterListitem);
        parameterListitem.id=formParameter.name;

        const parameterBootstrapRow = document.createElement("div");
        parameterBootstrapRow.classList.add("row");
        parameterListitem.append(parameterBootstrapRow);

        //Col 1: Label
        const parameterCol1 = document.createElement("div");
        parameterCol1.classList.add("col-2");
        parameterBootstrapRow.append(parameterCol1);
        const parameterLabel = document.createElement("label");
        parameterLabel.for = "form-"+formParameter.name;
        parameterLabel.id = "label-"+formParameter.name;
        parameterLabel.classList.add("col-form-label", "form-param");
        parameterLabel.innerHTML = formParameter.name;
        parameterCol1.append(parameterLabel);

        //Col 2: Input
        const parameterCol2 = document.createElement("div");
        parameterCol2.classList.add("col-5");
        parameterBootstrapRow.append(parameterCol2);
        const parameterInput = document.createElement("input");
        parameterInput.classList.add("form-control", "param-name");
        parameterInput.id = "form-"+formParameter.name;
        parameterInput.type = "text";
        parameterInput.placeholder = "Parameterlabel";
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

    addParameter(event) {


        alert("add - ToDo: Hinzufügen von Parameter in Datenstruktur und Datenbank" + this);

        const listItem = this.createParameterListitemUI();

        const buttonClicked = event.target || event.srcElement;
        const paramListElement = buttonClicked.closest("li");

        paramListElement.after(listItem);

    }
    deleteParameter(event) {
        const buttonClicked = event.target || event.srcElement;
        const paramListElement = buttonClicked.closest("li");

        alert("delete - ToDo: Löschen von Parameter aus Datenstruktur und Datenbank" + paramListElement);
        paramListElement.remove();

    }
    moveParameterUp(event) {
        alert("up - ToDo: Reihenfolge in Datenstruktur und Datenbank ändern");

        const buttonClicked = event.target || event.srcElement;
        const paramListElement = buttonClicked.closest("li");

        if (paramListElement.previousElementSibling) {
            paramListElement.parentNode.insertBefore(paramListElement, paramListElement.previousElementSibling);
        }
    }
    moveParameterDown(event) {
        alert("down - ToDo: Reihenfolge in Datenstruktur und Datenbank ändern");

        const buttonClicked = event.target || event.srcElement;
        const paramListElement = buttonClicked.closest("li");

        if (paramListElement.nextElementSibling) {
            paramListElement.parentNode.insertBefore(paramListElement.nextElementSibling, paramListElement);
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

    setFormularData(formularData){
        const formTitleElement = document.getElementById("form-title");
        formTitleElement.value = formularData.title;

    }

}

class FormularData {

    constructor(id,title, query, queryHTML){
        this.title = title;
        this.id = id;
        this.parameters = [];
        this.query = query;
        this.queryHTML=queryHTML;
    }

    addParameter(parameter){
        this.parameters.add(parameter);
        console.log(this.parameters);
    }

    deleteParameter(parameter){
        this.parameters.remove(parameter);
        console.log(this.parameters);
    }

    swapParameterPosition(parameter, newPosition){

        const paramToSwapWith = this.parameters.find(param => param.position == newPosition);
        if(paramToSwapWith!=undefined){
            paramToSwapWith.position = parameter.position;
        }
        parameter.position=newPosition;
    }

    findNextParameterName(){
        const paramNumbers = [];
        this.parameters.forEach(param => {
            const paramNameNumber = parseInt(param.name.replace("param",""));
            if(!isNaN(paramNameNumber)){
                paramNumbers.add(paramNameNumber);
            }
        });

        if(paramNumbers.length == 0){
            return "param01";
        }
        return "param"+pad(Math.max.apply(Math, paramNumbers)+1);

    }

    pad(n) {
        return (n < 10) ? ("0" + n) : n;
    }

}

class ParameterData {
    constructor(name, label, position){
        this.name = name;
        this.position=position;
        this.label=label;
    }
}

/*
<div class="row">
                                <div class="col-12">
                                    <input id="form-title" class="form-control" type="text" placeholder="Formular Titel"
                                        aria-label="default input example">
                                </div>
                                <ul class="form-params">
                                    <li>
                                        <div class="row">
                                            <div class="col-2">
                                                <label for="form-param-name01" id="form-param01"
                                                    class="col-form-label form-param">param01</label>
                                            </div>
                                            <div class="col-5">
                                                <input class="form-control param-name" id="form-param-name01"
                                                    type="text" placeholder="Parameterlabel"
                                                    aria-label="default input example">
                                            </div>

                                            <div class="col-auto">
                                                <div class="btn-group mb-3">
                                                    <button type="button" class="btn btn-outline-secondary blue">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-circle" viewBox="0 0 16 16">
                                                            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z"/>
                                                          </svg>
                                                        <span class="visually-hidden">Button</span>
                                                    </button>
                                            
                                            
                                                    <button type="button" class="btn btn-outline-secondary blue">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-down-circle" viewBox="0 0 16 16">
                                                            <path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/>
                                                          </svg>
                                                        <span class="visually-hidden">Button</span>
                                                    </button>
                                                </div>
                                            
                                            </div>

                                            <div class="col-auto">
                                                <div class="btn-group mb-3">
                                                    <button type="button" class="btn btn-outline-secondary green">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle"
                                                            viewBox="0 0 16 16">
                                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
                                                            <path
                                                                d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z">
                                                            </path>
                                                        </svg>
                                                        <span class="visually-hidden">Button</span>
                                                    </button>
                                            
                                            
                                                    <button type="button" class="btn btn-outline-secondary red">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle"
                                                            viewBox="0 0 16 16">
                                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"></path>
                                                            <path
                                                                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z">
                                                            </path>
                                                        </svg>
                                                        <span class="visually-hidden">Button</span>
                                                    </button>
                                                </div>
                                            
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            */