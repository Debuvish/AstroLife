document.getElementById('birthForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const place = document.getElementById('place').value;

  // Static / mock Kundli data for demo
  const kundli = {
    ascendant: "Leo",
    moonSign: "Scorpio",
    sunSign: "Aries",
    nakshatra: "Anuradha",
    planets: {
      Sun: 1,
      Moon: 6,
      Mars: 4,
      Mercury: 8,
      Jupiter: 10,
      Venus: 12,
      Saturn: 7,
      Rahu: 5,
      Ketu: 11
    }
  };

  const planetHouses = Array(13).fill("").map(() => []);
  for (const [planet, house] of Object.entries(kundli.planets)) {
    planetHouses[house].push(planet);
  }

  const northIndianOrder = [9, 10, 11, 12, 8, 1, 2, 3, 7, 6, 5, 4];

  const chartHTML = `
    <div class="chart-grid">
      ${northIndianOrder.map((houseNum, idx) => {
        if (idx === 5) {
          return `<div class="box center-box">
                    <div><strong>Ascendant</strong></div>
                    <div>${kundli.ascendant}</div>
                  </div>`;
        }
        return `<div class="box">
                  <div class="planet-box">
                    ${planetHouses[houseNum].map(p => `<span>${p}</span>`).join('')}
                  </div>
                </div>`;
      }).join('')}
    </div>
  `;

  const resultDiv = document.getElementById('result');
  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = `
    <h2>📜 Birth Chart for ${name}</h2>
    <p><strong>📅 Date:</strong> ${date}</p>
    <p><strong>⏰ Time:</strong> ${time}</p>
    <p><strong>📍 Place:</strong> ${place}</p>
    <hr>
    <ul style="list-style:none; padding:0;">
      <li>🌞 <strong>Sun Sign:</strong> ${kundli.sunSign}</li>
      <li>🌙 <strong>Moon Sign:</strong> ${kundli.moonSign}</li>
      <li>🌄 <strong>Ascendant:</strong> ${kundli.ascendant}</li>
      <li>✨ <strong>Nakshatra:</strong> ${kundli.nakshatra}</li>
    </ul>
    <h3>🗺️ North Indian Chart</h3>
    ${chartHTML}
  `;
});
