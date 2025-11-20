---
slug: /guides/sizing-and-hardware-recommendations
sidebar_label: '容量规划与硬件推荐'
sidebar_position: 4
title: '容量规划与硬件推荐'
description: '本指南介绍我们针对开源用户在硬件、计算、内存和磁盘配置方面的一般性推荐。'
doc_type: 'guide'
keywords: ['sizing', 'hardware', 'capacity planning', 'best practices', 'performance']
---



# 规格和硬件建议

本指南介绍我们针对开源用户在硬件、计算、内存和磁盘配置方面的一般性建议。若希望简化部署，我们推荐使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它会根据工作负载自动扩缩容和调整配置，同时将与基础设施管理相关的成本降至最低。

ClickHouse 集群的配置在很大程度上取决于应用的使用场景和工作负载模式。在规划架构时，必须考虑以下因素：

- 并发量（每秒请求数）
- 吞吐量（每秒处理的行数）
- 数据量
- 数据保留策略
- 硬件成本
- 运维成本



## 磁盘 {#disk}

在 ClickHouse 中应使用的磁盘类型取决于数据量、延迟或吞吐量需求。

### 性能优化 {#optimizing-for-performance}

为了实现最佳性能,我们建议直接挂载 [AWS 预配置 IOPS SSD 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html)或您的云服务提供商提供的同等产品,这些产品针对 IO 性能进行了优化。

### 存储成本优化 {#optimizing-for-storage-costs}

为了降低成本,您可以使用[通用型 SSD EBS 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)。

