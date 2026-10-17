document.addEventListener('DOMContentLoaded', function () {
    // turn on materialize stuff (menus, modals, selects, collapsibles)
    M.AutoInit();

    // online/offline status pill (every page)
    initNetworkStatus();

    // draft saving + offline submit queue (submit page)
    initReportForm();

    // boost buttons
    var boosts = document.querySelectorAll('.boost');
    boosts.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var num = parseInt(btn.textContent.replace(/\D/g, '')) + 1;
            btn.textContent = 'Boost (' + num + ')';
            M.toast({ html: 'Post boosted!' });
        });
    });

    // category chips
    var chips = document.querySelectorAll('.chip');
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            chips.forEach(function (c) { c.classList.remove('active'); });
            chip.classList.add('active');
            M.toast({ html: 'Showing: ' + chip.textContent });
        });
    });

    // comment form
    var commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function (e) {
            e.preventDefault();
            M.toast({ html: 'Comment posted anonymously' });
            commentForm.reset();
        });
    }

    // flag button in the report popup
    var flag = document.getElementById('send-flag');
    if (flag) {
        flag.addEventListener('click', function () {
            M.toast({ html: 'Thanks, a moderator will review this' });
        });
    }
});

// ================= Online / offline status =================

// Small pill fixed to the bottom-left corner that always shows
// whether the app currently has a connection.
function initNetworkStatus() {
    var pill = document.createElement('div');
    pill.className = 'net-status';
    pill.setAttribute('aria-live', 'polite');
    document.body.appendChild(pill);

    function update() {
        var online = navigator.onLine;
        pill.classList.toggle('offline', !online);
        pill.innerHTML = online
            ? '<i class="material-icons">wifi</i>Online'
            : '<i class="material-icons">wifi_off</i>Offline';
    }

    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
}

// ================= Drafts & offline submit queue =================

var DRAFT_KEY = 'silent-signal-draft';
var OUTBOX_KEY = 'silent-signal-outbox';

// localStorage helpers with error handling
function readJson(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        console.warn('[Silent Signal] Could not read saved data:', error);
        return null;
    }
}

function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn('[Silent Signal] Could not save data:', error);
        return false;
    }
}

// Materialize wraps selects, so setting a value needs a re-init
// for the visible dropdown to match.
function setSelectValue(el, value) {
    if (!el) return;
    if (el.M_FormSelect) {
        el.M_FormSelect.destroy();
    }
    el.value = value;
    M.FormSelect.init(el);
}

function resetReportForm(form) {
    form.reset();
    M.updateTextFields();
    setSelectValue(document.getElementById('category'), '');
    setSelectValue(document.getElementById('state'), 'Prefer not to say');
    updateNameField();
}

// Save whatever is currently typed into the report form.
// An empty form clears the draft instead of saving it.
function saveDraft() {
    var title = document.getElementById('title');
    var story = document.getElementById('story');
    if (!title || !story) return null;

    var draft = {
        title: title.value,
        category: document.getElementById('category').value,
        state: document.getElementById('state').value,
        city: document.getElementById('city').value,
        story: story.value,
        postAs: isNamed() ? 'named' : 'anonymous',
        displayName: document.getElementById('display-name').value,
        savedAt: new Date().toISOString()
    };

    if (!draft.title.trim() && !draft.story.trim()) {
        clearDraft();
        return draft;
    }

    writeJson(DRAFT_KEY, draft);
    return draft;
}

function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
        console.warn('[Silent Signal] Could not clear draft:', error);
    }
}

// Show or hide the display-name field based on the chosen option.
function updateNameField() {
    var nameField = document.getElementById('name-field');
    if (!nameField) return;
    nameField.style.display = isNamed() ? '' : 'none';
}

// Is the "Show my name" option selected?
function isNamed() {
    var named = document.getElementById('post-named');
    return !!(named && named.checked);
}

function initReportForm() {
    var form = document.getElementById('report-form');
    if (!form) return;

    var saveButton = document.getElementById('save-draft');
    var anonRadio = document.getElementById('post-anon');
    var namedRadio = document.getElementById('post-named');

    if (anonRadio) {
        anonRadio.addEventListener('change', updateNameField);
    }
    if (namedRadio) {
        namedRadio.addEventListener('change', updateNameField);
    }

    // restore a previously saved draft
    var draft = readJson(DRAFT_KEY);
    if (draft && (draft.title || draft.story)) {
        document.getElementById('title').value = draft.title || '';
        document.getElementById('city').value = draft.city || '';
        document.getElementById('story').value = draft.story || '';
        document.getElementById('display-name').value = draft.displayName || '';
        if (draft.postAs === 'named' && namedRadio) {
            namedRadio.checked = true;
        }
        setSelectValue(document.getElementById('category'), draft.category || '');
        setSelectValue(document.getElementById('state'), draft.state || 'Prefer not to say');
        updateNameField();
        M.updateTextFields();
        M.toast({ html: 'Draft restored' });
    }

    // auto-save as the user types
    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);

    // explicit save draft button
    if (saveButton) {
        saveButton.addEventListener('click', function () {
            saveDraft();
            M.toast({ html: 'Draft saved on this device' });
        });
    }

    // submit: post when online, queue when offline
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // if "Show my name" is picked, a name is needed
        if (isNamed() && !document.getElementById('display-name').value.trim()) {
            M.toast({ html: 'Add a name or choose to post anonymously' });
            return;
        }

        var postedAs = isNamed() ? document.getElementById('display-name').value.trim() : 'anonymous';

        if (navigator.onLine) {
            clearDraft();
            if (isNamed()) {
                M.toast({ html: 'Your report was posted as ' + postedAs });
            } else {
                M.toast({ html: 'Your report was posted anonymously' });
            }
            resetReportForm(form);
        } else {
            var draft = saveDraft();
            var outbox = readJson(OUTBOX_KEY) || [];
            outbox.push({
                title: draft.title,
                category: draft.category,
                story: draft.story,
                postAs: postedAs,
                queuedAt: new Date().toISOString()
            });
            writeJson(OUTBOX_KEY, outbox);
            clearDraft();
            M.toast({ html: 'You are offline - your report is saved and will post when you are back online' });
            resetReportForm(form);
        }
    });
}

// When the connection comes back, send anything that was
// queued while offline.
window.addEventListener('online', function () {
    var outbox = readJson(OUTBOX_KEY);
    if (outbox && outbox.length > 0) {
        try {
            localStorage.removeItem(OUTBOX_KEY);
            var noun = outbox.length === 1 ? 'report was' : outbox.length + ' reports were';
            M.toast({ html: 'Back online - your saved ' + noun + ' posted anonymously' });
        } catch (error) {
            console.warn('[Silent Signal] Could not clear the outbox:', error);
        }
    } else {
        M.toast({ html: 'You are back online!' });
    }
});

// ---- Service Worker registration ----
// Register sw.js so the app shell can be cached for offline use.
async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.log('[Silent Signal] Service workers are not supported in this browser.');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('[Silent Signal] Service worker registered. Scope:', registration.scope);

        registration.addEventListener('updatefound', () => {
            console.log('[Silent Signal] A new service worker is installing...');
        });

        if (registration.active) {
            console.log('[Silent Signal] Service worker is active and controlling this page.');
        }
    } catch (error) {
        console.error('[Silent Signal] Service worker registration failed:', error);
    }
}

// Wait until the page has fully loaded before registering,
// so the first visit isn't slowed down.
window.addEventListener('load', registerServiceWorker);
