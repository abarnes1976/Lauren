# Lauren's 50th Birthday Notes

A static GitHub Pages site backed by Supabase.

## What it does

- Shared guest password is checked on the Supabase server, not stored in GitHub.
- Guests enter their name and a note of up to 250 characters.
- Guests can submit notes but cannot read any notes.
- Admin signs in through Supabase Auth.
- Admin can view notes, download CSV, and print a keepsake-style page.
- The included `CNAME` file configures the site for `lauren.desimonereunion.com`.

## 1. Create the Supabase database

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Open `supabase-setup.sql` from this folder.
4. Replace `CHANGE_THIS_BIRTHDAY_PASSWORD` with the shared password you want guests to use.
5. Run the complete SQL script.

The script enables Row Level Security and deliberately removes direct anonymous access to the notes table. The only public database operation is the `submit_birthday_note` function.

## 2. Create your admin login

In Supabase:

1. Go to **Authentication > Users**.
2. Create/add a user for yourself using your email address and an admin password.
3. This is separate from the shared birthday-page password.

IMPORTANT: As written, *any* Supabase Auth user in this project can read the notes. For a dedicated project where you create only your own account, this is appropriate and simple.

## 3. Add the Supabase browser configuration

In Supabase, find the project's API connection information (Project URL and browser-safe Publishable key / legacy anon key).

Edit `config.js`:

```js
window.LAUREN_CONFIG = {
  SUPABASE_URL: "https://YOUR_PROJECT_REF.supabase.co",
  SUPABASE_KEY: "YOUR_PUBLISHABLE_OR_ANON_KEY"
};
```

The publishable/anon key is intended for browser use when Row Level Security is configured. **Never put the `service_role` key or any secret key in GitHub.**

## 4. Put the site in GitHub

The cleanest arrangement is a separate GitHub repository, for example:

`lauren-50th`

Upload all files in this folder to the root of that repository.

Then:

1. GitHub repository > **Settings > Pages**
2. Under Build and deployment, publish from your main branch/root (or your normal Pages workflow).
3. Under **Custom domain**, enter:

`lauren.desimonereunion.com`

4. Save.
5. After DNS is working and GitHub offers it, turn on **Enforce HTTPS**.

The included `CNAME` file already contains `lauren.desimonereunion.com`.

## 5. GoDaddy CNAME record

In GoDaddy, open DNS for `desimonereunion.com` and add:

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name | `lauren` |
| Value | `YOUR-GITHUB-USERNAME.github.io` |
| TTL | Default / 1 hour |

**The target is your GitHub Pages account hostname, NOT the repository URL and NOT `desimonereunion.com`.**

Example: if your GitHub username is `anthonybarnes`, the record is:

`CNAME  lauren  anthonybarnes.github.io`

GitHub specifically instructs custom subdomains to point directly to `<username>.github.io` or `<organization>.github.io`, without the repository name.

I cannot safely fill in the final target without your actual GitHub username/organization. Look at the URL of the GitHub repository that hosts the page. If it is:

`github.com/USERNAME/repository-name`

then your CNAME target is:

`USERNAME.github.io`

If the repository belongs to a GitHub organization, use the organization name instead.

Do not disturb the existing DNS records for `desimonereunion.com`; this new `lauren` CNAME is independent.

## 6. Test before inviting people

Visit:

`https://lauren.desimonereunion.com/`

Test:
- wrong guest password is rejected;
- correct password + name + note submits;
- a note longer than 250 characters cannot be entered;
- a guest cannot see submitted notes.

Then visit:

`https://lauren.desimonereunion.com/admin.html`

Sign in with the Supabase Auth admin user. Confirm that you can:
- see the test note;
- download the CSV;
- print the notes.

## Changing the shared guest password later

Run this in Supabase SQL Editor, replacing the password:

```sql
update public.birthday_settings
set password_hash = crypt('YOUR_NEW_PASSWORD', gen_salt('bf'))
where singleton = true;
```

## Files

- `index.html` — guest page
- `styles.css` — guest styling
- `app.js` — submission logic
- `admin.html` — admin/print page
- `admin.css` — admin and print styling
- `admin.js` — login, note display, CSV and print
- `config.js` — your Supabase URL and publishable/anon key
- `supabase-setup.sql` — database, password checking, permissions, RLS
- `CNAME` — GitHub Pages custom-domain declaration
