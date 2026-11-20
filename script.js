/* ===================== below: the engine, no need to edit ===================== */
const $ = (s, r = document) => r.querySelector(s);
const root = document.documentElement;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const preview = location.search.includes("preview");
let P = PROFILE;
if (preview) { try { P = JSON.parse(localStorage.getItem("roselyn-preview")) || PROFILE; } catch (e) {} $(".curtain").remove(); }
const waNum = (() => { let d = P.whatsapp.replace(/\D/g, ""); return d[0] === "0" ? "63" + d.slice(1) : d; })();
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// hero
$("#hello").textContent = P.hello;
const h1 = $("#name"); h1.setAttribute("aria-label", P.name);
h1.innerHTML = P.name.split(" ").map((w, i) =>
  `<span class="w" aria-hidden="true">${[...w].map((c, j) => `<span class="c" style="animation-delay:${.55 + (i * 4 + j) * .035}s">${esc(c)}</span>`).join("")}</span>`).join("");
$("#tagline").textContent = P.tagline;
$("#ctaWa").href = "https://wa.me/" + waNum;
$("#ctaMail").href = "mailto:" + P.email;
$("#portrait").innerHTML = P.photo ? `<img src="${esc(P.photo)}" alt="">` : P.name.split(" ").filter(w => /^[A-Za-z]/.test(w)).map(w => w[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join("");
if (P.photo) $(".logo").innerHTML = `<img src="${esc(P.photo)}" alt="Home">`;

// content
$("#summary").textContent = P.summary;
$("#facts").innerHTML = [
  ["fa-location-dot", P.location], ["fa-briefcase", "15+ years of experience"], ["fa-globe", "Remote and BPO ready"]
].map(f => `<li><i class="fa-solid ${f[0]}"></i><span>${esc(f[1])}</span></li>`).join("");
$("#skillGrid").innerHTML = P.skills.map(s => `<div class="skill rv"><i class="fa-solid ${s[0]}"></i><b>${esc(s[1])}</b></div>`).join("");
$("#timeline").innerHTML = P.experience.map(e => `<li class="tl rv"><h3>${esc(e.role)}</h3><p class="when">${esc(e.when)}</p>${e.company ? `<p class="co">${esc(e.company)}</p>` : ""}</li>`).join("");
$("#companies").innerHTML = P.companies.map(c => `<li>${esc(c)}</li>`).join("");
$("#eduList").innerHTML = P.education.map(e => `<div class="card rv"><i class="fa-solid fa-graduation-cap" style="color:var(--atext);margin-bottom:12px;display:block"></i><h3>${esc(e.title)}</h3><p class="when">${esc(e.when)}</p>${e.note ? `<p>${esc(e.note)}</p>` : ""}</div>`).join("");
$("#refList").innerHTML = P.references.map(r => `<div class="card rv"><h3>${esc(r.name)}</h3><p class="when">${esc(r.title)}</p><p><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></p></div>`).join("");
$("#contactText").textContent = P.contactText;
$("#contactList").innerHTML =
  `<li><a href="https://wa.me/${waNum}"><i class="fa-brands fa-whatsapp"></i>${esc(P.whatsapp)}</a></li>` +
  `<li><a href="mailto:${esc(P.email)}"><i class="fa-solid fa-envelope"></i>${esc(P.email)}</a></li>` +
  `<li><span><i class="fa-solid fa-location-dot"></i>${esc(P.location)}</span></li>`;
$("#foot").textContent = "© " + new Date().getFullYear() + " " + P.name;
document.title = P.name + " – " + P.roles[0];

// rotating role line (soft blur crossfade)
let ri = 0; const role = $("#role"); role.textContent = P.roles[0];
if (!reduce) setInterval(() => {
  role.classList.add("out");
  setTimeout(() => { ri = (ri + 1) % P.roles.length; role.textContent = P.roles[ri]; role.classList.remove("out"); }, 520);
}, 2600);

// reveal on scroll, one at a time with a tiny stagger
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { const sib = [...e.target.parentNode.children].indexOf(e.target); e.target.style.transitionDelay = Math.min(sib, 6) * 70 + "ms"; e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0, rootMargin: "0px 0px -4% 0px" });
document.querySelectorAll(".rv").forEach(el => io.observe(el));
// safety net: never leave content hidden
const showAll = () => document.querySelectorAll(".rv:not(.in)").forEach(el => el.classList.add("in"));
setTimeout(showAll, 2500);
addEventListener("hashchange", () => setTimeout(showAll, 700));

// nav: shadow line, active link, timeline progress, mobile menu
const nav = $(".nav"), links = [...document.querySelectorAll("#nav a")], tl = $("#timeline");
function onScroll() {
  nav.classList.toggle("scrolled", scrollY > 10);
  let cur = ""; links.forEach(a => { const s = $(a.getAttribute("href")); if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = a.getAttribute("href"); });
  links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === cur));
  const items = [...tl.children];
  if (items.length) {
    const cy = li => li.offsetTop + 12;
    tl.style.setProperty("--end", (cy(items[items.length - 1]) - 12) + "px");
    let last = -1; items.forEach((li, i) => { const hit = li.getBoundingClientRect().top < innerHeight * .6; li.classList.toggle("done", hit); if (hit) last = i; });
    tl.style.setProperty("--prog", (last < 0 ? 0 : cy(items[last]) - 12) + "px");
  }
}
addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); addEventListener("load", onScroll); onScroll();
$("#menu").onclick = () => $("#nav").classList.toggle("open");
links.forEach(a => a.addEventListener("click", () => $("#nav").classList.remove("open")));

