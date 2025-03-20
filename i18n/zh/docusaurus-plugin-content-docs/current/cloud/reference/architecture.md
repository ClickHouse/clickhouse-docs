---
sidebar_label: 架构
slug: /cloud/reference/architecture
---

import Architecture from '@site/static/images/cloud/reference/architecture.svg';


# ClickHouse Cloud 架构

<Architecture alt='ClickHouse Cloud 架构' class='image' />

## 基于对象存储的存储 {#storage-backed-by-object-store}
- 实际上无限的存储
- 无需手动共享数据
- 存储数据的价格显著降低，特别是对于访问频率较低的数据

## 计算 {#compute}
- 自动扩展和闲置：无需提前规定大小，也无需过度配置以应对高峰使用
- 自动闲置和恢复：当无人使用时，无需让未使用的计算资源运行
- 默认情况下安全且具有高可用性

## 管理 {#administration}
- 设置、监控、备份和计费均由系统为您执行。
- 成本控制默认启用，您可以通过云控制台进行调整。

## 服务隔离 {#service-isolation}

### 网络隔离 {#network-isolation}

所有服务在网络层面上都是隔离的。

### 计算隔离 {#compute-isolation}

所有服务在各自的 Kubernetes 空间中以独立的 Pod 部署，具有网络级别的隔离。

### 存储隔离 {#storage-isolation}

所有服务使用共享存储桶 (AWS, GCP) 或存储容器 (Azure) 的独立子路径。

对于 AWS，存储访问通过 AWS IAM 控制，并且每个 IAM 角色在每个服务中是唯一的。对于企业服务，可以启用 [CMEK](/cloud/security/cmek) 以提供静态数据的高级隔离。目前，CMEK 仅支持 AWS 服务。

对于 GCP 和 Azure，服务具有对象存储隔离（所有服务都有自己的存储桶或存储容器）。

## 计算-计算分离 {#compute-compute-separation}
[计算-计算分离](/cloud/reference/warehouses) 允许用户创建多个计算节点组，每个组都有自己的服务 URL，且均使用相同的共享对象存储。这允许在共享相同数据的情况下，对不同用例（比如读写）进行计算隔离。它还实现了更高效的资源利用，因为可根据需要独立扩展计算组。

## 并发限制 {#concurrency-limits}

在您的 ClickHouse Cloud 服务中，没有每秒查询次数 (QPS) 的限制。然而，每个副本的并发查询数量限制为 1000。QPS 最终取决于您的平均查询执行时间和服务中的副本数量。

与自管理的 ClickHouse 实例或其他数据库/数据仓库相比，ClickHouse Cloud 的一个主要优势是您可以通过 [添加更多副本（水平扩展）](/manage/scaling#manual-horizontal-scaling) 来轻松增加并发性。
