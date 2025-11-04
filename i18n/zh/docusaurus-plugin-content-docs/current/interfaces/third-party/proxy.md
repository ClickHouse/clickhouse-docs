---
'description': '描述可用于 ClickHouse 的第三方代理解决方案'
'sidebar_label': 'Proxies'
'sidebar_position': 29
'slug': '/interfaces/third-party/proxy'
'title': '来自第三方开发者的代理服务器'
'doc_type': 'reference'
---


# 第三方开发者的代理服务器

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) 是一个用于 ClickHouse 数据库的 HTTP 代理和负载均衡器。

特点：

- 每用户路由和响应缓存。
- 灵活的限制。
- 自动 SSL 证书续期。

使用 Go 实现。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) 旨在充当 ClickHouse 与应用服务器之间的本地代理，以便在无法或不便在应用一侧缓冲 INSERT 数据时使用。

特点：

- 内存和磁盘数据缓冲。
- 每表路由。
- 负载均衡和健康检查。

使用 Go 实现。

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) 是一个简单的 ClickHouse 插入收集器。

特点：

- 分组请求并按照阈值或时间间隔发送。
- 多个远程服务器。
- 基本身份验证。

使用 Go 实现。
