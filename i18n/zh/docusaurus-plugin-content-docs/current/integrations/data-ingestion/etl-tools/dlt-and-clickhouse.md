import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 将 dlt 连接到 ClickHouse

<CommunityMaintainedBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> 是一个开源库，您可以将其添加到您的 Python 脚本中，以将数据从各种混乱的数据源加载到结构良好的实时数据集中。

## 使用 ClickHouse 安装 dlt {#install-dlt-with-clickhouse}

### 安装带 ClickHouse 依赖项的 `dlt` 库： {#to-install-the-dlt-library-with-clickhouse-dependencies}
```bash
pip install "dlt[clickhouse]"
```

## 设置指南 {#setup-guide}

### 1. 初始化 dlt 项目 {#1-initialize-the-dlt-project}

首先按如下方式初始化一个新的 `dlt` 项目：
```bash
dlt init chess clickhouse
```

:::note
该命令将使用棋类作为源，ClickHouse 作为目标初始化您的管道。
:::

上述命令会生成多个文件和目录，包括 `.dlt/secrets.toml` 和 ClickHouse 的要求文件。您可以通过执行以下命令来安装要求文件中指定的必要依赖项：
```bash
pip install -r requirements.txt
```

或使用 `pip install dlt[clickhouse]`，这将安装 `dlt` 库及其与 ClickHouse 作为目标工作所需的依赖项。

### 2. 设置 ClickHouse 数据库 {#2-setup-clickhouse-database}

要将数据加载到 ClickHouse，您需要创建一个 ClickHouse 数据库。以下是您应执行的粗略大纲：

1. 您可以使用现有的 ClickHouse 数据库或创建一个新数据库。

2. 要创建新数据库，请使用 `clickhouse-client` 命令行工具或您选择的 SQL 客户端连接到 ClickHouse 服务器。

