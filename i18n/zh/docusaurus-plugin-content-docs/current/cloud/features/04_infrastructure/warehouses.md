---
'title': '仓库'
'slug': '/cloud/reference/warehouses'
'keywords':
- 'compute separation'
- 'cloud'
- 'architecture'
- 'compute-compute'
- 'warehouse'
- 'warehouses'
- 'hydra'
'description': 'ClickHouse Cloud 中的计算-计算分离'
'doc_type': 'reference'
---

import compute_1 from '@site/static/images/cloud/reference/compute-compute-1.png';
import compute_2 from '@site/static/images/cloud/reference/compute-compute-2.png';
import compute_3 from '@site/static/images/cloud/reference/compute-compute-3.png';
import compute_4 from '@site/static/images/cloud/reference/compute-compute-4.png';
import compute_5 from '@site/static/images/cloud/reference/compute-compute-5.png';
import compute_7 from '@site/static/images/cloud/reference/compute-compute-7.png';
import compute_8 from '@site/static/images/cloud/reference/compute-compute-8.png';
import Image from '@theme/IdealImage';


# 仓库

## 什么是计算-计算分离？ {#what-is-compute-compute-separation}

计算-计算分离适用于 Scale 和 Enterprise 级别。

每个 ClickHouse Cloud 服务包括：
- 需要一组两个或更多的 ClickHouse 节点（或副本），但子服务可以是单个副本。
- 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点），这是您用于连接服务的服务 URL（例如，`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。
- 一个对象存储文件夹，服务在其中存储所有数据和部分元数据：

:::note
子服务可以进行垂直扩展，而不像单个父服务。
:::

<Image img={compute_1} size="md" alt="当前在 ClickHouse Cloud 中的服务" />

<br />

_Fig. 1 - 当前在 ClickHouse Cloud 中的服务_

计算-计算分离允许用户创建多个计算节点组，每个组具有自己的端点，它们使用相同的对象存储文件夹，因此，使用相同的表、视图等。

每个计算节点组都有自己的端点，因此您可以选择用于工作负载的副本集。您的某些工作负载可能只需使用一个小型副本，其他工作负载可能需要完全的高可用性（HA）和数百 GB 的内存。计算-计算分离还允许您将读操作与写操作分开，从而避免相互干扰：

<Image img={compute_2} size="md" alt="ClickHouse Cloud 中的计算分离" />

<br />

_Fig. 2 - ClickHouse Cloud 中的计算分离_

可以创建共享与现有服务相同数据的额外服务，或创建一个全新的设置，多个服务共享相同数据。

## 什么是仓库？ {#what-is-a-warehouse}

在 ClickHouse Cloud 中，_仓库_ 是一组共享相同数据的服务。
每个仓库都有一个主要服务（这个服务是首先创建的）和一个或多个次要服务。例如，在下图中，您可以看到一个名为 "DWH Prod" 的仓库，其中有两个服务：

- 主要服务 `DWH Prod`
- 次要服务 `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="具有主要和次要服务的仓库示例" background='white' />

<br />

_Fig. 3 - 仓库示例_

仓库中的所有服务共享相同的：

- 区域（例如，us-east1）
- 云服务提供商（AWS、GCP 或 Azure）
- ClickHouse 数据库版本

您可以根据它们所属的仓库对服务进行排序。

## 访问控制 {#access-controls}

### 数据库凭据 {#database-credentials}

因为所有仓库中的服务共享相同的表集，所以它们也共享对其他服务的访问控制。这意味着在服务 1 中创建的所有数据库用户也能够以相同的权限（表、视图等的授予）使用服务 2，反之亦然。用户将通过每个服务使用不同的端点，但使用相同的用户名和密码。换句话说，_用户在使用相同存储的服务之间是共享的：_

<Image img={compute_3} size="md" alt="用户访问共享相同数据的服务" />

<br />

_Fig. 4 - 用户 Alice 在服务 1 中创建，但她可以使用相同的凭据访问所有共享相同数据的服务_

### 网络访问控制 {#network-access-control}

限制特定服务被其他应用程序或临时用户使用通常是很有用的。这可以通过使用网络限制来完成，类似于目前为常规服务配置的方式（在 ClickHouse Cloud 控制台中的特定服务的服务选项卡中导航到**设置**）。

您可以对每个服务单独应用 IP 过滤设置，这意味着您可以控制哪个应用程序可以访问哪个服务。这允许您限制用户使用特定服务：

<Image img={compute_4} size="md" alt="网络访问控制设置"/>

<br />

_Fig. 5 - Alice 被网络设置限制访问服务 2_

### 只读与读写 {#read-vs-read-write}

有时限制特定服务的写访问并仅允许仓库中一部分服务进行写入是很有用的。这可以在创建第二个和第 N 个服务时完成（第一个服务应始终是读写的）：

<Image img={compute_5} size="lg" alt="仓库中的读写服务和只读服务"/>

<br />

_Fig. 6 - 仓库中的读写服务和只读服务_

:::note
1. 当前只读服务允许用户管理操作（创建、删除等）。这一行为未来可能会改变。
2. 目前，可刷新的物化视图在仓库中的所有服务上执行，包括只读服务。然而，这一行为将在未来改变，它们将仅在读写服务上执行。
:::

## 扩展 {#scaling}

