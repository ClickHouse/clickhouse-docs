---
slug: /interfaces/postgresql
sidebar_position: 20
sidebar_label: PostgreSQL 接口
---


# PostgreSQL 接口

ClickHouse 支持 PostgreSQL 线协议，这使您可以使用 Postgres 客户端连接到 ClickHouse。从某种意义上说，ClickHouse 可以假装成一个 PostgreSQL 实例 - 允许您连接一个尚未直接支持 ClickHouse 的 PostgreSQL 客户端应用程序（例如，Amazon Redshift）。

要启用 PostgreSQL 线协议，请将 [postgresql_port](../operations/server-configuration-parameters/settings.md#postgresql_port) 设置添加到服务器的配置文件中。例如，您可以在 `config.d` 文件夹中定义一个新的 XML 文件来指定端口：

```xml
<clickhouse>
	<postgresql_port>9005</postgresql_port>
</clickhouse>
```

启动您的 ClickHouse 服务器，并查找类似以下内容的日志消息，提及 **正在监听 PostgreSQL 兼容协议**：

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
`psql` 客户端需要使用密码登录，因此您无法使用没有密码的 `default` 用户连接。请为 `default` 用户指定一个密码，或以其他用户的身份登录。
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

就这样！您现在已经将 PostgreSQL 客户端连接到 ClickHouse，所有命令和查询都在 ClickHouse 上执行。

:::note
PostgreSQL 协议目前仅支持明文密码。
:::

## 使用 SSL {#using-ssl}

如果您在 ClickHouse 实例上配置了 SSL/TLS，则 `postgresql_port` 将使用相同的设置（该端口对安全和不安全的客户端都是共享的）。

每个客户端都有自己连接 SSL 的方法。以下命令演示如何传递证书和密钥以安全地将 `psql` 连接到 ClickHouse：

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

有关其 SSL 设置的更多详细信息，请查看 [PostgreSQL 文档](https://jdbc.postgresql.org/documentation/head/ssl-client.html)。
