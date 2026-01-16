---
title: '在 AWS 上的 BYOC 常见问题解答'
slug: /cloud/reference/byoc/faq/aws
sidebar_label: 'AWS'
keywords: ['BYOC', '云', '自带云（Bring Your Own Cloud）', 'AWS']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---



## 常见问题解答 \\{#faq\\}

### 计算 \\{#compute\\}

<details>
<summary>我可以在同一个 EKS 集群中创建多个服务吗？</summary>

可以。对于每个 AWS 账户与区域的组合，只需要部署一次基础设施。

</details>

<details>
<summary>BYOC 支持哪些区域？</summary>

BYOC 支持与 ClickHouse Cloud 相同的一组[区域](/cloud/reference/supported-regions#aws-regions)。

</details>

<details>
<summary>是否会有一些资源开销？除了 ClickHouse 实例之外，运行其他服务需要哪些资源？</summary>

除了 ClickHouse 实例（ClickHouse 服务器和 ClickHouse Keeper）之外，我们还运行 `clickhouse-operator`、`aws-cluster-autoscaler`、Istio 等服务以及我们的监控栈。

目前，我们在一个专用节点组中使用三个 m5.xlarge 节点（每个可用区一个）来运行这些工作负载。

</details>

### 网络和安全 \\{#network-and-security\\}

<details>
<summary>在安装完成后，我们可以撤销安装过程中设置的权限吗？</summary>

目前不支持。

</details>

<details>
<summary>你们是否考虑过未来提供一些安全控制，让 ClickHouse 工程师能够为排障访问客户基础设施？</summary>

考虑过。我们计划实现一种由客户控制的机制，让客户可以审批工程师对集群的访问。目前，工程师必须通过我们的内部升级流程来获取对集群的即时访问权限。该过程会由我们的安全团队记录并审计。

</details>

<details>
<summary>创建的 VPC IP 段大小是多少？</summary>

默认情况下，我们对 BYOC VPC 使用 `10.0.0.0/16`。我们建议至少预留 /22 网段以便未来可能的扩容，
但如果你希望限制大小，在服务器 Pod（容器组）很可能限制在 30 个以内的情况下，也可以使用 /23。

</details>

<details>
<summary>我可以自行决定维护频率吗？</summary>

请联系支持团队来安排维护时间窗。至少应预期为每周一次的更新计划。

</details>

### 正常运行时间 SLA \\{#uptime-sla\\}

<details>
<summary>ClickHouse 是否为 BYOC 提供正常运行时间 SLA？</summary>

不提供，因为数据平面托管在客户的云环境中，服务可用性依赖于 ClickHouse 无法控制的资源。因此，ClickHouse 不为 BYOC 部署提供正式的正常运行时间 SLA。如果你有其他问题，请联系 support@clickhouse.com。

</details>