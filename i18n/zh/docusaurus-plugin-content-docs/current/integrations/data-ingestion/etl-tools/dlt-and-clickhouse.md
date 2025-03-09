---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', 'connect', 'integrate', 'etl', 'data integration']
description: '通过 dlt 集成将数据加载到 Clickhouse'
---


# 连接 dlt 到 ClickHouse

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> 是一个开源库，您可以将其添加到您的 Python 脚本中，以将来自各种且常常杂乱的数据源的数据加载到结构良好、实时的数据集中。



## 使用 ClickHouse 安装 dlt {#install-dlt-with-clickhouse}

### 安装带有 ClickHouse 依赖项的 `dlt` 库: {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]" 
```

## 设置指南 {#setup-guide}

### 1. 初始化 dlt 项目 {#1-initialize-the-dlt-project}

首先，按如下方式初始化一个新的 `dlt` 项目：
```bash
dlt init chess clickhouse
```


:::note
此命令将以 chess 作为源，以 ClickHouse 作为目标初始化您的管道。
:::

上述命令会生成多个文件和目录，包括 `.dlt/secrets.toml` 以及用于 ClickHouse 的 requirements 文件。您可以通过以下命令执行 requirements 文件以安装所需的依赖项：
```bash
pip install -r requirements.txt
```

或使用 `pip install dlt[clickhouse]`，这将安装 `dlt` 库及其与 ClickHouse 作为目标工作所需的依赖项。

### 2. 设置 ClickHouse 数据库 {#2-setup-clickhouse-database}

要将数据加载到 ClickHouse，您需要创建一个 ClickHouse 数据库。以下是您应执行的大致步骤：

1. 您可以使用现有的 ClickHouse 数据库或创建一个新的。

2. 要创建新数据库，请使用 `clickhouse-client` 命令行工具或您选择的 SQL 客户端连接到您的 ClickHouse 服务器。

3. 运行以下 SQL 命令以创建新数据库、用户并授予必要的权限：

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```


### 3. 添加凭据 {#3-add-credentials}

接下来，在 `.dlt/secrets.toml` 文件中设置 ClickHouse 凭据，如下所示：

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 您创建的数据库名称
username = "dlt"                         # ClickHouse 用户名，默认通常为 "default"
password = "Dlt*12345789234567"          # ClickHouse 密码（如有）
host = "localhost"                       # ClickHouse 服务器主机
port = 9000                              # ClickHouse HTTP 端口，默认是 9000
http_port = 8443                         # 连接到 ClickHouse 服务器 HTTP 接口的 HTTP 端口，默认是 8443。
secure = 1                               # 如果使用 HTTPS 则设置为 1，否则为 0。
dataset_table_separator = "___"          # 数据集表名称的分隔符。
```


:::note
HTTP_PORT
`http_port` 参数指定连接到 ClickHouse 服务器的 HTTP 接口时使用的端口号。此端口与默认的 9000 端口不同，后者用于原生 TCP 协议。

如果您不使用外部暂存（即在管道中没有设置暂存参数），则必须设置 `http_port`。这是因为内置的 ClickHouse 本地存储暂存使用 <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a> 库，该库通过 HTTP 与 ClickHouse 通信。

确保您的 ClickHouse 服务器已配置为接受在 `http_port` 指定的端口上的 HTTP 连接。例如，如果您设置 `http_port = 8443`，则 ClickHouse 应在 8443 端口上监听 HTTP 请求。如果您使用外部暂存，则可以省略 `http_port` 参数，因为在这种情况下不会使用 clickhouse-connect。
:::

您可以传递类似于 `clickhouse-driver` 库使用的数据库连接字符串。上述凭据看起来将是这样的：

```bash

