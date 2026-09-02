// ============================================================
//  data.js – Chemical database with classes & generic rules
// ============================================================

// ---------- UI translations (static) ----------
const UI_TRANSLATIONS = {
    vi: {
        labelPrimary: 'Sản phẩm / chất chính',
        labelSecondary: 'Sản phẩm phụ (tùy chọn)',
        btnAnalyze: 'Phân Tích Nguy Cơ 🔍',
        placeholderDefault: 'Nhập chất cần kiểm tra và nhấn "Phân Tích"',
        loadingText: 'Đang tra cứu dữ liệu...',
        footerDisclaimer: '⚠️ Dữ liệu từ cơ sở dữ liệu an toàn hóa chất. Không thay thế tư vấn chuyên môn.',
        errorTitle: 'Lỗi',
        errorMessage: 'Không thể xử lý yêu cầu. Vui lòng thử lại.',
        noResultTitle: 'Không tìm thấy',
        noResultMessage: 'Không có thông tin về chất này trong cơ sở dữ liệu.',
        fallbackWarning: '⚠️ Cảnh báo cần xác minh – Không tìm thấy thông tin chính xác.'
    },
    en: {
        labelPrimary: 'Primary product / chemical',
        labelSecondary: 'Secondary product (optional)',
        btnAnalyze: 'Analyze Risk 🔍',
        placeholderDefault: 'Enter a substance and click "Analyze Risk"',
        loadingText: 'Searching data...',
        footerDisclaimer: '⚠️ Data from chemical safety database. Not a substitute for professional advice.',
        errorTitle: 'Error',
        errorMessage: 'Unable to process request. Please try again.',
        noResultTitle: 'Not found',
        noResultMessage: 'No information found for this substance in the database.',
        fallbackWarning: '⚠️ Caution – verify further. No exact match found.'
    }
};

// ---------- Chemical Classes (for generic reaction rules) ----------
const chemicalClasses = [
    {
        id: 'acid',
        keywords: ['hcl', 'axit clohidric', 'muriatic', 'axit muriatic', 'axit', 'acid', 'ch3cooh', 'giấm', 'vinegar', 'acetic acid', 'h2so4', 'sulfuric'],
        label: { vi: 'Axit', en: 'Acid' }
    },
    {
        id: 'hypochlorite',
        keywords: ['javel', 'nước javel', 'bleach', 'clorox', 'naclo', 'sodium hypochlorite', 'nước tẩy javel'],
        label: { vi: 'Hypochlorite', en: 'Hypochlorite' }
    },
    {
        id: 'baking_soda',
        keywords: ['baking soda', 'na2co3', 'nahco3', 'soda', 'muối nở', 'sodium bicarbonate'],
        label: { vi: 'Baking Soda', en: 'Baking Soda' }
    }
];

