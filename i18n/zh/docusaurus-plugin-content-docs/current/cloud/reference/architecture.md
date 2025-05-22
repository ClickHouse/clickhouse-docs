---
'sidebar_label': '架构'
'slug': '/cloud/reference/architecture'
'title': 'ClickHouse 云架构'
'description': '此页面描述了 ClickHouse 云的架构'
---

import Architecture from '@site/static/images/cloud/reference/architecture.svg';

# ClickHouse Cloud 架构

<Architecture alt='ClickHouse Cloud architecture' class='image' />

## 基于对象存储的存储 {#storage-backed-by-object-store}
- 几乎无限的存储
- 无需手动分享数据
- 存储数据的价格显著降低，尤其是对于访问较少的数据

## 计算 {#compute}
- 自动扩展和闲置：无需提前确定大小，也无需为高峰使用过度配置
- 自动闲置和恢复：无需在无人使用时保持未使用的计算资源运行
- 默认情况下安全且具备高可用性

## 管理 {#administration}
- 设置、监控、备份和账单由系统为您执行。
- 默认启用成本控制，您可以通过云控制台进行调整。

## 服务隔离 {#service-isolation}

### 网络隔离 {#network-isolation}

所有服务在网络层面上是隔离的。

### 计算隔离 {#compute-isolation}

所有服务都部署在各自的Kubernetes空间中的独立Pods中，并进行网络级隔离。

### 存储隔离 {#storage-isolation}

所有服务使用共享存储桶（AWS、GCP）或存储容器（Azure）的单独子路径。

对于AWS，存储访问通过AWS IAM控制，每个IAM角色对于每个服务是唯一的。对于企业服务，可以启用[CMEK](/cloud/security/cmek)以提供静态数据的高级隔离。此时CMEK仅支持AWS服务。

对于GCP和Azure，服务具有对象存储隔离（所有服务都有自己的存储桶或存储容器）。

## 计算-计算分离 {#compute-compute-separation}
[计算-计算分离](/cloud/reference/warehouses) 允许用户创建多个计算节点组，每个节点组都有自己的服务URL，且都使用相同的共享对象存储。这允许在共享相同数据的情况下，实现读取与写入等不同用例的计算隔离。还可以通过按需独立扩展计算组，实现更高效的资源利用。

## 并发限制 {#concurrency-limits}

在您的 ClickHouse Cloud 服务中，查询每秒（QPS）的数量没有限制。但是每个副本的并发查询限制为1000个。QPS最终取决于您的平均查询执行时间和服务中的副本数量。

与自管理的 ClickHouse 实例或其他数据库/数据仓库相比，ClickHouse Cloud 的一个主要优点是您可以通过[添加更多副本（水平扩展）](/manage/scaling#manual-horizontal-scaling)轻松增加并发性。