# 将其保留在您的 toml 文件的顶部，在任何节开始之前。
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```


## 写入处置 {#write-disposition}

所有 [写入处置](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition) 都是支持的。

dlt 库中的写入处置定义了数据应如何写入目标。有三种类型的写入处置：

**替换**：此处置将资源中的数据替换目标中的数据。它会先删除所有类和对象，然后在加载数据之前重新创建模式。您可以在 <a href="https://dlthub.com/docs/general-usage/full-loading">这里</a> 了解更多。

**合并**：此写入处置将资源中的数据与目标中的数据合并。对于 `merge` 处置，您需要为资源指定 `primary_key`。您可以在 <a href="https://dlthub.com/docs/general-usage/incremental-loading">这里</a> 了解更多。

**附加**：这是默认的处置。它将数据附加到目标中现有的数据，忽略 `primary_key` 字段。

## 数据加载 {#data-loading}
数据是根据数据源使用最有效的方法加载到 ClickHouse 中：

- 对于本地文件，使用 `clickhouse-connect` 库直接将文件加载到 ClickHouse 表中，使用 `INSERT` 命令。
- 对于 `S3`，`Google Cloud Storage` 或 `Azure Blob Storage` 中的远程存储文件，使用 ClickHouse 表函数，如 s3、gcs 和 azureBlobStorage 读取文件并将数据插入表中。

## 数据集 {#datasets}

`Clickhouse` 不支持一个数据库中的多个数据集，而 `dlt` 则因多种原因依赖数据集。为了使 `Clickhouse` 能够与 `dlt` 一起工作，`dlt` 在您的 `Clickhouse` 数据库中生成的表将以数据集名称为前缀，使用可配置的 `dataset_table_separator` 分隔。此外，将创建一个特殊的哨兵表，该表不包含任何数据，以便 `dlt` 识别在 `Clickhouse` 目标中已存在的虚拟数据集。

## 支持的文件格式 {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> 是直接加载和暂存的首选格式。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> 同样支持直接加载和暂存。

`clickhouse` 目标有一些特定于默认 sql 目标的偏差：

1. `Clickhouse` 有一个实验性的 `object` 数据类型，但我们发现它有点不可预测，因此 dlt clickhouse 目标将复杂数据类型加载到文本列中。如果您需要此功能，请与我们的 Slack 社区联系，我们将考虑添加它。
2. `Clickhouse` 不支持 `time` 数据类型。时间将加载到 `text` 列中。
3. `Clickhouse` 不支持 `binary` 数据类型。相反，二进制数据将加载到 `text` 列中。当从 `jsonl` 加载时，二进制数据将是一个 base64 字符串，而从 parquet 加载时，`binary` 对象将转换为 `text`。
5. `Clickhouse` 允许在已填充的表中添加不可为 null 的列。
6. `Clickhouse` 在某些条件下使用 float 或 double 数据类型时可能会产生舍入错误。如果您无法承受舍入错误，请确保使用 decimal 数据类型。例如，将值 12.7001 加载到设置为 `jsonl` 的 double 列中将可预测地产生舍入错误。

## 支持的列提示 {#supported-column-hints}
ClickHouse 支持以下 <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">列提示</a>：

- `primary_key` - 将列标记为主键的一部分。多个列可以具有此提示以创建复合主键。

## 表引擎 {#table-engine}
默认情况下，表使用 ClickHouse 中的 `ReplicatedMergeTree` 表引擎创建。您可以使用 `table_engine_type` 与 clickhouse 适配器指定一种替代表引擎：

```bash
from dlt.destinations.adapters import clickhouse_adapter


@dlt.resource()
def my_resource():
  ...


clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

支持的值为：

- `merge_tree` - 使用 `MergeTree` 引擎创建表
- `replicated_merge_tree`（默认） - 使用 `ReplicatedMergeTree` 引擎创建表

## 暂存支持 {#staging-support}

ClickHouse 支持 Amazon S3、Google Cloud Storage 和 Azure Blob Storage 作为文件暂存目标。

`dlt` 将上传 Parquet 或 jsonl 文件到暂存位置，并使用 ClickHouse 表函数直接从暂存文件加载数据。

请参考文件系统文档以了解如何配置暂存目标的凭据：

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

要运行启用暂存的管道：

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # 添加此项以激活暂存
  dataset_name='chess_data'
)
```

### 使用 Google Cloud Storage 作为暂存区域 {#using-google-cloud-storage-as-a-staging-area}
dlt 支持使用 Google Cloud Storage (GCS) 作为将数据加载到 ClickHouse 时的暂存区域。ClickHouse 的 <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS 表函数</a> 会自动处理此事，dlt 在底层使用它。

clickhouse GCS 表函数仅支持使用基于哈希的消息认证码（HMAC）密钥进行身份验证。为此，GCS 提供了一种 S3 兼容模式，以模拟 Amazon S3 API。ClickHouse 利用这一点允许通过其 S3 集成访问 GCS 存储桶。

要在 dlt 中使用 HMAC 身份验证设置 GCS 暂存：

1. 按照 <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud 指南</a> 为您的 GCS 服务帐户创建 HMAC 密钥。

2. 在 dlt 项目的 ClickHouse 目标设置的 `config.toml` 中配置 HMAC 密钥以及 `client_email`、`project_id` 和 `private_key`：

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

注意：除了 HMAC 密钥 `gcp_access_key_id` 和 `gcp_secret_access_key` 之外，您现在还需要在 `[destination.filesystem.credentials]` 下提供服务帐户的 `client_email`、`project_id` 和 `private_key`。这是因为 GCS 暂存支持现在作为一种临时解决方案实现，仍在优化中。

dlt 将把这些凭证传递给 ClickHouse，后者将处理身份验证和 GCS 访问。

目前正在进行积极的工作，以简化和改进 ClickHouse dlt 目标的 GCS 暂存设置。适当的 GCS 暂存支持正在这些 GitHub 问题中跟踪：

- 使文件系统目标 <a href="https://github.com/dlt-hub/dlt/issues/1272">在 S3 兼容模式下工作</a> 与 gcs
- Google Cloud Storage 暂存区域 <a href="https://github.com/dlt-hub/dlt/issues/1181">支持</a>

### dbt 支持 {#dbt-support}
通过 dbt-clickhouse 与 <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> 的集成通常是支持的。

### `dlt` 状态同步 {#syncing-of-dlt-state}
该目标完全支持 <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> 状态同步。
