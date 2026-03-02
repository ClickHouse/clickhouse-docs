---
sidebar_label: '入门'
description: '分步指南，指导您创建首个 Azure Blob Storage (ABS) ClickPipe。'
slug: /integrations/clickpipes/object-storage/azure-blob-storage/get-started
sidebar_position: 1
title: '创建您的首个 Azure Blob Storage ClickPipe'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import navigateToDatasources from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/01-navigate-to-datasources.png'
import createClickpipe from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/02-create-clickpipe.png'
import selectBlobStorage from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/03-select-blob-storage.png'
import configurationDetails from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/04-configuration-details.png'
import chooseDataFormat from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/05-choose-data-format.png'
import parseInformation from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/06-parse-information.png'
import permissions from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/07-permissions.png'

**先决条件**

要完成本指南中的步骤，您需要：

* 一个 Azure Blob Storage 账户
* [Azure 连接字符串](/integrations/azure-data-factory/table-function#acquiring-azure-blob-storage-access-keys)
* 容器名称
* 一个正在运行的 ClickHouse Cloud 服务

<VerticalStepper headerLevel="h2">
  ## 进入数据源 \{#navigate-to-data-sources\}

  在服务首页左侧菜单中点击 **Data sources**。
  展开 **ClickPipes** 下拉菜单并点击 **Create ClickPipe**。

  <Image img={navigateToDatasources} alt="导航到数据源" size="md" />

  <Image img={createClickpipe} alt="创建 ClickPipe" size="md" />

  ## 选择数据源 \{#select-data-source\}

  选择 **Azure Blob Storage** 作为数据类型。

  <Image img={selectBlobStorage} alt="选择 Azure Blob Storage" size="md" />

  ## 设置 ClickPipe 连接 \{#setup-connection\}

  1. 为您的 ClickPipe 指定一个具有描述性的名称
  2. 在身份验证方法下拉菜单中选择 **Connection String**
  3. 在 **Connection string** 字段中粘贴您的 Azure 连接字符串
  4. 输入容器名称
  5. 输入 Azure Blob Storage 文件路径；如果希望摄取多个文件，可以使用通配符

  可选：启用持续摄取。更多详情参见 [“Continuous Ingestion”](/integrations/clickpipes/object-storage/abs/overview#continuous-ingestion)。

  最后，点击 **Incoming data**。

  <Image img={configurationDetails} alt="配置详情" size="md" />

  ## 选择数据格式 \{#select-data-format\}

  1. 选择文件类型
  2. 选择文件压缩方式（`detect automatically`、`none`、`gzip`、`brotli`、`xz` 或 `zstd`）
  3. 完成其他与格式相关的配置，例如针对逗号分隔格式指定所使用的分隔符
  4. 点击 **Parse information**

  <Image img={chooseDataFormat} alt="选择数据格式" size="md" />

  ## 配置表、schema 和设置 \{#configure-table-schema\}

  现在您需要创建一个新表，或选择一个已有表来存储传入数据。

  1. 选择是将数据上传到新表还是已有表
  2. 选择要使用的数据库；如果是新表，则指定表名
  3. 选择一个或多个排序键
  4. 定义从源文件到目标表的映射，包括列名、列类型、默认值和可为空性
  5. 最后，指定高级设置，例如要使用的引擎类型、用于分区的表达式以及主键

  <Image img={parseInformation} alt="解析信息" size="md" />

  完成对表、schema 和设置的配置后，点击 **Details and settings**。

  ## 配置权限 \{#configure-permissions\}

  ClickPipes 会为数据写入创建一个专用数据库用户。
  您可以为该用户选择一个角色。
  对于目标表上的 materialized view 或字典访问，请选择 “Full access”。

  <Image img={permissions} alt="配置权限" size="md" />

  ## 完成设置 \{#complete-setup\}

  点击 **Create ClickPipe** 以完成设置。

  现在您应该能看到您的 ClickPipe 处于 provisioning 状态。
  过几分钟后，它会从 **provisioning** 变为 **completed**。
</VerticalStepper>
