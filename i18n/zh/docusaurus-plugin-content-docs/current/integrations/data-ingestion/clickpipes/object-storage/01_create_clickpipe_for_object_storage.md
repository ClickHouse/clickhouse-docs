---
sidebar_label: '创建第一个对象存储 ClickPipe'
description: '将您的对象存储无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/object-storage
title: '创建您的第一个对象存储 ClickPipe'
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

对象存储 ClickPipes 提供了一种简单且可靠的方式，将 Amazon S3、Google Cloud Storage、Azure Blob Storage 和 DigitalOcean Spaces 中的数据导入 ClickHouse Cloud。支持一次性和持续数据摄取，并提供精确一次（exactly-once）语义。


# 创建您的第一个对象存储 ClickPipe {#creating-your-first-clickpipe}


## 前提条件 {#prerequisite}

- 您已熟悉 [ClickPipes 简介](../index.md)。


## 导航到数据源 {#1-load-sql-console}

在云控制台中,选择左侧菜单的 `Data Sources` 按钮,然后点击"Set up a ClickPipe"

<Image img={cp_step0} alt='选择导入' size='lg' border />


## 选择数据源 {#2-select-data-source}

选择您的数据源。

<Image img={cp_step1} alt='选择数据源类型' size='lg' border />


## 配置 ClickPipe {#3-configure-clickpipe}

填写表单，为您的 ClickPipe 提供名称、描述（可选）、IAM 角色或凭证以及存储桶 URL。
您可以使用类似 bash 的通配符来指定多个文件。
有关更多信息，[请参阅路径中使用通配符的文档](/integrations/clickpipes/object-storage/reference/#limitations)。

<Image
  img={cp_step2_object_storage}
  alt='填写连接详细信息'
  size='lg'
  border
/>


## 选择数据格式 {#4-select-format}

界面将显示指定存储桶中的文件列表。
选择您的数据格式(目前支持 ClickHouse 格式的子集),并选择是否启用持续摄取。
([更多详情见下文](/integrations/clickpipes/object-storage/reference/#continuous-ingest))。

<Image
  img={cp_step3_object_storage}
  alt='设置数据格式和主题'
  size='lg'
  border
/>


## 配置表、架构和设置 {#5-configure-table-schema-settings}

在下一步中,您可以选择将数据导入到新的 ClickHouse 表中,或重用现有表。
按照屏幕上的说明修改表名称、架构和设置。
您可以在顶部的示例表中实时预览所做的更改。

<Image img={cp_step4a} alt='设置表、架构和设置' size='lg' border />

您还可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt='设置高级控件' size='lg' border />

或者,您也可以选择将数据导入到现有的 ClickHouse 表中。
在这种情况下,用户界面将允许您将源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt='使用现有表' size='lg' border />

:::info
您还可以将[虚拟列](../../sql-reference/table-functions/s3#virtual-columns)(如 `_path` 或 `_size`)映射到字段。
:::


## 配置权限 {#6-configure-permissions}

最后,您可以为 ClickPipes 内部用户配置权限。

**权限:** ClickPipes 将创建一个专用用户用于向目标表写入数据。您可以为此内部用户选择自定义角色或以下预定义角色之一:

- `Full access`:具有集群的完全访问权限。如果您在目标表上使用物化视图或字典,则需要此权限。
- `Only destination table`:仅具有目标表的 `INSERT` 权限。

<Image img={cp_step5} alt='权限' size='lg' border />


## 完成设置 {#7-complete-setup}

点击"完成设置"后,系统将注册您的 ClickPipe,您可以在汇总表中看到它。

<Image img={cp_success} alt='成功通知' size='sm' border />

<Image img={cp_remove} alt='移除通知' size='lg' border />

汇总表提供了控件,可显示来自源表或 ClickHouse 目标表的示例数据

<Image img={cp_destination} alt='查看目标' size='lg' border />

以及用于移除 ClickPipe 和显示数据摄取作业摘要的控件。

<Image img={cp_overview} alt='查看概览' size='lg' border />

**恭喜!** 您已成功设置第一个 ClickPipe。
如果这是流式 ClickPipe,它将持续运行,从远程数据源实时摄取数据。
否则,它将摄取批量数据并完成。
