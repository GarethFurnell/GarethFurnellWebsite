# GarethFurnellWebsite

This is my portfolio website showcasing my projects, certifications, and technical documentation.

## 🌐 Live Website

The website is automatically deployed via GitHub Pages and can be accessed at:
- **Main site**: `https://garethfurnell.github.io/GarethFurnellWebsite/`

## 📋 Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Certificates Gallery**: Displays professional certifications and completed courses
- **Video Showcase**: Embedded videos demonstrating projects and skills
- **Documentation Links**: Direct access to technical documentation on Notion
- **Modern UI**: Clean, professional design with smooth animations

## 🚀 Deployment

This website is automatically deployed to GitHub Pages using GitHub Actions:

1. Any push to the `main` or `master` branch triggers the deployment workflow
2. The workflow builds and deploys the site to GitHub Pages
3. Changes are live within a few minutes

### Setting Up GitHub Pages

If you're setting this up for the first time:

1. Go to your repository Settings
2. Navigate to "Pages" in the left sidebar
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
4. The site will automatically deploy on the next push to main/master

## 🛠️ Technologies Used

- HTML5
- CSS3 (with modern features like Grid, Flexbox, and Animations)
- JavaScript (ES6+)
- Font Awesome Icons
- GitHub Pages for hosting
- GitHub Actions for CI/CD

## 📁 Project Structure

```
.
├── index.html          # Main homepage
├── certificates.html   # Certificates gallery page
├── videos.html         # Videos showcase page
├── styles.css          # Main stylesheet
├── script.js           # JavaScript for interactive features
├── certificates/       # Directory containing certificate PDFs
└── .github/
    └── workflows/
        └── static.yml  # GitHub Actions deployment workflow
```

## 🔧 Local Development

To test the website locally:

1. Clone the repository
2. Open `index.html` in your web browser
3. Or use a local server:
   ```bash
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

## 📝 Testing Features

This website serves as a testing ground for:
- Database integration experiments
- API usage demonstrations
- New web technology features
- OpenGL/WebGL projects (planned)

## 📄 License

© 2024 Gareth Furnell. All rights reserved.
