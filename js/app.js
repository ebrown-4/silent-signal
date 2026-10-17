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

            var flagged = screenContent([document.getElementById('comment').value]);
            if (flagged && flagged.level === 'block') {
                showBlockModal();
                return;
            }
            if (flagged && flagged.level === 'warn') {
                M.toast({ html: 'Please keep comments respectful - describe the situation, not the people' });
            }

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

// ================= Content safety screening =================

// Slurs and hate speech are blocked outright.
var BLOCKED_WORDS = [
    'nigger', 'nigga', 'faggot', 'fag', 'tranny', 'chink', 'spic', 'wetback',
    'kike', 'gook', 'towelhead', 'raghead', 'paki', 'shitskin', 'coon',
    'cracker', 'honky', 'honkey', 'beaner', 'porchmonkey', 'junglebunny',
    'retard', 'retarded', 'bitch', 'slut', 'whore', 'cunt'
];

// Mild name-calling gets a warning, but the post is allowed through.
var WARNING_WORDS = [
    'idiot', 'stupid', 'dumb', 'moron', 'loser', 'pathetic', 'fool',
    'clown', 'coward', 'liar', 'trash', 'garbage', 'scum'
];

// Split text into lowercase words so "Stupid!" and "stupid" both match,
// without flagging words that merely contain the same letters.
function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function checkList(text, list) {
    var tokens = tokenize(text);
    for (var i = 0; i < tokens.length; i++) {
        // check the word and its simple singular form ("idiots" -> "idiot")
        var token = tokens[i];
        var singular = token.replace(/s$/, '');
        if (list.indexOf(token) !== -1 || list.indexOf(singular) !== -1) {
            return token;
        }
    }
    return null;
}

// Returns { level: 'block' | 'warn', word } or null if the text is fine.
function screenContent(texts) {
    var joined = texts.join(' ');
    var blocked = checkList(joined, BLOCKED_WORDS);
    if (blocked) {
        return { level: 'block', word: blocked };
    }
    var warned = checkList(joined, WARNING_WORDS);
    if (warned) {
        return { level: 'warn', word: warned };
    }
    return null;
}

// A modal explaining why a post was blocked. Created once by JS
// so every page gets it without duplicate HTML.
function showBlockModal() {
    var existing = document.getElementById('block-modal');
    if (existing) {
        M.Modal.getInstance(existing).open();
        return;
    }
    var modal = document.createElement('div');
    modal.id = 'block-modal';
    modal.className = 'modal';
    modal.innerHTML =
        '<div class="modal-content">' +
        '<h5><i class="material-icons" style="vertical-align:middle;color:#5b63b7">block</i> This post can\'t be submitted</h5>' +
        '<p>It contains slurs or hate speech, which our community guidelines don\'t allow.</p>' +
        '<p>Please rewrite your post to describe the situation without attacking or demeaning people. ' +
        'You can read what\'s allowed on the <a href="about.html">Guidelines</a> page.</p>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<a href="#!" class="modal-close btn-flat">Close</a>' +
        '<a href="about.html" class="modal-close btn">View Guidelines</a>' +
        '</div>';
    document.body.appendChild(modal);
    M.Modal.init(modal).open();
}

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

        // safety screening: slurs are blocked, name-calling gets a warning
        var flagged = screenContent([
            document.getElementById('title').value,
            document.getElementById('story').value,
            document.getElementById('display-name').value
        ]);
        if (flagged && flagged.level === 'block') {
            showBlockModal();
            return;
        }
        if (flagged && flagged.level === 'warn') {
            M.toast({ html: 'Please keep posts respectful - describe the situation, not the people' });
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
