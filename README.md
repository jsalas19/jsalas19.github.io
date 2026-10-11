# Joshua Salas Portfolio

A personal portfolio website for Joshua Salas, built as a lightweight static site and hosted on GitHub Pages. The site highlights his background, work experience, education, technical skills, and featured projects in a clean, responsive layout.

## Project description

This project is a custom portfolio website designed to present Joshua's professional profile and software work. It includes:

- A landing page with an introduction, work history, education, and skills
- A project showcase that pulls featured repositories from GitHub
- A dedicated projects page for browsing project details
- A dark/light theme toggle and animated UI effects
- A contact form connected to email submission
- Responsive styling for desktop and mobile viewing

The website is intentionally simple and fast, using plain HTML, CSS, and JavaScript rather than a framework. This keeps it easy to maintain and easy to deploy as a static web page.

## Tech stack

- HTML
- CSS
- JavaScript
- GitHub REST API
- GitHub Pages
- Marked.js for README rendering

## Project structure

```text
.
├── index.html          # Main landing page
├── projects.html       # Project browser page
├── style.css           # Site styling and layout
├── myscripts.js        # Theme, animations, and GitHub fetching logic
├── README.md           # Project overview and usage notes
└── resume.pdf          # Optional resume asset (if included locally)
```

## Features

- Interactive portfolio layout
- Typed headline animation on the home page
- Scroll progress indicator
- Theme switch between dark and light modes
- Dynamic project cards from GitHub repository metadata
- README viewer for selected projects
- Contact section with form submission

## Running locally

Because this is a static website, you can preview it by opening `index.html` directly in a browser, or serve it locally with a simple HTTP server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deployment

This project is designed for GitHub Pages. Push the repository contents to the `main` branch or the configured GitHub Pages branch, then publish the site through the repository settings.


