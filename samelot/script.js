const dateNode = document.querySelector('#date');
const timeNode = document.querySelector('#time');

function updateCourtClock() {
  const now = new Date();
  dateNode.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  timeNode.textContent = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

updateCourtClock();
setInterval(updateCourtClock, 30000);

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => button.classList.add('tapped'));
});