仓库中的每个服务可以根据您的工作负载进行调整，包括：
- 节点数量（副本）。主要服务（仓库中首先创建的服务）应具有 2 个或更多节点。每个次要服务可以有 1 个或更多节点。
- 节点（副本）的大小
- 服务是否应自动扩展
- 服务在不活动时是否应闲置（不能应用于组中的第一个服务 - 请查看**限制**部分）

## 行为变化 {#changes-in-behavior}
一旦某个服务启用了计算-计算（至少创建了一个次要服务），则调用 `clusterAllReplicas()` 函数时使用的 `default` 集群名称将仅利用从其调用的服务中的副本。这意味着，如果有两个连接到同一数据集的服务，并且从服务 1 调用 `clusterAllReplicas(default, system, processes)`，则仅会显示在服务 1 上运行的进程。如果需要，您仍然可以调用 `clusterAllReplicas('all_groups.default', system, processes)` 例如来访问所有副本。

## 限制 {#limitations}

1. **主要服务应始终处于运行状态，并且不应闲置（此限制将在 GA 后的一段时间内被移除）。** 在私有预览和 GA 后的一段时间内，主要服务（通常是您希望通过添加其他服务来扩展的现有服务）将始终保持运行，并且将禁用闲置设置。如果存在至少一个次要服务，您将无法停止或闲置主要服务。一旦所有次要服务被移除，您可以再次停止或闲置原始服务。

2. **有时工作负载无法隔离。** 尽管目标是为您提供选项，以将数据库工作负载相互隔离，但可能会出现某些边界情况，其中一个服务中的工作负载会影响共享相同数据的另一个服务。这些情况比较少见，通常与 OLTP 类型的工作负载有关。

3. **所有读写服务都在进行后台合并操作。** 当将数据插入 ClickHouse 时，数据库首先将数据插入某些暂存分区，然后在后台执行合并。这些合并可能会消耗内存和 CPU 资源。当两个读写服务共享相同的存储时，它们都在执行后台操作。这意味着可能会出现这样的情况：服务 1 中的 `INSERT` 查询，但合并操作由服务 2 完成。请注意，只读服务不执行后台合并，因此它们不会在此操作上消耗资源。

4. **所有读写服务都在执行 S3Queue 表引擎插入操作。** 当在 RW 服务上创建 S3Queue 表时，仓库中的所有其他 RW 服务可能会从 S3 读取数据并将数据写入数据库。

5. **在一个读写服务中的插入可能会阻止另一个读写服务闲置（如果启用了闲置）。** 结果，第二个服务为第一个服务执行后台合并操作。这些后台操作可能会阻止第二个服务在闲置时进入睡眠状态。一旦后台操作完成，服务将闲置。只读服务不受影响，将毫不延迟地闲置。

6. **CREATE/RENAME/DROP DATABASE 查询默认可能会被闲置/停止的服务阻止。** 这些查询可能会挂起。要绕过此限制，您可以在会话或查询级别运行数据库管理查询时设置 `settings distributed_ddl_task_timeout=0`。例如：

```sql
CREATE DATABASE db_test_ddl_single_query_setting
SETTINGS distributed_ddl_task_timeout=0
```

6. **在非常少见的情况下，长时间闲置或停止的次要服务（天数）而未被唤醒/启动可能会导致同一仓库中的其他服务性能下降。** 这个问题将在不久的将来解决，并与后台运行的突变有关。如果您认为您遇到此问题，请联系 ClickHouse [支持](https://clickhouse.com/support/program)。

7. **目前每个仓库有 5 个服务的软限制。** 如果您需要在单个仓库中使用超过 5 个服务，请联系支持团队。

## 定价 {#pricing}

仓库中所有服务的计算价格都是相同的（主要和次要）。存储仅收取一次费用 - 包括在第一个（原始）服务中。

请参考 [定价](https://clickhouse.com/pricing) 页面上的定价计算器，它将帮助您根据工作负载大小和级别选择来估算成本。

## 备份 {#backups}

- 由于单个仓库中的所有服务共享相同的存储，因此备份仅在主要（初始）服务上进行。通过这种方式，仓库中所有服务的数据都得到了备份。
- 如果您从仓库的主要服务恢复备份，它将恢复到一个完全新的服务，与现有仓库没有连接。然后您可以在恢复完成后立即向新服务添加更多服务。

## 使用仓库 {#using-warehouses}

### 创建仓库 {#creating-a-warehouse}

要创建一个仓库，需要创建一个与现有服务共享数据的第二个服务。可以通过单击任何现有服务上的加号来完成：

<Image img={compute_7} size="md" alt="在仓库中创建新服务" border background='white' />

<br />

_Fig. 7 - 单击加号以在仓库中创建新服务_

在服务创建屏幕中，原始服务将作为新服务的数据源在下拉列表中被选中。一旦创建，这两个服务将形成一个仓库。

### 重命名仓库 {#renaming-a-warehouse}

有两种方式可以重命名仓库：

- 您可以在服务页面的右上角选择“按仓库排序”，然后点击仓库名称旁边的铅笔图标
- 您可以单击任何服务上的仓库名称，并在此处重命名仓库

### 删除仓库 {#deleting-a-warehouse}

删除仓库意味着删除所有计算服务及其数据（表、视图、用户等）。此操作无法撤销。
您只能通过删除第一个创建的服务来删除仓库。为此：

1. 删除您首次创建的服务之外创建的所有服务；
2. 删除第一个服务（警告：在此步骤中，将删除所有仓库的数据）。
