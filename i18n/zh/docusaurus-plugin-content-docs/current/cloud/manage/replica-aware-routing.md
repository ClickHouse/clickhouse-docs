---
'title': '副本感知路由'
'slug': '/manage/replica-aware-routing'
'description': '如何使用副本感知路由来增加缓存重用'
'keywords':
- 'cloud'
- 'sticky endpoints'
- 'sticky'
- 'endpoints'
- 'sticky routing'
- 'routing'
- 'replica aware routing'
---


# 副本感知路由 (私人预览)

副本感知路由（也称为粘性会话、粘性路由或会话亲和性）利用 [Envoy 代理的环哈希负载均衡](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)。副本感知路由的主要目的是增加缓存重用的机会。它并不保证隔离。

当为服务启用副本感知路由时，我们允许在服务主机名的基础上使用通配符子域名。对于主机名为 `abcxyz123.us-west-2.aws.clickhouse.cloud` 的服务，您可以使用任何匹配 `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` 的主机名来访问该服务：

| 示例主机名 |
|---|
| `aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` |
| `000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` |
| `clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` |

当 Envoy 接收到匹配此模式的主机名时，它将根据主机名计算路由哈希，并在哈希环上找到相应的 ClickHouse 服务器。假设服务没有正在进行的更改（例如，服务器重启、扩展或收缩），Envoy 将始终选择相同的 ClickHouse 服务器进行连接。

请注意，原始主机名仍将使用 `LEAST_CONNECTION` 负载均衡，这是默认的路由算法。

## 副本感知路由的局限性 {#limitations-of-replica-aware-routing}

### 副本感知路由不保证隔离 {#replica-aware-routing-does-not-guarantee-isolation}

任何对服务的中断，例如服务器 Pod 重启（由于版本升级、崩溃、垂直扩展等任何原因）、服务器扩展/收缩，都会导致路由哈希环的中断。这将导致相同主机名的连接落在不同的服务器 Pod 上。

### 副本感知路由在使用私有链接时无法开箱即用 {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

客户需要手动添加 DNS 条目，以使新主机名模式的名称解析正常工作。如果客户使用不当，可能会导致服务器负载不平衡。

## 配置副本感知路由 {#configuring-replica-aware-routing}

要启用副本感知路由，请联系 [我们的支持团队](https://clickhouse.com/support)。
