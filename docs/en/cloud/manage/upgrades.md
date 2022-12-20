---
sidebar_label: Upgrades
slug: /en/manage/updates
---

# Upgrades

With ClickHouse Cloud you never have to worry about patching and upgrades. We roll out upgrades that include fixes, new features and performance improvements on a periodic basis. For the full list of what is new with ClickHouse refer to our [Cloud changelog](/docs/en/cloud/reference/changelog.md).

## Use the default settings of a previous ClickHouse release {#use-the-default-settings-of-a-clickhouse-release}

The `compatibility` setting causes ClickHouse to use the default settings of a previous version of ClickHouse, where the previous version is provided as the setting.

If settings are set to non-default values, then those settings are honored (only settings that have not been modified are affected by the `compatibility` setting).

This setting takes a ClickHouse version number as a string, like `22.3`, `22.8`. An empty value means that this setting is disabled.

Disabled by default.

:::note
In ClickHouse Cloud the compatibility setting must be set by ClickHouse Cloud support.  Please [open a case](https://clickhouse.cloud/support) to have it set.
:::
