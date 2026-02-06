---
title: '发布状态页面'
sidebar_label: '发布状态'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', '区域']
description: '列出各发布通道发布状态的页面'
slug: /cloud/release-status
doc_type: 'reference'
---

import ReleaseSchedule from '@site/src/components/ReleaseSchedule/ReleaseSchedule';

ClickHouse Cloud 提供不同的发布通道，以满足用户在稳定性、新特性获取以及升级可预测性方面的不同需求。每个通道都有各自明确的升级节奏，旨在覆盖不同的使用场景——既适用于希望立即获得新版本的用户，也适用于希望推迟升级以确保获得该版本中最稳定版本的用户。


## 发布通道详情 \{#release-channel-details\}

<details>
<summary>了解更多发布通道信息</summary>

| Channel Name | Description | Key Considerations | Tiers Supported |
| :--- | :--- | :--- | :--- |
| **Fast (Early Release)** | 推荐用于非生产环境。这是每次数据库版本升级的首个发布通道 | 新特性优先于稳定性。<br/>可以在生产升级之前，先在非生产环境中测试新版本 | Basic（默认）<br/>Scale、Enterprise 等级 |
| **Regular** | 所有多副本服务的默认发布通道。<br/>在该通道上的发布通常在 Fast 发布通道开始两周后启动。 | 默认/全集群范围升级。<br/>服务会在数周内逐步升级 | Scale 和 Enterprise |
| **Slow (Deferred)** | 推荐给更为规避风险、希望其服务在发布计划末期再进行升级的用户。<br/>在该通道上的发布通常在 Regular 发布通道开始两周后启动。 | 最大化稳定性和可预测性。<br/>适用于需要先在 Fast/Regular 通道上对新版本进行更多测试的场景 | Enterprise |

<br/>
<br/>

:::note
所有单副本服务都会自动加入 Fast 发布通道。
:::

</details>

对于 Enterprise 等级中的服务，所有发布通道均支持配置计划升级时间窗口。该功能允许您在一周内选定某一天并配置一个时间窗口用于执行升级。

## 发行计划 \{#release-schedule\}

:::important 了解发布日程
下方显示的日期表示 ClickHouse **开始向各发布通道分阶段推送** 的时间，而不是您的各个服务实际完成升级的时间。

- 推送过程是自动执行的，并会在数周内逐步完成
- 已配置预定升级时间窗的服务，会在通道推送结束后的下一周内，于其预定时间窗内完成升级
- 由于推送暂停（例如节假日冻结）或健康监控，推送完成时间可能会被延迟

若要在生产环境升级前进行预先测试，建议对非生产服务使用 Fast 或 Regular 通道，对生产服务使用 Slow 通道。
:::

<ReleaseSchedule releases={[
    {
     changelog_link: 'https://clickhouse.com/docs/changelogs/25.12',
     version: '25.12',
     fast_start_date: '待定',
     fast_end_date: '待定',
     regular_start_date: '待定',
     regular_end_date: '待定',
     slow_start_date: '待定',
     slow_end_date: '待定',
     fast_progress: 'green',
     regular_progress: 'green',
     slow_progress: 'green'
   },
   {
     changelog_link: 'https://clickhouse.com/docs/changelogs/25.10',
     version: '25.10',
     fast_start_date: '2025-12-11',
     fast_end_date: '2025-12-15',
     regular_start_date: '2026-01-23',
     regular_end_date: '待定',
     slow_start_date: '待定',
     slow_end_date: '待定',
     fast_progress: 'green',
     regular_progress: 'green',
     slow_progress: 'green',
     regular_delay_note: '配置了预定升级时间窗的服务，将在推送完成后的下一周内，于其预定时间窗内接收 25.10 版本',
   },
   {
    changelog_link: 'https://clickhouse.com/docs/changelogs/25.8',
    version: '25.8',
    fast_start_date: '已完成',
    fast_end_date: '已完成',
    regular_start_date: '2025-10-29',
    regular_end_date: '2025-12-19',
    slow_start_date: '2026-01-27',
    slow_end_date: '2026-02-04',
    fast_progress: 'green',
    regular_progress: 'green',
    slow_progress: 'green',
  }
]} />