import "@testing-library/jest-dom/vitest"

// jsdom doesn't implement scrollIntoView; components that call it on mount
// (e.g. DonationForm's step-change focus handling) would otherwise throw.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
