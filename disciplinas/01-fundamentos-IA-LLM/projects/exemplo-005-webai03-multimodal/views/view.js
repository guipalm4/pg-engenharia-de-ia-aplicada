export class View {
    constructor() {
        this.elements = {
            temperature: document.getElementById('temperature'),
            temperatureValue: document.getElementById('temp-value'),
            topKValue: document.getElementById('topk-value'),
            topK: document.getElementById('topK'),
            form: document.getElementById('question-form'),
            questionInput: document.getElementById('question'),
            output: document.getElementById('output'),
            button: document.getElementById('ask-button'),
            year: document.getElementById('year'),
            fileInput: document.getElementById('file-input'),
            filePreview: document.getElementById('file-preview'),
            fileUploadBtn: document.getElementById('file-upload-btn'),
            fileSelectedName: document.getElementById('file-selected-name'),
        };
    }

    setYear() {
        this.elements.year.textContent = new Date().getFullYear();
    }

    initializeParameters(params) {
        this.elements.topK.max = params.maxTopK;
        this.elements.topK.min = 1;
        this.elements.topK.value = params.defaultTopK;
        this.elements.topKValue.textContent = params.defaultTopK;

        this.elements.temperatureValue.textContent = params.defaultTemperature;
        this.elements.temperature.max = params.maxTemperature;
        this.elements.temperature.min = 0;
        this.elements.temperature.value = params.defaultTemperature;
    }

    updateTemperatureDisplay(value) {
        this.elements.temperatureValue.textContent = value;
    }

    updateTopKDisplay(value) {
        this.elements.topKValue.textContent = value;
    }

    getQuestionText() {
        return this.elements.questionInput.value;
    }

    getTemperature() {
        return parseFloat(this.elements.temperature.value);
    }

    getTopK() {
        return parseInt(this.elements.topK.value);
    }

    getFile() {
        return this.elements.fileInput.files[0];
    }

    setOutput(text) {
        this.elements.output.textContent = text;
    }

    appendOutput(text) {
        this.elements.output.textContent += text;
    }

    showError(errors) {
        this.elements.output.innerHTML = errors.join('<br/>');
        this.elements.button.disabled = true;
    }

    setButtonToStopMode() {
        this.elements.button.textContent = 'Parar';
        this.elements.button.classList.add('stop-button');
    }

    setButtonToSendMode() {
        this.elements.button.textContent = 'Enviar';
        this.elements.button.classList.remove('stop-button');
    }

    handleFilePreview(event) {
        const file = event.target.files[0];
        this.elements.filePreview.innerHTML = '';
        this.elements.fileSelectedName.textContent = '';

        if (!file) return;

        // Show selected file name
        this.elements.fileSelectedName.textContent = `✓ ${file.name}`;
        this.elements.fileSelectedName.classList.add('selected');

        const fileType = file.type.split('/')[0];
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';

        if (fileType === 'image') {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.className = 'preview-image';
            fileInfo.appendChild(img);
        } else if (fileType === 'audio') {
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(file);
            audio.controls = true;
            audio.className = 'preview-audio';
            fileInfo.appendChild(audio);
        }

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-file-btn';
        removeBtn.textContent = '× Remover arquivo';
        removeBtn.onclick = () => {
            this.elements.fileInput.value = '';
            this.elements.filePreview.innerHTML = '';
            this.elements.fileSelectedName.textContent = '';
            this.elements.fileSelectedName.classList.remove('selected');
        };
        fileInfo.appendChild(removeBtn);

        this.elements.filePreview.appendChild(fileInfo);
    }

    triggerFileInput() {
        this.elements.fileInput.click();
    }

    onTemperatureChange(callback) {
        this.elements.temperature.addEventListener('input', callback);
    }

    onTopKChange(callback) {
        this.elements.topK.addEventListener('input', callback);
    }

    onFileChange(callback) {
        this.elements.fileInput.addEventListener('change', callback);
    }

    onFileButtonClick(callback) {
        this.elements.fileUploadBtn.addEventListener('click', callback);
    }

    onFormSubmit(callback) {
        this.elements.form.addEventListener('submit', callback);
    }
}
