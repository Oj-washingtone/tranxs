# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-05-14

### Added

- Full TypeScript support with type definitions (`.d.ts` files) for better developer experience.
- Refactored code to TypeScript for improved maintainability and compatibility with modern JavaScript practices.

### Changed

- **Breaking change in initialization method**: The initialization of the `Mpesa` class has been refactored to use a **hook**-based method for better compatibility with modern JavaScript/TypeScript frameworks.
  - **Old method**:
    ```js
    const mpesa = new Mpesa({ ... });
    ```
  - **New method**:
    ```js
    const mpesa = useMpesa({ ... });
    ```

### Fixed

- Improved package structure with separate files for `index.js` and `index.d.ts` for better module compatibility.
- Refined export configuration in `package.json` for smoother integration and package distribution.

### Removed

- Deprecated the old initialization method (`new Mpesa()`) in favor of the new `useMpesa()` method.
- Removed the legacy JavaScript code in favor of a cleaner, TypeScript-based architecture.

## [1.0.9] - 2025-05-01

> **Note:** Version 2.0.0 and beyond requires updates to the initialization method. See the migration section for details on how to upgrade from earlier versions.
