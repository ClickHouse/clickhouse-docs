---
sidebar_label: '参考'
description: '详述支持的格式、精确一次（exactly-once）语义、视图支持、伸缩、限制，以及对象存储 ClickPipes 的身份验证'
slug: /integrations/clickpipes/object-storage/reference
sidebar_position: 1
title: '参考'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
keywords: ['clickpipes', '对象存储', 's3', '数据摄取', '批量加载']
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Image from '@theme/IdealImage';


## 支持的数据源 {#supported-data-sources}

| 名称                 |Logo|类型|状态|描述|
|----------------------|----|----|----|----|
| Amazon S3            |<S3svg class="image" alt="Amazon S3 标志" style={{width: '3rem', height: 'auto'}}/>|对象存储|稳定|配置 ClickPipes 从对象存储中摄取海量数据。|
| Google Cloud Storage |<Gcssvg class="image" alt="Google Cloud Storage 标志" style={{width: '3rem', height: 'auto'}}/>|对象存储|稳定|配置 ClickPipes 从对象存储中摄取海量数据。|
| DigitalOcean Spaces | <DOsvg class="image" alt="DigitalOcean 标志" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定 | 配置 ClickPipes 从对象存储中摄取海量数据。|
| Azure Blob Storage | <ABSsvg class="image" alt="Azure Blob Storage 标志" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定 | 配置 ClickPipes 从对象存储中摄取海量数据。|

我们会持续为 ClickPipes 增加更多连接器，如需了解详情，请[联系我们](https://clickhouse.com/company/contact?loc=clickpipes)。



## 支持的数据格式 {#supported-data-formats}

支持的格式包括：
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)



## 精确一次语义 {#exactly-once-semantics}

在摄取大型数据集时可能会发生各种类型的故障，进而导致部分插入或重复数据。用于对象存储的 ClickPipes 对插入失败具有较强的恢复能力，并提供精确一次语义。这是通过使用临时的“暂存（staging）”表来实现的。数据首先被插入到暂存表中。如果在插入过程中出现问题，可以截断暂存表，并在干净状态下重试插入。只有当一次插入完成且成功时，暂存表中的分区才会被移动到目标表。要了解有关此策略的更多信息，请参阅[这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。

### 视图支持 {#view-support}
目标表上的物化视图同样受支持。ClickPipes 不仅会为目标表创建暂存表，还会为任何依赖的物化视图创建暂存表。

我们不会为非物化视图创建暂存表。这意味着，如果您的目标表具有一个或多个下游物化视图，那么这些物化视图在从目标表读取数据时应避免通过普通视图来查询目标表。否则，您可能会发现物化视图中存在数据缺失的情况。



## 扩缩容 {#scaling}

对象存储 ClickPipes 的扩缩容由[配置的纵向自动扩缩容设置](/manage/scaling#configuring-vertical-auto-scaling)所确定的最小 ClickHouse 服务规格决定。ClickPipe 的规格在创建该 ClickPipe 时确定。此后对 ClickHouse 服务设置的更改不会影响 ClickPipe 的规格。

为提升大规模摄取作业的吞吐量，建议在创建 ClickPipe 之前先对 ClickHouse 服务进行扩容。



## 限制 {#limitations}
- 对目标表、其物化视图（包括级联物化视图）或物化视图的目标表所做的任何更改，都可能导致会被重试的临时错误。为获得最佳效果，建议先停止管道，完成必要的修改，然后重新启动管道，以便使这些更改被正确处理并避免错误。
- 对支持的视图类型存在限制。请阅读[精确一次语义](#exactly-once-semantics)和[视图支持](#view-support)章节以获取更多信息。
- 部署在 GCP 或 Azure 上的 ClickHouse Cloud 实例所使用的 S3 ClickPipes 不支持角色身份验证。角色身份验证仅适用于部署在 AWS 上的 ClickHouse Cloud 实例。
- ClickPipes 仅会尝试摄取大小不超过 10GB 的对象。如果文件大于 10GB，将会在 ClickPipes 专用错误表中追加一条错误记录。
- 对于包含超过 10 万个文件且启用了持续摄取的 Azure Blob Storage 管道，新文件检测延迟约为 10–15 秒。延迟会随文件数量的增加而增大。
- 对象存储 ClickPipes **不**与 [S3 Table Function](/sql-reference/table-functions/s3) 使用相同的列举语法，Azure 也不与 [AzureBlobStorage Table function](/sql-reference/table-functions/azureBlobStorage) 使用相同的列举语法。
  - `?` - 替代任意单个字符
  - `*` - 替代任意数量的任意字符（不包含 `/`），包括空字符串
  - `**` - 替代任意数量的任意字符（包含 `/`），包括空字符串

:::note
这是一个有效路径（用于 S3）：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

这是一个无效路径。ClickPipes 不支持 `{N..M}`。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::



## 持续摄取 {#continuous-ingest}
ClickPipes 支持从 S3、GCS、Azure Blob Storage 和 DigitalOcean Spaces 持续摄取数据。启用后，ClickPipes 会持续从指定路径摄取数据，并以每 30 秒一次的频率轮询是否有新文件。但是，新文件的名称在字典序上必须大于上一次已摄取的文件名。这意味着文件命名必须能够明确体现摄取顺序。例如，名为 `file1`、`file2`、`file3` 等文件会被按顺序依次摄取。如果新添加了一个名为 `file0` 的文件，由于其在字典序上不大于上一次已摄取的文件名，ClickPipes 将不会摄取该文件。



## 跟踪已摄取的文件 {#tracking-ingested-files}

要跟踪哪些文件已被摄取，请在字段映射中包含 `_file` [虚拟列](/sql-reference/table-functions/s3#virtual-columns)。`_file` 虚拟列包含源对象的文件名，从而便于查询和识别已处理的文件。



## 身份验证 {#authentication}

### S3 {#s3}
支持公有和受保护的 S3 存储桶。

公有存储桶的策略中需要允许 `s3:GetObject` 和 `s3:ListBucket` 这两个操作。

受保护的存储桶可以通过 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) 进行访问。
要使用 IAM 角色，需要按照[本指南](/cloud/data-sources/secure-s3)中的说明创建 IAM 角色。创建完成后，复制新建 IAM 角色的 ARN，并在 ClickPipe 配置中将其粘贴到 "IAM ARN role" 字段中。

### GCS {#gcs}
与 S3 类似，公有存储桶可在无需额外配置的情况下访问；对于受保护的存储桶，可以使用 [HMAC Keys](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) 来替代 AWS IAM 凭证。您可以阅读 Google Cloud 的[这篇指南](https://cloud.google.com/storage/docs/authentication/hmackeys)了解如何配置这些密钥。

当前不直接支持 GCS 的 Service Accounts。对非公有存储桶进行身份验证时，必须使用 HMAC（IAM）凭证。
附加到 HMAC 凭证所对应 Service Account 的权限应包括 `storage.objects.list` 和 `storage.objects.get`。

### DigitalOcean Spaces {#dospaces}
当前 DigitalOcean Spaces 仅支持受保护的存储桶。需要 "Access Key" 和 "Secret Key" 才能访问存储桶及其中的文件。您可以阅读[本指南](https://docs.digitalocean.com/products/spaces/how-to/manage-access/)了解如何创建访问密钥。

### Azure Blob Storage {#azureblobstorage}
当前 Azure Blob Storage 仅支持受保护的存储桶。身份验证通过连接字符串完成，该字符串支持 access keys 和 shared keys。更多信息请阅读[本指南](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)。