// ---------- Single Hazards ----------
const singleHazards = [
    {
        id: 'carbon_monoxide',
        keywords: ['carbon monoxide', 'co', 'khí co', 'khí than', 'than'],
        severity: 'danger',
        i18n: {
            vi: {
                title: 'Carbon Monoxide (CO) – Khí than',
                mechanism: 'CO + Hemoglobin → Carboxyhemoglobin (gây ngạt)',
                description: 'Khí CO không màu, không mùi, kết hợp với hemoglobin mạnh hơn oxy gấp 200–300 lần, gây thiếu oxy mô, tổn thương não và tim mạch. Ngộ độc CO là nguyên nhân hàng đầu gây tử vong do ngạt.',
                emergency: '1️⃣ Đưa nạn nhân ra nơi thoáng khí ngay lập tức. 2️⃣ Gọi cấp cứu 115. 3️⃣ Nếu ngừng thở, hồi sức tim phổi (CPR). 4️⃣ Cung cấp oxy 100% nếu có thể.'
            },
            en: {
                title: 'Carbon Monoxide (CO) – Coal gas',
                mechanism: 'CO + Hemoglobin → Carboxyhemoglobin (asphyxiation)',
                description: 'CO is a colorless, odorless gas that binds to hemoglobin 200–300 times more strongly than oxygen, causing tissue hypoxia, brain damage, and cardiovascular issues. CO poisoning is a leading cause of fatal asphyxiation.',
                emergency: '1️⃣ Move victim to fresh air immediately. 2️⃣ Call emergency services. 3️⃣ If not breathing, perform CPR. 4️⃣ Administer 100% oxygen if available.'
            }
        }
    },
    {
        id: 'lpg_leak',
        keywords: ['lpg', 'gas', 'khí gas', 'bình gas', 'propane', 'butane', 'gas leak', 'rò rỉ gas', 'gas rò rỉ'],
        severity: 'explosion',
        i18n: {
            vi: {
                title: 'Rò rỉ khí LPG / Gas',
                mechanism: 'C₃H₈ / C₄H₁₀ + O₂ → CO₂ + H₂O (cháy nổ khi nồng độ 2–10%)',
                description: 'Khí gas dễ cháy, tạo hỗn hợp nổ với không khí. Gây ngạt, cháy nổ mạnh khi có tia lửa. Hít phải nồng độ cao gây choáng váng, buồn nôn, mất ý thức.',
                emergency: '1️⃣ Ngắt nguồn gas, mở cửa thông gió. 2️⃣ KHÔNG bật công tắc điện hoặc dùng lửa. 3️⃣ Di chuyển khỏi khu vực nguy hiểm. 4️⃣ Gọi cứu hỏa nếu cháy.'
            },
            en: {
                title: 'LPG / Gas Leak',
                mechanism: 'C₃H₈ / C₄H₁₀ + O₂ → CO₂ + H₂O (explosive at 2–10% concentration)',
                description: 'LPG is highly flammable and forms explosive mixtures with air. Causes asphyxiation, dizziness, nausea, and loss of consciousness. Fire or spark can trigger a blast.',
                emergency: '1️⃣ Shut off gas supply, open windows for ventilation. 2️⃣ DO NOT switch electrical appliances or use flames. 3️⃣ Evacuate the area. 4️⃣ Call fire department if ignition occurs.'
            }
        }
    },
    {
        id: 'bleach',
        keywords: ['javel', 'nước javel', 'bleach', 'clorox', 'naclo', 'sodium hypochlorite', 'nước tẩy javel'],
        severity: 'warning',
        i18n: {
            vi: {
                title: 'Chất tẩy Javel (NaClO)',
                mechanism: 'NaClO → Cl₂ + NaOH (phân hủy)',
                description: 'Javel là chất oxy hóa mạnh, gây kích ứng da, mắt và đường hô hấp. Trộn với axit hoặc amoniac tạo ra khí độc nguy hiểm (xem tương tác).',
                emergency: '1️⃣ Rửa vùng tiếp xúc với nước sạch. 2️⃣ Nếu nuốt phải, KHÔNG gây nôn, uống sữa hoặc nước. 3️⃣ Gọi cấp cứu nếu có triệu chứng. 4️⃣ Thông thoáng khu vực.'
            },
            en: {
                title: 'Bleach (NaClO) – Sodium hypochlorite',
                mechanism: 'NaClO → Cl₂ + NaOH (decomposition)',
                description: 'Bleach is a strong oxidizer, irritates skin, eyes, and respiratory tract. Mixing with acids or ammonia releases toxic gases (see interactions).',
                emergency: '1️⃣ Flush exposed area with water. 2️⃣ If swallowed, DO NOT induce vomiting, drink milk or water. 3️⃣ Call emergency if symptoms occur. 4️⃣ Ventilate the area.'
            }
        }
    },
    {
        id: 'acid',
        keywords: ['hcl', 'axit clohidric', 'muriatic', 'axit muriatic', 'axit', 'acid', 'h2so4', 'sulfuric'],
        severity: 'explosion',
        i18n: {
            vi: {
                title: 'Axit mạnh (HCl, H₂SO₄)',
                mechanism: 'Axit + kim loại → H₂↑; Axit + base → muối + nước (phản ứng tỏa nhiệt)',
                description: 'Axit ăn mòn mạnh, gây bỏng hóa chất nặng khi tiếp xúc. Hít phải hơi axit gây kích ứng phổi và đường thở.',
                emergency: '1️⃣ Rửa ngay với nước sạch ít nhất 20 phút. 2️⃣ Cởi bỏ quần áo nhiễm axit. 3️⃣ KHÔNG trung hòa axit trên da. 4️⃣ Gọi cấp cứu.'
            },
            en: {
                title: 'Strong Acid (HCl, H₂SO₄)',
                mechanism: 'Acid + metal → H₂↑; Acid + base → salt + water (exothermic)',
                description: 'Acids are highly corrosive, causing severe chemical burns on contact. Inhalation of acid fumes irritates lungs and airways.',
                emergency: '1️⃣ Rinse immediately with water for at least 20 minutes. 2️⃣ Remove contaminated clothing. 3️⃣ DO NOT neutralize acid on skin. 4️⃣ Call emergency services.'
            }
        }
    },
    {
        id: 'ammonia',
        keywords: ['amoniac', 'ammonia', 'nh3', 'khí amoniac', 'dung dịch amoniac'],
        severity: 'warning',
        i18n: {
            vi: {
                title: 'Amoniac (NH₃) – Khí amoniac',
                mechanism: 'NH₃ + H₂O → NH₄OH (dung dịch kiềm)',
                description: 'Amoniac là chất khí có mùi hăng, gây kích ứng mắt, da và đường hô hấp. Ở nồng độ cao có thể gây bỏng hóa chất và tổn thương phổi.',
                emergency: '1️⃣ Di chuyển đến nơi thoáng khí. 2️⃣ Rửa mắt và da bằng nước sạch trong 15 phút. 3️⃣ Nếu hít phải, giữ bệnh nhân nằm yên và gọi cấp cứu. 4️⃣ Không gây nôn nếu nuốt phải.'
            },
            en: {
                title: 'Ammonia (NH₃) – Ammonia gas',
                mechanism: 'NH₃ + H₂O → NH₄OH (alkaline solution)',
                description: 'Ammonia is a pungent gas that irritates eyes, skin, and respiratory tract. High concentrations can cause chemical burns and lung damage.',
                emergency: '1️⃣ Move to fresh air. 2️⃣ Flush eyes and skin with water for 15 minutes. 3️⃣ If inhaled, keep patient at rest and call emergency. 4️⃣ Do not induce vomiting if swallowed.'
            }
        }
    },
    {
        id: 'methanol',
        keywords: ['methanol', 'mêtanol', 'cồn công nghiệp', 'rượu metylic', 'methyl alcohol'],
        severity: 'danger',
        i18n: {
            vi: {
                title: 'Methanol (CH₃OH) – Cồn metylic',
                mechanism: 'CH₃OH → HCOOH (axit formic) gây toan chuyển hóa',
                description: 'Methanol rất độc, hấp thụ qua da và đường tiêu hóa. Chuyển hóa thành axit formic gây tổn thương thần kinh thị giác, mù lòa, suy hô hấp và tử vong.',
                emergency: '1️⃣ Đưa nạn nhân khỏi nguồn tiếp xúc. 2️⃣ Gọi cấp cứu ngay. 3️⃣ Nếu nuốt phải, cho uống ethanol hoặc thuốc giải độc (nếu có). 4️⃣ Không gây nôn.'
            },
            en: {
                title: 'Methanol (CH₃OH) – Wood alcohol',
                mechanism: 'CH₃OH → HCOOH (formic acid) causing metabolic acidosis',
                description: 'Methanol is highly toxic, absorbed through skin and GI tract. Metabolized to formic acid causing optic nerve damage, blindness, respiratory failure, and death.',
                emergency: '1️⃣ Remove from exposure. 2️⃣ Call emergency immediately. 3️⃣ If swallowed, administer ethanol or antidote if available. 4️⃣ Do not induce vomiting.'
            }
        }
    },
    {
        id: 'ethanol',
        keywords: ['c2h5oh', 'cồn', 'ethanol', 'rượu', 'alcohol'],
        severity: 'explosion',
        i18n: {
            vi: {
                title: 'Ethanol (C₂H₅OH) – Cồn',
                mechanism: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O (cháy)',
                description: 'Ethanol là chất lỏng dễ cháy, dễ bắt lửa. Tiếp xúc lâu dài gây kích ứng da. Uống quá nhiều gây ngộ độc và ảnh hưởng thần kinh.',
                emergency: '1️⃣ Tránh xa nguồn lửa. 2️⃣ Nếu dính vào da, rửa với nước. 3️⃣ Nếu nuốt phải nhiều, gọi cấp cứu. 4️⃣ Giữ khu vực thông thoáng.'
            },
            en: {
                title: 'Ethanol (C₂H₅OH) – Alcohol',
                mechanism: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O (combustion)',
                description: 'Ethanol is a flammable liquid, easily ignitable. Prolonged skin contact causes irritation. Excessive ingestion leads to poisoning and neurological effects.',
                emergency: '1️⃣ Keep away from flames. 2️⃣ If on skin, wash with water. 3️⃣ If swallowed in large amounts, seek medical help. 4️⃣ Ensure ventilation.'
            }
        }
    },
    {
        id: 'vinegar',
        keywords: ['giấm', 'vinegar', 'ch3cooh', 'axit axetic', 'acetic acid'],
        severity: 'safe',
        i18n: {
            vi: {
                title: 'Giấm (CH₃COOH) – Axit axetic loãng',
                mechanism: 'CH₃COOH ↔ H⁺ + CH₃COO⁻ (axit yếu)',
                description: 'Giấm là axit yếu, an toàn trong sinh hoạt. Có thể gây kích ứng nhẹ nếu tiếp xúc lâu với da hoặc mắt. Trộn với baking soda tạo ra khí CO₂ (bọt) không độc.',
                emergency: '1️⃣ Nếu vào mắt, rửa với nước trong 15 phút. 2️⃣ Nếu nuốt phải với lượng nhỏ, không có hại. 3️⃣ Tránh tiếp xúc kéo dài với da.'
            },
            en: {
                title: 'Vinegar (CH₃COOH) – Dilute acetic acid',
                mechanism: 'CH₃COOH ↔ H⁺ + CH₃COO⁻ (weak acid)',
                description: 'Vinegar is a weak acid, safe for household use. May cause mild irritation upon prolonged skin or eye contact. Mixing with baking soda releases harmless CO₂ gas (fizzing).',
                emergency: '1️⃣ If in eyes, rinse with water for 15 minutes. 2️⃣ If swallowed in small amounts, no harm. 3️⃣ Avoid prolonged skin contact.'
            }
        }
    },
    {
        id: 'baking_soda',
        keywords: ['baking soda', 'na2co3', 'nahco3', 'soda', 'muối nở', 'sodium bicarbonate'],
        severity: 'safe',
        i18n: {
            vi: {
                title: 'Baking Soda (NaHCO₃) – Muối nở',
                mechanism: 'NaHCO₃ + acid → CO₂↑ + H₂O + muối (phản ứng tạo bọt)',
                description: 'Baking soda là chất rắn an toàn, dùng trong làm bánh. Phản ứng với axit giải phóng khí CO₂ không độc. Có thể gây kích ứng nhẹ nếu hít bụi.',
                emergency: '1️⃣ Tránh hít bụi. 2️⃣ Nếu vào mắt, rửa với nước. 3️⃣ Nếu nuốt phải nhiều, uống nước và gọi cấp cứu nếu có triệu chứng.'
            },
            en: {
                title: 'Baking Soda (NaHCO₃) – Sodium bicarbonate',
                mechanism: 'NaHCO₃ + acid → CO₂↑ + H₂O + salt (effervescence)',
                description: 'Baking soda is a safe solid used in baking. Reacts with acids to release non-toxic CO₂ gas. May cause mild irritation if dust is inhaled.',
                emergency: '1️⃣ Avoid inhaling dust. 2️⃣ If in eyes, rinse with water. 3️⃣ If swallowed in large amounts, drink water and seek medical help if symptoms occur.'
            }
        }
    },
    {
        id: 'dish_soap',
        keywords: ['nước rửa chén', 'dish soap', 'dishwashing liquid', 'xà phòng rửa chén'],
        severity: 'safe',
        i18n: {
            vi: {
                title: 'Nước rửa chén – Chất tẩy rửa nhẹ',
                mechanism: 'Chất hoạt động bề mặt (surfactant)',
                description: 'Nước rửa chén thường có thành phần tẩy rửa nhẹ, không nguy hiểm. Tiếp xúc với mắt gây kích ứng nhẹ. Trộn với chất tẩy mạnh có thể gây phản ứng không mong muốn.',
                emergency: '1️⃣ Nếu vào mắt, rửa với nước sạch. 2️⃣ Nếu nuốt phải, uống nhiều nước và theo dõi triệu chứng. 3️⃣ Tránh trộn với chất tẩy clo hoặc axit.'
            },
            en: {
                title: 'Dish Soap – Mild detergent',
                mechanism: 'Surfactant (surface-active agent)',
                description: 'Dish soap is a mild detergent, generally safe. Eye contact may cause mild irritation. Mixing with strong cleaners may cause unwanted reactions.',
                emergency: '1️⃣ If in eyes, rinse with water. 2️⃣ If swallowed, drink water and monitor symptoms. 3️⃣ Avoid mixing with bleach or acid.'
            }
        }
    }
];

