---
sidebar_label: '配置备份计划'
slug: /cloud/manage/backups/configurable-backups
description: '配置备份的操作指南'
title: '配置备份计划'
keywords: ['backups', 'cloud backups', 'restore']
doc_type: 'guide'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True" />

要为某个服务配置备份计划，请在控制台中打开 **Settings** 选项卡，然后点击 **Change backup configuration**。

<Image img={backup_settings} size="lg" alt="配置备份设置" border />

这会在右侧打开一个选项卡，您可以在其中选择保留期限、频率和开始时间。您需要保存所选设置后，它们才会生效。

<Image img={backup_configuration_form} size="lg" alt="选择备份保留期限和频率" border />

:::note
开始时间和频率是互斥的。开始时间具有更高优先级。
:::

:::note
更改备份计划可能会导致更高的月度存储费用，因为某些备份可能不在该服务的默认备份范围内。请参阅下文 [&quot;Understanding backup cost&quot;](/cloud/manage/backups/overview#understanding-backup-cost) 部分。
:::
