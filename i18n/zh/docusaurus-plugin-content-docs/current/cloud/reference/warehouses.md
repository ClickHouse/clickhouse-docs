---
title: 仓库
slug: /cloud/reference/warehouses
keywords: [计算分离, 云, 架构, 计算-计算, 仓库, 仓库, hydra]
description: ClickHouse Cloud中的计算-计算分离
---

import compute_1 from '@site/static/images/cloud/reference/compute-compute-1.png';
import compute_2 from '@site/static/images/cloud/reference/compute-compute-2.png';
import compute_3 from '@site/static/images/cloud/reference/compute-compute-3.png';
import compute_4 from '@site/static/images/cloud/reference/compute-compute-4.png';
import compute_5 from '@site/static/images/cloud/reference/compute-compute-5.png';
import compute_7 from '@site/static/images/cloud/reference/compute-compute-7.png';
import compute_8 from '@site/static/images/cloud/reference/compute-compute-8.png';


# 仓库

## 什么是计算-计算分离？ {#what-is-compute-compute-separation}

计算-计算分离适用于Scale和Enterprise级别。

每个ClickHouse Cloud服务包括：
- 需要一个由两个或多个ClickHouse节点（或副本）组成的组，但子服务可以是单副本。
- 一个端点（或通过ClickHouse Cloud UI控制台创建的多个端点），这是您用来连接到该服务的服务URL（例如， `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`）。
- 一个对象存储文件夹，服务在其中存储所有数据和部分元数据：

:::note
子单一服务可以像单一父服务那样垂直扩展。
:::

<br />

<img src={compute_1}
    alt='NEEDS ALT'
    class='image'
    style={{width: '200px'}}
/>

<br />

_Fig. 1 - 当前在ClickHouse Cloud中的服务_

计算-计算分离允许用户创建多个计算节点组，每个组都有其自己的端点，使用相同的对象存储文件夹，因此拥有相同的表、视图等。

每个计算节点组将拥有其自己的端点，因此您可以选择用于您的工作负载的副本集。您的某些工作负载可能只需一个小型副本，而其他工作负载可能需要完整的高可用性（HA）和数百GB的内存。计算-计算分离还允许您将读取操作与写入操作分开，以便它们不会相互干扰：

<br />

<img src={compute_2}
    alt='NEEDS ALT'
    class='image'
    style={{width: '500px'}}
/>

<br />

_Fig. 2 - 计算ClickHouse Cloud_

在此私有预览程序中，您将能够创建共享相同数据的额外服务，或者创建一个完全新的设置，使多个服务共享相同的数据。

## 什么是仓库？ {#what-is-a-warehouse}

在ClickHouse Cloud中，_仓库_是一组共享相同数据的服务。
每个仓库都有一个主服务（此服务是首先创建的）和次服务。例如，在下面的截图中，您可以看到一个名为"DWH Prod"的仓库，具有两个服务：

- 主服务 `DWH Prod`
- 次服务 `DWH Prod Subservice`

<br />

<img src={compute_8}
    alt='NEEDS ALT'
    class='image'
    style={{width: '800px'}}
/>

<br />

_Fig. 3 - 仓库示例_

仓库中的所有服务共享以下内容：

- 区域（例如，us-east1）
- 云服务提供商（AWS、GCP或Azure）
- ClickHouse数据库版本

您可以按仓库对服务进行排序。

## 访问控制 {#access-controls}

### 数据库凭据 {#database-credentials}

因为仓库中的所有服务共享相同的表集，因此它们也共享对其他服务的访问控制。这意味着，在服务1中创建的所有数据库用户也将能够在服务2中以相同的权限（对表、视图等的授权）使用，并且反之亦然。用户将为每个服务使用另一个端点，但将使用相同的用户名和密码。换句话说，_用户是在处理相同存储的服务之间共享的：_

<br />

<img src={compute_3}
    alt='NEEDS ALT'
    class='image'
    style={{width: '500px'}}
/>

<br />

_Fig. 4 - 用户Alice在服务1中被创建，但她可以使用相同的凭据访问所有共享相同数据的服务_

### 网络访问控制 {#network-access-control}

通常情况下，限制特定服务被其他应用程序或临时用户使用是非常有用的。这可以通过使用网络限制来实现，类似于当前对常规服务的配置（在ClickHouse Cloud控制台中，导航到特定服务的**设置**选项卡）。

您可以单独对每个服务应用IP过滤设置，这意味着您可以控制哪个应用程序可以访问哪个服务。这使您能够限制用户使用特定服务：

<br />

<img src={compute_4}
    alt='NEEDS ALT'
    class='image'
    style={{width: '400px'}}
/>

<br />

_Fig. 5 - 因网络设置，Alice被限制访问服务2_

### 只读与读写 {#read-vs-read-write}

有时限制对特定服务的写入访问并允许仅通过仓库中的子集服务进行写入是非常有用的。在创建第二个和第n个服务时可以做到这一点（第一个服务应该始终是读写的）：

<br />

<img src={compute_5}
    alt='NEEDS ALT'
    class='image'
    style={{width: '400px'}}
/>

<br />

_Fig. 6 - 仓库中的读写和只读服务_

