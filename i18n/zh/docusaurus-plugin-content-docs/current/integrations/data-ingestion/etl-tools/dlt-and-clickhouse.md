---
sidebar_label: 'dlt'
keywords: ['clickhouse', 'dlt', 'connect', 'integrate', 'etl', 'data integration']
description: '使用 dlt 集成将数据加载到 ClickHouse'
title: '连接 dlt 与 ClickHouse'
slug: /integrations/data-ingestion/etl-tools/dlt-and-clickhouse
doc_type: 'guide'
---

import PartnerBadge from '@theme/badges/PartnerBadge';


# 将 dlt 连接到 ClickHouse

<PartnerBadge/>

<a href="https://dlthub.com/docs/intro" target="_blank">dlt</a> 是一个开源库，你可以将其添加到 Python 脚本中，把来自各种且常常杂乱的数据源的数据加载为结构良好、实时更新的数据集。



## 安装 dlt 及 ClickHouse 支持 {#install-dlt-with-clickhouse}

### 安装包含 ClickHouse 依赖的 `dlt` 库: {#to-install-the-dlt-library-with-clickhouse-dependencies}

```bash
pip install "dlt[clickhouse]"
```


## 设置指南 {#setup-guide}

<VerticalStepper headerLevel="h3">

### 初始化 dlt 项目 {#1-initialize-the-dlt-project}

首先按以下方式初始化一个新的 `dlt` 项目:

```bash
dlt init chess clickhouse
```

:::note
此命令将初始化您的数据管道,以 chess 作为数据源,ClickHouse 作为目标。
:::

上述命令会生成多个文件和目录,包括 `.dlt/secrets.toml` 和 ClickHouse 的依赖文件。您可以通过执行以下命令来安装依赖文件中指定的必要依赖项:

```bash
pip install -r requirements.txt
```

或使用 `pip install dlt[clickhouse]`,这将安装 `dlt` 库以及使用 ClickHouse 作为目标所需的必要依赖项。

### 设置 ClickHouse 数据库 {#2-setup-clickhouse-database}

要将数据加载到 ClickHouse,您需要创建一个 ClickHouse 数据库。以下是您应该执行的大致步骤:

1. 您可以使用现有的 ClickHouse 数据库或创建一个新数据库。

2. 要创建新数据库,请使用 `clickhouse-client` 命令行工具或您选择的 SQL 客户端连接到 ClickHouse 服务器。

3. 运行以下 SQL 命令来创建新数据库、用户并授予必要的权限:

```bash
CREATE DATABASE IF NOT EXISTS dlt;
CREATE USER dlt IDENTIFIED WITH sha256_password BY 'Dlt*12345789234567';
GRANT CREATE, ALTER, SELECT, DELETE, DROP, TRUNCATE, OPTIMIZE, SHOW, INSERT, dictGet ON dlt.* TO dlt;
GRANT SELECT ON INFORMATION_SCHEMA.COLUMNS TO dlt;
GRANT CREATE TEMPORARY TABLE, S3 ON *.* TO dlt;
```

### 添加凭据 {#3-add-credentials}

接下来,在 `.dlt/secrets.toml` 文件中设置 ClickHouse 凭据,如下所示:

```bash
[destination.clickhouse.credentials]
database = "dlt"                         # 您创建的数据库名称
username = "dlt"                         # ClickHouse 用户名,默认通常为 "default"
password = "Dlt*12345789234567"          # ClickHouse 密码(如有)
host = "localhost"                       # ClickHouse 服务器主机
port = 9000                              # ClickHouse 原生协议端口,默认为 9000
http_port = 8443                         # 连接到 ClickHouse 服务器 HTTP 接口的端口。默认为 8443。
secure = 1                               # 如果使用 HTTPS 则设置为 1,否则为 0。

[destination.clickhouse]
dataset_table_separator = "___"          # 数据集表名与数据集之间的分隔符。
```

:::note HTTP_PORT
`http_port` 参数指定连接到 ClickHouse 服务器 HTTP 接口时使用的端口号。这与默认端口 9000 不同,后者用于原生 TCP 协议。

如果您未使用外部暂存(即未在管道中设置 staging 参数),则必须设置 `http_port`。这是因为内置的 ClickHouse 本地存储暂存使用 <a href="https://github.com/ClickHouse/clickhouse-connect">clickhouse-connect</a> 库,该库通过 HTTP 与 ClickHouse 通信。

