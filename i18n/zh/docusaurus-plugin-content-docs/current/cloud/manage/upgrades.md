---
sidebar_label: '升级'
slug: '/manage/updates'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# 升级

使用 ClickHouse Cloud，您不必担心打补丁和升级。我们会定期推出包括修复、新功能和性能改进的升级。有关 ClickHouse 新功能的完整列表，请参考我们的 [Cloud changelog](/cloud/reference/changelog.md)。

:::note
我们正在引入一种新的升级机制，我们称之为“先做后断”（或 MBB）。在这种新方法中，我们会在移除旧的副本之前添加更新后的副本。这使得升级过程更加平滑，对正在运行的工作负载的干扰更小。

作为此变更的一部分，历史系统表数据将会在升级事件中保留最多 30 天。此外，对于 AWS 或 GCP 上的服务，任何早于 2024 年 12 月 19 日的系统表数据以及对于 Azure 上的服务，任何早于 2025 年 1 月 14 日的系统表数据将不会在迁移到新组织层时保留。
:::

## 版本兼容性 {#version-compatibility}

当您创建服务时，[`compatibility`](/operations/settings/settings#compatibility) 设置会被设置为您初始化提供服务时 ClickHouse Cloud 提供的最新 ClickHouse 版本。

`compatibility` 设置允许您使用先前版本设置的默认值。当您的服务升级到新版本时，`compatibility` 设置中指定的版本不会更改。这意味着在您首次创建服务时存在的设置的默认值不会更改（除非您已经覆盖了这些默认值，在这种情况下它们将会在升级后保留）。

您无法管理服务的 `compatibility` 设置。如果您想更改 `compatibility` 设置中设置的版本，您必须 [联系支持](https://clickhouse.com/support/program)。

## 维护模式 {#maintenance-mode}

有时，我们可能需要更新您的服务，这可能需要我们禁用某些功能，例如扩展或待机。在少数情况下，我们可能需要对遇到问题的服务进行操作，并将其恢复到健康状态。在这种维护期间，您会在服务页面上看到一条横幅，上面写着 _“维护进行中”_。您仍然可以在此期间使用服务进行查询。

在服务维护期间，您不会被收取费用。_维护模式_ 是一种少见的情况，不应与常规服务升级混淆。

## 发布通道（升级计划） {#release-channels-upgrade-schedule}

您可以通过订阅特定的发布通道来自定义您的 ClickHouse Cloud 服务的升级计划。

### 快速发布通道（提前升级） {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="快速发布通道"/>

除了常规的升级计划，我们还提供 **快速发布** 通道，如果您希望您的服务在常规发布计划之前接收更新。

具体而言，服务将会：

- 接收最新的 ClickHouse 版本
- 更频繁的升级，因为会测试新版本

您可以在 Cloud 控制台中按如下方式修改服务的发布计划：

<div class="eighty-percent">
    <img alt="选择计划" src={fast_release} />
</div>
<br/>

<div class="eighty-percent">
    <img alt="选择计划" src={enroll_fast_release} />
</div>
<br/>

此 **快速发布** 通道适合在非关键环境中测试新功能。**不建议在对正常运行时间和可靠性要求严格的生产工作负载中使用。**

### 常规发布通道 {#regular-release-channel}

对于没有配置发布通道或升级计划的所有 Scale 和 Enterprise 级服务，升级将作为常规通道发布的一部分进行。建议在生产环境中使用此选项。

常规发布通道的升级通常在 **快速发布通道** 后的两周内进行。

:::note
基础级服务的升级通常在快速发布通道后不久进行。
:::

## 计划升级 {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="计划升级" linking_verb_are="true"/>

用户可以为 Enterprise 级服务配置升级窗口。

选择您希望指定升级时间表的服务，然后从左侧菜单中选择 `设置`。滚动到 `计划升级`。

<div class="eighty-percent">
    <img alt="计划升级" src={scheduled_upgrades} />
</div>
<br/>

选择此选项将允许用户选择数据库和云升级的星期几/时间窗口。

<div class="eighty-percent">
    <img alt="计划升级窗口" src={scheduled_upgrade_window} />
</div>
<br/>
:::note
尽管计划升级遵循已定义的时间表，但对关键安全补丁和漏洞修复适用例外。在发现紧急安全问题的情况下，可能会在计划窗口之外进行升级。客户将在必要时被通知此类例外情况。
:::
