---
slug: /cloud/managed-postgres/clickhouse-integration
sidebar_label: 'ClickHouse 集成'
title: 'ClickHouse 集成'
description: '使用内置 CDC（变更数据捕获）功能将 Postgres 数据复制到 ClickHouse'
keywords: ['postgres', 'clickhouse 集成', 'cdc', '复制', 'ClickPipes', '数据同步']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import chIntegrationIntro from '@site/static/images/managed-postgres/clickhouse-integration-intro.png';
import replicationServiceStep from '@site/static/images/managed-postgres/replication-service-step.png';
import selectTablesStep from '@site/static/images/managed-postgres/select-tables-step.png';
import integrationRunning from '@site/static/images/managed-postgres/integration-running.png';

<PrivatePreviewBadge />

每个托管 Postgres 实例都内置支持向任意 ClickHouse 服务进行 CDC。这使您可以将 Postgres 实例中的部分或全部数据迁移到 ClickHouse，并让 Postgres 上的数据变更在 ClickHouse 中持续且近乎实时地得到反映。其底层由 [ClickPipes](/integrations/clickpipes) 提供支持。

要使用此功能，在 Postgres 实例的侧边栏中点击 **ClickHouse Integration**。

<Image img={chIntegrationIntro} alt="ClickHouse 集成入口页面，展示了侧边栏中的集成选项" size="md" border />

:::note
继续之前，请确保您的 Postgres 服务对 ClickPipes 服务是可访问的。默认情况下应满足该条件，但如果您限制了 IP 访问，则可能需要根据 **ClickHouse service** 所在区域，从[此](/integrations/clickpipes#list-of-static-ips)列表中为部分源 IP 授权访问。
:::

点击 **Replicate data in ClickHouse** 开始配置您的 ClickPipe。

<VerticalStepper type="numbered" headerLevel="h2">
  ## 配置复制服务 \{#configure-replication-service\}

  填写复制设置：

  * **Integration name**：此 ClickPipe 的名称
  * **ClickHouse service**：选择现有的 ClickHouse Cloud 服务或创建一个新服务
  * **Postgres database**：要进行复制的源数据库
  * **Replication method**：从以下选项中选择：
    * **Initial load + CDC**：导入现有数据，并通过新变更持续更新表（推荐）
    * **Initial load only**：仅对现有数据进行一次性快照，不进行持续更新
    * **CDC only**：跳过初始快照，仅从现在开始捕获新的变更

  <Image img={replicationServiceStep} alt="复制服务配置界面，展示了集成名称、目标服务以及复制方法选项" size="md" border />

  点击 **Next** 继续。

  ## 选择要复制的表 \{#select-tables\}

  选择目标数据库并指定要复制的表：

  * **Destination database**：选择现有的 ClickHouse 数据库或创建一个新数据库
  * **Prefix default destination table names with schema name**：将 Postgres schema 作为前缀添加到目标表名以避免命名冲突
  * **Preserve NULL values from source**：保留源中的 NULL 值，而不是转换为默认值
  * **Remove deleted rows during merges**：对于 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 表，在后台合并过程中物理删除已标记删除的行

  展开 schema 并选择要复制的各个表。您也可以自定义目标表名和列设置。

  <Image img={selectTablesStep} alt="选择表步骤界面，展示了数据库选择、复制选项以及按 schema 分组的表选择器" size="md" border />

  点击 **Replicate data to ClickHouse** 开始复制。

  ## 监控您的 ClickPipe \{#monitor-clickpipe\}

  ClickPipe 启动后，您会在同一个菜单中看到它的列表项。所有数据的初始快照可能需要一些时间，具体取决于表的大小。

  <Image img={integrationRunning} alt="ClickHouse 集成列表，显示一个正在运行的 ClickPipe 以及其目标服务和状态" size="md" border />

  点击集成名称以查看详细状态、监控进度、查看错误并管理该 ClickPipe。参见 [Lifecycle of a Postgres ClickPipe](/integrations/clickpipes/postgres/lifecycle) 以了解 ClickPipe 可能处于的不同状态。
</VerticalStepper>
