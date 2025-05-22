---
'description': '描述可用于ClickHouse的第三方代理解决方案'
'sidebar_label': '代理'
'sidebar_position': 29
'slug': '/interfaces/third-party/proxy'
'title': '第三方开发者的代理服务器'
---


# 来自第三方开发者的代理服务器

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) 是一个用于 ClickHouse 数据库的 HTTP 代理和负载均衡器。

特点：

- 每用户路由和响应缓存。
- 灵活的限制。
- 自动 SSL 证书续期。

使用 Go 实现。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) 旨在成为 ClickHouse 与应用服务器之间的本地代理，以防在您的应用程序侧缓冲 INSERT 数据变得不可能或不方便。

特点：

- 内存和磁盘数据缓冲。
- 每表路由。
- 负载均衡和健康检查。

使用 Go 实现。

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) 是一个简单的 ClickHouse 插入收集器。

特点：

- 分组请求，并按阈值或间隔发送。
- 支持多个远程服务器。
- 基本认证。

使用 Go 实现。
