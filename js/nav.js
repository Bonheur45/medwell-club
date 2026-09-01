// MEDWELL Club: shared behaviour (mobile nav toggle, scroll reveals, Get Involved modal)
// Wrapped in DOMContentLoaded because this script tag is placed before the
// Get Involved modal markup in the page source on every page that uses it —
// without this, document.getElementById('involve-modal') would run before
// that element exists and the modal would never get wired up.
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      // Lock the page underneath while the mobile menu is open. Without this,
      // scrolling the page behind the fixed menu can also collapse the mobile
      // browser's address bar, which grows the real viewport past the 100vh
      // the menu was sized against — leaving a gap at the bottom where page
      // content shows through (the "menu scrolls into the homepage" bug).
      document.body.classList.toggle('nav-locked', open);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-locked');
      });
    });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Get Involved modal: shared across every page that includes it.
  var giModal = document.getElementById('involve-modal');
  if (giModal) {
    var giOpeners = document.querySelectorAll('[data-open-involve]');
    var giClosers = giModal.querySelectorAll('[data-close-involve]');
    var giLastFocused = null;

    var EMAIL = 'mwizerwabonheur45@gmail.com';
    var ROLES = {
      students: {
        eyebrow: 'Students',
        heading: 'Get involved as a student.',
        lede: "Join the medical and health-sciences students building healthier habits together, on campus and beyond.",
        subject: 'Get Involved — Student'
      },
      professionals: {
        eyebrow: 'Professionals',
        heading: 'Get involved as a professional.',
        lede: 'Share your time, mentorship and expertise with the students and colleagues shaping a healthier medical culture.',
        subject: 'Get Involved — Professional'
      },
      supporters: {
        eyebrow: 'Supporters',
        heading: 'Get involved as a supporter.',
        lede: 'Back a healthier culture of medical education as a donor or contributor to MEDWELL Club.',
        subject: 'Get Involved — Supporter'
      },
      general: {
        eyebrow: 'General',
        heading: 'Reach out to MEDWELL Club.',
        lede: "Tell us a little about yourself and how you'd like to be involved, and we'll take it from there.",
        subject: 'Get Involved — MEDWELL Club'
      }
    };

    var stepWays = giModal.querySelector('[data-gi-step="ways"]');
    var stepNext = giModal.querySelector('[data-gi-step="next"]');
    var nextEyebrow = giModal.querySelector('[data-gi-role-eyebrow]');
    var nextHeading = giModal.querySelector('[data-gi-role-heading]');
    var nextLede = giModal.querySelector('[data-gi-role-lede]');
    var nextMailto = giModal.querySelector('[data-gi-mailto]');
    var copyBtn = giModal.querySelector('[data-gi-copy]');
    var copyLabel = giModal.querySelector('[data-gi-copy-label]');
    var panel = giModal.querySelector('.gi-modal-panel');
    var copyResetTimer = null;

    function giShowWays() {
      if (stepNext) stepNext.hidden = true;
      if (stepWays) stepWays.hidden = false;
      if (panel) panel.setAttribute('aria-labelledby', 'gi-modal-title');
    }

    function giShowNext(roleKey) {
      var role = ROLES[roleKey] || ROLES.general;
      if (nextEyebrow) nextEyebrow.textContent = role.eyebrow;
      if (nextHeading) nextHeading.textContent = role.heading;
      if (nextLede) nextLede.textContent = role.lede;
      if (nextMailto) nextMailto.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(role.subject);
      if (copyBtn) copyBtn.classList.remove('is-copied');
      if (copyLabel) copyLabel.textContent = 'Copy our email address';
      if (copyResetTimer) { clearTimeout(copyResetTimer); copyResetTimer = null; }
      if (stepWays) stepWays.hidden = true;
      if (stepNext) stepNext.hidden = false;
      if (panel) panel.setAttribute('aria-labelledby', 'gi-modal-title-next');
      var backBtn = giModal.querySelector('[data-gi-back]');
      if (backBtn) backBtn.focus();
    }

    function giCopyEmail() {
      function done(success) {
        if (!copyBtn) return;
        copyBtn.classList.toggle('is-copied', success);
        if (copyLabel) copyLabel.textContent = success ? 'Copied to clipboard' : 'Copy our email address';
        if (copyResetTimer) clearTimeout(copyResetTimer);
        copyResetTimer = setTimeout(function () {
          copyBtn.classList.remove('is-copied');
          if (copyLabel) copyLabel.textContent = 'Copy our email address';
        }, 2200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(function () { done(true); }, function () { done(false); });
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = EMAIL;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand('copy');
          document.body.removeChild(ta);
          done(ok);
        } catch (err) {
          done(false);
        }
      }
    }

    function giOnKeydown(e) {
      if (e.key === 'Escape') giClose();
    }
    function giOpen(e) {
      var role = e && e.currentTarget ? e.currentTarget.getAttribute('data-role') : null;
      if (e) e.preventDefault();
      giLastFocused = document.activeElement;
      giModal.classList.add('open');
      giModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('gi-locked');
      document.addEventListener('keydown', giOnKeydown);
      if (role && ROLES[role]) {
        giShowNext(role);
      } else {
        giShowWays();
        var closeBtn = giModal.querySelector('.gi-modal-close');
        if (closeBtn) closeBtn.focus();
      }
    }
    function giClose() {
      giModal.classList.remove('open');
      giModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('gi-locked');
      document.removeEventListener('keydown', giOnKeydown);
      if (giLastFocused && giLastFocused.focus) giLastFocused.focus();
      // Reset to the first step after the close transition finishes, so the
      // panel is never mid-flow the next time it opens.
      setTimeout(giShowWays, 260);
    }
    giOpeners.forEach(function (el) { el.addEventListener('click', giOpen); });
    giClosers.forEach(function (el) { el.addEventListener('click', giClose); });
    giModal.querySelectorAll('[data-gi-role]').forEach(function (el) {
      el.addEventListener('click', function () { giShowNext(el.getAttribute('data-gi-role')); });
    });
    var backBtn = giModal.querySelector('[data-gi-back]');
    if (backBtn) backBtn.addEventListener('click', giShowWays);
    if (copyBtn) copyBtn.addEventListener('click', giCopyEmail);
  }
});
