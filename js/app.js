document.addEventListener('DOMContentLoaded', function () {
    // turn on materialize stuff (menus, modals, selects, collapsibles)
    M.AutoInit();

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

    // submit form
    var form = document.getElementById('report-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            M.toast({ html: 'Your report was posted anonymously' });
            form.reset();
        });
    }

    // save draft button
    var draft = document.getElementById('save-draft');
    if (draft) {
        draft.addEventListener('click', function () {
            M.toast({ html: 'Draft saved' });
        });
    }

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