您还可以使用 SSD 和 HDD 实现分层存储,采用[热/温/冷架构](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)。此外,也可以使用 [AWS S3](https://aws.amazon.com/s3/) 作为存储来实现存算分离。请参阅我们关于在开源 ClickHouse 中使用存算分离的指南[此处](/guides/separation-storage-compute)。ClickHouse Cloud 默认提供存算分离功能。


## CPU {#cpu}

### 我应该使用哪种 CPU? {#which-cpu-should-i-use}

您应该使用的 CPU 类型取决于您的使用场景。但总体而言,具有大量频繁并发查询、处理更多数据或使用计算密集型 UDF 的应用程序将需要更多 CPU 核心。

**低延迟或面向客户的应用程序**

对于延迟要求在数十毫秒级别的场景(例如面向客户的工作负载),我们推荐使用 AWS 的 EC2 [i3 系列](https://aws.amazon.com/ec2/instance-types/i3/)或 [i4i 系列](https://aws.amazon.com/ec2/instance-types/i4i/),或您的云服务提供商的等效产品,这些实例类型针对 IO 进行了优化。

**高并发应用程序**

对于需要优化并发性能的工作负载(每秒 100+ 个查询),我们推荐使用 AWS 的[计算优化型 C 系列](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)或您的云服务提供商的等效产品。

**数据仓库用例**

对于数据仓库工作负载和即席分析查询,我们推荐使用 AWS 的 [R 型系列](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)或您的云服务提供商的等效产品,因为它们针对内存进行了优化。

---

### CPU 利用率应该是多少? {#what-should-cpu-utilization-be}

ClickHouse 没有标准的 CPU 利用率目标。使用 [iostat](https://linux.die.net/man/1/iostat) 等工具来测量平均 CPU 使用率,并相应地调整服务器规模以应对意外的流量峰值。但是,对于具有即席查询的分析或数据仓库用例,您应该将目标设定为 10-20% 的 CPU 利用率。

### 我应该使用多少个 CPU 核心? {#how-many-cpu-cores-should-i-use}

您应该使用的 CPU 数量取决于您的工作负载。但是,我们通常根据您的 CPU 类型推荐以下内存与 CPU 核心比率:

- **[M 型](https://aws.amazon.com/ec2/instance-types/)(通用用例):** 4 GB:1 的内存与 CPU 核心比率
- **[R 型](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)(数据仓库用例):** 8 GB:1 的内存与 CPU 核心比率
- **[C 型](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)(计算优化用例):** 2 GB:1 的内存与 CPU 核心比率

例如,在使用 M 型 CPU 时,我们建议每 25 个 CPU 核心配置 100GB 内存。要确定适合您应用程序的内存量,需要对内存使用情况进行分析。您可以阅读[此内存问题调试指南](/guides/developer/debugging-memory-issues)或使用[内置可观测性仪表板](/operations/monitoring)来监控 ClickHouse。


## 内存 {#memory}

与 CPU 的选择类似,内存与存储的比例以及内存与 CPU 的比例取决于您的使用场景。

所需的 RAM 容量通常取决于:

- 查询的复杂度。
- 查询中处理的数据量。

但总体而言,内存越多,查询运行速度就越快。
如果您的使用场景对成本敏感,较少的内存也可以满足需求,因为可以启用相关设置([`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) 和 [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort))以允许将数据溢出到磁盘,但请注意这可能会显著影响查询性能。

### 内存与存储的比例应该是多少? {#what-should-the-memory-to-storage-ratio-be}

对于小数据量场景,1:1 的内存与存储比例是可以接受的,但总内存不应低于 8GB。

对于数据保留期较长或数据量较大的使用场景,我们建议采用 1:100 到 1:130 的内存与存储比例。例如,如果存储 10TB 数据,每个副本应配置 100GB RAM。

对于频繁访问的使用场景(例如面向客户的工作负载),我们建议使用更多内存,采用 1:30 到 1:50 的内存与存储比例。


## 副本 {#replicas}

我们建议每个分片至少配置三个副本(或在使用 [Amazon EBS](https://aws.amazon.com/ebs/) 时配置两个副本)。此外,我们建议在添加额外副本(水平扩展)之前,优先对所有副本进行垂直扩展。

ClickHouse 不会自动进行分片,重新分片数据集将需要大量计算资源。因此,我们通常建议使用可用的最大规格服务器,以避免将来需要重新分片数据。

建议考虑使用 [ClickHouse Cloud](https://clickhouse.com/cloud),它可以自动扩展,并允许您根据使用场景轻松控制副本数量。


## 大规模工作负载的配置示例 {#example-configurations-for-large-workloads}

ClickHouse 的配置高度依赖于您特定应用的需求。如果您希望我们帮助优化您的架构以实现成本和性能的最优化,请[联系销售团队](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)。

为了提供指导(而非推荐),以下是 ClickHouse 用户在生产环境中的配置示例:

### 财富 500 强 B2B SaaS 企业 {#fortune-500-b2b-saas}

<table>
  <tr>
    <td col='2'>
      <strong>
        <em>存储</em>
      </strong>
    </td>
  </tr>
  <tr>
    <td>
      <strong>每月新增数据量</strong>
    </td>
    <td>30TB</td>
  </tr>
  <tr>
    <td>
      <strong>总存储量(压缩后)</strong>
    </td>
    <td>540TB</td>
  </tr>
  <tr>
    <td>
      <strong>数据保留期</strong>
    </td>
    <td>18 个月</td>
  </tr>
  <tr>
    <td>
      <strong>每节点磁盘容量</strong>
    </td>
    <td>25TB</td>
  </tr>
  <tr>
    <td col='2'>
      <strong>
        <em>CPU</em>
      </strong>
    </td>
  </tr>
  <tr>
    <td>
      <strong>并发数</strong>
    </td>
    <td>200+ 并发查询</td>
  </tr>
  <tr>
    <td>
      <strong>副本数(包括高可用对)</strong>
    </td>
    <td>44</td>
  </tr>
  <tr>
    <td>
      <strong>每节点 vCPU 数</strong>
    </td>
    <td>62</td>
  </tr>
  <tr>
    <td>
      <strong>总 vCPU 数</strong>
    </td>
    <td>2700</td>
  </tr>
  <tr>
    <td col='2'>
      <strong>
        <em>内存</em>
      </strong>
    </td>
  </tr>
  <tr>
    <td>
      <strong>总内存</strong>
    </td>
    <td>11TB</td>
  </tr>
  <tr>
    <td>
      <strong>每副本内存</strong>
    </td>
    <td>256GB</td>
  </tr>
  <tr>
    <td>
      <strong>内存与 vCPU 比率</strong>
    </td>
    <td>4 GB:1</td>
  </tr>
  <tr>
    <td>
      <strong>内存与磁盘比率</strong>
    </td>
    <td>1:50</td>
  </tr>
</table>

### 财富 500 强电信运营商日志记录用例 {#fortune-500-telecom-operator-for-a-logging-use-case}


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
        <td><strong>每个节点的磁盘容量</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>副本数量（包含 HA 对）</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>每个节点的 vCPU 数</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>总 vCPU 数</strong></td>
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
        <td><strong>每个副本的 RAM 容量</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM 与 vCPU 比例</strong></td>
        <td>6 GB:1</td>
    </tr>
    <tr>
        <td><strong>RAM 与磁盘比例</strong></td>
        <td>1:60</td>
    </tr>
</table>



## 延伸阅读 {#further-reading}

以下是使用开源 ClickHouse 的公司发布的架构相关博客文章:

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
