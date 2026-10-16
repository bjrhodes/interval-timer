# Interval Timer

This was conceived as a simple app to run and share complex interval training routines for bicycle or circuit training. It may become fairly bike oriented though, as that's what I do most. It was intended partly to solve a problem I had, and partly as an exercise in writing vanilla JS, something which I rarely get to do in my professional life as an react developer.

## Development

The source is TypeScript in `src/`, compiled by `tsc` into `js/` (not committed), which `index.html` loads.

- `npm run serve` builds, then serves the app on http://localhost:4173
- `npm run watch` rebuilds on save, alongside `serve`
- `npm run typecheck` type-checks the source and the tests
- `npm test` and `npm run test:e2e` run the unit and browser tests
