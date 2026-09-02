// ============================================================
//  app.js – SafeChem Check (Offline + AI Vision + OCR fallback)
// ============================================================

// ---------- CONFIG ----------
// Replace "YOUR_ACTUAL_API_KEY_HERE" with your key from Google AI Studio
// If left as placeholder, the app will use Tesseract.js offline OCR instead.
const GEMINI_API_KEY = "YOUR_ACTUAL_API_KEY_HERE"; 

// ---------- DOM refs ----------
const primaryInput = document.getElementById('primaryInput');
const secondaryInput = document.getElementById('secondaryInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const scanBtn = document.getElementById('scanBtn');
const resultCard = document.getElementById('resultCard');
const placeholderDefault = document.getElementById('placeholderDefault');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultContent = document.getElementById('resultContent');

const imageInput1 = document.getElementById('imageInput1');
const imageInput2 = document.getElementById('imageInput2');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');

// ---------- i18n setup ----------
let currentLang = 'vi';
let currentResult = null;

const langBtns = document.querySelectorAll('.lang-btn');
langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLang = btn.dataset.lang;
        translateUI();
        if (currentResult) {
            renderResult(currentResult);
        }
    });
});

function translateUI() {
    const dict = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS.vi;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key] !== undefined) el.textContent = dict[key];
    });
    const primaryPlaceholder = currentLang === 'vi' ? 'VD: Javel, Khí CO, Axit...' : 'e.g., Bleach, CO, Acid...';
    const secondaryPlaceholder = currentLang === 'vi' ? 'VD: Vim, amoniac...' : 'e.g., Vim, ammonia...';
    primaryInput.placeholder = primaryPlaceholder;
    secondaryInput.placeholder = secondaryPlaceholder;
}
translateUI();

// ---------- Image preview ----------
function setupImagePreview(input, previewEl) {
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                previewEl.innerHTML = `<img src="${ev.target.result}" alt="Preview" />`;
                previewEl.classList.remove('empty');
            };
            reader.readAsDataURL(file);
        } else {
            previewEl.innerHTML = '';
            previewEl.classList.add('empty');
        }
    });
}
setupImagePreview(imageInput1, preview1);
setupImagePreview(imageInput2, preview2);

// ---------- Helper functions (normalize, match, etc.) ----------
function normalize(str) {
    if (!str) return '';
    let s = str.toLowerCase().trim();
    const map = {
        'á':'a','à':'a','ả':'a','ã':'a','ạ':'a','ă':'a','ắ':'a','ằ':'a','ẳ':'a','ẵ':'a','ặ':'a',
        'â':'a','ấ':'a','ầ':'a','ẩ':'a','ẫ':'a','ậ':'a','é':'e','è':'e','ẻ':'e','ẽ':'e','ẹ':'e',
        'ê':'e','ế':'e','ề':'e','ể':'e','ễ':'e','ệ':'e','í':'i','ì':'i','ỉ':'i','ĩ':'i','ị':'i',
        'ó':'o','ò':'o','ỏ':'o','õ':'o','ọ':'o','ô':'o','ố':'o','ồ':'o','ổ':'o','ỗ':'o','ộ':'o',
        'ơ':'o','ớ':'o','ờ':'o','ở':'o','ỡ':'o','ợ':'o','ú':'u','ù':'u','ủ':'u','ũ':'u','ụ':'u',
        'ư':'u','ứ':'u','ừ':'u','ử':'u','ữ':'u','ự':'u','ý':'y','ỳ':'y','ỷ':'y','ỹ':'y','ỵ':'y',
        'đ':'d'
    };
    s = s.replace(/[^a-z0-9\s]/g, (ch) => map[ch] || ch);
    return s;
}

function buildKeywordRegex(keyword) {
    const parts = keyword.split(/\s+/).map(p => p.trim()).filter(p => p);
    if (parts.length === 0) return null;
    const escaped = parts.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp('\\b' + escaped.join('\\s+') + '\\b', 'i');
}