:::note
只读服务当前允许用户管理操作（创建、删除等）。这种行为在未来可能会发生变化。
:::


## 扩展 {#scaling}

仓库中的每个服务可以根据您的工作负载进行调整，包括：
- 节点数量（副本）。主服务（在仓库中首先创建的服务）应具有2个或更多节点。每个次服务可以具有1个或更多节点。
- 节点（副本）的大小
- 服务是否应自动扩展
- 服务是否应在不活动时闲置（无法应用于组中的第一个服务 - 请参见**限制**部分）

## 行为变化 {#changes-in-behavior}
一旦为服务启用了计算-计算（至少创建了一个次服务），然后带有`default`集群名称的`clusterAllReplicas()`函数调用将仅利用被调用的服务中的副本。这意味着，如果有两个服务连接到相同的数据集，并且在服务1中调用`clusterAllReplicas(default, system, processes)`，则仅会显示在服务1上运行的进程。如果需要，您仍然可以调用例如`clusterAllReplicas('all_groups.default', system, processes)`以访问所有副本。

## 限制 {#limitations}

由于此计算-计算分离目前处于私有预览阶段，使用此功能存在一些限制。大多数限制将在功能发布到GA（一般可用性）后被移除：

1. **主服务应始终处于运行状态，且不得闲置（这一限制将在GA后的一段时间内被移除）。** 在私有预览期间以及GA后的短时间内，主服务（通常是您希望通过添加其他服务来扩展的现有服务）将始终处于运行状态，并禁用闲置设置。如果至少有一个次服务，您将无法停止或闲置主服务。一旦所有次服务都被移除，您可以再次停止或闲置原始服务。

2. **有时不能隔离工作负载。** 虽然目标是为您提供将数据库工作负载相互隔离的选项，但可能会出现特殊情况，其中一个服务中的工作负载会影响共享相同数据的另一个服务。这种情况相对较少，主要与OLTP类工作负载有关。

3. **所有读写服务都在进行后台合并操作。** 将数据插入ClickHouse时，数据库首先将数据插入某些临时分区，然后在后台执行合并操作。这些合并可能会消耗内存和CPU资源。当两个读写服务共享相同存储时，它们都在执行后台操作。这意味着可能存在这种情况，即服务1中的`INSERT`查询，但合并操作是由服务2完成的。请注意，只读服务不会执行后台合并，因此不会消耗其资源用于此操作。

4. **一个读写服务中的插入可能会阻止另一个读写服务闲置（如果启用了闲置）。** 由于前一点，第二个服务为第一个服务执行后台合并操作。这些后台操作可能会阻止第二个服务在闲置时进入休眠状态。一旦后台操作完成，服务将被闲置。只读服务不受影响，并将毫不延迟地闲置。

5. **CREATE/RENAME/DROP DATABASE查询可能会被闲置/停止的服务默认阻塞。** 这些查询可能会挂起。要绕过这一点，您可以以会话或每个查询级别运行数据库管理查询，设置`settings distributed_ddl_task_timeout=0`。例如：

```sql
create database db_test_ddl_single_query_setting
settings distributed_ddl_task_timeout=0
```

6. **在非常少数的情况下，长时间（数天）闲置或停止的次服务可能会导致同一仓库中的其他服务性能下降。** 此问题将很快得到解决，涉及后台运行的突变。如果您认为您正在经历此问题，请联系ClickHouse [支持](https://clickhouse.com/support/program)。

## 计费 {#pricing}

在私有预览期间创建的额外服务的收费与常规相同。所有仓库中的服务（主服务和次服务）的计算价格相同。存储仅收取一次费用 - 它包含在第一个（原始）服务中。

## 备份 {#backups}

- 由于单个仓库中的所有服务共享相同的存储，备份仅在主（初始）服务上进行。通过这种方式，仓库中的所有服务的数据都得到了备份。
- 如果您从仓库的主服务恢复备份，它将被恢复到一个完全新的服务，而不是与现有仓库关联。然后，您可以在恢复完成后立即向新服务添加更多服务。

## 使用仓库 {#using-warehouses}

### 创建仓库 {#creating-a-warehouse}

要创建一个仓库，您需要创建一个第二个服务，以与现有服务共享数据。这可以通过单击任何现有服务上的加号来完成：

<br />

<img src={compute_7}
    alt='NEEDS ALT'
    class='image'
    style={{width: '800px'}}
/>

<br />

_Fig. 7 - 点击加号在仓库中创建新服务_

在服务创建屏幕上，原始服务将在下拉列表中作为新服务数据的来源被选择。创建后，这两个服务将形成一个仓库。

### 重命名仓库 {#renaming-a-warehouse}

有两种方式可以重命名仓库：

- 您可以在服务页面右上角选择“按仓库排序”，然后单击仓库名称旁边的铅笔图标
- 您可以在任何服务上单击仓库名称并在那里重命名仓库

### 删除仓库 {#deleting-a-warehouse}

删除仓库意味着删除所有计算服务和数据（表、视图、用户等）。此操作无法撤销。
您只能通过删除第一个创建的服务来删除仓库。要执行此操作：

1. 删除所有除第一个创建的服务之外创建的服务；
2. 删除第一个服务（警告：所有仓库数据将在此步骤中被删除）。
