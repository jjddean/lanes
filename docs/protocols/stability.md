# Stability & UI Protocol

## Goal: Zero-Flicker Navigation
The Elite dashboard must feel as stable as a local application. Stale content "popping up" or header flashes are unacceptable in a "Zero-Touch" system.

### 1. Hydration & Navigation Rules
- **No `force-dynamic`**: Components that don't change per-request should remain static or use PPR (Partial Prerelease) to prevent full-page server re-renders. 
- **Sticky States**: Use the `useOptimistic` hook for all navigation-related titles and sidebar states to ensure the UI updates before the server responds.
- **Loading Skeletons**: Every "Discovery" or "Connection" view must have a defined skeleton state to prevent layout shifts.

### 2. State Management Consistency
- **Convex for Source of Truth**: All "Shipment Opportunities" and "Autonomous Agents" states must come from Convex queries.
- **Client-Side Caching**: Avoid manual `useState` for things that live in the database. Use Convex's built-in reactivity to ensure the UI is always a reflection of the `events` log.

### 3. Theme & Aesthetics ("Modern Logistics")
- **Colors**: Deep blues, slate greys, and high-contrast accents (cyan/teal) to represent "Active Engines."
- **Typography**: Clean, sans-serif fonts (Inter/Outfit) for maximum readability in data-heavy views.
- **Micro-Animations**: Use subtle transitions (0.2s ease-linear) for sidebar collapses and navigation to hide any minor hydration gaps.

### 4. Versioning UI
- Whenever a `feature_snapshot` version changes, the UI should reflect the model version in the "Efficiency Widget" to provide transparency on the reasoning engine's state.