function matchesAnyKeyword(input, keywordArray) {
    const normInput = normalize(input);
    for (const kw of keywordArray) {
        const regex = buildKeywordRegex(kw);
        if (regex && regex.test(normInput)) return true;
    }
    return false;
}

function findSingleHazard(input) {
    if (!input) return null;
    const norm = normalize(input);
    for (const single of singleHazards) {
        if (matchesAnyKeyword(norm, single.keywords)) return single;
    }
    return null;
}

function findExactMixed(inputA, inputB) {
    if (!inputA || !inputB) return null;
    const normA = normalize(inputA);
    const normB = normalize(inputB);
    for (const mix of mixedHazards) {
        const aPrimary = matchesAnyKeyword(normA, mix.primaryKeywords);
        const bSecondary = matchesAnyKeyword(normB, mix.secondaryKeywords);
        const aSecondary = matchesAnyKeyword(normA, mix.secondaryKeywords);
        const bPrimary = matchesAnyKeyword(normB, mix.primaryKeywords);
        if ((aPrimary && bSecondary) || (aSecondary && bPrimary)) return mix;
    }
    return null;
}

function detectClass(input) {
    const norm = normalize(input);
    for (const cls of chemicalClasses) {
        if (matchesAnyKeyword(norm, cls.keywords)) return cls.id;
    }
    return null;
}

function applyGenericRule(classA, classB) {
    for (const rule of genericRules) {
        if (rule.condition(classA, classB)) return rule;
    }
    return null;
}

function buildDualResult(single1, single2) {
    const lang = currentLang;
    const i18n1 = single1.i18n[lang] || single1.i18n.vi;
    const i18n2 = single2.i18n[lang] || single2.i18n.vi;
    const severityOrder = { danger: 4, explosion: 3, warning: 2, safe: 1 };
    const sev1 = severityOrder[single1.severity] || 0;
    const sev2 = severityOrder[single2.severity] || 0;
    const overallSeverity = sev1 >= sev2 ? single1.severity : single2.severity;
    return {
        type: 'dual',
        severity: overallSeverity,
        i18n: {
            vi: {
                title: `⚠️ Phân tích 2 chất đồng thời: ${i18n1.title} và ${i18n2.title}`,
                mechanism: `• ${i18n1.mechanism}\n• ${i18n2.mechanism}`,
                description: `• ${i18n1.description}\n• ${i18n2.description}`,
                emergency: `• ${i18n1.emergency}\n• ${i18n2.emergency}`
            },
            en: {
                title: `⚠️ Dual analysis: ${i18n1.title} and ${i18n2.title}`,
                mechanism: `• ${i18n1.mechanism}\n• ${i18n2.mechanism}`,
                description: `• ${i18n1.description}\n• ${i18n2.description}`,
                emergency: `• ${i18n1.emergency}\n• ${i18n2.emergency}`
            }
        }
    };
}

function analyzePair(primary, secondary) {
    if (!primary) return null;
    if (!secondary) {
        const single = findSingleHazard(primary);
        return single ? { type: 'single', hazard: single } : null;
    }
    const exact = findExactMixed(primary, secondary);
    if (exact) return { type: 'mixed', hazard: exact };
    const class1 = detectClass(primary);
    const class2 = detectClass(secondary);
    if (class1 && class2) {
        const rule = applyGenericRule(class1, class2);
        if (rule) return { type: 'generic', hazard: rule };
    }
    const single1 = findSingleHazard(primary);
    const single2 = findSingleHazard(secondary);
    if (single1 && single2) {
        const dual = buildDualResult(single1, single2);
        return { type: 'dual', hazard: dual };
    } else if (single1) {
        return { type: 'single', hazard: single1 };
    } else if (single2) {
        return { type: 'single', hazard: single2 };
    }
    return null;
}

