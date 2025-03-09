---
sidebar_label: 'ClickPipes 与对象存储的集成'
description: '无缝连接您的对象存储与 ClickHouse Cloud。'
slug: /integrations/clickpipes/object-storage
---
import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
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


# 将对象存储与 ClickHouse Cloud 集成
对象存储 ClickPipes 提供了一种简单且可靠的方法，以将数据从 Amazon S3 和 Google Cloud Storage 导入到 ClickHouse Cloud。支持一次性和持续的数据导入，并具有精确一次的语义。

## 先决条件 {#prerequisite}
您已熟悉 [ClickPipes 入门](./index.md)。

## 创建第一个 ClickPipe {#creating-your-first-clickpipe}

1. 在云控制台中，选择左侧菜单中的 `Data Sources` 按钮，然后点击“设置 ClickPipe”

<img src={cp_step0} alt="选择导入" />

2. 选择您的数据源。

<img src={cp_step1} alt="选择数据源类型" />

3. 填写表单，为您的 ClickPipe 提供名称、描述（可选）、您的 IAM 角色或凭据以及存储桶 URL。您可以使用类似 bash 的通配符指定多个文件。有关更多信息，请 [参见文档中关于路径使用通配符的内容](#limitations)。

<img src={cp_step2_object_storage} alt="填写连接详细信息" />

4. 界面将显示指定存储桶中的文件列表。选择您的数据格式（我们当前支持 ClickHouse 格式的子集），以及您是否想启用持续导入 [更多细节见下文](#continuous-ingest)。

<img src={cp_step3_object_storage} alt="设置数据格式和主题" />

5. 在下一步中，您可以选择是将数据导入到新建的 ClickHouse 表中，还是重用现有的表。按照屏幕上的说明修改您的表名称、架构和设置。您可以在顶部的示例表中实时预览更改。

<img src={cp_step4a} alt="设置表、架构和设置" />

  您还可以使用提供的控件自定义高级设置

<img src={cp_step4a3} alt="设置高级控件" />

6. 或者，您可以选择将数据导入到现有的 ClickHouse 表中。在这种情况下，界面将允许您从源字段映射到所选目标表中的 ClickHouse 字段。

<img src={cp_step4b} alt="使用现有表" />

:::info
您也可以将 [虚拟列](../../sql-reference/table-functions/s3#virtual-columns) 映射到字段，如 `_path` 或 `_size`。
:::

7. 最后，您可以为内部 ClickPipes 用户配置权限。

  **权限：** ClickPipes 将为写入数据到目标表创建一个专用用户。您可以使用自定义角色或预定义角色之一选择此内部用户的角色：
    - `完全访问`：对集群具有完全访问权限。如果您在目标表中使用物化视图或字典，这是必需的。
    - `仅目标表`：仅对目标表具有 `INSERT` 权限。

<img src={cp_step5} alt="权限" />

8. 通过点击“完成设置”，系统将注册您的 ClickPipe，您将能够在摘要表中看到它。

<img src={cp_success} alt="成功通知" />

<img src={cp_remove} alt="删除通知" />

  摘要表提供了在 ClickHouse 中显示源或目标表示例数据的控件

<img src={cp_destination} alt="查看目标" />

  以及移除 ClickPipe 和显示导入作业摘要的控件。

<img src={cp_overview} alt="查看概述" />

9. **恭喜您！** 您已经成功设置了第一个 ClickPipe。如果这是一个流式 ClickPipe，它将持续运行，从您的远程数据源实时导入数据。否则，它将导入批次并完成。

## 支持的数据源 {#supported-data-sources}

| 名称                     | Logo | 类型          | 状态          | 描述                                                                                                 |
|--------------------------|------|--------------|----------------|------------------------------------------------------------------------------------------------------|
| Amazon S3                |<S3svg class="image" alt="Amazon S3 标志" style={{width: '3rem', height: 'auto'}}/>|对象存储      | 稳定          | 配置 ClickPipes 从对象存储中导入大量数据。                                                            |
| Google Cloud Storage     |<Gcssvg class="image" alt="Google Cloud Storage 标志" style={{width: '3rem', height: 'auto'}}/>|对象存储      | 稳定          | 配置 ClickPipes 从对象存储中导入大量数据。                                                            |

更多连接器将添加到 ClickPipes，您可以通过 [联系我们](https://clickhouse.com/company/contact?loc=clickpipes) 了解更多信息。

## 支持的数据格式 {#supported-data-formats}

支持的格式有：
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)

## 精确一次的语义 {#exactly-once-semantics}

在导入大型数据集时可能会发生各种类型的故障，这可能导致部分插入或重复数据。对象存储 ClickPipes 对插入故障具有弹性，并提供精确一次的语义。这是通过使用临时“暂存”表实现的。数据首先插入到暂存表中。如果此插入出现问题，可以截断暂存表并从干净的状态重试插入。仅当插入完成并成功时，暂存表中的分区才会移动到目标表中。要了解更多有关此策略的信息，请查看 [这篇博文](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。

### 视图支持 {#view-support}
目标表上的物化视图也受支持。ClickPipes 将为目标表创建暂存表，以及任何依赖的物化视图。

我们不为非物化视图创建暂存表。这意味着如果您有一个目标表与一个或多个下游物化视图，应该避免通过视图从目标表选择数据。否则，您可能会发现物化视图中缺少数据。

## 扩展性 {#scaling}

对象存储 ClickPipes 是根据通过 [配置的垂直自动扩展设置](/manage/scaling#configuring-vertical-auto-scaling) 确定的最小 ClickHouse 服务大小进行扩展的。ClickPipe 的大小在创建管道时确定。后续对 ClickHouse 服务设置的更改不会影响 ClickPipe 的大小。

为了提高大批量导入作业的吞吐量，建议在创建 ClickPipe 之前扩展 ClickHouse 服务。

## 限制 {#limitations}
- 对目标表、其物化视图（包括级联物化视图）或物化视图的目标表的任何更改不会被管道自动检测，可能会导致错误。您必须停止管道，进行必要的修改，然后重新启动管道，以便更改被检测到，避免由于重试而导致的错误和重复数据。
- 对支持的视图类型有限制。有关更多信息，请阅读 [精确一次的语义](#exactly-once-semantics) 和 [视图支持](#view-support) 部分。
- 对于在 GCP 或 Azure 部署的 ClickHouse Cloud 实例，S3 ClickPipes 不支持角色认证。仅支持 AWS ClickHouse Cloud 实例。
- ClickPipes 仅尝试导入大小为 10GB 或更小的对象。如果文件大于 10GB，将在 ClickPipes 的专用错误表中附加错误。
- S3 / GCS ClickPipes **不** 与 [S3 表函数](/sql-reference/table-functions/s3) 共享列出语法。
  - `?` — 替代任何单个字符
  - `*` — 替代任何数量的字符，包括空字符串
  - `**` — 替代任何数量的字符，包括空字符串

:::note
这是一个有效路径：

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz


这不是有效路径。`{N..M}` 在 ClickPipes 中不受支持。

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 持续导入 {#continuous-ingest}
ClickPipes 支持从 S3 和 GCS 持续导入。当启用时，ClickPipes 将持续从指定路径导入数据，每30秒轮询新文件。然而，新文件必须在词法上大于最后导入的文件，这意味着它们的命名方式必须定义导入顺序。例如，命名为 `file1`、`file2`、`file3` 等的文件将按顺序导入。如果添加了一个名为 `file0` 的新文件，ClickPipes 将不会导入它，因为它在词法上没有大于最后一个导入的文件。

## 归档表 {#archive-table}
ClickPipes 将在您的目标表旁创建一个后缀为 `s3_clickpipe_<clickpipe_id>_archive` 的表。该表将包含 ClickPipe 导入的所有文件的列表。此表用于跟踪导入过程中的文件，并可用于验证文件是否已被导入。归档表具有 [生存时间 (TTL)](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 为 7 天。

:::note
这些表无法通过 ClickHouse Cloud SQL 控制台查看，您需要通过 HTTPS 或原生连接等外部客户端连接以读取它们。
:::

## 认证 {#authentication}

### S3 {#s3}
您可以无配置访问公有存储桶，对于受保护的存储桶，您可以使用 [IAM 凭据](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 或 [IAM 角色](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)。您可以 [参考此指南](/cloud/security/secure-s3) 了解访问数据所需的权限。

### GCS {#gcs}
与 S3 类似，您可以无配置访问公有存储桶，对于受保护的存储桶，您可以使用 [HMAC 密钥](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) 代替 AWS IAM 凭据。您可以阅读 Google Cloud 的指南 [了解如何设置这些密钥](https://cloud.google.com/storage/docs/authentication/hmackeys)。

对于 GCS，服务账户并未直接支持。当使用非公有存储桶进行身份验证时，必须使用 HMAC (IAM) 凭据。
附加到 HMAC 凭据的服务账户权限应为 `storage.objects.list` 和 `storage.objects.get`。

## 常见问题 {#faq}

- **ClickPipes 是否支持以 `gs://` 开头的 GCS 存储桶？**

不支持。出于互操作性原因，我们要求您将 `gs://` 存储桶前缀替换为 `https://storage.googleapis.com/`。

- **GCS 公有存储桶需要什么权限？**

`allUsers` 需要适当的角色分配。`roles/storage.objectViewer` 角色必须在存储桶级别授予。此角色提供 `storage.objects.list` 权限，允许 ClickPipes 列出存储桶中的所有对象，这对于入驻和导入是必需的。该角色还包括 `storage.objects.get` 权限，允许读取或下载存储桶中的单个对象。有关更多信息，请参见：[Google Cloud 访问控制](https://cloud.google.com/storage/docs/access-control/iam-roles)。

