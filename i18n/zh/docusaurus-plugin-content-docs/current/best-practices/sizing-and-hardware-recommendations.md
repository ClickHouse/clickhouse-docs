---
'slug': '/guides/sizing-and-hardware-recommendations'
'sidebar_label': '尺寸和硬件建议'
'sidebar_position': 4
'title': '尺寸和硬件建议'
'description': '本指南讨论了我们关于硬件、计算、内存和磁盘配置的一般建议，适用于开源用户。'
---


# Sizing and Hardware Recommendations

本指南讨论了我们针对开源用户在硬件、计算、内存和磁盘配置方面的总体建议。如果您希望简化设置，我们建议使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，因为它可以自动扩展并适应您的工作负载，同时最小化与基础设施管理相关的成本。

您的 ClickHouse 集群的配置在很大程度上取决于您的应用程序的用例和工作负载模式。在规划架构时，您必须考虑以下因素：

- 并发性（每秒请求数）
- 吞吐量（每秒处理的行数）
- 数据量
- 数据保留政策
- 硬件成本
- 维护成本

## Disk {#disk}

您应该使用的磁盘类型取决于数据量、延迟或吞吐量要求。

### Optimizing for performance {#optimizing-for-performance}

为了最大化性能，我们建议直接连接 [AWS 的预配置 IOPS SSD 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) 或您云提供商的等效产品，这样可以优化 IO。

### Optimizing for storage costs {#optimizing-for-storage-costs}

为了降低成本，您可以使用 [通用 SSD EBS 卷](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html)。

您还可以在 [热/温/冷架构](/guides/developer/ttl#implementing-a-hotwarmcold-architecture) 中使用 SSD 和 HDD 实现分层存储。或者，可以使用 [AWS S3](https://aws.amazon.com/s3/) 作为存储，以隔离计算和存储。有关使用开源 ClickHouse 进行计算和存储分离的指南，请参见 [这里](/guides/separation-storage-compute)。在 ClickHouse Cloud 中，计算和存储的分离是默认可用的。

## CPU {#cpu}

### Which CPU should I use? {#which-cpu-should-i-use}

您应该使用的 CPU 类型取决于您的使用模式。然而，通常情况下，处理更多数据或使用计算密集型 UDF 的应用程序需要更多的 CPU 核心。

**低延迟或面向客户的应用程序**

对于延迟要求在10毫秒的客户面向工作负载，我们建议使用 AWS 的 EC2 [i3 系列](https://aws.amazon.com/ec2/instance-types/i3/) 或 [i4i 系列](https://aws.amazon.com/ec2/instance-types/i4i/) 或您云提供商的等效产品，这些产品是 IO 优化的。

**高并发应用程序**

对于需要优化并发（每秒 100+ 查询）的工作负载，我们建议使用 AWS 的 [计算优化 C 系列](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) 或您云提供商的等效产品。

**数据仓库用例**

对于数据仓库工作负载和临时分析查询，我们建议使用 AWS 的 [R 型系列](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) 或您云提供商的等效产品，因为它们是内存优化的。

---

### What should CPU utilization be? {#what-should-cpu-utilization-be}

对于 ClickHouse 没有标准的 CPU 利用率目标。使用诸如 [iostat](https://linux.die.net/man/1/iostat) 的工具来测量平均 CPU 使用率，并相应地调整服务器的规模以应对意外的流量激增。然而，对于分析或数据仓库用例与临时查询，目标应该是 10-20% 的 CPU 利用率。

### How many CPU cores should I use? {#how-many-cpu-cores-should-i-use}

您应使用的 CPU 数量取决于您的工作负载。然而，我们通常推荐以下基于您 CPU 类型的内存与 CPU 核心的比率：

- **[M-type](https://aws.amazon.com/ec2/instance-types/)（通用用途）：** 4:1 内存与 CPU 核心比率
- **[R-type](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized)（数据仓库用例）：** 8:1 内存与 CPU 核心比率
- **[C-type](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized)（计算优化用例）：** 2:1 内存与 CPU 核心比率

例如，当使用 M 型 CPU 时，我们建议为每 25 个 CPU 核心配置 100GB 的内存。为了确定适合您应用程序的内存量，有必要对内存使用进行分析。您可以阅读 [这个调试内存问题的指南](/guides/developer/debugging-memory-issues) 或使用 [内置监控仪表板](/operations/monitoring) 来监视 ClickHouse。

## Memory {#memory}

与您的 CPU 选择一样，内存与存储比率及内存与 CPU 比率取决于您的用例。

所需的 RAM 量通常取决于：
- 查询的复杂性。
- 在查询中处理的数据量。

然而，通常情况下，内存越多，查询运行得越快。
如果您的用例对价格敏感，较少的内存仍可使用，因为可以启用设置（[`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by) 和 [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)）以允许将数据溢出到磁盘，不过，请注意，这可能会显著影响查询性能。

### What should the memory to storage ratio be? {#what-should-the-memory-to-storage-ratio-be}

对于低数据量，1:1 的内存与存储比率是可以接受的，但总内存不应低于 8GB。

对于数据保留期较长或数据量较大的用例，我们建议 1:100 至 1:130 的内存与存储比率。例如，如果您存储10TB的数据，则每个副本100GB的RAM。

对于频繁访问的用例，例如面向客户的工作负载，我们建议使用更多的内存，比例为1:30至1:50的内存与存储比率。

## Replicas {#replicas}

我们建议每个分片至少有三个副本（或两个副本与 [Amazon EBS](https://aws.amazon.com/ebs/)）。此外，我们建议在添加额外副本（横向扩展）之前先进行所有副本的纵向扩展。

ClickHouse 不会自动分片，重新分片数据集将需要大量的计算资源。因此，我们通常建议使用可用的最大服务器，以防未来需要重新分片数据。

考虑使用 [ClickHouse Cloud](https://clickhouse.com/cloud)，它可以自动扩展，并允许您轻松控制副本的数量以适应您的用例。

## Example configurations for large workloads {#example-configurations-for-large-workloads}

ClickHouse 配置在很大程度上取决于您特定应用程序的需求。如果您希望我们帮助优化您在成本和性能上的架构，请 [联系销售](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations)。

为了提供指导（而不是推荐），以下是一些在生产环境中使用 ClickHouse 的用户的示例配置：

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

### Fortune 500 Telecom Operator for a logging use case {#fortune-500-telecom-operator-for-a-logging-use-case}

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

## Further reading {#further-reading}

以下是一些使用开源 ClickHouse 的公司的已发布博客文章，讨论架构相关内容：

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
