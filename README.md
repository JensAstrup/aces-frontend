# Ace of Spades / Frontend
This is the frontend for Ace of Spades. It is a Next.js application built with TypeScript.

![Codecov](https://img.shields.io/codecov/c/github/JensAstrup/aces-frontend?style=for-the-badge)

## Notes
This is my first Next.js project, and I am still learning best practices as well as how I would
like to structure the project. All feedback is welcome, but bear in mind as you read the code that
I am still learning :) 

## Getting Started

First, run the development server:

```bash
yarn dev
```

## Patterns
- No logic should be in the components. All logic should be in the `app` or `lib` directories.
- Hooks are stored in the `lib/hooks` directory.
- `data-testid` attributes are not used for testing. Production code should not be polluted with test code.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
