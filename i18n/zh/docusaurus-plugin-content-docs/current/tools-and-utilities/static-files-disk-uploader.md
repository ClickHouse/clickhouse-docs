---
'slug': '/operations/utilities/static-files-disk-uploader'
'title': 'clickhouse-static-files-disk-uploader'
'keywords':
- 'clickhouse-static-files-disk-uploader'
- 'utility'
- 'disk'
- 'uploader'
'description': '提供 clickhouse-static-files-disk-uploader 工具的描述'
'doc_type': 'guide'
---


# clickhouse-static-files-disk-uploader

输出包含指定 ClickHouse 表元数据的数据目录。该元数据可用于在不同服务器上创建包含仅读数据集的 ClickHouse 表，该数据集由 `web` 磁盘支持。

请勿使用此工具迁移数据。相反，请使用 [`BACKUP` 和 `RESTORE` 命令](/operations/backup)。

## 使用方法 {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```

## 命令 {#commands}

|命令|描述|
|---|---|
|`-h`, `--help`|打印帮助信息|
|`--metadata-path [path]`|包含指定表元数据的路径|
|`--test-mode`|启用 `test` 模式，该模式将表元数据以 PUT 请求提交到给定的 URL|
|`--link`|创建符号链接，而不是将文件复制到输出目录|
|`--url [url]`|`test` 模式的网络服务器 URL|
|`--output-dir [dir]`|在 `non-test` 模式下输出文件的目录|

## 检索指定表的元数据路径 {#retrieve-metadata-path-for-the-specified-table}

使用 `clickhouse-static-files-disk-uploader` 时，您必须获取所需表的元数据路径。

1. 运行以下查询，指定目标表和数据库：

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. 这应该会返回指定表的数据目录路径：

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```

## 输出表元数据目录到本地文件系统 {#output-table-metadata-directory-to-the-local-filesystem}

使用目标输出目录 `output` 和给定的元数据路径，执行以下命令：

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

如果成功，您应该看到以下消息，并且 `output` 目录应包含指定表的元数据：

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```

## 输出表元数据目录到外部 URL {#output-table-metadata-directory-to-an-external-url}

此步骤与将数据目录输出到本地文件系统类似，但添加了 `--test-mode` 标志。您必须通过 `--url` 标志指定目标 URL，而不是指定输出目录。

启用 `test` 模式后，表元数据目录通过 PUT 请求上传到指定的 URL。

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

## 使用表元数据目录创建 ClickHouse 表 {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

一旦您拥有表元数据目录，即可利用它在不同的服务器上创建 ClickHouse 表。

请参见 [这个 GitHub 存储库](https://github.com/ClickHouse/web-tables-demo) 展示的演示。在示例中，我们使用 `web` 磁盘创建一个表，这允许我们将表附加到不同服务器上的数据集。
