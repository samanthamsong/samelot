const dateNode = document.querySelector('#date');

function updateCourtDate() {
  const now = new Date();
  dateNode.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

updateCourtDate();

document.querySelectorAll('.practice').forEach((practice) => {
  practice.addEventListener('toggle', () => {
    if (!practice.open) return;
    document.querySelectorAll('.practice').forEach((otherPractice) => {
      if (otherPractice !== practice) otherPractice.open = false;
    });
  });
});

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => button.classList.add('tapped'));
});

const answerField = document.querySelector('#french-answer');
const checkTranslationButton = document.querySelector('#check-translation');
const hintsButton = document.querySelector('#show-hints');
const wordHelp = document.querySelector('#word-help');
const feedback = document.querySelector('#translation-feedback');

const expectedTranslation = 'Chaque matin, je bois du café près de la fenêtre. Je regarde la pluie et j’écris un petit mot à mon ami. Ensuite, je marche jusqu’au marché pour acheter du pain et des fruits.';

function normalizeFrench(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(text, choices) {
  return choices.some((choice) => text.includes(choice));
}

function renderFeedback(content) {
  feedback.innerHTML = content;
  feedback.hidden = false;
  feedback.focus();
}

function checkTranslation() {
  const answer = normalizeFrench(answerField.value);

  if (!answer) {
    renderFeedback('<strong>Write your version first.</strong><p>There is no need for it to be perfect—give the translation your best try, then I’ll help.</p>');
    answerField.focus();
    return;
  }

  const checks = [
    { key: 'chaque matin', label: '<b>“Every morning”</b> → <em>chaque matin</em>', ok: hasAny(answer, ['chaque matin', 'tous les matins']) },
    { key: 'bois', label: '<b>“I drink”</b> → <em>je bois</em> (from <em>boire</em>)', ok: hasAny(answer, ['je bois', 'je prends']) },
    { key: 'fenetre', label: '<b>“by the window”</b> → <em>près de la fenêtre</em> / <em>à la fenêtre</em>', ok: hasAny(answer, ['pres de la fenetre', 'a la fenetre', 'aupres de la fenetre']) },
    { key: 'regarde', label: '<b>“I watch”</b> → <em>je regarde</em>', ok: hasAny(answer, ['je regarde', 'j regarde']) },
    { key: 'pluie', label: '<b>“the rain”</b> → <em>la pluie</em>', ok: answer.includes('pluie') },
    { key: 'ecris', label: '<b>“I write”</b> → <em>j’écris</em>', ok: hasAny(answer, ['j ecris', 'jecris', 'j ecrit']) },
    { key: 'marche', label: '<b>“I walk”</b> → <em>je marche</em>', ok: hasAny(answer, ['je marche', 'j marche', 'je vais a pied']) },
    { key: 'marche', label: '<b>“the market”</b> → <em>le marché</em>', ok: answer.includes('marche') },
    { key: 'acheter', label: '<b>“to buy”</b> → <em>pour acheter</em>', ok: answer.includes('acheter') },
  ];

  const correct = checks.filter((check) => check.ok);
  const missed = checks.filter((check) => !check.ok);
  const score = Math.round((correct.length / checks.length) * 100);
  const encouragement = score >= 80
    ? 'Excellent work—your translation covers nearly all of the key ideas.'
    : score >= 50
      ? 'A strong start. You have several important pieces; now let’s fill in the gaps.'
      : 'Good try. Translating in full sentences is hard, and each missing piece is a useful clue for next time.';

  const missedList = missed.length
    ? `<ul>${missed.map((check) => `<li>${check.label}</li>`).join('')}</ul>`
    : '<p>You found every key phrase this practice checks. Nicely done!</p>';

  renderFeedback(`
    <strong>${score}% of today’s key phrases spotted</strong>
    <p>${encouragement}</p>
    <p><b>Things to review:</b></p>
    ${missedList}
    <details class="model-answer"><summary>Show one possible translation</summary><p>${expectedTranslation}</p></details>
    <p class="feedback-note">This is supportive word-and-phrase feedback, not a full grammar judge—there are many correct ways to translate a paragraph.</p>
  `);
}

if (hintsButton) {
  hintsButton.addEventListener('click', () => {
    wordHelp.hidden = !wordHelp.hidden;
    hintsButton.textContent = wordHelp.hidden ? 'SHOW WORD HELP' : 'HIDE WORD HELP';
  });
}

if (checkTranslationButton) {
  checkTranslationButton.addEventListener('click', checkTranslation);
}

if (answerField) {
  answerField.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') checkTranslation();
  });
}

// ---------- Letterboxd film diary ----------

const LETTERBOXD_USER = 'sammsong';
const LETTERBOXD_RSS = `https://letterboxd.com/${LETTERBOXD_USER}/rss/`;
const RSS2JSON_ENDPOINT = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(LETTERBOXD_RSS)}`;

const yearStatNode = document.querySelector('#films-year-stat');
const latestFilmNode = document.querySelector('#latest-film');
const latestReviewNode = document.querySelector('#latest-review');

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent.trim();
}

// Letterboxd RSS doesn't include a dedicated watchedDate field once routed
// through rss2json, so derive the watch year from pubDate (the review/watch
// timestamp) instead.
async function loadLetterboxd() {
  if (!yearStatNode) return;

  try {
    const res = await fetch(RSS2JSON_ENDPOINT);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.status !== 'ok' || !Array.isArray(data.items)) {
      throw new Error('Unexpected feed response');
    }

    const items = data.items;
    const currentYear = new Date().getFullYear();

    const watchedThisYear = items.filter((item) => {
      return item.pubDate && new Date(item.pubDate.replace(' ', 'T')).getFullYear() === currentYear;
    });

    yearStatNode.innerHTML = `<strong>${watchedThisYear.length}<span>films</span></strong><em>watched in ${currentYear}</em>`;

    const latest = items[0];
    if (latest) {
      const fullTitle = latest.title || '';
      const match = fullTitle.match(/^(.*),\s(\d{4})\s-\s(.*)$/);
      const filmTitle = match ? match[1] : fullTitle;
      const filmYear = match ? match[2] : '';
      const ratingText = match ? match[3] : '';
      const watchedDate = latest.pubDate
        ? new Date(latest.pubDate.replace(' ', 'T')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '';

      if (latestFilmNode) {
        latestFilmNode.innerHTML = `
          <span>most recent</span>
          <strong>${filmTitle}${filmYear ? ` (${filmYear})` : ''}</strong>
          <em>${ratingText}${watchedDate ? ` · watched ${watchedDate}` : ''}</em>
        `;
      }

      const descriptionHtml = latest.description || latest.content || '';
      const reviewText = stripHtml(descriptionHtml).trim();
      // Strip the poster-image alt text / leading whitespace Letterboxd includes; keep the written review only.
      const reviewOnly = reviewText.replace(/^.*?(?=[A-Za-z"'\u2018\u2019])/s, '').trim();

      if (latestReviewNode && reviewOnly) {
        latestReviewNode.textContent = `"${reviewOnly}"`;
      }
    }
  } catch (err) {
    if (yearStatNode) {
      yearStatNode.innerHTML = '<strong>—</strong><em>film diary unavailable right now</em>';
    }
    if (latestFilmNode) {
      latestFilmNode.innerHTML = '<span>most recent</span><strong>Couldn\u2019t load Letterboxd</strong><em></em>';
    }
    console.error('Letterboxd fetch failed:', err);
  }
}

loadLetterboxd();
