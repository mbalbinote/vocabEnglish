var GEMINI_MODEL = "gemini-2.0-flash";
var LS_KEY = "gvt_key";

// ── Storage helpers ───────────────────────────
function lsGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch(e) {} }
function lsDel(k)  { try { localStorage.removeItem(k); } catch(e) {} }

// ── Word list ─────────────────────────────────
var WORDS = [
  "the","be","to","of","and","a","in","that","have","it","for","not","on","with","he",
  "as","you","do","at","this","but","his","by","from","they","we","say","her","she","or",
  "an","will","my","one","all","would","there","their","what","so","up","out","if","about",
  "who","get","which","go","me","when","make","can","like","time","no","just","him","know",
  "take","people","into","year","your","good","some","could","them","see","other","than",
  "then","now","look","only","come","its","over","think","also","back","after","use","two",
  "how","our","work","first","well","way","even","new","want","because","any","these","give",
  "day","most","us","great","between","need","large","often","hand","high","place","hold",
  "turn","long","life","few","north","open","seem","together","next","white","children",
  "begin","got","walk","example","paper","group","always","music","those","both","book",
  "letter","until","river","car","care","second","enough","girl","young","ready","above",
  "ever","red","list","though","feel","talk","bird","soon","body","dog","family","direct",
  "leave","song","door","product","black","short","class","wind","question","happen",
  "complete","ship","area","half","rock","order","fire","south","problem","piece","told",
  "knew","pass","since","top","whole","king","space","heard","best","hour","better","true",
  "during","hundred","five","remember","step","early","west","ground","interest","reach",
  "fast","sing","listen","six","table","travel","less","morning","ten","simple","several",
  "toward","war","lay","against","pattern","slow","center","love","person","money","serve",
  "appear","road","map","rain","rule","pull","cold","notice","voice","unit","power","town",
  "fine","drive","warm","lead","beautiful","mouth","age","arm","deep","plan","figure","star",
  "box","field","rest","able","done","stood","contain","front","teach","week","final","gave",
  "green","quick","develop","ocean","free","minute","strong","special","mind","behind",
  "clear","produce","fact","street","multiply","nothing","course","stay","wheel","full",
  "force","blue","object","decide","surface","moon","island","foot","system","busy","test",
  "record","boat","common","gold","possible","plane","dry","wonder","laugh","ago","ran",
  "check","game","shape","hot","miss","brought","heat","snow","bring","yes","fill","east",
  "paint","language","among","grand","ball","yet","wave","drop","heart","present","heavy",
  "dance","engine","position","wide","sail","material","size","vary","settle","speak",
  "weight","general","ice","matter","circle","pair","include","divide","felt","perhaps",
  "pick","sudden","count","square","reason","length","represent","art","subject","region",
  "energy","hunt","bed","brother","egg","ride","cell","believe","forest","sit","race",
  "window","store","summer","train","sleep","prove","leg","exercise","wall","catch","wish",
  "sky","board","joy","winter","written","wild","kept","glass","grass","cow","job","edge",
  "sign","visit","past","soft","fun","bright","gas","weather","month","million","bear",
  "finish","happy","hope","flower","strange","gone","jump","baby","eight","village","meet",
  "root","buy","raise","solve","metal","whether","push","seven","third","shall","held",
  "hair","describe","cook","floor","either","result","burn","hill","safe","cat","century",
  "consider","type","law","bit","coast","copy","phrase","silent","tall","sand","soil","roll",
  "temperature","finger","industry","value","fight","lie","beat","natural","view","sense",
  "ear","else","quite","case","middle","son","lake","moment","scale","loud","spring",
  "observe","child","straight","nation","milk","speed","method","pay","section","dress",
  "cloud","surprise","quiet","stone","tiny","climb","cool","design","poor","lot","experiment",
  "bottom","key","iron","single","stick","flat","twenty","skin","smile","hole","trade",
  "melody","trip","office","receive","row","exact","symbol","die","least","trouble","shout",
  "except","wrote","seed","tone","join","suggest","clean","break","yard","rise","bad","blow",
  "oil","blood","touch","grew","cent","mix","team","wire","cost","lost","brown","wear",
  "garden","equal","sent","choose","fell","fit","flow","fair","bank","collect","save",
  "control","gentle","woman","captain","practice","separate","difficult","doctor","please",
  "protect","whose","locate","ring","character","caught","period","indicate","radio","atom",
  "human","history","effect","electric","expect","crop","modern","element","hit","student",
  "corner","party","supply","bone","imagine","provide","agree","capital","rather","band",
  "especially","master","publish","block","thick","spell","hat","share","support","build",
  "start","light","run","keep","last","stop","left","show","try","call","write","lose",
  "include","continue","set","learn","change","lead","understand","watch","follow","create",
  "spend","grow","win","offer","remember","love","consider","buy","wait","send","fall","cut",
  "remain","suggest","report","decide","pull","read"
];

