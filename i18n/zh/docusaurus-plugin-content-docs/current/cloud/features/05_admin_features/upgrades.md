---
sidebar_label: '升级'
slug: /manage/updates
title: '升级'
description: '使用 ClickHouse Cloud，您无需再为补丁和版本升级操心。我们会定期发布包含修复、新功能和性能改进的升级版本。'
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


# 升级

使用 ClickHouse Cloud，您无需再为补丁管理和升级操心。我们会定期发布包含修复、新功能和性能改进的升级版本。有关 ClickHouse 新增内容的完整列表，请参阅我们的 [Cloud 更新日志](/whats-new/cloud)。

:::note
我们正在引入一种新的升级机制，即我们称之为 “make before break”（简称 MBB）的概念。采用这种新方法，在升级操作期间，我们会先添加更新后的副本，然后再移除旧副本。这样可以使升级过程更加平滑，并尽量减少对正在运行工作负载的影响。

作为这一变更的一部分，历史系统表数据在升级事件中最多会保留 30 天。此外，作为迁移到新组织层级的一部分，AWS 或 GCP 上服务中早于 2024 年 12 月 19 日的系统表数据，以及 Azure 上服务中早于 2025 年 1 月 14 日的系统表数据都将不再保留。
:::



## 版本兼容性 {#version-compatibility}

创建服务时，[`compatibility`](/operations/settings/settings#compatibility) 设置将被设定为服务初始配置时 ClickHouse Cloud 提供的最新 ClickHouse 版本。

`compatibility` 设置允许您使用先前版本的设置默认值。当服务升级到新版本时，`compatibility` 设置指定的版本不会改变。这意味着首次创建服务时存在的设置默认值不会改变(除非您已经覆盖了这些默认值,在这种情况下它们将在升级后保持不变)。

您无法管理服务级别的默认 `compatibility` 设置。如果需要更改服务的默认 `compatibility` 设置版本,必须[联系支持团队](https://clickhouse.com/support/program)。但是,您可以使用标准的 ClickHouse 设置机制在用户、角色、配置文件、查询或会话级别覆盖 `compatibility` 设置,例如在会话中使用 `SET compatibility = '22.3'`,或在查询中使用 `SETTINGS compatibility = '22.3'`。


## 维护模式 {#maintenance-mode}

有时,我们可能需要更新您的服务,这可能需要禁用某些功能,例如扩缩容或空闲。在极少数情况下,我们可能需要对出现问题的服务采取措施,将其恢复到正常状态。在此类维护期间,您将在服务页面上看到一个横幅,显示 _"正在进行维护"_。在此期间,您可能仍然可以使用该服务进行查询。

服务处于维护状态期间不会收取费用。_维护模式_ 是一种罕见情况,不应与常规服务升级混淆。


## 发布渠道(升级计划) {#release-channels-upgrade-schedule}

用户可以通过订阅特定的发布渠道来指定其 ClickHouse Cloud 服务的升级计划。共有三个发布渠道,用户可以使用**计划升级**功能配置每周升级的具体日期和时间。

三个发布渠道分别是:

- [**快速发布渠道**](#fast-release-channel-early-upgrades),用于提前获取升级。
- [**常规发布渠道**](#regular-release-channel)是默认渠道,该渠道的升级在快速发布渠道升级两周后开始。如果您的 Scale 和 Enterprise 层级服务未设置发布渠道,则默认使用常规发布渠道。
- [**慢速发布渠道**](#slow-release-channel-deferred-upgrades)用于延迟发布。该渠道的升级在常规发布渠道升级两周后进行。

:::note
Basic 层级服务会自动加入快速发布渠道
:::

### 快速发布渠道(提前升级) {#fast-release-channel-early-upgrades}

<ScalePlanFeatureBadge feature='快速发布渠道' />

除了常规升级计划外,如果您希望服务提前接收更新,我们还提供**快速发布**渠道。

具体而言,服务将:

- 接收最新的 ClickHouse 版本
- 随着新版本的测试而获得更频繁的升级

您可以在 Cloud 控制台中修改服务的发布计划,如下所示:

<div class='eighty-percent'>
  <Image img={fast_release} size='lg' alt='选择计划' border />
</div>
<br />

<div class='eighty-percent'>
  <Image img={enroll_fast_release} size='lg' alt='选择计划' border />
</div>
<br />

此**快速发布**渠道适用于在非关键环境中测试新功能。**不建议用于对正常运行时间和可靠性有严格要求的生产工作负载。**

### 常规发布渠道 {#regular-release-channel}

对于所有未配置发布渠道或升级计划的 Scale 和 Enterprise 层级服务,升级将作为常规渠道发布的一部分执行。建议用于生产环境。

常规发布渠道的升级通常在**快速发布渠道**之后两周执行。

:::note
Basic 层级服务在快速发布渠道之后不久升级。
:::

### 慢速发布渠道(延迟升级) {#slow-release-channel-deferred-upgrades}

<EnterprisePlanFeatureBadge feature='慢速发布渠道' />

如果您希望服务在常规发布计划之后接收升级,我们提供**慢速发布**渠道。

具体而言,服务将:

- 在快速和常规发布渠道推出完成后进行升级
- 在常规发布后约 2 周接收 ClickHouse 版本
- 适用于希望在生产升级之前有额外时间在非生产环境中测试 ClickHouse 版本的客户。非生产环境可以选择快速或常规发布渠道获取升级以进行测试和验证。

:::note
您可以随时更改发布渠道。但是,在某些情况下,更改仅适用于未来的版本。

- 切换到更快的渠道将立即升级您的服务。例如从慢速切换到常规,从常规切换到快速
- 切换到更慢的渠道不会降级您的服务,而是保持当前版本,直到该渠道中有更新版本可用。例如从常规切换到慢速,从快速切换到常规或慢速
  :::


## 计划升级 {#scheduled-upgrades}

<EnterprisePlanFeatureBadge
  feature='计划升级'
  linking_verb_are='true'
/>

企业版用户可以为服务配置升级时间窗口。

选择需要指定升级计划的服务,然后从左侧菜单中选择 `Settings`,滚动至 `Scheduled upgrades`。

<div class='eighty-percent'>
  <Image img={scheduled_upgrades} size='lg' alt='计划升级' border />
</div>
<br />

选择此选项后,用户可以指定数据库和云服务升级的星期和时间窗口。

<div class='eighty-percent'>
  <Image
    img={scheduled_upgrade_window}
    size='lg'
    alt='计划升级时间窗口'
    border
  />
</div>
<br />
:::note 虽然计划升级会遵循预定的时间表,但对于关键安全补丁和漏洞修复存在例外情况。当发现紧急安全问题时,升级可能会在计划时间窗口之外执行。如有此类例外情况,将及时通知客户。 :::
