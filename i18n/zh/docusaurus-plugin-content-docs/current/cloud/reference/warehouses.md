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
'description': 'ClickHouse Cloud中的计算-计算分离'
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

## 计算-计算分离是什么？ {#what-is-compute-compute-separation}

计算-计算分离适用于 Scale 和 Enterprise 级别。

每个 ClickHouse Cloud 服务包括：
- 需要一组两个或更多 ClickHouse 节点（或副本），但子服务可以是单个副本。
- 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点），这是连接到服务的服务 URL（例如，`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。
- 一个对象存储文件夹，服务在其中存储所有数据和部分元数据：

:::note
子单服务可以垂直扩展，不同于单父服务。
:::

<Image img={compute_1} size="md" alt="当前在 ClickHouse Cloud 的服务" />

<br />

_Fig. 1 - 当前在 ClickHouse Cloud 的服务_

计算-计算分离允许用户创建多个计算节点组，每个节点组都有自己的端点，使用相同的对象存储文件夹，因此拥有相同的表、视图等。

每个计算节点组将有其自己的端点，因此您可以选择用于工作负载的副本集。您的某些工作负载可能只需要一个小型副本，而其他工作负载可能需要完整的高可用性（HA）和数百GB的内存。计算-计算分离还允许您将读操作与写操作分开，以便它们不会相互干扰：

<Image img={compute_2} size="md" alt="ClickHouse Cloud 中的计算分离" />

<br />

_Fig. 2 - ClickHouse Cloud 中的计算分离_

可以创建额外的服务，与现有服务共享相同的数据，或者创建一个完全新的设置，其中多个服务共享相同的数据。

## 什么是仓库？ {#what-is-a-warehouse}

在 ClickHouse Cloud 中，一个 _仓库_ 是一组共享相同数据的服务。
每个仓库都有一个主服务（这个服务是第一个创建的）和一个或多个副服务。例如，在下面的截图中，您可以看到名为 "DWH Prod" 的仓库，其中有两个服务：

- 主服务 `DWH Prod`
- 副服务 `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="带有主服务和副服务的仓库示例" background='white' />

<br />

_Fig. 3 - 仓库示例_

仓库中的所有服务共享相同的：

- 区域（例如，us-east1）
- 云服务提供商（AWS、GCP 或 Azure）
- ClickHouse 数据库版本

您可以按它们所属的仓库对服务进行排序。

## 访问控制 {#access-controls}

### 数据库凭据 {#database-credentials}

因为仓库中的所有服务共享相同的表集合，所以它们也共享对其他服务的访问控制。这意味着在服务 1 中创建的所有数据库用户也可以使用服务 2，享有相同的权限（对表、视图等的授权），反之亦然。用户将为每个服务使用不同的端点，但将使用相同的用户名和密码。换句话说，_用户在与相同存储工作时是在服务间共享的：_

<Image img={compute_3} size="md" alt="共享相同数据的服务之间的用户访问" />

<br />

_Fig. 4 - 用户 Alice 在服务 1 中创建，但她可以使用相同的凭据访问所有共享相同数据的服务_

### 网络访问控制 {#network-access-control}

通常，限制特定服务被其他应用程序或临时用户使用是非常有用的。可以通过使用网络限制来完成这一点，类似于当前为常规服务配置的方式（在 ClickHouse Cloud 控制台中特定服务的 **设置** 中导航）。

您可以单独对每个服务应用 IP 过滤设置，这意味着您可以控制哪个应用程序可以访问哪个服务。这允许您限制用户使用特定服务：

<Image img={compute_4} size="md" alt="网络访问控制设置"/>

<br />

_Fig. 5 - Alice 因网络设置被限制访问服务 2_

### 只读与可读写 {#read-vs-read-write}

有时，限制特定服务的写入访问并仅允许一个仓库中的某些服务写入是很有用的。这可以在创建第二个及后续服务时完成（第一个服务应始终是可读可写的）：

<Image img={compute_5} size="lg" alt="仓库中的可读写和只读服务"/>

<br />

_Fig. 6 - 仓库中的可读写和只读服务_

:::note
1. 当前，只读服务允许用户管理操作（创建、删除等）。这种行为可能会在未来发生变化。
2. 目前，可刷新的物化视图在仓库中的所有服务上执行，包括只读服务。然而，将来这种行为将会改变，它们将仅在 RW 服务上执行。
:::


## 扩展 {#scaling}

仓库中的每个服务可以根据您的工作负载进行调整：
- 节点数（副本）。主服务（在仓库中首先创建的服务）应具有两个或更多节点。每个副服务可以有一个或多个节点。
- 节点（副本）的大小
- 服务是否应自动扩展
- 服务是否应在不活动时闲置（不能应用于组中的第一个服务 - 请参见 **限制** 部分）

