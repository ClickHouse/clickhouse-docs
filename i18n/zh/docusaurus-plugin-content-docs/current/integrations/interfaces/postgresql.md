---
description: 'ClickHouse 中 PostgreSQL wire 协议接口的文档'
sidebar_label: 'PostgreSQL 接口'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'PostgreSQL 接口'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# PostgreSQL 接口 \{#postgresql-interface\}

<CloudNotSupportedBadge />

ClickHouse 支持 PostgreSQL 线协议，这使你可以使用 PostgreSQL 客户端连接到 ClickHouse。在某种意义上，ClickHouse 可以充当一个 PostgreSQL 实例——从而允许你将 PostgreSQL 客户端应用程序连接到 ClickHouse，即便该应用程序本身并不直接支持 ClickHouse（例如 Amazon Redshift）。

要启用 PostgreSQL 线协议，请在服务器的配置文件中添加 [postgresql&#95;port](/operations/server-configuration-parameters/settings#postgresql_port) 设置。例如，你可以在 `config.d` 目录中新建一个 XML 文件来定义该端口：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

启动 ClickHouse 服务器，并查找类似如下的日志消息，其中包含 **Listening for PostgreSQL compatibility protocol**：

```response
{} <Information> Application: Listening for PostgreSQL compatibility protocol: 127.0.0.1:9005
```

## 使用 psql 连接 ClickHouse \{#connect-psql-to-clickhouse\}

以下命令演示了如何使用 PostgreSQL 客户端 `psql` 连接到 ClickHouse：

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

例如：

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql` 客户端需要使用密码登录，因此你无法使用没有密码的 `default` 用户进行连接。请为 `default` 用户设置密码，或者使用其他用户登录。
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

就这样！你现在已经有一个 PostgreSQL 客户端连接到了 ClickHouse，所有命令和查询都会在 ClickHouse 上执行。

:::note
PostgreSQL 协议目前仅支持明文密码。
:::

## 使用 SSL \{#using-ssl\}

如果你的 ClickHouse 实例已经配置了 SSL/TLS，那么 `postgresql_port` 将会使用相同的设置（该端口同时供加密和未加密客户端共享）。

每个客户端都有自己通过 SSL 建立连接的方式。下面的命令演示了如何传入证书和密钥，以安全地将 `psql` 连接到 ClickHouse：

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## 使用 SCRAM-SHA-256 配置 ClickHouse 用户认证 \{#using-scram-sha256\}

为确保 ClickHouse 用户身份验证的安全性，建议使用 SCRAM-SHA-256 协议。通过在 users.xml 文件中指定 `password_scram_sha256_hex` 元素来配置用户。密码哈希必须使用 num&#95;iterations=4096 参数生成。

请确保 psql 客户端在连接过程中支持并协商 SCRAM-SHA-256。

以下是用户 `user_with_sha256`，密码为 `abacaba` 的示例配置：

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

有关其 SSL 设置的更多详细信息，请参阅 [PostgreSQL 文档](https://jdbc.postgresql.org/documentation/head/ssl-client.html)。
