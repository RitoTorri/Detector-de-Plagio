(function () {
    'use strict';

    const MAX_LEN = 1000;
    const API_URL = '/compare';

    const el = {
        string1: document.getElementById('string1'),
        string2: document.getElementById('string2'),
        count1: document.getElementById('count1'),
        count2: document.getElementById('count2'),
        btnCompare: document.getElementById('btn-compare'),
        btnClear: document.getElementById('btn-clear'),
        formError: document.getElementById('form-error'),
        resultSection: document.getElementById('result-section'),
        percentValue: document.getElementById('percent-value'),
        barFill: document.getElementById('bar-fill'),
        barGlow: document.getElementById('bar-glow'),
        barWrap: document.getElementById('similarity-bar-wrap'),
        resultHint: document.getElementById('result-hint'),
        btnLabel: document.querySelector('#btn-compare .btn-label'),
        btnSpinner: document.querySelector('#btn-compare .btn-spinner'),
    };

    function updateCharCount(textarea, counterEl) {
        const n = textarea.value.length;
        counterEl.textContent = `${n} / ${MAX_LEN}`;
    }

    function hideError() {
        el.formError.hidden = true;
        el.formError.textContent = '';
    }

    function showError(message) {
        el.formError.textContent = message;
        el.formError.hidden = false;
        // Si hay error, hacer scroll al mensaje de error
        if (el.formError) {
            el.formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function setLoading(loading) {
        el.btnCompare.disabled = loading;
        el.btnSpinner.hidden = !loading;
        if (el.btnLabel) el.btnLabel.style.opacity = loading ? '0.85' : '';
    }

    function clampPercent(n) {
        if (Number.isNaN(n)) return 0;
        return Math.min(100, Math.max(0, n));
    }

    function hintForPercent(p) {
        if (p < 25) return 'Los textos son bastante distintos.';
        if (p < 50) return 'Hay cierta coincidencia entre ambos textos.';
        if (p < 75) return 'La similitud es notable; revisa citas y parafraseo.';
        return 'Similitud muy alta: revisa originalidad y atribución.';
    }

    // Función para hacer scroll suave a la sección de resultados
    function scrollToResult() {
        if (el.resultSection && !el.resultSection.hidden) {
            el.resultSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });

            // Añadir un efecto de resaltado temporal
            el.resultSection.style.transition = 'box-shadow 0.3s ease';
            el.resultSection.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.5), 0 0 0 6px rgba(56, 189, 248, 0.2)';
            setTimeout(() => {
                el.resultSection.style.boxShadow = '';
            }, 1000);
        }
    }

    function showResult(percentStr) {
        const parsed = parseFloat(String(percentStr));
        const p = clampPercent(parsed);

        // Mostrar la sección de resultados
        el.resultSection.hidden = false;

        // Actualizar los valores
        el.percentValue.textContent = Number.isFinite(parsed) ? parsed.toFixed(2) : '0';
        el.barFill.style.width = `${p}%`;
        el.barGlow.style.width = `${p}%`;
        el.barWrap.setAttribute('aria-valuenow', String(Math.round(p)));
        el.resultHint.textContent = hintForPercent(p);

        // Hacer scroll a la sección de resultados
        scrollToResult();

        // Añadir clase de animación al porcentaje
        if (el.percentValue) {
            el.percentValue.style.animation = 'none';
            el.percentValue.offsetHeight; // Forzar reflow
            el.percentValue.style.animation = 'countUp 0.8s ease-out';
        }

        // Animar la barra de progreso
        if (el.barFill) {
            el.barFill.style.transition = 'width 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)';
        }
    }

    function validateClient() {
        const a = el.string1.value;
        const b = el.string2.value;
        if (!a.trim() || !b.trim()) {
            showError('Ambos textos son obligatorios y no pueden estar vacíos.');
            return false;
        }
        if (a.length > MAX_LEN || b.length > MAX_LEN) {
            showError(`Cada texto admite como máximo ${MAX_LEN} caracteres.`);
            return false;
        }
        hideError();
        return true;
    }

    async function compare() {
        if (!validateClient()) return;

        setLoading(true);
        hideError();

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    string1: el.string1.value,
                    string2: el.string2.value,
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || payload.success === false) {
                const msg =
                    payload.message ||
                    (response.status === 429
                        ? 'Demasiadas peticiones. Espera unos minutos e inténtalo de nuevo.'
                        : 'No se pudo completar la comparación.');
                showError(msg);
                return;
            }

            if (payload.data === undefined || payload.data === null) {
                showError('Respuesta inesperada del servidor.');
                return;
            }

            showResult(String(payload.data));
        } catch (err) {
            showError('Error de red. Comprueba tu conexión e inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    }

    function clearAll() {
        el.string1.value = '';
        el.string2.value = '';
        updateCharCount(el.string1, el.count1);
        updateCharCount(el.string2, el.count2);
        hideError();
        el.resultSection.hidden = true;
        el.percentValue.textContent = '0';
        el.barFill.style.width = '0%';
        el.barGlow.style.width = '0%';
        el.barWrap.setAttribute('aria-valuenow', '0');
        el.resultHint.textContent = '';

        // Opcional: hacer scroll al inicio después de limpiar
        window.scrollTo({ behavior: 'smooth', top: 0 });
    }

    document.addEventListener('DOMContentLoaded', function () {
        updateCharCount(el.string1, el.count1);
        updateCharCount(el.string2, el.count2);

        el.string1.addEventListener('input', function () {
            updateCharCount(el.string1, el.count1);
        });
        el.string2.addEventListener('input', function () {
            updateCharCount(el.string2, el.count2);
        });

        el.btnCompare.addEventListener('click', compare);
        el.btnClear.addEventListener('click', clearAll);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                compare();
            }
        });

        // Asegurar que la sección de resultados esté oculta al inicio
        if (el.resultSection) {
            el.resultSection.hidden = true;
        }
    });
})();