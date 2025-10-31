---
'sidebar_label': 'BladePipe'
'sidebar_position': 20
'keywords':
- 'clickhouse'
- 'BladePipe'
- 'connect'
- 'integrate'
- 'cdc'
- 'etl'
- 'data integration'
'slug': '/integrations/bladepipe'
'description': '使用 BladePipe 数据管道将数据流入 ClickHouse'
'title': '将 BladePipe 连接到 ClickHouse'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import bp_ck_1 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_1.png';
import bp_ck_2 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_2.png';
import bp_ck_3 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_3.png';
import bp_ck_4 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_4.png';
import bp_ck_5 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_5.png';
import bp_ck_6 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_6.png';
import bp_ck_7 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_7.png';
import bp_ck_8 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_8.png';
import bp_ck_9 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_9.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 BladePipe 到 ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> 是一个实时端到端的数据集成工具，具有亚秒延迟，提升了跨平台的数据流动性。

ClickHouse 是 BladePipe 提供的预构建连接器之一，允许用户自动将来自各种源的数据集成到 ClickHouse 中。 本页将逐步展示如何实时加载数据到 ClickHouse。

## 支持的源 {#supported-sources}
目前，BladePipe 支持从以下来源集成数据到 ClickHouse：
- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

将会支持更多源。

<VerticalStepper headerLevel="h2">
## 下载并运行 BladePipe {#1-run-bladepipe}
1. 登录到 <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>。

2. 按照 <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">安装 Worker (Docker)</a> 或 <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">安装 Worker (Binary)</a> 中的说明下载和安装 BladePipe Worker。

  :::note
  另外，您可以下载并部署 <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>。
  :::

## 将 ClickHouse 添加为目标 {#2-add-clickhouse-as-a-target}

  :::note
  1. BladePipe 支持 ClickHouse 版本 `20.12.3.3` 或更高版本。
  2. 要使用 ClickHouse 作为目标，请确保用户具有 SELECT、INSERT 和普通 DDL 权限。
  :::

1. 在 BladePipe 中，点击 "DataSource" > "Add DataSource"。

2. 选择 `ClickHouse`，并通过提供您的 ClickHouse 主机和端口、用户名和密码来填写设置，然后点击 "Test Connection"。

    <Image img={bp_ck_1} size="lg" border alt="将 ClickHouse 添加为目标" />

3. 点击底部的 "Add DataSource"，将添加一个 ClickHouse 实例。

## 将 MySQL 添加为源 {#3-add-mysql-as-a-source}
在本教程中，我们使用 MySQL 实例作为源，并解释将 MySQL 数据加载到 ClickHouse 的过程。

:::note
要使用 MySQL 作为源，请确保用户具有 <a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">所需权限</a>。
:::

1. 在 BladePipe 中，点击 "DataSource" > "Add DataSource"。

2. 选择 `MySQL`，并通过提供您的 MySQL 主机和端口、用户名和密码来填写设置，然后点击 "Test Connection"。

    <Image img={bp_ck_2} size="lg" border alt="将 MySQL 添加为源" />

3. 点击底部的 "Add DataSource"，将添加一个 MySQL 实例。

## 创建管道 {#4-create-a-pipeline}

1. 在 BladePipe 中，点击 "DataJob" > "Create DataJob"。

2. 选择已添加的 MySQL 和 ClickHouse 实例，并点击 "Test Connection" 确保 BladePipe 已连接到这些实例。然后，选择要移动的数据库。
   <Image img={bp_ck_3} size="lg" border alt="选择源和目标" />

3. 选择 "Incremental" 作为 DataJob 类型，同时选择 "Full Data" 选项。
   <Image img={bp_ck_4} size="lg" border alt="选择同步类型" />

4. 选择要复制的表。
   <Image img={bp_ck_5} size="lg" border alt="选择表" />

5. 选择要复制的列。
   <Image img={bp_ck_6} size="lg" border alt="选择列" />

6. 确认 DataJob 创建，DataJob 将自动运行。
    <Image img={bp_ck_8} size="lg" border alt="DataJob 正在运行" />

## 验证数据 {#5-verify-the-data}
1. 停止在 MySQL 实例中的数据写入，并等待 ClickHouse 合并数据。
:::note
由于 ClickHouse 自动合并的时间不可预测，您可以通过运行 `OPTIMIZE TABLE xxx FINAL;` 命令手动触发合并。请注意，这种手动合并可能并不总是成功。

另外，您可以运行 `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;` 命令以创建视图，并在视图上执行查询以确保数据已完全合并。
:::

2. 创建一个 <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">验证 DataJob</a>。一旦验证 DataJob 完成，检查结果以确认 ClickHouse 中的数据与 MySQL 中的数据相同。
   <Image img={bp_ck_9} size="lg" border alt="验证数据" />
   
</VerticalStepper>
