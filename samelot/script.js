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
