---
'sidebar_label': '升级'
'slug': '/manage/updates'
'title': '升级'
'description': '使用 ClickHouse Cloud，您无需担心打补丁和升级。我们会定期推出包含修复程序、新功能和性能改进的升级。'
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# 升级

使用 ClickHouse Cloud，您无需担心修补和升级。我们定期推出升级，其中包含修复、新特性和性能改进。有关 ClickHouse 中的新功能的完整列表，请参阅我们的 [Cloud changelog](/cloud/reference/changelog.md)。

:::note
我们引入了一种新的升级机制，我们称之为“先创建后删除”(make before break，简称 MBB)。通过这种新方法，我们在升级操作期间，在删除旧副本之前添加更新的副本。这将实现更顺畅的升级，减少对运行工作负载的干扰。

作为此变更的一部分，历史系统表数据将在升级事件中保留最长 30 天。此外，对于 AWS 或 GCP 上的服务，任何在 2024 年 12 月 19 日之前的数据表数据将不被保留，而对于 Azure 上的服务，任何在 2025 年 1 月 14 日之前的数据表数据也将不被保留，这都是为了迁移到新的组织层级。
:::

## 版本兼容性 {#version-compatibility}

当您创建服务时，[`compatibility`](/operations/settings/settings#compatibility) 设置将被设置为您服务首次配置时 ClickHouse Cloud 提供的最新 ClickHouse 版本。

`compatibility` 设置允许您使用之前版本的设置的默认值。当您的服务升级到新版本时，`compatibility` 设置中指定的版本不会改变。这意味着当您首次创建服务时存在的设置的默认值不会改变（除非您已经覆盖了这些默认值，在这种情况下，它们会在升级后保留）。

您无法管理服务的 `compatibility` 设置。如果您希望更改您 `compatibility` 设置所指定的版本，您必须 [联系支持](https://clickhouse.com/support/program)。

## 维护模式 {#maintenance-mode}

有时，我们可能需要更新您的服务，这可能需要我们禁用某些功能，例如扩展或空闲。在少数情况下，我们可能需要对出现问题的服务采取措施，使其恢复到健康状态。在此类维护期间，您将在服务页面看到一条横幅，上面写着 _“维护进行中”_。在此期间，您仍然可以使用该服务进行查询。

在服务维护期间，您将不会被收取费用。_维护模式_ 是一种罕见的情况，不应与常规服务升级混淆。

## 发布渠道（升级计划） {#release-channels-upgrade-schedule}

您可以通过订阅特定的发布渠道来指定您的 ClickHouse Cloud 服务的升级计划。

### 快速发布渠道（提前升级） {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature="快速发布渠道"/>

除了常规升级计划外，如果您希望您的服务在常规发布计划之前收到更新，我们提供了 **快速发布** 渠道。

具体而言，服务将：

- 收到最新的 ClickHouse 发布
- 在新版本经过测试后进行更频繁的升级

您可以按照如下所示在 Cloud 控制台中修改服务的发布计划：

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="选择计划" border/>
</div>
<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="选择计划" border/>
</div>
<br/>

此 **快速发布** 渠道适用于在非关键环境中测试新功能。**不建议在对正常运行时间和可靠性要求严格的生产工作负载中使用。**

### 常规发布渠道 {#regular-release-channel}

对于所有未配置发布渠道或升级计划的 Scale 和 Enterprise 级别服务，升级将作为常规渠道发布的一部分进行。这对于生产环境是推荐的。

常规发布渠道的升级通常在 **快速发布渠道** 后两周进行。

:::note
基础层级的服务在快速发布渠道后不久进行升级。
:::

## 定期升级 {#scheduled-upgrades}

<EnterprisePlanFeatureBadge feature="定期升级" linking_verb_are="true"/>

用户可以为企业级服务配置升级窗口。

选择您希望指定升级计划的服务，然后从左侧菜单选择 `Settings`。滚动到 `Scheduled upgrades`。

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
虽然定期升级遵循定义的时间表，但对于关键安全补丁和漏洞修复的例外情况适用。如果发现紧急安全问题，可能会在计划窗口之外进行升级。客户将在必要时被通知此类例外情况。
:::
