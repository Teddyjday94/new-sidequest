# Sidequest Creative

A standalone portfolio site for Sidequest Creative. It uses plain HTML, CSS, and JavaScript, so there is no install or build step.

## Preview it

Open `index.html` directly, or serve this folder with any local web server. All project images are stored in `assets/projects`.

## Put it on Vercel

Create a new Vercel project and select this `sidequest-creative` folder as the project root. The default static-site settings are enough; no build command or output-directory setting is required.

## Inquiry form

The form sends inquiries to `thomasdbiz26@gmail.com` through FormSubmit. The first real submission triggers a FormSubmit activation email. Open that email and confirm the form once; submissions will then arrive normally.

The form was validated locally without sending a live inquiry.

## Update a project

1. Replace the matching `.webp` file in `assets/projects`.
2. Update the project title, description, or link in `index.html` if needed.
3. Keep screenshots at a wide 8:5 ratio for the cleanest card crop.

## Main files

- `index.html` — content, links, metadata, and form
- `styles.css` — layout, colors, responsive design, and motion
- `app.js` — mobile navigation, form feedback, reveals, and the 3D chrome object
- `og.png` — social-sharing preview image
