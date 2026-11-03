"""
MedGraph Therapy Engine — Medical Lexicon.

Comprehensive medical keyword dictionaries for extracting clinically
relevant information from OCR text of medical reports. This enables
rule-based NER (Named Entity Recognition) without any cloud API.

Categories:
  1. BODY_AREAS — Anatomical regions and body parts
  2. CONDITIONS — Damage types, pathologies, disease indicators
  3. SYMPTOMS — Observable clinical signs
  4. SEVERITY — Severity qualifiers (mild, moderate, severe, etc.)
  5. IMAGING_FINDINGS — Radiology/imaging report terminology
  6. LAB_MARKERS — Laboratory test and biomarker keywords
"""

# ── 1. Body Areas / Anatomical Regions ─────────────────────────────
BODY_AREAS: dict[str, list[str]] = {
    "head": ["head", "skull", "cranium", "cranial", "scalp", "forehead", "temple"],
    "brain": ["brain", "cerebral", "cerebrum", "cerebellum", "cortex", "frontal lobe",
              "temporal lobe", "parietal lobe", "occipital lobe", "brainstem", "hippocampus"],
    "eye": ["eye", "ocular", "retina", "cornea", "optic", "orbital", "conjunctiva", "sclera"],
    "ear": ["ear", "auditory", "tympanic", "cochlea", "vestibular"],
    "nose": ["nose", "nasal", "sinus", "paranasal", "septum"],
    "throat": ["throat", "pharynx", "larynx", "tonsil", "uvula", "epiglottis"],
    "neck": ["neck", "cervical", "cervical spine", "c-spine", "thyroid", "carotid"],
    "chest": ["chest", "thorax", "thoracic", "sternum", "rib", "ribs", "intercostal",
              "pectoral", "breast", "mammary"],
    "lung": ["lung", "pulmonary", "bronchi", "bronchial", "alveolar", "pleura", "pleural",
             "diaphragm", "respiratory"],
    "heart": ["heart", "cardiac", "myocardial", "pericardial", "coronary", "aorta", "aortic",
              "ventricle", "atrium", "valve", "mitral", "tricuspid"],
    "abdomen": ["abdomen", "abdominal", "belly", "peritoneal", "peritoneum", "epigastric"],
    "liver": ["liver", "hepatic", "hepato", "biliary", "gallbladder"],
    "kidney": ["kidney", "renal", "nephro", "ureter", "adrenal"],
    "stomach": ["stomach", "gastric", "gastro", "duodenum", "duodenal", "pyloric"],
    "intestine": ["intestine", "intestinal", "bowel", "colon", "colonic", "rectal",
                  "rectum", "cecum", "ileum", "jejunum", "appendix"],
    "pancreas": ["pancreas", "pancreatic"],
    "spleen": ["spleen", "splenic"],
    "spine": ["spine", "spinal", "vertebra", "vertebral", "lumbar", "thoracic spine",
              "sacral", "sacrum", "coccyx", "disc", "intervertebral"],
    "shoulder": ["shoulder", "glenohumeral", "rotator cuff", "deltoid", "acromion",
                 "supraspinatus", "infraspinatus", "subscapularis", "clavicle", "scapula"],
    "arm": ["arm", "upper arm", "humerus", "humeral", "bicep", "tricep", "brachial"],
    "elbow": ["elbow", "olecranon", "radial head", "ulnar", "epicondyle"],
    "forearm": ["forearm", "radius", "ulna", "radial", "ulnar"],
    "wrist": ["wrist", "carpal", "scaphoid", "lunate", "radiocarpal"],
    "hand": ["hand", "metacarpal", "phalanx", "phalanges", "finger", "thumb", "palmar"],
    "hip": ["hip", "femoral head", "acetabulum", "pelvic", "pelvis", "iliac", "ischium",
            "pubic", "trochanter"],
    "thigh": ["thigh", "femur", "femoral", "quadriceps", "hamstring"],
    "knee": ["knee", "patella", "patellar", "meniscus", "meniscal", "cruciate", "acl",
             "pcl", "mcl", "lcl", "tibial plateau", "condyle"],
    "leg": ["leg", "lower leg", "tibia", "tibial", "fibula", "fibular", "shin", "calf",
            "gastrocnemius", "soleus"],
    "ankle": ["ankle", "malleolus", "talus", "talar", "achilles", "calcaneus"],
    "foot": ["foot", "metatarsal", "tarsal", "plantar", "heel", "toe", "phalanx"],
    "skin": ["skin", "cutaneous", "subcutaneous", "dermal", "epidermis", "dermis"],
    "blood_vessel": ["vessel", "vascular", "artery", "arterial", "vein", "venous",
                     "capillary", "arteriole", "venule"],
    "lymph": ["lymph", "lymphatic", "lymph node", "lymphadenopathy"],
    "nerve": ["nerve", "neural", "neurological", "neuropathy", "peripheral nerve"],
    "muscle": ["muscle", "muscular", "tendon", "ligament", "fascia", "myofascial"],
    "bone": ["bone", "osseous", "cortical bone", "cancellous", "periosteum", "marrow"],
    "joint": ["joint", "articular", "synovial", "cartilage", "meniscus"],
}

