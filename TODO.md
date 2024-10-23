Review ESLINT eslint-plugin-import
<https://github.com/import-js/eslint-plugin-import>
Add:

- <https://www.npmjs.com/package/@eslint/markdown>
- <https://www.npmjs.com/package/@eslint/json>

Publish to NPM registry
<https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#publish-to-npmjs-and-gpr-with-npm>

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
