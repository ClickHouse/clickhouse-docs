---
title: '仓库'
slug: /cloud/reference/warehouses
keywords: ['计算分离', '云', '架构', '计算-计算分离', '仓库', '仓库', 'hydra']
description: 'ClickHouse Cloud 中的计算-计算分离架构'
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


# 仓库 {#warehouses}

## 什么是计算-计算分离？ {#what-is-compute-compute-separation}

计算-计算分离适用于 Scale 和 Enterprise 层级。

每个 ClickHouse Cloud 服务包括：
- 一个由两个或更多 ClickHouse 节点（或副本）组成的节点组（必需），但子服务可以是单副本。
- 一个端点（或通过 ClickHouse Cloud UI 控制台创建的多个端点），即你用来连接到服务的服务 URL（例如：`https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。
- 一个对象存储目录，服务会在其中存储所有数据以及部分元数据：

:::note
单副本子服务可以进行纵向扩展，而单副本父服务则不支持。
:::

<Image img={compute_1} size="md" alt="ClickHouse Cloud 中的当前服务" />

<br />

_图 1 - ClickHouse Cloud 中的当前服务_

计算-计算分离允许用户创建多个计算节点组，每个节点组都有自己的端点，并使用相同的对象存储目录，因此共享相同的表、视图等。

每个计算节点组都会有自己的端点，因此你可以针对各类工作负载选择要使用的副本集合。某些工作负载可能只需要一个小规格的副本即可满足需求，而其他工作负载可能需要完整的高可用性（HA）以及数百 GB 内存。计算-计算分离还允许你将读操作与写操作分离，使它们互不干扰：

<Image img={compute_2} size="md" alt="ClickHouse Cloud 中的计算分离" />

<br />

_图 2 - ClickHouse Cloud 中的计算分离_

你可以创建与现有服务共享同一数据的额外服务，或者从零开始创建一个包含多个共享同一数据的服务的新部署。

## 什么是仓库？ {#what-is-a-warehouse}

在 ClickHouse Cloud 中，_仓库（warehouse）_ 是共享同一数据的一组服务。
每个仓库都有一个主服务（最先创建的服务）和一个或多个次级服务。例如，在下面的截图中，您可以看到一个名为 "DWH Prod" 的仓库，其中包含两个服务：

- 主服务 `DWH Prod`
- 次级服务 `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="包含主服务和次级服务的仓库示例" background='white' />

<br />

_图 3 - 仓库示例_

同一仓库中的所有服务共享以下内容：

- 区域（例如，us-east1）
- 云服务提供商（AWS、GCP 或 Azure）
- ClickHouse 数据库版本

您可以按照所属的仓库对服务进行排序。

## 访问控制 {#access-controls}

### 数据库凭证 {#database-credentials}

由于同一仓库中的所有服务共享同一组表，它们也共享对这些服务的访问控制。这意味着，在 Service 1 中创建的所有数据库用户，也能够以相同的权限（对表、视图等的授权）使用 Service 2，反之亦然。用户会为每个服务使用不同的访问端点（endpoint），但会使用相同的用户名和密码。换句话说，_在使用同一存储的服务之间，用户是共享的：_

<Image img={compute_3} size="md" alt="在共享同一数据的服务之间进行用户访问" />

<br />

_图 4 - 用户 Alice 在 Service 1 中创建，但她可以使用相同的凭证访问所有共享同一数据的服务_

### 网络访问控制 {#network-access-control}

通常需要限制特定服务被其他应用或临时用户使用。可以通过网络限制来实现这一点，方式类似于目前为常规服务所进行的配置（在 ClickHouse Cloud 控制台中，进入指定服务的服务页，在 **Settings** 中进行配置）。

你可以分别为每个服务设置 IP 过滤，这意味着你可以控制哪个应用可以访问哪个服务。这样就可以限制用户使用特定服务：

<Image img={compute_4} size="md" alt="网络访问控制设置"/>

<br />

_图 5 - 由于网络设置，Alice 被限制访问 Service 2_

### 只读 vs 读写 {#read-vs-read-write}

有时需要将写入权限限制到某个特定服务，只允许仓库中一部分服务执行写入操作。这可以在创建第二个及其后的服务时进行设置（第一个服务应始终为读写）：

<Image img={compute_5} size="lg" alt="仓库中的读写服务和只读服务"/>

<br />

_图 6 - 仓库中的读写服务和只读服务_

:::note
1. 只读服务当前仍然允许执行用户管理操作（create、drop 等）。此行为未来可能会发生变化。
2. 可刷新materialized view **仅**在仓库中的读写（RW）服务上运行，**不会**在只读（RO）服务上执行。
:::

## 扩展 {#scaling}

仓库中的每个服务都可以根据您的工作负载在以下方面进行调整：
- 节点（副本）数量。主服务（在该仓库中首先创建的服务）应具有 2 个或更多节点。每个次级服务可以有 1 个或更多节点。
- 节点（副本）规格
- 服务是否应自动扩展
- 服务在空闲时是否应被停用（不适用于组中的第一个服务——请参阅 **限制** 部分）