// ---------- Gemini Vision with strict prompt ----------
async function callGeminiVision(image1File, image2File) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const toBase64 = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.readAsDataURL(file);
    });

    const parts = [];
    // Strict system prompt (Vietnamese)
    const promptText = `
Bạn là chuyên gia phân tích an toàn hóa chất mỹ phẩm và gia dụng.
Hãy phân tích hai ảnh nhãn thành phần sản phẩm đã tải lên theo các bước:

Bước 1 (Nhận dạng OCR):
- Trích xuất chính xác các thành phần hoạt chất hiện diện trên Ảnh 1 (ví dụ: Linear Alkylbenzene Sulfonate, Fragrance, Sodium Carbonate cho bột giặt).
- Trích xuất chính xác các thành phần hoạt chất hiện diện trên Ảnh 2 (ví dụ: Hydrochloric Acid 9.5% cho Vim, hoặc Sodium Hypochlorite cho Javel).

Bước 2 (Phân tích nguy cơ hóa học):
- Kiểm tra các phản ứng nguy hại khi trộn thành phần từ Ảnh 1 với thành phần từ Ảnh 2.
- KHÔNG được tạo ra các nguy cơ nổ hoặc H2SO4 nếu không có trên nhãn!
- OMO (chất hoạt động bề mặt/base) + Vim (axit): gây phá vỡ bọt, kích ứng axit, giải phóng hơi nhẹ, KHÔNG phải nổ (NỔ/CHÁY).
- Javel (NaClO) + Vim (HCl): giải phóng khí Clo độc (Cl2) -> Nguy hiểm ĐỎ.

Bước 3 (Xuất JSON):
Trả về phản hồi theo đúng cấu trúc JSON dưới đây, không thêm bất kỳ văn bản nào khác:
{
  "detected_product_1": "Tên sản phẩm 1 & Thành phần chính phát hiện được",
  "detected_product_2": "Tên sản phẩm 2 & Thành phần chính phát hiện được",
  "badge": "NGUY HIỂM / CẢNH BÁO / AN TOÀN",
  "level": "RED / ORANGE / YELLOW / GREEN",
  "reaction_mechanism": "Phương trình / Cơ chế phản ứng thực tế giữa các chất tìm thấy",
  "hazard_description": "Mô tả chính xác mối nguy sức khỏe",
  "emergency": "Biện pháp xử lý sự cố"
}
`;
    parts.push({ text: promptText });

    if (image1File) {
        const base64 = await toBase64(image1File);
        parts.push({
            inline_data: {
                mime_type: image1File.type,
                data: base64
            }
        });
    }
    if (image2File) {
        const base64 = await toBase64(image2File);
        parts.push({
            inline_data: {
                mime_type: image2File.type,
                data: base64
            }
        });
    }

    const payload = {
        contents: [{ parts }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned.');
    }
    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('Empty response from Gemini.');
    }
    const text = candidate.content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response.');
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Map the fields to a format that can be rendered
    // level mapping: RED -> danger, ORANGE -> explosion, YELLOW -> warning, GREEN -> safe
    const severityMap = {
        'RED': 'danger',
        'ORANGE': 'explosion',
        'YELLOW': 'warning',
        'GREEN': 'safe'
    };
    const severity = severityMap[parsed.level] || 'warning';
    // Build a bilingual object (vi and en) – we only have Vietnamese, so use same for both
    const viContent = {
        title: `${parsed.detected_product_1 || ''} + ${parsed.detected_product_2 || ''}`.trim() || parsed.badge || 'Không xác định',
        mechanism: parsed.reaction_mechanism || '',
        description: parsed.hazard_description || '',
        emergency: parsed.emergency || ''
    };
    // If title is empty, use badge
    const title = viContent.title || parsed.badge || 'Phân tích nhãn';
    viContent.title = title;

    const aiResult = {
        severity: severity,
        i18n: {
            vi: viContent,
            en: viContent // fallback to Vietnamese for English
        }
    };
    return aiResult;
}

