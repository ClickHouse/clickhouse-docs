---
description: 'ClickHouse 中 MySQL 协议接口的文档，允许 MySQL 客户端连接 ClickHouse'
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

# MySQL 接口 {#mysql-interface}

ClickHouse 支持 MySQL 线协议（wire protocol）。这使得某些没有原生 ClickHouse 连接器的客户端可以改用 MySQL 协议进行连接，并且已经与以下 BI 工具完成验证：

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

如果你在尝试其它尚未测试的客户端或集成，需要注意可能存在以下限制：

- SSL 实现可能不完全兼容；可能会出现与 [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) 相关的问题。
- 某些工具可能需要尚未实现的方言特性（例如特定于 MySQL 的函数或设置）。

如果存在原生驱动（例如 [DBeaver](../integrations/dbeaver)），应优先使用原生驱动而不是 MySQL 接口。此外，尽管大多数通过 MySQL 协议工作的客户端通常可以正常使用，但 MySQL 接口不能保证可作为已有 MySQL 查询代码库的即插即用替代方案。

如果你的使用场景涉及某个没有原生 ClickHouse 驱动的特定工具，并希望通过 MySQL 接口来使用它，但发现存在某些不兼容之处，请在 ClickHouse 仓库中[创建一个 issue](https://github.com/ClickHouse/ClickHouse/issues)。

::::note
为了更好地支持上述 BI 工具的 SQL 方言，ClickHouse 的 MySQL 接口会在设置 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias) 的情况下隐式运行 SELECT 查询。
这一行为无法关闭，并且在极少数边缘场景下，可能会导致发送到 ClickHouse 常规查询接口与 MySQL 查询接口的查询产生不同行为。
::::

## 在 ClickHouse Cloud 上启用 MySQL 接口 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. 创建好 ClickHouse Cloud 服务后，点击 `Connect` 按钮。

<br/>

<Image img={mysql0} alt="凭据界面 - 提示" size="md"/>

2. 将 `Connect with` 下拉框更改为 `MySQL`。 

<br/>

<Image img={mysql1} alt="凭据界面 - 已选择 MySQL" size="md" />

3. 打开开关，为该特定服务启用 MySQL 接口。这样会为该服务开放端口 `3306`，并显示包含您唯一 MySQL 用户名的 MySQL 连接界面。密码与该服务默认用户的密码相同。

<br/>

<Image img={mysql2} alt="凭据界面 - 已启用 MySQL" size="md"/>

复制显示的 MySQL 连接字符串。

<Image img={mysql3} alt="凭据界面 - 连接字符串" size="md"/>

## 在 ClickHouse Cloud 中创建多个 MySQL 用户 {#creating-multiple-mysql-users-in-clickhouse-cloud}

默认情况下，系统内置了一个 `mysql4<subdomain>` 用户，它使用与 `default` 用户相同的密码。`<subdomain>` 部分是你的 ClickHouse Cloud 主机名的第一个片段。要与那些实现了安全连接、但在 TLS 握手中**不**提供 [SNI 信息](https://www.cloudflare.com/learning/ssl/what-is-sni) 的工具配合使用，就必须采用这种格式；否则在用户名中没有这个额外提示的情况下，无法完成内部路由（MySQL 控制台客户端就是此类工具之一）。

因此，当创建要通过 MySQL 接口使用的新用户时，我们*强烈建议*遵循 `mysql4<subdomain>_<username>` 这种格式，其中 `<subdomain>` 是用来标识你的 Cloud 服务的提示，而 `<username>` 则是你自定义的任意后缀。

:::tip
对于像 `foobar.us-east1.aws.clickhouse.cloud` 这样的 ClickHouse Cloud 主机名，`<subdomain>` 部分等于 `foobar`，一个自定义的 MySQL 用户名可以类似于 `mysql4foobar_team1`。
:::

如果你需要应用额外设置等，可以创建额外用户用于 MySQL 接口。

1. （可选）创建一个要应用于自定义用户的[设置配置文件](/sql-reference/statements/create/settings-profile)。例如，创建一个带有额外设置的 `my_custom_profile`，它会在稍后使用我们创建的用户连接时默认生效：

   ```sql
   CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
   ```

   `prefer_column_name_to_alias` 只是一个示例，你也可以在这里使用其他设置。

2. 使用以下格式[创建用户](/sql-reference/statements/create/user)：`mysql4<subdomain>_<username>`（[见上文](#creating-multiple-mysql-users-in-clickhouse-cloud)）。密码必须为 double SHA1 格式。例如：

   ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
    ```

   或者，如果你希望为该用户使用自定义配置文件：

   ```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
    ```

   其中 `my_custom_profile` 是你之前创建的配置文件名称。

3. 为新用户[授予](/sql-reference/statements/grant)与目标表或数据库交互所需的权限。例如，如果你只想授予对 `system.query_log` 的访问权限：

   ```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
    ```

4. 使用你创建的用户，通过 MySQL 接口连接到你的 ClickHouse Cloud 服务。

### 在 ClickHouse Cloud 中排查多个 MySQL 用户问题 {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

如果你创建了一个新的 MySQL 用户，并且在通过 MySQL CLI 客户端连接时看到如下错误：

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

在这种情况下，请确保用户名符合 `mysql4<subdomain>_<username>` 格式，如[上文](#creating-multiple-mysql-users-in-clickhouse-cloud)所述。

## 在自管 ClickHouse 上启用 MySQL 接口 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

将 [mysql&#95;port](../operations/server-configuration-parameters/settings.md#mysql_port) 设置添加到服务器的配置文件中。例如，你可以在 `config.d/` [文件夹](../operations/configuration-files) 中新建一个 XML 文件来定义该端口：

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

启动 ClickHouse 服务器，并在日志中查找类似如下的信息，其中包含 “Listening for MySQL compatibility protocol”：

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## 将 MySQL 连接到 ClickHouse {#connect-mysql-to-clickhouse}

以下命令演示了如何使用 MySQL 客户端 `mysql` 连接到 ClickHouse：

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

例如：

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

连接成功时的输出：

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

为了兼容所有 MySQL 客户端，建议在配置文件中使用 [双重 SHA1](/operations/settings/settings-users#user-namepassword) 指定用户密码。
如果使用 [SHA256](/sql-reference/functions/hash-functions#SHA256) 指定用户密码，一些客户端将无法完成身份验证（如 mysqljs 和旧版本的 MySQL、MariaDB 命令行工具）。

限制：

* 不支持预处理查询（prepared queries）

* 某些数据类型会以字符串形式发送

要取消一个长时间运行的查询，请使用 `KILL QUERY connection_id` 语句（在执行时会被替换为 `KILL QUERY WHERE query_id = connection_id`）。例如：

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
