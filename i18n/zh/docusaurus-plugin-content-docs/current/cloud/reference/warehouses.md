import compute_1 from '@site/static/images/cloud/reference/compute-compute-1.png';
import compute_2 from '@site/static/images/cloud/reference/compute-compute-2.png';
import compute_3 from '@site/static/images/cloud/reference/compute-compute-3.png';
import compute_4 from '@site/static/images/cloud/reference/compute-compute-4.png';
import compute_5 from '@site/static/images/cloud/reference/compute-compute-5.png';
import compute_7 from '@site/static/images/cloud/reference/compute-compute-7.png';
import compute_8 from '@site/static/images/cloud/reference/compute-compute-8.png';
import Image from '@theme/IdealImage';

# 数据仓库

## 计算-计算分离是什么？ {#what-is-compute-compute-separation}

计算-计算分离适用于 Scale 和 Enterprise 级别。

每个 ClickHouse Cloud 服务包括：
- 需要一组两个或更多 ClickHouse 节点（或副本），但是子服务可以是单个副本。
- 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点），这是您用来连接到服务的服务 URL（例如，`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。
- 一个对象存储文件夹，服务在其中存储所有数据和部分元数据：

:::note
与单个父服务不同，子单服务可以垂直扩展。
:::

<Image img={compute_1} size="md" alt="当前服务在 ClickHouse Cloud 中" />

<br />

_Fig. 1 - 当前服务在 ClickHouse Cloud 中_

计算-计算分离允许用户创建多个计算节点组，每个组都有自己的端点，使用相同的对象存储文件夹，因此，也使用相同的表、视图等。

每个计算节点组将有自己的端点，因此您可以选择用于工作负载的副本集合。您的某些工作负载可能只需一个小型副本，而其他工作负载可能需要完整的高可用性（HA）和数百 GB 的内存。计算-计算分离还允许您将读取操作与写入操作分开，以便它们不会相互干扰：

<Image img={compute_2} size="md" alt="ClickHouse Cloud 中的计算分离" />

<br />

_Fig. 2 - ClickHouse Cloud 中的计算分离_

可以创建额外的服务，与您现有的服务共享相同的数据，或者创建一个全新的设置，其中多个服务共享相同的数据。

## 什么是数据仓库？ {#what-is-a-warehouse}

在 ClickHouse Cloud 中，_数据仓库_ 是一组共享相同数据的服务。
每个数据仓库都有一个主服务（此服务是首先创建的）和一个或多个副服务。例如，在下面的截图中，您可以看到数据仓库 "DWH Prod" 具有两个服务：

- 主服务 `DWH Prod`
- 副服务 `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="包含主服务和副服务的数据仓库示例" background='white' />

<br />

_Fig. 3 - 数据仓库示例_

数据仓库中的所有服务共享相同的：

- 区域（例如，us-east1）
- 云服务提供商（AWS、GCP 或 Azure）
- ClickHouse 数据库版本

您可以按所属数据仓库对服务进行排序。

## 访问控制 {#access-controls}

### 数据库凭证 {#database-credentials}

因为在一个数据仓库中共享相同的表，因此它们也共享对其他服务的访问控制。这意味着在服务 1 中创建的所有数据库用户也将能够以相同的权限（对表、视图等的授权）使用服务 2，反之亦然。用户将为每个服务使用不同的端点，但将使用相同的用户名和密码。换句话说，_用户在处理相同存储的服务之间是共享的：_

<Image img={compute_3} size="md" alt="共享相同数据的服务之间的用户访问" />

<br />

_Fig. 4 - 用户 Alice 在服务 1 中创建，但她可以使用相同的凭证访问共享相同数据的所有服务_

### 网络访问控制 {#network-access-control}

限制特定服务被其他应用程序或随机用户使用通常非常有用。这可以通过使用网络限制来实现，类似于当前为常规服务配置的方式（在 ClickHouse Cloud 控制台中特定服务的服务选项卡中导航到 **设置**）。

您可以分别对每个服务应用 IP 过滤设置，这意味着您可以控制哪个应用程序可以访问哪个服务。这使您可以限制用户使用特定服务：

<Image img={compute_4} size="md" alt="网络访问控制设置"/>

<br />

_Fig. 5 - 由于网络设置，Alice 被限制访问服务 2_

### 只读与读写 {#read-vs-read-write}

有时，限制特定服务的写入访问并仅允许数据仓库中的子集服务写入会很有用。这可以在创建第二个及后续服务时完成（第一个服务应始终是读写的）：

<Image img={compute_5} size="lg" alt="数据仓库中的读写和只读服务"/>

<br />

_Fig. 6 - 数据仓库中的读写和只读服务_

:::note
1. 当前只读服务允许用户管理操作（创建、删除等）。此行为可能在未来发生变化。
2. 当前，可刷新物化视图在数据仓库中的所有服务上执行，包括只读服务。然而，这种行为将在未来发生变化，仅在 RW 服务上执行。
:::


## 扩展 {#scaling}

