/* Peterborough Pickleball Installation - main.js
   Small, dependency-free. Handles: mobile nav, sticky shadow, form validation,
   gallery filtering, footer year, FAQ deep-links. */
(function () {
  "use strict";

  /* ---------------------------------------------------- mobile navigation */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && window.innerWidth < 1080) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------- sticky header shadow */
  var head = document.getElementById("siteHead");
  if (head) {
    var ticking = false;
    var onScroll = function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          head.classList.toggle("is-stuck", window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------- footer year */
  var yr = document.getElementById("yr");
  if (yr) { yr.textContent = String(new Date().getFullYear()); }

  /* ---------------------------------------------------- form validation */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var DIGITS_RE = /\d/g;

  function fieldOf(el) { return el.closest(".field"); }

  function showError(el, show) {
    var wrap = fieldOf(el);
    var msg = document.getElementById(el.id + "-err");
    if (wrap) { wrap.classList.toggle("has-err", show); }
    if (msg) { msg.hidden = !show; }
    el.setAttribute("aria-invalid", show ? "true" : "false");
  }

  function validate(el) {
    var v = (el.value || "").trim();
    var ok = true;
    if (el.hasAttribute("required") && v === "") { ok = false; }
    if (ok && el.type === "email" && v !== "") { ok = EMAIL_RE.test(v); }
    if (ok && el.type === "tel" && v !== "") {
      ok = (v.match(DIGITS_RE) || []).length >= 10;
    }
    showError(el, !ok);
    return ok;
  }

  Array.prototype.forEach.call(document.querySelectorAll(".qform"), function (form) {
    var controls = form.querySelectorAll("input[required], select[required], textarea[required], input[type=email], input[type=tel]");

    Array.prototype.forEach.call(controls, function (el) {
      el.addEventListener("blur", function () { validate(el); });
      el.addEventListener("input", function () {
        if (fieldOf(el) && fieldOf(el).classList.contains("has-err")) { validate(el); }
      });
    });

    form.addEventListener("submit", function (e) {
      var firstBad = null;
      Array.prototype.forEach.call(controls, function (el) {
        if (!validate(el) && !firstBad) { firstBad = el; }
      });

      if (firstBad) {
        e.preventDefault();
        firstBad.focus();
        firstBad.scrollIntoView({ block: "center", behavior: "smooth" });
        return;
      }

      // If the form action has not been configured yet, keep the visitor on the
      // page and show a clear message instead of navigating to a broken endpoint.
      if (form.getAttribute("action").indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        var ok = form.querySelector(".qform__ok");
        if (ok) {
          ok.hidden = false;
          ok.textContent = "Form endpoint is not connected yet. Add your form handler URL to the form action, then this message will confirm real submissions.";
          ok.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }
    });
  });

  /* ---------------------------------------------------- gallery filter */
  var gfilter = document.querySelector(".gfilter");
  if (gfilter) {
    var items = document.querySelectorAll(".gitem");
    var count = document.getElementById("galleryCount");

    gfilter.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) { return; }
      var cat = btn.getAttribute("data-filter");

      Array.prototype.forEach.call(gfilter.querySelectorAll("button"), function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });

      var shown = 0;
      Array.prototype.forEach.call(items, function (it) {
        var match = cat === "all" || it.getAttribute("data-cat") === cat;
        it.hidden = !match;
        if (match) { shown++; }
      });

      if (count) {
        count.textContent = "Showing " + shown + " project photo" + (shown === 1 ? "" : "s") + ".";
      }
    });
  }

  /* ---------------------------------------------------- open FAQ from hash */
  function openFromHash() {
    if (!window.location.hash) { return; }
    var target = document.querySelector(window.location.hash);
    if (target && target.tagName === "DETAILS") { target.open = true; }
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
