---
slug: /en/guides/sizing-and-hardware-recommendations
sidebar_label: Sizing and Hardware Recommendations
sidebar_position: 4
---

# Sizing and Hardware Recommendations

This guide discusses our general recommendations regarding hardware, compute, memory, and disk configurations for open-source users. If you would like to simplify your setup, we recommend using [ClickHouse Cloud](https://clickhouse.com/cloud) as it automatically scales and adapts to your workloads while minimizing costs pertaining to infrastructure management.

The configuration of your ClickHouse cluster is highly dependent on your application’s use case and workload patterns. When planning your architecture, you must consider the following factors:

- Concurrency (requests per second)
- Throughput (rows processed per second)
- Data volume
- Data retention policy
- Hardware costs
- Maintenance costs

## Disk

The type(s) of disks you should use with ClickHouse depends on data volume, latency, or throughput requirements.

### Optimizing for performance

To maximize performance, we recommend directly attaching [provisioned IOPS SSD volumes from AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/provisioned-iops.html) or the equivalent offering from your cloud provider, which optimizes for IO.

### Optimizing for storage costs

For lower costs, you can use [general purpose SSD EBS volumes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/general-purpose.html).

You can also implement a tiered storage using SSDs and HDDs in a [hot/warm/cold architecture](/en/guides/developer/ttl#implementing-a-hotwarmcold-architecture). Alternatively, [AWS S3](https://aws.amazon.com/s3/) for storage is also possible to separate compute and storage. Please see our guide for using open-source ClickHouse with separation of compute and storage [here](/en/guides/separation-storage-compute). Separation of compute and storage is available by default in ClickHouse Cloud.

## CPU

### Which CPU should I use?

The type of CPU you should use depends on your usage pattern. In general, however, applications with many frequent concurrent queries, that process more data, or that use compute-intensive UDFs will require more CPU cores.

**Low latency or customer-facing applications**

For latency requirements in the 10s of milliseconds such as for customer-facing workloads, we recommend the EC2 [i3 line](https://aws.amazon.com/ec2/instance-types/i3/) or [i4i line](https://aws.amazon.com/ec2/instance-types/i4i/) from AWS or the equivalent offerings from your cloud provider, which are IO-optimized.

**High concurrency applications**

For workloads that need to optimize for concurrency (100+ queries per second), we recommend the [compute-optimized C series](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) from AWS or the equivalent offering from your cloud provider.

**Data warehousing use case**

For data warehousing workloads and ad-hoc analytical queries, we recommend the [R-type series](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) from AWS or the equivalent offering from your cloud provider as they are memory optimized.

---

### What should CPU utilization be?

There is no standard CPU utilization target for ClickHouse. Utilize a tool such as [iostat](https://linux.die.net/man/1/iostat) to measure average CPU usage, and accordingly adjust the size of your servers to manage unexpected traffic spikes. However, for analytical or data warehousing use cases with ad-hoc queries, you should target 10-20% CPU utilization.

### How many CPU cores should I use?

The number of CPUs you should use depends on your workload. However, we generally recommend the following memory to CPU core ratios based on your CPU type:

- **[M-type](https://aws.amazon.com/ec2/instance-types/) (general purpose use cases):** 4:1 memory to CPU core ratio
- **[R-type](https://aws.amazon.com/ec2/instance-types/#Memory_Optimized) (data warehousing use cases):** 8:1 memory to CPU core ratio
- **[C-type](https://aws.amazon.com/ec2/instance-types/#Compute_Optimized) (compute-optimized use cases):** 2:1 memory to CPU core ratio

As an example, when using M-type CPUs, we recommend provisioning 100GB of memory per 25 CPU cores. To determine the amount of memory appropriate for your application, profiling your memory usage is necessary. You can read [this guide on debugging memory issues](https://clickhouse.com/docs/en/guides/developer/debugging-memory-issues) or use the [built-in observability dashboard](https://clickhouse.com/docs/en/operations/monitoring) to monitor ClickHouse.

## Memory

Like your choice of CPU, your choice of memory to storage ratio and memory to CPU ratio is dependent on your case. In general, however, the more memory you have, the faster your queries will run. If your use case is sensitive to price, lower amounts of memory will work as it is possible to enable settings ([max_bytes_before_external_group_by](/en/operations/settings/query-complexity#settings-max_bytes_before_external_group_by) and [max_bytes_before_external_sort](/en/operations/settings/query-complexity#settings-max_bytes_before_external_sort)) to allow spilling data to disk, but note that this may significantly affect query performance.

### What should the memory to storage ratio be?

For low data volumes, a 1:1 memory to storage ratio is acceptable but total memory should not be below 8GB.

For use cases with long retention periods for your data or with high data volumes, we recommend a 1:100 to 1:130 memory to storage ratio. For example, 100GB of RAM per replica if you are storing 10TB of data.

For use cases with frequent access such as for customer-facing workloads, we recommend using more memory at a 1:30 to 1:50 memory to storage ratio.

## Replicas

We recommend having at least three replicas per shard (or two replicas with [Amazon EBS](https://aws.amazon.com/ebs/)). Additionally, we suggest vertically scaling all replicas prior to adding additional replicas (horizontal scaling).

ClickHouse does not automatically shard, and re-sharding your dataset will require significant compute resources. Therefore, we generally recommend using the largest server available to prevent having to re-shard your data in the future.

Consider using [ClickHouse Cloud](https://clickhouse.com/cloud) which scales automatically and allows you to easily control the number of replicas for your use case.

## Example configurations for large workloads

ClickHouse configurations are highly dependent on your specific application's requirements. Please [contact sales](https://clickhouse.com/company/contact?loc=docs-sizing-and-hardware-recommendations) if you would like us to help optimize your architecture for cost and performance.

To provide guidance (not recommendations), the following are example configurations of ClickHouse users in production:

### Fortune 500 B2B SaaS

<table>
    <tr>
        <td col="2"><strong><em>Storage</em></strong></td>
    </tr>
    <tr>
        <td><strong>Monthly new data volume</strong></td>
        <td>30TB</td>
    </tr>
    <tr>
        <td><strong>Total Storage (compressed)</strong></td>
        <td>540TB</td>
    </tr>
    <tr>
        <td><strong>Data retention</strong></td>
        <td>18 months</td>
    </tr>
    <tr>
        <td><strong>Disk per node</strong></td>
        <td>25TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong>Concurrency</strong></td>
        <td>200+ concurrent queries</td>
    </tr>
    <tr>
        <td><strong># of replicas (including HA pair)</strong></td>
        <td>44</td>
    </tr>
    <tr>
        <td><strong>vCPU per node</strong></td>
        <td>62</td>
    </tr>
    <tr>
        <td><strong>Total vCPU</strong></td>
        <td>2700</td>
    </tr>
    <tr>
        <td col="2"><strong><em>Memory</em></strong></td>
    </tr>
    <tr>
        <td><strong>Total RAM</strong></td>
        <td>11TB</td>
    </tr>
    <tr>
        <td><strong>RAM per replica</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM to vCPU ratio</strong></td>
        <td>4:1</td>
    </tr>
    <tr>
        <td><strong>RAM to disk ratio</strong></td>
        <td>1:50</td>
    </tr>
</table>

### Fortune 500 Telecom Operator for a logging use case

<table>
    <tr>
        <td col="2"><strong><em>Storage</em></strong></td>
    </tr>
    <tr>
        <td><strong>Monthly log data volume</strong></td>
        <td>4860TB</td>
    </tr>
    <tr>
        <td><strong>Total Storage (compressed)</strong></td>
        <td>608TB</td>
    </tr>
    <tr>
        <td><strong>Data retention</strong></td>
        <td>30 days</td>
    </tr>
    <tr>
        <td><strong>Disk per node</strong></td>
        <td>13TB</td>
    </tr>
    <tr>
        <td col="2"><strong><em>CPU</em></strong></td>
    </tr>
    <tr>
        <td><strong># of replicas (including HA pair)</strong></td>
        <td>38</td>
    </tr>
    <tr>
        <td><strong>vCPU per node</strong></td>
        <td>42</td>
    </tr>
    <tr>
        <td><strong>Total vCPU</strong></td>
        <td>1600</td>
    </tr>
    <tr>
        <td col="2"><strong><em>Memory</em></strong></td>
    </tr>
    <tr>
        <td><strong>Total RAM</strong></td>
        <td>10TB</td>
    </tr>
    <tr>
        <td><strong>RAM per replica</strong></td>
        <td>256GB</td>
    </tr>
    <tr>
        <td><strong>RAM to vCPU ratio</strong></td>
        <td>6:1</td>
    </tr>
    <tr>
        <td><strong>RAM to disk ratio</strong></td>
        <td>1:60</td>
    </tr>
</table>

## Further reading

Below are published blog posts on architecture from companies using open-source ClickHouse:

- [Cloudflare](https://blog.cloudflare.com/http-analytics-for-6m-requests-per-second-using-clickhouse/?utm_source=linkedin&utm_medium=social&utm_campaign=blog)
- [eBay](https://innovation.ebayinc.com/tech/engineering/ou-online-analytical-processing/)
- [GitLab](https://handbook.gitlab.com/handbook/engineering/development/ops/monitor/observability/#clickhouse-datastore)
- [Lyft](https://eng.lyft.com/druid-deprecation-and-clickhouse-adoption-at-lyft-120af37651fd)
- [MessageBird](https://clickhouse.com/blog/how-messagebird-uses-clickhouse-to-monitor-the-delivery-of-billions-of-messages)
- [Microsoft](https://clickhouse.com/blog/self-service-data-analytics-for-microsofts-biggest-web-properties)
- [Uber](https://www.uber.com/en-ES/blog/logging/)
- [Zomato](https://blog.zomato.com/building-a-cost-effective-logging-platform-using-clickhouse-for-petabyte-scale)
