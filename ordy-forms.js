// ── Scale buttons (1–5) ──────────────────────────────────────
document.querySelectorAll('.scale-wrap').forEach(wrap => {
  const input = wrap.querySelector('input[type="hidden"]');
  wrap.querySelectorAll('.scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      wrap.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (input) input.value = btn.dataset.val;
    });
  });
});

// ── Progress bar ─────────────────────────────────────────────
function updateProgress() {
  const form = document.getElementById('ordy-form');
  if (!form) return;
  const required = form.querySelectorAll('[required]');
  let filled = 0;
  required.forEach(el => {
    if (el.type === 'radio' || el.type === 'checkbox') {
      const name = el.name;
      if (form.querySelector(`[name="${name}"]:checked`)) filled++;
    } else if (el.value && el.value.trim()) {
      filled++;
    }
  });
  // deduplicate radio groups
  const radioGroups = new Set();
  let radioCount = 0;
  required.forEach(el => {
    if (el.type === 'radio') {
      if (!radioGroups.has(el.name)) { radioGroups.add(el.name); radioCount++; }
    }
  });
  const nonRadioRequired = [...required].filter(el => el.type !== 'radio').length;
  const total = nonRadioRequired + radioGroups.size;
  let nonRadioFilled = 0;
  [...required].filter(el => el.type !== 'radio').forEach(el => {
    if (el.value && el.value.trim()) nonRadioFilled++;
  });
  let radioFilled = 0;
  radioGroups.forEach(name => {
    if (form.querySelector(`[name="${name}"]:checked`)) radioFilled++;
  });
  const pct = total > 0 ? Math.round(((nonRadioFilled + radioFilled) / total) * 100) : 0;
  const fill = document.querySelector('.progress-fill');
  const label = document.querySelector('.progress-label');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = pct + '% completado';
}
document.getElementById('ordy-form')?.addEventListener('input', updateProgress);
document.getElementById('ordy-form')?.addEventListener('change', updateProgress);
updateProgress();

// ── Form submit ───────────────────────────────────────────────
const form = document.getElementById('ordy-form');
const successBlock = document.querySelector('.form-success');
const errorGlobal = document.querySelector('.form-error-global');
const submitBtn = form?.querySelector('.btn-submit');

if (form) {
  // hide success on load
  if (successBlock) successBlock.style.display = 'none';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorGlobal) errorGlobal.textContent = '';
    document.querySelectorAll('[data-fs-error]').forEach(el => el.textContent = '');

    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    // collect scale hidden inputs
    document.querySelectorAll('.scale-wrap').forEach(wrap => {
      const input = wrap.querySelector('input[type="hidden"]');
      if (input && !input.value) input.value = '(sin respuesta)';
    });

    try {
      const res = await fetch(form.dataset.endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();

      if (res.ok) {
        form.style.display = 'none';
        if (errorGlobal) errorGlobal.style.display = 'none';
        document.querySelectorAll('.form-intro, .progress-wrap').forEach(el => el.style.display = 'none');
        if (successBlock) { successBlock.style.display = 'block'; successBlock.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      } else {
        if (data.errors) {
          data.errors.forEach(err => {
            const el = document.querySelector(`[data-fs-error="${err.field}"]`);
            if (el) el.textContent = err.message;
          });
        }
        if (errorGlobal) { errorGlobal.textContent = 'Revisá los campos marcados e intentá de nuevo.'; errorGlobal.style.display = 'block'; }
        submitBtn.textContent = submitBtn.dataset.label || 'Enviar respuestas';
        submitBtn.disabled = false;
      }
    } catch {
      if (errorGlobal) { errorGlobal.textContent = 'Hubo un problema de conexión. Intentá de nuevo o escribinos a ordenyplan@gmail.com'; errorGlobal.style.display = 'block'; }
      submitBtn.textContent = submitBtn.dataset.label || 'Enviar respuestas';
      submitBtn.disabled = false;
    }
  });
}
