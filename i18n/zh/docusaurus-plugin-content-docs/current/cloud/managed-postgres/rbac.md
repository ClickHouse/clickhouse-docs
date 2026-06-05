---
slug: /cloud/managed-postgres/rbac
sidebar_label: 'RBAC'
title: 'Managed Postgres RBAC'
description: '了解 ClickHouse Managed Postgres 中的基于角色的访问控制（RBAC）'
keywords: ['managed postgres RBAC', '访问控制', '角色', '特权', '权限']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import usersAndRoles from '@site/static/images/managed-postgres/rbac/usersandroles.png';
import postgresEntity from '@site/static/images/managed-postgres/rbac/postgresentity.png';
import newPostgresPerms from '@site/static/images/managed-postgres/rbac/newpostgresperms.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.rbac-beta" />

ClickHouse Cloud 支持为 Managed Postgres 服务提供基于角色的访问控制 (RBAC) 。您可以创建具有特定权限的自定义角色，并将其分配给组织成员，以控制哪些人可以查看或管理您的 Postgres 服务。

## 可用权限 \{#available-permissions\}

Managed Postgres 目前支持以下两项权限：

| 权限                 | 说明                         |
| ------------------ | -------------------------- |
| **查看 Postgres 服务** | 允许用户查看 Postgres 服务及其详细信息。  |
| **管理 Postgres 服务** | 允许用户修改、扩缩容和配置 Postgres 服务。 |

创建新的 Postgres 服务需要具备现有的 **Organization manage** 权限。上述权限仅适用于现有服务。

:::note
未来版本将提供更细粒度的权限控制。
:::

## 创建自定义角色 \{#creating-a-custom-role\}

1. 在左侧边栏中点击您的组织名称，然后选择 **用户和角色**。

<Image img={usersAndRoles} alt="用户和角色菜单" size="md" border />

2. 切换到 **角色** 选项卡，然后点击 **创建角色**。
3. 输入角色名称，然后点击 **+ 允许**，并从实体列表中选择 **Postgres Service**。

<Image img={postgresEntity} alt="选择 Postgres Service 实体" size="md" border />

4. 选择要将该角色限定到的 Postgres 服务，然后选择要授予的权限。

<Image img={newPostgresPerms} alt="为角色配置 Postgres 权限" size="md" border />

5. 点击 **创建角色** 进行保存。

## 分配角色 \{#assigning-a-role\}

创建角色后，请在同一 **用户和角色** 页面中的 **用户** 选项卡下将其分配给用户。一个用户可以拥有多个角色，而多个角色也可以组合使用，以构建出所需的精确访问配置。