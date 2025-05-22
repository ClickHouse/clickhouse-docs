---
'sidebar_label': '升级'
'slug': '/manage/updates'
'title': '升级'
'description': '使用 ClickHouse Cloud，您无需担心修补和升级。我们定期推出包括修复、新功能和性能改进的升级。'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';

# 升级

使用 ClickHouse Cloud，您无需担心补丁和升级。我们定期推出包括修复、新功能和性能改进的升级。有关 ClickHouse 中新内容的完整列表，请参阅我们的 [Cloud changelog](/cloud/reference/changelog.md)。

:::note
我们引入了一种新的升级机制，我们称之为“先做再说”（或 MBB）。通过这种新方法，我们在升级操作期间添加更新的副本，然后再移除旧的副本。这样可以实现更无缝的升级，对正在运行的工作负载影响更小。

作为此更改的一部分，历史系统表数据将在升级事件中保留最长 30 天。此外，AWS 或 GCP 上的服务中，2024年12月19日之前的任何系统表数据将不会保留；Azure 上的服务中，2025年1月14日之前的系统表数据将不会在迁移到新组织层级时保留。
:::

## 版本兼容性 {#version-compatibility}

当您创建服务时，[`compatibility`](/operations/settings/settings#compatibility) 设置将被设定为您服务初始配置时 ClickHouse Cloud 提供的最新版本。

`compatibility` 设置允许您使用先前版本的设置默认值。当您的服务升级到新版本时，`compatibility` 设置指定的版本不会改变。这意味着在您第一次创建服务时存在的设置的默认值不会改变（除非您已经覆盖了这些默认值，在这种情况下它们将在升级后持续有效）。

您无法管理服务的 `compatibility` 设置。如果您希望更改 `compatibility` 设置的版本，需要 [联系支持](https://clickhouse.com/support/program)。

## 维护模式 {#maintenance-mode}

有时，我们可能需要更新您的服务，这可能要求我们禁用某些功能，例如缩放或闲置。在少数情况下，我们可能需要对正在发生问题的服务采取措施，将其恢复到健康状态。在此维护期间，您将在服务页面上看到一条横幅，上面写着 _"维护进行中"_。在此期间，您仍然可以使用该服务进行查询。

在服务维护期间，您无需为该时间段付费。_维护模式_ 是一种罕见的情况，不应与常规服务升级混淆。

## 发布渠道（升级时间表） {#release-channels-upgrade-schedule}

您可以通过订阅特定发布渠道来指定 ClickHouse Cloud 服务的升级时间表。

### 快速发布渠道（提前升级） {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="快速发布渠道"/>

除了常规升级时间表外，如果您希望您的服务提前接收更新，我们还提供一个 **快速发布** 渠道。

具体来说，服务将：

- 接收最新的 ClickHouse 版本
- 当有新版本经过测试时，会更频繁地进行升级

您可以在 Cloud 控制台中修改服务的发布计划，如下所示：

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="选择计划" border/>
</div>
<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="选择计划" border/>
</div>
<br/>

此 **快速发布** 渠道适合在非关键环境中测试新功能。**不建议用于具有严格正常运行时间和可靠性要求的生产工作负载。**

### 常规发布渠道 {#regular-release-channel}

对于所有没有配置发布渠道或升级时间表的 Scale 和 Enterprise 级别服务，升级将作为常规渠道发布的一部分进行。这对于生产环境是推荐的。

常规发布渠道的升级通常在 **快速发布渠道** 发布后两周进行。

:::note
基本层级的服务在快速发布渠道之后不久即会升级。
:::

## 定期升级 {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="定期升级" linking_verb_are="true"/>

用户可以为 Enterprise 级别的服务配置升级窗口。

选择您希望指定升级时间表的服务，然后从左侧菜单中选择 `设置`。向下滚动到 `定期升级`。

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="定期升级" border/>
</div>
<br/>

选择此选项将允许用户选择数据库和云升级的星期几/时间窗口。

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="定期升级窗口" border/>
</div>
<br/>
:::note
虽然定期升级遵循定义的时间表，但对于关键的安全补丁和漏洞修复，有例外情况。在发现紧急安全问题时，可能会在scheduled window之外进行升级。客户将在必要时收到此类例外的通知。
:::
