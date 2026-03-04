---
slug: /cloud/managed-postgres/upgrades
sidebar_label: '升级'
title: '升级'
description: 'PostgreSQL 版本在 ClickHouse Managed Postgres 中的升级方式'
keywords: ['managed postgres 升级', 'postgres 版本', '小版本升级', '大版本升级', '维护窗口']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="upgrades" />

Managed Postgres 会自动处理 PostgreSQL 版本升级，确保实例安全并保持最新状态。支持小版本和大版本升级，并将对服务的影响降至最低。


## 小版本升级 \{#minor-version-upgrades\}

小版本升级（例如，从 16.4 升级到 16.5）包含 Bug 修复和安全补丁。此类升级通过故障转移来执行，通常只会导致短暂的连接中断，一般仅持续数秒。

对于启用了[备用节点](/cloud/managed-postgres/high-availability)的实例，升级会先应用到备用节点，然后再执行故障转移，以尽量减少停机时间。

## 主版本升级 \{#major-version-upgrades\}

主版本升级（例如从 16.x 升级到 17.x）同样只会导致几秒钟的停机，并采用类似的基于故障转移的方式进行。

## 维护窗口 \{#maintenance-windows\}

托管 Postgres 服务支持维护窗口，使你可以将升级和其他维护操作安排在对工作负载影响最小的时间段。用于在 UI 中配置维护窗口的功能即将推出。在此期间，请联系 [support](https://clickhouse.com/support/program)，为你的实例设置维护窗口。