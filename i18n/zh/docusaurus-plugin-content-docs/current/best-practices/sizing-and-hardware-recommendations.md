---
'slug': '/guides/sizing-and-hardware-recommendations'
'sidebar_label': 'Sizing and Hardware Recommendations'
'sidebar_position': 4
'title': 'Sizing and Hardware Recommendations'
'description': 'This guide discusses our general recommendations regarding hardware,
  compute, memory, and disk configurations for open-source users.'
---




# 硬件和规格建议

本指南讨论了我们关于硬件、计算、内存和磁盘配置的一般建议，适用于开源用户。如果您想简化您的设置，我们建议使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，因为它可以自动扩展和适应您的工作负载，同时将基础设施管理相关的成本降至最低。

ClickHouse 集群的配置高度依赖于您的应用程序用例和工作负载模式。当规划您的架构时，您必须考虑以下因素：

- 并发性（每秒请求数）
- 吞吐量（每秒处理的行数）
- 数据量
- 数据保留策略
- 硬件成本
- 维护成本

## 磁盘 {#disk}

您应该在 ClickHouse 中使用的磁盘类型取决于数据量、延迟或吞吐量要求。

### 性能优化 {#optimizing-for-performance}

为了最大化性能，我们建议直接使用 [AWS 的预 provisioned IOPS SSD 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) 或您云服务提供商的等效产品，这些产品优化了 I/O。

### 存储成本优化 {#optimizing-for-storage-costs}

为了降低成本，您可以使用 [通用 SSD EBS 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)。

