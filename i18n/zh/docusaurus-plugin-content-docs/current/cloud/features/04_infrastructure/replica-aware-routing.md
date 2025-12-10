---
title: '副本感知型路由'
slug: /manage/replica-aware-routing
description: '如何利用副本感知型路由提高缓存复用率'
keywords: ['云', '粘性端点', '粘性', '端点', '粘性路由', '路由', '副本感知型路由']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# 副本感知路由 {#replica-aware-routing}

<PrivatePreviewBadge/>

副本感知路由（也称为 sticky sessions、sticky routing 或 session affinity）使用了 [Envoy proxy 的 ring hash 负载均衡](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)。副本感知路由的主要目的是提高缓存复用的概率，它并不保证隔离。

为某个服务启用副本感知路由后，我们会在该服务主机名的基础上额外开放通配符子域名。对于主机名为 `abcxyz123.us-west-2.aws.clickhouse.cloud` 的服务，可以使用任何与 `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` 匹配的主机名访问该服务：

|示例主机名|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

当 Envoy 收到与此模式匹配的主机名时，它会基于该主机名计算路由哈希值，并根据计算出的哈希在哈希环上找到对应的 ClickHouse 服务器。在服务没有正在发生变更（例如服务器重启、扩缩容）的前提下，Envoy 将始终选择同一台 ClickHouse 服务器进行连接。

请注意，原始主机名仍然会使用 `LEAST_CONNECTION` 负载均衡，这是默认的路由算法。

## 副本感知路由的限制 {#limitations-of-replica-aware-routing}

### 副本感知路由不保证隔离 {#replica-aware-routing-does-not-guarantee-isolation}

对服务的任何中断，例如服务器 pod（容器组）重启（由于版本升级、崩溃、纵向扩容等原因）、服务器横向扩容或缩容，都会导致路由哈希环发生变化。这会使使用相同主机名的连接被调度到不同的服务器 pod（容器组）上。

### 副本感知路由无法开箱即用地与 Private Link 搭配使用 {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

客户需要手动添加一条 DNS 记录，才能使新的主机名模式的名称解析生效。如果使用不当，这可能会导致服务器负载不均衡。

## 配置副本感知路由 {#configuring-replica-aware-routing}

如需启用副本感知路由功能，请联系[我们的支持团队](https://clickhouse.com/support/program)。
