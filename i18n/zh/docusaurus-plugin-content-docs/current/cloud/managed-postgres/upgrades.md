---
slug: /cloud/managed-postgres/upgrades
sidebar_label: '升级'
title: '升级'
description: 'ClickHouse Managed Postgres 中 PostgreSQL 版本升级的工作方式'
keywords: ['managed postgres 升级', 'postgres 版本', '小版本升级', '主版本升级', '维护窗口']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.upgrades-beta" />

Managed Postgres 会自动处理 PostgreSQL 版本升级，确保实例安全并保持最新状态。支持小版本和主版本升级，并将对服务的影响降至最低。

## 维护更新 \{#maintenance-updates\}

PostgreSQL 实例的常规维护包括以下内容：

* 小版本升级 (例如，从 17.4 升级到 17.5) 包含 Bug 修复、PostgreSQL 引擎安全补丁。
* 托管服务功能：包括对原生 CDC、可观测性、pg&#95;clickhouse 及其他扩展的改进。
* 操作系统和系统组件补丁：包括安全修复、效率提升及其他改进。

这些通过故障转移来执行，通常只会导致短暂的连接中断，一般仅持续数秒。

对于启用了[备用节点](/cloud/managed-postgres/high-availability)的实例，升级会先应用到备用节点，然后再执行故障转移，以尽量减少停机时间。

## 维护窗口 \{#maintenance-windows\}

默认维护窗口为周日 UTC 14:00 至 16:00。
预计在该窗口期内的停机时间少于 1 分钟。

对于 Enterprise 层级组织，Managed Postgres 支持维护窗口，使你可以将升级和其他维护操作安排在对工作负载影响最小的时间段。用于在 UI 和 API 中配置维护窗口的功能即将推出。在此期间，请联系 [support](https://clickhouse.com/support/program)，为你的实例设置维护窗口。

## 主版本升级 \{#major-version-upgrades\}

即将支持通过 UI 和 API 进行主版本升级 (例如从 17.x 升级到 18.x) 。
在此期间，请联系 [support](https://clickhouse.com/support/program)，升级你的 Managed Postgres 实例。