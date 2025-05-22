import Image from '@theme/IdealImage';
import mysql0 from '@site/static/images/interfaces/mysql0.png';
import mysql1 from '@site/static/images/interfaces/mysql1.png';
import mysql2 from '@site/static/images/interfaces/mysql2.png';
import mysql3 from '@site/static/images/interfaces/mysql3.png';

# MySQL 接口

ClickHouse 支持 MySQL 网络协议。这允许某些没有原生 ClickHouse 连接器的客户端利用 MySQL 协议，并已与以下 BI 工具进行了验证：

- [Looker Studio](../integrations/data-visualization/looker-studio-and-clickhouse.md)
- [Tableau Online](../integrations/tableau-online)
- [QuickSight](../integrations/quicksight)

如果您尝试其他未经测试的客户端或集成，请记住可能存在以下限制：

- SSL 实现可能不完全兼容；可能会有潜在的 [TLS SNI](https://www.cloudflare.com/learning/ssl/what-is-sni/) 问题。
- 某些工具可能需要语法特性（例如，特定于 MySQL 的函数或设置），但尚未实现。

如果有可用的原生驱动程序（例如，[DBeaver](../integrations/dbeaver)），建议使用它而不是 MySQL 接口。此外，尽管大多数 MySQL 语言客户端应该能够正常工作，但不保证 MySQL 接口可以作为现有 MySQL 查询代码库的即插即用替代品。

如果您的用例涉及没有原生 ClickHouse 驱动程序的特定工具，您希望通过 MySQL 接口使用它，并发现某些不兼容之处，请 [创建一个问题](https://github.com/ClickHouse/ClickHouse/issues) 在 ClickHouse 存储库中。

::::note
为了更好地支持上述 BI 工具的 SQL 方言，ClickHouse 的 MySQL 接口隐式运行 SELECT 查询，设置为 [prefer_column_name_to_alias = 1](/operations/settings/settings#prefer_column_name_to_alias)。这无法关闭，在少数边缘情况下可能导致发送到 ClickHouse 的正常查询接口和 MySQL 查询接口之间的不同行为。
::::

## 在 ClickHouse Cloud 上启用 MySQL 接口 {#enabling-the-mysql-interface-on-clickhouse-cloud}

1. 创建 ClickHouse Cloud 服务后，点击 `Connect` 按钮。

<br/>

<Image img={mysql0} alt="凭据界面 - 提示" size="md"/>

2. 将 `Connect with` 下拉菜单更改为 `MySQL`。

<br/>

<Image img={mysql1} alt="凭据界面 - 已选择 MySQL" size="md" />

3. 切换开关以启用此特定服务的 MySQL 接口。这将为此服务暴露端口 `3306` 并提示您查看包含您的唯一 MySQL 用户名的 MySQL 连接界面。密码将与服务的默认用户密码相同。

<br/>

<Image img={mysql2} alt="凭据界面 - 已启用 MySQL" size="md"/>

复制所示的 MySQL 连接字符串。

<Image img={mysql3} alt="凭据界面 - 连接字符串" size="md"/>

## 在 ClickHouse Cloud 上创建多个 MySQL 用户 {#creating-multiple-mysql-users-in-clickhouse-cloud}

默认情况下，有一个内置的 `mysql4<subdomain>` 用户，使用与 `default` 相同的密码。`<subdomain>` 部分是您的 ClickHouse Cloud 主机名的第一个部分。此格式对于实现安全连接的工具是必要的，但这些工具未在其 TLS 握手中提供 [SNI 信息](https://www.cloudflare.com/learning/ssl/what-is-sni)，这使得在用户名中没有额外提示的情况下进行内部路由变得不可能（MySQL 控制台客户端就是其中之一）。

因此，我们 _强烈建议_ 在创建用于 MySQL 接口的新用户时遵循 `mysql4<subdomain>_<username>` 格式，其中 `<subdomain>` 是识别您的 Cloud 服务的提示，`<username>` 是您选择的任意后缀。

:::tip
对于 ClickHouse Cloud 主机名如 `foobar.us-east1.aws.clickhouse.cloud`，`<subdomain>` 部分等于 `foobar`，自定义 MySQL 用户名可能看起来像 `mysql4foobar_team1`。
:::

您可以创建额外的用户以与 MySQL 接口一起使用，例如，如果您需要应用额外的设置。

1. 可选 - 创建一个 [settings profile](/sql-reference/statements/create/settings-profile) 以应用于您的自定义用户。例如，`my_custom_profile` 具有在我们稍后创建的用户连接时作为默认应用的额外设置：

```sql
CREATE SETTINGS PROFILE my_custom_profile SETTINGS prefer_column_name_to_alias=1;
```

    `prefer_column_name_to_alias` 只是一个示例，您可以在那里使用其他设置。
2. [创建用户](/sql-reference/statements/create/user)，使用以下格式：`mysql4<subdomain>_<username>` ([见上文](#creating-multiple-mysql-users-in-clickhouse-cloud))。密码必须采用双 SHA1 格式。例如：

```sql
CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$';
```

    或者如果您想为此用户使用自定义配置文件：

```sql
CREATE USER mysql4foobar_team1 IDENTIFIED WITH double_sha1_password BY 'YourPassword42$' SETTINGS PROFILE 'my_custom_profile';
```

    其中`my_custom_profile`是您之前创建的配置文件的名称。
3. [授权](/sql-reference/statements/grant) 新用户与所需表或数据库进行交互的必要权限。例如，如果您想仅授予对 `system.query_log` 的访问权限：

```sql
GRANT SELECT ON system.query_log TO mysql4foobar_team1;
```

4. 使用创建的用户通过 MySQL 接口连接到您的 ClickHouse Cloud 服务。

### 在 ClickHouse Cloud 中排查多个 MySQL 用户的问题 {#troubleshooting-multiple-mysql-users-in-clickhouse-cloud}

如果您创建了一个新的 MySQL 用户，并且在通过 MySQL CLI 客户端连接时看到以下错误：

```sql
ERROR 2013 (HY000): Lost connection to MySQL server at 'reading authorization packet', system error: 54
```

在这种情况下，请确保用户名遵循 `mysql4<subdomain>_<username>` 格式，如上所述 ([见上文](#creating-multiple-mysql-users-in-clickhouse-cloud))。

## 在自管理 ClickHouse 上启用 MySQL 接口 {#enabling-the-mysql-interface-on-self-managed-clickhouse}

将 [mysql_port](../operations/server-configuration-parameters/settings.md#mysql_port) 设置添加到服务器的配置文件中。例如，您可以在您的 `config.d/` [文件夹](../operations/configuration-files) 中定义新的 XML 文件来定义该端口：

```xml
<clickhouse>
    <mysql_port>9004</mysql_port>
</clickhouse>
```

启动 ClickHouse 服务器并查找类似以下提及监听 MySQL 兼容协议的日志消息：

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

为了与所有 MySQL 客户端兼容，建议在配置文件中指定用户密码使用 [double SHA1](/operations/settings/settings-users#user-namepassword)。如果用户密码使用 [SHA256](/sql-reference/functions/hash-functions#sha1-sha224-sha256-sha512-sha512_256) 指定，某些客户端将无法进行身份验证（mysqljs 和旧版本的命令行工具 MySQL 和 MariaDB）。

限制：

- 不支持预编译查询

- 某些数据类型作为字符串发送

要取消长时间运行的查询，请使用 `KILL QUERY connection_id` 语句（在处理时替换为 `KILL QUERY WHERE query_id = connection_id`）。例如：

```bash
$ mysql --protocol tcp -h mysql_server -P 9004 default -u default --password=123 -e "KILL QUERY 123456;"
```
