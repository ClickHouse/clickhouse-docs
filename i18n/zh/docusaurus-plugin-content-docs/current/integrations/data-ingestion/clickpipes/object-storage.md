---
'sidebar_label': 'ClickPipes 用于对象存储'
'description': '无缝连接您的对象存储与 ClickHouse Cloud.'
'slug': '/integrations/clickpipes/object-storage'
'title': '将对象存储与 ClickHouse Cloud 集成'
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
对象存储 ClickPipes 提供了一种简单且弹性的方式，将来自 Amazon S3、Google Cloud Storage、Azure Blob Storage 和 DigitalOcean Spaces 的数据导入到 ClickHouse Cloud。支持一次性和持续性数据输入，并具有精确一次的语义。

## 先决条件 {#prerequisite}
您已熟悉 [ClickPipes 简介](./index.md)。

## 创建您的第一个 ClickPipe {#creating-your-first-clickpipe}

1. 在云控制台中，选择左侧菜单上的 `Data Sources` 按钮，并点击“设置 ClickPipe”

<Image img={cp_step0} alt="选择导入" size="lg" border/>

2. 选择您的数据源。

<Image img={cp_step1} alt="选择数据源类型" size="lg" border/>

3. 填写表单，为您的 ClickPipe 提供名称、描述（可选）、您的 IAM 角色或凭据以及存储桶 URL。您可以使用类 bash 的通配符指定多个文件。有关更多信息，请 [查看有关路径中使用通配符的文档](#limitations)。

<Image img={cp_step2_object_storage} alt="填写连接详细信息" size="lg" border/>

4. UI 将显示指定存储桶中的文件列表。选择您的数据格式（我们目前支持 ClickHouse 格式的子集），并选择是否要启用持续输入 [更多细节如下](#continuous-ingest)。

<Image img={cp_step3_object_storage} alt="设置数据格式和主题" size="lg" border/>

5. 在下一步中，您可以选择将数据输入到新的 ClickHouse 表中，或重用现有表。按照屏幕中的说明修改您的表名称、模式和设置。您可以在顶部的示例表中看到更改的实时预览。

<Image img={cp_step4a} alt="设置表、模式和设置" size="lg" border/>

  您还可以使用提供的控件自定义高级设置

<Image img={cp_step4a3} alt="设置高级控件" size="lg" border/>

6. 或者，您可以决定将数据输入到现有的 ClickHouse 表中。在这种情况下，UI 将允许您将字段从源映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="使用现有表" size="lg" border/>

:::info
您还可以将 [虚拟列](../../sql-reference/table-functions/s3#virtual-columns)（如 `_path` 或 `_size`）映射到字段。
:::

7. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为写入目标表创建一个专用用户。您可以使用自定义角色或预定义角色之一选择该内部用户的角色：
    - `全访问`：具有对集群的完全访问权限。如果使用目标表的物化视图或字典，则需要此权限。
    - `仅目标表`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" size="lg" border/>

8. 通过点击“完成设置”，系统将注册您的 ClickPipe，您将能够在摘要表中看到它。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="移除通知" size="lg" border/>

  摘要表提供了在 ClickHouse 中显示源或目标表的示例数据的控件

<Image img={cp_destination} alt="查看目标" size="lg" border/>

  以及用于删除 ClickPipe 和显示数据输入作业摘要的控件。

<Image img={cp_overview} alt="查看概览" size="lg" border/>

9. **恭喜！** 您已成功设置第一个 ClickPipe。 如果这是一个流式 ClickPipe，它将持续运行，从您的远程数据源实时输入数据。否则，它将输入批处理并完成。

## 支持的数据源 {#supported-data-sources}

| 名称                   | Logo | 类型         | 状态  | 描述                                                                                         |
|----------------------|-----|-------------|-------|---------------------------------------------------------------------------------------------|
| Amazon S3            |<S3svg class="image" alt="Amazon S3 logo" style={{width: '3rem', height: 'auto'}}/>|对象存储     | 稳定  | 配置 ClickPipes 从对象存储中输入大量数据。                                                   |
| Google Cloud Storage |<Gcssvg class="image" alt="Google Cloud Storage logo" style={{width: '3rem', height: 'auto'}}/>|对象存储     | 稳定  | 配置 ClickPipes 从对象存储中输入大量数据。                                                   |
| DigitalOcean Spaces  | <DOsvg class="image" alt="Digital Ocean logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储     | 稳定  | 配置 ClickPipes 从对象存储中输入大量数据。                                                   |
| Azure Blob Storage   | <ABSsvg class="image" alt="Azure Blob Storage logo" style={{width: '3rem', height: 'auto'}}/> | 对象存储     | 私有测试版 | 配置 ClickPipes 从对象存储中输入大量数据。                                                   |

更多连接程序将添加到 ClickPipes，您可以通过 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。

## 支持的数据格式 {#supported-data-formats}

支持的格式有：
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 精确一次语义 {#exactly-once-semantics}

在输入大型数据集时可能会出现各种类型的故障，这可能导致部分插入或重复数据。对象存储 ClickPipes 具有抗插入失败的弹性，并提供精确一次的语义。这是通过使用临时“暂存”表来实现的。数据首先插入暂存表中。如果插入过程中出现问题，可以截断暂存表并从干净的状态重试插入。只有在插入完成并成功后，暂存表中的分区才会移动到目标表中。要了解有关该策略的更多信息，请查看 [这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。

### 视图支持 {#view-support}
目标表上的物化视图也受到支持。ClickPipes 将为目标表创建暂存表，以及任何依赖的物化视图。

我们不会为非物化视图创建暂存表。这意味着如果您有一个目标表和一个或多个下游物化视图，那么这些物化视图应避免通过目标表的视图选择数据。否则，您可能会发现物化视图中缺少数据。

## 扩展性 {#scaling}

对象存储 ClickPipes 的规模基于由 [配置的垂直自动扩展设置](/manage/scaling#configuring-vertical-auto-scaling) 确定的最小 ClickHouse 服务大小。ClickPipe 的大小在创建管道时确定。对 ClickHouse 服务设置的后续更改不会影响 ClickPipe 的大小。

为了提高大型输入作业的吞吐量，我们建议在创建 ClickPipe 之前扩展 ClickHouse 服务。

## 限制 {#limitations}
- 对目标表、其物化视图（包括级联物化视图）或物化视图的目标表的任何更改都可能导致临时错误，这将被重试。为了获得最佳结果，我们建议停止管道，进行必要的修改，然后重新启动管道，以便变更被采纳并避免错误。
- 支持的视图类型存在限制。有关更多信息，请阅读 [精确一次语义](#exactly-once-semantics) 和 [视图支持](#view-support) 部分。
- 对于在 GCP 或 Azure 部署的 ClickHouse Cloud 实例，不支持 S3 ClickPipes 的角色身份验证。仅支持 AWS ClickHouse Cloud 实例。
- ClickPipes 仅会尝试输入大小为 10GB 或更小的对象。如果文件大于 10GB，则会将错误追加到 ClickPipes 专用错误表中。
- 在包含超过 10 万个文件的容器上，Azure Blob Storage 管道的持续输入将有约 10-15 秒的延迟来检测新文件。延迟会随着文件数量的增加而增加。
- S3 / GCS ClickPipes **不** 与 [S3 表函数](/sql-reference/table-functions/s3) 共享列表语法，也不与 [AzureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage) 共享。
  - `?` — 替代任何单个字符
  - `*` — 替代任何数量的任何字符，包括空字符串
  - `**` — 替代任何数量的任何字符，包括空字符串

:::note
这是有效路径（对于 S3）：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

这不是有效路径。`{N..M}` 在 ClickPipes 中不受支持。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 持续输入 {#continuous-ingest}
ClickPipes 支持来自 S3、GCS、Azure Blob Storage 和 DigitalOcean Spaces 的持续输入。当启用时，ClickPipes 会连续从指定路径输入数据，并以每 30 秒一次的速度轮询新文件。然而，新文件必须在字典上大于上一个输入的文件。这意味着它们的命名方式必须定义输入顺序。例如，文件命名为 `file1`、`file2`、`file3` 等，将按顺序输入。如果添加了一个名为 `file0` 的新文件，ClickPipes 将不会输入它，因为它在字典上并不大于上一个输入的文件。

## 存档表 {#archive-table}
ClickPipes 将创建一个与目标表并列的表，后缀为 `s3_clickpipe_<clickpipe_id>_archive`。该表将包含 ClickPipe 已输入的所有文件的列表。该表用于在输入过程中跟踪文件，并可以用来验证文件是否已输入。存档表具有 7 天的 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)。

:::note
这些表不会通过 ClickHouse Cloud SQL 控制台可见，您需要通过外部客户端连接，可以使用 HTTPS 或原生连接来读取它们。
:::

## 身份验证 {#authentication}

### S3 {#s3}
您可以在没有配置的情况下访问公共存储桶，对于受保护的存储桶，您可以使用 [IAM 凭据](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。要使用 IAM 角色，您需要按照 [本指南](/cloud/security/secure-s3) 中的说明创建 IAM 角色。在创建后复制新 IAM 角色的 Arn 并将其粘贴到 ClickPipe 配置中作为“IAM ARN 角色”。

### GCS {#gcs}
与 S3 类似，您可以在没有配置的情况下访问公共存储桶，对于受保护的存储桶，您可以使用 [HMAC 密钥](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) 替代 AWS IAM 凭据。您可以阅读 Google Cloud 关于 [如何设置此类密钥](https://cloud.google.com/storage/docs/authentication/hmackeys) 的指南。

GCS 的服务账户不直接受支持。必须在对非公共存储桶进行身份验证时使用 HMAC（IAM）凭据。
附加到 HMAC 凭据的服务账户权限应为 `storage.objects.list` 和 `storage.objects.get`。

### DigitalOcean Spaces {#dospaces}
目前仅支持受保护的 DigitalOcean 空间存储桶。您需要“访问密钥”和“秘密密钥”来访问存储桶及其文件。您可以阅读 [本指南](https://docs.digitalocean.com/products/spaces/how-to/manage-access/) 了解如何创建访问密钥。

### Azure Blob Storage {#azureblobstorage}
目前仅支持受保护的 Azure Blob Storage 存储桶。身份验证通过连接字符串完成，该字符串支持访问密钥和共享密钥。有关更多信息，请阅读 [本指南](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)。

## 常见问题解答 {#faq}

- **ClickPipes 支持以 `gs://` 为前缀的 GCS 存储桶吗？**

不支持。出于互操作性原因，我们要求您用 `https://storage.googleapis.com/`替换您的 `gs://` 存储桶前缀。

- **GCS 公共存储桶需要什么权限？**

`allUsers` 需要适当的角色分配。在存储桶级别必须授予 `roles/storage.objectViewer` 角色。该角色提供 `storage.objects.list` 权限，允许 ClickPipes 列出存储桶中的所有对象，这是注册和输入所必需的。该角色还包括 `storage.objects.get` 权限，这对于读取或下载存储桶中的单个对象是必需的。有关更多信息，请参阅 [Google Cloud 访问控制](https://cloud.google.com/storage/docs/access-control/iam-roles)。