// color + theme with a circular wash transition
const KEY = "roselyn-site";
let saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
function paint(c) {
  root.style.setProperty("--accent", c);
  const n = parseInt(c.slice(1), 16), L = ((n >> 16) * .299 + (n >> 8 & 255) * .587 + (n & 255) * .114) / 255;
  root.style.setProperty("--on", L > .62 ? "#111" : "#fff");
}
function wash(fn, x, y) {
  if (!document.startViewTransition || reduce) return fn();
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(fn).ready.then(() => root.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
    { duration: 1100, easing: "cubic-bezier(.65,0,.15,1)", pseudoElement: "::view-transition-new(root)" })).catch(() => {});
}
const store = () => { if (preview) return; try { localStorage.setItem(KEY, JSON.stringify({ t: root.dataset.theme || "", d: P.theme || "" })); } catch (e) {} };
const th = (!preview && saved.t && saved.d === (P.theme || "")) ? saved.t : P.theme; if (th) root.dataset.theme = th;
paint(P.accent || getComputedStyle(root).getPropertyValue("--accent").trim() || "#0f766e");
$("#theme").addEventListener("click", e => {
  const b = e.currentTarget.getBoundingClientRect(), dark = root.dataset.theme === "dark";
  wash(() => { root.dataset.theme = dark ? "light" : "dark"; store(); }, b.left + b.width / 2, b.top + b.height / 2);
});

// share: QR code + copy link
const dlg = $("#share");
$("#shareBtn").onclick = () => {
  $("#qr").innerHTML = "";
  if (window.QRCode) new QRCode($("#qr"), { text: location.href, width: 200, height: 200, colorDark: "#000", colorLight: "#fff" });
  else $("#qr").textContent = "QR code needs an internet connection.";
  dlg.showModal();
};
$("#close").onclick = () => dlg.close();
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
$("#copy").onclick = async () => {
  try { await navigator.clipboard.writeText(location.href); $("#copy").innerHTML = '<i class="fa-solid fa-check"></i> Copied'; } catch (e) { $("#copy").textContent = "Copy from the address bar"; }
};

// photo lightbox: click the portrait to see it big (grows out of the picture)
if (P.photo) {
  const por = $("#portrait"), lb = $("#lightbox"), frame = $("#lbFrame");
  $("#lbImg").src = P.photo;
  por.classList.add("zoomable"); por.removeAttribute("aria-hidden");
  por.setAttribute("role", "button"); por.setAttribute("tabindex", "0"); por.setAttribute("aria-label", "View larger photo");
  const from = () => {
    const a = por.getBoundingClientRect(), b = frame.getBoundingClientRect();
    return { dx: a.left + a.width / 2 - (b.left + b.width / 2), dy: a.top + a.height / 2 - (b.top + b.height / 2), s: a.width / b.width, v: (b.height - b.width) / 2, r: b.width / 2 };
  };
  const frames = f => [
    { transform: `translate(${f.dx}px,${f.dy}px) scale(${f.s})`, clipPath: `inset(${f.v}px 0 ${f.v}px 0 round ${f.r}px)` },
    { transform: "none", clipPath: "inset(0px 0 0px 0 round 28px)" }
  ];
  const dur = reduce ? 0 : 650;
  let busy = false;
  function openLb() {
    if (busy || lb.classList.contains("open")) return; busy = true;
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); root.style.overflow = "hidden";
    const f = from(); por.style.visibility = "hidden";
    frame.animate(frames(f), { duration: dur, easing: "cubic-bezier(.2,.8,.1,1)" }).finished.then(() => busy = false, () => busy = false);
    $("#lbClose").focus({ preventScroll: true });
  }
  function closeLb() {
    if (busy || !lb.classList.contains("open")) return; busy = true;
    const f = from();
    lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
    frame.animate(frames(f).reverse(), { duration: dur * .8, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" }).finished.then(() => {
      por.style.visibility = ""; root.style.overflow = ""; busy = false; por.focus({ preventScroll: true });
      frame.getAnimations().forEach(a => a.cancel());
    }, () => { por.style.visibility = ""; root.style.overflow = ""; busy = false; });
  }
  por.addEventListener("click", openLb);
  por.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); } });
  $("#lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });
}