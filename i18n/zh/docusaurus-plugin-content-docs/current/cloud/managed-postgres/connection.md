---
slug: /cloud/managed-postgres/connection
sidebar_label: '连接'
title: '连接 ClickHouse Managed Postgres'
description: '用于 ClickHouse Managed Postgres 的连接字符串、PgBouncer 连接池和 TLS 配置'
keywords: ['postgres 连接', '连接字符串', 'pgbouncer', 'tls', 'ssl']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import connectButton from '@site/static/images/managed-postgres/connect-button.png';
import connectModal from '@site/static/images/managed-postgres/connect-modal.png';
import tlsCaBundle from '@site/static/images/managed-postgres/tls-ca-bundle.png';

<PrivatePreviewBadge />


## 访问连接详情 \{#accessing-connection-details\}

要将应用程序连接到 Managed Postgres，请在实例左侧侧边栏中进入 **Connect** 视图。

<Image img={connectButton} alt="点击左侧侧边栏中的 Connect 以查看连接详情" size="md" border/>

点击 **Connect** 会打开一个弹窗，其中以多种格式显示您的连接凭据和连接字符串。

<Image img={connectModal} alt="显示凭据和连接字符串格式的连接弹窗" size="md" border/>

连接弹窗会显示以下信息：

- **Username**：数据库用户（默认：`postgres`）
- **Password**：您的数据库密码（默认隐藏，点击眼睛图标可显示）
- **Server**：Managed Postgres 实例的主机名
- **Port**：PostgreSQL 端口（默认：`5432`）

Managed Postgres 为您的数据库提供超级用户访问权限。使用这些凭据以超级用户身份连接，以便创建其他用户并管理数据库对象。

## 连接字符串格式 \{#connection-string\}

**Connect via** 选项卡会根据你的应用程序需求，提供多种格式的连接字符串：

| 格式 | 描述 |
|--------|-------------|
| **url** | 标准连接 URL，格式为 `postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>` |
| **psql** | 可直接用于通过 psql 命令行工具进行连接的命令 |
| **env** | 供基于 libpq 的客户端使用的环境变量 |
| **yaml** | YAML 格式的配置 |
| **jdbc** | 适用于 Java 应用程序的 JDBC 连接字符串 |

出于安全考虑，连接字符串中的密码默认会被隐藏。单击任意字段或连接字符串旁的复制图标，可将其直接复制到剪贴板。

## PgBouncer 连接池 \{#pgbouncer\}

托管的 Postgres 包含一个内置的 [PgBouncer](https://www.pgbouncer.org/) 实例，用于在服务器端进行连接池管理。PgBouncer 有助于改进连接管理、性能和资源利用率，特别适用于以下类型的应用程序：

- 打开大量并发连接
- 频繁创建和关闭连接
- 使用 serverless 或短暂存在的计算环境

要使用连接池，请在连接对话框顶部单击 **via PgBouncer** 开关。连接信息会更新，将连接通过连接池路由，而不是直接连接到 PostgreSQL。

:::tip 何时使用 PgBouncer
当应用程序会打开大量短生命周期的连接时，请使用 PgBouncer。对于长时间运行的连接，或使用与连接池不兼容的 PostgreSQL 特性（例如跨事务的 prepared statements（预处理语句））的应用程序，请直接连接。
:::

## TLS 配置 \{#tls\}

所有托管的 Postgres 实例都通过 TLS 进行加密保护。支持的最低版本为 **TLS 1.3**。

### 快速连接（TLS 加密） \{#quick-connection\}

默认情况下，连接将使用 TLS 加密，但不验证证书：

```bash
psql 'postgresql://postgres:PASSWORD@your-instance.pg.clickhouse.cloud:5432/postgres'
```


### 已验证的 TLS 连接（推荐用于生产环境） \{#verified-tls\}

对于生产环境的工作负载，我们建议使用已验证的 TLS 进行连接，以确保你正在与正确的服务器通信。为此，从 **Settings** 选项卡下载 CA 证书包，并将其添加到数据库客户端的受信任证书存储中。

<Image img={tlsCaBundle} alt="从 Settings 选项卡下载 CA 证书包" size="md" border />

该 CA 证书是与你的 Managed Postgres 实例唯一对应的，不能用于其他实例。

要通过已验证的 TLS 建立连接，请在连接字符串中添加 `sslmode=verify-full`，并指定你已下载证书的路径：

```bash
psql 'postgresql://postgres:PASSWORD@your-instance.pg.clickhouse.cloud:5432/postgres?sslmode=verify-full&sslrootcert=/path/to/ca-certificate.pem'
```
