---
sidebar_label: '概览'
description: '将对象存储与 ClickHouse Cloud 无缝连接。'
slug: /integrations/clickpipes/object-storage/gcs/overview
sidebar_position: 1
title: '将 Google Cloud Storage 与 ClickHouse Cloud 集成'
doc_type: 'guide'
---

import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_iam.png';
import cp_credentials from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/google-cloud-storage/cp_credentials.png';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import Image from '@theme/IdealImage';

GCS ClickPipe 提供了一种完全托管且具备高可靠性的方式，用于从 Google Cloud Storage (GCS) 摄取数据。它同时支持具有 exactly-once 语义的 **一次性摄取** 和 **持续摄取**。

可以通过 ClickPipes UI 手动部署和管理 GCS ClickPipes，也可以以编程方式使用 [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 和 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) 进行管理。


## 支持的格式 \{#supported-formats\}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 功能 \{#features\}

### 一次性摄取 \{#one-time-ingestion\}

默认情况下，GCS ClickPipe 会在一次批处理操作中，从指定 bucket 中按模式匹配将所有文件加载到 ClickHouse 目标表中。摄取任务完成后，ClickPipe 会自动停止。此一次性摄取模式提供精确一次（exactly-once）语义，确保每个文件都能被可靠处理且不会产生重复。

### 持续摄取 \{#continuous-ingestion\}

