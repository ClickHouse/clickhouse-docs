---
'title': '数据仓库'
'slug': '/cloud/reference/warehouses'
'keywords':
- 'compute separation'
- 'cloud'
- 'architecture'
- 'compute-compute'
- 'warehouse'
- 'warehouses'
- 'hydra'
'description': 'ClickHouse Cloud 中的计算 - 计算分离'
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

计算-计算分离适用于 Scale 和 Enterprise 等级的服务。

每个 ClickHouse Cloud 服务包括：
- 需要一组两个或更多的 ClickHouse 节点（或副本），但子服务可以是单一副本。
- 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点），这是您用于连接到服务的服务 URL（例如，`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。
- 一个对象存储文件夹，服务将在其中存储所有数据和部分元数据：

:::note
子单一服务可以实现垂直扩展，而单一父服务则不行。
:::

<Image img={compute_1} size="md" alt="当前 ClickHouse Cloud 服务" />

<br />

_图 1 - 当前 ClickHouse Cloud 服务_

计算-计算分离允许用户创建多个计算节点组，每个组有自己的端点，使用同一个对象存储文件夹，因此，拥有相同的表、视图等。

每个计算节点组将拥有自己的端点，这样您可以选择用于工作负载的副本集。您的某些工作负载可能仅满足于一个小型副本，而其他工作负载可能需要完全高可用性 (HA) 和数百 GB 的内存。计算-计算分离还允许您将读取操作与写入操作分开，这样它们就不会相互干扰：

<Image img={compute_2} size="md" alt="ClickHouse Cloud 中的计算分离" />

<br />

_图 2 - ClickHouse Cloud 中的计算分离_

可以创建与现有服务共享相同数据的额外服务，或者创建一个完全新设置，其中多个服务共享相同数据。

## 什么是仓库？ {#what-is-a-warehouse}

在 ClickHouse Cloud 中，_仓库_ 是一组共享相同数据的服务。
每个仓库都有一个主服务（该服务是第一个创建的）和一个或多个辅助服务。例如，在下面的截图中，您可以看到一个名为 "DWH Prod" 的仓库，其中有两个服务：

- 主服务 `DWH Prod`
- 辅助服务 `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="主服务和辅助服务的仓库示例" background='white' />

<br />

_图 3 - 仓库示例_

仓库中的所有服务共享相同的：

- 区域（例如，us-east1）
- 云服务提供商（AWS、GCP 或 Azure）
- ClickHouse 数据库版本

您可以按所属仓库对服务进行排序。

## 访问控制 {#access-controls}

### 数据库凭证 {#database-credentials}

因为仓库中的所有服务共享相同的表集，所以它们也共享对其他服务的访问控制。这意味着在服务 1 中创建的所有数据库用户也将能够以相同的权限（针对表、视图等的授予）使用服务 2，反之亦然。用户将为每个服务使用另一个端点，但使用相同的用户名和密码。换句话说，_用户在使用相同存储的服务之间是共享的：_

<Image img={compute_3} size="md" alt="共享相同数据的服务之间的用户访问" />

<br />

_图 4 - 用户 Alice 在服务 1 中创建，但她可以使用相同的凭证访问所有共享相同数据的服务_

### 网络访问控制 {#network-access-control}

限制特定服务被其他应用程序或临时用户使用通常是很有用的。这可以通过建立网络限制来完成，类似于当前为常规服务配置的方式（在 ClickHouse Cloud 控制台中导航到特定服务的 **设置** 选项卡）。

您可以分别对每个服务应用 IP 过滤设置，这意味着您可以控制哪个应用程序可以访问哪个服务。这允许您限制用户使用特定服务：

<Image img={compute_4} size="md" alt="网络访问控制设置"/>

<br />

_图 5 - Alice 由于网络设置被限制访问服务 2_

### 只读与读写 {#read-vs-read-write}

有时限制特定服务的写入访问并只允许仓库中部分服务进行写入是有用的。在创建第二个和第 N 个服务时，可以做到这一点（第一个服务应始终为读写）：

<Image img={compute_5} size="lg" alt="仓库中的读写和只读服务"/>

<br />

_图 6 - 仓库中的读写和只读服务_

:::note
1. 只读服务当前允许用户管理操作（创建、删除等）。这种行为可能在未来发生变化。
2. 当前，可刷新的物化视图会在仓库中的所有服务上执行，包括只读服务。然而，这种行为在未来将会改变，它们将仅在 RW 服务上执行。
:::


## 扩展 {#scaling}

仓库中的每个服务都可以根据您的工作负载进行调整：
- 节点数量（副本）。主服务（仓库中第一个创建的服务）应有 2 个或更多节点。每个辅助服务可以有 1 个或多个节点。
- 节点（副本）的大小
- 服务是否应自动扩展
- 服务是否应在不活动时闲置（该设置不能应用于组中的第一个服务 - 请参见 **限制** 部分）

