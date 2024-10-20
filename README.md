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

The Publish Blog Post action is a GitHub Action that automates the process of publishing blog posts to various platforms, such as Dev.to and Medium. The action reads the markdown content from a specified file and based on its front matter data publishes or updates the post to the selected platform using the respective API.

---

## 👾 Features

### Functionality

The action provides the following features:

- **Publish new posts**: Publishes blog posts to supported/configured hosting (currently only Dev.to).
- **Update Existing Posts**: Updates existing posts on supported/configured hosting (currently only Dev.to).

### Code Quality

- **TypeScript**: The action is developed using TypeScript, ensuring type safety and code consistency.
- **ESLint and Prettier**: The codebase adheres to best practices using ESLint and Prettier for consistent code formatting.
- **Unit Tests**: The action includes unit tests to validate the correctness of individual functions and modules.

### Testing

- **Vitest**: The action utilizes Vitest for testing, ensuring the reliability and accuracy of the codebase.
- **Code Coverage**: The action maintains a high code coverage percentage, guaranteeing comprehensive testing.

### Dependencies

***KY***: Tiny & elegant JavaScript HTTP client based on the Fetch API ussed to make HTTP requests to the Dev.to API.
**gray-matter**: Used to parse the front matter of the markdown file to extract metadata such as title, description, tags, etc.

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

1. Go to [Dev.to](https://dev.to/) and sign in to your account.
2. Navigate to the [Settings -> Exetensions](https://dev.to/settings/extensions) page.
3. Scroll down and click on the `Generate API Key` button after defining the description.
4. Copy the generated API key.

Once you have obtained the API key, add it to the repository secrets as `DEV_TO_API_KEY`.

1. Navigate to the repository `Settings`.
2. Expand the `Secrets and variables` section and click on `Actions`.
3. Click on `New repository secret`.
4. Add the
   - `Name`: `DEV_TO_API_KEY`
   - `Value`: `<Your Dev.to API Key>`

### Workflow File

Create a new workflow file in your repository to trigger the Publish Blog Post action. The workflow file should be placed in the `.github/workflows` directory.

#### Inputs

The action requires the following inputs:

| Name            | Required                             | Default Value                            | Description                                                                                       |
|-----------------|--------------------------------------|------------------------------------------|---------------------------------------------------------------------------------------------------|
| token           | true                                 | `${{ github.token }}`                    | The GitHub token to access the repository.                                                        |
| publishTo       | true                                 | `devTo`                                  | The hostings to publish/update the post. Comma separated values. Supported values: 'devTo'        |
| devToApiKey     | true (if publishTo contains 'devTo') |                                          | The API key for the devTo Blog Post Hosting.                                                      |
| includeFolders  | false                                |                                          | Folders to look for post files to publish/update. Multiple folders can be specified, one per line. If not defined, all folders will be checked |
| commitMessage   | false                                | `publish/update %file with updated data` | The commit message template for review suggestions. %file is replaced by file path                |

Example of a workflow file:

```yaml
name: Test Publish Blog Post Action

on:
  push:
    branches:
      - main

jobs:
  publish-blog-post::
    runs-on: ubuntu-latest
    name: A test job to run the Publish Blog Post action
    steps:
      # To use this repository's private action,
      # you must check out the repository
      - name: Checkout
        uses: actions/checkout@v4
      - name: Test the publish-blog-post action
        uses: trystan2k/publish-blog-post@v1
        id: publish-blog-post
        with:
          devToApiKey: ${{ secrets.DEV_TO_API_KEY }}
          includeFolders: |-
            post-samples

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
