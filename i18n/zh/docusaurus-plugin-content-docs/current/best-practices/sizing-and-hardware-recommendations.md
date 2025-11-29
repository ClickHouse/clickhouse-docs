---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: '容量规划与硬件建议'
sidebar_position: 4
title: '容量规划与硬件建议'
description: '本指南讨论我们面向开源用户在硬件、计算、内存以及磁盘配置方面的一般性建议。'
doc_type: 'guide'
keywords: ['容量规划', '硬件', '规格评估', '最佳实践', '性能']
---



# 容量规划与硬件建议 {#sizing-and-hardware-recommendations}

本指南介绍我们针对开源用户在硬件、计算资源、内存和磁盘配置方面的一般性建议。如果您希望简化部署，我们推荐使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，因为它能够根据您的工作负载自动扩缩并自适应调整，同时将与基础设施管理相关的成本降到最低。

您的 ClickHouse 集群配置在很大程度上取决于应用的使用场景和工作负载模式。在规划架构时，必须考虑以下因素：

- 并发量（每秒请求数）
- 吞吐量（每秒处理的行数）
- 数据量
- 数据保留策略
- 硬件成本
- 维护成本



## 磁盘 {#disk}

在 ClickHouse 中应使用哪种类型的磁盘，取决于数据量以及对延迟或吞吐量的要求。

### 面向性能优化 {#optimizing-for-performance}

为获得最佳性能，建议直接挂载 [AWS 的预置 IOPS SSD 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html)，或使用云服务商提供的同类产品，以优化 IO 性能。

### 面向存储成本优化 {#optimizing-for-storage-costs}

为降低成本，可以使用[通用型 SSD EBS 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)。