# ── 2. Conditions / Pathologies / Damage Types ────────────────────
CONDITIONS: dict[str, list[str]] = {
    "fracture": ["fracture", "fractured", "broken", "crack", "cracked", "comminuted",
                 "displaced", "non-displaced", "stress fracture", "hairline fracture",
                 "avulsion fracture", "spiral fracture", "greenstick", "compression fracture"],
    "dislocation": ["dislocation", "dislocated", "subluxation", "subluxated"],
    "sprain": ["sprain", "sprained", "ligament tear", "ligament injury", "grade i sprain",
               "grade ii sprain", "grade iii sprain"],
    "strain": ["strain", "strained", "muscle tear", "muscle pull", "pulled muscle"],
    "tear": ["tear", "torn", "rupture", "ruptured", "partial tear", "complete tear",
             "full-thickness tear", "partial-thickness tear"],
    "inflammation": ["inflammation", "inflamed", "inflammatory", "itis", "tendinitis",
                     "tendonitis", "bursitis", "arthritis", "synovitis", "fasciitis",
                     "myositis", "neuritis", "vasculitis", "periostitis", "osteitis"],
    "swelling": ["swelling", "swollen", "edema", "oedema", "effusion", "distension",
                 "lymphedema", "angioedema", "pitting edema"],
    "blood_clot": ["blood clot", "thrombus", "thrombosis", "embolus", "embolism",
                   "dvt", "deep vein thrombosis", "pulmonary embolism", "pe",
                   "coagulation", "coagulated", "clotted", "hematoma"],
    "hemorrhage": ["hemorrhage", "haemorrhage", "bleeding", "blood loss",
                   "internal bleeding", "hematoma", "bruise", "bruising",
                   "contusion", "ecchymosis", "petechiae", "purpura"],
    "infection": ["infection", "infected", "sepsis", "septic", "abscess", "cellulitis",
                  "osteomyelitis", "bacterial", "viral", "fungal", "pus", "purulent"],
    "necrosis": ["necrosis", "necrotic", "gangrene", "gangrenous", "infarction",
                 "infarct", "ischemia", "ischemic", "avascular necrosis"],
    "tumor": ["tumor", "tumour", "mass", "lesion", "growth", "neoplasm", "cyst",
              "nodule", "carcinoma", "malignant", "benign", "metastasis", "metastatic"],
    "degeneration": ["degeneration", "degenerative", "wear and tear", "osteoarthritis",
                     "spondylosis", "disc degeneration", "cartilage loss", "erosion"],
    "stenosis": ["stenosis", "narrowing", "stricture", "constriction", "occlusion",
                 "blockage", "obstruction"],
    "prolapse": ["prolapse", "herniation", "hernia", "herniated", "bulge", "bulging",
                 "protrusion", "disc bulge", "disc herniation"],
    "calcification": ["calcification", "calcified", "calcium deposit", "bone spur",
                      "osteophyte", "enthesophyte"],
    "compression": ["compression", "compressed", "impingement", "pinched",
                    "nerve compression", "cord compression", "canal stenosis"],
    "atrophy": ["atrophy", "atrophied", "wasting", "thinning", "loss of mass"],
    "fibrosis": ["fibrosis", "fibrotic", "scarring", "scar tissue", "adhesion",
                 "keloid", "cirrhosis"],
    "ulcer": ["ulcer", "ulceration", "ulcerated", "erosion", "peptic ulcer",
              "gastric ulcer", "duodenal ulcer", "diabetic ulcer", "pressure ulcer",
              "venous ulcer", "decubitus"],
    "neuropathy": ["neuropathy", "nerve damage", "nerve injury", "neuralgia",
                   "radiculopathy", "myelopathy", "paresthesia", "numbness", "tingling"],
    "aneurysm": ["aneurysm", "aneurysmal", "aortic aneurysm", "berry aneurysm",
                 "dissection", "aortic dissection"],
    "osteoporosis": ["osteoporosis", "osteopenia", "bone density loss",
                     "bone mineral density", "t-score"],
    "diabetes_complication": ["diabetic", "diabetes", "hyperglycemia", "neuropathy",
                              "retinopathy", "nephropathy", "diabetic foot",
                              "diabetic wound", "hba1c"],
    "arthritis": ["arthritis", "rheumatoid", "osteoarthritis", "gouty arthritis",
                  "psoriatic arthritis", "ankylosing spondylitis", "reactive arthritis"],
    "stroke": ["stroke", "cerebrovascular accident", "cva", "transient ischemic attack",
               "tia", "ischemic stroke", "hemorrhagic stroke"],
    "pneumonia": ["pneumonia", "pneumonitis", "lung infection", "consolidation",
                  "infiltrate", "ground glass opacity"],
    "copd": ["copd", "chronic obstructive", "emphysema", "chronic bronchitis"],
    "burn": ["burn", "burned", "scald", "thermal injury", "first degree burn",
             "second degree burn", "third degree burn", "chemical burn"],
}

