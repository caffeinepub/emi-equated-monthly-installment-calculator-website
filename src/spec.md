# Specification

## Summary
**Goal:** Add a locally persisted calculation history to the EMI calculator so users can review and reuse past results.

**Planned changes:**
- Add a Calculation History section on the main calculator page that records each successful EMI calculation (inputs, computed outputs, and a local-time timestamp) and displays entries in reverse chronological order.
- Persist history in browser storage so it remains after refresh.
- Add actions to load a past calculation back into the input fields and to clear all history with a confirmation step.

**User-visible outcome:** Users can see a reverse-chronological list of past EMI calculations on the calculator page, reload any past entry into the inputs, and clear the stored history (with confirmation), with history surviving page refreshes.