还可以结合使用 SSD 和 HDD，构建[冷热分层（热/暖/冷）架构](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)。另一种选择是使用 [AWS S3](https://aws.amazon.com/s3/) 作为存储后端，以实现计算与存储分离。请参阅我们关于在开源 ClickHouse 中实现计算与存储分离的指南[此处](/guides/separation-storage-compute)。在 ClickHouse Cloud 中，计算与存储分离功能默认已提供。



## CPU {#cpu}

### 我应该使用哪种 CPU？ {#which-cpu-should-i-use}

你应该选择的 CPU 类型取决于负载特征。一般来说，具有大量频繁并发查询、处理数据量较大，或使用计算密集型 UDF 的应用需要更多 CPU 核心。

**低延迟或面向客户的应用**

对于延迟要求在几十毫秒级（例如面向客户的工作负载），我们推荐使用 AWS 的 EC2 [i3 系列](https://aws.amazon.com/ec2/instance-types/i3/)或 [i4i 系列](https://aws.amazon.com/ec2/instance-types/i4i/)，或者云服务商中等价的、已针对 IO 优化的实例。

**高并发应用**

对于需要重点优化并发（每秒 100+ 查询）的工作负载，我们推荐使用 AWS 的[计算优化型 C 系列](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)，或云服务商中等价的产品。

**数据仓库用例**

对于数据仓库工作负载和临时分析查询，我们推荐使用 AWS 的 [R 系列](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)或云服务商中等价的产品，因为它们是内存优化型实例。

---

### CPU 利用率应该是多少？ {#what-should-cpu-utilization-be}

ClickHouse 并没有统一的 CPU 利用率目标。请使用 [iostat](https://linux.die.net/man/1/iostat) 之类的工具衡量平均 CPU 使用率，并相应调整服务器规格，以应对突发流量高峰。不过，对于带有临时查询的分析型或数据仓库用例，你应将 CPU 利用率目标设定在 10–20%。

### 我应该使用多少 CPU 核心？ {#how-many-cpu-cores-should-i-use}

你应该使用的 CPU 核心数量取决于工作负载。不过，我们一般基于 CPU 类型推荐如下内存与 CPU 核心配比：

- **[M 型](https://aws.amazon.com/ec2/instance-types/)（通用场景）：** 4 GB:1 的内存与 CPU 核心比例
- **[R 型](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（数据仓库场景）：** 8 GB:1 的内存与 CPU 核心比例
- **[C 型](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（计算优化场景）：** 2 GB:1 的内存与 CPU 核心比例

例如，在使用 M 型 CPU 时，我们建议每 25 个 CPU 核心预留 100 GB 内存。要确定适合你的应用的内存大小，需要对内存使用情况进行分析。你可以阅读[这篇关于调试内存问题的指南](/guides/developer/debugging-memory-issues)，或使用[内置可观测性仪表板](/operations/monitoring)来监控 ClickHouse。



## 内存 {#memory}

与 CPU 的选择类似，内存与存储的比例以及内存与 CPU 的比例应根据具体用例来确定。

所需的 RAM 容量通常取决于：
- 查询的复杂度；
- 查询中需要处理的数据量。

总体而言，内存越大，查询运行得越快。  
如果用例对成本较为敏感，可以使用较小的内存配置，因为可以启用相关设置（[`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) 和 [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)）将部分数据落盘，但需要注意，这可能会显著影响查询性能。

### 内存与存储的比例应是多少？ {#what-should-the-memory-to-storage-ratio-be}

对于数据量较小的场景，1:1 的内存与存储比例是可以接受的，但总内存不应低于 8GB。

对于数据保留周期较长或数据量较大的用例，我们建议采用 1:100 到 1:130 的内存与存储比例。例如，如果存储了 10TB 的数据，建议每个副本配置 100GB 的 RAM。

对于访问频繁的用例，例如面向客户的在线工作负载，我们建议使用更多内存，采用 1:30 到 1:50 的内存与存储比例。



## 副本 {#replicas}

我们建议每个分片至少配置三个副本（或在使用 [Amazon EBS](https://aws.amazon.com/ebs/) 时配置两个副本）。此外，我们建议在增加额外副本（水平扩展）之前，先对所有副本进行纵向扩容。

ClickHouse 不会自动分片，对数据集重新分片将需要大量计算资源。因此，我们通常建议尽可能使用规格更大的服务器，以避免将来需要对数据重新分片。

可以考虑使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它可以自动伸缩，并允许根据具体用例轻松控制副本数量。



## 大规模工作负载示例配置 {#example-configurations-for-large-workloads}

ClickHouse 的配置高度取决于具体应用程序的需求。如果您希望我们协助在成本和性能方面优化架构，请[联系销售](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)。

为提供指导（非正式建议），下面是部分 ClickHouse 生产用户的示例配置：

### Fortune 500 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>存储</em></strong></td>
    </tr>
    <tr>
        <td><strong>每月新增数据量</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>总存储量（压缩后）</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>数据保留期</strong></td>
        <td>18 个月</td>
    </tr>
    <tr>
        <td><strong>每个节点的磁盘容量</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>并发度</strong></td>
        <td>200+ 个并发查询</td>
    </tr>
    <tr>
        <td><strong>副本数量（包括 HA 对）</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>每个节点的 vCPU 数</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>总 vCPU 数</strong></td>
        <td>2700</td>
    </tr>
    <tr>
        <td col="2"><strong><em>内存</em></strong></td>
    </tr>
    <tr>
        <td><strong>总 RAM</strong></td>
        <td>11TB</td>
    </tr>
    <tr>
        <td><strong>每个副本的 RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM 与 vCPU 比例</strong></td>
        <td>4 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM 与磁盘比例</strong></td>
        <td>1:50</td>
    </tr>
</table>

### Fortune 500 电信运营商（日志用例）{#fortune-500-telecom-operator-for-a-logging-use-case}



<table>
    <tr>
        <td col="2"><strong><em>存储</em></strong></td>
    </tr>
    <tr>
        <td><strong>每月日志数据量</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>总存储（压缩后）</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>数据保留期</strong></td>
        <td>30 天</td>
    </tr>
    <tr>
        <td><strong>每个节点磁盘容量</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>副本数量（包括 HA 对）</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>每个节点 vCPU 数量</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>总 vCPU 数量</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>内存</em></strong></td>
    </tr>
    <tr>
        <td><strong>总 RAM 容量</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>每个副本的 RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM 与 vCPU 比率</strong></td>
        <td>6 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM 与磁盘比率</strong></td>
        <td>1:60</td>
    </tr>
</table>



## 延伸阅读 {#further-reading}

以下是一些公司基于开源 ClickHouse 的架构实践相关博客文章：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
