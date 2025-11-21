---
title: '副本感知路由'
slug: /manage/replica-aware-routing
description: '如何使用副本感知路由来提高缓存复用率'
keywords: ['cloud', '黏性端点', 'sticky', 'endpoints', '黏性路由', 'routing', '副本感知路由']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# 副本感知路由

<PrivatePreviewBadge/>

副本感知路由（也称为粘性会话、粘性路由或会话亲和性）使用了 [Envoy 代理的 ring hash 负载均衡](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)。副本感知路由的主要目的是提高缓存复用的概率，但并不保证隔离性。

当为某个服务启用副本感知路由时，我们会在该服务主机名的基础上允许使用通配符子域名。对于主机名为 `abcxyz123.us-west-2.aws.clickhouse.cloud` 的服务，你可以使用任意符合 `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` 的主机名来访问该服务：

|示例主机名|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

当 Envoy 收到一个符合上述模式的主机名时，它会基于该主机名计算路由哈希值，并在哈希环上根据计算出的哈希值找到对应的 ClickHouse 服务器。假设当前服务没有正在进行的变更（例如服务器重启、扩缩容），Envoy 将始终选择同一台 ClickHouse 服务器进行连接。

注意，原始主机名仍然会使用 `LEAST_CONNECTION` 负载均衡策略，这是默认的路由算法。



## 副本感知路由的限制 {#limitations-of-replica-aware-routing}

### 副本感知路由不保证隔离性 {#replica-aware-routing-does-not-guarantee-isolation}

任何服务中断,例如服务器 pod 重启(由于版本升级、崩溃、垂直扩容等任何原因)、服务器横向扩展或缩减,都会导致路由哈希环发生中断。这将导致使用相同主机名的连接被路由到不同的服务器 pod 上。

### 副本感知路由无法与私有链接开箱即用 {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

客户需要手动添加 DNS 条目,以使新主机名模式的名称解析正常工作。如果客户使用不当,可能会导致服务器负载不均衡。


## 配置副本感知路由 {#configuring-replica-aware-routing}

如需启用副本感知路由功能,请联系[我们的支持团队](https://clickhouse.com/support/program)。
