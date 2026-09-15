# Universal web, iOS, and Android architecture

Date: 2026-09-05
Status: current implementation decision

## Recommendation

Use one **Expo + React Native + TypeScript + Expo Router** application for the authenticated learning product on web, iOS, and Android. The three-week MVP is a responsive web release, including purpose-designed laptop and desktop layouts. iOS and Android ship after the web learning loop is validated. Keep Supabase, the server-side learning engine, domain contracts, design tokens, and most learning components portable across clients.

React Native recommends using a framework for new applications and identifies Expo as its recommended community framework. [React Native framework guidance](https://reactnative.dev/blog/2024/06/25/use-a-framework-to-build-react-native-apps)

Expo explicitly supports universal Android, iOS, and web applications from one TypeScript project. Expo Router provides one routing structure across platforms while permitting platform-specific implementations where behavior genuinely differs. [Expo](https://docs.expo.dev/) [Expo Router](https://docs.expo.dev/router/introduction/)

## Why one universal Expo application fits this product

The MVP is an authenticated, app-like learning experience. It does not depend on search-engine rendering, a large public content site, complex server-rendered pages, or desktop-specific data tables. Its important surfaces—cards, buttons, progress paths, animations, short inputs, camera/image selection, and responsive layouts—map well to React Native primitives rendered through React Native Web.

Expo documents first-class web support and recommends React Native Web components when maximizing cross-platform reuse. It supports client-rendered app-like websites as well as static and server output modes. [Expo web development](https://docs.expo.dev/workflow/web/)

For the first release, use Expo Router's default single-page web output and deploy it as a web application. Expo recommends EAS Hosting for the best Expo web feature support, while also documenting third-party and self-hosted deployment. [Expo website publishing](https://docs.expo.dev/guides/publishing-websites/)

## Alternatives considered

### Next.js web plus Expo native

This is appropriate when the web product needs strong web-only requirements: extensive SEO, content marketing, server-rendered public pages, or dense desktop workflows. It would introduce a second routing/rendering environment and force the team to decide which components truly work in both. That trade-off is unnecessary for the authenticated three-screen learning product.

A separate public marketing website can be added later without moving the learning application out of Expo.

### Flutter

Flutter is a credible multi-platform alternative, but the user has already chosen the React/React Native direction. Switching would replace rather than simplify the stack and would not remove the need for responsive design, platform authentication, camera permissions, backend authorization, or store builds.

## Code-sharing boundary

Aim to share product logic and most visual components, not every line:

- shared everywhere: domain types, API contracts, learning state rendering, design tokens, buttons, cards, progress indicators, quest screens, validators that are safe on clients;
- platform-specific when needed: provider authentication adapters, camera/file-picker behavior, secure local session persistence, navigation polish, hover/keyboard affordances, and unusually complex animations;
- server-only: OpenAI keys and calls, mastery policy, content publication, authorization, attempt records, and privileged Supabase access.

Use Expo's platform file convention sparingly, such as `PhotoInput.web.tsx` and `PhotoInput.native.tsx`, behind one shared `PhotoInput` interface.

## Suggested repository structure

```text
src/
  app/                    Expo Router routes
  features/
    auth/
    onboarding/
    quest/
    problem/
    repair/
    path/
    profile/
  components/             shared product components
  design/                 tokens, typography, motion, themes
  domain/                 framework-independent types and rules
  data/                   Supabase client and API contracts
  platform/               narrow web/native adapters
assets/
supabase/
  migrations/
  functions/
curriculum/
  packs/                  versioned source content
  schemas/
  scripts/
docs/
```

A monorepo is not needed while there is only one universal client. Add separate packages only when a second independently deployed application, such as an internal authoring console or marketing site, actually exists.

## Delivery sequence

1. Week one: implement the responsive application shell and one real Problem on web; verify the shared code avoids unnecessary DOM-only assumptions.
2. Week two: deploy an authenticated web preview and complete the core Evaluation, Repair Activity, retry, Transfer Problem, and adaptation loop.
3. Week three: deploy and harden the responsive web pilot at phone, tablet, 1280 x 800 laptop, and 1440 x 900 desktop sizes.
4. After validation: create iOS and Android development builds from the same routes and contracts, adding narrow platform adapters for authentication, camera, secure storage, navigation, and platform polish.

Expo can export a production web build and deploy through EAS; EAS remains available later for native build and submission. [Expo website publishing](https://docs.expo.dev/guides/publishing-websites/) [Expo Router overview](https://docs.expo.dev/router/introduction/)

## Guardrails

- Do not use experimental universal React Server Components for the MVP; Expo documents material production limitations. [Expo Server Components](https://docs.expo.dev/guides/server-components/)
- Do not use DOM elements in shared product screens unless wrapped in a `.web.tsx` component.
- Test responsive layouts at narrow phone widths from the first component.
- Preserve keyboard, focus, reduced-motion, screen-reader labels, and large touch targets on web and native.
- Do not promise native binaries as part of the three-week web MVP. Preserve portability through shared contracts, React Native primitives, platform adapters, and dependency checks.

## Decision

Build the web MVP as the web target of the eventual universal application, not as a disposable Next.js prototype. Treat desktop web as a designed product surface using the selected Workshop Journey direction, while retaining the existing mobile prototypes as the narrow-layout reference. This maximizes useful code reuse without pretending that desktop, iOS, and Android require identical compositions.
