# How this project was built: a beginner's walkthrough

This document explains what I implemented, the main commands I ran, and how you can work with the project. The initial implementation and its recorded checks were completed on **17 October 2026**.

The command history below covers the important setup, development, and verification steps. It summarizes repeated commands and temporary debugging scripts rather than reproducing every terminal output.

## 1. What we built

The Scientific Time-Series Explorer is a small website for the SEDS 513 HCI course. It lets a student:

1. Choose two different cities from İzmir, Ankara, and İstanbul.
2. Choose a start date and an end date within 2025.
3. Select **Apply dates** and compare both cities on one chart.
4. Inspect individual dates or open **View daily values** to read a table.
5. Select **Reset all** to start again.

The city fields start empty. Selecting both cities displays the comparison. Changing a city updates it immediately, while editing dates requires **Apply dates**.

**The temperatures are synthetic:** a program invented them using a repeatable mathematical procedure. They are not real weather observations. The interface says this visibly so students do not mistake the prototype for a weather-data service.

All application logic runs in the browser. We did not add an application backend, database, accounts, or a weather API. An API is a way for one program to request information or actions from another service.

## 2. What each tool does

| Tool | Its job in this project |
| --- | --- |
| **Node.js** | Runs development tools and the data generator on your computer. The project uses Node.js 24 or newer. |
| **npm** | Installs JavaScript packages and runs the commands defined in `package.json`. A package is reusable code distributed for other projects to use. |
| **React** | Builds the interface from components: functions that describe pieces of the screen. |
| **TypeScript** | Checks the kinds of values our code uses, such as city names, date strings, and temperature numbers. |
| **Vite** | Starts the local development server and creates the browser-ready production build. |
| **Tailwind CSS v4** | Supplies styling utilities and supports the shared design tokens. A token is a named design value, such as the main text color. |
| **shadcn/ui** | Provides source code for controls and tables that we can keep and edit inside this project. |
| **Base UI** | Supplies behavior used by some of the shadcn components. It was installed as part of that setup. |
| **Recharts** | Draws the temperature lines, axes, and shared tooltip. A tooltip is the small readout shown when you inspect a chart date. |
| **Vitest** | Runs automated checks of the data and small helper functions. |
| **Playwright** | Opens a real browser and tests interactions such as choosing cities and applying dates. |
| **axe-core** | Checks the rendered interface for accessibility problems that can be detected automatically. |
| **Oxlint** | Checks code for certain programming mistakes and suspicious patterns. |

You do not need to learn every tool before running the application. Start with the run instructions in section 8, then follow the file explanations below.

## 3. The initial inspection

Before writing application code, I inspected the directory and available instructions. Some of the commands were:

```sh
pwd
ls -la
rg --files --hidden
git status --short --branch
node --version
npm --version
```

| Command | Meaning |
| --- | --- |
| `pwd` | Print the current directory: the folder the terminal is working in. |
| `ls -la` | List files and folders, including hidden entries whose names start with a dot. |
| `rg --files --hidden` | List searchable files, including hidden project files. I also used exclusion options to keep large/generated directories out of results. |
| `git status --short --branch` | Ask Git about the repository and changed files. At initialization, Git did not recognize the directory as an initialized repository. |
| `node --version` | Check the installed Node.js version. |
| `npm --version` | Check the installed npm version. |

There was no application code or `package.json` at the start. There were installed agent skills, a skill lockfile, and ZCode links to the same skills. I read relevant local skill instructions for React, styling, charts, and testing.

The current root `AGENTS.md` provides repository guidelines. It was absent during the initial implementation and has since been supplied. It contains instructions for development tools and contributors; it is not application code.

I preserved the existing skill files. I did not initialize Git, make a commit, or push changes.

## 4. Setup commands I ran

These are historical setup steps. **You do not need to repeat this section to run the existing project.** Use section 8 instead.

### Examine a React and TypeScript starting template

I ran this from `/tmp`, a directory used for temporary work:

```sh
npm create vite@latest seds513-vite-scaffold -- --template react-ts --no-interactive
```

This downloaded the Vite project initializer and created a temporary React/TypeScript example. I inspected its configuration, then wrote the application files in our project directory. I did not run a replacement scaffold over the existing project folder.

In this command:

- `npm create` runs a project initializer.
- `vite@latest` chooses the Vite initializer available at setup time.
- `seds513-vite-scaffold` names the temporary folder.
- The first `--` passes the following options to the initializer.
- `--template react-ts` selects React with TypeScript.
- `--no-interactive` runs without an interactive setup questionnaire.

