// ================== Toggle ==================
function toggle(hdr) {
  const body = hdr.nextElementSibling;
  const icon = hdr.querySelector('.toggle-icon');
  const isOpen = body.classList.toggle('open');

  icon.textContent = isOpen ? '－' : '＋';

  if (isOpen) {
    localStorage.setItem('lastSurah', hdr.innerText);

    // Scroll ناعم
    hdr.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ================== Variables ==================
let surahs = [];
let visible = [];

// ================== Fetch Quran ==================
fetch("https://api.alquran.cloud/v1/quran/quran-uthmani")
  .then(res => res.json())
  .then(data => {
    surahs = data.data.surahs.map(s => ({
      n: s.number,
      name: s.name,
      info: `${s.revelationType === "Meccan" ? "مكية" : "مدنية"} · ${s.ayahs.length} آية`,
      basmala: s.number !== 9,
      ayat: s.ayahs.map(a => a.text)
    }));

    visible = [...surahs];
    render();

    // رجع آخر سورة
    const last = localStorage.getItem('lastSurah');
    if (last) {
      setTimeout(() => {
        document.querySelectorAll('.surah-header').forEach(h => {
          if (h.innerText === last) h.click();
        });
      }, 300);
    }
  });

// ================== Build Nav ==================
const nav = document.getElementById('surahNav');

[...Array(12)].forEach((_, i) => {
  const g = document.createElement('button');
  g.className = 'nav-btn';
  g.textContent = `${i * 10 + 1}–${Math.min(i * 10 + 10, 114)}`;

  g.onclick = () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    g.classList.add('active');

    const start = i * 10 + 1;
    const end = Math.min(i * 10 + 10, 114);

    visible = surahs.filter(s => s.n >= start && s.n <= end);
    render();
  };

  nav.appendChild(g);
});

const allBtn = document.createElement('button');
allBtn.className = 'nav-btn active';
allBtn.textContent = 'الكل';

allBtn.onclick = () => {
  visible = [...surahs];
  render();

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  allBtn.classList.add('active');
};

nav.insertBefore(allBtn, nav.firstChild);

// ================== Render ==================
function render() {
  const list = document.getElementById('surahList');
  list.innerHTML = '';

  visible.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'surah-card';
    card.style.animationDelay = (i * 0.04) + 's';

    const ayatHTML = s.ayat.map((a, idx) =>
      `${a} <span class="ayah-num">${toArabicNum(idx + 1)}</span>`
    ).join(' ');

    card.innerHTML = `
      <div class="surah-header" onclick="toggle(this)">
        <div class="surah-number">${toArabicNum(s.n)}</div>
        <div class="surah-info">
          <span class="surah-name">${s.name}</span>
          <span class="surah-meta">${s.info}</span>
        </div>
        <span class="toggle-icon">＋</span>
      </div>
      <div class="surah-body">
        ${s.basmala ? '<div class="basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : ''}
        <div class="ayat-container">${ayatHTML}</div>
      </div>
    `;

    list.appendChild(card);
  });
}

// ================== Arabic Numbers ==================
function toArabicNum(n) {
  return n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// ================== Search ==================
document.getElementById('search').addEventListener('input', function () {
  const q = this.value.trim();

  visible = q
    ? surahs.filter(s => s.name.includes(q))
    : [...surahs];

  render();
});