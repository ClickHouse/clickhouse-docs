---
sidebar_label: 可配置备份
slug: /cloud/manage/backups/configurable-backups
description: 可配置备份
title: 可配置备份
keywords: [备份, 云备份, 恢复]
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';

<ScalePlanFeatureBadge feature="可配置备份" linking_verb_are="True"/>

ClickHouse Cloud 允许您为 **Scale** 和 **Enterprise** 级服务配置备份的时间表。根据您的业务需求，可以在以下几个维度上配置备份。

- **保留**: 每个备份保留的天数。保留时间可以指定为最低 1 天，最高可达 30 天，且在此范围内有多个值可供选择。
- **频率**: 频率允许您指定后续备份之间的时间间隔。例如，"每 12 小时一次"的频率意味着备份之间相隔 12 小时。频率范围从 "每 6 小时" 到 "每 48 小时"，可选择的小时增量为: `6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`。
- **开始时间**: 您希望每天安排备份的开始时间。指定开始时间意味着备份的 "频率" 默认每 24 小时一次。 ClickHouse Cloud 将在指定开始时间的一个小时内启动备份。

:::note
自定义时间表将覆盖 ClickHouse Cloud 中您所选服务的默认备份政策。
:::

要配置服务的备份时间表，请转到控制台中的 **设置** 选项卡，然后单击 **更改备份配置**。

<div class="eighty-percent">
    <img src={backup_settings}
        alt="配置备份设置"
        class="image"
    />
</div>
<br/>

这将在右侧打开一个标签，您可以在其中选择保留、频率和开始时间的值。您需要保存所选设置以使其生效。

<div class="eighty-percent">
    <img src={backup_configuration_form}
        alt="选择备份保留和频率"
        class="image"
    />
</div>
<br/>

:::note
开始时间和频率是互斥的。开始时间具有优先权。
:::

:::note
更改备份时间表可能会导致每月的存储费用增加，因为一些备份可能不包含在服务的默认备份中。请参阅下方的 ["理解备份成本"](./overview.md/#understanding-backup-cost) 部分。
:::