## 行为变化 {#changes-in-behavior}
一旦为服务启用计算-计算（至少创建了一个副服务），则对 `default` 集群名称的 `clusterAllReplicas()` 函数调用将仅利用调用该函数的服务中的副本。这意味着，如果有两个服务连接到同一个数据集，并且从服务 1 调用 `clusterAllReplicas(default, system, processes)`，则仅会显示在服务 1 上运行的进程。如果需要，您仍然可以调用 `clusterAllReplicas('all_groups.default', system, processes)` 例如以访问所有副本。

## 限制 {#limitations}

1. **主服务应始终处于运行状态，且不能闲置（限制将在 GA 之后的某个时间移除）。** 在私有预览期间以及 GA 后的一段时间，主服务（通常是您希望通过添加其他服务进行扩展的现有服务）将始终处于运行状态，并禁用闲置设置。如果至少存在一个副服务，您将无法停止或闲置主服务。一旦所有副服务被移除，您可以再次停止或闲置原始服务。

2. **有时候工作负载无法隔离。** 尽管目标是为您提供将数据库工作负载彼此隔离的选项，但在某些极端情况下，一个服务中的工作负载可能会影响共享相同数据的另一个服务。这种情况非常少见，大多数与 OLTP 类似的工作负载有关。

3. **所有可读写服务都在执行后台合并操作。** 当将数据插入 ClickHouse 时，数据库首先将数据插入某些暂存分区，然后在后台执行合并。这些合并可能消耗内存和 CPU 资源。当两个可读写服务共享相同的存储时，它们都在执行后台操作。这意味着可能出现 Service 1 中有一个 `INSERT` 查询，但合并操作由 Service 2 完成的情况。请注意，只有只读服务不会执行后台合并，因此不会在此操作上消耗其资源。

4. **一个可读写服务中的插入可能会阻止另一个可读写服务闲置（如果已启用闲置）。** 由于前一点，第二个服务为第一个服务执行后台合并操作。这些后台操作可能会阻止第二个服务在闲置时进入休眠状态。一旦后台操作完成，服务将被闲置。只读服务不受影响，并将毫不延迟地闲置。

5. **CREATE/RENAME/DROP DATABASE 查询可能默认会被闲置/停止的服务阻塞。** 这些查询可能会挂起。为绕过此问题，您可以以会话或每个查询级别运行数据库管理查询，方法是设置 `settings distributed_ddl_task_timeout=0`。例如：

```sql
create database db_test_ddl_single_query_setting
settings distributed_ddl_task_timeout=0
```

6. **在极少数情况下，闲置或停止超过一段时间（天）的副服务可能会导致同一仓库中其他服务的性能下降。** 此问题将很快得到解决，与后台执行的变更有关。如果您认为您正在经历此问题，请联系 ClickHouse [支持](https://clickhouse.com/support/program)。

7. **目前，每个仓库的服务数的软限制为 5 个。** 如果您需要在单个仓库中使用超过 5 个服务，请联系支持团队。


## 定价 {#pricing}

计算价格在仓库中的所有服务（主服务和副服务）中都是相同的。存储仅按一次计费 - 它包含在第一个（原始）服务中。

## 备份 {#backups}

- 由于单个仓库中的所有服务共享相同的存储，因此备份仅在主（初始）服务上进行。通过这种方式，可以备份仓库中所有服务的数据。
- 如果您从仓库的主服务恢复备份，它将被恢复到一个完全新的服务，而不是连接到现有仓库。您可以在恢复完成后立即向新服务添加更多服务。

## 使用仓库 {#using-warehouses}

### 创建仓库 {#creating-a-warehouse}

要创建一个仓库，您需要创建一个第二个服务，该服务将与现有服务共享数据。这可以通过单击任何现有服务上的加号来完成：

<Image img={compute_7} size="md" alt="在仓库中创建新服务" border background='white' />

<br />

_Fig. 7 - 单击加号以在仓库中创建新服务_

在服务创建屏幕上，会在下拉菜单中选择原始服务作为新服务数据的来源。一旦创建，这两个服务将形成一个仓库。

### 重命名仓库 {#renaming-a-warehouse}

有两种方法可以重命名仓库：

- 您可以在服务页面右上角选择 "按仓库排序"，然后单击仓库名称旁的铅笔图标
- 您可以单击任何服务上的仓库名称，并在那条重命名仓库

### 删除仓库 {#deleting-a-warehouse}

删除仓库意味着删除所有计算服务和数据（表、视图、用户等）。此操作无法撤消。
您只能通过删除第一个创建的服务来删除仓库。为此：

1. 删除所有在第一个创建服务后创建的额外服务；
2. 删除第一个服务（警告：在此步骤中将删除所有仓库的数据）。
