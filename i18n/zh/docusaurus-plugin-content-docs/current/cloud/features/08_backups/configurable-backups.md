---
'sidebar_label': '可配置的备份'
'slug': '/cloud/manage/backups/configurable-backups'
'description': '可配置的备份'
'title': '可配置的备份'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
'doc_type': 'guide'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="Configurable Backups" linking_verb_are="True"/>

ClickHouse Cloud 允许您为 **Scale** 和 **Enterprise** 等级服务配置备份计划。备份可以根据您的业务需求沿以下维度进行配置。

- **保留期**: 每个备份将保留的天数。保留期可以指定为最低 1 天，最高 30 天，中间有多个值可选。
- **频率**: 频率允许您指定后续备份之间的时间间隔。例如，“每 12 小时一次”的频率意味着备份将相隔 12 小时。频率范围从“每 6 小时一次”到“每 48 小时一次”，按以下小时增量：`6`, `8`, `12`, `16`, `20`, `24`, `36`, `48`。
- **开始时间**: 您希望每天安排备份的开始时间。指定开始时间意味着备份的“频率”将默认设置为每 24 小时一次。ClickHouse Cloud 将在指定开始时间的一小时内开始备份。

:::note
自定义计划将覆盖 ClickHouse Cloud 对您所提供服务的默认备份策略。
:::

:::note
在一些罕见的情况下，备份调度程序不会尊重为备份指定的 **开始时间**。具体来说，如果在当前计划备份时间的 < 24 小时 内触发了成功的备份，就会发生这种情况。这可能是由于我们为备份设置的重试机制。在这种情况下，调度程序将跳过当天的备份，并将在次日的计划时间重试备份。
:::

要配置服务的备份计划，请转到控制台中的 **设置** 选项卡，然后单击 **更改备份配置**。

<Image img={backup_settings} size="lg" alt="配置备份设置" border/>

这将在右侧打开一个选项卡，您可以在其中选择保留期、频率和开始时间的值。您需要保存所选设置以使其生效。

<Image img={backup_configuration_form} size="lg" alt="选择备份保留期和频率" border/>

:::note
开始时间和频率是相互排斥的。开始时间优先。
:::

:::note
更改备份计划可能会导致每月存储费用增加，因为某些备份可能不包含在服务的默认备份中。请参见下面的 ["理解备份成本"](./overview.md/#understanding-backup-cost) 部分。
:::
