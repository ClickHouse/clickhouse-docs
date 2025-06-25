---
'sidebar_label': '架构'
'slug': '/cloud/reference/architecture'
'title': 'ClickHouse Cloud 架构'
'description': '本页面描述了 ClickHouse Cloud 的架构'
---

import Architecture from '@site/static/images/cloud/reference/architecture.svg';


# ClickHouse Cloud 架构

<Architecture alt='ClickHouse Cloud architecture' class='image' />

## 由对象存储支持的存储 {#storage-backed-by-object-store}
- 几乎无限的存储
- 无需手动共享数据
- 存储数据的成本显著降低，尤其是对不常访问的数据

## 计算 {#compute}
- 自动扩展和闲置：无需提前规划规模，也无需为峰值使用过度配置
- 自动闲置和恢复：在无人使用时无需持续运行未使用的计算资源
- 默认安全和高可用性

## 管理 {#administration}
- 设置、监控、备份和计费均由系统为您执行。
- 默认启用成本控制，您可以通过云控制台进行调整。

## 服务隔离 {#service-isolation}

### 网络隔离 {#network-isolation}

所有服务在网络层面上都是隔离的。

### 计算隔离 {#compute-isolation}

所有服务部署在各自的Kubernetes空间中的独立Pod中，并具有网络级隔离。

### 存储隔离 {#storage-isolation}

所有服务使用共享存储桶（AWS、GCP）或存储容器（Azure）中的独立子路径。

对于AWS，通过AWS IAM控制存储访问，并且每个IAM角色在每个服务中都是唯一的。对于企业服务，可以启用[CMEK](/cloud/security/cmek)以提供静态数据的高级隔离。目前CMEK仅支持AWS服务。

对于GCP和Azure，服务具有对象存储隔离（所有服务都有自己的存储桶或存储容器）。

## 计算-计算分离 {#compute-compute-separation}
[计算-计算分离](/cloud/reference/warehouses) 允许用户创建多个计算节点组，每个组都有自己的服务URL，所有组使用相同的共享对象存储。这允许对不同用例的计算进行隔离，例如从写入中读取，它们共享相同的数据。还通过允许根据需要独立扩展计算组，提高资源利用效率。

## 并发限制 {#concurrency-limits}

在您的 ClickHouse Cloud 服务中，查询每秒（QPS）的数量没有限制。但是，每个副本的并发查询限制为 1000。QPS 最终取决于您的平均查询执行时间和服务中副本的数量。

与自管理的 ClickHouse 实例或其他数据库/数据仓库相比，ClickHouse Cloud 的一个主要优点是您可以通过[添加更多副本（横向扩展）](/manage/scaling#manual-horizontal-scaling)轻松增加并发性。
