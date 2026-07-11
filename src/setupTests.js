import '@testing-library/jest-dom';

// jsdom doesn't implement confirm() — default to "yes" for tests
window.confirm = () => true;