# ── 3. Symptoms / Clinical Signs ──────────────────────────────────
SYMPTOMS: dict[str, list[str]] = {
    "pain": ["pain", "painful", "ache", "aching", "tenderness", "tender",
             "sore", "soreness", "discomfort", "agony", "sharp pain", "dull pain",
             "radiating pain", "referred pain", "chronic pain", "acute pain"],
    "stiffness": ["stiffness", "stiff", "rigid", "rigidity", "limited motion",
                  "restricted movement", "reduced range of motion", "rom"],
    "weakness": ["weakness", "weak", "fatigue", "fatigued", "loss of strength",
                 "paresis", "paralysis", "plegia", "hemiparesis", "quadriparesis"],
    "numbness": ["numbness", "numb", "tingling", "pins and needles",
                 "paresthesia", "hypoesthesia", "anesthesia"],
    "fever": ["fever", "febrile", "elevated temperature", "pyrexia", "hyperthermia"],
    "redness": ["redness", "red", "erythema", "erythematous", "flushing", "rubor"],
    "warmth": ["warmth", "warm", "hot", "heat", "calor"],
    "deformity": ["deformity", "deformed", "misaligned", "malalignment",
                  "angulation", "displacement"],
    "instability": ["instability", "unstable", "laxity", "giving way",
                    "buckling", "hypermobile"],
    "crepitus": ["crepitus", "crepitation", "grinding", "popping", "clicking",
                 "cracking", "snapping"],
    "loss_of_function": ["loss of function", "functional impairment", "disability",
                         "inability to bear weight", "non-weight-bearing",
                         "immobilized", "immobility"],
    "shortness_of_breath": ["shortness of breath", "dyspnea", "breathlessness",
                            "tachypnea", "respiratory distress", "wheezing", "stridor"],
    "chest_pain": ["chest pain", "angina", "precordial pain", "substernal pain"],
    "headache": ["headache", "cephalalgia", "migraine", "tension headache"],
    "dizziness": ["dizziness", "dizzy", "vertigo", "lightheaded", "syncope", "presyncope"],
    "nausea": ["nausea", "nauseous", "vomiting", "emesis"],
    "bleeding": ["bleeding", "hemorrhage", "blood in stool", "hemoptysis",
                 "hematuria", "melena"],
    "discharge": ["discharge", "drainage", "exudate", "seepage", "oozing",
                  "purulent discharge"],
    "skin_changes": ["discoloration", "pallor", "cyanosis", "jaundice",
                     "hyperpigmentation", "rash", "lesion", "wound"],
}

