---
title: 'AWS 上 BYOC 常见问题解答'
slug: /cloud/reference/byoc/faq/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: '在您自有的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---



## 常见问题 {#faq}

### 计算资源 {#compute}

<details>
<summary>我可以在单个 EKS 集群中创建多个服务吗?</summary>

可以。对于每个 AWS 账户和区域组合,基础设施只需配置一次。

</details>

<details>
<summary>BYOC 支持哪些区域?</summary>

BYOC 支持与 ClickHouse Cloud 相同的[区域](/cloud/reference/supported-regions#aws-regions)。

</details>

<details>
<summary>会产生资源开销吗?除了 ClickHouse 实例之外,运行服务还需要哪些资源?</summary>

除了 ClickHouse 实例(ClickHouse 服务器和 ClickHouse Keeper)之外,我们还运行 `clickhouse-operator`、`aws-cluster-autoscaler`、Istio 等服务以及监控堆栈。

目前,我们在专用节点组中配置了三个 m5.xlarge 节点(每个可用区一个)来运行这些工作负载。

</details>

### 网络与安全 {#network-and-security}

<details>
<summary>安装完成后,我们可以撤销安装期间设置的权限吗?</summary>

目前暂不支持。

</details>

<details>
<summary>你们是否考虑过未来的安全控制措施,以便 ClickHouse 工程师访问客户基础设施进行故障排查?</summary>

是的。我们的路线图中包含实施由客户控制的机制,允许客户批准工程师访问集群。目前,工程师必须通过内部审批流程才能获得对集群的即时访问权限。所有访问都会被记录并由安全团队审计。

</details>

<details>
<summary>创建的 VPC IP 地址范围大小是多少?</summary>

默认情况下,我们为 BYOC VPC 使用 `10.0.0.0/16`。我们建议至少预留 /22 以应对未来可能的扩展需求,但如果您希望限制大小,且预计服务器 pod 数量不超过 30 个,则可以使用 /23。

</details>

<details>
<summary>我可以自定义维护频率吗?</summary>

请联系技术支持安排维护时间窗口。请注意,更新计划至少为每周一次。

</details>

### 正常运行时间 SLA {#uptime-sla}

<details>
<summary>ClickHouse 是否为 BYOC 提供正常运行时间 SLA?</summary>

不提供。由于数据平面托管在客户的云环境中,服务可用性取决于 ClickHouse 无法控制的资源。因此,ClickHouse 不为 BYOC 部署提供正式的正常运行时间 SLA。如有其他问题,请联系 support@clickhouse.com。

</details>
