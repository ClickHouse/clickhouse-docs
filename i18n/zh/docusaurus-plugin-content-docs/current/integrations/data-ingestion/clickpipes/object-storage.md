---
'sidebar_label': 'ClickPipes for Object Storage'
'description': '无缝连接您的对象存储与 ClickHouse Cloud。'
'slug': '/integrations/clickpipes/object-storage'
'title': '将对象存储与 ClickHouse Cloud 集成'
'doc_type': 'guide'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
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


# 将对象存储与 ClickHouse Cloud 集成
对象存储 ClickPipes 提供了一种简单且具有弹性的方式，可以将来自 Amazon S3、Google Cloud Storage、Azure Blob Storage 和 DigitalOcean Spaces 的数据导入到 ClickHouse Cloud 中。支持一次性和连续的数据导入，并且具有准确一次的语义。

## 前提条件 {#prerequisite}
您需要熟悉 [ClickPipes 介绍](./index.md)。

## 创建您的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 在云控制台中，选择左侧菜单中的 `数据源` 按钮，然后点击“设置 ClickPipe”

<Image img={cp_step0} alt="选择导入" size="lg" border/>

2. 选择您的数据源。

<Image img={cp_step1} alt="选择数据源类型" size="lg" border/>

3. 填写表单，为您的 ClickPipe 提供一个名称、描述（可选）、您的 IAM 角色或凭证以及桶 URL。您可以使用类似 bash 的通配符指定多个文件。有关更多信息，请[参见使用通配符的文档](#limitations)。

<Image img={cp_step2_object_storage} alt="填写连接详细信息" size="lg" border/>

4. UI 会显示指定桶中的文件列表。选择您的数据格式（我们目前支持 ClickHouse 格式的子集），并选择是否要启用连续导入 [更多细节如下](#continuous-ingest)。

<Image img={cp_step3_object_storage} alt="设置数据格式和主题" size="lg" border/>

5. 在下一步中，您可以选择是否要将数据导入到新的 ClickHouse 表中，或者重用现有的表。请按照屏幕上的说明修改您的表名、模式和设置。您可以在顶部的示例表中实时预览您的更改。

<Image img={cp_step4a} alt="设置表、模式和设置" size="lg" border/>

  您还可以使用提供的控件自定义高级设置

<Image img={cp_step4a3} alt="设置高级控件" size="lg" border/>

6. 另外，您可以决定将数据导入到现有的 ClickHouse 表中。在这种情况下，UI 将允许您将源字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="使用现有表" size="lg" border/>

:::info
您还可以将 [虚拟列](../../sql-reference/table-functions/s3#virtual-columns)，如 `_path` 或 `_size`，映射到字段。
:::

7. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为写入目标表的数据创建一个专用用户。您可以为这个内部用户选择一个角色，使用自定义角色或预定义角色之一：
    - `完全访问`：对集群具有完全访问权限。如果您使用物化视图或字典与目标表，必需该权限。
    - `仅目标表`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" size="lg" border/>

8. 点击“完成设置”，系统将注册您的 ClickPipe，您将能够在汇总表中看到它。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="移除通知" size="lg" border/>

  汇总表提供控件以显示 ClickHouse 中源表或目标表的样本数据

<Image img={cp_destination} alt="查看目标" size="lg" border/>

  以及用于移除 ClickPipe 和显示导入作业摘要的控件。

<Image img={cp_overview} alt="查看概述" size="lg" border/>

Image
9. **恭喜！** 您已成功设置首个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，实时从您的远程数据源导入数据。否则，它会导入批次并完成。

## 支持的数据源 {#supported-data-sources}

| 名称                  | Logo | 类型         | 状态          | 描述                                                                                          |
|----------------------|------|--------------|-----------------|------------------------------------------------------------------------------------------------|
| Amazon S3            | <S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定          | 配置 ClickPipes 从对象存储导入大量数据。                                                        |
| Google Cloud Storage | <Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定          | 配置 ClickPipes 从对象存储导入大量数据。                                                        |
| DigitalOcean Spaces  | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定 | 配置 ClickPipes 从对象存储导入大量数据。                                                        |
| Azure Blob Storage   | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储 | 稳定 | 配置 ClickPipes 从对象存储导入大量数据。                                                        |

更多连接器将添加到 ClickPipes，您可以通过 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多。

## 支持的数据格式 {#supported-data-formats}

支持的格式为：
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 准确一次的语义 {#exactly-once-semantics}

在导入大型数据集时，可能会发生各种类型的故障，这可能导致部分插入或重复数据。对象存储 ClickPipes 对插入失败具有弹性，并提供准确一次的语义。这是通过使用临时“暂存”表实现的。数据首先插入到暂存表中。如果此插入出现问题，则可以截断暂存表并从干净的状态重新尝试插入。只有在插入完成并成功后，暂存表中的分区才会移动到目标表中。要了解更多有关此策略的信息，请查看 [这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。

### 视图支持 {#view-support}
目标表上的物化视图也受支持。ClickPipes 将为目标表创建暂存表，以及任何依赖的物化视图。

我们不会为非物化视图创建暂存表。这意味着如果您有一个目标表，有一个或多个下游的物化视图，则这些物化视图应避免通过目标表中的视图选择数据。否则，您可能会发现物化视图中缺少数据。

## 扩展 {#scaling}

对象存储 ClickPipes 的扩展基于通过 [配置的垂直自动调整设置](/manage/scaling#configuring-vertical-auto-scaling) 确定的最小 ClickHouse 服务大小。ClickPipe 的大小在管道创建时确定。随后的 ClickHouse 服务设置更改将不会影响 ClickPipe 大小。

为了提高大导入作业的吞吐量，我们建议在创建 ClickPipe 之前扩展 ClickHouse 服务。

## 限制 {#limitations}
- 对目标表、其物化视图（包括级联物化视图）或物化视图的目标表的任何更改都可能导致临时错误并会重试。为了获得最佳结果，我们建议停止管道，进行必要的修改，然后重新启动管道以让更改被采纳并避免错误。
- 对支持的视图类型有一些限制。请阅读有关 [准确一次的语义](#exactly-once-semantics) 和 [视图支持](#view-support) 的部分以获取更多信息。
- 对于在 GCP 或 Azure 部署的 ClickHouse Cloud 实例，S3 ClickPipes 不支持角色认证。仅在 AWS ClickHouse Cloud 实例中支持。
- ClickPipes 仅尝试导入大小为 10GB 或更小的对象。如果文件超过 10GB，错误将被附加到 ClickPipes 的专用错误表中。
- 具有连续导入的 Azure Blob Storage 管道在文件超过 100,000 个的容器中将具有大约 10-15 秒的延迟来检测新文件。延迟随文件数量增加。
- 对象存储 ClickPipes **不** 与 [S3 表函数](/sql-reference/table-functions/s3) 共享列出语法，也不与使用 [AzureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage) 的 Azure 共享。
  - `?` — 替代任何单个字符
  - `*` — 替代任何数量的字符，包括空字符串
  - `**` — 替代任何数量的字符，包括空字符串

:::note
这是一个有效的路径（对于 S3）：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

这是一个无效的路径。 `{N..M}` 在 ClickPipes 中不受支持。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 连续导入 {#continuous-ingest}
ClickPipes 支持从 S3、GCS、Azure Blob Storage 和 DigitalOcean Spaces 进行连续导入。当启用时，ClickPipes 持续从指定路径导入数据，并以每 30 秒的频率轮询新文件。然而，新文件必须在字典上大于最后一个导入的文件。这意味着它们必须以某种方式命名，以定义导入顺序。例如，命名为 `file1`、`file2`、`file3` 等文件将按顺序导入。如果添加一个名称为 `file0` 的新文件，ClickPipes 将不会导入它，因为它没有大于最后一个导入文件的字典。

## 归档表 {#archive-table}
ClickPipes 会在您的目标表旁边创建一个后缀为 `s3_clickpipe_<clickpipe_id>_archive` 的表。该表将包含 ClickPipe 导入的所有文件的列表。该表用于在导入过程中跟踪文件，并可用于验证文件是否已导入。归档表的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。

:::note
这些表不会通过 ClickHouse Cloud SQL 控制台可见，您需要通过外部客户端连接，无论是通过 HTTPS 还是原生连接来读取它们。
:::

## 身份验证 {#authentication}

### S3 {#s3}
支持公开访问和受保护的 S3 存储桶。

公共存储桶需要在其策略中允许 `s3:GetObject` 和 `s3:ListBucket` 两个操作。

受保护的存储桶可以使用 [IAM 凭证](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) 进行访问。
要使用 IAM 角色，您需要按照 [本指南](/cloud/security/secure-s3) 中指定的方式创建 IAM 角色。创建后复制新 IAM 角色的 Arn 并将其粘贴到 ClickPipe 配置中的“IAM ARN 角色”。

### GCS {#gcs}
与 S3 类似，您可以在没有配置的情况下访问公共存储桶，受保护的存储桶可以使用 [HMAC 密钥](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)，代替 AWS IAM 凭证。您可以阅读 Google Cloud 的 [如何设置该密钥](https://cloud.google.com/storage/docs/authentication/hmackeys) 的指南。

GCS 的服务账户不直接支持。在认证非公开存储桶时，必须使用 HMAC（IAM）凭证。
与 HMAC 凭证相关的服务账户权限应为 `storage.objects.list` 和 `storage.objects.get`。

### DigitalOcean Spaces {#dospaces}
目前仅支持受保护的 DigitalOcean 存储桶。您需要一个“访问密钥”和一个“秘密密钥”才能访问存储桶及其文件。您可以阅读 [本指南](https://docs.digitalocean.com/products/spaces/how-to/manage-access/) 了解如何创建访问密钥。

### Azure Blob Storage {#azureblobstorage}
目前仅支持受保护的 Azure Blob Storage 存储桶。通过连接字符串进行身份验证，支持访问密钥和共享密钥。有关更多信息，请阅读 [本指南](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)。

## 常见问题解答 {#faq}

- **ClickPipes 是否支持以 `gs://` 前缀开头的 GCS 存储桶？**

不。出于互操作性原因，我们请求您将 `gs://` 存储桶前缀替换为 `https://storage.googleapis.com/`。

- **GCS 公开存储桶需要什么权限？**

`allUsers` 需要适当的角色分配。必须在存储桶级别授予 `roles/storage.objectViewer` 角色。此角色提供 `storage.objects.list` 权限，允许 ClickPipes 列出存储桶中的所有对象，这是入驻和导入所需的。此角色还包括 `storage.objects.get` 权限，这对于读取或下载存储桶中的单个对象是必需的。请参见 [Google Cloud 访问控制](https://cloud.google.com/storage/docs/access-control/iam-roles) 获取更多信息。
