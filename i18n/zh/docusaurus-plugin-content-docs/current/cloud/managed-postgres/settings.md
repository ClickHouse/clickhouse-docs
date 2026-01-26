---
slug: /cloud/managed-postgres/settings
sidebar_label: '设置'
title: '设置'
description: '为 Managed Postgres 配置 PostgreSQL 和 PgBouncer 参数并管理实例设置'
keywords: ['Postgres 配置', 'PostgreSQL 设置', 'PgBouncer', 'IP 过滤器']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import postgresParameters from '@site/static/images/managed-postgres/postgres-parameters.png';
import serviceActions from '@site/static/images/managed-postgres/service-actions.png';
import ipFilters from '@site/static/images/managed-postgres/ip-filters.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="settings" />

您可以通过侧边栏中的 **Settings** 选项卡修改配置参数并管理托管 Postgres 实例的设置。


## 更改配置参数 \{#changing-configuration\}

<Image img={postgresParameters} alt="Postgres 参数配置" size="md" border/>

要修改参数，点击 **Edit parameters** 按钮。选择需要修改的参数，并按需更改其值。完成修改后，点击 **Save Changes** 按钮保存。

对配置参数所做的所有更改通常会在一分钟内持久化到实例中。某些参数需要重启数据库后才能生效。这些更改会在下次重启后生效，您可以在 **Service actions** 工具栏中手动触发重启。

## 服务操作和伸缩 \{#service-actions\}

<Image img={serviceActions} alt="Service actions and scaling" size="md" border/>

**Service actions** 工具栏提供用于管理 Managed Postgres 实例的操作控件：

- **Reset password**：更新超级用户密码（仅当实例处于 `Running` 状态时）
- **Restart**：重启数据库实例（仅当实例处于 `Running` 状态时）
- **Delete**：删除实例

**Scaling** 部分允许您更改主节点和备用节点的实例类型，以增加或减少计算资源和存储容量。在后台，会预先创建新的实例，并在它们追上当前主节点之后接管流量。故障转移过程会中断所有当前连接，并导致短暂的停机时间。

:::tip
出于安全考虑，您可能无法切换到其存储容量接近您当前已用存储容量的实例类型。请始终选择在当前已用容量之上预留足够余量的实例类型，以避免出现任何问题。
:::

## IP 过滤器 \{#ip-filters\}

IP 过滤器控制哪些源 IP 地址被允许连接到托管的 Postgres 实例。

<Image img={ipFilters} alt="IP 访问列表配置" size="md" border/>

要配置 IP 过滤器：

1. 导航到 **Settings** 选项卡
2. 在 **IP Filters** 下，点击 **Edit**
3. 添加允许连接的 IP 地址或 CIDR 范围
4. 点击 **Save** 以应用更改

你可以指定单个 IP 地址，或使用 CIDR 表示法来指定 IP 网段（例如，`192.168.1.0/24`）。你也可以选择 **Anywhere** 或 **Nowhere** 作为快捷选项，将实例完全对外开放或完全关闭。

:::note
如果未配置任何 IP 过滤器，将允许来自所有 IP 地址的连接。对于生产环境的工作负载，建议将访问限制为已知 IP 地址。
:::