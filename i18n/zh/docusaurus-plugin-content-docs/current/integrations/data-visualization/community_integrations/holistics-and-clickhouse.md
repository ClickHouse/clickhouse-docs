---
sidebar_label: 'Holistics'
slug: /integrations/holistics
keywords: ['clickhouse', 'Holistics', 'AI', '集成', 'bi', '数据可视化']
description: 'Holistics 是一个由 AI 驱动的自助式 BI 和嵌入式分析平台，通过在统一治理下且易于访问的指标，帮助每个人做出更优的决策。'
title: '将 ClickHouse 连接到 Holistics'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import holistics_01 from '@site/static/images/integrations/data-visualization/holistics_01.png';
import holistics_02 from '@site/static/images/integrations/data-visualization/holistics_02.png';
import holistics_03 from '@site/static/images/integrations/data-visualization/holistics_03.png';
import holistics_04 from '@site/static/images/integrations/data-visualization/holistics_04.png';
import holistics_05 from '@site/static/images/integrations/data-visualization/holistics_05.png';
import holistics_06 from '@site/static/images/integrations/data-visualization/holistics_06.png';


# 将 ClickHouse 连接到 Holistics \{#connecting-clickhouse-to-holistics\}

<CommunityMaintainedBadge/>

[Holistics](https://www.holistics.io/) 是一款 AI 原生的自助式 BI 平台，提供可编程语义层，以实现一致且可信的指标体系。

通过将 ClickHouse 连接到 Holistics，您的团队可以基于代码化语义层，获得快速、可靠的 AI 驱动自助分析体验。业务用户可以借助拖放操作和 AI 自信地探索数据，而您则可以在 Git 中保持指标定义的可复用性、可组合性和版本可控性。

## 前提条件 \{#prerequisites\}

在连接之前，请确保满足以下条件：

- **权限：** 必须在 Holistics 中具备 Admin（管理员）角色才能添加新的数据源。
- **网络访问：** ClickHouse 服务器必须允许来自 [Holistics 的 IP 地址](https://docs.holistics.io/docs/connect/ip-whitelisting) 的访问。
- **数据库用户：** 为 Holistics 创建一个专用的只读数据库用户，而不要使用管理员账号。

### 建议的权限 \{#recommended-privileges\}

专用用户需要对你希望查询的表拥有 `SELECT` 权限，同时还需要对 `system` 表拥有权限（用于模式检测）。

```sql
-- Example: Grant read access to a specific database
GRANT SELECT ON my_database.* TO holistics_user;

-- Grant access to system metadata
GRANT SELECT ON system.* TO holistics_user;
```

<VerticalStepper headerLevel="h2">
  ## 收集连接信息

  要通过 HTTP(S) 连接到 ClickHouse，您需要以下信息：

  | **参数**            | **说明**                                                              |
  | ----------------- | ------------------------------------------------------------------- |
  | **Host**          | 您的 ClickHouse 服务器主机名（例如 `mz322.eu-central-1.aws.clickhouse.cloud`）。 |
  | **Port**          | ClickHouse Cloud 使用 **8443**（SSL/TLS）。自管理且未启用 SSL 的实例使用 **8123**。   |
  | **Database Name** | 您要连接的数据库名称。默认通常为 `default`。                                         |
  | **Username**      | 数据库用户。默认为 `default`。                                                |
  | **Password**      | 该数据库用户的密码。                                                          |

  您可以在 ClickHouse Cloud 控制台中点击 **Connect** 按钮并选择 **HTTPS** 来查看这些信息。

  <Image size="md" img={holistics_01} alt="ClickHouse Cloud 控制台中 Connect 按钮的位置" border />

  ## 配置网络访问

  由于 Holistics 是云端应用，其服务器必须能够访问您的数据库。您有以下两种选择：

  1. **直接连接（推荐）：** 在防火墙或 ClickHouse Cloud 的 IP Access List 中将 Holistics 的 IP 地址加入允许列表。您可以在 [IP Whitelisting 指南](https://docs.holistics.io/docs/connect/ip-whitelisting) 中找到这些 IP 列表。

     <Image size="md" img={holistics_02} alt="在 ClickHouse Cloud 中配置 IP 允许列表的示例" border />

  2. **反向 SSH 隧道：** 如果您的数据库位于私有网络（VPC）且无法对公网开放，请使用 [Reverse SSH Tunnel](https://docs.holistics.io/docs/connect/connect-tunnel)。

  ## 在 Holistics 中添加数据源

  1. 在 Holistics 中，前往 **Settings → Data Sources**。

     <Image size="md" img={holistics_03} alt="在 Holistics 设置中导航到 Data Sources" border />

  2. 点击 **New Data Source** 并选择 **ClickHouse**。

     <Image size="md" img={holistics_04} alt="在新增数据源列表中选择 ClickHouse" border />

  3. 使用在步骤 1 中收集的信息填写表单。

     | **字段**            | **设置**                                          |
     | ----------------- | ----------------------------------------------- |
     | **Host**          | 您的 ClickHouse 主机名                               |
     | **Port**          | `8443`（或 `8123`）                                |
     | **Require SSL**   | 如果使用端口 8443，则切换为 **ON**（ClickHouse Cloud 必须开启）。 |
     | **Database Name** | `default`（或您的指定数据库）                             |

     <Image size="md" img={holistics_05} alt="在 Holistics 中填写 ClickHouse 连接信息" border />

  4. 点击 **Test Connection**。

     <Image size="md" img={holistics_06} alt="在 Holistics 中成功通过 ClickHouse 连接测试" border />

     * **成功：** 点击 **Save**。
     * **失败：** 检查您的用户名/密码，并确认 [Holistics IP 已加入允许列表](https://docs.holistics.io/docs/connect/ip-whitelisting)。
</VerticalStepper>


## 已知限制 \{#known-limitations\}

Holistics 支持 ClickHouse 中的大多数标准 SQL 特性，但存在以下例外：

- **Running Total：** 此分析函数目前在 ClickHouse 中的支持有限。
- **嵌套数据类型：** 深度嵌套的 JSON 或 Array 结构在可视化之前，可能需要通过 SQL 模型先进行扁平化处理。

有关受支持特性的完整列表，请参阅 [数据库特定限制页面](https://docs.holistics.io/docs/connect/faqs/clickhouse-limitations)。