// ---------- Offline OCR with Tesseract.js ----------
async function performOCR(file) {
    if (!window.Tesseract) {
        throw new Error('Tesseract.js library not loaded.');
    }
    const result = await Tesseract.recognize(
        file,
        'vie+eng',
        { logger: m => console.log(m) }
    );
    return result.data.text;
}

async function handleOfflineScan(image1File, image2File) {
    const text1 = await performOCR(image1File);
    const text2 = image2File ? await performOCR(image2File) : '';
    const combined = text1 + ' ' + text2;
    const result = analyzePair(combined, text2);
    if (result) {
        renderResult(result);
    } else {
        showError('Không nhận diện được chất từ ảnh.', true);
    }
}

// ---------- Main scan handler ----------
async function handleScanAnalyze() {
    const file1 = imageInput1.files[0];
    const file2 = imageInput2.files[0];
    if (!file1) {
        handleTextAnalyze();
        return;
    }

    setLoading(true);
    try {
        const isKeyValid = GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_ACTUAL_API_KEY_HERE';
        if (isKeyValid) {
            const aiResult = await callGeminiVision(file1, file2);
            renderResult({ hazard: aiResult }); // wrap to fit renderResult
        } else {
            await handleOfflineScan(file1, file2);
        }
    } catch (error) {
        console.error('Scan error:', error);
        // Fallback to OCR if Gemini fails
        try {
            await handleOfflineScan(file1, file2);
        } catch (ocrError) {
            showError('Lỗi OCR: ' + ocrError.message);
        }
    } finally {
        setLoading(false);
    }
}

// ---------- Text-based analyze ----------
function handleTextAnalyze() {
    const primary = primaryInput.value.trim();
    const secondary = secondaryInput.value.trim();
    if (!primary) {
        showPlaceholder();
        return;
    }
    const result = analyzePair(primary, secondary);
    if (result) {
        renderResult(result);
    } else {
        if (hasRiskKeywords(primary) || (secondary && hasRiskKeywords(secondary))) {
            showFallbackWarning();
        } else {
            showError(null, true);
        }
    }
}

// ---------- Render result (handles both offline and AI) ----------
function renderResult(result) {
    let hazardObj = result.hazard || result;
    let severity = hazardObj.severity || 'warning';
    let i18nData;

    if (result.type === 'dual') {
        i18nData = hazardObj.i18n[currentLang] || hazardObj.i18n.vi;
        severity = hazardObj.severity;
    } else if (result.type === 'mixed' || result.type === 'single' || result.type === 'generic') {
        const i18n = hazardObj.i18n[currentLang] || hazardObj.i18n.vi;
        i18nData = {
            title: i18n.title,
            mechanism: i18n.mechanism || i18n.equation || i18n.mechanism,
            description: i18n.description,
            emergency: i18n.emergency
        };
        severity = hazardObj.severity;
    } else {
        // AI result (has i18n directly)
        const langData = hazardObj.i18n[currentLang] || hazardObj.i18n.vi;
        i18nData = {
            title: langData.title || 'Không có tiêu đề',
            mechanism: langData.mechanism || '',
            description: langData.description || '',
            emergency: langData.emergency || ''
        };
        severity = hazardObj.severity || 'warning';
    }

    resultCard.className = 'result-card ' + severity;

    const badgeMap = {
        vi: { danger: 'Nguy hiểm', explosion: 'Nổ / Cháy', warning: 'Cảnh báo', safe: 'An toàn' },
        en: { danger: 'Danger', explosion: 'Explosion', warning: 'Warning', safe: 'Safe' }
    };
    const badgeText = badgeMap[currentLang] ? badgeMap[currentLang][severity] : severity;

    const html = `
        <div class="result-content">
            <div class="result-title-row">
                <h3 class="result-title">${i18nData.title}</h3>
                <span class="severity-badge ${severity}">${badgeText}</span>
            </div>
            <div class="result-block">
                <h4>${currentLang === 'vi' ? '⚗️ Cơ chế / Phản ứng' : '⚗️ Reaction / Mechanism'}</h4>
                <p>${i18nData.mechanism || 'Không có thông tin.'}</p>
            </div>
            <div class="result-block">
                <h4>${currentLang === 'vi' ? '⚠️ Mô tả nguy cơ & sức khỏe' : '⚠️ Hazard Description & Health Risks'}</h4>
                <p>${i18nData.description || 'Không có thông tin.'}</p>
            </div>
            <div class="result-block">
                <h4>${currentLang === 'vi' ? '🚑 Sơ cứu & ứng phó khẩn cấp' : '🚑 Emergency Protocol & First Aid'}</h4>
                <p>${i18nData.emergency || 'Không có thông tin.'}</p>
            </div>
        </div>
    `;

    resultContent.style.display = 'block';
    resultContent.innerHTML = html;
    currentResult = result;
    resultCard.dataset.lastResult = JSON.stringify(result);
}

