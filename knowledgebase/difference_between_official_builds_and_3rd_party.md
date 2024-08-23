---
date: 2023-06-26
---

# What is the difference between official ClickHouse builds and 3rd-party builds?

## Question

I see other vendors providing their own builds of ClickHouse. What is the difference between official ClickHouse builds and these 3rd-party builds?

## Answer

Here are some of the differences we have observed with other builds:

- The strings **"official"** are replaced with the name of the vendor
- They appear after several months of delay and ***don't include recent bug fixes***, which means these builds can contain vulnerabilities that have been fixed in the official versions
- The builds are not bit-identical, and the addresses in the code are different. As a result, stack traces from these builds cannot be analyzed, and the ClickHouse team cannot answer questions about these builds
- The builds are not auditable or reproducible - there is no publicly accessible CI system with the same build logs
- The ClickHouse test suite is not run on these builds, so they are not verified to work by the test suite
- They might not be available for all architectures (like ARM, etc.)
- Sometimes they include patches targeted for one particular customer that can break compatibility and introduce extra risk

We recommend running the latest version of ClickHouse using the official builds following the [install instructions](https://clickhouse.com/docs/en/install) in the documentation:

- We release a **stable version** every month, and three latest stable releases are supported in terms of diagnostics and backporting of bug fixes.
- We also release a **long-term support (LTS) version** twice a year that is supported for a year after its initial release, which is really only meant for companies that do not allow for frequent upgrades or using non-LTS software. (We are big fans of the monthly stable builds!)

We have [more details between stable vs. LTS releases](https://clickhouse.com/docs/en/faq/operations/production#how-to-choose-between-clickhouse-releases) in the docs.
