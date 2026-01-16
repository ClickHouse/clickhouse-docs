---
sidebar_label: '升级'
slug: /manage/updates
title: '升级'
description: '使用 ClickHouse Cloud，您无需再为打补丁和版本升级操心。我们会定期推出包含修复、新功能以及性能改进的升级。'
doc_type: 'guide'
keywords: ['升级', '版本管理', '云功能', '维护', '更新']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'
import fast_release from '@site/static/images/cloud/manage/fast_release.png';
import enroll_fast_release from '@site/static/images/cloud/manage/enroll_fast_release.png';
import scheduled_upgrades from '@site/static/images/cloud/manage/scheduled_upgrades.png';
import scheduled_upgrade_window from '@site/static/images/cloud/manage/scheduled_upgrade_window.png';


# 升级 \{#upgrades\}

使用 ClickHouse Cloud，您无需担心打补丁和升级。我们会定期推出包含修复、新功能以及性能改进的升级版本。有关 ClickHouse 新增内容的完整列表，请参阅我们的 [Cloud 变更日志](/whats-new/cloud)。

:::note
我们正在引入一种新的升级机制，即我们称之为“make before break”（或 MBB）的概念。采用这一新方法，在执行升级操作时，我们会先添加更新后的副本，然后再移除旧副本。这样可以在尽量减少对正在运行工作负载影响的情况下，实现更加平滑的升级。

作为此次变更的一部分，在升级事件期间，历史系统表数据最多会被保留 30 天。此外，对于运行在 AWS 或 GCP 上的服务，所有早于 2024 年 12 月 19 日的系统表数据，以及对于运行在 Azure 上的服务，所有早于 2025 年 1 月 14 日的系统表数据，在迁移到新的组织层级时都不会被保留。
:::

## 版本兼容性 \\{#version-compatibility\\}

当你创建服务时，在服务首次预配的时刻，[`compatibility`](/operations/settings/settings#compatibility) 设置会被设为当时 ClickHouse Cloud 所提供的最新 ClickHouse 版本。

`compatibility` 设置允许你使用来自先前版本的默认设置值。当你的服务升级到新版本时，为 `compatibility` 设置指定的版本不会改变。这意味着，在你首次创建服务时已经存在的那些设置，其默认值不会改变（除非你已经覆盖了这些默认值，在这种情况下，升级后它们将保持不变）。

你无法在服务级别管理服务的默认 `compatibility` 设置。如果你希望更改服务默认 `compatibility` 设置所使用的版本，必须[联系技术支持](https://clickhouse.com/support/program)。不过，你可以在用户、角色、配置文件（profile）、查询或会话级别，通过标准的 ClickHouse 设置机制来覆盖 `compatibility` 设置，例如在会话中使用 `SET compatibility = '22.3'`，或在查询中使用 `SETTINGS compatibility = '22.3'`。

## 维护模式 \\{#maintenance-mode\\}

在某些情况下，我们可能需要更新您的服务，这可能会要求我们暂时禁用某些功能，例如扩缩容或空闲休眠。在极少数情况下，我们可能需要对出现问题的服务采取措施，使其恢复到健康状态。在此类维护期间，您会在服务页面上看到一条横幅，显示 _"Maintenance in progress"_。在这段时间内，您通常仍然可以继续使用该服务进行查询。

在服务处于维护状态的这段时间内，我们不会向您收取费用。_维护模式_ 的出现非常罕见，不应与常规的服务升级相混淆。

## 发布通道（升级计划） \\{#release-channels-upgrade-schedule\\}

用户可以通过订阅特定的发布通道来指定其 ClickHouse Cloud 服务的升级计划。共有三个发布通道，用户可以使用 **计划升级（scheduled upgrades）** 功能配置每周的升级日期和时间。

这三个发布通道为：
- [**快速发布通道（fast release channel）**](#fast-release-channel-early-upgrades)，用于提前获取升级。
- [**常规发布通道（regular release channel）**](#regular-release-channel) 是默认通道，该通道上的升级会在快速发布通道升级后的两周开始。如果你的 Scale 和 Enterprise 等级服务未设置发布通道，则默认处于常规发布通道。
- [**慢速发布通道（slow release channel）**](#slow-release-channel-deferred-upgrades)，用于延后升级。该通道上的升级会在常规发布通道升级后的两周进行。

:::note
Basic 等级服务会自动加入快速发布通道。
:::

### 快速发布通道（提前升级） \\{#fast-release-channel-early-upgrades\\}

<ScalePlanFeatureBadge feature="快速发布通道"/>

除了常规升级计划外，如果你希望服务在常规发布计划之前接收更新，我们提供 **快速发布（Fast release）** 通道。

具体而言，服务将：

- 接收最新的 ClickHouse 发布版本
- 随着新版本通过测试而更频繁地升级

你可以在 Cloud 控制台中按如下所示修改服务的升级计划：

<div class="eighty-percent">
    <Image img={fast_release} size="lg" alt="Select Plan" border/>
</div>

<br/>

<div class="eighty-percent">
    <Image img={enroll_fast_release} size="lg" alt="Select Plan" border/>
</div>

<br/>

此 **快速发布（Fast release）** 通道适用于在非关键环境中测试新功能。**不建议用于具有严格可用性和可靠性要求的生产工作负载。**

### 常规发布通道 \\{#regular-release-channel\\}

对于所有未配置发布通道或升级计划的 Scale 和 Enterprise 等级服务，将作为常规发布通道的一部分进行升级。该通道推荐用于生产环境。

常规发布通道的升级通常在 **快速发布通道** 之后两周执行。

:::note
Basic 等级服务会在快速发布通道之后不久进行升级。
:::

### 慢速发布通道（延后升级） \\{#slow-release-channel-deferred-upgrades\\}

<EnterprisePlanFeatureBadge feature="慢速发布通道"/>

如果你希望服务在常规发布计划之后再进行升级，我们提供 **慢速发布（Slow release）** 通道。

具体而言，服务将：

- 在快速和常规发布通道的升级全部完成后再进行升级
- 在常规发布版本之后大约 2 周接收 ClickHouse 发布版本
- 适用于希望在生产升级前，先在非生产环境中对 ClickHouse 发布版本进行额外测试的客户。非生产环境可以选择快速或常规发布通道进行升级，以用于测试和验证。

:::note
你可以随时更改发布通道。但在某些情况下，更改只会应用于未来的发布。 

- 切换到更快的通道会立即升级你的服务。例如：慢速到常规、常规到快速
- 切换到更慢的通道不会将你的服务降级，并会让你保持当前版本，直到该通道中有更新的版本可用。例如：常规到慢速、快速到常规或慢速
:::

## 计划升级 \\{#scheduled-upgrades\\}

<EnterprisePlanFeatureBadge feature="Scheduled upgrades" linking_verb_are="true"/>

用户可以为 Enterprise 级别的服务配置升级时间窗口。

选择你希望设置计划升级的服务，然后在左侧菜单中选择 `Settings`。向下滚动到 `Scheduled upgrades`。

<div class="eighty-percent">
    <Image img={scheduled_upgrades} size="lg" alt="计划升级" border/>
</div>
<br/>

选择此选项后，用户可以为数据库和云服务升级选择一周中的日期和时间窗口。

<div class="eighty-percent">
    <Image img={scheduled_upgrade_window} size="lg" alt="计划升级时间窗口" border/>
</div>
<br/>
:::note
虽然计划升级会遵循已定义的时间表，但关键安全补丁和漏洞修复可能会例外。当发现紧急安全问题时，升级可能在计划时间窗口之外执行。如有必要，我们会就此类例外情况通知客户。
:::