---
'description': 'ClickHouse 中 PostgreSQL 线协议接口的文档'
'sidebar_label': 'PostgreSQL 接口'
'sidebar_position': 20
'slug': '/interfaces/postgresql'
'title': 'PostgreSQL 接口'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# PostgreSQL 接口

<CloudNotSupportedBadge/>

ClickHouse 支持 PostgreSQL 线协议，这允许您使用 Postgres 客户端连接到 ClickHouse。在某种程度上，ClickHouse 可以假装是一个 PostgreSQL 实例 - 允许您连接到 ClickHouse 的 PostgreSQL 客户端应用程序，即那些 ClickHouse 尚未直接支持的客户端（例如，Amazon Redshift）。

要启用 PostgreSQL 线协议，请将 [postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port) 设置添加到您的服务器配置文件中。例如，您可以在 `config.d` 文件夹中定义一个新的 XML 文件来指定端口：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

启动您的 ClickHouse 服务器并查找类似以下信息的日志消息，提到 **正在监听 PostgreSQL 兼容协议**：

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## 连接 psql 到 ClickHouse {#connect-psql-to-clickhouse}

以下命令演示如何将 PostgreSQL 客户端 `psql` 连接到 ClickHouse：

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

例如：

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql` 客户端需要使用密码登录，因此您将无法使用没有密码的 `default` 用户连接。请为 `default` 用户分配一个密码，或以其他用户身份登录。
:::

`psql` 客户端会提示输入密码：

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

就是这样！您现在有一个连接到 ClickHouse 的 PostgreSQL 客户端，所有命令和查询都将在 ClickHouse 上执行。

:::note
PostgreSQL 协议目前仅支持明文密码。
:::

## 使用 SSL {#using-ssl}

如果您在 ClickHouse 实例上配置了 SSL/TLS，那么 `postgresql_port` 将使用相同的设置（此端口对于安全和不安全的客户端是共享的）。

每个客户端都有自己使用 SSL 连接的方法。以下命令演示如何传递证书和密钥，以安全地将 `psql` 连接到 ClickHouse：

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## 使用 SCRAM-SHA-256 配置 ClickHouse 用户身份验证 {#using-scram-sha256}

为了确保 ClickHouse 中安全的用户身份验证，建议使用 SCRAM-SHA-256 协议。通过在 users.xml 文件中指定 `password_scram_sha256_hex` 元素来配置用户。密码哈希必须使用 num_iterations=4096 生成。

确保 psql 客户端在连接期间支持并协商 SCRAM-SHA-256。

用户 `user_with_sha256` 使用密码 `abacaba` 的示例配置：

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

查看 [PostgreSQL 文档](https://jdbc.postgresql.org/documentation/head/ssl-client.html) 以获取有关其 SSL 设置的更多详细信息。
