---
sidebar_label: 'BladePipe'
sidebar_position: 20
keywords: ['clickhouse', 'BladePipe', 'connect', 'integrate', 'cdc', 'etl', 'data integration']
slug: /integrations/bladepipe
description: '使用 BladePipe 数据管道将数据流式导入 ClickHouse'
title: '将 BladePipe 连接到 ClickHouse'
doc_type: 'guide'
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
import PartnerBadge from '@theme/badges/PartnerBadge';


# 将 BladePipe 连接到 ClickHouse

<PartnerBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> 是一款端到端的实时数据集成工具，具备亚秒级延迟，可在各个平台之间实现无缝数据流转。

ClickHouse 是 BladePipe 内置连接器之一，使用户可以将来自各类数据源的数据自动集成到 ClickHouse 中。本文将逐步演示如何实时向 ClickHouse 加载数据。



## 支持的数据源 {#supported-sources}

目前 BladePipe 支持从以下数据源向 ClickHouse 集成数据:

- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

后续将支持更多数据源。


<VerticalStepper headerLevel="h2">
## 下载并运行 BladePipe {#1-run-bladepipe}
1. 登录到 <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>。

2. 按照 <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">安装 Worker (Docker)</a> 或 <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">安装 Worker (Binary)</a> 中的说明来下载并安装 BladePipe Worker。

:::note
或者,您也可以下载并部署 <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>。
:::


## 将 ClickHouse 添加为目标 {#2-add-clickhouse-as-a-target}

:::note

1. BladePipe 支持 ClickHouse `20.12.3.3` 及以上版本。
2. 要将 ClickHouse 用作目标,请确保用户具有 SELECT、INSERT 和常规 DDL 权限。
   :::

3. 在 BladePipe 中,点击"DataSource">"Add DataSource"。

4. 选择 `ClickHouse`,填写 ClickHouse 主机地址和端口、用户名和密码等配置信息,然后点击"Test Connection"。

   <Image img={bp_ck_1} size='lg' border alt='将 ClickHouse 添加为目标' />

5. 点击底部的"Add DataSource",即可完成 ClickHouse 实例的添加。


## 添加 MySQL 作为数据源 {#3-add-mysql-as-a-source}

在本教程中,我们使用 MySQL 实例作为数据源,并说明将 MySQL 数据加载到 ClickHouse 的过程。

:::note
要使用 MySQL 作为数据源,请确保用户具有<a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">所需权限</a>。
:::

1. 在 BladePipe 中,点击"数据源">"添加数据源"。

2. 选择 `MySQL`,填写 MySQL 主机和端口、用户名和密码等配置信息,然后点击"测试连接"。

   <Image img={bp_ck_2} size='lg' border alt='添加 MySQL 作为数据源' />

3. 点击底部的"添加数据源",即可添加 MySQL 实例。


## 创建数据管道 {#4-create-a-pipeline}

1. 在 BladePipe 中,点击"DataJob">"Create DataJob"。

2. 选择已添加的 MySQL 和 ClickHouse 实例,点击"Test Connection"确保 BladePipe 已成功连接到这些实例。然后选择需要迁移的数据库。

   <Image img={bp_ck_3} size='lg' border alt='选择源和目标' />

3. 在 DataJob 类型中选择"Incremental",同时勾选"Full Data"选项。

   <Image img={bp_ck_4} size='lg' border alt='选择同步类型' />

4. 选择需要复制的表。

   <Image img={bp_ck_5} size='lg' border alt='选择表' />

5. 选择需要复制的列。

   <Image img={bp_ck_6} size='lg' border alt='选择列' />

6. 确认创建 DataJob,DataJob 将自动运行。
   <Image img={bp_ck_8} size='lg' border alt='DataJob 正在运行' />


## 验证数据 {#5-verify-the-data}

1. 停止 MySQL 实例的数据写入，等待 ClickHouse 完成数据合并。
   :::note
   由于 ClickHouse 自动合并的时机不可预测，您可以通过运行 `OPTIMIZE TABLE xxx FINAL;` 命令手动触发合并。请注意，手动合并操作不一定总能成功。

或者，您也可以运行 `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;` 命令创建视图，然后在该视图上执行查询，以确保数据已完全合并。
:::

2. 创建一个<a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">验证 DataJob</a>。验证 DataJob 完成后，检查结果以确认 ClickHouse 中的数据与 MySQL 中的数据一致。
   <Image img={bp_ck_9} size='lg' border alt='验证数据' />

</VerticalStepper>
