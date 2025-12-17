---
sidebar_label: '概览'
description: '将对象存储无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/object-storage/abs/overview
sidebar_position: 1
title: '将 Azure Blob Storage 与 ClickHouse Cloud 集成'
doc_type: 'guide'
---

import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

ABS ClickPipe 提供了一种完全托管且具备高可靠性的方式，将 Azure Blob Storage 中的数据摄取到 ClickHouse Cloud 中。它支持具有精确一次（exactly-once）语义的 **一次性摄取** 和 **持续摄取**。

可以通过 ClickPipes UI 手动部署和管理 ABS ClickPipes，也可以以编程方式使用 [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 和 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) 进行管理。


## 支持的格式 {#supported-formats}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 功能特性 {#features}

### 一次性摄取 {#one-time-ingestion}

ABS ClickPipe 会在一次批量操作中，将指定容器中所有与指定模式匹配的文件加载到目标 ClickHouse 表中。摄取任务完成后，ClickPipe 会自动停止。此一次性摄取模式提供严格一次（exactly-once）语义，确保每个文件都能被可靠处理且不会产生重复。

### 持续摄取 {#continuous-ingestion}

启用持续摄取后，ClickPipes 会持续从指定路径摄取数据。为了确定摄取顺序，ABS ClickPipe 依赖于文件的隐式[字典序](#continuous-ingestion-lexicographical-order)。

#### 字典序 {#continuous-ingestion-lexicographical-order}

ABS ClickPipe 假定文件按字典序（lexicographical order）被添加到容器中，并依赖这一隐含顺序按次序摄取文件。这意味着，任何新文件**必须**在字典序上大于最后一个已摄取的文件。例如，名为 `file1`、`file2` 和 `file3` 的文件会被依次摄取，但如果在容器中新增一个 `file 0`，它将被**忽略**，因为该文件名在字典序上并不大于最后一个已摄取的文件。

在此模式下，ABS ClickPipe 会对指定路径中的**所有文件**进行初始加载，然后以可配置的时间间隔轮询新文件（默认 30 秒）。**无法**从某个特定文件或时间点开始摄取——ClickPipes 始终会加载指定路径中的所有文件。

### 文件模式匹配 {#file-pattern-matching}

对象存储 ClickPipes 遵循 POSIX 标准进行文件模式匹配。所有模式都**区分大小写**，并且匹配容器名称之后的**完整路径**。为获得更好的性能，请尽可能使用更具体的模式（例如使用 `data-2024-*.csv` 而不是 `*.csv`）。

#### 支持的模式 {#supported-patterns}

| Pattern | 描述 | 示例 | 匹配结果 |
|---------|-------------|---------|---------|
| `?` | 精确匹配**单个**字符（不包括 `/` 字符） | `data-?.csv` | `data-1.csv`，`data-a.csv`，`data-x.csv` |
| `*` | 匹配**零个或多个**字符（不包括 `/` 字符） | `data-*.csv` | `data-1.csv`，`data-001.csv`，`data-report.csv`，`data-.csv` |
| `**` <br></br> 递归 | 匹配**零个或多个**字符（包括 `/` 字符），用于递归遍历目录。 | `logs/**/error.log` | `logs/error.log`，`logs/2024/error.log`，`logs/2024/01/error.log` |

**示例：**

* `https://storageaccount.blob.core.windows.net/container/folder/*.csv`
* `https://storageaccount.blob.core.windows.net/container/logs/**/data.json`
* `https://storageaccount.blob.core.windows.net/container/file-?.parquet`
* `https://storageaccount.blob.core.windows.net/container/data-2024-*.csv.gz`

#### 不支持的模式 {#unsupported-patterns}

| Pattern     | Description            | Example                | Alternatives                                |
|-------------|------------------------|------------------------|---------------------------------------------|
| `{abc,def}` | 大括号扩展（多选）     | `{logs,data}/file.csv` | 为每个路径分别创建一个 ClickPipes 实例。    |
| `{N..M}`    | 数字范围扩展           | `file-{1..100}.csv`    | 使用 `file-*.csv` 或 `file-?.csv`。        |

**示例：**

* `https://storageaccount.blob.core.windows.net/container/{documents-01,documents-02}.json`
* `https://storageaccount.blob.core.windows.net/container/file-{1..100}.csv`
* `https://storageaccount.blob.core.windows.net/container/{logs,metrics}/data.parquet`

### 精确一次语义 {#exactly-once-semantics}

在摄取大型数据集时，可能会发生各种类型的故障，从而导致部分插入或重复数据。Object Storage ClickPipes 对插入失败具有良好的容错性，并提供精确一次语义（exactly-once semantics）。这是通过使用临时的“staging”表实现的。数据首先被插入到 staging 表中。如果此插入出现问题，可以截断 staging 表，并从干净状态重试插入。只有当插入操作完成且成功后，才会将 staging 表中的分区移动到目标表中。要进一步了解这一策略，请查阅[这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。

### 虚拟列 {#virtual-columns}

要跟踪哪些文件已被摄取，请在列映射列表中添加 `_file` 虚拟列。`_file` 虚拟列包含源对象的文件名，可用于查询哪些文件已被处理。

## 访问控制 {#access-control}

### 权限 {#permissions}

ABS ClickPipe 仅支持私有容器，不支持公共容器。

容器的 bucket 策略中必须允许 [`s3:GetObject`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html) 和 [`s3:ListBucket`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) 操作。

### 身份验证 {#authentication}

:::note
当前不支持 Microsoft Entra ID 身份验证（包括 Managed Identities）。
:::

Azure Blob Storage 的身份验证使用[连接字符串](https://docs.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)，该字符串同时支持访问密钥和共享访问签名（SAS）。

#### 访问密钥 {#access-key}

要使用[账户访问密钥](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage)进行身份验证，请提供以下格式的连接字符串：

```bash
DefaultEndpointsProtocol=https;AccountName=storage-account-name;AccountKey=account-access-key;EndpointSuffix=core.windows.net
```

你可以在 Azure 门户中的 **Storage account &gt; Access keys** 下找到你的存储帐户名称和访问密钥。


#### 共享访问签名 (SAS) {#sas}

要使用[共享访问签名 (SAS)](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)进行身份验证，请提供包含 SAS 令牌的连接字符串：

```bash
BlobEndpoint=https://storage-account-name.blob.core.windows.net/;SharedAccessSignature=sas-token
```

在 Azure 门户中通过 **Storage Account &gt; Shared access signature** 生成一个 SAS 令牌，为你要摄取的容器和 blob 授予相应的权限（`Read`、`List`）。


## 高级设置 {#advanced-settings}

ClickPipes 提供了合理的默认值，能够满足大多数使用场景的需求。如果您的使用场景需要额外的微调，可以调整以下设置：

| Setting                            | Default value |  Description                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 单个插入批次中要处理的最大字节数。                                  |
| `Max file count`                   | 100           | 单个插入批次中要处理的最大文件数量。                          |
| `Max threads`                      | auto(3)       | 用于文件处理的[最大并发线程数](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | 用于文件处理的[最大并发插入线程数](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | 可以插入到数据表中的[数据块的最小字节大小](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [最大并发下载线程数](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | 配置在向 ClickHouse 集群插入数据之前的最大等待时间。 |
| `Parallel distributed insert select` | 2           | [并行分布式 INSERT SELECT 设置](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | 是否启用[并发而非顺序地](/operations/settings/settings#parallel_view_processing)推送到附加的 VIEW。 |
| `Use cluster function`             | true          | 是否在多个节点上并行处理文件。 |

<Image img={cp_advanced_settings} alt="ClickPipes 的高级设置" size="lg" border/>

### 扩缩容 {#scaling}

对象存储型 ClickPipes 会根据[配置的垂直自动扩缩容设置](/manage/scaling#configuring-vertical-auto-scaling)所确定的 ClickHouse 服务最小规格进行扩缩容。ClickPipe 的规格在创建该 ClickPipe 时确定。之后对 ClickHouse 服务设置所做的更改不会影响 ClickPipe 的规格。

要提高大型摄取任务的吞吐量，建议在创建 ClickPipe 之前先对 ClickHouse 服务进行扩容。

## 已知限制 {#known-limitations}

### 文件大小 {#file-size}

ClickPipes 只会尝试摄取大小不超过 **10GB** 的对象。如果某个文件大于 10GB，将会在 ClickPipes 专用的错误表中追加一条错误记录。

### 延迟 {#latency}

对于包含超过 100,000 个文件的容器，Azure Blob Storage 的 `LIST` 操作在检测新文件时会引入额外延迟，这会叠加在默认轮询间隔之上：

- **&lt; 100k 个文件**：约 30 秒（默认轮询间隔）
- **100k 个文件**：约 40–45 秒  
- **250k 个文件**：约 55–70 秒
- **500k+ 个文件**：可能超过 90 秒

对于[持续摄取](#continuous-ingestion)，ClickPipes 必须扫描容器，以识别文件名在字典序上大于上一次已摄取文件的新文件。我们建议将文件组织到多个较小的容器中，或使用分层目录结构，以减少每次列举操作中的文件数量。

### 视图支持 {#view-support}

目标表上的 materialized view 也受支持。ClickPipes 不仅会为目标表创建暂存表（staging table），也会为所有依赖该目标表的 materialized view 创建暂存表。

我们不会为非 materialized view 创建暂存表。这意味着，如果你的目标表存在一个或多个下游 materialized view，这些 materialized view 应避免通过基于目标表定义的普通视图来读取数据。否则，你可能会发现这些 materialized view 中会出现数据缺失的情况。

### 依赖项 {#dependencies}

在 ClickPipe 运行期间，对目标表、其 materialized views（包括级联 materialized views）或这些 materialized views 的目标表所做的任何更改，都会导致可重试的错误。若要对这些依赖项进行 schema 更改，应先暂停 ClickPipe，完成更改后再恢复运行。