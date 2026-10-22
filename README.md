# Suburbia Park

Community app for the Suburbia Park neighborhood in Huntington Beach, California.  Works in any browser and installs to the Home Screen on iPhone and Android.

## Turning on neighbor sign-in and live posting

Until these steps are done, the site runs in preview mode: sample notices and events, and forms that email community@suburbiapark.com.

1. Create a free project at supabase.com.
2. Open SQL Editor, paste the whole `supabase/schema.sql` file, and click Run.
3. Add every Suburbia Park street: Table Editor, then `streets` (or the admin page once you're an admin).
4. Authentication, URL Configuration: set the Site URL to `https://suburbiapark.com` and add `https://suburbiapark.com/account.html` to the redirect URLs.
5. Authentication, Emails, SMTP Settings: connect an email sending service such as Resend, Brevo, Postmark or Amazon SES, sending from an address like no-reply@suburbiapark.com.  Supabase's built-in sender only reaches your own team's addresses, about 2 emails an hour.  Don't use the Microsoft 365 mailbox here: Supabase signs in to SMTP with a username and password, and Microsoft is retiring that kind of sign-in for Exchange Online.
6. Project Settings, API: copy the Project URL and the publishable key (older projects call it the anon public key) into `assets/js/config.js`.
7. Sign up on the site with your own address, then run this once in SQL Editor with your email:
   `update public.profiles set status = 'approved', is_admin = true where id = (select id from auth.users where email = 'YOUR EMAIL');`
8. Open `admin.html` to approve neighbors, review reports, and add streets.

## Editing sample content

`assets/js/data.js` holds the preview events and notices.  They are not shown once the database is connected.