### Install the application and test packages

After creating our `package.json`, I ran:

```sh
npm install recharts tailwindcss @tailwindcss/vite
npm install -D vitest @playwright/test @axe-core/playwright
```

The first command installed chart and styling packages. It also installed the dependencies already declared in `package.json`, including React and the Vite build tools.

The second command added testing tools. `-D` means “save as a development dependency”: a tool used to develop or check the application. These tools do not run in the student's browser.

The installation created `package-lock.json`. That file records the resolved package versions, including packages required by other packages. Keep it with the project so installations can be reproduced.

### Configure shadcn and add the controls

The important CLI commands were:

```sh
npx --yes shadcn@latest init --help
npx --yes shadcn@latest init --base base --preset nova --no-monorepo --yes
npx --yes shadcn@latest info --json
npx --yes shadcn@latest docs field native-select input button table
npx --yes shadcn@latest add @shadcn/field @shadcn/native-select @shadcn/input @shadcn/button @shadcn/table --yes
```

`npx` runs a package's command-line tool, downloading it when needed. `--yes` accepts the command's standard prompts. I used it after the setup and dependency choices were approved.

These commands did the following:

1. Displayed the CLI's supported options.
2. Configured shadcn for our project using Base UI and the Nova preset.
3. Reported the detected project configuration.
4. Returned official documentation links for the chosen components, which I read before using them.
5. Added the component source files to `src/components/ui/`.

The `@shadcn/` prefix selects the official component registry. A registry is a source from which the CLI downloads component definitions.

Field also needed Label and Separator, so those source files were added automatically. I adapted the controls to provide 44px heights, consistent focus styling, and the approved visual design.

### Remove unused setup packages

The initializer added a font package, animation styles, and its own CLI package. After adapting the styles and copying in the components, those packages were unnecessary for this application. I ran:

```sh
npm uninstall @fontsource-variable/geist tw-animate-css
npm uninstall shadcn
```

The application uses system fonts, and its charts do not animate. Removing the CLI package does not remove the shadcn source components we already added. The styles also no longer import CSS from that package.

### Setup difficulties and their fixes

- The first download attempt failed with `EAI_AGAIN`, a network/name-resolution error in the restricted execution environment. I retried with the network access needed for the approved installation.
- An initial CLI attempt used `--preset base-nova`. The CLI rejected that argument, so I used the supported `--preset nova` together with `--base base`. The resulting `components.json` legitimately records the combined style name `base-nova`.
- The execution sandbox initially blocked opening the local test-server port. I ran the local-server commands with the required execution permission.

Some installation commands used the prefix `npm_config_cache=/tmp/seds513-npm-cache` to put npm's download cache in a temporary folder. That prefix is specific to the execution environment and is not needed for normal use of this project.

## 5. The main files I created

### Files you will probably read first

| File | What to look for |
| --- | --- |
| [`../src/App.tsx`](../src/App.tsx) | The main screen, city selections, applied dates, and reset behavior. |
| [`../src/components/CityPairControls.tsx`](../src/components/CityPairControls.tsx) | The two city dropdowns and disabled duplicate options. |
| [`../src/components/DateRangeForm.tsx`](../src/components/DateRangeForm.tsx) | Draft dates, errors, the Apply dates action, and focus handling. |
| [`../src/components/ComparisonPanel.tsx`](../src/components/ComparisonPanel.tsx) | Choosing between guidance and the comparison; the applied summary. |
| [`../src/components/TemperatureChart.tsx`](../src/components/TemperatureChart.tsx) | Recharts configuration, series patterns, endpoint labels, and tooltip. |
| [`../src/components/ComparisonTable.tsx`](../src/components/ComparisonTable.tsx) | The expandable table of daily values. |
| [`../src/lib/dates.ts`](../src/lib/dates.ts) | Calendar-date validation, date formatting, and date boundaries. |
| [`../src/lib/comparison.ts`](../src/lib/comparison.ts) | Filtering, checking a city pair, and preparing values for the chart. |
| [`../src/index.css`](../src/index.css) | Shared colors, layout rules, spacing, responsive adjustments, and focus styles. |

The folder name `ui/` contains the small shadcn building blocks. The files directly inside `components/` combine those building blocks into this project's features.

### Entry points and configuration