## 行为变化 {#changes-in-behavior}
一旦为服务启用计算-计算分离（至少创建了一个辅助服务），使用 `default` 集群名称的 `clusterAllReplicas()` 函数调用将仅利用从执行调用的服务中的副本。这意味着，如果有两个服务连接到同一数据集，并且从服务 1 调用 `clusterAllReplicas(default, system, processes)`，则仅会显示在服务 1 上运行的进程。如果需要，您仍然可以调用 `clusterAllReplicas('all_groups.default', system, processes)` 来访问所有副本。

## 限制 {#limitations}

1. **主服务应始终保持运行状态，且不应闲置（该限制将在 GA 后的一段时间内被取消）。** 在私人预览期间和 GA 后的一段时间内，主服务（通常是您希望通过添加其他服务来扩展的现有服务）将始终保持运行，并且闲置设置将被禁用。如果至少有一个辅助服务，则您将无法停止或闲置主服务。一旦所有辅助服务被移除，您可以再次停止或闲置原始服务。

2. **有时工作负载无法隔离。** 尽管目标是为您提供将数据库工作负载彼此隔离的选项，但也可能存在边缘情况，其中一个服务中的某个工作负载会影响共享相同数据的其他服务。这些情况相当少见，通常与 OLTP 类型的工作负载有关。

3. **所有读写服务都在进行后台合并操作。** 在 ClickHouse 中插入数据时，数据库首先将数据插入到某些暂存分区，然后在后台执行合并。这些合并可能会消耗内存和 CPU 资源。当两个读写服务共享相同的存储时，它们都在执行后台操作。这意味着可能出现某个查询在服务 1 中执行 INSERT，但合并操作却由服务 2 完成的情况。请注意，只有读写服务在执行后台合并，因此它们不会在此操作上消耗资源。

4. **在一个读写服务中的插入操作可能会阻止另一个读写服务闲置，如果闲置功能已启用。** 由于上一点，第二个服务对于第一个服务执行后台合并操作。这些后台操作可能会阻止第二个服务在闲置时进入休眠。一旦后台操作完成，该服务将被闲置。只读服务不受影响，将无延迟地进入闲置状态。

5. **CREATE/RENAME/DROP DATABASE 查询可能默认被闲置/停止的服务阻止。** 这些查询可能会挂起。为绕过此限制，您可以在会话或每个查询级别运行数据库管理查询，设置 `settings distributed_ddl_task_timeout=0`。例如：

```sql
create database db_test_ddl_single_query_setting
settings distributed_ddl_task_timeout=0
```

6. **在非常罕见的情况下，长时间（天）闲置或停止的辅助服务可能会导致同一仓库中的其他服务性能下降。** 此问题将尽快解决，并与在后台运行的变更相关。如果您认为自己遇到了此问题，请联系 ClickHouse [支持](https://clickhouse.com/support/program)。

7. **目前每个仓库的服务数目有一个软限制为 5。** 如果您需要在单个仓库中使用超过 5 个服务，请联系支持团队。


## 定价 {#pricing}

计算费用对仓库中的所有服务（主服务和辅助服务）都是相同的。存储仅按一次计费 - 它包含在第一个（原始）服务中。

## 备份 {#backups}

- 由于单个仓库中的所有服务共享相同的存储，因此备份仅在主（初始）服务上进行。通过这种方式，仓库中所有服务的数据都会被备份。
- 如果您从仓库的主服务恢复备份，将恢复到一个完全新的服务，而不是连接到现有的仓库。恢复完成后，您可以立即向新服务添加更多服务。

## 使用仓库 {#using-warehouses}

### 创建仓库 {#creating-a-warehouse}

要创建一个仓库，您需要创建一个第二个服务，该服务将与现有服务共享数据。可以通过点击任意现有服务上的加号来完成此操作：

<Image img={compute_7} size="md" alt="在仓库中创建新服务" border background='white' />

<br />

_图 7 - 点击加号以在仓库中创建新服务_

在服务创建屏幕上，原始服务将在下拉菜单中被选为新服务的数据源。创建后，这两个服务将形成一个仓库。

### 重命名仓库 {#renaming-a-warehouse}

重命名仓库有两种方式：

- 您可以在服务页面右上角选择“按仓库排序”，然后单击仓库名称旁边的铅笔图标
- 您可以在任何服务上单击仓库名称，然后在那里重命名仓库

### 删除仓库 {#deleting-a-warehouse}

删除仓库意味着删除所有计算服务和数据（表、视图、用户等）。此操作无法撤销。
您只能通过删除第一个创建的服务来删除仓库。为此：

1. 删除创建的所有服务（除了第一个创建的服务）；
2. 删除第一个服务（警告：在此步骤中，所有仓库数据将被删除）。
