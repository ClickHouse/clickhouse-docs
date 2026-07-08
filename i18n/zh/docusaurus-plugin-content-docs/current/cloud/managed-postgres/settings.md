---
slug: /cloud/managed-postgres/settings
sidebar_label: '设置'
title: '设置'
description: '为 Managed Postgres 配置 PostgreSQL 和 PgBouncer 参数并管理实例设置'
keywords: ['Postgres 配置', 'PostgreSQL 设置', 'PgBouncer']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import postgresParameters from '@site/static/images/managed-postgres/postgres-parameters.png';
import serviceActions from '@site/static/images/managed-postgres/service-actions.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.settings-beta" />

您可以通过侧边栏中的 **Settings** 选项卡修改配置参数并管理 Managed Postgres 实例的设置。

## 服务操作和伸缩 \{#service-actions\}

<Image img={serviceActions} alt="Service actions and scaling" size="md" border />

**Service actions** 工具栏提供用于管理 Managed Postgres 实例的操作控件：

* **Reset password**：更新超级用户密码 (仅当实例处于 `Running` 状态时)
* **Restart**：重启数据库实例 (仅当实例处于 `Running` 状态时)
* **Delete**：删除实例

**Scaling** 部分允许您更改主节点和备用节点的实例类型，以增加或减少计算资源和存储容量。
更多详情请参见[扩缩容页面](/cloud/managed-postgres/scaling)。

## 更改配置参数 \{#changing-configuration\}

<Image img={postgresParameters} alt="Postgres 参数配置" size="md" border />

要修改参数，点击 **Edit parameters** 按钮。选择需要修改的参数，并按需更改其值。完成修改后，点击 **Save Changes** 按钮保存。

对配置参数所做的所有更改通常会在一分钟内持久化到实例中。某些参数需要重启数据库后才能生效。这些更改会在下次重启后生效，您可以在 **Service actions** 工具栏中手动触发重启。

请参阅关于配置参数的官方[文档](https://www.postgresql.org/docs/current/runtime-config.html)。可设置的参数列表很快会进一步扩充。在此期间，如果您需要当前尚未支持的参数，请联系[支持团队](https://clickhouse.com/support/program)提出申请。