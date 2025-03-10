---
slug: /interfaces/third-party/proxy
sidebar_position: 29
sidebar_label: 代理
---


# 第三方开发者的代理服务器

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) 是一个针对 ClickHouse 数据库的 HTTP 代理和负载均衡器。

功能：

- 每个用户的路由和响应缓存。
- 灵活的限制。
- 自动 SSL 证书续期。

用 Go 实现。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) 旨在成为 ClickHouse 和应用服务器之间的本地代理，适用于在应用端缓冲 INSERT 数据不可行或不方便的情况。

功能：

- 内存和磁盘数据缓冲。
- 每个表的路由。
- 负载均衡和健康检查。

用 Go 实现。

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) 是一个简单的 ClickHouse 插入收集器。

功能：

- 按阈值或区间分组请求并发送。
- 多个远程服务器。
- 基本身份验证。

用 Go 实现。