var SENTENCE_TYPES = [
  { id: "affirmative",   label: "Afirmação",    labelEn: "Affirmative sentence", badgeClass: "badge badge-green" },
  { id: "negative",      label: "Negação",      labelEn: "Negative sentence",    badgeClass: "badge badge-red" },
  { id: "interrogative", label: "Interrogação", labelEn: "Question",             badgeClass: "badge badge-violet" }
];

// ── State ─────────────────────────────────────
var apiKey = lsGet(LS_KEY) || "";
var currentWord = "";
var currentType = null;
var submitted = false;

// ── DOM refs ──────────────────────────────────
var modal           = document.getElementById("modal");
var keyInput        = document.getElementById("keyInput");
var keyError        = document.getElementById("keyError");
var saveBtn         = document.getElementById("saveBtn");
var appEl           = document.getElementById("app");
var changeKeyBtn    = document.getElementById("changeKeyBtn");
var wordDisplay     = document.getElementById("wordDisplay");
var badgeDisplay    = document.getElementById("badgeDisplay");
var instructionText = document.getElementById("instructionText");
var hintArea        = document.getElementById("hintArea");
var sentenceInput   = document.getElementById("sentenceInput");
var submitBtn       = document.getElementById("submitBtn");
var nextBtn         = document.getElementById("nextBtn");
var feedbackArea    = document.getElementById("feedbackArea");

// ── Helpers ───────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parseJSON(raw) {
  try { return JSON.parse(raw); } catch(e) {
    var m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch(e2) {} }
    return null;
  }
}

// ── Modal ─────────────────────────────────────
function openModal() {
  modal.style.display = "flex";
  appEl.style.display = "none";
  setTimeout(function() { keyInput.focus(); }, 100);
}

function closeModal() {
  modal.style.display = "none";
  appEl.style.display = "flex";
}

saveBtn.addEventListener("click", function() {
  var k = keyInput.value.trim();
  if (!k) { keyError.textContent = "Cole a chave antes de continuar."; return; }
  keyError.textContent = "";
  apiKey = k;
  lsSet(LS_KEY, k);
  closeModal();
  newRound();
});

keyInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") saveBtn.click();
});

changeKeyBtn.addEventListener("click", function() {
  lsDel(LS_KEY);
  apiKey = "";
  keyInput.value = "";
  keyError.textContent = "";
  openModal();
});

// ── Game ──────────────────────────────────────
function newRound() {
  currentWord = pick(WORDS);
  currentType = pick(SENTENCE_TYPES);
  submitted = false;

  wordDisplay.textContent = currentWord;
  badgeDisplay.innerHTML = '<span class="' + currentType.badgeClass + '">' + currentType.label + '</span>';
  instructionText.textContent = 'Escreva uma frase em inglês usando a palavra acima como ' + currentType.label.toLowerCase() + '.';

  sentenceInput.value = "";
  sentenceInput.disabled = false;
  sentenceInput.placeholder = 'Escreva sua frase em inglês (' + currentType.label.toLowerCase() + ')...';

  submitBtn.style.display = "flex";
  submitBtn.disabled = false;
  submitBtn.innerHTML = "Enviar frase";
  nextBtn.style.display = "none";
  feedbackArea.innerHTML = "";

  hintArea.innerHTML = '<button class="btn btn-outline" id="hintBtn">💡 Ver dica de uso</button>';
  document.getElementById("hintBtn").addEventListener("click", handleHint);

  setTimeout(function() { sentenceInput.focus(); }, 50);
}

// ── API ───────────────────────────────────────
function callGemini(systemPrompt, userPrompt) {
  return fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + apiKey,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 1024 }
      })
    }
  ).then(function(res) {
    return res.json().then(function(data) {
      if (!res.ok) throw new Error(data.error && data.error.message ? data.error.message : "API error " + res.status);
      return data.candidates[0].content.parts[0].text;
    });
  });
}

// ── Submit ────────────────────────────────────
submitBtn.addEventListener("click", handleSubmit);
document.addEventListener("keydown", function(e) {
  if (e.ctrlKey && e.key === "Enter") handleSubmit();
});

