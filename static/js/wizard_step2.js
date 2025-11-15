/**
 * Step 2: Playground - Model Selection, System Prompt Editing, and Testing
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

function getChatbotData() {
    const chatbotId = sessionStorage.getItem('chatbotId');
    const chatbotName = sessionStorage.getItem('chatbotName');
    const specialInstructions = sessionStorage.getItem('specialInstructions');
    return { chatbotId, chatbotName, specialInstructions };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize Step 2
function initStep2() {
    const { chatbotId, chatbotName } = getChatbotData();

    // Redirect to step 1 if no chatbot ID
    if (!chatbotId) {
        window.location.href = '/create';
        return;
    }

    // Display chatbot name
    const nameDisplay = document.getElementById('chatbot-name-display');
    if (nameDisplay && chatbotName) {
        nameDisplay.textContent = chatbotName;
    }

    // Load chatbot details
    loadChatbotDetails(chatbotId);

    // Setup event listeners
    setupConfigSave(chatbotId);
    setupChatInterface(chatbotId);
    setupNavigation();
}

// Load chatbot details and populate form
async function loadChatbotDetails(chatbotId) {
    try {
        const response = await fetch(`/api/chatbot/${chatbotId}`);
        const data = await response.json();

        if (response.ok && data.chatbot) {
            const chatbot = data.chatbot;

            // Populate system prompt
            const systemPromptEdit = document.getElementById('system-prompt-edit');
            if (systemPromptEdit) {
                systemPromptEdit.value = chatbot.system_prompt || '';
            }

            // Set model selection
            const modelSelect = document.getElementById('model-select');
            if (modelSelect && chatbot.model) {
                modelSelect.value = chatbot.model;
            }
        }

        // Load document count
        const statusResponse = await fetch(`/api/chatbot/${chatbotId}/status`);
        const statusData = await statusResponse.json();

        if (statusResponse.ok) {
            const docCountDisplay = document.getElementById('document-count');
            if (docCountDisplay) {
                docCountDisplay.textContent = statusData.total_documents || 0;
            }
        }

    } catch (error) {
        console.error('Error loading chatbot details:', error);
    }
}

// Setup config save functionality
function setupConfigSave(chatbotId) {
    const saveBtn = document.getElementById('save-config-btn');
    const systemPromptEdit = document.getElementById('system-prompt-edit');
    const modelSelect = document.getElementById('model-select');

    if (!saveBtn) return;

    saveBtn.addEventListener('click', async () => {
        clearError('prompt-edit-error');

        const systemPrompt = systemPromptEdit.value.trim();
        const model = modelSelect.value;

        if (!systemPrompt) {
            showError('prompt-edit-error', 'System prompt cannot be empty');
            return;
        }

        saveBtn.disabled = true;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';

        try {
            const response = await fetch(`/api/chatbot/${chatbotId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    system_prompt: systemPrompt,
                    model: model
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showError('prompt-edit-error', data.error?.message || 'Failed to save changes');
            } else {
                saveBtn.textContent = 'Saved ✓';
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                }, 2000);
            }

        } catch (error) {
            console.error('Error saving config:', error);
            showError('prompt-edit-error', 'Network error. Please try again.');
        } finally {
            saveBtn.disabled = false;
        }
    });
}

// Setup chat interface
function setupChatInterface(chatbotId) {
    const testQueryForm = document.getElementById('test-query-form');
    const chatMessages = document.getElementById('test-chat-messages');
    const queryInput = document.getElementById('test-query-input');
    const sendBtn = document.getElementById('send-btn');

    let chatHistory = [];

    testQueryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const question = queryInput.value.trim();
        if (!question) return;

        queryInput.disabled = true;
        sendBtn.disabled = true;

        addMessage('user', question);
        queryInput.value = '';

        const loadingId = addLoadingMessage();

        try {
            const response = await fetch(`/api/chatbot/${chatbotId}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: question,
                    chat_history: chatHistory
                })
            });

            const data = await response.json();

            removeLoadingMessage(loadingId);

            if (!response.ok) {
                const errorMessage = data.error?.message || 'Failed to get response';
                addMessage('error', errorMessage);
            } else {
                addMessage('assistant', data.response);

                chatHistory.push({ role: 'user', content: question });
                chatHistory.push({ role: 'assistant', content: data.response });
            }

        } catch (error) {
            console.error('Error querying chatbot:', error);
            removeLoadingMessage(loadingId);
            addMessage('error', 'Network error. Please check your connection and try again.');
        } finally {
            queryInput.disabled = false;
            sendBtn.disabled = false;
            queryInput.focus();
        }
    });

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}-message`;

        if (role === 'user') {
            messageDiv.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
        } else if (role === 'assistant') {
            messageDiv.innerHTML = `<div class="message-content">${escapeHtml(content)}</div>`;
        } else if (role === 'error') {
            messageDiv.innerHTML = `<div class="message-content error">⚠️ ${escapeHtml(content)}</div>`;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLoadingMessage() {
        const loadingId = 'loading-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message assistant-message';
        messageDiv.id = loadingId;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="loading-dots">Thinking<span>.</span><span>.</span><span>.</span></span>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingId;
    }

    function removeLoadingMessage(loadingId) {
        const loadingMsg = document.getElementById(loadingId);
        if (loadingMsg) {
            loadingMsg.remove();
        }
    }

    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            testQueryForm.dispatchEvent(new Event('submit'));
        }
    });
}

// Setup navigation buttons
function setupNavigation() {
    const backBtn = document.getElementById('back-btn');
    const deployBtn = document.getElementById('deploy-btn');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/create';
        });
    }

    if (deployBtn) {
        deployBtn.addEventListener('click', () => {
            window.location.href = '/create/step/3';
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('/create/step/2')) {
        initStep2();
    }
});