# ── 4. Severity Qualifiers ─────────────────────────────────────────
SEVERITY: dict[str, list[str]] = {
    "mild": ["mild", "minor", "slight", "minimal", "small", "low-grade",
             "grade i", "grade 1", "early", "early-stage"],
    "moderate": ["moderate", "intermediate", "significant", "notable",
                 "grade ii", "grade 2", "partial"],
    "severe": ["severe", "major", "extensive", "large", "advanced",
               "grade iii", "grade 3", "grade iv", "grade 4",
               "critical", "serious", "acute", "complete"],
    "chronic": ["chronic", "long-standing", "persistent", "recurrent",
                "ongoing", "progressive", "degenerative"],
}

# ── 5. Imaging / Radiology Findings ───────────────────────────────
IMAGING_FINDINGS: dict[str, list[str]] = {
    "x_ray_findings": ["x-ray", "xray", "radiograph", "radiolucent", "radiopaque",
                       "cortical irregularity", "periosteal reaction", "lytic lesion",
                       "sclerotic", "joint space narrowing"],
    "mri_findings": ["mri", "magnetic resonance", "t1 weighted", "t2 weighted",
                     "flair", "signal intensity", "high signal", "low signal",
                     "contrast enhancement", "gadolinium", "disc protrusion"],
    "ct_findings": ["ct scan", "ct", "computed tomography", "hounsfield",
                    "hypodense", "hyperdense", "contrast", "window"],
    "ultrasound_findings": ["ultrasound", "sonography", "echogenic", "anechoic",
                            "hypoechoic", "hyperechoic", "doppler"],
}

# ── 6. Laboratory Markers ─────────────────────────────────────────
LAB_MARKERS: dict[str, list[str]] = {
    "blood_count": ["cbc", "complete blood count", "hemoglobin", "hematocrit",
                    "wbc", "white blood cell", "rbc", "red blood cell",
                    "platelet", "thrombocyte"],
    "inflammatory_markers": ["crp", "c-reactive protein", "esr", "sed rate",
                             "procalcitonin", "ferritin", "il-6", "interleukin"],
    "coagulation": ["pt", "prothrombin time", "inr", "aptt", "ptt",
                    "d-dimer", "fibrinogen", "bleeding time"],
    "metabolic": ["glucose", "blood sugar", "hba1c", "creatinine", "bun",
                  "urea", "electrolytes", "sodium", "potassium", "calcium",
                  "uric acid", "alt", "ast", "bilirubin", "albumin"],
    "cardiac": ["troponin", "ck-mb", "bnp", "nt-probnp", "ldh"],
    "bone": ["alkaline phosphatase", "alp", "calcium", "phosphorus",
             "vitamin d", "parathyroid hormone", "pth", "dexa", "t-score"],
}


def get_all_keywords_flat() -> dict[str, str]:
    """
    Return a flat dictionary mapping every keyword → its category.
    Useful for rapid lookup during text scanning.
    """
    flat: dict[str, str] = {}
    all_dicts = [
        ("body_area", BODY_AREAS),
        ("condition", CONDITIONS),
        ("symptom", SYMPTOMS),
        ("severity", SEVERITY),
        ("imaging", IMAGING_FINDINGS),
        ("lab_marker", LAB_MARKERS),
    ]
    for category_type, category_dict in all_dicts:
        for sub_category, keywords in category_dict.items():
            for kw in keywords:
                flat[kw.lower()] = f"{category_type}:{sub_category}"
    return flat
