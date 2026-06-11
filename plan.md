Implementation Plan: Recursive Inline Capsule Plugin
Sprint 1: Core Domain & Context-Free Token Engine
Goal: Implement a completely decoupled, framework-agnostic stack parser capable of resolving recursive, nested bracket boundaries.

Tasks
[ ] Configure Domain Models (src/domain/models/Settings.ts)

Define CapsuleSettings contract interface.

Export DEFAULT_SETTINGS object literal.

[ ] Define Hierarchical Tree Structures (src/domain/models/CapsuleNode.ts)

Create type boundaries to manage raw string segments, calculated file offset coordinates, parent-child references, and nesting depth indicators.

[ ] Abstract Token Operations (src/domain/services/IParser.ts)

Export the generic IParser interface mapping raw string blocks to structured node arrays.

[ ] Build Stack-Based Scanning Automaton (src/application/CapsuleParser.ts)

Implement a character-by-character scanner stream loop.

Eliminate regular expressions entirely; handle opening and closing tokens via a physical integer stack array to track exact balance and nesting depth levels.

Verification Milestone
Instantiate the parser inside a raw node file, pass complex multi-tier inputs like [= Outer [= Inner =] Outer =], and verify that coordinate indices are mathematically accurate.

Sprint 2: CodeMirror 6 State Fields & Replacement Engines
Goal: Hook the algorithmic coordinate indices directly into CodeMirror 6 viewports, replacing the raw Markdown characters with visual DOM wrappers without dropping cursor tracking states.

Tasks
[ ] Construct Dom Materialization Layer (src/infrastructure/codemirror/CapsuleWidget.ts)

Inherit from CodeMirror's native WidgetType.

Implement the toDOM factory method to inject capsule spans and baseline formatting nodes.

[ ] Build State Ledger Processing (src/infrastructure/codemirror/Extension.ts)

Register a centralized StateField engine to listen to viewport updates and line mutations.

Read active viewport bounds, query the stack parser, and map token coordinates to precise Decoration.replace objects.

[ ] Orchestrate Structural Expansion Buffers

Maintain a global tracking memory ledger (Set or Map) tracking which specific text strings are toggled open or closed, ensuring expansion persistence across virtual DOM recycling runs.

Verification Milestone
Toggling Live Preview on notes containing capsules replaces the raw markers with clean indicators. Clicking an element expands its inner contents in place.

Sprint 3: UI Customization, Hover Interactivity & Bundling
Goal: Remove all hardcoded configurations, connect mouse layout hover triggers, activate Reading View rendering, and build the distribution pipeline.

Tasks
[ ] Integrate Hover Event Streams (src/infrastructure/codemirror/CapsuleWidget.ts)

Inject conditional listeners tracking mouse activity boundaries (mouseenter / mouseleave).

Wire custom CSS runtime states to alternate visibility variables based on settings data.

[ ] Serialize Variable Panels (src/infrastructure/obsidian/SettingsTab.ts)

Build out input components, toggle switches, and selection drop-downs.

Hook change loops to persist modified symbols, custom tags, or animation modes to data.json.

[ ] Map HTML Post-Processors (src/infrastructure/obsidian/PostProcessor.ts)

Mirror the stack scanning algorithm inside Obsidian's native rendering pipeline to ensure identical nested logic compiles when reading compiled notes.

[ ] Wire Composition Roots & Compile Files (src/main.ts)

Manage application bootstrapping under standard initialization hooks (onload / onunload).

Populate build properties (tsconfig.json, esbuild.config.js, manifest.json, styles.css) to package code dependencies cleanly.

Verification Milestone
Changing your custom indicators or switching behavior flags (e.g., swapping from Click to Hover) from your setting pane applies structural changes across all open editor tabs instantly.