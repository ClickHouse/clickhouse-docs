---
'sidebar_label': '架构'
'slug': '/cloud/reference/architecture'
'title': 'ClickHouse Cloud 架构'
'description': '本页面描述了 ClickHouse Cloud 的架构'
'doc_type': 'reference'
---

import Architecture from '@site/static/images/cloud/reference/architecture.svg';


# ClickHouse Cloud 架构

<Architecture alt='ClickHouse Cloud 架构' class='image' />

## 由对象存储支持的存储 {#storage-backed-by-object-store}
- 几乎无限的存储
- 无需手动共享数据
- 存储数据的成本显著降低，特别是对于访问频率较低的数据

## 计算 {#compute}
- 自动扩展和闲置：无需前期预估规模，也无需为峰值使用过度配置
- 自动闲置和恢复：在无人使用时无需保持闲置计算实例运行
- 默认安全和高可用性

## 管理 {#administration}
- 设置、监控、备份和计费由系统为您完成。
- 成本控制默认启用，您可以通过云控制台进行调整。

## 服务隔离 {#service-isolation}

### 网络隔离 {#network-isolation}

所有服务在网络层面上是隔离的。

### 计算隔离 {#compute-isolation}

所有服务在各自的 Kubernetes 空间中以独立的 Pod 部署，并具有网络级隔离。

### 存储隔离 {#storage-isolation}

所有服务使用共享桶（AWS、GCP）或存储容器（Azure）的独立子路径。

对于 AWS，存储访问通过 AWS IAM 控制，每个 IAM 角色对每个服务都是唯一的。对于企业服务，可以启用 [CMEK](/cloud/security/cmek) 以提供静态数据的高级隔离。当前 CMEK 仅支持 AWS 服务。

对于 GCP 和 Azure，服务具有对象存储隔离（所有服务都有自己的存储桶或存储容器）。

## 计算-计算分离 {#compute-compute-separation}
[计算-计算分离](/cloud/reference/warehouses) 允许用户创建多个计算节点组，每个组都有自己的服务 URL，且都使用相同的共享对象存储。这使得对不同用例的计算隔离成为可能，例如读取与写入的情况，它们共享相同的数据。这还通过允许计算组根据需要独立扩展，从而实现更高效的资源利用。

## 并发限制 {#concurrency-limits}

您在 ClickHouse Cloud 服务中的每秒查询数（QPS）没有限制。然而，每个副本的并发查询数量有限制为 1000。QPS 最终取决于您的平均查询执行时间和服务中的副本数量。

与自管理的 ClickHouse 实例或其他数据库/数据仓库相比，ClickHouse Cloud 的一个主要好处是您可以通过 [添加更多副本（水平扩展）](/manage/scaling#manual-horizontal-scaling) 来轻松增加并发。
