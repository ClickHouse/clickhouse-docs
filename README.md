<div align=center>

![Website](https://img.shields.io/website?up_message=AVAILABLE&down_message=DOWN&url=https%3A%2F%2Fclickhouse.com%2Fdocs&style=for-the-badge)
[![CC BY-NC-SA 4.0 License](https://img.shields.io/badge/license-CC-blueviolet?style=for-the-badge)](http://creativecommons.org/licenses/by-nc-sa/4.0/)
![Checks](https://img.shields.io/github/actions/workflow/status/clickhouse/clickhouse-docs/debug.yml?style=for-the-badge&label=Checks)

<picture align=center>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/ClickHouse/clickhouse-docs/assets/9611008/4ef9c104-2d3f-4646-b186-507358d2fe28">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/ClickHouse/clickhouse-docs/assets/9611008/b001dc7b-5a45-4dcd-9275-e03beb7f9177">
    <img alt="The ClickHouse company logo." src="https://github.com/ClickHouse/clickhouse-docs/assets/9611008/b001dc7b-5a45-4dcd-9275-e03beb7f9177">
</picture>

<h4>ClickHouse® is an open-source column-oriented database management system that allows generating analytical data reports in real-time.</h4>

</div>

---

ClickHouse is blazing fast, but understanding ClickHouse and using it effectively is a journey. The documentation is your source for gaining the knowledge you need to be successful with your ClickHouse projects and applications. [Head over to clickhouse.com/docs to learn more →](https://clickhouse.com/)

## Table of contents {#table-of-contents}

- [About this repo](#about-this-repo)
- [Run locally](#run-locally)
- [Contributing](#contributing)
- [Issues](#issues)
- [License](#license)

## About this repo {#about-this-repo}

This repository manages the documentation for [ClickHouse](https://clickhouse.com/docs). The content is built with [Docusaurus](https://docusaurus.io/) and hosted on [Vercel](https://vercel.com). Documentation content is written in Markdown and is held in the `/docs` directory.

## Run locally {#run-locally}

You can run a copy of this website locally within a few steps. Some folks find this useful when contributing so they can see precisely what their changes will look like on the production site.

1. Install Git and npm. If you already have them installed, skip this step:

    | OS | Package manager | Install command |
    | ---| --------------- | --------------- |
    | macOS | Homebrew | `brew install git node` |
    | Ubuntu | Apt | `sudo apt install git nodejs npm` |
    | Arch | Pacman | `sudo pacman -S git nodejs npm` |
    | Windows | Chocolatey | `choco install git nodejs-lts` |

1. Install `yarn`. If you already have it installed, skip this step:

    ```shell
    sudo npm install --global yarn
    ```

1. Clone this repository and move into the `clickhouse-docs` directory:

    ```shell
    git clone https://github.com/clickhouse/clickhouse-docs
    cd clickhouse-docs
    ```

1. Install the project dependencies with Yarn:

    ```shell
    yarn install

    # yarn install v1.22.19
    # [1/5] 🔍  Validating package.json...
    # [2/5] 🔍  Resolving packages...
    # ...
    # success Saved lockfile.
    # ✨  Done in 6.44s.
    ```

1. Use Yarn to grab the latest documentation changes from the `ClickHouse/ClickHouse` repository and build the documentation using `yarn-build`:

    ```shell
    yarn build

    # Cloning into 'ClickHouse'...
    # ...
    # [SUCCESS] Generated static files in "build".
    # [INFO] Use `npm run serve` command to test your build locally.
    # ✨  Done in 105.96s.
    ```

1. Start the local web-server:

    ```shell
    yarn start

    # yarn run v1.22.19
    # $ docusaurus start
    # ...
    #
    ```

    This command will build the documentation site and serve it locally. Once the build has finished, browse the website at [localhost:3000](http://localhost:3000/docs/intro).

1. To stop the local server, press `ctrl` + `c` in the terminal window.

If you want to build a static copy of this repository that doesn't require a constant server running to view, you can use `yarn build` instead of `yarn start`. The `yarn build` will output a static copy of the website in the `/build` directory. This process takes around 10 minutes to complete on an M1 Macbook with 8GB RAM.

1. Should you wish to make changes to documents which are located in the ClickHouse/ClickHouse repo and want to visualize what the changes made look like locally you can use `yarn copy-clickhouse-repo-docs -l` and provide a path to the ClickHouse repository on your local machine, for example:

   ```
   # yarn copy-clickhouse-repo-docs -l /Users/user/Desktop/ClickHouse
   # Successfully executed local copy
   # ✨  Done in 1.15s.
   ```

We recommend to install rsync in order to only copy what is needed, however the script will fallback to using `cp` if rsync is not available.

Running `yarn copy-clickhouse-repo-docs` without any arguments will pull in the latest docs changes from github.

To check spelling and markdown is correct locally run:

```bash
yarn check-style
```

### Notes {#notes}

Here are some things to keep in mind when building a local copy of the ClickHouse docs site.

#### Build-time {#build-time}

Due to the complex structure of this repo, the docs site can take some time to build locally. As a benchmark, it takes ~3 minutes to build on an M1 Macbook with 8GB RAM.

#### Redirects {#redirects}

Due to how the local server is built, redirects will not work. For example, visiting `clickhouse.com/docs` on the production site will lead you to `clickhouse.com/docs/intro`. However, on a local copy of the site, you will see a 404 page if you try to visit `localhost:8000/docs`.

## Contributing {#contributing}

Want to help out? Contributions are always welcome! If you want to help out but aren't sure where to start, check out the [issues board](https://github.com/clickhouse/clickhouse-docs/issues).

### Pull requests {#pull-requests}

Please assign any pull request (PR) against an issue; this helps the docs team track who is working on what and what each PR is meant to address. If there isn't an issue for the specific _thing_ you want to work on, quickly create one and comment so that it can be assigned to you. One of the repository maintainers will add you as an assignee.

Check out the GitHub docs for a refresher on [how to create a pull request](https://docs.github.com/en/desktop/working-with-your-remote-repository-on-github-or-github-enterprise/creating-an-issue-or-pull-request-from-github-desktop).

### Style guidelines

For documentation style guidelines, see ["Style guide"](/contribute/style-guide.md). 

To check spelling and markdown is correct locally run:

```bash
yarn check-style
```

### Generating documentation from source code

For an overview of how reference documentation such as settings, system tables
and functions are generated from the source code, see ["Generating documentation from source code"](/contribute/autogenerated-documentation-from-source.md)

### Tests and CI/CD {#tests-and-cicd}

There are five workflows that run against PRs in this repo:

| Name | Description |
| ---- | ----------- |
| [Debug](https://github.com/ClickHouse/clickhouse-docs/blob/main/.github/workflows/debug.yml) | A debugging tool that prints environment variables and the content of the `GITHUB_EVENT_PATH` variable for each commit. |
| [Link check](https://github.com/ClickHouse/clickhouse-docs/blob/main/.github/workflows/linkcheck.yml) | Checks for broken external links in this repo. |
| [Pull request](https://github.com/ClickHouse/clickhouse-docs/blob/main/.github/workflows/pull-request.yml) | This is a _meta_ workflow that sets up a testing environment and calls the `docs_check.py` and `finish_check.py` scripts. |
| [Scheduled Vercel build](https://github.com/ClickHouse/clickhouse-docs/blob/main/.github/workflows/scheduled-vercel-build.yml) | Builds the site every day at 00:10 UTC and hosts the build on Vercel. |
| [Trigger build](https://github.com/ClickHouse/clickhouse-docs/blob/main/.github/workflows/trigger-build.yml) | Uses the [peter-evans/repository-dispatch@v2](https://github.com/peter-evans/repository-dispatch) workflow to create a repository dispatch. |

### Quick contributions {#quick-contributions}

Have you noticed a typo or found some wonky formatting? For small contributions like these, it's usually faster and easier to make your changes directly in GitHub. Here's a quick guide to show you how the GitHub editor works:

1. Each page in Clickhouse.com/docs has an **Edit this page** link at the top:

    ![The ClickHouse Docs website with the edit button highlighted.](./static/images/contributing/readme-edit-this-page.png)

    Click this button to edit this page in GitHub.

1. Once you're in GitHub, click the pencil icon to edit this page:

    ![README Pencil Icon](./static/images/contributing/readme-pencil-icon.png)

1. GitHub will _fork_ the repository for you. This creates a copy of the `clickhouse-docs` repository on your personal GitHub account.
1. Make your changes in the textbox. Once you're done, click **Commit changes**:

    ![README Commit Changes](./static/images/contributing/readme-commit-changes.png)

1. In the **Propose changes** popup, enter a descriptive title to explain the changes you just made. Keep this title to 10 words or less. If your changes are fairly complex and need further explanation, enter your comments into the **Extended description** field.
1. Make sure **Create a new branch** is selected, and click **Propose changes**:

    ![README Propose Changes](./static/images/contributing/readme-propose-changes.png)

1. A new page should open with a new pull request. Double-check that the title and description are accurate.
1. If you've spoken to someone on the docs team about your changes, tag them into the **Reviewers** section:

    ![README Create Pull Request](./static/images/contributing/readme-create-pull-request.png)

    If you haven't mentioned your changes to anyone yet, leave the **Reviewers** section blank.

1. Click **Create pull request**.

At this point, your pull request will be handed over to the docs team, who will review it and suggest or make changes where necessary.

## Issues {#issues}

Found a problem with the Clickhouse docs site? [Please raise an issue](https://github.com/clickhouse/clickhouse-docs/issues/new). Be as specific and descriptive as possible; screenshots help!

## License {#license}

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).
