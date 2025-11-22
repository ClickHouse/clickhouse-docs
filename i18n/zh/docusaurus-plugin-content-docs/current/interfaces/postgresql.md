---
description: 'ClickHouse 中基于 PostgreSQL wire 协议的接口文档'
sidebar_label: 'PostgreSQL 接口'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'PostgreSQL 接口'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# PostgreSQL 接口

<CloudNotSupportedBadge />

ClickHouse 支持 PostgreSQL 线协议（wire protocol），这使你能够使用 Postgres 客户端连接到 ClickHouse。某种意义上，ClickHouse 可以伪装成 PostgreSQL 实例，从而允许你将尚未被 ClickHouse 直接支持的 PostgreSQL 客户端应用程序（例如 Amazon Redshift）连接到 ClickHouse。

要启用 PostgreSQL 线协议，请在服务器的配置文件中添加 [postgresql&#95;port](../operations/server-configuration-parameters/settings.md#postgresql_port) 设置项。例如，你可以在 `config.d` 目录中新建一个 XML 文件来定义该端口：

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

启动 ClickHouse 服务器，并查找日志中类似如下、包含 **Listening for PostgreSQL compatibility protocol**（表示“正在监听 PostgreSQL 兼容协议”）的消息：

```response
{} <Information> Application: 正在监听 PostgreSQL 兼容协议：127.0.0.1:9005
```


## 将 psql 连接到 ClickHouse {#connect-psql-to-clickhouse}

以下命令演示了如何将 PostgreSQL 客户端 `psql` 连接到 ClickHouse:

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

例如:

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql` 客户端需要使用密码登录,因此无法使用没有密码的 `default` 用户进行连接。请为 `default` 用户分配密码,或使用其他用户登录。
:::

`psql` 客户端会提示输入密码:

```response
Password for user alice:
psql (14.2, server 22.3.1.1)
WARNING: psql major version 14, server major version 22.
         Some psql features might not work.
Type "help" for help.

default=>
```

完成!现在您已将 PostgreSQL 客户端连接到 ClickHouse,所有命令和查询都将在 ClickHouse 上执行。

:::note
PostgreSQL 协议目前仅支持明文密码。
:::


## 使用 SSL {#using-ssl}

如果您在 ClickHouse 实例上配置了 SSL/TLS,则 `postgresql_port` 将使用相同的设置(该端口同时支持安全和非安全客户端)。

每个客户端都有各自使用 SSL 连接的方法。以下命令演示了如何传入证书和密钥以安全地将 `psql` 连接到 ClickHouse:

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```


## 使用 SCRAM-SHA-256 配置 ClickHouse 用户身份验证 {#using-scram-sha256}

为确保 ClickHouse 中用户身份验证的安全性,建议使用 SCRAM-SHA-256 协议。在 users.xml 文件中指定 `password_scram_sha256_hex` 元素来配置用户。密码哈希值必须使用 num_iterations=4096 生成。

确保 psql 客户端支持 SCRAM-SHA-256 并在连接时进行协商。

用户 `user_with_sha256` 的配置示例,密码为 `abacaba`:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

查看 [PostgreSQL 文档](https://jdbc.postgresql.org/documentation/head/ssl-client.html)了解有关 SSL 设置的更多详细信息。
