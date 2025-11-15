/**
 * Step 1: Basic Settings - Chatbot Name and Special Instructions
 */

// Utility functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function saveChatbotData(chatbotId, chatbotName, specialInstructions) {
    sessionStorage.setItem('chatbotId', chatbotId);
    sessionStorage.setItem('chatbotName', chatbotName);
    sessionStorage.setItem('specialInstructions', specialInstructions || '');
}

// Initialize Step 1
function initStep1() {
    const form = document.getElementById('step1-form');
    if (!form) return;

    clearAllErrors();

    // Handle file upload
    const fileInput = document.getElementById('file-input');
    const fileUploadArea = document.getElementById('file-upload-area');
    const fileList = document.getElementById('file-list');
    const nextBtn = document.getElementById('next-btn');

    let selectedFiles = [];

    // Click to browse files
    fileUploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop handlers
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    // Handle selected files
    function handleFiles(files) {
        clearError('file-error');

        const filesArray = Array.from(files);

        if (selectedFiles.length + filesArray.length > 10) {
            showError('file-error', 'Maximum 10 files allowed per chatbot');
            return;
        }

        const allowedExtensions = ['.pdf', '.txt', '.docx'];
        const maxSize = 50 * 1024 * 1024; // 50MB

        for (const file of filesArray) {
            const fileName = file.name.toLowerCase();
            const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

            if (!hasValidExtension) {
                showError('file-error', `Invalid file type: ${file.name}. Supported formats: PDF, TXT, DOCX`);
                continue;
            }

            if (file.size > maxSize) {
                showError('file-error', `File too large: ${file.name}. Maximum size is 50MB`);
                continue;
            }

            selectedFiles.push(file);
        }

        updateFileList();

        if (selectedFiles.length > 0) {
            nextBtn.disabled = false;
        }
    }

    // Update file list display
    function updateFileList() {
        fileList.innerHTML = '';

        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">📄 ${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
                <button type="button" class="btn-remove" data-index="${index}">✕</button>
            `;
            fileList.appendChild(fileItem);
        });

        fileList.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                selectedFiles.splice(index, 1);
                updateFileList();

                if (selectedFiles.length === 0) {
                    nextBtn.disabled = true;
                }
            });
        });
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearAllErrors();

        const name = document.getElementById('chatbot-name').value.trim();
        const specialInstructions = document.getElementById('special-instructions').value.trim();

        let hasError = false;

        if (!name) {
            showError('name-error', 'Chatbot name is required');
            hasError = true;
        }

        if (selectedFiles.length === 0) {
            showError('file-error', 'Please select at least one file');
            hasError = true;
        }

        if (hasError) return;

        nextBtn.disabled = true;
        const originalText = nextBtn.textContent;
        nextBtn.textContent = 'Processing...';

        try {
            // Step 1: Generate system prompt
            const promptResponse = await fetch('/api/generate-system-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    special_instructions: specialInstructions
                })
            });

            const promptData = await promptResponse.json();

            if (!promptResponse.ok) {
                showError('instructions-error', promptData.error?.message || 'Failed to generate system prompt');
                nextBtn.disabled = false;
                nextBtn.textContent = originalText;
                return;
            }

            const systemPrompt = promptData.system_prompt;

            // Step 2: Create chatbot
            const chatbotResponse = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    system_prompt: systemPrompt
                })
            });

            const chatbotData = await chatbotResponse.json();

            if (!chatbotResponse.ok) {
                showError('name-error', chatbotData.error?.message || 'Failed to create chatbot');
                nextBtn.disabled = false;
                nextBtn.textContent = originalText;
                return;
            }

            const chatbotId = chatbotData.id;

            // Step 3: Upload files
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            const progressContainer = document.getElementById('upload-progress');
            const progressFill = document.getElementById('progress-fill');
            const progressText = document.getElementById('progress-text');
            progressContainer.style.display = 'block';

            const uploadResponse = await fetch(`/api/chatbot/${chatbotId}/documents`, {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                showError('file-error', uploadData.error?.message || 'Failed to upload files');
                progressContainer.style.display = 'none';
                nextBtn.disabled = false;
                nextBtn.textContent = originalText;
                return;
            }

            progressFill.style.width = '100%';
            progressText.textContent = 'Upload complete! Processing documents...';

            setTimeout(() => {
                progressContainer.style.display = 'none';
                const processingStatus = document.getElementById('processing-status');
                processingStatus.style.display = 'block';

                pollProcessingStatus(chatbotId, name, specialInstructions);
            }, 1000);

        } catch (error) {
            console.error('Error:', error);
            showError('file-error', 'Network error. Please check your connection and try again.');
            nextBtn.disabled = false;
            nextBtn.textContent = originalText;
        }
    });

    // Poll processing status
    async function pollProcessingStatus(chatbotId, name, specialInstructions) {
        const maxAttempts = 60;
        let attempts = 0;

        const pollInterval = setInterval(async () => {
            attempts++;

            try {
                const response = await fetch(`/api/chatbot/${chatbotId}/status`);
                const data = await response.json();

                if (!response.ok) {
                    clearInterval(pollInterval);
                    showError('file-error', 'Failed to check processing status');
                    document.getElementById('processing-status').style.display = 'none';
                    return;
                }

                if (data.chatbot_status === 'ready') {
                    clearInterval(pollInterval);
                    document.getElementById('processing-status').style.display = 'none';

                    // Save data and navigate to step 2
                    saveChatbotData(chatbotId, name, specialInstructions);
                    window.location.href = '/create/step/2';
                } else if (data.chatbot_status === 'error') {
                    clearInterval(pollInterval);
                    showError('file-error', 'Error processing documents. Please try again.');
                    document.getElementById('processing-status').style.display = 'none';
                }

                if (attempts >= maxAttempts) {
                    clearInterval(pollInterval);
                    showError('file-error', 'Processing is taking longer than expected. Please check back later.');
                    document.getElementById('processing-status').style.display = 'none';
                }

            } catch (error) {
                console.error('Error polling status:', error);
                clearInterval(pollInterval);
                showError('file-error', 'Failed to check processing status');
                document.getElementById('processing-status').style.display = 'none';
            }
        }, 5000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/create/step/1') || window.location.pathname === '/create') {
        initStep1();
    }
});
