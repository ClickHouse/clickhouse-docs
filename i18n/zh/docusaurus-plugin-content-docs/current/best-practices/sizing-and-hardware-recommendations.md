---
'slug': '/guides/sizing-and-hardware-recommendations'
'sidebar_label': '硬件和尺寸推荐'
'sidebar_position': 4
'title': '硬件和尺寸推荐'
'description': '本指南讨论了我们关于硬件、计算、内存和磁盘配置的一般建议，适用于开源用户。'
---


# 硬件和配置建议

本指南讨论了我们针对开源用户在硬件、计算、内存和磁盘配置方面的一般建议。如果您希望简化设置，我们建议使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，因为它可以自动扩展和适应您的工作负载，同时最大程度地降低与基础设施管理相关的成本。

您的 ClickHouse 集群配置高度依赖于您应用程序的用例和工作负载模式。在规划架构时，您必须考虑以下因素：

- 并发性（每秒请求数）
- 吞吐量（每秒处理的行数）
- 数据量
- 数据保留策略
- 硬件成本
- 维护成本

## 磁盘 {#disk}

您应该使用的磁盘类型取决于数据量、延迟或吞吐量的要求。

### 性能优化 {#optimizing-for-performance}

为了最大化性能，我们建议直接连接 [AWS 的预配置 IOPS SSD 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) 或您云服务提供商的等效产品，以优化 IO。

### 存储成本优化 {#optimizing-for-storage-costs}

为了降低成本，您可以使用 [通用 SSD EBS 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)。

您还可以在 [热/温/冷架构](/guides/developer/ttl#implementing-a-hotwarmcold-architecture) 中使用 SSD 和 HDD 实施分层存储。或者，使用 [AWS S3](https://aws.amazon.com/s3/) 进行存储也可以分离计算和存储。请查看我们的指南，了解如何将开源 ClickHouse 与计算和存储分离一起使用 [这里](/guides/separation-storage-compute)。在 ClickHouse Cloud 中，计算和存储的分离是默认可用的。

## CPU {#cpu}

### 我应该使用哪种 CPU？ {#which-cpu-should-i-use}

您应该使用的 CPU 类型取决于您的使用模式。然而，通常来说，具有许多频繁并发查询、处理更多数据，或使用计算密集型 UDF 的应用程序将需要更多的 CPU 核心。

**低延迟或面向客户的应用程序**

对于如面向客户的工作负载在 10 毫秒范围内的延迟要求，我们建议使用 AWS 的 EC2 [i3 系列](https://aws.amazon.com/ec2/instance-types/i3/) 或 [i4i 系列](https://aws.amazon.com/ec2/instance-types/i4i/) 或您云服务提供商的等效产品，这些都是 IO 优化的。

**高并发应用程序**

对于需要优化并发的工作负载（每秒 100+ 查询），我们建议使用 AWS 的 [计算优化 C 系列](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) 或您云服务提供商的等效产品。

**数据仓库使用案例**

对于数据仓库工作负载和临时分析查询，我们建议使用 AWS 的 [R 型系列](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) 或您云服务提供商的等效产品，因为它们是内存优化的。

---

### CPU 使用率应该是多少？ {#what-should-cpu-utilization-be}

ClickHouse 没有标准的 CPU 使用率目标。使用 [iostat](https://linux.die.net/man/1/iostat) 等工具来测量平均 CPU 使用率，并 accordingly 调整服务器的大小以管理意外的流量高峰。然而，对于分析或数据仓库用例的临时查询，您应该将目标定在 10-20% 的 CPU 使用率。

### 我应该使用多少个 CPU 核心？ {#how-many-cpu-cores-should-i-use}

您应该使用的 CPU 数量取决于您的工作负载。不过，通常我们建议根据您的 CPU 类型使用以下内存与 CPU 核心的比率：

- **[M型](https://aws.amazon.com/ec2/instance-types/)（通用用例）：** 4:1 内存与 CPU 核心比率
- **[R型](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（数据仓库用例）：** 8:1 内存与 CPU 核心比率
- **[C型](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（计算优化用例）：** 2:1 内存与 CPU 核心比率

例如，当使用 M 型 CPU 时，我们建议每 25 个 CPU 核心配置 100GB 的内存。要确定适合您应用程序的内存量，需分析您的内存使用情况。您可以阅读 [此指南以调试内存问题](/guides/developer/debugging-memory-issues) 或使用 [内置可观察性仪表板](/operations/monitoring) 来监控 ClickHouse。

## 内存 {#memory}

与 CPU 的选择一样，您选择的内存与存储比率和内存与 CPU 比率也取决于您的用例。

所需的 RAM 总量通常取决于：
- 查询的复杂性。
- 在查询中处理的数据量。

不过，通常而言，内存越多，查询运行得越快。
如果您的用例对价格敏感，较少的内存也可以使用，因为可以启用设置（[`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) 和 [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)）以允许将数据溢出到磁盘，但请注意，这可能显著影响查询性能。

### 内存与存储比率应该是多少？ {#what-should-the-memory-to-storage-ratio-be}

对于低数据量，可以接受 1:1 的内存与存储比率，但总内存不应低于 8GB。

对于具有长数据保留期或高数据量的用例，我们建议使用 1:100 至 1:130 的内存与存储比率。例如，如果您存储 10TB 的数据，则每个副本应分配 100GB 的 RAM。

对于如面向客户的工作负载等频繁访问的用例，我们建议使用更多内存，以 1:30 至 1:50 的内存与存储比率。

## 副本 {#replicas}

我们建议每个分片至少有三个副本（或两个副本与 [Amazon EBS](https://aws.amazon.com/ebs/)）。此外，我们建议在添加额外副本之前，先对所有副本进行垂直扩展（水平扩展）。

ClickHouse 不会自动分片，重新分片您的数据集将需要大量计算资源。因此，我们通常建议使用可用的最大服务器，以防止将来需要重新分片您的数据。

考虑使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它可以自动扩展，并允许您轻松控制副本数量，以适应您的用例。

## 大工作负载的示例配置 {#example-configurations-for-large-workloads}

ClickHouse 的配置在很大程度上取决于您特定应用程序的要求。如果您希望我们帮助优化您的架构以降低成本和提高性能，请 [联系销售](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)。

为了提供指导（非建议），以下是生产环境中 ClickHouse 用户的示例配置：

### 财富 500 强 B2B SaaS {#fortune-500-b2b-saas}

<table>
    <tr>
        <td col="2"><strong><em>存储</em></strong></td>
    </tr>
    <tr>
        <td><strong>每月新数据量</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>总存储（压缩）</strong></td>
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
        <td><strong>副本数量（包括 HA 配对）</strong></td>
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
        <td><strong>RAM 与 vCPU 比率</strong></td>
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
        <td><strong>总存储（压缩）</strong></td>
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
        <td><strong>副本数量（包括 HA 配对）</strong></td>
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

## 扩展阅读 {#further-reading}

以下是使用开源 ClickHouse 的公司发表的架构相关的博客文章：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
