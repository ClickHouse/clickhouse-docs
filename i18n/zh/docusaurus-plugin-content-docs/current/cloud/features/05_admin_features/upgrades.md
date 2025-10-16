---
'sidebar_label': '升级'
'slug': '/manage/updates'
'title': '升级'
'description': '使用 ClickHouse Cloud，您无需担心修补和升级。我们定期推出包括修复、新功能和性能改进的升级。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# 升级

使用 ClickHouse Cloud，您无需担心打补丁和升级。我们定期推出升级，包括修复、新功能和性能改进。有关 ClickHouse 中新内容的完整列表，请参阅我们的 [Cloud changelog](/whats-new/cloud)。

:::note
我们引入了一种新的升级机制，一个我们称之为“先行后断”（或 MBB）的概念。在这种新方法中，我们在升级操作过程中添加更新的副本，然后再删除旧的副本。这使得升级更加无缝，对运行中的工作负载的干扰更小。

作为此更改的一部分，历史系统表数据将在升级事件中保留最长可达 30 天。此外，AWS 或 GCP 上服务的任何系统表数据如果早于 2024 年 12 月 19 日，Azure 上服务的如果早于 2025 年 1 月 14 日，将不作为迁移到新组织层的一部分而保留。
:::

## 版本兼容性 {#version-compatibility}

当您创建服务时，[`compatibility`](/operations/settings/settings#compatibility) 设置将被设置为在您的服务首次配置时 ClickHouse Cloud 提供的最新版本。

`compatibility` 设置允许您使用先前版本的设置的默认值。当您的服务升级到新版本时，指定的 `compatibility` 设置的版本不会改变。这意味着在您首次创建服务时存在的设置的默认值不会更改（除非您已经覆盖了这些默认值，在这种情况下，它们将在升级后继续保持）。

您无法管理服务级默认的 `compatibility` 设置。如果您希望更改服务默认的 `compatibility` 设置的版本，必须 [联系支持](https://clickhouse.com/support/program)。但是，您可以使用标准 ClickHouse 设置机制（例如在会话中使用 `SET compatibility = '22.3'` 或在查询中使用 `SETTINGS compatibility = '22.3'`）在用户、角色、配置文件、查询或会话级别覆盖 `compatibility` 设置。

## 维护模式 {#maintenance-mode}

有时，我们可能需要更新您的服务，这可能需要我们禁用某些功能，例如缩放或闲置。在少数情况下，我们可能需要对出现问题的服务采取措施，并将其恢复到健康状态。在维护期间，您将在服务页面上看到一条显示为 _“正在维护”_ 的横幅。在此期间，您仍然可以使用该服务进行查询。

在服务维护期间，您不会被收取费用。 _维护模式_ 是一种少见的情况，不应与常规服务升级混淆。

## 发布频道（升级计划） {#release-channels-upgrade-schedule}

用户可以通过订阅特定发布频道来指定其 ClickHouse Cloud 服务的升级计划。共有三个发布频道，用户可以使用 **计划升级** 特性配置升级的星期几和时间。

这三个发布频道是：
- [**快速发布频道**](#fast-release-channel-early-upgrades)，用于提前访问升级。
- [**常规发布频道**](#regular-release-channel)，为默认频道，在此频道上的升级在快速发布频道升级两周后开始。如果您的 Scale 和 Enterprise 级服务没有设置发布频道，则默认情况下在常规发布频道上。
- [**缓慢发布频道**](#slow-release-channel-deferred-upgrades)，用于延迟发布。此频道上的升级在常规发布频道升级两周后进行。

:::note
基本级服务将自动加入快速发布频道。
:::

### 快速发布频道（提前升级） {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="快速发布频道"/>

除了常规的升级计划外，如果您希望您的服务在常规发布计划之前接收更新，我们提供 **快速发布** 频道。

具体来说，服务将：

- 接收最新的 ClickHouse 版本
- 随着新版本的测试，更频繁地进行升级

您可以在 Cloud 控制台中修改服务的发布计划，如下所示：

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="选择计划" border/>
</div>
<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="选择计划" border/>
</div>
<br/>

此 **快速发布** 频道适合在非关键环境中测试新功能。 **不推荐用于具有严格正常运行时间和可靠性要求的生产工作负载。**

### 常规发布频道 {#regular-release-channel}

对于所有没有配置发布频道或升级计划的 Scale 和 Enterprise 级服务，将作为常规频道发布的一部分进行升级。这推荐用于生产环境。

常规发布频道的升级通常在 **快速发布频道** 后的两周内进行。

:::note
基本级服务将在快速发布频道之后不久升级。
:::

### 缓慢发布频道（延迟升级） {#slow-release-channel-deferred-upgrades}

<EnterprisePlanFeatureBadge feature="缓慢发布频道"/>

如果您希望您的服务在常规发布计划后接收升级，我们提供 **缓慢发布** 频道。

具体来说，服务将：

- 在快速和常规发布频道的推出完成后升级
- 在常规发布后约 2 周接收 ClickHouse 发布
- 适用于希望在生产升级之前有额外时间在非生产环境中测试 ClickHouse 发布的客户。非生产环境可以在快速或常规发布频道中进行测试和验证。

:::note
您可以随时更改发布频道。但是在某些情况下，变更仅适用于未来的发布。
- 移动到更快的频道将立即升级您的服务。例如，从缓慢到常规，从常规到快速
- 移动到更慢的频道不会降级您的服务，并保持在当前版本，直到该频道中有更新版本可用。例如，从常规到缓慢，从快速到常规或缓慢
:::

## 计划升级 {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="计划升级" linking_verb_are="true"/>

用户可以为企业级服务配置升级窗口。

选择您希望指定升级计划的服务，然后从左侧菜单中选择 `设置`。向下滚动至 `计划升级`。

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="计划升级" border/>
</div>
<br/>

选择此选项将允许用户选择每周的某一天/时间窗口进行数据库和云升级。

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="计划升级窗口" border/>
</div>
<br/>
:::note
虽然计划的升级遵循定义的计划，但对于关键安全补丁和漏洞修复适用例外。在发现紧急安全问题的情况下，升级可能会在计划窗口外进行。需要时，客户将会被通知此类例外情况。
:::
