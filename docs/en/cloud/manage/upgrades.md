---
sidebar_label: Upgrades
slug: /en/manage/updates
---

# Upgrades

With ClickHouse Cloud you never have to worry about patching and upgrades. We roll out upgrades that include fixes, new features and performance improvements on a periodic basis. For the full list of what is new with ClickHouse refer to our [Cloud changelog](/docs/en/cloud/reference/changelog.md).

## Use the default settings of a ClickHouse release

If you want to specify that a ClickHouse Cloud service has the setting defaults of a particular ClickHouse version, then you can set the compatibility setting to the desired version.  For example, to specify version `22.8` you could use: `ALTER USER default SETTINGS compatibility = '22.8'`. This changes other settings according to the provided ClickHouse version. This compatibility setting allows you to use default values from previous versions for all the settings that were not set by the user.
