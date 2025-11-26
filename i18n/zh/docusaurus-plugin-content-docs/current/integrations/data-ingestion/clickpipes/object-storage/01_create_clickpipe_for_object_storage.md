---
sidebar_label: '创建首个对象存储 ClickPipe'
description: '将对象存储无缝连接至 ClickHouse Cloud。'
slug: /integrations/clickpipes/object-storage
title: '创建首个对象存储 ClickPipe'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_object_storage.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';

对象存储 ClickPipes 提供了一种简单且健壮的方式，用于将 Amazon S3、Google Cloud Storage、Azure Blob Storage 和 DigitalOcean Spaces 中的数据摄取到 ClickHouse Cloud。既支持一次性摄取，也支持持续摄取，并保证严格一次（exactly-once）语义。


# 创建第一个对象存储 ClickPipe {#creating-your-first-clickpipe}



## 先决条件 {#prerequisite}

- 您已阅读并熟悉 [ClickPipes 简介](../index.md)。



## 进入数据源 {#1-load-sql-console}

在云控制台左侧菜单中选择 `Data Sources` 按钮，然后点击“Set up a ClickPipe”

<Image img={cp_step0} alt="选择导入项" size="lg" border/>



## 选择数据源 {#2-select-data-source}

选择数据源。

<Image img={cp_step1} alt="选择数据源类型" size="lg" border/>



## 配置 ClickPipe {#3-configure-clickpipe}

在表单中为 ClickPipe 填写名称、描述（可选）、IAM 角色或凭证以及存储桶（bucket）URL。
你可以使用类似 Bash 的通配符来指定多个文件。
有关更多信息，请[参阅关于在路径中使用通配符的文档](/integrations/clickpipes/object-storage/reference/#limitations)。

<Image img={cp_step2_object_storage} alt="填写连接详情" size="lg" border/>



## 选择数据格式 {#4-select-format}

UI 会显示指定 bucket 中的文件列表。
选择你的数据格式（当前支持部分 ClickHouse 格式），并选择是否要启用持续摄取。
（[下面有更多细节](/integrations/clickpipes/object-storage/reference/#continuous-ingest)）。

<Image img={cp_step3_object_storage} alt="设置数据格式和主题" size="lg" border/>



## 配置表、表结构和设置 {#5-configure-table-schema-settings}

在下一步中，你可以选择将数据摄取到一个新的 ClickHouse 表中，或者复用一个已有的表。
按照界面上的指引修改你的表名、表结构和设置。
你可以在顶部的示例表中实时预览你的更改。

<Image img={cp_step4a} alt="配置表、表结构和设置" size="lg" border/>

你也可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="配置高级设置" size="lg" border/>

或者，你也可以选择将数据摄取到已有的 ClickHouse 表中。
在这种情况下，UI 允许你将源中的字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="使用现有表" size="lg" border/>

:::info
你也可以将[虚拟列](../../sql-reference/table-functions/s3#virtual-columns)（例如 `_path` 或 `_size`）映射到字段上。
:::



## 配置权限 {#6-configure-permissions}

最后，您可以为内部 ClickPipes 用户配置权限。

**权限：** ClickPipes 会创建一个专用用户，用于向目标表写入数据。您可以为该内部用户选择一个角色，可以是自定义角色或预定义角色之一：
- `Full access`：对整个集群具有完全访问权限。如果您在目标表上使用物化视图或 Dictionary，则需要选择此角色。
- `Only destination table`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="Permissions" size="lg" border/>



## 完成设置 {#7-complete-setup}

点击“Complete Setup”后，系统会注册你的 ClickPipe，你就可以在汇总表中看到它的条目。

<Image img={cp_success} alt="成功提示" size="sm" border/>

<Image img={cp_remove} alt="移除提示" size="lg" border/>

汇总表提供操作项，用于显示来自源或 ClickHouse 中目标表的示例数据。

<Image img={cp_destination} alt="查看目标" size="lg" border/>

同时还提供操作项，用于移除该 ClickPipe 并显示摄取任务的概要信息。

<Image img={cp_overview} alt="查看概览" size="lg" border/>

**恭喜！** 你已成功完成第一个 ClickPipe 的设置。
如果这是一个流式 ClickPipe，它将持续运行，从你的远程数据源实时摄取数据。
否则，它会完成该批次数据的摄取后自动结束。
