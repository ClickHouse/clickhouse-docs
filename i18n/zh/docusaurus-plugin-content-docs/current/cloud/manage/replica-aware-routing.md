---
title: '副本感知路由'
slug: '/manage/replica-aware-routing'
description: '如何使用副本感知路由来增加缓存重用'
keywords: ['cloud', 'sticky endpoints', 'sticky', 'endpoints', 'sticky routing', 'routing', 'replica aware routing']
---


# 副本感知路由（私人预览）

副本感知路由（也称为粘性会话、粘性路由或会话亲和性）利用了 [Envoy 代理的环形哈希负载均衡](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)。副本感知路由的主要目的是增加缓存重用的机会。它并不保证隔离。

启用服务的副本感知路由时，我们允许在服务主机名上使用通配符子域。对于主机名为 `abcxyz123.us-west-2.aws.clickhouse.cloud` 的服务，您可以使用任何与 `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` 匹配的主机名来访问该服务：

|示例主机名|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

当 Envoy 接收到与此模式匹配的主机名时，它将基于主机名计算路由哈希，并根据计算出的哈希在哈希环上找到相应的 ClickHouse 服务器。假设服务没有正在进行的变更（例如服务器重启、扩展或缩减），Envoy 将始终选择相同的 ClickHouse 服务器进行连接。

请注意，原始主机名仍将使用 `LEAST_CONNECTION` 负载均衡，这是默认的路由算法。

## 副本感知路由的限制 {#limitations-of-replica-aware-routing}

### 副本感知路由不保证隔离 {#replica-aware-routing-does-not-guarantee-isolation}

任何对服务的干扰，例如服务器 pod 重启（由于版本升级、崩溃、垂直扩展等原因）、服务器扩展或缩减，都会导致路由哈希环的中断。这将导致具有相同主机名的连接落到不同的服务器 pod 上。

### 副本感知路由不适用于私有链接 {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

客户需要手动添加 DNS 条目以使新主机名模式的名称解析正常工作。如果客户错误使用此功能，可能会导致服务器负载不均衡。

## 配置副本感知路由 {#configuring-replica-aware-routing}

要启用副本感知路由，请联系 [我们的支持团队](https://clickhouse.com/support)。
