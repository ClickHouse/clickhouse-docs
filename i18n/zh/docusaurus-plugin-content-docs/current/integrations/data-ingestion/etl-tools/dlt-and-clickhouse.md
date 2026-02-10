---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', '连接', '集成', 'etl', '数据集成']
description: '使用 dlt 集成将数据加载到 ClickHouse'
title: '将 dlt 连接到 ClickHouse'
slug: /integrations/data-ingestion/etl-tools/dlt-and-clickhouse
doc_type: 'guide'
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# 将 dlt 连接到 ClickHouse \{#connect-dlt-to-clickhouse\}

<PartnerBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> 是一个开源库，你可以将其添加到 Python 脚本中，将来自各种（且往往杂乱的）数据源的数据加载到结构良好、实时更新的数据集中。

## 安装适用于 ClickHouse 的 dlt \{#install-dlt-with-clickhouse\}

### 安装包含 ClickHouse 依赖的 `dlt` 库： \{#to-install-the-dlt-library-with-clickhouse-dependencies\}

```bash
pip install "dlt[clickhouse]"
```

## 设置指南 \{#setup-guide\}

<VerticalStepper headerLevel="h3">

### 初始化 dlt 项目 \{#1-initialize-the-dlt-project\}

首先按以下方式初始化一个新的 `dlt` 项目:

```bash
dlt init chess clickhouse
```

:::note
此命令将初始化您的数据管道,使用 chess 作为数据源,ClickHouse 作为目标数据库。
:::

上述命令会生成多个文件和目录,包括 `.dlt/secrets.toml` 和 ClickHouse 的依赖项文件。您可以按以下方式执行该文件来安装其中指定的必要依赖项:

```bash
pip install -r requirements.txt
```

或使用 `pip install dlt[clickhouse]`,该命令会安装 `dlt` 库以及将 ClickHouse 作为目标数据库所需的必要依赖项。

### 设置 ClickHouse 数据库 \{#2-setup-clickhouse-database\}

要将数据加载到 ClickHouse 中,您需要创建一个 ClickHouse 数据库。以下是您应执行的基本步骤:

1. 您可以使用现有的 ClickHouse 数据库或创建一个新数据库。

2. 要创建新数据库,请使用 `clickhouse-client` 命令行工具或您选择的 SQL 客户端连接到 ClickHouse 服务器。

