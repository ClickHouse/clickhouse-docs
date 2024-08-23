---
title: Which ClickHouse version to use in production?
description: "First of all, let’s discuss why people ask this question in the first place. There are two key reasons..."
date: 2021-09-01
---

# Which ClickHouse Version to Use in Production? {#which-clickhouse-version-to-use-in-production}

First of all, let’s discuss why people ask this question in the first place. There are two key reasons:

1.  ClickHouse is developed with pretty high velocity, and usually there are 10+ stable releases per year. That makes a wide range of releases to choose from, which is not so trivial of a choice.
2.  Some users want to avoid spending time figuring out which version works best for their use case and just follow someone else’s advice.

The second reason is more fundamental, so we’ll start with that one and then get back to navigating through various ClickHouse releases.

## Which ClickHouse Version Do You Recommend? {#which-clickhouse-version-do-you-recommend}

It’s tempting to hire consultants or trust some known experts to get rid of responsibility for your production environment. You install some specific ClickHouse version that someone else recommended; if there’s some issue with it - it’s not your fault, it’s someone else’s. This line of reasoning is a big trap. No external person knows better than you what’s going on in your company’s production environment.

So how do you properly choose which ClickHouse version to upgrade to? Or how do you choose your first ClickHouse version? First of all, you need to invest in setting up a **realistic pre-production environment**. In an ideal world, it could be a completely identical shadow copy, but that’s usually expensive.

Here are some key points to get reasonable fidelity in a pre-production environment with not-so-high costs:

- Pre-production environment needs to run an as close of a set of queries as you intend to run in production:
    - Don’t make it read-only with some frozen data.
    - Don’t make it write-only with just copying data without building some typical reports.
    - Don’t wipe it clean instead of applying schema migrations.
- Use a sample of real production data and queries. Try to choose a sample that’s still representative and makes `SELECT` queries return reasonable results. Use obfuscation if your data is sensitive and internal policies do not allow it to leave the production environment.
- Make sure that pre-production is covered by your monitoring and alerting software the same way as your production environment does.
- If your production spans across multiple datacenters or regions, make your pre-production do the same.
- If your production uses complex features like replication, distributed tables and cascading materialized views, make sure they are configured similarly in pre-production.
- There’s a trade-off on using the roughly same number of servers or VMs in pre-production as in production but of smaller size, or much less of them but of the same size. The first option might catch extra network-related issues, while the latter is easier to manage.

The second area to invest in is **automated testing infrastructure**. Don’t assume that if some kind of query has executed successfully once, it’ll continue to do so forever. It’s OK to have some unit tests where ClickHouse is mocked, but make sure your product has a reasonable set of automated tests that are run against real ClickHouse and check that all important use cases are still working as expected.

An extra step forward could be contributing those automated tests to [ClickHouse’s open-source test infrastructure](https://github.com/ClickHouse/ClickHouse/tree/master/tests) that are continuously used in its day-to-day development. It definitely will take some additional time and effort to learn [how to run it](@site/docs/en/development/tests.md) and then how to adapt your tests to this framework, but it’ll pay off by ensuring that ClickHouse releases are already tested against them when they are announced stable, instead of repeatedly losing time on reporting the issue after the fact and then waiting for a bugfix to be implemented, backported and released. Some companies even have such test contributions to infrastructure by its use as an internal policy, (called [Beyonce’s Rule](https://www.oreilly.com/library/view/software-engineering-at/9781492082781/ch01.html#policies_that_scale_well) at Google).

When you have your pre-production environment and testing infrastructure in place, choosing the best version is straightforward:

1.  Routinely run your automated tests against new ClickHouse releases. You can do it even for ClickHouse releases that are marked as `testing`, but going forward to the next steps with them is not recommended.
2.  Deploy the ClickHouse release that passed the tests to pre-production and check that all processes are running as expected.
3.  Report any issues you discovered to [ClickHouse GitHub Issues](https://github.com/ClickHouse/ClickHouse/issues).
4.  If there were no major issues, it should be safe to start deploying ClickHouse release to your production environment. Investing in gradual release automation that implements an approach similar to [canary releases](https://martinfowler.com/bliki/CanaryRelease.html) or [green-blue deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html) might further reduce the risk of issues in production.

As you might have noticed, there’s nothing specific to ClickHouse in the approach described above - people do that for any piece of infrastructure they rely on if they take their production environment seriously.

## How to Choose Between ClickHouse Releases? {#how-to-choose-between-clickhouse-releases}

If you look into the contents of the ClickHouse package repository, you’ll see two kinds of packages:

1.  `stable`
2.  `lts` (long-term support)

Here is some guidance on how to choose between them:

- `stable` is the kind of package we recommend by default. They are released roughly monthly (and thus provide new features with reasonable delay) and three latest stable releases are supported in terms of diagnostics and backporting of bugfixes.
- `lts` are released twice a year and are supported for a year after their initial release. You might prefer them over `stable` in the following cases:
    - Your company has some internal policies that do not allow for frequent upgrades or using non-LTS software.
    - You are using ClickHouse in some secondary products that either do not require any complex ClickHouse features or do not have enough resources to keep it updated.

Many teams who initially think that `lts` is the way to go often switch to `stable` anyway because of some recent feature that’s important for their product.

:::warning
One more thing to keep in mind when upgrading ClickHouse: we’re always keeping an eye on compatibility across releases, but sometimes it’s not reasonable to keep and some minor details might change. So make sure you check the [changelog](@site/docs/en/whats-new/changelog/index.md) before upgrading to see if there are any notes about backward-incompatible changes.
:::
