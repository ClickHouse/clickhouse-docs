---
sidebar_label: 'Databrain'
sidebar_position: 131
slug: /integrations/databrain
keywords: ['clickhouse', 'Databrain', 'connect', 'integrate', 'ui', 'analytics', 'embedded', 'dashboard', 'visualization']
description: 'Databrain 是一个嵌入式分析平台，可与 ClickHouse 无缝集成，用于构建面向客户的看板、指标和数据可视化。'
title: '将 Databrain 连接到 ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import databrain_01 from '@site/static/images/integrations/data-visualization/databrain_01.png';
import databrain_02 from '@site/static/images/integrations/data-visualization/databrain_02.png';
import databrain_03 from '@site/static/images/integrations/data-visualization/databrain_03.png';
import databrain_04 from '@site/static/images/integrations/data-visualization/databrain_04.png';
import databrain_05 from '@site/static/images/integrations/data-visualization/databrain_05.png';
import databrain_06 from '@site/static/images/integrations/data-visualization/databrain_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 将 Databrain 连接到 ClickHouse \\{#connecting-databrain-to-clickhouse\\}

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com) 是一款嵌入式分析平台，可帮助你为客户构建和共享交互式仪表盘、指标和数据可视化。Databrain 通过 HTTPS 接口连接到 ClickHouse，使你能够通过现代、易用的界面轻松对 ClickHouse 数据进行可视化和分析。

<Image size="md" img={databrain_01} alt="显示 ClickHouse 数据可视化的 Databrain 仪表盘界面" border />

<br/>

本指南将逐步介绍如何将 Databrain 连接到你的 ClickHouse 实例。

## 前置条件 \\{#pre-requisites\\}

