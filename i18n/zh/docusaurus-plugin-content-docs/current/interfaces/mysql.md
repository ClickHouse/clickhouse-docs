---
'description': '在ClickHouse中的MySQL协议接口文档，允许MySQL客户端连接到ClickHouse'
'sidebar_label': 'MySQL接口'
'sidebar_position': 25
'slug': '/interfaces/mysql'
'title': 'MySQL接口'
---

import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';


# MySQL 接口

ClickHouse 支持 MySQL 线协议。这允许某些没有原生 ClickHouse 连接器的客户端利用 MySQL 协议，并且已与以下 BI 工具经过验证：

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

如果您正在尝试其他未经测试的客户端或集成，请注意可能存在以下限制：

- SSL 实现可能不完全兼容；可能存在潜在的 [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) 问题。
- 特定工具可能需要还未实现的方言特性（例如，特定于 MySQL 的函数或设置）。

如果有可用的原生驱动程序（例如 [DBeaver](../integrations/dbeaver)），通常建议您使用它而不是 MySQL 接口。此外，虽然大多数 MySQL 语言客户端应该能正常工作，但 MySQL 接口不保证可以替换现有的 MySQL 查询代码库。

如果您的用例涉及某个没有原生 ClickHouse 驱动程序的特定工具，并且您希望通过 MySQL 接口使用它，并发现某些不兼容性 - 请在 ClickHouse 仓库中 [创建一个问题](https://github.com/ClickHouse/ClickHouse/issues)。

::::note
为了更好地支持上述 BI 工具的 SQL 方言，ClickHouse 的 MySQL 接口隐式执行带有设置 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias) 的 SELECT 查询。
这无法关闭，在少数边缘情况下，可能导致通过 ClickHouse 的正常查询和 MySQL 查询接口发送的查询之间出现不同的行为。
::::

## 在 ClickHouse Cloud 上启用 MySQL 接口 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. 创建 ClickHouse Cloud 服务后，点击 `Connect` 按钮。

<br/>

<Image img={mysql0} alt="凭据屏幕 - 提示" size="md"/>

2. 将 `Connect with` 下拉菜单更改为 `MySQL`。

<br/>

<Image img={mysql1} alt="凭据屏幕 - 已选择 MySQL" size="md" />

3. 切换开关以为此特定服务启用 MySQL 接口。这将在此服务上开放端口 `3306` 并提示您显示包含您的唯一 MySQL 用户名的 MySQL 连接屏幕。密码将与服务的默认用户密码相同。

<br/>

<Image img={mysql2} alt="凭据屏幕 - 启用 MySQL" size="md"/>

复制所显示的 MySQL 连接字符串。

<Image img={mysql3} alt="凭据屏幕 - 连接字符串" size="md"/>

## 在 ClickHouse Cloud 中创建多个 MySQL 用户 {#creating-multiple-mysql-users-in-clickhouse-cloud}

默认情况下，存在一个内置的 `mysql4<subdomain>` 用户，其密码与 `default` 用户相同。`<subdomain>` 部分是您的 ClickHouse Cloud 主机名的第一部分。此格式对于实现安全连接的工具是必要的，但这些工具并未在其 TLS 握手中提供 [SNI 信息](https://www.cloudflare.com/learning/ssl/what-is-sni)，这使得在没有用户名中额外提示的情况下进行内部路由变得不可能（MySQL 控制台客户端就是其中一种工具）。

因此，我们 _强烈建议_ 在创建打算与 MySQL 接口一起使用的新用户时，遵循 `mysql4<subdomain>_<username>` 格式，其中 `<subdomain>` 是识别您的 Cloud 服务的提示，而 `<username>` 是您选择的任意后缀。

:::tip
对于 ClickHouse Cloud 主机名如 `foobar.us-east1.aws.clickhouse.cloud`，`<subdomain>` 部分等于 `foobar`，并且自定义 MySQL 用户名可以像 `mysql4foobar_team1` 一样。
:::

您可以创建额外的用户以与 MySQL 接口一起使用，例如，当您需要应用额外设置时。

1. 可选 - 创建一个 [设置配置文件](/sql-reference/statements/create/settings-profile) 以应用于您的自定义用户。例如，`my_custom_profile`，其中将应用额外设置，当我们使用其后创建的用户连接时：

```sql
    CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
```

`prefer_column_name_to_alias` 仅用作示例，您可以在这里使用其他设置。
2. [创建用户](/sql-reference/statements/create/user)，使用以下格式：`mysql4<subdomain>_<username>`（[见上文](#creating-multiple-mysql-users-in-clickhouse-cloud)）。密码必须为双 SHA1 格式。例如：

```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
```

或者如果您想为该用户使用自定义配置文件：

```sql
    CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
```

其中 `my_custom_profile` 是您之前创建的配置文件的名称。
3. [授予](/sql-reference/statements/grant) 新用户与所需表或数据库交互的必要权限。例如，如果您仅想授予对 `system.query_log` 的访问权限：

```sql
    GRANT SELECT ON system.query_log TO mysql4foobar_team1;
```

4. 使用创建的用户通过 MySQL 接口连接到您的 ClickHouse Cloud 服务。

### 解决 ClickHouse Cloud 中多个 MySQL 用户的问题 {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

如果您创建了一个新的 MySQL 用户，并且在通过 MySQL CLI 客户端连接时看到以下错误：

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

在这种情况下，请确保用户名遵循 `mysql4<subdomain>_<username>` 格式，如前所述（[上文](#creating-multiple-mysql-users-in-clickhouse-cloud)）。

## 在自管理 ClickHouse 上启用 MySQL 接口 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

将 [mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port) 设置添加到您服务器的配置文件中。例如，您可以在 `config.d/` [文件夹](../operations/configuration-files) 中的新 XML 文件中定义端口：

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

启动您的 ClickHouse 服务器，并查找类似以下提到的日志消息，提到正监听 MySQL 兼容协议：

```bash
{} <Information> Application: Listening for MySQL compatibility protocol: 127.0.0.1:9004
```

## 将 MySQL 连接到 ClickHouse {#connect-mysql-to-clickhouse}

以下命令演示如何将 MySQL 客户端 `mysql` 连接到 ClickHouse：

```bash
mysql --protocol tcp -h [hostname] -u [username] -P [port_number] [database_name]
```

例如：

```bash
$ mysql --protocol tcp -h 127.0.0.1 -u default -P 9004 default
```

如果连接成功，输出如下：

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

为了与所有 MySQL 客户端兼容，建议在配置文件中指定用户密码使用 [双 SHA1](/operations/settings/settings-users#user-namepassword)。
如果用户密码使用 [SHA256](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256) 指定，一些客户端将无法进行身份验证（mysqljs 和旧版本的命令行工具 MySQL 和 MariaDB）。

限制：

- 不支持预处理查询

- 一些数据类型以字符串形式发送

要取消长查询，请使用 `KILL QUERY connection_id` 语句（在处理时替换为 `KILL QUERY WHERE query_id = connection_id`）。例如：

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
