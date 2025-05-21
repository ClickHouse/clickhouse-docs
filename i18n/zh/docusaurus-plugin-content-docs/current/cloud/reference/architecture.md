---
'sidebar_label': '架构'
'slug': '/cloud/reference/architecture'
'title': 'ClickHouse云架构'
'description': '本页面描述了ClickHouse云的架构'
---

import Architecture from '@site/static/images/cloud/reference/architecture.svg';


# ClickHouse Cloud 架构

<Architecture alt='ClickHouse Cloud architecture' class='image' />

## 由对象存储支持的存储 {#storage-backed-by-object-store}
- 几乎无限制的存储
- 不需要手动共享数据
- 存储数据的价格显著降低，特别是对于访问频率较低的数据

## 计算 {#compute}
- 自动扩展和闲置：不需要提前确定规模，也不需要为峰值使用过度预留
- 自动闲置和恢复：在无人使用时不需要运行未使用的计算
- 默认情况下安全且高可用

## 管理 {#administration}
- 设置、监控、备份和计费均由系统为您执行。
- 成本控制默认启用，可以通过云控制台调整。

## 服务隔离 {#service-isolation}

### 网络隔离 {#network-isolation}

所有服务在网络层面上都是隔离的。

### 计算隔离 {#compute-isolation}

所有服务在各自的 Kubernetes 空间中以独立的 Pod 进行部署，并具有网络级隔离。

### 存储隔离 {#storage-isolation}

所有服务使用共享存储桶（AWS, GCP）或存储容器（Azure）的独立子路径。

对于 AWS，存储访问通过 AWS IAM 控制，每个 IAM 角色对每个服务都是唯一的。对于企业服务，可以启用 [CMEK](/cloud/security/cmek)，以在静态数据中提供高级数据隔离。目前，CMEK 仅支持 AWS 服务。

对于 GCP 和 Azure，服务具有对象存储隔离（所有服务都有自己的存储桶或存储容器）。

## 计算-计算分离 {#compute-compute-separation}
[计算-计算分离](/cloud/reference/warehouses) 允许用户创建多个计算节点组，每个节点组都有自己的服务 URL，并且都使用相同的共享对象存储。这使得可以对不同使用场景（例如读取与写入）进行计算隔离，同时共享相同的数据。它还通过允许根据需要独立扩展计算组，来提高资源利用效率。

## 并发限制 {#concurrency-limits}

在您的 ClickHouse Cloud 服务中，每秒查询次数（QPS）没有限制。然而，每个副本的并发查询限制为 1000。QPS 最终取决于您平均查询执行时间和服务中的副本数量。

与自管理的 ClickHouse 实例或其他数据库/数据仓库相比，ClickHouse Cloud 的一个主要好处是您可以通过 [添加更多副本（水平扩展）](/manage/scaling#manual-horizontal-scaling) 来轻松增加并发性。
