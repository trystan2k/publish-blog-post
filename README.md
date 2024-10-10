# Publish Blog Post

[![CI](https://github.com/trystan2k/publish-blog-post/actions/workflows/ci.yml/badge.svg)](https://github.com/trystan2k/publish-blog-post/actions/workflows/ci.yml)

- [📍 Overview](#-overview)
- [👾 Features](#-features)
  - [Functionality](#functionality)
  - [Code Quality](#code-quality)
  - [Testing](#testing)
  - [Dependencies](#dependencies)
- [🚀 Getting Started](#-getting-started)
  - [Permissions](#permissions)
  - [API Key](#api-key)
  - [Workflow File](#workflow-file)
  - [Usage](#usage)
- [🏗️ Building the Project](#️-building-the-project)
  - [Installation](#installation)
  - [Build](#build)
  - [Tests](#tests)
- [🤝 Contributing](#-contributing)
- [👥 Contributor Graph](#contributor-graph)
- [🎗 License](#-license)
- [🔖 References](#-references)

---

## 📍 Overview

---

## 👾 Features

### Functionality

### Code Quality

- **TypeScript**: The action is developed using TypeScript, ensuring type safety and code consistency.
- **ESLint and Prettier**: The codebase adheres to best practices using ESLint and Prettier for consistent code formatting.
- **Unit Tests**: The action includes unit tests to validate the correctness of individual functions and modules.

### Testing

- **Vitest**: The action utilizes Vitest for testing, ensuring the reliability and accuracy of the codebase.
- **Code Coverage**: The action maintains a high code coverage percentage, guaranteeing comprehensive testing.

### Dependencies

***KY***: Tiny & elegant JavaScript HTTP client based on the Fetch API ussed to make HTTP requests to the Dev.to API.

---

## 🚀 Getting Started

To use the Publish Blog Post action, it is necessary to configure the required permissions and API keys. Later you need to create a workflow file in your repository to trigger the action.

### Permissions

It is necessary to enable `Read and write permissions` for the GitHub Token in the repository settings. This permission is required to access and modify markdown files within the repository.

1. Navigate to the repository `Settings`.
2. Expand the `Actions` section and click on `General`
3. Scroll down to the `Permissions` section and ensure that the `Read and write permissions` are enabled for the GitHub Token.

### API Key

To use the action, you need to obtain an API key for the choosen Blog Post Hosting. Follow these steps to create an API key:

#### Dev.to API

To use the Dev.to API, you need to create an API key. Follow these steps to create an API key:

1.
2.
3.

#### Medium API

To use the Medium API, you need to create an API key. Follow these steps to create an API key:

1.
2.
3.

Once you have obtained the API key, add it to the repository secrets as `API_KEY` (for any of the provider selected, use the same variable).

1. Navigate to the repository `Settings`.
2. Expand the `Secrets and variables` section and click on `Actions`.
3. Click on `New repository secret`.
4. Add the
   - `Name`: `API_KEY`
   - `Value`: `<Your API Key>`

### Workflow File

Create a new workflow file in your repository to trigger the Markdown Translator and Reviewer action. The workflow file should be placed in the `.github/workflows` directory.

#### Inputs

The action requires the following inputs:

| Name                            | Required    | Default Value                                       | Description                                                                     |
| ------------------------------- | ----------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| token                           | true        | `${{ github.token }}`                               | The GitHub token to access the repository.                                      |
| apiKey                          | true        |                                                     | The API key for the selected Blog Post Hosting.                                 |

Example of a workflow file:

```yaml
name: Test Markdown Reviewer and Translator

on:
  push:
    branches:
      - main

jobs:
  md-reviewr-translator:
    runs-on: ubuntu-latest
    name: A test job to run the Markdown Reviwer and Translator
    steps:
      # To use this repository's private action,
      # you must check out the repository
      - name: Checkout
        uses: actions/checkout@v4
      - name: Test the publish-blog-post action
        uses: trystan2k/publish-blog-post@v1
        id: publish-blog-post
        with:
          apiKey: ${{ secrets.API_KEY }}

```

### Usage

## 🏗️ Building the Project

Ensure you have Node.js and PNPM installed on your machine before proceeding with the installation.

```sh
❯ node -v
>= 20.0.0

❯ pnpm -v
>= 9.9.0
```

### Installation

Build the project from source:

1. Clone the repository:

```sh
❯ git clone git@github.com:trystan2k/publish-blog-post.git
```

2. Navigate to the project directory:

```sh
❯ cd publish-blog-post
```

3. Install the required dependencies:

```sh
❯ pnpm install
```

### Build

To build the project for distribution, run the following command:

```sh
❯ pnpm build
```

### Tests

Execute the test suite using the following command:

```sh
❯ pnpm test
```

---

## 🤝 Contributing

Contributions are welcome! Here are several ways you can contribute:

- **[Report Issues](https://github.com/trystan2k/publish-blog-post/issues)**: Submit bugs found or log feature requests for the `app` project.
- **[Submit Pull Requests](/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

---

## Contributor Graph

<p align="left">
   <a href="https://github.com/trystan2k/publish-blog-post/graphs/contributors">
      <img src="https://contrib.rocks/image?repo=trystan2k/publish-blog-post" />
   </a>
</p>

---

## 🎗 License

This project is protected under the [MIT](https://choosealicense.com/licenses/mit/) License. For more details, refer to the [LICENSE](/LICENSE) file.

---

## 🔖 References

### GitHub Actions

- [GitHub Actions](https://docs.github.com/en/actions)

### Dev.to API

- [Dev.to API](https://docs.dev.to/api/)

### Medium API

- [Medium API]()

---