// ---------- Mixed Hazards (exact pair matches) ----------
const mixedHazards = [
    {
        id: 'bleach_acid',
        primaryKeywords: ['javel', 'nước javel', 'bleach', 'clorox', 'naclo', 'sodium hypochlorite'],
        secondaryKeywords: ['vim', 'axit tẩy bồn cầu', 'toilet cleaner', 'hcl', 'axit clohidric', 'muriatic', 'axit', 'acid', 'h2so4', 'sulfuric'],
        severity: 'danger',
        i18n: {
            vi: {
                title: 'Javel (NaClO) + Axit (HCl) → Khí Clo (Cl₂) CỰC ĐỘC',
                mechanism: 'NaClO + 2HCl → NaCl + H₂O + Cl₂↑',
                description: 'Phản ứng tạo ra khí Clo (Cl₂) cực độc, gây kích ứng đường hô hấp, bỏng phổi, và có thể tử vong ở nồng độ cao. Hít phải gây ho, đau ngực, khó thở, tổn thương phổi nặng.',
                emergency: '1️⃣ Di chuyển ngay đến nơi thoáng khí. 2️⃣ Gọi cấp cứu 115. 3️⃣ Nếu khó thở, cung cấp oxy hỗ trợ. 4️⃣ Không gây nôn – rửa mắt và da bằng nước sạch nếu tiếp xúc.'
            },
            en: {
                title: 'Bleach (NaClO) + Acid (HCl) → Chlorine Gas (Cl₂) HIGHLY TOXIC',
                mechanism: 'NaClO + 2HCl → NaCl + H₂O + Cl₂↑',
                description: 'This reaction releases highly toxic chlorine gas (Cl₂), causing severe respiratory irritation, pulmonary burns, and potentially death at high concentrations. Inhalation leads to coughing, chest pain, and breathing difficulty.',
                emergency: '1️⃣ Move to fresh air immediately. 2️⃣ Call emergency services. 3️⃣ If breathing is difficult, administer oxygen. 4️⃣ Do not induce vomiting – flush eyes and skin with water if exposed.'
            }
        }
    },
    {
        id: 'bleach_ammonia',
        primaryKeywords: ['javel', 'nước javel', 'bleach', 'clorox', 'naclo', 'sodium hypochlorite'],
        secondaryKeywords: ['amoniac', 'ammonia', 'nh3', 'dung dịch amoniac'],
        severity: 'danger',
        i18n: {
            vi: {
                title: 'Javel (NaClO) + Amoniac (NH₃) → Chloramine (NH₂Cl) CỰC ĐỘC',
                mechanism: 'NaClO + NH₃ → NH₂Cl (chloramine) + NaOH',
                description: 'Phản ứng tạo ra chloramine, một hợp chất độc, gây kích ứng mạnh mắt, da và đường hô hấp. Ở nồng độ cao có thể gây tổn thương phổi và nguy hiểm tính mạng.',
                emergency: '1️⃣ Di chuyển đến nơi thoáng khí. 2️⃣ Gọi cấp cứu nếu có triệu chứng. 3️⃣ Rửa mắt và da với nước trong 15 phút. 4️⃣ Hỗ trợ hô hấp nếu cần.'
            },
            en: {
                title: 'Bleach (NaClO) + Ammonia (NH₃) → Chloramine (NH₂Cl) HIGHLY TOXIC',
                mechanism: 'NaClO + NH₃ → NH₂Cl (chloramine) + NaOH',
                description: 'This reaction produces chloramine, a toxic compound that severely irritates eyes, skin, and respiratory tract. At high concentrations, it can cause lung damage and be life-threatening.',
                emergency: '1️⃣ Move to fresh air. 2️⃣ Call emergency if symptoms occur. 3️⃣ Flush eyes and skin with water for 15 minutes. 4️⃣ Provide respiratory support if needed.'
            }
        }
    },
    {
        id: 'vinegar_baking_soda',
        primaryKeywords: ['giấm', 'vinegar', 'ch3cooh', 'axit axetic', 'acetic acid'],
        secondaryKeywords: ['baking soda', 'na2co3', 'nahco3', 'soda', 'muối nở', 'sodium bicarbonate'],
        severity: 'safe',
        i18n: {
            vi: {
                title: 'Giấm + Baking Soda → Khí CO₂ (bọt) – An toàn',
                mechanism: 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑',
                description: 'Phản ứng tạo ra khí CO₂ (cacbon dioxide) – chất không độc, tạo bọt. Không gây nguy hiểm. Thường dùng làm sạch hoặc nấu ăn.',
                emergency: 'Không cần can thiệp y tế. Rửa tay nếu dính bột. Tránh hít bụi.'
            },
            en: {
                title: 'Vinegar + Baking Soda → CO₂ Gas (fizz) – Safe',
                mechanism: 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑',
                description: 'This reaction produces carbon dioxide (CO₂) – a non-toxic gas, causing fizzing. No hazard. Commonly used for cleaning or cooking.',
                emergency: 'No medical intervention needed. Wash hands if powder on skin. Avoid inhaling dust.'
            }
        }
    },
    {
        id: 'acid_baking_soda',
        primaryKeywords: ['hcl', 'axit clohidric', 'muriatic', 'axit muriatic', 'axit', 'acid', 'h2so4', 'sulfuric'],
        secondaryKeywords: ['baking soda', 'na2co3', 'nahco3', 'soda', 'muối nở', 'sodium bicarbonate'],
        severity: 'safe',
        i18n: {
            vi: {
                title: 'Axit + Baking Soda → CO₂ (bọt) – An toàn (nếu axit loãng)',
                mechanism: 'HCl + NaHCO₃ → NaCl + H₂O + CO₂↑',
                description: 'Phản ứng trung hòa, tạo khí CO₂ và muối. Nếu axit đậm đặc, vẫn có nguy cơ ăn mòn. Nên sử dụng găng tay khi thao tác.',
                emergency: 'Nếu axit tiếp xúc da, rửa với nước. Nếu nuốt phải, gọi cấp cứu. Đảm bảo thông thoáng.'
            },
            en: {
                title: 'Acid + Baking Soda → CO₂ (fizz) – Safe (if acid is dilute)',
                mechanism: 'HCl + NaHCO₃ → NaCl + H₂O + CO₂↑',
                description: 'Neutralization reaction, producing CO₂ and salt. If acid is concentrated, still corrosive. Wear gloves when handling.',
                emergency: 'If acid contacts skin, rinse with water. If swallowed, call emergency. Ensure ventilation.'
            }
        }
    },
    {
        id: 'bleach_dish_soap',
        primaryKeywords: ['javel', 'nước javel', 'bleach', 'clorox', 'naclo', 'sodium hypochlorite'],
        secondaryKeywords: ['nước rửa chén', 'dish soap', 'dishwashing liquid', 'xà phòng rửa chén'],
        severity: 'warning',
        i18n: {
            vi: {
                title: 'Javel + Nước rửa chén – Có thể tạo khí độc nhẹ',
                mechanism: 'Phản ứng phụ do chất hoạt động bề mặt và chất oxy hóa',
                description: 'Trộn Javel với nước rửa chén có thể tạo ra khí clo nhẹ và hợp chất chloramine, gây kích ứng hô hấp. Không nên trộn lẫn.',
                emergency: '1️⃣ Tránh hít khí. 2️⃣ Thông gió. 3️⃣ Nếu khó thở, ra nơi thoáng khí. 4️⃣ Rửa da nếu tiếp xúc.'
            },
            en: {
                title: 'Bleach + Dish Soap – May release mild toxic gas',
                mechanism: 'Side reaction between surfactant and oxidizer',
                description: 'Mixing bleach with dish soap can release trace chlorine and chloramine, causing respiratory irritation. Do not mix.',
                emergency: '1️⃣ Avoid inhaling fumes. 2️⃣ Ventilate area. 3️⃣ If breathing difficulty, move to fresh air. 4️⃣ Rinse skin if exposed.'
            }
        }
    }
];

