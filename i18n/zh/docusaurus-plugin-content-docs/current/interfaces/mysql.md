---
description: 'ClickHouse 中 MySQL 协议接口的文档，支持使用 MySQL 客户端连接到 ClickHouse'
sidebar_label: 'MySQL 接口'
sidebar_position: 25
slug: /interfaces/mysql
title: 'MySQL 接口'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL 接口

ClickHouse 支持 MySQL 线协议（wire protocol）。这使得某些没有原生 ClickHouse 连接器的客户端可以改用 MySQL 协议，并且该方式已经在以下 BI 工具中得到了验证：

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

如果你正在尝试其他尚未测试的客户端或集成方式，需要注意可能存在以下限制：

- SSL 实现可能并非完全兼容；可能会存在 [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) 相关的问题。
- 某些工具可能需要使用尚未实现的方言特性（例如 MySQL 特定的函数或设置）。

如果存在原生驱动（例如 [DBeaver](../integrations/dbeaver)），始终推荐优先使用原生驱动，而不是 MySQL 接口。此外，尽管大多数基于 MySQL 的客户端应当可以正常工作，但对于已经包含 MySQL 查询的代码库来说，MySQL 接口并不保证可以直接作为无缝替代方案使用。

如果你的使用场景涉及某个没有原生 ClickHouse 驱动的特定工具，希望通过 MySQL 接口来使用它，并且发现了某些不兼容之处，请在 ClickHouse 仓库中[创建 issue](https://github.com/ClickHouse/ClickHouse/issues)。

::::note
为了更好地支持上述 BI 工具的 SQL 方言，ClickHouse 的 MySQL 接口在执行 SELECT 查询时会隐式地使用设置 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias)。
该行为无法关闭，并且在极少数边缘场景中，可能会导致发送到 ClickHouse 常规查询接口与 MySQL 查询接口的查询表现存在差异。
::::



## 在 ClickHouse Cloud 上启用 MySQL 接口 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. 创建 ClickHouse Cloud 服务后,点击 `Connect` 按钮。

<br />

<Image img={mysql0} alt='凭据界面 - 提示' size='md' />

2. 将 `Connect with` 下拉菜单更改为 `MySQL`。

<br />

<Image img={mysql1} alt='凭据界面 - 已选择 MySQL' size='md' />

3. 切换开关以为此特定服务启用 MySQL 接口。这将为此服务开放端口 `3306`,并显示 MySQL 连接界面,其中包含您的唯一 MySQL 用户名。密码与服务的默认用户密码相同。

<br />

<Image img={mysql2} alt='凭据界面 - 已启用 MySQL' size='md' />

复制显示的 MySQL 连接字符串。

<Image img={mysql3} alt='凭据界面 - 连接字符串' size='md' />


## 在 ClickHouse Cloud 中创建多个 MySQL 用户 {#creating-multiple-mysql-users-in-clickhouse-cloud}

默认情况下,系统内置了一个 `mysql4<subdomain>` 用户,该用户使用与 `default` 用户相同的密码。`<subdomain>` 部分是您 ClickHouse Cloud 主机名的第一段。这种格式是为了兼容那些实现了安全连接但在 TLS 握手中不提供 [SNI 信息](https://www.cloudflare.com/learning/ssl/what-is-sni)的工具,因为如果用户名中没有额外的提示信息,就无法进行内部路由(MySQL 控制台客户端就是此类工具之一)。

因此,我们_强烈建议_在创建用于 MySQL 接口的新用户时遵循 `mysql4<subdomain>_<username>` 格式,其中 `<subdomain>` 是用于识别您 Cloud 服务的提示信息,`<username>` 是您选择的任意后缀。

:::tip
对于类似 `foobar.us-east1.aws.clickhouse.cloud` 的 ClickHouse Cloud 主机名,`<subdomain>` 部分为 `foobar`,自定义的 MySQL 用户名可以是 `mysql4foobar_team1`。
:::

如果您需要应用额外的设置,可以创建额外的用户来使用 MySQL 接口。

1. 可选 - 创建一个[设置配置文件](/sql-reference/statements/create/settings-profile)以应用于您的自定义用户。例如,创建 `my_custom_profile` 并添加一个额外的设置,该设置将在稍后使用创建的用户连接时默认应用:

   ```sql
   CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
   ```

   `prefer_column_name_to_alias` 仅作为示例使用,您可以在此处使用其他设置。

2. 使用以下格式[创建用户](/sql-reference/statements/create/user):`mysql4<subdomain>_<username>`([见上文](#creating-multiple-mysql-users-in-clickhouse-cloud))。密码必须采用双重 SHA1 格式。例如:

   ```sql
   CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
   ```

   或者如果您想为此用户使用自定义配置文件:

   ```sql
   CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
   ```

   其中 `my_custom_profile` 是您之前创建的配置文件名称。

3. [授予](/sql-reference/statements/grant)新用户与所需表或数据库交互的必要权限。例如,如果您只想授予对 `system.query_log` 的访问权限:

   ```sql
   GRANT SELECT ON system.query_log TO mysql4foobar_team1;
   ```

4. 使用创建的用户通过 MySQL 接口连接到您的 ClickHouse Cloud 服务。

### 排查 ClickHouse Cloud 中多个 MySQL 用户的问题 {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

如果您创建了新的 MySQL 用户,并在通过 MySQL CLI 客户端连接时看到以下错误:

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

在这种情况下,请确保用户名遵循 `mysql4<subdomain>_<username>` 格式,如([上文](#creating-multiple-mysql-users-in-clickhouse-cloud))所述。


## 在自管理 ClickHouse 上启用 MySQL 接口 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

将 [mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port) 设置添加到服务器的配置文件中。例如,可以在 `config.d/` [目录](../operations/configuration-files)下的新 XML 文件中定义端口:

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

启动 ClickHouse 服务器并查找类似以下内容的日志消息,其中提到 Listening for MySQL compatibility protocol:

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```


## 将 MySQL 连接到 ClickHouse {#connect-mysql-to-clickhouse}

以下命令演示如何使用 MySQL 客户端 `mysql` 连接到 ClickHouse:

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

例如:

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

连接成功后的输出:

```text
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 20.2.1.1-ClickHouse

Copyright (c) 2000, 2019, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

为了与所有 MySQL 客户端兼容,建议在配置文件中使用 [double SHA1](/operations/settings/settings-users#user-namepassword) 方式指定用户密码。
如果使用 [SHA256](/sql-reference/functions/hash-functions#SHA256) 方式指定用户密码,某些客户端将无法进行身份验证(如 mysqljs 以及旧版本的 MySQL 和 MariaDB 命令行工具)。

限制:

- 不支持预处理查询

- 某些数据类型会以字符串形式发送

要取消长时间运行的查询,请使用 `KILL QUERY connection_id` 语句(执行时会被替换为 `KILL QUERY WHERE query_id = connection_id`)。例如:

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