您还可以在 [热/温/冷架构](/guides/developer/ttl#implementing-a-hotwarmcold-architecture)中使用 SSD 和 HDD 实现分层存储。或者，可以使用 [AWS S3](https://aws.amazon.com/s3/) 来分离计算和存储。有关使用开源 ClickHouse 进行计算和存储分离的指南，请 [查看这里](/guides/separation-storage-compute)。在 ClickHouse Cloud 中，计算和存储的分离是默认可用的。

## CPU {#cpu}

### 我应该使用哪种 CPU？ {#which-cpu-should-i-use}

您应该使用的 CPU 类型取决于您的使用模式。然而，通常情况下，具有许多频繁并发查询的应用程序、处理更多数据的应用程序，或使用计算密集型 UDF 的应用程序将需要更多的 CPU 核心。

**低延迟或面向客户的应用程序**

对于延迟要求在 10 毫秒级别的面向客户的工作负载，我们建议使用 AWS 的 EC2 [i3 系列](https://aws.amazon.com/ec2/instance-types/i3/) 或 [i4i 系列](https://aws.amazon.com/ec2/instance-types/i4i/)，或您云服务提供商的等效产品，这些产品经过 I/O 优化。

**高并发应用程序**

对于需要优化并发（每秒 100 次以上查询）的工作负载，我们推荐 AWS 的 [计算优化 C 系列](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) 或您云服务提供商的等效产品。

**数据仓库用例**

对于数据仓库工作负载和临时分析查询，我们建议使用 AWS 的 [R 型系列](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) 或您云服务提供商的等效产品，因为它们经过内存优化。

---

### CPU 利用率应该是多少？ {#what-should-cpu-utilization-be}

ClickHouse 没有标准的 CPU 利用率目标。使用工具例如 [iostat](https://linux.die.net/man/1/iostat) 来测量平均 CPU 使用率，并据此调整服务器的大小，以管理意外的流量高峰。然而，对于具有临时查询的分析或数据仓库用例，您应该目标设置为 10-20% 的 CPU 利用率。

### 我应该使用多少个 CPU 核心？ {#how-many-cpu-cores-should-i-use}

您应该使用的 CPU 数量取决于您的工作负载。然而，我们通常推荐根据您的 CPU 类型以下列出内存与 CPU 核心的比例：

- **[M 型](https://aws.amazon.com/ec2/instance-types/)（通用用例）：** 内存与 CPU 核心比例为 4:1
- **[R 型](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（数据仓库用例）：** 内存与 CPU 核心比例为 8:1
- **[C 型](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（计算优化用例）：** 内存与 CPU 核心比例为 2:1

例如，在使用 M 型 CPU 时，我们建议每 25 个 CPU 核心提供 100GB 的内存。为了确定适合您应用程序的内存量，您需要对内存使用情况进行分析。您可以阅读 [这篇关于调试内存问题的指南](/guides/developer/debugging-memory-issues) 或使用 [内置的可观察性仪表板](/operations/monitoring) 来监控 ClickHouse。

## 内存 {#memory}

与您选择的 CPU 一样，内存与存储的比例及内存与 CPU 的比例取决于您的用例。

所需的 RAM 量通常取决于：
- 查询的复杂性。
- 在查询中处理的数据量。

然而，通常而言，内存越多，查询运行得越快。
如果您的用例对价格敏感，可以使用较少的内存，因为可以启用设置（[`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) 和 [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)）以允许数据溢出到磁盘，但请注意，这可能会显著影响查询性能。

### 内存与存储的比例应该是多少？ {#what-should-the-memory-to-storage-ratio-be}

对于低数据量，1:1 的内存与存储比例是可以接受的，但总内存不应少于 8GB。

对于数据保留期限较长或数据量较大的用例，我们建议1:100 到 1:130 的内存与存储比例。例如，如果您存储 10TB 的数据，则每个副本提供 100GB 的 RAM。

对于频繁访问的用例，例如面向客户的工作负载，我们建议使用 1:30 到 1:50 的内存与存储比例。

## 副本 {#replicas}

我们建议每个分片至少有三个副本（或两个副本与 [Amazon EBS](https://aws.amazon.com/ebs/)）。此外，我们建议在添加额外副本（水平扩展）之前，首先对所有副本进行垂直扩展。

ClickHouse 不会自动分片，重新分片您的数据集将需要大量计算资源。因此，我们通常建议使用可用的最大服务器，以防未来需要重新分片您的数据。

考虑使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它会自动扩展，并允许您轻松控制副本的数量以满足您的用例。

## 大型工作负载的示例配置 {#example-configurations-for-large-workloads}

ClickHouse 的配置高度依赖于您特定应用程序的需求。如果您希望我们帮助您优化成本和性能的架构，请 [联系销售](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)。

为了提供指导（而不是建议），以下是一些在生产环境中使用 ClickHouse 用户的示例配置：

### 财富 500 强 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>存储</em></strong></td>
    </tr>
    <tr>
        <td><strong>每月新增数据量</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>总存储（压缩后）</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>数据保留</strong></td>
        <td>18 个月</td>
    </tr>
    <tr>
        <td><strong>每个节点的磁盘</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>并发性</strong></td>
        <td>200+ 并发查询</td>
    </tr>
    <tr>
        <td><strong>副本数量（包括 HA 对）</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>每个节点的 vCPU</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>总 vCPU</strong></td>
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
        <td>4:1</td>
    </tr>
    <tr>
        <td><strong>RAM 与磁盘比率</strong></td>
        <td>1:50</td>
    </tr>
</table>

### 财富 500 强电信运营商的日志用例 {#fortune-500-telecom-operator-for-a-logging-use-case}

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
        <td><strong>数据保留</strong></td>
        <td>30 天</td>
    </tr>
    <tr>
        <td><strong>每个节点的磁盘</strong></td>
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
        <td><strong>每个节点的 vCPU</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>总 vCPU</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>内存</em></strong></td>
    </tr>
    <tr>
        <td><strong>总 RAM</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>每个副本的 RAM</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM 与 vCPU 比率</strong></td>
        <td>6:1</td>
    </tr>
    <tr>
        <td><strong>RAM 与磁盘比率</strong></td>
        <td>1:60</td>
    </tr>
</table>

## 进一步阅读 {#further-reading}

以下是一些使用开源 ClickHouse 的公司的架构领域发布的博客文章：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