- 一个 ClickHouse 数据库，可以部署在自有基础设施上，或托管于 [ClickHouse Cloud](https://clickhouse.com/)。
- 一个 [Databrain 账号](https://app.usedatabrain.com/users/sign-up)。
- 一个 Databrain 工作区，用于连接数据源。

## 将 Databrain 连接到 ClickHouse 的步骤 \\{#steps-to-connect-databrain-to-clickhouse\\}

### 1. 收集连接详细信息 \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

### 2. 允许 Databrain 的 IP 地址（如有需要） \\{#2-allow-databrain-ip-addresses\\}

如果你的 ClickHouse 实例启用了 IP 过滤，则需要将 Databrain 的 IP 地址加入白名单。

对于 ClickHouse Cloud 用户：

1. 在 ClickHouse Cloud 控制台中进入你的服务
2. 前往 **Settings（设置）** → **Security（安全）**
3. 将 Databrain 的 IP 地址添加到允许列表

:::tip
请参阅 [Databrain 的 IP 白名单文档](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip)，获取当前需要加入白名单的 IP 地址列表。
:::

### 3. 在 Databrain 中添加 ClickHouse 作为数据源 \\{#3-add-clickhouse-as-a-data-source\\}

1. 登录你的 Databrain 帐户，并进入你希望添加数据源的工作区。

2. 点击导航菜单中的 **Data Sources（数据源）**。

<Image size="md" img={databrain_02} alt="Databrain 数据源菜单" border />

3. 点击 **Add a Data Source（添加数据源）** 或 **Connect Data Source（连接数据源）**。

4. 从可用连接器列表中选择 **ClickHouse**。

<Image size="md" img={databrain_03} alt="Databrain 连接器选择界面，显示 ClickHouse 选项" border />

5. 填写连接详细信息：
   * **Destination Name（目标名称）**：为此连接输入一个具有描述性的名称（例如：&quot;Production ClickHouse&quot; 或 &quot;Analytics DB&quot;）
   * **Host（主机）**：输入你的 ClickHouse 主机 URL（例如：`https://your-instance.region.aws.clickhouse.cloud`）
   * **Port（端口）**：输入 `8443`（ClickHouse 默认的 HTTPS 端口）
   * **Username（用户名）**：输入你的 ClickHouse 用户名
   * **Password（密码）**：输入你的 ClickHouse 密码

<Image size="md" img={databrain_04} alt="Databrain ClickHouse 连接表单及配置字段" border />

6. 点击 **Test Connection（测试连接）**，验证 Databrain 是否可以连接到你的 ClickHouse 实例。

7. 连接成功后，点击 **Save（保存）** 或 **Connect（连接）** 以添加数据源。

### 4. 配置用户权限 \\{#4-configure-user-permissions\\}

确保你所使用的 ClickHouse 用户具有必要的权限：

```sql
-- Grant permissions to read schema information
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- Grant read access to your database and tables
GRANT SELECT ON your_database.* TO your_databrain_user;
```

将 `your_databrain_user` 和 `your_database` 替换为您实际使用的用户名和数据库名称。

## 将 Databrain 与 ClickHouse 配合使用 \\{#using-databrain-with-clickhouse\\}

### 探索你的数据 \\{#explore-your-data\\}

1. 完成连接后，在 Databrain 中进入你的工作区（workspace）。

2. 你会在数据浏览器中看到列出的 ClickHouse 表。

<Image size="md" img={databrain_05} alt="Databrain 数据浏览器展示 ClickHouse 表" border />

3. 点击任意表来查看其表结构（schema）并预览数据。

### 创建指标和可视化图表 \\{#create-metrics-and-visualizations\\}

1. 点击 **Create Metric**，开始基于 ClickHouse 数据构建可视化图表。

2. 选择你的 ClickHouse 数据源，并选取你想要可视化的表。

3. 使用 Databrain 提供的直观界面来：
   - 选择维度和度量
   - 应用过滤和聚合
   - 选择可视化类型（柱状图、折线图、饼图、数据表等）
   - 添加自定义 SQL 查询以进行高级分析

4. 保存你的指标，以便在多个仪表板中复用。

### 构建仪表板 \\{#build-dashboards\\}

1. 点击 **Create Dashboard** 开始创建仪表板。

2. 通过拖放已保存的指标，将其添加到仪表板中。

3. 自定义仪表板的布局和外观。

<Image size="md" img={databrain_06} alt="包含多个 ClickHouse 可视化的 Databrain 仪表板" border />

4. 将仪表板分享给你的团队，或将其嵌入到你的应用程序中。

### 高级功能 \\{#advanced-features\\}

在配合 ClickHouse 使用时，Databrain 提供了多项高级功能：

- **Custom SQL Console**：直接针对你的 ClickHouse 数据库编写并执行自定义 SQL 查询
- **Multi-tenancy and single-tenancy**：在单租户和多租户架构下连接你的 ClickHouse 数据库
- **Report Scheduling**：安排自动化报告并通过电子邮件发送给相关方
- **AI-powered Insights**：使用 AI 从数据中生成摘要和洞察
- **Embedded Analytics**：将仪表板和指标直接嵌入到你的应用程序中
- **Semantic Layer**：创建可复用的数据模型和业务逻辑

## 故障排查 \\{#troubleshooting\\}

### 连接失败 \\{#connection-fails\\}

如果无法连接到 ClickHouse：

1. **验证凭据**：仔细检查用户名、密码和主机 URL
2. **检查端口**：确保在使用 HTTPS 时使用端口 `8443`（如果未使用 SSL 而采用 HTTP，则使用 `8123`）
3. **IP 白名单**：确认 Databrain 的 IP 地址已在 ClickHouse 的防火墙/安全设置中加入白名单
4. **SSL/TLS**：如果使用 HTTPS，确保已正确配置 SSL/TLS
5. **用户权限**：验证该用户在 `information_schema` 以及目标数据库上具有 SELECT 权限

### 查询性能慢 \\{#slow-query-performance\\}

如果查询执行较慢：

1. **优化查询**：高效使用过滤条件和聚合
2. **创建物化视图**：对于经常访问的聚合结果，考虑在 ClickHouse 中创建物化视图
3. **使用合适的数据类型**：确保 ClickHouse 模式（schema）使用了最优的数据类型
4. **索引优化**：利用 ClickHouse 的主键和跳过索引（skipping index）

## 进一步了解 \\{#learn-more\\}

如需深入了解 Databrain 的功能以及如何构建强大的分析能力：

- [Databrain 文档](https://docs.usedatabrain.com/)
- [ClickHouse 集成指南](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [创建仪表盘](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [构建指标](https://docs.usedatabrain.com/guides/metrics/create-metrics)
