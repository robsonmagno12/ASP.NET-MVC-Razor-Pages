//Classe responsável por criar os templates de modal.
class TemplateModalBuilder {
    wrapper = null;
    modal = null;
    template = "";
    constructor(modal) {
        this.modal = modal;
        this.wrapper = document.createElement("div");
    }

    // Função que verifica se o paramêtro actionPrimaryTitle foi passado. Caso não seja o botão não é renderizado em tela
    isRenderButtonPrimary() {
        if (typeof this.modal.actionPrimaryTitle !== "string") return ``;

        return `
      <button class="btn btn--modal 
          ${this.modal.props.id}-primary-action">${this.modal.actionPrimaryTitle}
      </button>
    `;
    }
    createTemplateByInstance() {
        if (this.modal instanceof ModalInputElement) {
            return `
        <div class="modal-template-icon-wrapper">
            <i class="fas ${this.modal.props.iconCode} modal-template-icon"></i>
        </div>
        <h3 class="modal-template-title">${this.modal.props.title}</h3>
        <p class="modal-template-description">${this.modal.props.description}</p>
        ${this.modal.domElement}
        <footer class="modal-template-actions">
            <button class="btn btn--modal 
                ${this.modal.props.id}-primary-action">${this.modal.actionPrimaryTitle}
            </button>
            <button data-fancybox-close class="button-outline
                ${this.modal.props.id}-close-action">${this.modal.secondaryActionTitle}</button>
        </footer>
      `;
        }

        if (this.modal instanceof ModalAction) {
            return `
        <div class="modal-template-icon-wrapper">
            <i class="fas ${this.modal.props.iconCode} modal-template-icon"></i>
        </div>
        <h3 class="modal-template-title">${this.modal.props.title}</h3>
        <p class="modal-template-description">${this.modal.props.description
                }</p>
        <footer class="modal-template-actions">
            ${this.isRenderButtonPrimary()}
            <button data-fancybox-close class="button-outline
              ${this.modal.props.id}-close-action">${this.modal.secondaryActionTitle
                }
            </button>
        </footer>
      `;
        }

        return `
      <div class="modal-template-icon-wrapper">
        <i class="fas ${this.modal.props.iconCode} modal-template-icon"></i>
      </div>
      <h3 class="modal-template-title">${this.modal.props.title}</h3>
      <p class="modal-template-description">${this.modal.props.description}</p>
    `;
    }

    build() {
        const template = `
      <div class="modal-template template-default" style="display:none" id="${this.modal.props.id
            }">
        <div id="content-block">
          ${this.createTemplateByInstance()}
        </div>
            <div class="loader-wrapper">
              <div class="loading-more">
                <i class="fas fa-sync-alt fa-spin"></i> Aguarde...
              </div>
            </div>
      </div>
    `;

        this.wrapper.innerHTML = template;

        const body = document.getElementsByTagName("body")[0];
        body.appendChild(this.wrapper);
    }
}

// Super Classe Modal. Ela será base para todas as outras.
class Modal {
    props = {
        id: "",
        title: "",
        description: "",
        iconCode: "",
    };
    // Passamos o fancybox como injeção de depedência. Caso precisemos trocar a lib algum dia por outra ficará mais fácil.
    modalDepedency = $.fancybox;

    constructor(props) {
        // Validação para garantir os inputs de entrada
        if (!props.id || !props.title || !props.description || !props.iconCode) {
            throw new Error("Paramêtros não repassados ao construtor");
        }

        props.id += new Date().getTime();
        this.props = props;
    }

    // Função para garantir vazamento de memória e elementos duplicados. Destroi o elemento na DOM.
    destroy() {
        const id = $(`#${this.props.id}`);
        this.modalDepedency.close(id);
        $(id).remove();
    }

    // Abre o elemento criado na tela
    open() {
        if (!document.getElementById(this.props.id)) {
            const template = new TemplateModalBuilder(this);
            template.build();
            this.modalDepedency.open($(`#${this.props.id}`));
        }
    }

    // Fecha o modal atual da tela
    close(callback) {
        $(`.${this.props.id}-close-action`).on("click", () => {
            this.modalDepedency.close($(`#${this.props.id}`));
            callback(this.props.id + ` Ação close`);
            this.destroy();
        });
    }
}

// Classe filha de Modal que recebe mais comportamentos: Ações dentro do Modal.
class ModalAction extends Modal {
    actionPrimaryTitle = null;
    secondaryActionTitle = "Cancelar";
    httpRequest = null;

