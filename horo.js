// ----- config -----
const signs = [
  "aries","taurus","gemini","cancer","leo","virgo",
  "libra","scorpio","sagittarius","capricorn","aquarius","pisces"
];
// Fallback sentences if API fails (at least 31 for every day of month)
const fallback = [
  "Fresh energy surrounds you—use it!", "Small steps lead to big gains today.",
  "Connect with an old friend; insight follows.", "Trust your intuition—it’s on point.",
  "A surprise opportunity knocks. Say yes.", "Focus brings rewards—ignore distractions.",
  "Share your ideas; they’ll be well‑received.", "Self‑care boosts your confidence.",
  "Patience turns the tide in your favor.", "Embrace change; growth is near.",
  "Kind words open unexpected doors.", "Creative sparks fly—capture them.",
  "Balance work and play for harmony.", "Listen closely; hidden gems appear.",
  "Your perseverance pays off today.", "Let go of control—flow instead.",
  "Teamwork magnifies your talents.", "A bold move sets you apart.",
  "Clarity arrives after quiet reflection.", "Celebrate small wins; momentum builds.",
  "Learning something new excites you.", "A lucky coincidence appears—follow it.",
  "Generosity returns ten‑fold.", "Step outside comfort zones, thrive.",
  "Organize finances; relief follows.", "Honesty deepens key relationships.",
  "Adventure whispers—answer the call.", "Your laughter heals others today.",
  "Seek beauty in routine tasks.", "Humility attracts powerful allies.",
  "End the day with gratitude."
];

// ----- helpers -----
const today = new Date();
document.getElementById("today").textContent =
  today.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

function deterministicFallback(sign) {
  // repeatable message based on date & sign length
  const idx = (today.getDate() + sign.length) % fallback.length;
  return fallback[idx];
}

// ----- main logic -----
async function fetchHoroscope(sign) {
  try {
    const resp = await fetch(
      `https://aztro.sameerkumar.website/?sign=${sign}&day=today`,
      { method: "POST" }
    );
    if (!resp.ok) throw new Error("API error");
    const data = await resp.json();
    return data.description;            // ⬅️ main text
  } catch (err) {
    return deterministicFallback(sign); // graceful fallback
  }
}

async function render() {
  const container = document.getElementById("horoscopeContainer");

  for (const sign of signs) {
    // card skeleton
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <i class='bx bx-star'></i>
      <div>
        <h3>${sign}</h3>
        <p>Loading...</p>
      </div>`;
    container.appendChild(card);

    // fetch + inject text
    const text = await fetchHoroscope(sign);
    card.querySelector("p").textContent = text;
  }
}

document.addEventListener("DOMContentLoaded", render);
