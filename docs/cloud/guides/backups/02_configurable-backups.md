---
sidebar_label: 'Configure backup schedules'
slug: /cloud/manage/backups/configurable-backups
description: 'Guide showing how to configure backups'
title: 'Configure backup schedules'
keywords: ['backups', 'cloud backups', 'restore']
doc_type: 'guide'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

To configure the backup schedule for a service, go to the **Settings** tab in the console and click on **Change backup configuration**.

<Image img={backup_settings} size="lg" alt="Configure backup settings" border/>

This opens a tab to the right where you can choose values for retention, frequency, and start time. You will need to save the chosen settings for them to take effect.

<Image img={backup_configuration_form} size="lg" alt="Select backup retention and frequency" border/>

:::note
Start time and frequency are mutually exclusive. Start time takes precedence.
:::

:::note
Changing the backup schedule can cause higher monthly charges for storage as some of the backups might not be covered in the default backups for the service. See ["Understanding backup cost"](/cloud/manage/backups/overview#understanding-backup-cost) section below.
:::
