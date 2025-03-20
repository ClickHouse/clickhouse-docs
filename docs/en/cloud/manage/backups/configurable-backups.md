---
sidebar_label: Configurable Backups
slug: /en/cloud/manage/backups/configurable-backups
description: Configurable Backups
title: Configurable Backups
keywords: [backups, cloud backups, restore]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloud allows you to configure the schedule for your backups for **Scale** and **Enterprise** tier services. Backups can be configured along the following dimensions based on your business needs.

- **Retention**: The duration of days, for which each backup will be retained. Retention can be specified as low as 1 day, and as high as 30 days with several values to pick in between.
- **Frequency**: The frequency allows you to specify the time duration between subsequent backups. For instance, a frequency of "every 12 hours" means that backups will be spaced 12 hours apart. Frequency can range from "every 6 hours" to "every 48 hours" in the following hourly increments: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`.
- **Start Time**: The start time for when you want to schedule backups each day. Specifying a start time implies that the backup "Frequency" will default to once every 24 hours.  Clickhouse Cloud will start the backup within an hour of the specified start time.

:::note
The custom schedule will override the default backup policy in ClickHouse Cloud for your given service.
:::

To configure the backup schedule for a service, go to the **Settings** tab in the console and click on **Change backup configuration**.

<div class="eighty-percent">
![Configure backup settings](../images/backup-settings.png)
</div>
<br/>

This opens a tab to the right where you can choose values for retention, frequency, and start time. You will need to save the chosen settings for them to take effect.

<div class="eighty-percent">
![Select backup retention and frequency](../images/backup-configuration-form.png)
</div>
<br/>

:::note
Start time and frequency are mutually exclusive. Start time takes precedence.
:::

:::note
Changing the backup schedule can cause higher monthly charges for storage as some of the backups might not be covered in the default backups for the service. See ["Understanding backup cost"](./overview.md/#understanding-backup-cost) section below.
:::