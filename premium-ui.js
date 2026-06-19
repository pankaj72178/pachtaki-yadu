/* ============================================================
   premium-ui.js — futuristic SaaS motion layer (no deps)
   Adds: cursor parallax on aurora blobs, cursor-follow 3D tilt
   on glass cards, and magnetic + glow hover on buttons.
   Purely visual — never touches app data or behaviour.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Pointer-fine = mouse/trackpad; skip heavy motion on touch.
  var finePointer =
    window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  if (reduceMotion || !finePointer) return;

  /* ---------- 1. Aurora parallax ---------- */
  var wraps = Array.prototype.slice.call(document.querySelectorAll(".blob-wrap"));
  var targetX = 0, targetY = 0, curX = 0, curY = 0;

  window.addEventListener(
    "mousemove",
    function (e) {
      targetX = e.clientX / window.innerWidth - 0.5;
      targetY = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true }
  );

  function loop() {
    // ease toward the cursor for a smooth, spring-like drift
    curX += (targetX - curX) * 0.06;
    curY += (targetY - curY) * 0.06;
    for (var i = 0; i < wraps.length; i++) {
      var depth = parseFloat(wraps[i].getAttribute("data-depth")) || 20;
      wraps[i].style.transform =
        "translate3d(" + curX * depth + "px," + curY * depth + "px,0)";
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- 2. Cursor-follow 3D tilt on glass cards ---------- */
  var MAX_TILT = 7; // degrees

  function isTiltable(el) {
    // every glass card except the sticky top bar / header
    return (
      el.classList.contains("glass") &&
      el.tagName !== "NAV" &&
      el.tagName !== "HEADER" &&
      !el.closest("nav") &&
      !el.closest("header")
    );
  }

  function attachTilt(card) {
    if (card.__tilt) return;
    card.__tilt = true;

    card.addEventListener("mousemove", function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        "perspective(1100px) rotateY(" +
        px * MAX_TILT +
        "deg) rotateX(" +
        -py * MAX_TILT +
        "deg) translateY(-6px) scale(1.012)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  }

  function scanTilt(root) {
    var nodes = (root || document).querySelectorAll(".glass");
    for (var i = 0; i < nodes.length; i++) {
      if (isTiltable(nodes[i])) attachTilt(nodes[i]);
    }
  }
  scanTilt(document);

  /* ---------- 3. Magnetic buttons ---------- */
  function attachMagnet(btn) {
    if (btn.__magnet) return;
    btn.__magnet = true;

    btn.addEventListener("mousemove", function (e) {
      var r = btn.getBoundingClientRect();
      var mx = e.clientX - r.left - r.width / 2;
      var my = e.clientY - r.top - r.height / 2;
      btn.style.transform =
        "translate(" + mx * 0.18 + "px," + my * 0.32 + "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
    });
  }

  function scanMagnets(root) {
    var nodes = (root || document).querySelectorAll("button, .btn");
    for (var i = 0; i < nodes.length; i++) {
      // skip tiny icon-only controls inside cards from feeling jumpy? keep all CTAs
      attachMagnet(nodes[i]);
    }
  }
  scanMagnets(document);

  /* ---------- 4. Re-scan when content.js injects cards/buttons ---------- */
  var pending = false;
  var mo = new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      scanTilt(document);
      scanMagnets(document);
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