3. 运行以下 SQL 命令以创建新数据库、用户并授予所需的权限：

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 3. 添加凭证 {#3-add-credentials}

接下来，在 `.dlt/secrets.toml` 文件中设置 ClickHouse 凭证，如下所示：

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # The database name you created
username = "dlt"                         # ClickHouse username, default is usually "default"
password = "Dlt*12345789234567"          # ClickHouse password if any
host = "localhost"                       # ClickHouse server host
port = 9000                              # ClickHouse HTTP port, default is 9000
http_port = 8443                         # HTTP Port to connect to ClickHouse server's HTTP interface. Defaults to 8443.
secure = 1                               # Set to 1 if using HTTPS, else 0.
dataset_table_separator = "___"          # Separator for dataset table names from dataset.
```

:::note
HTTP_PORT
`http_port` 参数指定用来连接 ClickHouse 服务器 HTTP 接口的端口号。这与用于本机 TCP 协议的默认端口 9000 不同。

如果您不使用外部暂存（即未在管道中设置暂存参数），则必须设置 `http_port`。这是因为内置的 ClickHouse 本地存储暂存使用 <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse content</a> 库，该库通过 HTTP 与 ClickHouse 进行通信。

确保您的 ClickHouse 服务器配置为接受在 `http_port` 指定的端口上的 HTTP 连接。例如，如果您设置 `http_port = 8443`，则 ClickHouse 应该监听 8443 端口的 HTTP 请求。如果您使用外部暂存，则可以省略 `http_port` 参数，因为此情况下不会使用 clickhouse-connect。
:::

您可以传递一个类似于 `clickhouse-driver` 库使用的数据库连接字符串。上述凭证将如下所示：

```bash

# keep it at the top of your toml file, before any section starts.
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

## 写入处置 {#write-disposition}

所有 [写入处置](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition) 都受到支持。

dlt 库中的写入处置定义如何将数据写入目标。有三种写入处置：

**替换**：该处置将目标中的数据替换为资源中的数据。在加载数据之前，它会删除所有类和对象并重新创建模式。您可以在 <a href="https://dlthub.com/docs/general-usage/full-loading">这里</a> 了解更多信息。

**合并**：该写入处置将资源中的数据与目标中的数据合并。对于 `merge` 处置，您需要为资源指定一个 `primary_key`。您可以在 <a href="https://dlthub.com/docs/general-usage/incremental-loading">这里</a> 了解更多信息。

**附加**：这是默认的处置。它将数据附加到目标中现有的数据，忽略 `primary_key` 字段。

## 数据加载 {#data-loading}

数据通过根据数据源选择的最高效方法加载到 ClickHouse 中：

- 对于本地文件，使用 `clickhouse-connect` 库通过 `INSERT` 命令直接将文件加载到 ClickHouse 表中。
- 对于如 `S3`、`Google Cloud Storage` 或 `Azure Blob Storage` 中的远程存储文件，使用 ClickHouse 表函数如 s3、gcs 和 azureBlobStorage 来读取文件并将数据插入到表中。

## 数据集 {#datasets}

`Clickhouse` 不支持在一个数据库中使用多个数据集，而 `dlt` 由于多个原因依赖于数据集。为了使 `Clickhouse` 能与 `dlt` 一起工作，在您的 `Clickhouse` 数据库中由 `dlt` 生成的表的名称将以数据集名称为前缀，并由可配置的 `dataset_table_separator` 分隔。此外，将创建一个不包含任何数据的特殊哨兵表，使 `dlt` 能够识别在 `Clickhouse` 目标中已存在的虚拟数据集。

## 支持的文件格式 {#supported-file-formats}

- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl">jsonl</a> 是直接加载和暂存的首选格式。
- <a href="https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet">parquet</a> 在直接加载和暂存中均受到支持。

`clickhouse` 目标与默认 SQL 目标存在一些特定的偏差：

1. `Clickhouse` 有一个实验性的 `object` 数据类型，但我们发现它有点不可预测，因此 dlt 的 Clickhouse 目标将复杂数据类型加载到文本列中。如果您需要此功能，请与我们的 Slack 社区联系，我们将考虑添加它。
2. `Clickhouse` 不支持 `time` 数据类型。时间将被加载到 `text` 列中。
3. `Clickhouse` 不支持 `binary` 数据类型。相反，二进制数据将在 `text` 列中加载。当从 `jsonl` 加载时，二进制数据将是 base64 字符串，而从 parquet 加载时，`binary` 对象将被转换为 `text`。
5. `Clickhouse` 接受向已填充表中添加不为 null 的列。
6. `Clickhouse` 在某些条件下使用 float 或 double 数据类型时可能产生四舍五入错误。如果您不能容忍四舍五入错误，请确保使用 decimal 数据类型。例如，将值 12.7001 加载到设置为 `jsonl` 的双精度列中将可预测地产生四舍五入错误。

## 支持的列提示 {#supported-column-hints}

ClickHouse 支持以下 <a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">列提示</a>：

- `primary_key` - 将该列标记为主键的一部分。多个列可以具有此提示以创建复合主键。

## 表引擎 {#table-engine}

默认情况下，表使用 `ReplicatedMergeTree` 表引擎在 ClickHouse 中创建。您可以使用 `table_engine_type` 指定备选表引擎，结合 ClickHouse 适配器：

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

ClickHouse 支持 Amazon S3、Google Cloud Storage 和 Azure Blob Storage 作为文件暂存目的地。

`dlt` 将把 Parquet 或 jsonl 文件上传到暂存位置，并使用 ClickHouse 表函数直接从暂存的文件中加载数据。

请参阅文件系统文档以了解如何为暂存目的地配置凭证：

- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3">Amazon S3</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage">Google Cloud Storage</a>
- <a href="https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage">Azure Blob Storage</a>

要运行启用暂存的管道：

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```

### 将 Google Cloud Storage 用作暂存区域 {#using-google-cloud-storage-as-a-staging-area}

dlt 支持在将数据加载到 ClickHouse 时使用 Google Cloud Storage (GCS) 作为暂存区域。ClickHouse 的 <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS 表函数</a> 会在后台自动处理这项工作。

Clickhouse GCS 表函数仅支持使用基于哈希的消息认证码（HMAC）密钥进行身份验证。为此，GCS 提供了一个 S3 兼容模式，以模拟 Amazon S3 API。ClickHouse 利用这一点允许通过其 S3 集成访问 GCS 存储桶。

要在 dlt 中设置具有 HMAC 身份验证的 GCS 暂存：

1. 按照 <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud 指南</a> 为您的 GCS 服务帐户创建 HMAC 密钥。

2. 在您的 dlt 项目的 ClickHouse 目标设置中的 `config.toml` 中配置 HMAC 密钥以及 `client_email`、`project_id` 和 `private_key`：

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

注意：除 HMAC 密钥 `bashgcp_access_key_id` 和 `gcp_secret_access_key` 外，您现在需要在 `[destination.filesystem.credentials]` 下提供服务帐户的 `client_email`、`project_id` 和 `private_key`。这是因为 GCS 暂存支持现在作为临时解决方案实现，并且仍未进行优化。

dlt 将把这些凭证传递给 ClickHouse，后者将处理身份验证和 GCS 访问。

目前正在积极进行工作，以简化和改进未来 ClickHouse dlt 目标的 GCS 暂存设置。适当的 GCS 暂存支持在以下 GitHub 问题中进行跟踪：

- 使文件系统目的地 <a href="https://github.com/dlt-hub/dlt/issues/1272"> 与 gcs 工作 </a> 在 S3 兼容模式下
- Google Cloud Storage 暂存区域<a href="https://github.com/dlt-hub/dlt/issues/1181"> 支持 </a>

### dbt 支持 {#dbt-support}

通过 dbt-clickhouse 通常支持与 <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> 的集成。

### `dlt` 状态同步 {#syncing-of-dlt-state}

此目的地完全支持 <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> 状态同步。
