---
description: '介绍适用于 ClickHouse 的第三方代理解决方案'
sidebar_label: '代理'
sidebar_position: 29
slug: /interfaces/third-party/proxy
title: '第三方开发的代理服务器'
doc_type: 'reference'
---



# 第三方开发的代理服务器



## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) 是一个用于 ClickHouse 数据库的 HTTP 代理和负载均衡器。

特性：

- 按用户路由和响应缓存。
- 灵活的限制配置。
- 自动 SSL 证书续期。

使用 Go 语言实现。


## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) 是一个位于 ClickHouse 与应用服务器之间的本地代理,用于在应用端无法或不便缓冲 INSERT 数据时使用。

特性:

- 内存和磁盘数据缓冲。
- 按表路由。
- 负载均衡和健康检查。

使用 Go 实现。


## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) 是一个简单的 ClickHouse 插入数据收集器。

功能特性:

- 按阈值或时间间隔对请求进行分组并发送。
- 支持多个远程服务器。
- 支持基本身份验证。

使用 Go 语言实现。
