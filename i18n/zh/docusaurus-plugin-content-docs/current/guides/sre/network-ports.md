---
slug: /guides/sre/network-ports
sidebar_label: '网络端口'
title: '网络端口'
description: '可用网络端口的说明及其用途'
doc_type: 'reference'
keywords: ['network', 'ports', 'configuration', 'security', 'firewall']
---

# 网络端口

:::note
标记为**默认**的端口表示该端口号在 `/etc/clickhouse-server/config.xml` 中配置。如需自定义设置,请在 `/etc/clickhouse-server/config.d/` 目录下添加配置文件。详见[配置文件](/operations/configuration-files)文档。
:::

|端口|说明|Cloud|OSS|
|----|-----------|-----|---|
|2181|ZooKeeper 默认服务端口。**注意:ClickHouse Keeper 请参见 `9181`**||✓|
|8123|HTTP 默认端口||✓|
|8443|HTTP SSL/TLS 默认端口|✓|✓|
|9000|原生协议端口(也称为 ClickHouse TCP 协议)。供 ClickHouse 应用程序和进程使用,如 `clickhouse-server`、`clickhouse-client` 及其他原生 ClickHouse 工具。用于分布式查询的服务器间通信。||✓|
|9004|MySQL 协议模拟端口||✓|
|9005|PostgreSQL 协议模拟端口(启用 SSL 时也用于 ClickHouse 的安全通信)。||✓|
|9009|用于底层数据访问的服务器间通信端口。用于数据交换、复制及服务器间通信。||✓|
|9010|服务器间通信 SSL/TLS 端口||✓|
|9011|原生协议 PROXYv1 端口||✓|
|9019|JDBC 桥接端口||✓|
|9100|gRPC 端口||✓|
|9181|ClickHouse Keeper 推荐端口||✓|
|9234|ClickHouse Keeper Raft 推荐端口(启用 `<secure>1</secure>` 时也用于安全通信)||✓|
|9363|Prometheus 默认指标端口||✓|
|9281|ClickHouse Keeper 安全 SSL 推荐端口||✓|
|9440|原生协议 SSL/TLS 端口|✓|✓|
|42000|Graphite 默认端口||✓|