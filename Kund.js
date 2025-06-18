document.getElementById('birthForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const place = document.getElementById('place').value;

  const resultDiv = document.getElementById('result');
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `
    <h3>Entered Birth Details</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Date of Birth:</strong> ${date}</p>
    <p><strong>Time of Birth:</strong> ${time}</p>
    <p><strong>Place of Birth:</strong> ${place}</p>
    <p style="margin-top: 10px; color: gray;"><em>(Astrological chart generation not yet implemented)</em></p>
  `;
});
