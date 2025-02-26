---
slug: /operations/utilities/static-files-disk-uploader
title: clickhouse-static-files-disk-uploader
keywords: [clickhouse-static-files-disk-uploader, utility, disk, uploader]
---

# clickhouse-static-files-disk-uploader

指定された ClickHouse テーブルのメタデータを含むデータディレクトリを出力します。このメタデータは、`web` ディスクにバックアップされた読み取り専用データセットを持つ別のサーバーに ClickHouse テーブルを作成するために使用できます。

このツールを使用してデータを移行しないでください。代わりに、[`BACKUP` と `RESTORE` コマンド](/operations/backup)を使用してください。

## 使用方法 {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```

## コマンド {#commands}

|コマンド|説明|
|---|---|
|`-h`, `--help`|ヘルプ情報を表示します|
|`--metadata-path [path]`|指定したテーブルのメタデータを含むパス|
|`--test-mode`|テストモードを有効にし、指定された URL にテーブルのメタデータを含む PUT リクエストを送信します|
|`--link`|ファイルを出力ディレクトリにコピーする代わりにシンボリックリンクを作成します|
|`--url [url]`|テストモード用のウェブサーバー URL|
|`--output-dir [dir]`|非テストモードでファイルを出力するディレクトリ|

## 指定したテーブルのメタデータパスを取得する {#retrieve-metadata-path-for-the-specified-table}

`clickhouse-static-files-disk-uploader`を使用する際、希望のテーブルのメタデータパスを取得する必要があります。

1. 対象のテーブルとデータベースを指定して、以下のクエリを実行します：

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. これにより、指定したテーブルのデータディレクトリのパスが返されるはずです：

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```

## テーブルメタデータディレクトリをローカルファイルシステムに出力する {#output-table-metadata-directory-to-the-local-filesystem}

ターゲット出力ディレクトリ `output` と指定したメタデータパスを使用して、以下のコマンドを実行します：

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

成功すると、以下のメッセージが表示されるはずで、`output` ディレクトリには指定したテーブルのメタデータが含まれるはずです：

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```

## テーブルメタデータディレクトリを外部 URL に出力する {#output-table-metadata-directory-to-an-external-url}

このステップは、データディレクトリをローカルファイルシステムに出力するのと似ていますが、`--test-mode` フラグを追加します。出力ディレクトリを指定する代わりに、`--url` フラグを使用してターゲット URL を指定する必要があります。

テストモードが有効になっている場合、テーブルメタデータディレクトリは、指定された URL に対して PUT リクエストを通じてアップロードされます。

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

## テーブルメタデータディレクトリを使用して ClickHouse テーブルを作成する {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

テーブルメタデータディレクトリを取得したら、これを使用して別のサーバーに ClickHouse テーブルを作成できます。

デモを示すために、[こちらの GitHub レポジトリ](https://github.com/ClickHouse/web-tables-demo)をご覧ください。この例では、`web` ディスクを使用してテーブルを作成しており、これによりテーブルを別のサーバー上のデータセットに接続できます。
