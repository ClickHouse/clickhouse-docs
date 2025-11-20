---
sidebar_label: 'Databrain'
sidebar_position: 131
slug: /integrations/databrain
keywords: ['clickhouse', 'Databrain', 'connect', 'integrate', 'ui', 'analytics', 'embedded', 'dashboard', 'visualization']
description: 'Databrain 是一款嵌入式分析平台，可与 ClickHouse 无缝集成，用于构建面向客户的仪表板、指标和数据可视化。'
title: '将 Databrain 连接到 ClickHouse'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import databrain_01 from '@site/static/images/integrations/data-visualization/databrain_01.png';
import databrain_02 from '@site/static/images/integrations/data-visualization/databrain_02.png';
import databrain_03 from '@site/static/images/integrations/data-visualization/databrain_03.png';
import databrain_04 from '@site/static/images/integrations/data-visualization/databrain_04.png';
import databrain_05 from '@site/static/images/integrations/data-visualization/databrain_05.png';
import databrain_06 from '@site/static/images/integrations/data-visualization/databrain_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Databrain 连接到 ClickHouse

<CommunityMaintainedBadge/>

[Databrain](https://usedatabrain.com) 是一款嵌入式分析平台，帮助你为客户构建和分享交互式仪表盘、指标和数据可视化。Databrain 通过 HTTPS 接口连接到 ClickHouse，使你能够借助现代、易用的界面轻松对 ClickHouse 数据进行可视化和分析。

<Image size="md" img={databrain_01} alt="展示 ClickHouse 数据可视化的 Databrain 仪表盘界面" border />

<br/>

本指南将引导你完成将 Databrain 连接到 ClickHouse 实例的全部步骤。



## 前置条件 {#pre-requisites}

- 一个 ClickHouse 数据库,可以部署在您自己的基础设施上,或使用 [ClickHouse Cloud](https://clickhouse.com/)。
- 一个 [Databrain 账户](https://app.usedatabrain.com/users/sign-up)。
- 一个用于连接数据源的 Databrain 工作空间。


## 将 Databrain 连接到 ClickHouse 的步骤 {#steps-to-connect-databrain-to-clickhouse}

### 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. 允许 Databrain IP 地址(如需要) {#2-allow-databrain-ip-addresses}

如果您的 ClickHouse 实例启用了 IP 过滤,您需要将 Databrain 的 IP 地址添加到白名单。

对于 ClickHouse Cloud 用户:

1. 在 ClickHouse Cloud 控制台中导航到您的服务
2. 转到 **Settings** → **Security**
3. 将 Databrain 的 IP 地址添加到允许列表

:::tip
请参阅 [Databrain 的 IP 白名单文档](https://docs.usedatabrain.com/guides/datasources/allow-access-to-our-ip)以获取需要添加到白名单的当前 IP 地址列表。
:::

### 3. 在 Databrain 中添加 ClickHouse 作为数据源 {#3-add-clickhouse-as-a-data-source}

1. 登录您的 Databrain 账户并导航到要添加数据源的工作区。

2. 在导航菜单中点击 **Data Sources**。

<Image size='md' img={databrain_02} alt='Databrain 数据源菜单' border />

3. 点击 **Add a Data Source** 或 **Connect Data Source**。

4. 从可用连接器列表中选择 **ClickHouse**。

<Image
  size='md'
  img={databrain_03}
  alt='Databrain 连接器选择界面显示 ClickHouse 选项'
  border
/>

5. 填写连接详细信息:
   - **Destination Name**: 为此连接输入描述性名称(例如,"Production ClickHouse" 或 "Analytics DB")
   - **Host**: 输入您的 ClickHouse 主机 URL(例如,`https://your-instance.region.aws.clickhouse.cloud`)
   - **Port**: 输入 `8443`(ClickHouse 的默认 HTTPS 端口)
   - **Username**: 输入您的 ClickHouse 用户名
   - **Password**: 输入您的 ClickHouse 密码

<Image
  size='md'
  img={databrain_04}
  alt='Databrain ClickHouse 连接表单及配置字段'
  border
/>

6. 点击 **Test Connection** 以验证 Databrain 能够连接到您的 ClickHouse 实例。

7. 连接成功后,点击 **Save** 或 **Connect** 以添加数据源。

### 4. 配置用户权限 {#4-configure-user-permissions}

确保您用于连接的 ClickHouse 用户具有必要的权限:

```sql
-- 授予读取模式信息的权限
GRANT SELECT ON information_schema.* TO your_databrain_user;

-- 授予对数据库和表的读取访问权限
GRANT SELECT ON your_database.* TO your_databrain_user;
```

将 `your_databrain_user` 和 `your_database` 替换为您的实际用户名和数据库名称。


## 将 Databrain 与 ClickHouse 配合使用 {#using-databrain-with-clickhouse}

### 探索数据 {#explore-your-data}

1. 连接后,在 Databrain 中导航到您的工作区。

2. 您将在数据浏览器中看到列出的 ClickHouse 表。

<Image
  size='md'
  img={databrain_05}
  alt='显示 ClickHouse 表的 Databrain 数据浏览器'
  border
/>

3. 单击表以探索其模式并预览数据。

### 创建指标和可视化 {#create-metrics-and-visualizations}

1. 单击 **Create Metric** 开始从 ClickHouse 数据构建可视化。

2. 选择您的 ClickHouse 数据源并选择要可视化的表。

3. 使用 Databrain 的直观界面:
   - 选择维度和度量
   - 应用过滤器和聚合
   - 选择可视化类型(柱状图、折线图、饼图、表格等)
   - 添加自定义 SQL 查询以进行高级分析

4. 保存您的指标以便在多个仪表板中重复使用。

### 构建仪表板 {#build-dashboards}

1. 单击 **Create Dashboard** 开始构建仪表板。

2. 通过拖放已保存的指标将指标添加到仪表板。

3. 自定义仪表板的布局和外观。

<Image
  size='md'
  img={databrain_06}
  alt='包含多个 ClickHouse 可视化的 Databrain 仪表板'
  border
/>

4. 与您的团队共享仪表板或将其嵌入到应用程序中。

### 高级功能 {#advanced-features}

Databrain 在与 ClickHouse 配合使用时提供多项高级功能:

- **自定义 SQL 控制台**:直接针对 ClickHouse 数据库编写和执行自定义 SQL 查询
- **多租户和单租户**:连接您的 ClickHouse 数据库,支持单租户和多租户架构
- **报告调度**:安排自动化报告并通过电子邮件发送给相关人员
- **AI 驱动的洞察**:使用 AI 从数据中生成摘要和洞察
- **嵌入式分析**:将仪表板和指标直接嵌入到应用程序中
- **语义层**:创建可重用的数据模型和业务逻辑


## 故障排查 {#troubleshooting}

### 连接失败 {#connection-fails}

如果您无法连接到 ClickHouse:

1. **验证凭据**:仔细检查您的用户名、密码和主机 URL
2. **检查端口**:确保 HTTPS 连接使用端口 `8443`(如果不使用 SSL,HTTP 连接使用端口 `8123`)
3. **IP 白名单**:确认 Databrain 的 IP 地址已添加到 ClickHouse 防火墙/安全设置的白名单中
4. **SSL/TLS**:如果使用 HTTPS,请确保 SSL/TLS 已正确配置
5. **用户权限**:验证该用户对 `information_schema` 和目标数据库具有 SELECT 权限

### 查询性能缓慢 {#slow-query-performance}

如果查询运行缓慢:

1. **优化查询**:高效使用过滤器和聚合操作
2. **创建物化视图**:对于频繁访问的聚合操作,建议在 ClickHouse 中创建物化视图
3. **使用合适的数据类型**:确保 ClickHouse 模式使用最优的数据类型
4. **索引优化**:充分利用 ClickHouse 的主键和跳数索引


## 了解更多 {#learn-more}

有关 Databrain 功能以及如何构建强大分析能力的更多信息：

- [Databrain 文档](https://docs.usedatabrain.com/)
- [ClickHouse 集成指南](https://docs.usedatabrain.com/guides/datasources/connecting-data-sources-to-databrain/clickhouse)
- [创建仪表板](https://docs.usedatabrain.com/guides/dashboards/create-a-dashboard)
- [构建指标](https://docs.usedatabrain.com/guides/metrics/create-metrics)