- `index.html` provides the page and its root container.
- `src/main.tsx` tells React to display `App` in that container and loads the shared CSS.
- `package.json` lists packages and defines named commands, called scripts.
- `package-lock.json` records the installed dependency versions.
- `vite.config.ts` connects React and Tailwind to Vite. It also makes `@/` a shortcut for `src/` in imports.
- The `tsconfig*.json` files configure TypeScript's checks.
- `components.json` describes the shadcn component setup.
- `vitest.config.ts` tells Vitest where to find unit tests.
- `playwright.config.ts` defines desktop/mobile browser profiles and the local test server.

Files ending in `.ts` contain TypeScript. Files ending in `.tsx` contain TypeScript that can also describe React interface elements using JSX, which looks similar to HTML.

### Source files and generated files

Edit files in `src/` when changing the application. `node_modules/` contains installed packages, and `dist/` contains the production build. Recreate those folders with commands rather than editing their contents.

Browser reports and screenshots are generated in `playwright-report/` and `test-results/`. The `.gitignore` file lists generated or local files that Git should leave out of version control.

## 6. How the application keeps track of selections

React **state** is a component's memory between screen updates. We used React's built-in state tools; no separate global state library was needed.

`App` remembers:

- The two city slots, initially `[null, null]`. Here, `null` means “no city selected.”
- The applied start and end dates, initially the whole year.

`DateRangeForm` separately remembers the dates currently being edited. Those are the **draft dates**.

For example:

```text
Chart currently shows: 1 January to 31 December
You edit the form to: 1 June to 30 June
Before Apply dates: the chart still shows the full year
After Apply dates: the chart and table show June
```

This separation lets someone finish editing both dates before changing the comparison. The pending message and applied-range summary explain which dates are active.

The data moves through the application like this:

```text
Local JSON file
    ↓
Keep the days within the applied date range
    ↓
Use the two selected cities
    ↓
Show the same filtered rows in the chart and table
```

We calculate the filtered rows and day count from existing state instead of storing separate copies that could get out of sync. Shared TypeScript types in `src/data/types.ts` describe the expected shapes of cities, dates, and temperature records.

## 7. How the synthetic data works

The bundled data is in `src/data/temperatures-2025.json`:

- **365 daily records**, from 1 January to 31 December 2025.
- Three city values per record, giving **1,095 temperatures**.
- Temperatures recorded to one decimal place in degrees Celsius.
- Metadata describing the generator and its fixed seed, `5132025`.

A **seed** is the starting value for a repeatable pseudorandom-number generator. Using the same procedure and seed gives the same results every time.

The generator combines a seasonal curve with small daily variation. Its parameters are teaching choices; they were not fitted to real weather. The generation logic lives in `src/data/generate.ts`, and `scripts/generate-data.mjs` writes its output to the JSON file.

During implementation I ran:

```sh
node scripts/generate-data.mjs
```

The convenient npm command for the same action is:

```sh
npm run data:generate
```

That command **writes the dataset file**. To check it without changing it, use:

```sh
npm run data:check
```

The check generates the expected content in memory and compares it with the bundled file. Regenerate the dataset rather than hand-editing JSON, and document generator changes in `design-and-data.md`.

Three details protect the comparison:

1. **Inclusive filtering:** a range from 31 January to 1 February includes both dates, so it contains two days.
2. **UTC date handling:** formatting and chart timestamps use UTC, a shared time reference, so opening the app in another timezone does not move a date to the previous day.
3. **Missing values stay missing:** `null` means a missing temperature; `0` means an actual simulated value of 0 °C. Missing values display as “Unavailable” and break the line. The bundled dataset is complete; a separate test fixture contains missing values.

The Celsius scale is calculated from the entire dataset and stays fixed when the student changes a city or date range. This avoids making temperature differences look larger simply because the axis changed.

## 8. How you can run the existing project

Open a terminal. Enter commands one line at a time, without copying the Markdown code-fence markers.

```sh
cd /home/egehan/Documents/Projects/IYTE/SEDS513
node --version
npm --version
```

`cd` means “change directory.” Commands such as `npm run dev` need to run in the project folder because that is where `package.json` lives.

On a fresh copy of the project, install the recorded dependencies:

```sh
npm ci
```

`npm ci` installs the versions specified by the lockfile and recreates `node_modules/`. It does not recreate the application source files. This is the recommended setup command for the existing project; the initial implementation used the `npm install` commands shown earlier.

Start the application:

```sh
npm run dev
```

Open the URL Vite prints, normally `http://127.0.0.1:5173`. The address `127.0.0.1` refers to your own computer. The number after the colon is the **port**, which identifies this local server.

