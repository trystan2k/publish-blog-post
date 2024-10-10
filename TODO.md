Review ESLINT eslint-plugin-import
<https://github.com/import-js/eslint-plugin-import>
Add:

- <https://www.npmjs.com/package/@eslint/markdown>
- <https://www.npmjs.com/package/@eslint/json>

Check if possible to not run GitHub Actions when autor is email is 'dependabot[bot]'

```yaml
name: CI

on: [push, pull_request]

jobs:
  build:
    if: "!contains(github.event.head_commit.author.email, 'dependabot[bot]')"
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test
```

- Create a logging system

<https://developers.forem.com/api/v0#tag/articles/operation/updateArticle>

<https://github.com/khaosdoctor/devto-nodejs-sdk/blob/main/src/repositories/ThePracticalDevClient.ts>
<https://github.com/maxime1992/dev.to>

IDEAS:

- Create an action that search for posts that has a scheduled date and publish them
  - Scheduled posts will have a 'scheduled_at' field
  - They will not be published when running the Publish Action (if scheduled_at is not null)
  - Scheduled to run every day at 00:00
  - Search for posts that has a scheduled date less than or equal to the current date
  - Publish them and update the 'published_at' field
  - Keep the 'scheduled_at' field for future reference (like to avoid publish when running the action for publish)

- Astro Blogs Examples:
  <https://raw.githubusercontent.com/silent1mezzo/mckerlie.com/refs/heads/main/src/content/posts/five-traits-when-hiring.md>
<https://github.dev/withastro/blog-tutorial-demo/blob/complete/src/pages/posts/post-1.md>
