---
'sidebar_label': '升级'
'slug': '/manage/updates'
'title': '升级'
'description': '使用 ClickHouse Cloud，您无需担心补丁和升级。我们会定期推出包含修复、新功能和性能改进的升级。'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# 升级

使用 ClickHouse Cloud，您无需担心修补和升级。我们会定期推出包含修复、新功能和性能改进的升级。有关 ClickHouse 的完整新特性列表，请参阅我们的 [Cloud changelog](/cloud/reference/changelog.md)。

:::note
我们正在引入一种新的升级机制，一个我们称之为“先升级后替换”（或 MBB）的概念。在此新方法中，我们在移除旧副本之前，会添加更新后的副本。这会导致更平滑的升级，并减少对正在运行的工作负载的干扰。

作为这一变化的一部分，历史系统表数据将在升级事件中保留最多 30 天。此外，任何 2024 年 12 月 19 日之前的系统表数据（对于 AWS 或 GCP 上的服务），以及任何 2025 年 1 月 14 日之前的系统表数据（对于 Azure 上的服务）将不会在迁移到新组织层时保留。
:::

## 版本兼容性 {#version-compatibility}

创建服务时，[`compatibility`](/operations/settings/settings#compatibility) 设置会被设置为您的服务首次配置时 ClickHouse Cloud 提供的最新 ClickHouse 版本。

`compatibility` 设置允许您使用先前版本的设置默认值。当您的服务升级到新版本时，`compatibility` 设置中指定的版本不会改变。这意味着您首次创建服务时存在的设置默认值不会改变（除非您已经覆盖了这些默认值，在这种情况下，它们将在升级后保留）。

您无法管理服务的 `compatibility` 设置。如果您希望更改 `compatibility` 设置中的版本，必须 [联系支持](https://clickhouse.com/support/program)。

## 维护模式 {#maintenance-mode}

有时，我们需要更新您的服务，这可能需要禁用某些功能，例如扩展或闲置。在少数情况下，我们可能需要对遇到问题的服务采取措施，使其恢复到健康状态。在此类维护期间，您将在服务页面上看到一条消息 _“维护进行中”_。在此期间，您仍然可以使用该服务进行查询。

在服务处于维护状态时，您将不会被收取费用。_维护模式_ 是一种罕见的情况，不应与常规服务升级混淆。

## 发布渠道（升级计划） {#release-channels-upgrade-schedule}

您可以通过订阅特定的发布渠道来指定 ClickHouse Cloud 服务的升级计划。

### 快速发布渠道（提前升级） {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="The fast release channel"/>

除了常规升级计划外，如果您希望您的服务比常规发布计划更早接收更新，我们还提供 **快速发布** 渠道。

具体而言，服务将会：

- 接收最新的 ClickHouse 版本
- 在测试新版本时更频繁地进行升级

您可以如下面所示在云控制台中修改服务的发布计划：

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="选择计划" border/>
</div>
<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="选择计划" border/>
</div>
<br/>

此 **快速发布** 渠道适合在非关键环境中测试新功能。**不推荐在具有严格正常运行时间和可靠性要求的生产工作负载中使用。**

### 常规发布渠道 {#regular-release-channel}

对于所有没有配置发布渠道或升级计划的 Scale 和 Enterprise 级别服务，升级将作为常规渠道发布的一部分进行。这在生产环境中是推荐的做法。

常规发布渠道的升级通常在 **快速发布渠道** 之后的两周内进行。

:::note
基本层的服务在快速发布渠道之后不久也会进行升级。
:::

## 计划升级 {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="Scheduled upgrades" linking_verb_are="true"/>

用户可以为 Enterprise 级别服务配置升级窗口。

选择您希望指定升级计划的服务，然后在左侧菜单中选择 `Settings`。滚动到 `Scheduled upgrades`。

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="计划升级" border/>
</div>
<br/>

选择此选项将允许用户选择数据库和云升级的星期几/时间窗口。

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="计划升级窗口" border/>
</div>
<br/>
:::note
虽然计划的升级遵循定义的时间表，但对于关键安全补丁和漏洞修复的例外情况适用。如果发现紧急安全问题，升级可能会在计划窗口之外进行。客户将根据需要被通知这些例外情况。
:::