3. 运行以下 SQL 命令以创建新数据库、用户并授予必要的权限:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 添加凭据 \{#3-add-credentials\}

接下来,在 `.dlt/secrets.toml` 文件中配置 ClickHouse 凭据,如下所示:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # The database name you created
username = "dlt"                         # ClickHouse username, default is usually "default"
password = "Dlt*12345789234567"          # ClickHouse password if any
host = "localhost"                       # ClickHouse server host
port = 9000                              # ClickHouse HTTP port, default is 9000
http_port = 8443                         # HTTP Port to connect to ClickHouse server's HTTP interface. Defaults to 8443.
secure = 1                               # Set to 1 if using HTTPS, else 0.

[destination.clickhouse]
dataset_table_separator = "___"          # Separator for dataset table names from dataset.
```

:::note HTTP_PORT
`http_port` 参数指定连接到 ClickHouse 服务器 HTTP 接口时使用的端口号。这与默认端口 9000 不同,后者用于原生 TCP 协议。

如果您未使用外部暂存(即未在管道中设置 staging 参数),则必须设置 `http_port`。这是因为内置的 ClickHouse 本地存储暂存使用 <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse-connect</a> 库,该库通过 HTTP 与 ClickHouse 通信。

确保您的 ClickHouse 服务器已配置为在 `http_port` 指定的端口上接受 HTTP 连接。例如,如果您设置 `http_port = 8443`,则 ClickHouse 应在端口 8443 上监听 HTTP 请求。如果您使用外部暂存,则可以省略 `http_port` 参数,因为在这种情况下不会使用 clickhouse-connect。
:::

您可以传递类似于 `clickhouse-driver` 库所使用的数据库连接字符串。上述凭据将如下所示:

```bash
# keep it at the top of your toml file, before any section starts.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

</VerticalStepper>

## 写入方式 \{#write-disposition\}

支持所有[写入方式](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)。

dlt 库中的写入方式定义了数据应如何写入目标端。写入方式有三种类型：

**Replace**：这种方式会用资源中的数据替换目标端的数据。在加载数据之前，它会删除所有类和对象，并重新创建 schema。你可以在<a href="https://dlthub.com/docs/general-usage/full-loading">此处</a>了解更多信息。

**Merge**：这种写入方式会将资源中的数据与目标端的数据合并。对于 `merge` 方式，你需要为资源指定一个 `primary_key`。你可以在<a href="https://dlthub.com/docs/general-usage/incremental-loading">此处</a>了解更多信息。

**Append**：这是默认方式。它会将数据追加到目标端已有的数据之后，并忽略 `primary_key` 字段。

## 数据加载 \{#data-loading\}
根据数据源的不同，会采用最高效的方法将数据加载到 ClickHouse 中：

- 对于本地文件，使用 `clickhouse-connect` 库，通过 `INSERT` 命令将文件直接加载到 ClickHouse 表中。
- 对于存储在 `S3`、`Google Cloud Storage` 或 `Azure Blob Storage` 等远程存储中的文件，使用 ClickHouse 表函数（如 s3、gcs 和 azureBlobStorage）读取文件并将数据插入到表中。

## 数据集 \{#datasets\}

`ClickHouse` 不支持在单个数据库中使用多个数据集，而 `dlt` 由于多种原因依赖于数据集。为了使 `ClickHouse` 能够与 `dlt` 协同工作，`dlt` 在您的 `ClickHouse` 数据库中生成的表会在名称前添加数据集名称作为前缀，并与表名通过可配置的 `dataset_table_separator` 分隔。此外，还会创建一个不包含任何数据的特殊哨兵表，使 `dlt` 能够识别在某个 `ClickHouse` 目标中已经存在哪些虚拟数据集。

## 支持的文件格式 \{#supported-file-formats\}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> 是直接加载和暂存阶段的首选格式。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> 也支持用于直接加载和暂存。

`clickhouse` 目标端相较于默认的 SQL 目标端有一些特定差异：

1. `Clickhouse` 提供实验性的 `object` 数据类型，但我们发现其行为略显不可预测，因此 dlt clickhouse 目标端会将复杂数据类型加载到一个 `text` 列中。如果你需要此功能，请在我们的 Slack 社区与我们联系，我们会考虑添加支持。
2. `Clickhouse` 不支持 `time` 数据类型。`time` 将被加载到一个 `text` 列中。
3. `Clickhouse` 不支持 `binary` 数据类型。相应地，二进制数据会被加载到一个 `text` 列中。从 `jsonl` 加载时，二进制数据将是一个 base64 字符串；从 parquet 加载时，`binary` 对象会被转换为 `text`。
5. `Clickhouse` 允许向已有数据的表中添加非空列。
6. 在某些条件下，`Clickhouse` 在使用 float 或 double 数据类型时可能会产生舍入误差。如果你无法接受舍入误差，请务必使用 decimal 数据类型。例如，将值 12.7001 加载到一个 double 列，并且加载器文件格式设为 `jsonl` 时，将会可预期地产生舍入误差。

## 支持的列提示 \{#supported-column-hints\}
ClickHouse 支持以下<a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">列提示</a>：

- `primary_key` — 将该列标记为主键的一部分。多列都可以使用此提示来创建复合主键。

## 表引擎 \{#table-engine\}

默认情况下，ClickHouse 中创建的表使用 `ReplicatedMergeTree` 表引擎。使用 ClickHouse 适配器时，可以通过 `table_engine_type` 指定其他表引擎：

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

支持的值如下：

* `merge_tree` - 使用 `MergeTree` 引擎创建表
* `replicated_merge_tree`（默认）- 使用 `ReplicatedMergeTree` 引擎创建表

## 暂存（staging）支持 \{#staging-support\}

ClickHouse 支持将 Amazon S3、Google Cloud Storage 和 Azure Blob Storage 用作文件暂存目标位置。

`dlt` 会将 Parquet 或 jsonl 文件上传到暂存位置，并使用 ClickHouse 的表函数（table functions）直接从这些暂存文件中加载数据。

请参考文件系统（filesystem）文档以了解如何为暂存目标位置配置凭证：

* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
* <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

要在启用暂存功能的情况下运行 pipeline：

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```

### 将 Google Cloud Storage 用作暂存区域 \{#using-google-cloud-storage-as-a-staging-area\}

在将数据加载到 ClickHouse 时，dlt 支持使用 Google Cloud Storage (GCS) 作为暂存区域。此功能由 ClickHouse 的 <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS table function</a> 自动处理，dlt 在内部会调用该函数。

ClickHouse 的 GCS table function 仅支持使用基于哈希的消息认证码（Hash-based Message Authentication Code，HMAC）密钥进行身份验证。为此，GCS 提供了 S3 兼容模式，用于模拟 Amazon S3 API。ClickHouse 利用这一点，通过其 S3 集成来访问 GCS 存储桶（bucket）。

要在 dlt 中使用 HMAC 身份验证配置 GCS 暂存区域：

1. 按照 <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud 指南</a> 为你的 GCS 服务账号创建 HMAC 密钥。

2. 在 dlt 项目 `config.toml` 中的 ClickHouse 目标配置中，为你的服务账号配置 HMAC 密钥以及 `client_email`、`project_id` 和 `private_key`：

```bash
[destination.filesystem]
bucket_url = "gs://dlt-ci"

[destination.filesystem.credentials]
project_id = "a-cool-project"
client_email = "my-service-account@a-cool-project.iam.gserviceaccount.com"
private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkaslkdjflasjnkdcopauihj...wEiEx7y+mx\nNffxQBqVVej2n/D93xY99pM=\n-----END PRIVATE KEY-----\n"

[destination.clickhouse.credentials]
database = "dlt"
username = "dlt"
password = "Dlt*12345789234567"
host = "localhost"
port = 9440
secure = 1
gcp_access_key_id = "JFJ$$*f2058024835jFffsadf"
gcp_secret_access_key = "DFJdwslf2hf57)%$02jaflsedjfasoi"
```

注意：除了 HMAC 密钥 `bashgcp_access_key_id` 和 `gcp_secret_access_key` 之外，你现在还需要在 `[destination.filesystem.credentials]` 下为你的服务账号提供 `client_email`、`project_id` 和 `private_key`。这是因为当前对 GCS staging 的支持是以临时权宜方案的方式实现的，尚未进行优化。

dlt 会将这些凭据传递给 ClickHouse，由 ClickHouse 处理认证并访问 GCS。

目前正在积极推进 ClickHouse dlt 目标的 GCS staging 配置改进工作，以简化并优化该流程。关于完善 GCS staging 支持的进展可在以下 GitHub issue 中跟踪：

* 使 filesystem 目标在 s3 兼容模式下与 gcs <a href="https://github.com/dlt-hub/dlt/issues/1272"> 正常工作</a>
* Google Cloud Storage staging 区域<a href="https://github.com/dlt-hub/dlt/issues/1181"> 支持</a>

### Dbt 支持 \{#dbt-support\}

与 <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> 的集成通常通过 dbt-clickhouse 提供支持。

### `dlt` 状态同步 \{#syncing-of-dlt-state\}

此目标完全支持 <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> 状态同步。
