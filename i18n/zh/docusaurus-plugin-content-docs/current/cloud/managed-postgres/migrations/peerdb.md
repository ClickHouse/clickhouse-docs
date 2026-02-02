---
slug: /cloud/managed-postgres/migrations/peerdb
sidebar_label: 'PeerDB'
title: '使用 PeerDB 迁移 PostgreSQL 数据'
description: '了解如何使用 PeerDB 将 PostgreSQL 数据迁移到 ClickHouse Managed Postgres'
keywords: ['postgres', 'postgresql', 'logical replication', 'migration', 'data transfer', 'managed postgres', 'peerdb']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import sourcePeer from '@site/static/images/managed-postgres/peerdb/source-peer.png';
import targetPeer from '@site/static/images/managed-postgres/peerdb/target-peer.png';
import peers from '@site/static/images/managed-postgres/peerdb/peers.png';
import createMirror from '@site/static/images/managed-postgres/peerdb/create-mirror.png';
import tablePicker from '@site/static/images/managed-postgres/peerdb/table-picker.png';
import initialLoad from '@site/static/images/managed-postgres/peerdb/initial-load.png';
import mirrors from '@site/static/images/managed-postgres/peerdb/mirrors.png';


# 使用 PeerDB 迁移到托管 Postgres \{#peerdb-migration\}

本指南提供分步说明，介绍如何使用 PeerDB 将您的 PostgreSQL 数据库迁移到 ClickHouse 托管 Postgres。

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-peerdb" />

## 前置条件 \{#migration-peerdb-prerequisites\}