## 行为变化 {#changes-in-behavior}

一旦为某个服务启用了 compute-compute（已创建至少一个次级服务），使用 `default` 集群名称调用 `clusterAllReplicas()` 函数时，将只会使用调用该函数的服务中的副本。也就是说，如果有两个服务连接到同一数据集，并且从服务 1 调用了 `clusterAllReplicas(default, system, processes)`，则只会显示运行在服务 1 上的进程。如有需要，仍然可以调用 `clusterAllReplicas('all_groups.default', system, processes)` 来访问所有副本。

## 限制 {#limitations}

1. **主服务必须始终保持运行且不能被休眠（该限制会在 GA 正式发布后的一段时间内移除）。** 在私有预览期间以及 GA 之后的一段时间内，主服务（通常是你希望通过添加其他服务来扩展的现有服务）必须始终保持运行，并且会禁用休眠设置。如果至少存在一个次级服务，你将无法停止或休眠主服务。一旦所有次级服务都被移除，你就可以再次停止或休眠原始服务。

2. **有时工作负载无法完全隔离。** 尽管目标是为你提供将数据库工作负载彼此隔离的能力，但在某些边缘场景下，一个服务中的工作负载仍然可能会影响到共享同一数据的另一个服务。这类情况较为罕见，多数与类似 OLTP 的工作负载相关。

3. **所有读写服务都会执行后台合并操作。** 当向 ClickHouse 插入数据时，数据库首先会将数据插入到某些临时分区中，然后在后台执行合并。这些合并操作会消耗内存和 CPU 资源。当两个读写服务共享同一存储时，它们都会执行后台操作。这意味着可能会出现这样的情况：在服务 1 中执行了 `INSERT` 查询，但合并操作由服务 2 完成。请注意，只读服务不会执行后台合并，因此它们不会在此操作上消耗自身资源。

4. **所有读写服务都会执行 S3Queue 表引擎的插入操作。** 当在一个读写（RW）服务上创建 S3Queue 表时，同一工作区（WH）中的其他 RW 服务也可能会从 S3 读取数据并将其写入数据库。

5. **在一个读写服务中的插入操作可能会阻止另一个读写服务进入休眠（当启用休眠时）。** 结果是，第二个服务会为第一个服务执行后台合并操作。这些后台操作可能会阻止第二个服务进入休眠。一旦后台操作完成，该服务就会进入休眠。只读服务不受影响，并且会立即进入休眠。

6. **默认情况下，CREATE/RENAME/DROP DATABASE 查询可能会被处于休眠或停止状态的服务阻塞。** 这些查询可能会挂起。为绕过这一点，你可以在会话级别或单条查询级别使用 `settings distributed_ddl_task_timeout=0` 来运行数据库管理查询。例如：

```sql
CREATE DATABASE db_test_ddl_single_query_setting
SETTINGS distributed_ddl_task_timeout=0
```

7. **当前每个 warehouse 最多支持 5 个服务（软限制）。** 如需在单个 warehouse 中配置超过 5 个服务，请联系支持团队。


## 定价 {#pricing}

在同一个仓库（主服务和次服务）中，所有服务的计算费用相同。存储费用只计费一次——包含在第一个（原始）服务中。

请参阅 [定价](https://clickhouse.com/pricing) 页面上的价格计算器，它可以根据您的工作负载大小和所选级别帮助估算成本。

## 备份 {#backups}

- 由于同一仓库中的所有服务共享同一存储，因此只在主（初始）服务上执行备份。通过这种方式，可以备份该仓库中所有服务的数据。
- 如果你从某个仓库的主服务还原备份，该备份会被还原到一个全新的服务，而不是还原到与现有仓库关联的服务上。还原完成后，你可以立即为这个新服务添加更多服务。

## 使用仓库 {#using-warehouses}

### 创建仓库 {#creating-a-warehouse}

要创建一个仓库，需要创建第二个服务，以与现有服务共享数据。可以通过单击任一现有服务上的加号来完成此操作：

<Image img={compute_7} size="md" alt="在仓库中创建新服务" border background='white' />

<br />

_图 7 - 单击加号以在仓库中创建新服务_

在服务创建界面中，原始服务会在下拉列表中被选为新服务的数据来源。创建完成后，这两个服务将共同组成一个仓库。

### 重命名仓库 {#renaming-a-warehouse}

重命名仓库有两种方法：

- 在服务页面右上角选择“Sort by warehouse”，然后点击仓库名称旁边的铅笔图标；
- 点击任一服务上的仓库名称，并在弹出的界面中重命名仓库。

### 删除仓库 {#deleting-a-warehouse}

删除仓库意味着删除所有计算服务以及其中的数据（表、视图、用户等）。此操作无法撤销。
只能通过删除第一个创建的服务来删除一个仓库。执行步骤如下：

1. 删除除最先创建的服务之外的所有后续创建的服务；
2. 删除第一个服务（警告：在此步骤中将删除该仓库的所有数据）。