function handleSubmit() {
  var text = sentenceInput.value.trim();
  if (!text || submitted) return;
  submitted = true;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner">⏳</span> Validando...';

  var system = "You are an English language teacher evaluating sentences written by intermediate Brazilian learners.\n" +
    "You will receive: the target word, the required sentence type, and the student's sentence.\n" +
    "Respond ONLY with a valid JSON object (no markdown, no extra text) with these fields:\n" +
    "- \"correct\": string in PT-BR + EN explaining what is right (be specific and encouraging)\n" +
    "- \"improve\": string in PT-BR + EN explaining grammar issues, wrong usage of the word, or wrong sentence type — leave empty string \"\" if nothing to improve\n" +
    "- \"corrected\": a corrected/improved version of the sentence, or \"\" if it's already good\n" +
    "All explanations should be accessible to an intermediate learner. Be direct and concise.";

  var user = 'Target word: "' + currentWord + '"\nRequired type: ' + currentType.labelEn + '\nStudent\'s sentence: "' + text + '"';

  callGemini(system, user)
    .then(function(raw) {
      var parsed = parseJSON(raw) || { correct: "", improve: raw, corrected: "" };
      renderFeedback(parsed);
    })
    .catch(function(e) {
      renderFeedback({ correct: "", improve: "Erro ao conectar com a IA: " + e.message, corrected: "" });
    })
    .finally(function() {
      sentenceInput.disabled = true;
      submitBtn.style.display = "none";
      nextBtn.style.display = "flex";
    });
}

function renderFeedback(obj) {
  var correct   = obj.correct   || "";
  var improve   = obj.improve   || "";
  var corrected = obj.corrected || "";
  var html = '<div class="feedback-block">';
  if (correct)   html += '<div class="fb-item fb-correct"><div class="fb-label">✓ O que está certo / What\'s right</div><div class="fb-text">' + escHtml(correct) + '</div></div>';
  if (improve)   html += '<div class="fb-item fb-improve"><div class="fb-label">↑ O que pode melhorar / What to improve</div><div class="fb-text">' + escHtml(improve) + '</div></div>';
  if (corrected) html += '<div class="fb-item fb-corrected"><div class="fb-label">✎ Sugestão corrigida / Suggested correction</div><div class="fb-text">"' + escHtml(corrected) + '"</div></div>';
  html += '</div>';
  feedbackArea.innerHTML = html;
  feedbackArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ── Hint ──────────────────────────────────────
function handleHint() {
  var btn = document.getElementById("hintBtn");
  if (!btn) return;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner">⏳</span> Carregando dica...';

  var system = "You are a friendly English teacher helping intermediate Brazilian learners.\n" +
    "When given a word, provide a helpful usage tip in a mix of PT-BR and English.\n" +
    "Respond ONLY with a valid JSON object with:\n" +
    "- \"tip\": 2-3 sentences about how natives use this word in real life (register, collocations, common contexts)\n" +
    "- \"examples\": array of 3 short natural example sentences\n" +
    "- \"phrasal\": array of 1-2 related phrasal verbs or common expressions (or empty array if none relevant)\n" +
    "Keep it natural, practical, and at B1-B2 level.";

  callGemini(system, 'Word: "' + currentWord + '"')
    .then(function(raw) {
      var parsed = parseJSON(raw) || { tip: raw, examples: [], phrasal: [] };
      renderHint(parsed);
    })
    .catch(function(e) {
      hintArea.innerHTML = '<div class="hint-card"><div class="fb-label" style="color:#5b21b6">💡 Dica</div><p class="hint-tip">Erro: ' + escHtml(e.message) + '</p></div>';
    });
}

function renderHint(obj) {
  var tip      = obj.tip      || "";
  var examples = obj.examples || [];
  var phrasal  = obj.phrasal  || [];
  var html = '<div class="hint-card"><div class="fb-label" style="color:#5b21b6">💡 Dica de uso / Usage tip</div><p class="hint-tip">' + escHtml(tip) + '</p>';
  if (examples.length) {
    html += '<div class="hint-section-label">Exemplos naturais:</div><ul class="hint-examples">';
    for (var i = 0; i < examples.length; i++) html += '<li>• "' + escHtml(examples[i]) + '"</li>';
    html += '</ul>';
  }
  if (phrasal.length) {
    html += '<div class="hint-section-label">Expressões relacionadas:</div><div class="hint-tags">';
    for (var j = 0; j < phrasal.length; j++) html += '<span class="hint-tag">' + escHtml(phrasal[j]) + '</span>';
    html += '</div>';
  }
  html += '</div>';
  hintArea.innerHTML = html;
}

nextBtn.addEventListener("click", newRound);

// ── Boot ──────────────────────────────────────
if (apiKey) { closeModal(); newRound(); } else { openModal(); }
