---
sidebar_label: '参考'
description: '详细说明支持的格式、exactly-once 语义、视图支持、扩展能力、限制以及在对象存储 ClickPipes 中的认证机制'
slug: /integrations/clickpipes/object-storage/reference
sidebar_position: 1
title: '参考'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', 'object storage', 's3', 'data ingestion', 'batch loading']
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Image from '@theme/IdealImage';


## 支持的数据源 {#supported-data-sources}

| 名称                 | Logo                                                                                            | 类型           | 状态 | 描述                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------------- | ------ | ------------------------------------------------------------------------- |
| Amazon S3            | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>             | 对象存储 | 稳定 | 配置 ClickPipes 以从对象存储中导入大量数据。 |
| Google Cloud Storage | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定 | 配置 ClickPipes 以从对象存储中导入大量数据。 |
| DigitalOcean Spaces  | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/>         | 对象存储 | 稳定 | 配置 ClickPipes 以从对象存储中导入大量数据。 |
| Azure Blob Storage   | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/>   | 对象存储 | 稳定 | 配置 ClickPipes 以从对象存储中导入大量数据。 |

更多连接器将陆续添加到 ClickPipes 中,您可以通过[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)了解更多信息。


## 支持的数据格式 {#supported-data-formats}

支持的格式包括：

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)


## 精确一次语义 {#exactly-once-semantics}

在摄取大型数据集时可能会发生各种类型的故障,这可能导致部分插入或数据重复。对象存储 ClickPipes 能够应对插入失败并提供精确一次语义。这是通过使用临时"暂存"表来实现的。数据首先插入到暂存表中。如果插入过程出现问题,可以截断暂存表并从干净状态重新尝试插入。只有当插入完成且成功时,暂存表中的分区才会移动到目标表。要了解有关此策略的更多信息,请查看[此博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。

### 视图支持 {#view-support}

目标表上的物化视图也受支持。ClickPipes 不仅会为目标表创建暂存表,还会为任何依赖的物化视图创建暂存表。

我们不会为非物化视图创建暂存表。这意味着如果您的目标表具有一个或多个下游物化视图,这些物化视图应避免通过视图从目标表中选择数据。否则,您可能会发现物化视图中缺少数据。


## 扩展 {#scaling}

对象存储 ClickPipes 的扩展基于[已配置的垂直自动扩展设置](/manage/scaling#configuring-vertical-auto-scaling)所确定的 ClickHouse 服务最小规模。ClickPipe 的规模在创建管道时确定。后续对 ClickHouse 服务设置的更改不会影响 ClickPipe 的规模。

为了提高大规模数据摄取作业的吞吐量,建议在创建 ClickPipe 之前先扩展 ClickHouse 服务。


## 限制 {#limitations}

- 对目标表、其物化视图(包括级联物化视图)或物化视图的目标表进行任何更改都可能导致临时错误,系统会自动重试。为获得最佳效果,建议先停止管道,完成必要的修改后再重新启动管道,以确保更改生效并避免错误。
- 支持的视图类型存在限制。请参阅[精确一次语义](#exactly-once-semantics)和[视图支持](#view-support)章节了解更多信息。
- 部署在 GCP 或 Azure 上的 ClickHouse Cloud 实例的 S3 ClickPipes 不支持角色身份验证,仅 AWS ClickHouse Cloud 实例支持此功能。
- ClickPipes 仅会尝试摄取大小不超过 10GB 的对象。如果文件大于 10GB,相关错误将记录到 ClickPipes 专用错误表中。
- 对于包含超过 10 万个文件的容器,启用持续摄取的 Azure Blob Storage 管道在检测新文件时会有约 10-15 秒的延迟,且延迟会随文件数量增加而增加。
- 对象存储 ClickPipes **不**与 [S3 表函数](/sql-reference/table-functions/s3) 共享列表语法,Azure 也不与 [AzureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage) 共享列表语法。
  - `?` - 匹配任意单个字符
  - `*` - 匹配任意数量的任意字符(不包括 /),包括空字符串
  - `**` - 匹配任意数量的任意字符(包括 /),包括空字符串

:::note
这是一个有效的路径(适用于 S3):

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

这不是一个有效的路径。ClickPipes 不支持 `{N..M}` 语法。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::


## 持续摄取 {#continuous-ingest}

ClickPipes 支持从 S3、GCS、Azure Blob Storage 和 DigitalOcean Spaces 进行持续摄取。启用后,ClickPipes 会持续从指定路径摄取数据,并以每 30 秒一次的频率轮询新文件。但是,新文件的名称必须在字典序上大于最后一个已摄取的文件。这意味着文件必须以能够定义摄取顺序的方式命名。例如,名为 `file1`、`file2`、`file3` 等的文件将按顺序摄取。如果添加了一个名为 `file0` 的新文件,ClickPipes 将不会摄取它,因为它在字典序上不大于最后一个已摄取的文件。


## 跟踪已导入的文件 {#tracking-ingested-files}

要跟踪哪些文件已被导入,请在字段映射中包含 `_file` [虚拟列](/sql-reference/table-functions/s3#virtual-columns)。`_file` 虚拟列包含源对象的文件名,便于查询和识别已处理的文件。


## 身份验证 {#authentication}

### S3 {#s3}

支持公开访问和受保护的 S3 存储桶。

公开存储桶需要在其策略中同时允许 `s3:GetObject` 和 `s3:ListBucket` 操作。

受保护的存储桶可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)进行访问。
要使用 IAM 角色,您需要按照[本指南](/cloud/data-sources/secure-s3)中的说明创建 IAM 角色。创建后复制新的 IAM 角色 ARN,并将其作为"IAM ARN role"粘贴到 ClickPipe 配置中。

### GCS {#gcs}

与 S3 类似,您可以无需配置即可访问公开存储桶,对于受保护的存储桶,您可以使用 [HMAC 密钥](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)代替 AWS IAM 凭证。您可以阅读 Google Cloud 的[如何设置此类密钥](https://cloud.google.com/storage/docs/authentication/hmackeys)指南。

GCS 服务账号不直接支持。对非公开存储桶进行身份验证时,必须使用 HMAC (IAM) 凭证。
附加到 HMAC 凭证的服务账号权限应为 `storage.objects.list` 和 `storage.objects.get`。

### DigitalOcean Spaces {#dospaces}

目前 DigitalOcean Spaces 仅支持受保护的存储桶。您需要"访问密钥"和"密钥"才能访问存储桶及其文件。您可以阅读[本指南](https://docs.digitalocean.com/products/spaces/how-to/manage-access/)了解如何创建访问密钥。

### Azure Blob Storage {#azureblobstorage}

目前 Azure Blob Storage 仅支持受保护的存储桶。身份验证通过连接字符串完成,该字符串支持访问密钥和共享密钥。有关更多信息,请阅读[本指南](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)。
