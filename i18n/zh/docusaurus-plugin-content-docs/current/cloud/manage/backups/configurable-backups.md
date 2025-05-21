---
'sidebar_label': '可配置备份'
'slug': '/cloud/manage/backups/configurable-backups'
'description': '可配置备份'
'title': 'Configurable Backups'
'keywords':
- 'backups'
- 'cloud backups'
- 'restore'
---

import backup_settings from '@site/static/images/cloud/manage/backup-settings.png';
import backup_configuration_form from '@site/static/images/cloud/manage/backup-configuration-form.png';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import Image from '@theme/IdealImage';

<ScalePlanFeatureBadge feature="可配置备份" linking_verb_are="True"/>

ClickHouse Cloud 允许您为 **Scale** 和 **Enterprise** 级服务配置备份的计划。可以根据您的业务需求在以下维度上配置备份。

- **保留时间**: 每个备份保留的天数。保留时间可以指定为最低 1 天，最高可达到 30 天，中间有多个值可供选择。
- **频率**: 频率允许您指定后续备份之间的时间间隔。例如，频率为“每 12 小时”意味着备份间隔为 12 小时。频率范围从“每 6 小时”到“每 48 小时”，具体小时增量为：`6`、`8`、`12`、`16`、`20`、`24`、`36`、`48`。
- **开始时间**: 您希望每天调度备份的开始时间。指定开始时间意味着备份的“频率”将默认为每 24 小时一次。 ClickHouse Cloud 将在指定开始时间范围内的一小时内开始备份。

:::note
自定义计划将覆盖 ClickHouse Cloud 中您所给服务的默认备份策略。
:::

要为服务配置备份计划，请转到控制台中的 **设置** 选项卡，然后点击 **更改备份配置**。

<Image img={backup_settings} size="lg" alt="配置备份设置" border/>

这将在右侧打开一个选项卡，您可以选择保留时间、频率和开始时间的值。您需要保存所选的设置，以使其生效。

<Image img={backup_configuration_form} size="lg" alt="选择备份保留时间和频率" border/>

:::note
开始时间和频率是互斥的。开始时间优先。
:::

:::note
更改备份计划可能会导致更高的存储每月费用，因为某些备份可能不包含在服务的默认备份中。请参见下面的 [“了解备份成本”](./overview.md/#understanding-backup-cost) 部分。
:::
