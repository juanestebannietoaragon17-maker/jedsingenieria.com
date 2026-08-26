const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const menuToggle = $('.menu-toggle');
const navLinks = $('.nav-links');
menuToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});
$$('.nav-links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

$('#year').textContent = new Date().getFullYear();

const progress = $('#progressBar');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.matches('.metric')) animateMetric(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, {threshold: .15});
$$('.reveal').forEach(el => observer.observe(el));

function animateMetric(card) {
  const el = card.querySelector('[data-count]');
  if (!el || el.dataset.done) return;
  el.dataset.done = '1';
  const target = Number(el.dataset.count);
  let start = 0;
  const duration = 850;
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min((now - t0) / duration, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

$$('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    setTimeout(() => {
      const value = link.dataset.service;
      const hidden = $('#servicio');
      if (hidden) hidden.value = value;
      currentStep = 1;
      showStep();
      const first = document.querySelector('.choice[data-value="' + CSS.escape(value) + '"]');
      if (first) first.classList.add('selected');
    });
  });
});

// Project lightbox
const modal = $('#projectModal');
const modalImage = $('#modalImage');
const modalTitle = $('#modalTitle');
$$('.project-card').forEach(card => card.addEventListener('click', () => {
  modalImage.src = card.dataset.image;
  modalImage.alt = card.dataset.title;
  modalTitle.textContent = card.dataset.title;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}));
$$('[data-close="1"]').forEach(el => el.addEventListener('click', () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('open'); });

// Advanced quote wizard
let currentStep = 1;
const totalSteps = 4;
let formData = {servicio:'', tipo:'', zona:'', detalle:'', nombre:'', telefono:''};

function showStep() {
  $$('.form-step').forEach(step => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  $('#formProgress').style.width = `${currentStep / totalSteps * 100}%`;
  $('#prevStep').style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  $('#nextStep').textContent = currentStep === totalSteps ? 'Enviar por WhatsApp →' : 'Continuar →';
  if (currentStep === totalSteps) {
    $('#summary').innerHTML = `<strong>Resumen:</strong><br>Servicio: ${escapeHtml(formData.servicio)}<br>Tipo: ${escapeHtml(formData.tipo)}<br>Zona: ${escapeHtml(formData.zona)}`;
  }
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

$$('.choice').forEach(choice => {
  choice.addEventListener('click', () => {
    const step = Number(choice.closest('.form-step').dataset.step);
    choice.closest('.choice-grid').querySelectorAll('.choice').forEach(x => x.classList.remove('selected'));
    choice.classList.add('selected');
    if (step === 1) { formData.servicio = choice.dataset.value; $('#servicio').value = choice.dataset.value; }
    if (step === 2) { formData.tipo = choice.dataset.value; $('#tipo').value = choice.dataset.value; }
    setTimeout(() => { if (currentStep < totalSteps) { currentStep++; showStep(); } }, 180);
  });
});

$('#nextStep').addEventListener('click', () => {
  if (currentStep === 1 && !formData.servicio) return alert('Selecciona el servicio que necesitas.');
  if (currentStep === 2 && !formData.tipo) return alert('Selecciona el tipo de cliente.');
  if (currentStep === 3) {
    formData.zona = $('#zona').value.trim();
    formData.detalle = $('#detalle').value.trim();
    if (!formData.zona || !formData.detalle) return alert('Completa la zona y cuéntanos brevemente qué necesitas.');
  }
  if (currentStep === 4) {
    formData.nombre = $('#nombre').value.trim();
    formData.telefono = $('#telefono').value.trim();
    if (!formData.nombre || !formData.telefono) return alert('Completa tu nombre y WhatsApp.');
    const message = `Hola JEDS Ingeniería 👋%0A%0AQuiero solicitar una cotización.%0A%0A*Servicio:* ${encodeURIComponent(formData.servicio)}%0A*Tipo:* ${encodeURIComponent(formData.tipo)}%0A*Zona:* ${encodeURIComponent(formData.zona)}%0A*Necesidad:* ${encodeURIComponent(formData.detalle)}%0A*Nombre:* ${encodeURIComponent(formData.nombre)}%0A*WhatsApp:* ${encodeURIComponent(formData.telefono)}%0A%0AGracias.`;
    window.open(`https://wa.me/573113339254?text=${message}`, '_blank', 'noopener');
    return;
  }
  currentStep++;
  showStep();
});
$('#prevStep').addEventListener('click', () => { if (currentStep > 1) { currentStep--; showStep(); }});
showStep();
