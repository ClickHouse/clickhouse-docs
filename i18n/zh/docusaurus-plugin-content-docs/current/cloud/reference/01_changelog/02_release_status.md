---
title: '发布状态页面'
sidebar_label: '发布状态'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: '显示各发布渠道发布状态的页面'
slug: /cloud/release-status
doc_type: 'reference'
---

import ReleaseSchedule from '@site/src/components/ReleaseSchedule/ReleaseSchedule';

ClickHouse Cloud 提供不同的发布通道，以满足用户在稳定性、新功能获取速度和升级可预测性方面的不同需求。每个通道都有各自明确的升级周期，分别针对不同的使用场景——既适用于希望即时获取新版本的用户，也适用于希望推迟升级以确保获得该版本中最稳定发布的用户。


## 发布通道详情 \{#release-channel-details\}

<details>
<summary>了解更多发布通道信息</summary>

| 通道名称 | 描述 | 关键注意事项 | 支持的层级 |
| :--- | :--- | :--- | :--- |
| **快速（早期发布）** | 推荐用于非生产环境。此通道是每个数据库版本升级的首个发布通道 | 优先新特性而非稳定性。<br/>可在生产环境升级前，先在非生产环境中测试新版本 | Basic（默认）<br/>Scale、Enterprise 层级 |
| **常规** | 所有多副本服务的默认发布通道。<br/>此通道上的更新通常在快速通道发布两周后进行。 | 默认/全集群范围升级。<br/>此通道上的升级通常在快速通道升级两周后进行 | Scale 和 Enterprise |
| **慢速（延后）** | 推荐给更加风险规避、希望其服务在发布计划末尾才进行升级的用户。<br/>此通道上的更新通常在常规通道发布两周后进行。 | 最大化稳定性与可预测性。<br/>适用于需要在快速/常规通道对新版本进行更多测试的用户 | Enterprise |

<br/>
<br/>

:::note
所有单副本服务都会自动加入快速发布通道。
:::

</details>

对于 Enterprise 层级中的服务，所有发布通道都支持计划升级。该功能允许用户在一周中的指定日期配置升级时间窗口。

## 发布计划 \{#release-schedule\}

下列发布时间仅为预估，可能会有所变动。

<ReleaseSchedule releases={[
   {
     changelog_link: 'https://clickhouse.com/docs/changelogs/25.10',
     version: '25.10',
     fast_date: '2025-12-11（于 2025-12-15 完成）',
     regular_date: '2026-01-13',
     slow_date: 'TBD',
     fast_progress: 'green',
     regular_progress: 'green',
     slow_progress: 'green',
     fast_delay_note: '具有升级窗口的服务将在 1 月 12 日当周的预定窗口期间升级到 25.10 版本',
   },
   {
    changelog_link: 'https://clickhouse.com/docs/changelogs/25.8',
    version: '25.8',
    fast_date: '已完成',
    regular_date: '已完成（2025-12-19）',
    slow_date: '2026-01-15',
    fast_progress: 'green',
    regular_progress: 'green',
    slow_progress: 'green',
    regular_delay_note: '具有升级窗口的服务将自 1 月 13 日起开始升级。',
  }
]} />