请确保您的 ClickHouse 服务器配置为在 `http_port` 指定的端口上接受 HTTP 连接。例如,如果您设置 `http_port = 8443`,则 ClickHouse 应在端口 8443 上监听 HTTP 请求。如果您使用外部暂存,则可以省略 `http_port` 参数,因为在这种情况下不会使用 clickhouse-connect。
:::

您可以传递类似于 `clickhouse-driver` 库使用的数据库连接字符串。上述凭据将如下所示:


```bash
# 将此配置保持在 toml 文件的顶部,在任何节(section)开始之前。
destination.clickhouse.credentials="clickhouse://dlt:Dlt*12345789234567@localhost:9000/dlt?secure=1"
```

</VerticalStepper>


## 写入策略 {#write-disposition}

支持所有[写入策略](https://dlthub.com/docs/general-usage/incremental-loading#choosing-a-write-disposition)。

dlt 库中的写入策略定义了数据应如何写入目标。写入策略分为三种类型:

**Replace(替换)**: 此策略使用资源中的数据替换目标中的数据。它会删除所有类和对象,并在加载数据之前重新创建模式。您可以在<a href="https://dlthub.com/docs/general-usage/full-loading">此处</a>了解更多信息。

**Merge(合并)**: 此写入策略将资源中的数据与目标中的数据合并。对于 `merge` 策略,您需要为资源指定 `primary_key`。您可以在<a href="https://dlthub.com/docs/general-usage/incremental-loading">此处</a>了解更多信息。

**Append(追加)**: 这是默认策略。它会将数据追加到目标中的现有数据,忽略 `primary_key` 字段。


## 数据加载 {#data-loading}

根据数据源的不同,ClickHouse 会采用最高效的方法加载数据:

- 对于本地文件,使用 `clickhouse-connect` 库通过 `INSERT` 命令直接将文件加载到 ClickHouse 表中。
- 对于远程存储(如 `S3`、`Google Cloud Storage` 或 `Azure Blob Storage`)中的文件,使用 ClickHouse 表函数(如 s3、gcs 和 azureBlobStorage)读取文件并将数据插入表中。


## 数据集 {#datasets}

ClickHouse 不支持在单个数据库中使用多个数据集,而 `dlt` 出于多种原因需要依赖数据集。为了使 ClickHouse 能够与 `dlt` 配合使用,`dlt` 在您的 ClickHouse 数据库中生成的表将以数据集名称作为前缀,并通过可配置的 `dataset_table_separator` 进行分隔。此外,系统还会创建一个不包含任何数据的特殊哨兵表,以便 `dlt` 识别 ClickHouse 目标中已存在的虚拟数据集。


## 支持的文件格式 {#supported-file-formats}

- <a href='https://dlthub.com/docs/dlt-ecosystem/file-formats/jsonl'>jsonl</a>
  是直接加载和暂存的首选格式。
- <a href='https://dlthub.com/docs/dlt-ecosystem/file-formats/parquet'>
    parquet
  </a>
  支持直接加载和暂存。

`clickhouse` 目标与默认 SQL 目标存在以下几个特定差异:

1. `Clickhouse` 提供了实验性的 `object` 数据类型,但我们发现其行为不够稳定,因此 dlt clickhouse 目标会将复杂数据类型加载到文本列中。如果您需要此功能,请通过我们的 Slack 社区联系我们,我们会考虑添加该功能。
2. `Clickhouse` 不支持 `time` 数据类型。时间数据将被加载到 `text` 列中。
3. `Clickhouse` 不支持 `binary` 数据类型。二进制数据将被加载到 `text` 列中。从 `jsonl` 加载时,二进制数据将以 base64 字符串形式存储;从 parquet 加载时,`binary` 对象将被转换为 `text`。
4. `Clickhouse` 允许向已填充数据的表中添加非空列。
5. `Clickhouse` 在使用 float 或 double 数据类型时,某些情况下可能会产生舍入误差。如果无法容忍舍入误差,请务必使用 decimal 数据类型。例如,当加载器文件格式设置为 `jsonl` 时,将值 12.7001 加载到 double 列中会产生可预见的舍入误差。


## 支持的列提示 {#supported-column-hints}

ClickHouse 支持以下<a href="https://dlthub.com/docs/general-usage/schema#tables-and-columns">列提示</a>:

- `primary_key` - 将列标记为主键的一部分。多个列可以使用此提示来创建组合主键。


## 表引擎 {#table-engine}

默认情况下,ClickHouse 中的表使用 `ReplicatedMergeTree` 表引擎创建。您可以通过 clickhouse 适配器的 `table_engine_type` 参数指定其他表引擎:

```bash
from dlt.destinations.adapters import clickhouse_adapter

@dlt.resource()
def my_resource():
  ...

clickhouse_adapter(my_resource, table_engine_type="merge_tree")
```

支持的值为:

- `merge_tree` - 使用 `MergeTree` 引擎创建表
- `replicated_merge_tree`(默认)- 使用 `ReplicatedMergeTree` 引擎创建表


## 暂存支持 {#staging-support}

ClickHouse 支持将 Amazon S3、Google Cloud Storage 和 Azure Blob Storage 作为文件暂存目标。

`dlt` 会将 Parquet 或 jsonl 文件上传到暂存位置,并使用 ClickHouse 表函数直接从暂存文件中加载数据。

请参阅 filesystem 文档了解如何为暂存目标配置凭据:

- <a href='https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#aws-s3'>
    Amazon S3
  </a>
- <a href='https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#google-storage'>
    Google Cloud Storage
  </a>
- <a href='https://dlthub.com/docs/dlt-ecosystem/destinations/filesystem#azure-blob-storage'>
    Azure Blob Storage
  </a>

要运行启用了暂存的管道:

```bash
pipeline = dlt.pipeline(
  pipeline_name='chess_pipeline',
  destination='clickhouse',
  staging='filesystem',  # add this to activate staging
  dataset_name='chess_data'
)
```

### 使用 Google Cloud Storage 作为暂存区 {#using-google-cloud-storage-as-a-staging-area}

dlt 支持在将数据加载到 ClickHouse 时使用 Google Cloud Storage (GCS) 作为暂存区。这由 ClickHouse 的 <a href="https://clickhouse.com/docs/sql-reference/table-functions/gcs">GCS 表函数</a>自动处理,dlt 在底层使用该函数。

ClickHouse GCS 表函数仅支持使用基于哈希的消息认证码 (HMAC) 密钥进行身份验证。为实现此功能,GCS 提供了模拟 Amazon S3 API 的 S3 兼容模式。ClickHouse 利用此特性通过其 S3 集成来访问 GCS 存储桶。

在 dlt 中设置使用 HMAC 身份验证的 GCS 暂存:

1. 按照 <a href="https://cloud.google.com/storage/docs/authentication/managing-hmackeys#create">Google Cloud 指南</a>为您的 GCS 服务账号创建 HMAC 密钥。

2. 在 dlt 项目的 ClickHouse 目标设置的 `config.toml` 文件中配置 HMAC 密钥以及服务账号的 `client_email`、`project_id` 和 `private_key`:

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

注意:除了 HMAC 密钥(`gcp_access_key_id` 和 `gcp_secret_access_key`)之外,您现在还需要在 `[destination.filesystem.credentials]` 下提供服务账号的 `client_email`、`project_id` 和 `private_key`。这是因为 GCS 暂存支持目前作为临时解决方案实现,尚未优化。

dlt 会将这些凭据传递给 ClickHouse,由其处理身份验证和 GCS 访问。

目前正在积极开发以简化和改进 ClickHouse dlt 目标的 GCS 暂存设置。完整的 GCS 暂存支持正在以下 GitHub issue 中跟踪:

- 使 filesystem 目标在 s3 兼容模式下与 gcs <a href="https://github.com/dlt-hub/dlt/issues/1272">协同工作</a>
- Google Cloud Storage 暂存区<a href="https://github.com/dlt-hub/dlt/issues/1181">支持</a>

### dbt 支持 {#dbt-support}

通过 dbt-clickhouse 支持与 <a href="https://dlthub.com/docs/dlt-ecosystem/transformations/dbt/">dbt</a> 的集成。

### `dlt` 状态同步 {#syncing-of-dlt-state}

此目标完全支持 <a href="https://dlthub.com/docs/general-usage/state#syncing-state-with-destination">dlt</a> 状态同步。