- 访问源 PostgreSQL 数据库的权限。
- 一个 ClickHouse Managed Postgres 实例，作为要迁移数据的目标。
- 在一台机器上已安装 PeerDB。你可以按照 [PeerDB GitHub 仓库](https://github.com/PeerDB-io/peerdb?tab=readme-ov-file#get-started)中的安装说明进行操作。你只需克隆该仓库并运行 `docker-compose up`。在本指南中，我们将使用 **PeerDB UI**，当 PeerDB 运行后，可通过 `http://localhost:3000` 访问。

## 迁移前的注意事项 \{#migration-peerdb-considerations-before\}

在开始迁移之前，请注意以下事项：

- **数据库对象**：PeerDB 会根据源数据库的 schema 在目标数据库中自动创建表。不过，某些数据库对象（如索引、约束和触发器）不会自动迁移。你需要在迁移完成后，在目标数据库中手动重新创建这些对象。
- **DDL 变更**：如果你启用了持续复制，PeerDB 会将源数据库中的 DML 操作（INSERT、UPDATE、DELETE）同步到目标数据库，并会同步 ADD COLUMN 操作。不过，其他 DDL 变更（例如 DROP COLUMN、ALTER COLUMN）不会被自动同步。有关对 schema 变更支持的更多信息，请参见[此处](../../../integrations/clickpipes/postgres/schema-changes.md)。
- **网络连通性**：确保源数据库和目标数据库都可以从运行 PeerDB 的机器访问。你可能需要配置防火墙规则或安全组设置以允许连接。

## 创建 peers \{#migration-peerdb-create-peers\}

首先，我们需要为源数据库和目标数据库各创建一个 peer。一个 peer 表示与某个数据库的连接。在 PeerDB UI 中，点击侧边栏中的“Peers”进入对应页面。要创建新的 peer，点击 `+ New peer` 按钮。

### 创建源端 peer \{#migration-peerdb-source-peer\}

通过填写连接信息（例如主机、端口、数据库名、用户名和密码），为你的源 PostgreSQL 数据库创建一个 peer。填写完所有信息后，点击 `Create peer` 按钮以保存该 peer。

<Image img={sourcePeer} alt="创建源端 Peer" size="md" border />

### 创建目标 peer \{#migration-peerdb-target-peer\}

同样，通过提供必要的连接信息，为你的 ClickHouse Managed Postgres 实例创建一个 peer。你可以在 ClickHouse Cloud 控制台中获取该实例的[连接信息](../connection)。在填写完所有信息后，点击 `Create peer` 按钮以保存目标 peer。

<Image img={targetPeer} alt="创建目标 peer" size="md" border />

现在，你应该能在 “Peers” 部分看到源 peer 和目标 peer 都已列出。

<Image img={peers} alt="Peers 列表" size="md" border />

## 创建 mirror \{#migration-peerdb-create-mirror\}

接下来，我们需要创建一个 mirror，用于定义源和目标 peer 之间的数据迁移流程。在 PeerDB UI 中，点击侧边栏中的 "Mirrors"，进入 "Mirrors" 部分。要创建一个新的 mirror，点击 `+ New mirror` 按钮。

<Image img={createMirror} alt="Create Mirror" size="md" border />

1. 为你的 mirror 指定一个能够描述此次迁移的名称。
2. 从下拉菜单中选择之前创建的源和目标 peer。
3. 如果你希望在初始迁移后持续保持目标数据库与源数据库同步，可以选择启用 continuous replication。否则，在 **Advanced settings** 中，可以启用 **Initial copy only** 来执行一次性迁移。
4. 选择你要迁移的表。你可以选择特定的表，也可以从源数据库中选择所有表。

<Image img={tablePicker} alt="Table Picker" size="md" border />

5. 配置完成 mirror 的相关设置后，点击 `Create mirror` 按钮。

此时你应该可以在 "Mirrors" 部分看到新创建的 mirror。

<Image img={mirrors} alt="Mirrors List" size="md" border />

## 等待初始加载 \{#migration-peerdb-initial-load\}

创建 mirror 后，PeerDB 会开始执行从源数据库到目标数据库的初始数据加载。你可以单击该 mirror，然后单击 **Initial load** 选项卡来监控初始数据迁移的进度。

<Image img={initialLoad} alt="Initial Load Progress" size="md" border />

初始加载完成后，你应当会看到状态显示迁移已完成。

## 监控初始加载和复制 \{#migration-peerdb-monitoring\}

点击源 peer 后，你可以看到 PeerDB 正在运行的命令列表。例如：

1. 首先我们会运行一个 COUNT 查询，用于估算每个表中的行数。
2. 然后我们使用 NTILE 运行一个分区查询，将大型表拆分为更小的块，以实现高效的数据传输。
3. 接着我们执行 FETCH 命令，从源数据库拉取数据，然后由 PeerDB 将其同步到目标数据库。

## 迁移后的任务 \{#migration-peerdb-considerations\}

在迁移完成之后：

- **重新创建数据库对象**：请记得在目标数据库中手动重新创建索引、约束和触发器，因为这些不会被自动迁移。
- **测试你的应用程序**：请确保针对 ClickHouse Managed Postgres 实例测试你的应用程序，以确认一切按预期运行。
- **清理资源**：当你对迁移结果满意并已将应用程序切换为使用 ClickHouse Managed Postgres 之后，可以在 PeerDB 中删除 mirror 和 peer，以清理资源。

:::info 复制槽
如果你启用了持续复制，PeerDB 会在源 PostgreSQL 数据库上创建一个 **复制槽（replication slot）**。在完成迁移之后，请务必从源数据库中手动删除该复制槽，以避免不必要的资源占用。
:::

## 参考资料 \{#migration-peerdb-references\}

- [ClickHouse Managed Postgres 文档](../)
- [PeerDB CDC 创建指南](https://docs.peerdb.io/mirror/cdc-pg-pg)
- [Postgres ClickPipe 常见问题解答（同样适用于 PeerDB）](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)

## 后续步骤 \{#migration-pgdump-pg-restore-next-steps\}

恭喜！您已使用 pg_dump 和 pg_restore 成功将 PostgreSQL 数据库迁移至 ClickHouse Managed Postgres。现在，您已经可以开始探索 Managed Postgres 的各项功能及其与 ClickHouse 的集成。以下是 10 分钟快速入门，帮助您快速上手：

- [Managed Postgres 快速入门指南](../quickstart)