# Building Behavior Next

Behavior Next is based on Behavior3 Editor, but the current project has refactored nearly all major application components around the npm/Vite/Vue/Electron toolchain.

You can build the editor in two different environments: for development and for production. For development you can run a local Vite server that will rebuild and reload automatically after project changes. The production mode builds the web assets and can package the editor as an Electron desktop application.


## Requirements

To run the editor you will need the following softwares:

**required for everything:**
- [NodeJS](https://nodejs.org)

*if you want to run/build the desktop version:*
- Electron is installed through npm optional dependencies


## Configuration

Before building, install the npm dependencies:

    npm install

This installs runtime libraries, Vite build tooling, and desktop packaging dependencies.

The application bundle is built from the ES module entry at `src/main.js`.
This entry keeps the canvas engine and Vue application behind explicit module
imports while preserving the existing `window.b3e`, `window.editor`, and
`startApp()` compatibility globals.


## Building during development

During development you can run the editor in a web browser with automatically building and reloading:

    npm run dev

which will run a web server hosted on `http://127.0.0.1:8000`.

To build the web assets into `build/` without starting a server:

    npm run build


## Building final version

Just run:

    npm run dist

This command builds the web assets and packages the Electron desktop application into `dist/`.
