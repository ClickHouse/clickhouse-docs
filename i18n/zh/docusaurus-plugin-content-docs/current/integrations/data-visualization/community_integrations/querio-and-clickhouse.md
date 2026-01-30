---
sidebar_label: 'Querio'
sidebar_position: 145
slug: /integrations/querio
keywords: ['Querio', 'connect', 'integrate', 'analytics', 'AI']
description: 'Querio 是一个 AI 原生的分析与商业智能工作区。将 ClickHouse 与 Querio 连接，使用 SQL、Python 和 AI 对实时数据进行探索、可视化和分析。'
title: '将 ClickHouse 连接到 Querio'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

<CommunityMaintainedBadge />

Querio 是一个由 AI 驱动的分析与商业智能工作空间，使团队能够使用 SQL、Python 和自然语言对数据进行查询、探索、可视化并生成洞察。将 Querio 连接到 ClickHouse 数据库或数据仓库后，你可以在大规模场景下运行实时分析，并在无需迁移 ClickHouse 数据的情况下，在其之上构建仪表板、notebook 以及由 AI 辅助的报告。


## 为 Querio 设置 ClickHouse \{#setup-clickhouse-for-querio\}

<VerticalStepper headerLevel="h3">

### 创建专用用户 \{#create-dedicated-user\}

按照安全最佳实践，为 Querio 创建一个仅供其使用且仅具备最小必要权限的专用用户账号：

```sql
CREATE USER querio_user IDENTIFIED BY 'STRONG_PASSWORD';
```

:::tip
使用足够长且随机的密码（至少 16 个字符），最好由密码管理器生成。
:::

### 授予只读数据库访问权限 \{#grant-read-only-access\}

将 Querio 的权限限制为仅能访问其需要查询的数据库和表：

```sql
GRANT SELECT ON my_database.* TO querio_user;
```

对于特定表，请使用：
```sql
GRANT SELECT ON database.table_name TO querio_user;
```

对 Querio 需要访问的每个数据库重复上述操作。

### 收集连接信息 \{#gather-connection-details\}

要将 Querio 连接到 ClickHouse，需要准备以下连接信息：

| Parameter | Description |
|-----------|-------------|
| `HOST` | ClickHouse 服务器或集群的地址 |
| `PORT` | 端口 9440（安全原生协议的默认端口）或已配置的端口 |
| `DATABASE` | 希望 Querio 执行查询的数据库 |
| `USERNAME` | querio_user（或自定义的用户名） |
| `PASSWORD` | 该用户账号的密码 |

:::note
- 对于 ClickHouse Cloud，可以在 ClickHouse Cloud 控制台中找到连接信息
- 对于自管理实例，如果 ClickHouse 使用了不同的端口，请检查服务器配置
- 端口 9440 是安全原生协议连接的默认端口
:::

</VerticalStepper>

## 创建 Querio 账户并连接 ClickHouse \{#create-account-and-connect\}

在 [https://app.querio.ai/](https://app.querio.ai/) 登录或创建 Querio 工作区。

1. 在 Querio 中，转到 **Settings → Datasources** 并点击 **Add Datasource**。

2. 在数据库选项列表中选择 **ClickHouse**。

3. 输入上文中的连接信息并保存配置。

4. Querio 会验证你的连接。验证成功后，ClickHouse 将可在整个工作区中作为数据源使用。

## 查询 ClickHouse \{#querying-clickhouse\}

将 Querio 连接到 ClickHouse 之后，即可在平台各处探索和分析数据。在 Querio notebook 中创建一个 SQL block 或 Python cell，选择 ClickHouse 作为数据源，并直接对 ClickHouse 集群运行查询。利用 Querio 的可视化和 AI 工具挖掘洞察、构建看板并共享结果。

## 其他资源 \{#additional-resources\}

- [Querio 文档](https://docs.querio.ai/integrations/clickhouse)
- [Querio 入门指南和教程](https://www.querio.ai)