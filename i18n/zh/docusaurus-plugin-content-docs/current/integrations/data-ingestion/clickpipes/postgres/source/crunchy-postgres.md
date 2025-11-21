---
sidebar_label: 'Crunchy Bridge Postgres'
description: '将 Crunchy Bridge Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/crunchy-postgres
title: 'Crunchy Bridge Postgres 数据源配置指南'
keywords: ['crunchy bridge', 'postgres', 'clickpipes', 'logical replication', 'data ingestion']
doc_type: '指南'
---

import firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/firewall_rules_crunchy_bridge.png'
import add_firewall_rules_crunchy_bridge from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/crunchy-postgres/add_firewall_rules_crunchy_bridge.png'
import Image from '@theme/IdealImage';


# Crunchy Bridge Postgres 源端设置指南

ClickPipes 支持 Postgres 12 及更高版本。



## 启用逻辑复制 {#enable-logical-replication}

Crunchy Bridge [默认](https://docs.crunchybridge.com/how-to/logical-replication)启用逻辑复制。请确保以下设置配置正确,如有必要请进行相应调整。

```sql
SHOW wal_level; -- 应为 logical
SHOW max_wal_senders; -- 应为 10
SHOW max_replication_slots; -- 应为 10
```


## 创建 ClickPipes 用户并授予权限 {#creating-clickpipes-user-and-granting-permissions}

使用 `postgres` 用户连接到您的 Crunchy Bridge Postgres,然后运行以下命令:

1. 创建一个专用于 ClickPipes 的 Postgres 用户。

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 向 `clickpipes_user` 授予对需要复制表所在模式的只读访问权限。以下示例展示了如何为 `public` 模式授予权限。如果需要授予对多个模式的访问权限,可以为每个模式分别运行这三条命令。

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 向该用户授予复制访问权限:

   ```sql
    ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 创建用于后续创建 MIRROR(复制)的发布。

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```


## 将 ClickPipes IP 地址加入安全列表 {#safe-list-clickpipes-ips}

通过在 Crunchy Bridge 中添加防火墙规则,将 [ClickPipes IP 地址](../../index.md#list-of-static-ips)加入安全列表。

<Image
  size='lg'
  img={firewall_rules_crunchy_bridge}
  alt='在 Crunchy Bridge 中哪里可以找到防火墙规则?'
  border
/>

<Image
  size='lg'
  img={add_firewall_rules_crunchy_bridge}
  alt='为 ClickPipes 添加防火墙规则'
  border
/>


## 下一步操作 {#whats-next}

现在您可以[创建 ClickPipe](../index.md) 并开始将 Postgres 实例中的数据导入 ClickHouse Cloud。
请务必记录设置 Postgres 实例时使用的连接详细信息,因为在创建 ClickPipe 过程中需要用到这些信息。
