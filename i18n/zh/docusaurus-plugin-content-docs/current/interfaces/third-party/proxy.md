---
'description': '描述可用的第三方代理解决方案用于 ClickHouse'
'sidebar_label': 'Proxies'
'sidebar_position': 29
'slug': '/interfaces/third-party/proxy'
'title': '第三方开发者的代理服务器'
---


# 来自第三方开发者的代理服务器

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) 是一个用于 ClickHouse 数据库的 HTTP 代理和负载均衡器。

特点：

- 用户级路由和响应缓存。
- 灵活的限制。
- 自动 SSL 证书续订。

用 Go 实现。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) 旨在充当 ClickHouse 与应用服务器之间的本地代理，以防在应用程序端缓存 INSERT 数据不便或不可能。

特点：

- 内存和磁盘数据缓冲。
- 每个表的路由。
- 负载均衡和健康检查。

用 Go 实现。

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) 是一个简单的 ClickHouse 插入收集器。

特点：

- 按阈值或间隔分组请求并发送。
- 多个远程服务器。
- 基本身份验证。

用 Go 实现。