    constructor(
        props,
        secondaryActionTitle = "Cancelar",
        actionPrimaryTitle = null,
        httpRequest = null
    ) {
        super(props);
        this.actionPrimaryTitle = actionPrimaryTitle;
        this.secondaryActionTitle = secondaryActionTitle;
        this.httpRequest = httpRequest;
    }
    // Caso o botão de ação primária seja chamado esse método devolve um callback para quem ta chamando.
    handlerPrimaryAction(callback) {
        $(`.${this.props.id}-primary-action`).on("click", () => {
            if (this.httpRequest) {
                $("#content-block")[0].style.display = "none";
                $(".loader-wrapper")[0].classList.add("active");

                this.httpRequest.execute().then(
                    (response) => {
                        this.modalDepedency.close($(`#${this.props.id}`));
                        $("#content-block")[0].style.display = "block";
                        $(".loader-wrapper")[0].classList.remove("active");
                        this.close();
                        callback({
                            status: "success",
                            data: response,
                            event: `${this.props.id} Ação de Handler Primary com Request de Successo`,
                        });
                    },
                    (error) => {
                        this.modalDepedency.close($(`#${this.props.id}`));
                        $("#content-block")[0].style.display = "block";
                        $(".loader-wrapper")[0].classList.remove("active");
                        this.close();
                        callback({
                            status: "error",
                            data: error,
                            event: `${this.props.id} Ação de Handler Primary com Request de Erro`,
                        });
                    }
                );
            } else {
                this.modalDepedency.close($(`#${this.props.id}`));
                this.close();
                $("#content-block")[0].style.display = "block";
                $(".loader-wrapper")[0].classList.remove("active");
                callback(this.props.id + ` Ação de Handler Primary`);
            }
        });
    }
}

// Class Filha de ModalAction que recebe um elemento de input para ser tratado.
class ModalInputElement extends ModalAction {
    // Atributos responsáveis por fazer referências ao elemento passado
    domElement = null;
    referElement = null;

    constructor(
        props,
        secondaryActionTitle,
        actionPrimaryTitle,
        domElement,
        httpRequest
    ) {
        super(props, secondaryActionTitle, actionPrimaryTitle, httpRequest);
        this.domElement = domElement;
    }

    isInputValid() {
        this.referElement = $("#input-modal")[0];
        if (this.referElement.value !== "") {
            $(".input-template-hint").hide();
            return true;
        }

        $(".input-template-hint").show();
        return false;
    }

    requestData(callback) {
        $("#content-block")[0].style.display = "none";
        $(".loader-wrapper")[0].classList.add("active");

        this.httpRequest
            .executeWithExtraParams({
                valueInput: this.referElement.value,
            })
            .then(
                (response) => {
                    this.modalDepedency.close($(`#${this.props.id}`));
                    $("#content-block")[0].style.display = "block";
                    $(".loader-wrapper")[0].classList.remove("active");
                    this.close();
                    callback({
                        status: "success",
                        data: response,
                        event: `${this.props.id} Ação de Handler Primary com Request de Successo`,
                    });
                },
                (error) => {
                    this.modalDepedency.close($(`#${this.props.id}`));
                    $("#content-block")[0].style.display = "block";
                    $(".loader-wrapper")[0].classList.remove("active");
                    this.close();
                    callback({
                        status: "error",
                        data: error,
                        event: `${this.props.id} Ação de Handler Primary com Request de Erro`,
                    });
                }
            );
    }

    // Verifica se algum valor foi preenchido na input e faz as devidas validações.
    handlerPrimaryAction(callback) {
        $(`.${this.props.id}-primary-action`).on("click", () => {
            if (this.httpRequest) {
                if (this.isInputValid()) {
                    this.requestData(callback);
                }
            } else {
                if (this.isInputValid()) {
                    this.modalDepedency.close($(`#${this.props.id}`));
                    this.close();
                    $("#content-block")[0].style.display = "block";
                    $(".loader-wrapper")[0].classList.remove("active");
                    callback({
                        action: `${this.props.id} Ação de Handler Primary`,
                        input: {
                            value: this.referElement.value,
                            id: this.referElement.id,
                        },
                    });
                }
            }
        });
    }
}

// Função fábrica de input-template
function inputElementFactory(placeholder, type, required, textHint) {
    const template = `
        <div class="input-template-wrapper">
            <input class="input-template" 
              id="input-modal" 
              type="${type}" 
              placeholder="${placeholder}" 
              required="${required}"/>
            <small style="display: none" class="input-template-hint">${textHint}</small>
        </div>
    `;
    return template;
}

