---
sidebar_label: '架构'
slug: /cloud/reference/architecture
title: 'ClickHouse Cloud 架构'
description: '本文介绍 ClickHouse Cloud 的架构'
keywords: ['ClickHouse Cloud', 'cloud architecture', 'separation of storage and compute']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import Architecture from '@site/static/images/cloud/reference/architecture.png';


# ClickHouse Cloud 架构

<Image img={Architecture} size='lg' alt="Cloud 架构"/>



## 对象存储支持的存储 {#storage-backed-by-object-store}

- 几乎无限的存储容量
- 无需手动共享数据
- 数据存储成本显著降低,尤其是对于访问频率较低的数据


## 计算 {#compute}

- 自动扩缩容与闲置：无需预先规划容量，无需为峰值使用过度配置
- 自动闲置与恢复：无需在无人使用时保持计算资源运行
- 默认安全且高可用


## 管理 {#administration}

- 设置、监控、备份和账单管理均由我们为您完成。
- 成本控制功能默认启用，您可以通过 Cloud 控制台自行调整。


## 服务隔离 {#service-isolation}

### 网络隔离 {#network-isolation}

所有服务在网络层实现隔离。

### 计算隔离 {#compute-isolation}

所有服务部署在各自 Kubernetes 命名空间的独立 Pod 中,实现网络级隔离。

### 存储隔离 {#storage-isolation}

所有服务使用共享存储桶(AWS、GCP)或存储容器(Azure)中的独立子路径。

对于 AWS,存储访问通过 AWS IAM 进行控制,每个服务拥有唯一的 IAM 角色。对于企业版服务,可以启用 [CMEK](/cloud/security/cmek) 以提供高级静态数据隔离。CMEK 目前仅支持 AWS 服务。

对于 GCP 和 Azure,服务具有对象存储隔离(所有服务拥有各自的存储桶或存储容器)。


## 计算-计算分离 {#compute-compute-separation}

[计算-计算分离](/cloud/reference/warehouses)允许用户创建多个计算节点组,每个节点组都有自己的服务 URL,但都使用相同的共享对象存储。这实现了不同使用场景的计算隔离,例如将读操作与写操作分离,同时共享相同的数据。它还支持根据需要独立扩展各计算组,从而提高资源利用效率。


## 并发限制 {#concurrency-limits}

ClickHouse Cloud 服务对每秒查询数(QPS)没有限制。但是,每个副本的并发查询数限制为 1000。QPS 最终取决于平均查询执行时间和服务中的副本数量。

与自管理的 ClickHouse 实例或其他数据库/数据仓库相比,ClickHouse Cloud 的一个主要优势是可以通过[添加更多副本(水平扩展)](/manage/scaling#manual-horizontal-scaling)轻松提高并发能力。
