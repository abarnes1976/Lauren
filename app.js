(() => {
  const cfg = window.LAUREN_CONFIG;
  const form = document.getElementById("noteForm");
  const note = document.getElementById("note");
  const counter = document.getElementById("counter");
  const message = document.getElementById("message");
  const button = document.getElementById("submitButton");

  if (!cfg || cfg.SUPABASE_URL.includes("PASTE_") || cfg.SUPABASE_KEY.includes("PASTE_")) {
    message.textContent = "Site setup is not complete yet.";
    message.className = "message error";
    button.disabled = true;
    return;
  }

  const client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

  note.addEventListener("input", () => {
    counter.textContent = `${note.value.length} / 250`;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    message.className = "message";
    button.disabled = true;
    button.textContent = "Submitting...";

    const password = document.getElementById("password").value;
    const name = document.getElementById("name").value.trim();
    const text = note.value.trim();

    if (!password || !name || !text || text.length > 250) {
      message.textContent = "Please complete all fields. Notes are limited to 250 characters.";
      message.className = "message error";
      button.disabled = false;
      button.textContent = "Submit Note";
      return;
    }

    const { error } = await client.rpc("submit_birthday_note", {
      p_password: password,
      p_name: name,
      p_note: text
    });

    if (error) {
      const wrongPassword = (error.message || "").toLowerCase().includes("invalid birthday password");
      message.textContent = wrongPassword
        ? "That password is not correct."
        : "Your note could not be saved. Please try again.";
      message.className = "message error";
    } else {
      form.reset();
      counter.textContent = "0 / 250";
      message.textContent = "Thank you. Your note for Lauren has been saved.";
      message.className = "message success";
    }

    button.disabled = false;
    button.textContent = "Submit Note";
  });
})();