Keep that terminal running while using the app. Save an edit to a source file and Vite usually updates the page automatically. Press **Ctrl+C** in the terminal to stop the server. Use a second terminal if you want to run tests while it stays open.

During implementation I also ran:

```sh
npm run dev -- --port 4173 --strictPort
```

That explicitly selected port 4173 for local browser investigation. `--strictPort` tells Vite to fail if that port is occupied instead of silently choosing another. This explains why the implementation preview used 4173 while the normal development command uses 5173. Always read the actual URL printed in your terminal.

### Build and inspect the production version

```sh
npm run build
npm run preview
```

The first command checks TypeScript and creates optimized browser files in `dist/`. The second serves that existing build locally so you can inspect it. Read its printed URL too; preview normally uses port 4173.

Building does not publish the website to the internet. After changing source files, build again before previewing the updated production version.

## 9. Checks I ran and what they mean

The main verification commands were:

```sh
npm run build
npm test
npm run lint
npm run data:check
npx playwright install chromium
npm run test:e2e
```

I ran some checks more than once while fixing failures. I also reran the affected browser scenarios before running the complete suite again.

| Command | What it checks |
| --- | --- |
| `npm run build` | Runs `tsc -b` to check TypeScript, then `vite build` to create the production files. The `&&` in the package script means the build runs only if the type check succeeds. |
| `npm test` | Runs Vitest: checks data reproducibility, dates, city pairs, missing values, and comparison helpers. |
| `npm run lint` | Runs Oxlint to catch certain code problems. It does not test whether a person can use the interface. |
| `npm run data:check` | Verifies that the stored data matches its documented generator exactly. |
| `npx playwright install chromium` | Downloads the Chromium browser required by the browser tests. It is setup for testing, not a test result itself. |
| `npm run test:e2e` | Opens browser windows in headless mode and checks complete interactions and accessibility scans. “Headless” means the browser runs without a visible window. |

You can also run `npm run typecheck` when you want TypeScript checks without producing a build. Those checks already run as part of `npm run build`.

Playwright starts a local Vite server on port 4173 automatically. In local development, it can reuse a server already running there. Avoid using that port for a different application while testing.

The final recorded results of the initial implementation were:

- **19 unit tests passed.**
- **23 browser checks passed; 1 was intentionally skipped.** The skipped case duplicated the desktop keyboard route in the mobile profile. Mobile chart keyboard inspection and touch inspection were tested separately.
- **8 automated accessibility scans found no violations** in the states checked.
- The build, lint, and dataset verification passed.
- Screenshots were reviewed at 320px, 768px, and 1440px widths.

These are the recorded implementation results, not newly rerun tests for this documentation change. Details and limitations are in [`validation.md`](validation.md).

## 10. Problems found during development

Testing caught problems that were fixed before the initial implementation was finished:

| Problem | Change made |
| --- | --- |
| Rounding a tiny negative temperature could produce JavaScript's `-0`, while JSON saved it as `0`. | Normalize zero in the generator so its output matches the saved data exactly. |
| A date-error message could appear while someone pressed Apply dates, moving the button before the click finished. | Reveal new errors at the appropriate point in submission, then focus the invalid field. |
| A two-day range could ask the chart to display the same tick twice. | Remove duplicate tick positions before rendering the axis. A tick is a labeled position along an axis. |
| The first build put too much JavaScript into one downloaded file. | Load the chart code when a valid city pair is selected. This is called lazy loading. |
| A mobile test tried to tap a chart that was below the visible screen. | Scroll the chart into view before tapping. This was a test-setup problem. |

These were engineering findings. They are not observations from students using the application.

## 11. What the tests do not prove

Passing automated checks helps show that the tested behavior works. It does not prove that students find the application easy to use, and an accessibility scanner cannot detect every accessibility problem.

The browser checks used desktop Chromium and an emulated mobile Chromium device. Physical mobile devices, screen readers, Firefox, and Safari still need manual checks.

No participant usability sessions have been conducted. [`usability-study.md`](usability-study.md) contains a prepared protocol for testing with students and recording real observations.

## 12. A suggested first programming exercise

To get familiar with the code:

1. Start the application with `npm run dev`.
2. Open `src/App.tsx` and find the short instruction under the page title.
3. Change that instruction, save the file, and observe the browser update.
4. Open `src/index.css` and find `--primary`, the named color used for the primary action.
5. After making an intentional change, run `npm run build` and `npm run lint`.
6. For changes to selection controls, dates, or chart interaction, also run the relevant unit and browser tests.

Keep the synthetic-data disclosure, date boundaries, and accessible labels intact as you experiment.
