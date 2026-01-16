---
description: '描述可用于 ClickHouse 的第三方代理解决方案'
sidebar_label: '代理'
sidebar_position: 29
slug: /interfaces/third-party/proxy
title: '第三方开发的代理服务器'
doc_type: 'reference'
---

# 第三方开发的代理服务器 \\{#proxy-servers-from-third-party-developers\\}

## chproxy \\{#chproxy\\}

[chproxy](https://github.com/Vertamedia/chproxy) 是一个用于 ClickHouse 数据库的 HTTP 代理和负载均衡器。

功能特性：

- 按用户划分的路由和响应缓存。
- 灵活的限制机制。
- 自动续期 SSL 证书。

由 Go 语言实现。

## KittenHouse \\{#kittenhouse\\}

[KittenHouse](https://github.com/VKCOM/kittenhouse) 旨在在无法或不方便在应用程序端对 `INSERT` 数据进行缓冲时，作为 ClickHouse 与应用服务器之间的本地代理。

特性：

- 内存与磁盘级数据缓冲。
- 基于表的路由。
- 负载均衡与健康检查。

使用 Go 语言实现。

## ClickHouse-Bulk \\{#clickhouse-bulk\\}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) 是一个简单的 ClickHouse 数据写入收集器。

功能：

- 将请求分组，并按阈值或时间间隔批量发送。
- 支持多个远程服务器。
- 支持基本身份验证。

用 Go 编写。
