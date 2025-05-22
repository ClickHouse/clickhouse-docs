---
'description': '工作负载调度的文档'
'sidebar_label': '工作负载调度'
'sidebar_position': 69
'slug': '/operations/workload-scheduling'
'title': '工作负载调度'
---

当 ClickHouse 同时执行多个查询时，它们可能会使用共享资源（例如磁盘）。可以应用调度约束和策略来调节资源在不同工作负载之间的利用和共享。对于每个资源，可以配置一个调度层次结构。层次结构的根表示一个资源，而叶子是排队的请求，它们超过了资源的容量。

:::note
目前 [remote disk IO](#disk_config) 和 [CPU](#cpu_scheduling) 可以使用上述方法进行调度。有关灵活内存限制，请参见 [Memory overcommit](settings/memory-overcommit.md)
:::

## 磁盘配置 {#disk_config}

要为特定磁盘启用 IO 工作负载调度，您必须创建用于 WRITE 和 READ 访问的读写资源：

```sql
CREATE RESOURCE resource_name (WRITE DISK disk_name, READ DISK disk_name)
-- or
CREATE RESOURCE read_resource_name (WRITE DISK write_disk_name)
CREATE RESOURCE write_resource_name (READ DISK read_disk_name)
```

资源可以用于任何数量的磁盘进行 READ 或 WRITE 或两者兼有。语法允许将资源用于所有磁盘：

```sql
CREATE RESOURCE all_io (READ ANY DISK, WRITE ANY DISK);
```

表达资源使用哪个磁盘的另一种方式是服务器的 `storage_configuration`：

:::warning
使用 clickhouse 配置进行工作负载调度已被弃用。应使用 SQL 语法。
:::

要启用特定磁盘的 IO 调度，您必须在存储配置中指定 `read_resource` 和/或 `write_resource`。它告诉 ClickHouse 在给定磁盘的每个读写请求应使用哪个资源。读写资源可以引用相同的资源名称，这对于本地 SSD 或 HDD 很有用。多个不同的磁盘也可以引用相同的资源，这对于远程磁盘很有用：如果您希望能够在 e.g. “生产”和“开发”工作负载之间公平分配网络带宽。

示例：
```xml
<clickhouse>
    <storage_configuration>
        ...
        <disks>
            <s3>
                <type>s3</type>
                <endpoint>https://clickhouse-public-datasets.s3.amazonaws.com/my-bucket/root-path/</endpoint>
                <access_key_id>your_access_key_id</access_key_id>
                <secret_access_key>your_secret_access_key</secret_access_key>
                <read_resource>network_read</read_resource>
                <write_resource>network_write</write_resource>
            </s3>
        </disks>
        <policies>
            <s3_main>
                <volumes>
                    <main>
                        <disk>s3</disk>
                    </main>
                </volumes>
            </s3_main>
        </policies>
    </storage_configuration>
</clickhouse>
```

请注意，服务器配置选项优先于 SQL 定义资源的方式。

## 工作负载标记 {#workload_markup}

查询可以通过设置 `workload` 来标记，以区分不同的工作负载。如果未设置 `workload`，则使用值“default”。请注意，您可以使用设置配置文件指定其他值。如果您希望用户的所有查询都用固定值的 `workload` 设置标记，可以使用设置约束将 `workload` 设为常量。

也可以为后台活动分配 `workload` 设置。合并和变更分别使用 `merge_workload` 和 `mutation_workload` 服务器设置。这些值也可以通过 `merge_workload` 和 `mutation_workload` 合并树设置为特定表覆盖。

让我们考虑一个具有两种不同工作负载的系统：“生产”和“开发”。

```sql
SELECT count() FROM my_table WHERE value = 42 SETTINGS workload = 'production'
SELECT count() FROM my_table WHERE value = 13 SETTINGS workload = 'development'
```

## 资源调度层次 {#hierarchy}

从调度子系统的角度来看，资源代表了调度节点的层次结构。

```mermaid
graph TD
    subgraph network_read
    nr_root(("/"))
    -->|100 concurrent requests| nr_fair("fair")
    -->|75% bandwidth| nr_prod["prod"]
    nr_fair
    -->|25% bandwidth| nr_dev["dev"]
    end

    subgraph network_write
    nw_root(("/"))
    -->|100 concurrent requests| nw_fair("fair")
    -->|75% bandwidth| nw_prod["prod"]
    nw_fair
    -->|25% bandwidth| nw_dev["dev"]
    end
```

:::warning
使用 clickhouse 配置进行工作负载调度已被弃用。应使用 SQL 语法。SQL 语法会自动创建所有必要的调度节点，以下调度节点描述应被视为较低级别的实现细节，可通过 [system.scheduler](/operations/system-tables/scheduler.md) 表访问。
:::

**可能的节点类型：**
* `inflight_limit`（约束） - 如果并发的在途请求数量超过 `max_requests`，或者它们的总成本超过 `max_cost`，则阻止请求；必须有一个子节点。
* `bandwidth_limit`（约束） - 如果当前带宽超过 `max_speed`（0表示无限制）或突发超出 `max_burst`（默认等于 `max_speed`），则阻止请求；必须有一个子节点。
* `fair`（策略） - 根据最大最小公平选择其子节点之一来服务下一个请求；子节点可以指定 `weight`（默认值为 1）。
* `priority`（策略） - 根据静态优先级从其子节点中选择下一个请求进行服务（较低值意味着较高优先级）；子节点可以指定 `priority`（默认值为 0）。
* `fifo`（队列） - 能够容纳超过资源容量的请求的层次叶子。

要能够充分利用底层资源，您应使用 `inflight_limit`。请注意，较低的 `max_requests` 或 `max_cost` 可能导致资源未能充分利用，而太大的数字可能导致调度器内部出现空队列，这反过来将导致在子树中忽略策略（不公平或忽略优先级）。另一方面，如果您希望保护资源不被过高利用，则应使用 `bandwidth_limit`。当在 `duration` 秒内消耗的资源量超过 `max_burst + max_speed * duration` 字节时，它将减速。在同一资源上可以使用两个 `bandwidth_limit` 节点来限制短时间内的峰值带宽和长时间的平均带宽。

以下示例展示了如何定义 IO 调度层次，如图所示：

```xml
<clickhouse>
    <resources>
        <network_read>
            <node path="/">
                <type>inflight_limit</type>
                <max_requests>100</max_requests>
            </node>
            <node path="/fair">
                <type>fair</type>
            </node>
            <node path="/fair/prod">
                <type>fifo</type>
                <weight>3</weight>
            </node>
            <node path="/fair/dev">
                <type>fifo</type>
            </node>
        </network_read>
        <network_write>
            <node path="/">
                <type>inflight_limit</type>
                <max_requests>100</max_requests>
            </node>
            <node path="/fair">
                <type>fair</type>
            </node>
            <node path="/fair/prod">
                <type>fifo</type>
                <weight>3</weight>
            </node>
            <node path="/fair/dev">
                <type>fifo</type>
            </node>
        </network_write>
    </resources>
</clickhouse>
```

## 工作负载分类器 {#workload_classifiers}

:::warning
使用 clickhouse 配置进行工作负载调度已被弃用。应使用 SQL 语法。使用 SQL 语法时，分类器会自动创建。
:::

工作负载分类器用于定义查询指定的 `workload` 到特定资源应使用的叶子队列的映射。当前，工作负载分类非常简单：仅支持静态映射。

示例：
```xml
<clickhouse>
    <workload_classifiers>
        <production>
            <network_read>/fair/prod</network_read>
            <network_write>/fair/prod</network_write>
        </production>
        <development>
            <network_read>/fair/dev</network_read>
            <network_write>/fair/dev</network_write>
        </development>
        <default>
            <network_read>/fair/dev</network_read>
            <network_write>/fair/dev</network_write>
        </default>
    </workload_classifiers>
</clickhouse>
```

## 工作负载层次 {#workloads}

ClickHouse 提供了方便的 SQL 语法来定义调度层次。所有通过 `CREATE RESOURCE` 创建的资源共享相同的层次结构，但在某些方面可能有所不同。每个通过 `CREATE WORKLOAD` 创建的工作负载为每个资源维护几个自动创建的调度节点。可以在另一个父工作负载内创建子工作负载。下面的示例定义了与上述 XML 配置完全相同的层次：

```sql
CREATE RESOURCE network_write (WRITE DISK s3)
CREATE RESOURCE network_read (READ DISK s3)
CREATE WORKLOAD all SETTINGS max_io_requests = 100
CREATE WORKLOAD development IN all
CREATE WORKLOAD production IN all SETTINGS weight = 3
```

没有子节点的叶子工作负载名称可以在查询设置中使用 `SETTINGS workload = 'name'`。

要自定义工作负载，可以使用以下设置：
* `priority` - 按静态优先级值服务兄弟工作负载（较低值意味着较高优先级）。
* `weight` - 拥有相同静态优先级的兄弟工作负载根据权重共享资源。
* `max_io_requests` - 此工作负载中并发 IO 请求的数量限制。
* `max_bytes_inflight` - 此工作负载中并发请求的总在途字节的限制。
* `max_bytes_per_second` - 此工作负载的字节读取或写入速率限制。
* `max_burst_bytes` - 工作负载在没有减速的情况下可以处理的最大字节数（对于每个资源独立）。
* `max_concurrent_threads` - 此工作负载中查询的线程数量限制。

通过工作负载设置指定的所有限制对于每个资源都是独立的。例如，工作负载 `max_bytes_per_second = 10485760` 将为每个读写资源独立设置 10 MB/s 的带宽限制。如果需要对读取和写入进行共同限制，请考虑使用相同的资源进行 READ 和 WRITE 访问。

没有办法为不同的资源指定不同的工作负载层次。但可以为特定资源指定不同的工作负载设置值：

```sql
CREATE OR REPLACE WORKLOAD all SETTINGS max_io_requests = 100, max_bytes_per_second = 1000000 FOR network_read, max_bytes_per_second = 2000000 FOR network_write
```

还请注意，如果工作负载或资源在其他工作负载中被引用，则不能删除。要更新工作负载的定义，请使用 `CREATE OR REPLACE WORKLOAD` 查询。

:::note
工作负载设置会被转换为一组适当的调度节点。有关较低级别的详细信息，请参见调度节点 [类型和选项](#hierarchy) 的描述。
:::

## CPU 调度 {#cpu_scheduling}

要为工作负载启用 CPU 调度，请创建 CPU 资源并设置并发线程数量的限制：

```sql
CREATE RESOURCE cpu (MASTER THREAD, WORKER THREAD)
CREATE WORKLOAD all SETTINGS max_concurrent_threads = 100
```

当 ClickHouse 服务器执行多个并发查询并且所有 CPU 插槽都在使用时，将进入过载状态。在过载状态下，每个释放的 CPU 插槽会根据调度策略重新调度到适当的工作负载。对于共享相同工作负载的查询，插槽将采用轮询分配。对于位于不同工作负载中的查询，插槽将根据工作负载指定的权重、优先级和限制进行分配。

当线程未被阻塞并在 CPU 密集型任务上工作时，会消耗 CPU 时间。出于调度目的，将区分两种线程：
* 主线程 - 第一个开始执行查询或后台活动（如合并或变更）的线程。
* 工作线程 - 主线程可以生成的其他线程，以处理 CPU 密集型任务。

为了实现更好的响应能力，可能希望为主线程和工作线程使用不同的资源。当使用较高的 `max_threads` 查询设置值时，较多的工作线程可能会轻易垄断 CPU 资源。此时，传入的查询应阻塞并等待主线程的 CPU 插槽开始执行。为避免这种情况，可以使用以下配置：

```sql
CREATE RESOURCE worker_cpu (WORKER THREAD)
CREATE RESOURCE master_cpu (MASTER THREAD)
CREATE WORKLOAD all SETTINGS max_concurrent_threads = 100 FOR worker_cpu, max_concurrent_threads = 1000 FOR master_cpu
```

这将为主线程和工作线程创建独立的限制。即使所有 100 个工作 CPU 插槽都忙，新查询在主 CPU 插槽可用之前将不会被阻塞。它们将以一个线程开始执行。之后，如果工作 CPU 插槽变得可用，这些查询可以扩展并生成它们的工作线程。另一方面，这种方法并不将总插槽数绑定到 CPU 处理器的数量，并且运行过多的并发线程将影响性能。

限制主线程的并发性不会限制并发查询的数量。CPU 插槽可以在查询执行期间释放，并被其他线程重新获取。例如，在主线程限制为 2 的情况下，4 个并发查询仍然可以并行执行。在这种情况下，每个查询将获得 50% 的 CPU 处理器。应使用单独的逻辑来限制并发查询的数量，并且当前不支持针对工作负载的限制。

可为工作负载使用单独的线程并发限制：

```sql
CREATE RESOURCE cpu (MASTER THREAD, WORKER THREAD)
CREATE WORKLOAD all
CREATE WORKLOAD admin IN all SETTINGS max_concurrent_threads = 10
CREATE WORKLOAD production IN all SETTINGS max_concurrent_threads = 100
CREATE WORKLOAD analytics IN production SETTINGS max_concurrent_threads = 60, weight = 9
CREATE WORKLOAD ingestion IN production
```

此配置示例为 admin 和 production 提供独立的 CPU 插槽池。生产池在分析和摄取之间共享。此外，如果生产池过载，在必要时 10 个释放的插槽中的 9 个将被重新调度至分析查询。摄取查询在过载期间仅会获得 10 个插槽中的 1 个。这可能会改善面向用户的查询的延迟。分析有其自己的 60 个并发线程限制，总是留出至少 40 个线程以支持摄取。当没有过载时，摄取可以使用所有 100 个线程。

要将查询排除在 CPU 调度之外，请将查询设置 [use_concurrency_control](/operations/settings/settings.md/#use_concurrency_control) 设置为 0。

目前尚不支持合并和变更的 CPU 调度。

:::warning
插槽调度提供控制 [查询并发性](/operations/settings/settings.md#max_threads) 的方法，但尚无法保证公平的 CPU 时间分配。这需要进一步开发 CPU 插槽抢占，并将在以后得到支持。
:::

:::note
声明 CPU 资源将禁用 [`concurrent_threads_soft_limit_num`](server-configuration-parameters/settings.md#concurrent_threads_soft_limit_num) 和 [`concurrent_threads_soft_limit_ratio_to_cores`](server-configuration-parameters/settings.md#concurrent_threads_soft_limit_ratio_to_cores) 设置的效果。相反，工作负载设置 `max_concurrent_threads` 用于限制分配给特定工作负载的 CPU 数量。要实现之前的行为，只需创建 WORKER THREAD 资源，为工作负载 `all` 设置与 `concurrent_threads_soft_limit_num` 相同的 `max_concurrent_threads` 值，然后使用 `workload = "all"` 查询设置。该配置对应于设置为“fair_round_robin”值的 [`concurrent_threads_scheduler`](server-configuration-parameters/settings.md#concurrent_threads_scheduler) 设置。
:::

## 工作负载和资源存储 {#workload_entity_storage}
所有工作负载和资源的定义以 `CREATE WORKLOAD` 和 `CREATE RESOURCE` 查询的形式持久存储在磁盘的 `workload_path` 或 ZooKeeper 的 `workload_zookeeper_path` 上。建议使用 ZooKeeper 存储以实现节点之间的一致性。或者，可以配合磁盘存储使用 `ON CLUSTER` 子句。

## 严格资源访问 {#strict_resource_access}
为了强制所有查询遵循资源调度策略，有一个服务器设置 `throw_on_unknown_workload`。如果设置为 `true`，则每个查询都要求使用有效的 `workload` 查询设置，否则将抛出 `RESOURCE_ACCESS_DENIED` 异常。如果设置为 `false`，则此类查询不使用资源调度，即将无限制地访问任何 `RESOURCE`。

:::note
除非执行 `CREATE WORKLOAD default`，否则不要将 `throw_on_unknown_workload` 设置为 `true`。如果在启动期间执行未显式设置 `workload` 的查询，可能会导致服务器启动问题。
:::

## 另请参见 {#see-also}
 - [system.scheduler](/operations/system-tables/scheduler.md)
 - [system.workloads](/operations/system-tables/workloads.md)
 - [system.resources](/operations/system-tables/resources.md)
 - [merge_workload](/operations/settings/merge-tree-settings.md#merge_workload) 合并树设置
 - [merge_workload](/operations/server-configuration-parameters/settings.md#merge_workload) 全局服务器设置
 - [mutation_workload](/operations/settings/merge-tree-settings.md#mutation_workload) 合并树设置
 - [mutation_workload](/operations/server-configuration-parameters/settings.md#mutation_workload) 全局服务器设置
 - [workload_path](/operations/server-configuration-parameters/settings.md#workload_path) 全局服务器设置
 - [workload_zookeeper_path](/operations/server-configuration-parameters/settings.md#workload_zookeeper_path) 全局服务器设置
