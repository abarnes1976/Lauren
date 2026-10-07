(() => {
  const cfg = window.LAUREN_CONFIG;
  const client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY);

  const loginPanel = document.getElementById("loginPanel");
  const adminPanel = document.getElementById("adminPanel");
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const adminMessage = document.getElementById("adminMessage");
  const notesEl = document.getElementById("notes");
  const noteCount = document.getElementById("noteCount");
  let currentNotes = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    })[c]);
  }

  async function loadNotes() {
    adminMessage.textContent = "Loading...";
    const { data, error } = await client
      .from("birthday_notes")
      .select("id,name,note,created_at")
      .order("created_at", { ascending: true });

    if (error) {
      adminMessage.textContent = "Could not load notes: " + error.message;
      return;
    }

    currentNotes = data || [];
    noteCount.textContent = currentNotes.length;
    notesEl.innerHTML = currentNotes.map((n, i) => `
      <article class="note-card">
        <div class="note-number">${i + 1}</div>
        <div class="note-text">“${esc(n.note)}”</div>
        <div><span class="note-name">— ${esc(n.name)}</span>
          <span class="note-date">${new Date(n.created_at).toLocaleString()}</span>
        </div>
      </article>
    `).join("");
    adminMessage.textContent = "";
  }

  function showAdmin(show) {
    loginPanel.hidden = show;
    adminPanel.hidden = !show;
    if (show) loadNotes();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMessage.textContent = "Signing in...";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("adminPassword").value;
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      loginMessage.textContent = "Sign in failed.";
    } else {
      loginMessage.textContent = "";
      showAdmin(true);
    }
  });

  document.getElementById("refreshButton").onclick = loadNotes;
  document.getElementById("printButton").onclick = () => window.print();

  document.getElementById("signOutButton").onclick = async () => {
    await client.auth.signOut();
    showAdmin(false);
  };

  document.getElementById("csvButton").onclick = () => {
    const q = v => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const rows = [["Number","Name","Note","Submitted"]]
      .concat(currentNotes.map((n,i) => [i+1,n.name,n.note,n.created_at]));
    const csv = rows.map(r => r.map(q).join(",")).join("\r\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lauren-50th-birthday-notes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  client.auth.getSession().then(({data}) => showAdmin(!!data.session));
})();
