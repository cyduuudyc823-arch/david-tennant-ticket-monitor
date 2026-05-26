const labels = {
  tickets_found: "Tickets found",
  no_trusted_tickets: "No trusted tickets found",
  check_error: "Check error"
};

const sourceLabels = {
  tickets_found: "Tickets found",
  no_trusted_tickets: "No trusted tickets",
  check_error: "Check error"
};

function text(value, fallback = "Not shown") {
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  return value || fallback;
}

function sourceClass(source) {
  if (source.available) return "source source-found";
  if (source.status === "check_error") return "source source-error";
  return "source";
}

async function loadStatus() {
  const response = await fetch("./status.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`status.json failed: ${response.status}`);
  return response.json();
}

function render(status) {
  const overall = document.querySelector("#overall");
  overall.className = `status-card ${
    status.overall === "tickets_found"
      ? "status-found"
      : status.overall === "check_error"
        ? "status-error"
        : ""
  }`;
  overall.innerHTML = `
    <strong>${labels[status.overall] ?? "Unknown status"}</strong>
    <span>${status.event.performer} · ${status.event.show}</span>
  `;

  document.querySelector("#checked-at").textContent = status.checkedAtLondon || "Not checked yet";

  const sources = document.querySelector("#sources");
  sources.innerHTML = status.sources
    .map(
      (source) => `
        <article class="${sourceClass(source)}">
          <span class="pill">${sourceLabels[source.status] ?? source.status}</span>
          <h2>${source.name}</h2>
          <p class="details">Type: ${source.kind}</p>
          <p class="details">Prices: ${text(source.prices)}</p>
          <p class="details">Quantity/seats: ${text(source.quantities)}</p>
          <p class="details">${text(source.notes, "No notes")}</p>
          <a href="${source.url}" rel="noreferrer">Open source</a>
        </article>
      `
    )
    .join("");
}

loadStatus()
  .then(render)
  .catch((error) => {
    document.querySelector("#overall").className = "status-card status-error";
    document.querySelector("#overall").innerHTML = `<strong>Check error</strong><span>${error.message}</span>`;
  });
