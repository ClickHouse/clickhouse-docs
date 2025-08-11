---
sidebar_label: 'Configurable Backups'
slug: /cloud/manage/backups/configurable-backups
description: 'Configurable Backups'
title: 'Configurable Backups'
keywords: ['backups', 'cloud backups', 'restore']
doc_type: 'how-to'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloud allows you to configure the schedule for your backups for **Scale** and **Enterprise** tier services. Backups can be configured along the following dimensions based on your business needs.

- **Retention**: The duration of days, for which each backup will be retained. Retention can be specified as low as 1 day, and as high as 30 days with several values to pick in between.
- **Frequency**: The frequency allows you to specify the time duration between subsequent backups. For instance, a frequency of "every 12 hours" means that backups will be spaced 12 hours apart. Frequency can range from "every 6 hours" to "every 48 hours" in the following hourly increments: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`.
- **Start Time**: The start time for when you want to schedule backups each day. Specifying a start time implies that the backup "Frequency" will default to once every 24 hours.  Clickhouse Cloud will start the backup within an hour of the specified start time.

:::note
The custom schedule will override the default backup policy in ClickHouse Cloud for your given service.
:::

:::note
In some rare scenarios, the backup scheduler will not respect the **Start Time** specified for backups. Specifically, this happens if there was a successful backup triggered < 24 hours from the time of the currently scheduled backup. This could happen due to a retry mechanism we have in place for backups. In such instances, the scheduler will skip over the backup for the current day, and will retry the backup the next day at the scheduled time. 
:::

To configure the backup schedule for a service, go to the **Settings** tab in the console and click on **Change backup configuration**.

<Image img={backup_settings} size="lg" alt="Configure backup settings" border/>

This opens a tab to the right where you can choose values for retention, frequency, and start time. You will need to save the chosen settings for them to take effect.

<Image img={backup_configuration_form} size="lg" alt="Select backup retention and frequency" border/>

:::note
Start time and frequency are mutually exclusive. Start time takes precedence.
:::

:::note
Changing the backup schedule can cause higher monthly charges for storage as some of the backups might not be covered in the default backups for the service. See ["Understanding backup cost"](./overview.md/#understanding-backup-cost) section below.
:::
