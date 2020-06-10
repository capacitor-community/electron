# Welcome, Plugin Author

First of all, welcome! We look forward to having your awesome plugin and contributions in this organization and are available for help if need be (easiest way is to ping one of us on Twitter).

This guide lays out expectations and conventions used by all projects in the `capacitor-community` organization. Please read it to make sure your projects are set up and configured correctly.

After reading and acting on this feel free to delete it from the repo. You can always access it at https://github.com/capacitor-community/.github.

---

0. [Start here](#0-start-here)
1. [Conventions](#1-conventions)
2. [Project Setup](#2-project-setup)
3. [Project Licensing](#3-project-licensing)
4. [Publishing](#4-publishing)
5. [Recognizing Contributors](#5-recognizing-contributors)
6. [Where to Get Help](#6-where-to-get-help)

## 0. Start here

Before adding your project to the `capacitor-community` org, make sure you have been granted access to the `capacitor-community` GitHub org and `@capacitor-community` npm scope. If you are unsure how to do that, please ping [@maxlynch](https://twitter.com/maxlynch) on Twitter.

In terms of package naming, your packages should be named as simply as possible, without any `capacitor` or `plugin` words in the package name itself. Packages must be published in the `@capacitor-community` npm scope.

For example, a Google Maps plugin would be published under `@capacitor-community/google-maps`.

## 1. Conventions

One of the goals of the Capacitor Community initiative is to have a set of github repos that follow a set of conventions around READMES, package naming, licensing, code style, and more.

As such, there are a number of conventions that you should follow:

First, make sure when creating a new repo to use the `.github` repo as a template. This will pull in issue templates, a code of conduct, and more.

Next, follow the project setup steps to install a code formatter, changelog generator, and more.

Finally, projects should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) process for creating a nice changelog on release (more info soon)

## 2. Project Setup

Projects should install the following packages:

`npm install --save-dev husky prettier prettier-plugin-java pretty-quick np`

These packages setup pre-commit hooks, code formatting, and publishing utilities. Husky manages git hooks without having to manually set them up, `prettier` and `prettier-plugin-java` automatically format code based on a set of code style configurations, and `np` is a complex npm publishing script that automatically handles tags and other release steps.

Next, make sure to enable Husky scripts for `pre-commit` in your `package.json` to automatically run prettier on every pre-commit:

```json
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  },
```

## 3. Project Licensing

We _strongly_ encourage your project use the MIT license. Apache 2 is also acceptable. Any other license must be approved with the Capacitor core team in advance to avoid licensing surprises.

Your next step after creating the project should be to update the `LICENSE` file and fill in the correct year and copyright holder information.

## 4. Publishing

To publish your package, we recommend adding an npm script to your `package.json` called `shipit` that runs `np`. You can also run that manually, if you prefer.

## 5. Recognizing Contributors

Recognizing contributors is important. Every project in the `capacitor-community` GitHub org is automatically set up to use [All Contributors](https://allcontributors.org/) and maintainers should recognize any community members that contribute by following the [All Contributors usage guide](https://allcontributors.org/docs/en/bot/usage).

### 6. Where to Get help

While the Capacitor Community organization is a community-driven environment, it is facilitated by the core Capacitor team at Ionic. If you are ever in need of help, don't hesitate to tweet at one of us or send us an email, especially to Max (Ionic CEO): [@maxlynch on Twitter](https://twitter.com/maxlynch).