// ---------- UI helpers ----------
function showPlaceholder() {
    placeholderDefault.style.display = 'flex';
    loadingSpinner.style.display = 'none';
    resultContent.style.display = 'none';
    resultCard.className = 'result-card neutral';
    currentResult = null;
}

function setLoading(loading) {
    if (loading) {
        placeholderDefault.style.display = 'none';
        resultContent.style.display = 'none';
        loadingSpinner.style.display = 'flex';
        resultCard.className = 'result-card neutral';
    } else {
        loadingSpinner.style.display = 'none';
    }
}

function showError(message, isNoResult = false) {
    const dict = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS.vi;
    const title = isNoResult ? dict.noResultTitle : dict.errorTitle;
    const msg = isNoResult ? dict.noResultMessage : (message || dict.errorMessage);
    resultCard.className = 'result-card neutral';
    placeholderDefault.style.display = 'none';
    loadingSpinner.style.display = 'none';
    resultContent.style.display = 'block';
    resultContent.innerHTML = `
        <div class="result-placeholder" style="display:flex;">
            <span class="placeholder-icon">${isNoResult ? '🔍' : '⚠️'}</span>
            <p class="placeholder-text"><strong>${title}</strong><br>${msg}</p>
        </div>
    `;
    currentResult = null;
}

function showFallbackWarning() {
    const dict = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS.vi;
    const title = currentLang === 'vi' ? 'Cảnh báo cần xác minh' : 'Caution – verify further';
    const msg = currentLang === 'vi' 
        ? 'Không tìm thấy kết quả chính xác. Vui lòng xác minh thêm hoặc thử từ khóa khác.'
        : 'No exact match found. Please verify further or try a different keyword.';
    resultCard.className = 'result-card warning';
    placeholderDefault.style.display = 'none';
    loadingSpinner.style.display = 'none';
    resultContent.style.display = 'block';
    resultContent.innerHTML = `
        <div class="result-placeholder" style="display:flex;">
            <span class="placeholder-icon">⚠️</span>
            <p class="placeholder-text"><strong>${title}</strong><br>${msg}</p>
        </div>
    `;
    currentResult = null;
}

function hasRiskKeywords(text) {
    const norm = normalize(text);
    for (const kw of RISK_KEYWORDS) {
        const regex = buildKeywordRegex(kw);
        if (regex && regex.test(norm)) return true;
    }
    return false;
}

// ---------- Event listeners ----------
analyzeBtn.addEventListener('click', handleTextAnalyze);
scanBtn.addEventListener('click', handleScanAnalyze);

primaryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleTextAnalyze(); }
});
secondaryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleTextAnalyze(); }
});

// ---------- Initial ----------
showPlaceholder();