// ---------- Generic reaction rules (fallback when exact pair not found) ----------
// These are applied based on detected chemical classes.
const genericRules = [
    {
        id: 'acid_acid',
        condition: (class1, class2) => class1 === 'acid' && class2 === 'acid',
        severity: 'explosion', // ORANGE
        i18n: {
            vi: {
                title: 'Trộn Axit + Axit – Nguy cơ ăn mòn và hơi độc',
                mechanism: 'Cộng hưởng tính axit, giải phóng hơi axit ăn mòn',
                description: 'Trộn hai axit mạnh làm tăng nồng độ ion H⁺, gây ăn mòn nghiêm trọng, hơi axit bay ra kích ứng hô hấp và da. Nguy cơ bỏng hóa chất cao.',
                emergency: '1️⃣ Thông gió ngay lập tức. 2️⃣ Tránh tiếp xúc trực tiếp. 3️⃣ Nếu dính axit, rửa với nước ít nhất 20 phút. 4️⃣ Gọi cấp cứu nếu hít phải hoặc tiếp xúc nhiều.'
            },
            en: {
                title: 'Acid + Acid Mixture – Corrosive hazard and fumes',
                mechanism: 'Cumulative acidity, release of corrosive acid vapors',
                description: 'Mixing two strong acids increases H⁺ concentration, causing severe corrosiveness, acid fumes irritating respiratory tract and skin. High risk of chemical burns.',
                emergency: '1️⃣ Ventilate immediately. 2️⃣ Avoid direct contact. 3️⃣ If acid spills, rinse with water for at least 20 minutes. 4️⃣ Call emergency if inhaled or heavily exposed.'
            }
        }
    },
    {
        id: 'hypochlorite_acid',
        condition: (class1, class2) => (class1 === 'hypochlorite' && class2 === 'acid') || (class1 === 'acid' && class2 === 'hypochlorite'),
        severity: 'danger', // RED
        i18n: {
            vi: {
                title: 'Hypochlorite (Javel) + Axit → Khí Clo (Cl₂) / Hypochlorous acid – NGUY HIỂM',
                mechanism: 'NaClO + acid → HClO / Cl₂↑ (phụ thuộc nồng độ axit)',
                description: 'Phản ứng giải phóng khí Clo hoặc axit hypochlorous – chất oxy hóa mạnh, gây tổn thương phổi, mắt và da. Có thể gây tử vong ở nồng độ cao.',
                emergency: '1️⃣ Di chuyển ngay đến nơi thoáng khí. 2️⃣ Gọi cấp cứu. 3️⃣ Nếu khó thở, cung cấp oxy. 4️⃣ Không gây nôn – rửa mắt và da với nước.'
            },
            en: {
                title: 'Hypochlorite (Bleach) + Acid → Chlorine Gas / Hypochlorous acid – HAZARDOUS',
                mechanism: 'NaClO + acid → HClO / Cl₂↑ (depending on acid strength)',
                description: 'Reaction releases chlorine gas or hypochlorous acid – strong oxidizers, causing lung damage, eye and skin burns. May be fatal at high concentrations.',
                emergency: '1️⃣ Move to fresh air immediately. 2️⃣ Call emergency. 3️⃣ If breathing difficulty, administer oxygen. 4️⃣ Do not induce vomiting – flush eyes and skin with water.'
            }
        }
    }
];

// ---------- Risk keywords for fallback detection ----------
const RISK_KEYWORDS = ['khí', 'tẩy', 'axit', 'axit bồn cầu', 'gas', 'lpg', 'javel', 'bleach', 'clorox', 'amoniac', 'ammonia', 'cồn', 'rượu', 'lửa'];