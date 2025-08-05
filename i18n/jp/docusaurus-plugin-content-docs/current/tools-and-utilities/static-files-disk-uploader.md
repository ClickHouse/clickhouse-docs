---
slug: '/operations/utilities/static-files-disk-uploader'
title: 'clickhouse-static-files-disk-uploader'
keywords:
- 'clickhouse-static-files-disk-uploader'
- 'utility'
- 'disk'
- 'uploader'
description: 'clickhouse-static-files-disk-uploader ユーティリティの説明を提供します'
---




# clickhouse-static-files-disk-uploader

指定されたClickHouseテーブルのメタデータを含むデータディレクトリを出力します。このメタデータは、`web`ディスクによってバックアップされた読み取り専用データセットを含む別のサーバーにClickHouseテーブルを作成するために使用できます。

データを移行するためにこのツールを使用しないでください。代わりに、[`BACKUP`および`RESTORE`コマンド](/operations/backup)を使用してください。

## 使用法 {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```

## コマンド {#commands}

|コマンド|説明|
|---|---|
|`-h`, `--help`|ヘルプ情報を表示します|
|`--metadata-path [path]`|指定されたテーブルのメタデータが含まれるパス|
|`--test-mode`|テストモードを有効にし、指定されたURLにテーブルメタデータでPUTリクエストを送信します|
|`--link`|ファイルを出力ディレクトリにコピーする代わりにシンボリックリンクを作成します|
|`--url [url]`|テストモードのためのWebサーバーのURL|
|`--output-dir [dir]`|非テストモードでファイルを出力するディレクトリ|

## 指定されたテーブルのメタデータパスを取得する {#retrieve-metadata-path-for-the-specified-table}

`clickhouse-static-files-disk-uploader`を使用する場合、目的のテーブルのメタデータパスを取得する必要があります。

1. 対象のテーブルとデータベースを指定して、次のクエリを実行します:

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. これにより、指定されたテーブルのデータディレクトリへのパスが返されるはずです:

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```

## テーブルメタデータディレクトリをローカルファイルシステムに出力する {#output-table-metadata-directory-to-the-local-filesystem}

ターゲット出力ディレクトリ`output`と指定されたメタデータパスを使用して、次のコマンドを実行します:

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

成功すると、次のメッセージが表示され、`output`ディレクトリには指定されたテーブルのメタデータが含まれているはずです:

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```

## テーブルメタデータディレクトリを外部URLに出力する {#output-table-metadata-directory-to-an-external-url}

このステップは、データディレクトリをローカルファイルシステムに出力することに似ていますが、`--test-mode`フラグが追加されます。出力ディレクトリを指定する代わりに、`--url`フラグを介してターゲットURLを指定する必要があります。

`test`モードが有効になっていると、テーブルメタデータディレクトリはPUTリクエストを介して指定されたURLにアップロードされます。

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

## テーブルメタデータディレクトリを使用してClickHouseテーブルを作成する {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

テーブルメタデータディレクトリを取得したら、それを使用して別のサーバーにClickHouseテーブルを作成できます。

デモを示すために[こちらのGitHubリポジトリ](https://github.com/ClickHouse/web-tables-demo)をご覧ください。この例では、`web`ディスクを使用してテーブルを作成しており、これにより異なるサーバーのデータセットにテーブルを接続できます。
