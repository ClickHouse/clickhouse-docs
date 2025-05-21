---
'description': '描述了用于ClickHouse的可用第三方代理解决方案'
'sidebar_label': '代理'
'sidebar_position': 29
'slug': '/interfaces/third-party/proxy'
'title': '第三方开发者提供的代理服务器'
---




# 第三方开发者的代理服务器

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) 是一个用于 ClickHouse 数据库的 HTTP 代理和负载均衡器。

特点：

- 每用户路由和响应缓存。
- 灵活的限制。
- 自动 SSL 证书续订。

用 Go 实现。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) 旨在成为 ClickHouse 与应用服务器之间的本地代理，以防在应用程序端缓冲 INSERT 数据不可能或不方便时使用。

特点：

- 内存和磁盘数据缓冲。
- 按表路由。
- 负载均衡和健康检查。

用 Go 实现。

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) 是一个简单的 ClickHouse 插入收集器。

特点：

- 按阈值或时间间隔分组请求并发送。
- 支持多个远程服务器。
- 基本身份验证。

用 Go 实现。
