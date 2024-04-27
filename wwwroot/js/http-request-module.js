class AjaxHttpRequest {
    payload = {};

    constructor(payload) {
        this.payload = payload;
    }

    async execute() {
        return await $.ajax(this.payload);
    }

    async executeWithExtraParams(params) {
        const newPayload = {
            ...this.payload,
            data: {
                ...this.payload.data,
                ...params,
            },
        };

        return await $.ajax(newPayload);
    }
}