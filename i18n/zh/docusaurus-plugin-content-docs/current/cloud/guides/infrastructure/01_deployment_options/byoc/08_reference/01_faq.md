---
title: 'BYOC 常见问题解答'
slug: /cloud/reference/byoc/reference/faq
sidebar_label: '常见问题解答'
keywords: ['BYOC', '云', '自带云', '常见问题解答']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

## 常见问题解答 \{#faq\}

### 计算 \{#compute\}

<details>
<summary>我可以在这个 EKS 集群中创建多个服务吗？</summary>

可以。对于每个 AWS 账户与区域的组合，基础设施只需要部署一次。

</details>

<details>
<summary>BYOC 支持哪些区域？</summary>

BYOC 支持的[区域](/cloud/reference/supported-regions#aws-regions )与 ClickHouse Cloud 相同。

</details>

<details>
<summary>会有一些资源开销吗？运行除 ClickHouse 实例之外的服务需要哪些资源？</summary>

除了 ClickHouse 实例（ClickHouse 服务器和 ClickHouse Keeper）之外，我们还运行诸如 `clickhouse-operator`、`aws-cluster-autoscaler`、Istio 等服务，以及我们的监控栈。

目前，我们在一个专用节点组中使用三个 m5.xlarge 节点（每个可用区一个）来运行这些工作负载。

</details>

### 网络和安全 \{#network-and-security\}

<details>
<summary>在安装过程中创建的权限，在安装完成后我们可以撤销吗？</summary>

目前不支持。

</details>

<details>
<summary>你们是否考虑过未来增加一些安全控制措施，以便 ClickHouse 工程师在排障时访问客户基础设施？</summary>

是的。我们已在路线图中规划了一种由客户控制的机制，用于让客户批准工程师对集群的访问。目前，工程师必须通过我们的内部升级流程来获取集群的即时访问权限。该访问会由我们的安全团队进行记录和审计。

</details>

<details>
<summary>创建的 VPC IP 范围有多大？</summary>

默认情况下，我们对 BYOC VPC 使用 `10.0.0.0/16`。我们建议至少预留 /22 以便未来可能的扩缩容，
但如果你希望限制网段大小，并且服务器 Pod（容器组）数量很可能会限制在 30 个以内，
也可以使用 /23。

</details>

<details>
<summary>我可以自行决定维护频率吗？</summary>

请联系支持团队来安排维护窗口。通常至少会有每周一次的更新计划。

</details>

<details>
<summary>BYOC VPC 和 S3 之间的存储通信是如何工作的？</summary>

你的客户 BYOC VPC 与 S3 之间的流量，通过 AWS S3 API 使用 HTTPS（端口 443）传输表数据、备份和日志。使用 S3 VPC 终端节点时，这些流量会保持在 AWS 网络内部，不会经过公共互联网。

</details>

<details>
<summary>内部 ClickHouse 集群通信使用哪些端口？</summary>

客户 BYOC VPC 内部的 ClickHouse 集群通信使用：
- 端口 9000 上的 ClickHouse 原生协议
- 端口 8123/8443 上的 HTTP/HTTPS
- 端口 9009 上用于复制和分布式查询的服务器间通信

</details>

### 正常运行时间 SLA \{#uptime-sla\}

<details>
<summary>ClickHouse 是否为 BYOC 提供正常运行时间 SLA？</summary>

不提供。由于数据平面托管在客户的 Cloud 环境中，服务可用性取决于 ClickHouse 无法控制的资源。因此，ClickHouse 不为 BYOC 部署提供正式的正常运行时间 SLA。如有其他问题，请联系 support@clickhouse.com。

</details>