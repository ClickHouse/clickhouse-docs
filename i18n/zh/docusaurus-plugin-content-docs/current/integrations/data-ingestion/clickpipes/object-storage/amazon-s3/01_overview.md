---
sidebar_label: '概览'
description: '将对象存储无缝连接到 ClickHouse Cloud。'
slug: /integrations/clickpipes/object-storage/s3/overview
sidebar_position: 1
title: '将 Amazon S3 与 ClickHouse Cloud 集成'
doc_type: 'guide'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import R2svg from '@site/static/images/integrations/logos/cloudflare.svg';
import cp_advanced_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_advanced_settings.png';
import cp_iam from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_iam.png';
import cp_credentials from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_credentials.png';
import Image from '@theme/IdealImage';

S3 ClickPipe 提供了一种完全托管且高可用的方式，将数据从 Amazon S3 和兼容 S3 的对象存储中摄取到 ClickHouse Cloud 中。它支持具有精确一次语义的**一次性摄取**和**持续摄取**。

可以通过 ClickPipes UI 手动部署和管理 S3 ClickPipes，也可以通过 [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) 和 [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe) 以编程方式进行部署和管理。


## 支持的数据源 {#supported-data-sources}

| 名称                 | 标志 | 详情           |
|----------------------|------|-------------------|
| **Amazon S3**            | <S3svg class="image" alt="Amazon S3 徽标" style={{width: '2.5rem', height: 'auto'}}/> | 持续摄取默认要求按[词典序](#continuous-ingestion-lexicographical-order)排序，但可以配置为[以任意顺序摄取文件](#continuous-ingestion-any-order)。 |
| **Cloudflare R2** <br></br> _兼容 S3_ | <R2svg class="image" alt="Cloudflare R2 徽标" style={{width: '2.5rem', height: 'auto'}}/> | 持续摄取要求按[词典序](#continuous-ingestion-lexicographical-order)排序。 |
| **DigitalOcean Spaces** <br></br> _兼容 S3_ | <DOsvg class="image" alt="Digital Ocean 徽标" style={{width: '2.5rem', height: 'auto'}}/>|  持续摄取要求按[词典序](#continuous-ingestion-lexicographical-order)排序。 |

:::tip
由于各对象存储服务提供商在 URL 格式和 API 实现上的差异，并非所有兼容 S3 的服务都能直接获得支持。如果您在使用上面未列出的服务时遇到问题，请[联系我们的团队](https://clickhouse.com/company/contact?loc=clickpipes)。
:::

## 支持的格式 {#supported-formats}

- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [TSV](/interfaces/formats/TabSeparated)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## 功能特性 {#features}

### 一次性摄取 {#one-time-ingestion}

默认情况下，S3 ClickPipe 会在一次批处理操作中，将指定 bucket 中所有与指定模式匹配的文件加载到 ClickHouse 目标表中。摄取任务完成后，ClickPipe 会自动停止。此一次性摄取模式提供精确一次（exactly-once）语义，确保每个文件都能被可靠处理且不会出现重复。

### 持续摄取 {#continuous-ingestion}

启用持续摄取后，ClickPipes 会从指定路径持续摄取数据。默认情况下，S3 ClickPipe 依赖文件的隐式[字典序](#continuous-ingestion-lexicographical-order)来确定摄取顺序。也可以通过使用连接到该存储桶的 [Amazon SQS](https://aws.amazon.com/sqs/) 队列，将其配置为以[任意顺序](#continuous-ingestion-any-order)摄取文件。

#### 词典序 {#continuous-ingestion-lexicographical-order}

默认情况下，S3 ClickPipe 假定文件是按照词典序依次添加到存储桶（bucket）中，并依赖这种隐式顺序顺序摄取文件。这意味着任何新文件**必须**在词典序上大于上一个已摄取的文件。举例来说，命名为 `file1`、`file2` 和 `file3` 的文件会按顺序被摄取，但如果向存储桶中添加一个新的 `file 0`，它将被**忽略**，因为该文件名在词典序上并不大于上一个已摄取的文件。

在此模式下，S3 ClickPipe 会对指定路径中的**所有文件**进行初始加载，然后以可配置的时间间隔轮询新文件（默认 30 秒）。**无法**从某个特定文件或时间点开始摄取——ClickPipes 始终会加载指定路径中的所有文件。

#### 任意顺序 {#continuous-ingestion-any-order}

:::note
无序模式**仅**支持 Amazon S3，且**不**支持公共存储桶。需要为该存储桶配置一个 [Amazon SQS](https://aws.amazon.com/sqs/) 队列。
:::

可以通过为存储桶配置一个 [Amazon SQS](https://aws.amazon.com/sqs/) 队列，将 S3 ClickPipe 配置为摄取没有隐式顺序的文件。这样 ClickPipes 就可以监听对象创建事件，并摄取任何新文件，而不受文件命名约定的限制。

在此模式下，S3 ClickPipe 会对选定路径中的**所有文件**进行初始加载，然后在队列中监听与指定路径匹配的 `ObjectCreated:*` 事件。针对已处理过的文件、路径不匹配的文件或其他类型事件的任何消息都将被**忽略**。

:::note
为事件设置前缀/后缀是可选的。如果设置，确保它与 ClickPipe 配置的路径匹配。S3 不允许针对相同事件类型配置多个重叠的通知规则。
:::

文件会在达到 `max insert bytes` 或 `max file count` 中配置的阈值后被摄取，或者在经过一个可配置的时间间隔后被摄取（默认 30 秒）。**无法**从某个特定文件或时间点开始摄取——ClickPipes 始终会加载选定路径中的所有文件。如果配置了 DLQ，失败的消息将被重新入队并重新处理，最多重试 DLQ 中 `maxReceiveCount` 参数配置的次数。

:::tip
我们强烈建议为 SQS 队列配置**死信队列（Dead-Letter-Queue，DLQ）**，以便更容易调试和重试失败的消息。
:::

##### SNS to SQS {#sns-to-sqs}

也可以通过 SNS 主题将 S3 事件通知发送到 SQS。当直接 S3 → SQS 集成的某些限制条件成为问题时，可以采用这种方式。在这种情况下，需要启用 [raw message delivery](https://docs.aws.amazon.com/sns/latest/dg/sns-large-payload-raw-message-delivery.html) 选项。

### 文件模式匹配 {#file-pattern-matching}

对象存储 ClickPipes 遵循 POSIX 标准的文件模式匹配规则。所有模式均**区分大小写**，并且匹配的是桶名之后的**完整路径**。为获得更好的性能，请尽可能使用更具体的模式（例如使用 `data-2024-*.csv` 而不是 `*.csv`）。

#### 支持的模式 {#supported-patterns}

| 模式 | 描述 | 示例 | 匹配结果 |
|---------|-------------|---------|---------|
| `?` | 精确匹配**一个**字符（不包含 `/`） | `data-?.csv` | `data-1.csv`, `data-a.csv`, `data-x.csv` |
| `*` | 匹配**零个或多个**字符（不包含 `/`） | `data-*.csv` | `data-1.csv`, `data-001.csv`, `data-report.csv`, `data-.csv` |
| `**` <br></br> 递归 | 匹配**零个或多个**字符（包含 `/`），并启用 **递归目录遍历**。 | `logs/**/error.log` | `logs/error.log`, `logs/2024/error.log`, `logs/2024/01/error.log` |

**示例：**

* `https://bucket.s3.amazonaws.com/folder/*.csv`
* `https://bucket.s3.amazonaws.com/logs/**/data.json`
* `https://bucket.s3.amazonaws.com/file-?.parquet`
* `https://bucket.s3.amazonaws.com/data-2024-*.csv.gz`

#### 不支持的模式 {#unsupported-patterns}

| Pattern     | Description        | Example                | Alternatives                              |
|-------------|--------------------|------------------------|-------------------------------------------|
| `{abc,def}` | 花括号展开         | `{logs,data}/file.csv` | 为每个路径创建单独的 ClickPipes。        |
| `{N..M}`    | 数值范围展开       | `file-{1..100}.csv`    | 使用 `file-*.csv` 或 `file-?.csv`。      |

**示例：**

* `https://bucket.s3.amazonaws.com/{documents-01,documents-02}.json`
* `https://bucket.s3.amazonaws.com/file-{1..100}.csv`
* `https://bucket.s3.amazonaws.com/{logs,metrics}/data.parquet`

### 精确一次语义 {#exactly-once-semantics}

在摄取大规模数据集时可能会发生各种类型的故障，从而导致只插入了部分数据或出现重复数据。Object Storage ClickPipes 能够很好地应对插入失败，并提供精确一次（exactly-once）语义。其实现方式是使用临时的 “staging” 表。数据首先被插入到 staging 表中。如果此次插入出现问题，可以截断 staging 表，并在干净状态下重试插入。只有在一次插入完成且成功之后，staging 表中的分区才会被迁移到目标表。要进一步了解这一策略，请参阅[这篇博文](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)。

### 虚拟列 {#virtual-columns}

要跟踪哪些文件已被摄取，请在列映射列表中包含 `_file` 虚拟列。`_file` 虚拟列包含源对象的文件名，可用于查询哪些文件已被处理。

## 访问控制 {#access-control}

### 权限 {#permissions}

S3 ClickPipe 支持公共和私有存储桶。[Requester Pays](https://docs.aws.amazon.com/AmazonS3/latest/userguide/RequesterPaysBuckets.html) 类型的存储桶**不**受支持。

#### S3 存储桶 {#s3-bucket}

存储桶必须在其存储桶策略中允许以下操作：

* [`s3:GetObject`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html)
* [`s3:ListBucket`](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html)

#### SQS 队列 {#sqs-queue}

在使用[无序模式](#continuous-ingestion-any-order)时，SQS 队列策略中必须允许以下操作：

* [`sqs:ReceiveMessage`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ReceiveMessage.html)
* [`sqs:DeleteMessage`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessage.html)
* [`sqs:GetQueueAttributes`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_GetQueueAttributes.html)
* [`sqs:ListQueues`](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ListQueues.html)

### 身份验证 {#authentication}

#### IAM 凭证 {#iam-credentials}

要使用 [access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 进行身份验证，在设置 ClickPipe 连接时，在 **Authentication method** 下选择 `Credentials`。然后分别在 `Access key` 和 `Secret key` 中填写访问密钥 ID（例如 `AKIAIOSFODNN7EXAMPLE`）和秘密访问密钥（例如 `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`）。

<Image img={cp_credentials} alt="用于 S3 ClickPipes 的 IAM 凭证" size="lg" border/>

#### IAM 角色 {#iam-role}

要使用[基于角色的访问控制](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)进行身份验证，请在设置 ClickPipe 连接时，将 **Authentication method** 设置为 `IAM role`。

<Image img={cp_iam} alt="S3 ClickPipes 的 IAM 认证" size="lg" border/>

请按照[本指南](/cloud/data-sources/secure-s3)中的说明，[创建一个 IAM 角色](/cloud/data-sources/secure-s3#option-2-manually-create-iam-role)，并为 S3 访问配置所需的信任策略。然后，在 `IAM role ARN` 字段中填写该 IAM 角色的 ARN。

### 网络访问 {#network-access}

S3 ClickPipes 会使用两条不同的网络路径分别执行元数据发现和数据摄取：分别通过 ClickPipes 服务和 ClickHouse Cloud 服务。如果你希望配置额外一层网络安全（例如出于合规性原因），则 **必须为这两条路径都配置网络访问**。

* 对于 **基于 IP 的访问控制**，S3 存储桶策略必须同时允许 ClickPipes 服务区域中列出的静态 IP（见[此处](/integrations/clickpipes#list-of-static-ips)），以及 ClickHouse Cloud 服务的[静态 IP](/manage/data-sources/cloud-endpoints-api)。要获取你所使用的 ClickHouse Cloud 区域的静态 IP，请打开终端并运行：

    ```bash
    # 将 <your-region> 替换为你的 ClickHouse Cloud 区域
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .egress_ips[]'
    ```

* 对于 **基于 VPC endpoint 的访问控制**，S3 存储桶必须与 ClickHouse Cloud 服务处于同一 region，并且将 `GetObject` 操作限制为 ClickHouse Cloud 服务的 VPC endpoint ID。要获取你所使用的 ClickHouse Cloud 区域的 VPC endpoint，请打开终端并运行：

    ```bash
    # 将 <your-region> 替换为你的 ClickHouse Cloud 区域
    curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .s3_endpoints[]'
    ```

## 高级设置 {#advanced-settings}

ClickPipes 提供了合理的默认值，能够满足大多数用例的需求。如果您的用例需要进一步微调，可以调整以下设置：

| 设置                                | 默认值        |  描述                                |                    
|------------------------------------|---------------|---------------------------------------------------------------------------------------|
| `Max insert bytes`                 | 10GB          | 单个插入批次中要处理的字节数。                                  |
| `Max file count`                   | 100           | 单个插入批次中要处理的最大文件数。                          |
| `Max threads`                      | auto(3)       | 用于文件处理的[最大并发线程数](/operations/settings/settings#max_threads)。 |
| `Max insert threads`               | 1             | 用于插入操作的[最大并发插入线程数](/operations/settings/settings#max_insert_threads)。 |
| `Min insert block size bytes`      | 1GB           | 可以插入到表中的[数据块的最小字节大小](/operations/settings/settings#min_insert_block_size_bytes)。 |
| `Max download threads`             | 4             | [最大并发下载线程数](/operations/settings/settings#max_download_threads)。 |
| `Object storage polling interval`  | 30s           | 用于配置在向 ClickHouse 集群插入数据前的最大等待时间。 |
| `Parallel distributed insert select` | 2           | [并行分布式 insert select 设置](/operations/settings/settings#parallel_distributed_insert_select)。 |
| `Parallel view processing`         | false         | 是否启用[并发而非顺序](/operations/settings/settings#parallel_view_processing)地向附加的 VIEW 推送数据。 |
| `Use cluster function`             | true          | 是否在多个节点之间并行处理文件。 |

<Image img={cp_advanced_settings} alt="ClickPipes 的高级设置" size="lg" border/>

### 扩缩容 {#scaling}

Object Storage ClickPipes 的扩缩容基于 [已配置的纵向自动扩缩容设置](/manage/scaling#configuring-vertical-auto-scaling) 所确定的 ClickHouse 服务最小规格。ClickPipe 的规格在创建 ClickPipe 时确定。之后对 ClickHouse 服务设置所做的更改不会影响 ClickPipe 的规格。

若要提高大型摄取作业的吞吐量，建议在创建 ClickPipe 之前先对 ClickHouse 服务进行扩容。

## 已知限制 {#known-limitations}

### 文件大小 {#file-size}

ClickPipes 只会尝试摄取大小不超过 **10GB** 的对象。若文件大于 10GB，则会在 ClickPipes 的专用错误表中追加一条错误记录。

### 兼容性 {#compatibility}

尽管具备 S3 兼容性，但某些服务使用了不同的 URL 结构，可能导致 S3 ClickPipe 无法解析（例如 Backblaze B2），或者需要与特定云厂商的队列服务集成，才能实现持续的、无序的摄取。如果您在使用未列在[支持的数据源](#supported-data-sources)中的服务时遇到问题，请[联系我们的团队](https://clickhouse.com/company/contact?loc=clickpipes)。

### 视图支持 {#view-support}

目标表上的 materialized view 也受支持。ClickPipes 不仅会为目标表创建暂存表（staging table），还会为所有依赖的 materialized view 创建暂存表。

我们不会为普通（非 materialized view）视图创建暂存表。这意味着，如果您的目标表有一个或多个下游的 materialized view，这些 materialized view 应避免通过另一个视图（view）从目标表中读取数据。否则，可能会导致该 materialized view 中出现数据缺失。