数据仓库中的每个服务可以根据您的工作负载进行调整，包括：
- 节点数量（副本）。主服务（数据仓库中首先创建的服务）应具有 2 个或更多节点。每个副服务可以有 1 个或多个节点。
- 节点的大小（副本）
- 服务是否应自动扩展
- 服务是否应在不活动时闲置（无法应用于组中的第一个服务 - 请参阅 **限制** 部分）

## 行为变化 {#changes-in-behavior}
一旦为服务启用计算-计算分离（至少创建了一个副服务），则使用 `default` 集群名称的 `clusterAllReplicas()` 函数调用将仅利用调用该函数的服务的副本。这意味着，如果有两个服务连接到同一个数据集，而且从服务 1 调用了 `clusterAllReplicas(default, system, processes)`，那么仅显示在服务 1 上运行的进程。如果需要，您仍然可以调用 `clusterAllReplicas('all_groups.default', system, processes)` 例如，以访问所有副本。

## 限制 {#limitations}

1. **主服务应始终处于启用状态，并且不应闲置（此限制将在 GA 后的某些时候删除）。** 在私有预览期间及 GA 后的一段时间内，主服务（通常是您希望通过添加其他服务进行扩展的现有服务）将始终处于启用状态，并且将禁用闲置设置。如果至少有一个副服务，则无法停止或闲置主服务。一旦所有副服务都被删除，您可以再次停止或闲置原始服务。

2. **有时无法隔离工作负载。** 尽管目标是为您提供将数据库工作负载相互隔离的选项，但可能存在特殊情况，其中一个服务中的工作负载会影响共享相同数据的另一个服务。这些情况相当少见，并且通常与 OLTP 类工作负载相关。

3. **所有读写服务正在进行后台合并操作。** 当向 ClickHouse 插入数据时，数据库首先将数据插入到某些临时分区中，然后在后台执行合并。这些合并可能消耗内存和 CPU 资源。当两个读写服务共享相同存储时，它们都在执行后台操作。这意味着在服务 1 中可能有一个 `INSERT` 查询，但合并操作是由服务 2 完成的。请注意，只读服务不执行后台合并，因此它们不会在该操作上消耗资源。

4. **一个读写服务中的插入可能会阻止另一个读写服务闲置（如果启用了闲置）。** 根据前一点，第二个服务为第一个服务执行后台合并操作。这些后台操作可能会阻止第二个服务在闲置时进入休眠状态。后台操作完成后，服务将被闲置。只读服务不受影响，并且会毫不延迟地被闲置。

5. **CREATE/RENAME/DROP DATABASE 查询可能会被默认情况下的闲置/停止服务阻塞。** 这些查询可能会挂起。为了解决这个问题，您可以在会话或每个查询级别使用 `settings distributed_ddl_task_timeout=0` 来运行数据库管理查询。例如：

```sql
create database db_test_ddl_single_query_setting
settings distributed_ddl_task_timeout=0
```

6. **在非常少见的情况下，已闲置或停止很长时间（天）的副服务可能会导致同一数据仓库中其他服务的性能下降。** 此问题将在不久后得到解决，与在后台运行的变更有关。如果您认为正在经历此问题，请联系 ClickHouse [支持](https://clickhouse.com/support/program)。

7. **目前每个数据仓库的服务数量软限制为 5。** 如果您需要在单个数据仓库中拥有超过 5 个服务，请联系支持团队。


## 定价 {#pricing}

计算价格在数据仓库中的所有服务（主服务和副服务）都是相同的。存储仅计费一次 - 它包含在第一个（原始）服务中。

## 备份 {#backups}

- 由于单个数据仓库中的所有服务共享相同的存储，因此只在主（初始）服务上进行备份。通过此，数据仓库中的所有服务的数据得到了备份。
- 如果您从数据仓库的主服务恢复备份，它将被恢复到一个完全新的服务，此服务不与现有数据仓库连接。您可以在恢复完成后立即向新服务添加更多服务。

## 使用数据仓库 {#using-warehouses}

### 创建数据仓库 {#creating-a-warehouse}

要创建数据仓库，您需要创建一个第二个服务，该服务将与现有服务共享数据。这可以通过单击任一现有服务上的加号进行：

<Image img={compute_7} size="md" alt="在数据仓库中创建新服务" border background='white' />

<br />

_Fig. 7 - 单击加号以在数据仓库中创建新服务_

在服务创建屏幕上，原始服务将在下拉列表中被选为新服务的数据源。一旦创建，这两个服务将形成一个数据仓库。

### 重命名数据仓库 {#renaming-a-warehouse}

有两种方法可以重命名数据仓库：

- 您可以在服务页面右上角选择“按数据仓库排序”，然后单击仓库名称旁边的铅笔图标
- 您可以单击任一服务上的数据仓库名称并在这里重命名

### 删除数据仓库 {#deleting-a-warehouse}

删除数据仓库意味着删除所有计算服务和数据（表、视图、用户等）。此操作无法撤消。
您只能通过删除第一个创建的服务来删除数据仓库。操作步骤如下：

1. 删除与第一个创建的服务一起创建的所有服务；
2. 删除第一个服务（警告：此步骤将删除所有数据仓库数据）。
