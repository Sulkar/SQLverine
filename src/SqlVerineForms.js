export class SqlVerineForms {

    constructor() {

        this.formsEditor = document.querySelector('#forms-editor');
        this.formsExecution = document.querySelector('#forms-execution');

    }

    createUI() {

        this.createTitleUI();
        this.createParameterListUI();
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
        this.formsEditor.append(formularTitel);
    }

    createParameterListUI() {
        //erstellt Forms Parameter Liste
        const formularParameterListe = document.createElement("ul");        
        this.formsEditor.append(formularParameterListe);
        this.createParameterListitemUI(formularParameterListe)
    }

    createParameterListitemUI(formularParameterListe) {
        const parameterListitem = document.createElement("li");
        formularParameterListe.append(parameterListitem);
        const parameterBootstrapRow = document.createElement("div");
        parameterBootstrapRow.classList.add("row");
        parameterListitem.append(parameterBootstrapRow);

        //Col 1: Label
        const parameterCol1 = document.createElement("div");
        parameterCol1.classList.add("col-2");
        parameterBootstrapRow.append(parameterCol1);
        const parameterLabel = document.createElement("label");
        parameterLabel.for = "form-param-name01";
        parameterLabel.id = "form-param01";
        parameterLabel.classList.add("col-form-label", "form-param");
        parameterLabel.innerHTML = "param01";
        parameterCol1.append(parameterLabel);

        //Col 2: Input
        const parameterCol2 = document.createElement("div");
        parameterCol2.classList.add("col-5");
        parameterBootstrapRow.append(parameterCol2);
        const parameterInput = document.createElement("input");
        parameterInput.classList.add("form-control", "param-name");
        parameterInput.id = "form-param-name01";
        parameterInput.type = "text";
        parameterInput.placeholder = "Parameterlabel";
        parameterCol2.append(parameterInput);
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