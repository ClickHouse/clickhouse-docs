---
title: '计算仓库'
slug: /cloud/reference/warehouses
keywords: ['compute separation', 'cloud', 'architecture', 'compute-compute', 'warehouse', 'warehouses', 'hydra']
description: 'ClickHouse Cloud 中的计算与计算分离'
doc_type: 'reference'
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

计算-计算分离功能适用于 Scale 和 Enterprise 层级。

每个 ClickHouse Cloud 服务包括：

- 需要一组两个或更多 ClickHouse 节点（或副本），但子服务可以是单副本。
- 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点），即用于连接服务的服务 URL（例如 `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。
- 一个对象存储文件夹，服务在其中存储所有数据和部分元数据：

:::note
与单副本父服务不同，子单副本服务可以垂直扩展。
:::

<Image img={compute_1} size='md' alt='ClickHouse Cloud 中的当前服务' />

<br />

_图 1 - ClickHouse Cloud 中的当前服务_

计算-计算分离允许用户创建多个计算节点组，每个组都有自己的端点，它们使用相同的对象存储文件夹，因此具有相同的表、视图等。

每个计算节点组都有自己的端点，因此您可以选择为工作负载使用哪组副本。某些工作负载可能只需要一个小型副本即可满足，而其他工作负载可能需要完全高可用性（HA）和数百 GB 的内存。计算-计算分离还允许您将读操作与写操作分离，使它们不会相互干扰：

<Image img={compute_2} size='md' alt='ClickHouse Cloud 中的计算分离' />

<br />

_图 2 - ClickHouse Cloud 中的计算分离_

可以创建与现有服务共享相同数据的额外服务，或创建一个全新的设置，其中多个服务共享相同的数据。


## 什么是 warehouse？ {#what-is-a-warehouse}

在 ClickHouse Cloud 中，_warehouse_ 是一组共享相同数据的服务集合。
每个 warehouse 都有一个主服务（最先创建的服务）和一个或多个辅助服务。例如，在下面的截图中，您可以看到名为 "DWH Prod" 的 warehouse，包含两个服务：

- 主服务 `DWH Prod`
- 辅助服务 `DWH Prod Subservice`

<Image
  img={compute_8}
  size='lg'
  alt='包含主服务和辅助服务的 warehouse 示例'
  background='white'
/>

<br />

_图 3 - Warehouse 示例_

一个 warehouse 中的所有服务共享相同的：

- 区域（例如 us-east1）
- 云服务提供商（AWS、GCP 或 Azure）
- ClickHouse 数据库版本

您可以按服务所属的 warehouse 对服务进行排序。


## 访问控制 {#access-controls}

### 数据库凭证 {#database-credentials}

由于仓库中的所有服务共享同一组表,它们也共享对这些服务的访问控制。这意味着在服务 1 中创建的所有数据库用户也能够以相同的权限(表、视图等的授权)使用服务 2,反之亦然。用户将为每个服务使用不同的端点,但使用相同的用户名和密码。换句话说,_使用相同存储的服务之间共享用户:_

<Image
  img={compute_3}
  size='md'
  alt='共享相同数据的服务之间的用户访问'
/>

<br />

_图 4 - 用户 Alice 在服务 1 中创建,但她可以使用相同的凭证访问所有共享相同数据的服务_

### 网络访问控制 {#network-access-control}

限制特定服务被其他应用程序或临时用户使用通常很有用。这可以通过网络限制来实现,配置方式与当前常规服务的配置方式类似(在 ClickHouse Cloud 控制台中导航到特定服务的服务选项卡中的**设置**)。

您可以为每个服务单独应用 IP 过滤设置,这意味着您可以控制哪个应用程序可以访问哪个服务。这允许您限制用户使用特定服务:

<Image img={compute_4} size='md' alt='网络访问控制设置' />

<br />

_图 5 - 由于网络设置,Alice 被限制访问服务 2_

### 只读与读写 {#read-vs-read-write}

有时限制对特定服务的写入访问并仅允许仓库中的部分服务进行写入是很有用的。这可以在创建第二个及后续服务时完成(第一个服务应始终为读写模式):

<Image
  img={compute_5}
  size='lg'
  alt='仓库中的读写和只读服务'
/>

<br />

_图 6 - 仓库中的读写和只读服务_

:::note

1. 只读服务当前允许用户管理操作(创建、删除等)。此行为将来可能会更改。
2. 当前,可刷新物化视图在仓库中的所有服务上执行,包括只读服务。但是,此行为将来会更改,它们将仅在读写服务上执行。
   :::


## 扩展 {#scaling}

仓库中的每个服务都可以根据工作负载进行调整，调整维度包括：

- 节点数量（副本）。主服务（仓库中首先创建的服务）应具有 2 个或更多节点。每个辅助服务可以具有 1 个或更多节点。
- 节点大小（副本）
- 服务是否应自动扩展
- 服务在不活动时是否应进入空闲状态（不能应用于组中的第一个服务 - 请参阅**限制**部分）


## 行为变更 {#changes-in-behavior}

一旦为服务启用了计算-计算功能(至少创建了一个辅助服务),使用 `default` 集群名称调用 `clusterAllReplicas()` 函数时,将仅使用调用该函数所在服务的副本。这意味着,如果有两个服务连接到同一数据集,并且从服务 1 调用 `clusterAllReplicas(default, system, processes)`,则只会显示服务 1 上运行的进程。如有需要,您仍然可以调用 `clusterAllReplicas('all_groups.default', system, processes)` 来访问所有副本。


## 限制 {#limitations}

1. **主服务必须始终保持运行且不能进入空闲状态(此限制将在正式发布后的某个时间移除)。** 在私有预览期间以及正式发布后的一段时间内,主服务(通常是您希望通过添加其他服务来扩展的现有服务)将始终保持运行状态,并且空闲设置将被禁用。如果至少存在一个辅助服务,您将无法停止主服务或使其进入空闲状态。一旦移除所有辅助服务,您就可以再次停止原始服务或使其进入空闲状态。

2. **有时工作负载无法隔离。** 尽管目标是为您提供将数据库工作负载相互隔离的选项,但在某些边界情况下,一个服务中的工作负载可能会影响共享相同数据的另一个服务。这些情况相当罕见,主要与类 OLTP 工作负载有关。

3. **所有读写服务都会执行后台合并操作。** 向 ClickHouse 插入数据时,数据库首先将数据插入到一些暂存分区中,然后在后台执行合并。这些合并操作会消耗内存和 CPU 资源。当两个读写服务共享相同的存储时,它们都会执行后台操作。这意味着可能会出现这样的情况:在服务 1 中执行 `INSERT` 查询,但合并操作由服务 2 完成。请注意,只读服务不执行后台合并,因此不会在此操作上消耗资源。

4. **所有读写服务都会执行 S3Queue 表引擎插入操作。** 在读写服务上创建 S3Queue 表时,仓库中的所有其他读写服务都可能执行从 S3 读取数据并将数据写入数据库的操作。

5. **如果启用了空闲功能,一个读写服务中的插入操作可能会阻止另一个读写服务进入空闲状态。** 因此,第二个服务会为第一个服务执行后台合并操作。这些后台操作可能会阻止第二个服务在空闲时进入休眠状态。一旦后台操作完成,该服务将进入空闲状态。只读服务不受影响,将立即进入空闲状态。

6. **默认情况下,CREATE/RENAME/DROP DATABASE 查询可能会被空闲/停止的服务阻塞。** 这些查询可能会挂起。要绕过此问题,您可以在会话级别或单个查询级别使用 `settings distributed_ddl_task_timeout=0` 运行数据库管理查询。例如:

```sql
CREATE DATABASE db_test_ddl_single_query_setting
SETTINGS distributed_ddl_task_timeout=0
```

7. **目前每个仓库的软限制为 5 个服务。** 如果您在单个仓库中需要超过 5 个服务,请联系支持团队。


## 定价 {#pricing}

仓库中所有服务(主服务和辅助服务)的计算价格相同。存储费用仅计费一次,包含在首个(原始)服务中。

请参考[定价](https://clickhouse.com/pricing)页面上的定价计算器,根据您的工作负载规模和层级选择来估算成本。


## 备份 {#backups}

- 由于单个仓库中的所有服务共享相同的存储，备份仅在主服务（初始服务）上执行。这样，仓库中所有服务的数据都会被备份。
- 如果从仓库的主服务恢复备份，数据将被恢复到一个全新的服务中，该服务不会连接到现有仓库。恢复完成后，您可以立即向新服务添加更多服务。


## 使用仓库 {#using-warehouses}

### 创建仓库 {#creating-a-warehouse}

要创建仓库,您需要创建第二个服务与现有服务共享数据。可以通过点击任何现有服务上的加号来完成此操作:

<Image
  img={compute_7}
  size='md'
  alt='在仓库中创建新服务'
  border
  background='white'
/>

<br />

_图 7 - 点击加号在仓库中创建新服务_

在服务创建页面上,原始服务将在下拉菜单中被选中作为新服务的数据源。创建完成后,这两个服务将组成一个仓库。

### 重命名仓库 {#renaming-a-warehouse}

有两种方式可以重命名仓库:

- 您可以在服务页面右上角选择"按仓库排序",然后点击仓库名称旁边的铅笔图标
- 您可以点击任何服务上的仓库名称,并在那里重命名仓库

### 删除仓库 {#deleting-a-warehouse}

删除仓库意味着删除所有计算服务和数据(表、视图、用户等)。此操作无法撤销。
您只能通过删除首次创建的服务来删除仓库。具体操作如下:

1. 删除除首次创建的服务之外的所有其他服务;
2. 删除首次创建的服务(警告:此步骤将删除仓库的所有数据)。
