export class FormController {
    constructor(aiService, translationService, view) {
        this.aiService = aiService;
        this.translationService = translationService;
        this.view = view;
        this.isGenerating = false;
    }

    setupEventListeners() {
        // Update display values for range inputs
        this.view.onTemperatureChange((e) => {
            this.view.updateTemperatureDisplay(e.target.value);
        });

        this.view.onTopKChange((e) => {
            this.view.updateTopKDisplay(e.target.value);
        });

        // File input handlers
        this.view.onFileChange((event) => {
            this.view.handleFilePreview(event);
        });

        this.view.onFileButtonClick(() => {
            this.view.triggerFileInput();
        });

        // Form submit handler
        this.view.onFormSubmit(async (event) => {
            event.preventDefault();

            if (this.isGenerating) {
                this.stopGeneration();
                return;
            }

            await this.handleSubmit();
        });
    }

    async handleSubmit() {
        const question = this.view.getQuestionText();

        if (!question.trim()) {
            return;
        }

        // Get parameters from form
        const temperature = this.view.getTemperature();
        const topK = this.view.getTopK();
        const file = this.view.getFile();

        console.log('Using parameters:', { temperature, topK });

        // Change button to stop mode
        this.toggleButton(true);

        this.view.setOutput('Processing your question...');

        try {
            const aiResponseChunks = await this.aiService.createSession(
                question,
                temperature,
                topK,
                file
            );

            this.view.setOutput('');

            let fullResponse = '';
            for await (const chunk of aiResponseChunks) {
                if (this.aiService.isAborted()) {
                    break;
                }
                console.log('Received chunk:', chunk);
                fullResponse += chunk;
                this.view.setOutput(fullResponse);
            }

            // Translate the full response to Portuguese
            if (fullResponse && !this.aiService.isAborted()) {
                this.view.setOutput('Traduzindo resposta...');
                const translatedResponse = await this.translationService.translateToPortuguese(fullResponse);
                this.view.setOutput(translatedResponse);
            }
        } catch (error) {
            console.error('Error during AI generation:', error);
            this.view.setOutput(`Erro: ${error.message}`);
        }

        this.toggleButton(false);
    }

    stopGeneration() {
        this.aiService.abort();
        this.toggleButton(false);
    }

    toggleButton(isGenerating) {
        this.isGenerating = isGenerating;

        if (isGenerating) {
            this.view.setButtonToStopMode();
        } else {
            this.view.setButtonToSendMode();
        }
    }
}
