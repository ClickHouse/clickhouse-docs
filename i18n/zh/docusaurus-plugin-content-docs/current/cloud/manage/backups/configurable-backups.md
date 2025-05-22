---
'sidebar_label': '可配置备份'
'slug': '/cloud/manage/backups/configurable-backups'
'description': '可配置备份'
'title': '可配置备份'
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

ClickHouse Cloud 允许您为 **Scale** 和 **Enterprise** 级别的服务配置备份的时间表。备份可以根据您的业务需求在以下几个维度进行配置。

- **保留期**: 每个备份将被保留的天数。保留期可以低至 1 天，高可达 30 天，并且有多个中间值可供选择。
- **频率**: 频率允许您指定后续备份之间的时间间隔。例如，"每 12 个小时" 的频率意味着备份会相隔 12 个小时。频率范围从 "每 6 个小时" 到 "每 48 个小时"，增加单位为： `6`、`8`、`12`、`16`、`20`、`24`、`36`、`48`。
- **开始时间**: 您希望每天安排备份的开始时间。指定开始时间意味着备份的 "频率" 默认将为每 24 小时一次。ClickHouse Cloud 将在指定的开始时间的一小时内开始备份。

:::note
自定义时间表将覆盖 ClickHouse Cloud 中您所提供服务的默认备份策略。
:::

要为服务配置备份时间表，请进入控制台中的 **设置** 选项卡，然后点击 **更改备份配置**。

<Image img={backup_settings} size="lg" alt="配置备份设置" border/>

这会在右侧打开一个选项卡，您可以在此选择保留期、频率和开始时间的值。您需要保存所选设置，以使其生效。

<Image img={backup_configuration_form} size="lg" alt="选择备份保留期和频率" border/>

:::note
开始时间和频率是互斥的。开始时间优先。
:::

:::note
更改备份时间表可能会导致更高的存储月费用，因为一些备份可能不包含在服务的默认备份中。请查看下面的 ["理解备份费用"](./overview.md/#understanding-backup-cost) 部分。
:::