启用持续摄取后，ClickPipes 会从指定路径持续摄取数据。为确定摄取顺序，GCS ClickPipe 依赖文件的隐式[字典序](#continuous-ingestion-lexicographical-order)。

#### Lexicographical order \{#continuous-ingestion-lexicographical-order\}

GCS ClickPipe 假定文件是按词典序添加到存储桶中的，并依赖这种隐式顺序按顺序摄取文件。也就是说，任何新文件**必须**在词典序上大于上一次已摄取的文件。例如，名为 `file1`、`file2` 和 `file3` 的文件会被依次摄取，但如果在存储桶中新增一个 `file 0` 文件，它将会被**忽略**，因为该文件名在词典序上并不大于最后一个已摄取的文件。

在此模式下，GCS ClickPipe 会对指定路径中的**所有文件**进行一次初始加载，然后按可配置的时间间隔轮询以发现新文件（默认 30 秒）。**无法**从某个特定文件或时间点开始摄取——ClickPipes 将始终加载指定路径中的所有文件。

### 文件模式匹配 \{#file-pattern-matching\}

面向对象存储的 ClickPipes 遵循 POSIX 标准的文件模式匹配规则。所有模式都**区分大小写**，并且匹配的是桶名称之后的**完整路径**。为获得更好的性能，请使用尽可能具体的模式（例如使用 `data-2024-*.csv` 而不是 `*.csv`）。

#### 支持的模式 \{#supported-patterns\}

| Pattern | 描述 | 示例 | 匹配结果 |
|---------|-------------|---------|---------|
| `?` | 精确匹配 **一个** 字符（不包含 `/`） | `data-?.csv` | `data-1.csv`、`data-a.csv`、`data-x.csv` |
| `*` | 匹配 **零个或多个** 字符（不包含 `/`） | `data-*.csv` | `data-1.csv`、`data-001.csv`、`data-report.csv`、`data-.csv` |
| `**` <br></br> 递归 | 匹配 **零个或多个** 字符（包含 `/`），支持递归目录遍历。 | `logs/**/error.log` | `logs/error.log`、`logs/2024/error.log`、`logs/2024/01/error.log` |

**示例：**

* `https://bucket.s3.amazonaws.com/folder/*.csv`
* `https://bucket.s3.amazonaws.com/logs/**/data.json`
* `https://bucket.s3.amazonaws.com/file-?.parquet`
* `https://bucket.s3.amazonaws.com/data-2024-*.csv.gz`

#### 不支持的模式 \{#unsupported-patterns\}

| Pattern     | Description        | Example                | Alternatives                        |
|-------------|--------------------|------------------------|-------------------------------------|
| `{abc,def}` | 大括号展开 - 备用形式 | `{logs,data}/file.csv` | 为每个路径分别创建 ClickPipes。     |
| `{N..M}`    | 数值范围展开       | `file-{1..100}.csv`    | 使用 `file-*.csv` 或 `file-?.csv`。 |

**示例：**

* `https://bucket.s3.amazonaws.com/{documents-01,documents-02}.json`
* `https://bucket.s3.amazonaws.com/file-{1..100}.csv`
* `https://bucket.s3.amazonaws.com/{logs,metrics}/data.parquet`

### Exactly-once 语义 \{#exactly-once-semantics\}

在摄取大型数据集时，可能会发生各种类型的故障，从而导致部分插入或产生重复数据。Object Storage ClickPipes 能够抵御插入失败，并提供 Exactly-once 语义。其实现方式是使用临时的“暂存”（staging）表。数据首先被插入到暂存表中。如果此次插入出现问题，可以截断暂存表，并在干净状态下重试插入。只有当一次插入完成且成功后，暂存表中的分区才会被移动到目标表。要进一步了解这一策略，请参阅[这篇博客文章](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。

### 虚拟列 \{#virtual-columns\}

要跟踪哪些文件已被摄取，请在列映射列表中加入 `_file` 虚拟列。`_file` 虚拟列包含源对象的文件名，可用于查询哪些文件已被处理。

## 访问控制 \{#access-control\}

### 权限 \{#permissions\}

GCS ClickPipe 支持公共和私有存储桶。**不**支持 [Requester Pays](https://docs.cloud.google.com/storage/docs/requester-pays) 存储桶。

必须在存储桶级别授予 [`roles/storage.objectViewer`](https://docs.cloud.google.com/storage/docs/access-control/iam-roles#storage.objectViewer) 角色。该角色包含 [`storage.objects.list`](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/list) 和 [`storage.objects.get`](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/get#required-permissions) 这两个 IAM 权限，使 ClickPipes 可以在指定的存储桶中列出并获取对象。

### 身份验证 \{#authentication\}

:::note
当前不支持使用服务账户进行身份验证。
:::

#### HMAC 凭证 \{#hmac-credentials\}

要使用 [HMAC keys](https://docs.cloud.google.com/storage/docs/authentication/hmackeys) 进行身份验证，在设置 ClickPipe 连接时，在 **Authentication method** 中选择 `Credentials`。然后分别在 `Access key` 和 `Secret key` 中提供访问密钥（例如 `GOOGTS7C7FUP3AIRVJTE2BCDKINBTES3HC2GY5CBFJDCQ2SYHV6A6XXVTJFSA`）和秘密密钥（例如 `bGoa+V7g/yqDXvKRqq+JTFn4uQZbPiQJo4pf9RzJ`）。

<Image img={cp_credentials} alt="用于 GCS ClickPipes 的 HMAC 凭证" size="lg" border/>

请参阅[本指南](https://clickhouse.com/docs/integrations/gcs#create-a-service-account-hmac-key-and-secret)来创建带有 HMAC 密钥的服务账号。

### 网络访问 \{#network-access\}

GCS ClickPipes 在元数据发现和数据摄取时使用两条不同的网络路径：分别是 ClickPipes 服务和 ClickHouse Cloud 服务。如果希望配置额外一层网络安全（例如出于合规要求），则**必须为这两条路径都配置网络访问**。

* 对于**基于 IP 的访问控制**，你的 GCS 存储桶的 [IP 过滤规则](https://docs.cloud.google.com/storage/docs/ip-filtering-overview)必须允许 ClickPipes 服务区域在[此处](/integrations/clickpipes#list-of-static-ips)列出的静态 IP，以及 ClickHouse Cloud 服务的[静态 IP](/manage/data-sources/cloud-endpoints-api)。要获取所用 ClickHouse Cloud 区域的静态 IP，请打开终端并运行：

    ```bash
    # 将 <your-region> 替换为你的 ClickHouse Cloud 区域
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.gcp[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

## 高级设置 \{#advanced-settings\}

ClickPipes 提供了合理的默认配置，能够满足大多数使用场景的需求。如果你的场景需要进一步微调，可以调整以下设置：

| Setting                            | Default value |  Description                     |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 单个插入批次中要处理的字节数。                                  |
| `Max file count`                   | 100           | 单个插入批次中要处理的最大文件数量。                          |
| `Max threads`                      | auto(3)       | 用于文件处理的[最大并发线程数](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | 用于文件处理的[最大并发插入线程数](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | [可插入到表中的数据块的最小字节数](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [最大并发下载线程数](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | 配置在向 ClickHouse 集群插入数据前的最大等待时间。 |
| `Parallel distributed insert select` | 2           | [并行分布式 INSERT SELECT 设置](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | 是否[并发而非串行](/operations/settings/settings#parallel_view_processing)向附加的 VIEW 推送数据。 |
| `Use cluster function`             | true          | 是否在多个节点上并行处理文件。 |

<Image img={cp_advanced_settings} alt="ClickPipes 的高级设置" size="lg" border/>

### 扩展 \{#scaling\}

Object Storage ClickPipes 的规模取决于由[已配置的垂直自动扩缩设置](/manage/scaling#configuring-vertical-auto-scaling)确定的 ClickHouse 服务最小规格。ClickPipe 的规格会在创建时确定。之后对 ClickHouse 服务设置所做的更改不会影响 ClickPipe 的规格。

要提升大规模摄取任务的吞吐量，我们建议在创建 ClickPipe 之前先扩容 ClickHouse 服务。

## 已知限制 \{#known-limitations\}

### 文件大小 \{#file-size\}

ClickPipes 只会尝试摄取大小不超过 **10GB** 的对象。如果某个文件大于 10GB，将在 ClickPipes 专用错误表中追加一条错误记录。

### 兼容性 \{#compatibility\}

为实现互操作性，GCS ClickPipe 使用了 Cloud Storage 的 [XML API](https://docs.cloud.google.com/storage/docs/interoperability)，这要求使用 `https://storage.googleapis.com/` 作为 bucket 前缀（而不是 `gs://`），并使用 [HMAC keys](https://docs.cloud.google.com/storage/docs/authentication/hmackeys) 进行身份验证。

### 视图支持 \{#view-support\}

目标表上的 materialized view 也受支持。ClickPipes 不仅会为目标表创建 staging 表，还会为所有依赖它的 materialized view 创建 staging 表。

我们不会为非 materialized view 创建 staging 表。这意味着，如果你的目标表存在一个或多个下游的 materialized view，这些 materialized view 应避免通过中间的视图从目标表中选择数据。否则，你可能会发现在这些 materialized view 中出现数据缺失的情况。