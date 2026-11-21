import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

// jsdom doesn't implement scrolling
window.scrollTo = (() => {}) as typeof window.scrollTo;
