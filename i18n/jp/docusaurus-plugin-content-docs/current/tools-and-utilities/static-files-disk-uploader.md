---
slug: /operations/utilities/static-files-disk-uploader
title: 'clickhouse-static-files-disk-uploader'
keywords: ['clickhouse-static-files-disk-uploader', 'utility', 'disk', 'uploader']
description: 'clickhouse-static-files-disk-uploader ユーティリティについて説明します'
doc_type: 'guide'
---



# clickhouse-static-files-disk-uploader

指定した ClickHouse テーブルのメタデータを含むデータディレクトリを出力します。このメタデータを使用して、`web` ディスクをバックエンドとする読み取り専用データセットに基づいた ClickHouse テーブルを別のサーバー上に作成できます。

このツールをデータ移行に使用しないでください。代わりに、[`BACKUP` および `RESTORE` コマンド](/operations/backup)を使用してください。



## 使い方

```bash
$ clickhouse static-files-disk-uploader [args]
```


## コマンド {#commands}

|Command|Description|
|---|---|
|`-h`, `--help`|ヘルプ情報を表示します|
|`--metadata-path [path]`|指定されたテーブルのメタデータが格納されているパス|
|`--test-mode`|`test` モードを有効にし、テーブルメタデータを指定された URL に対して PUT リクエストとして送信します|
|`--link`|出力ディレクトリにファイルをコピーする代わりにシンボリックリンクを作成します|
|`--url [url]`|`test` モード用の Web サーバーの URL|
|`--output-dir [dir]`|テストモード以外でファイルを出力するディレクトリ|



## 指定したテーブルのメタデータパスを取得する

`clickhouse-static-files-disk-uploader` を使用する場合、対象とするテーブルのメタデータパスを取得する必要があります。

1. 対象のテーブルとデータベースを指定して、次のクエリを実行します。

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. これで、指定したテーブルのデータディレクトリへのパスが返されます。

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```


## 出力テーブルのメタデータディレクトリをローカルファイルシステム上に書き出す

ターゲット出力ディレクトリ `output` と指定したメタデータパスを使用して、次のコマンドを実行します。

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

成功すると、次のメッセージが表示され、`output` ディレクトリに指定したテーブルのメタデータが含まれているはずです。

```repsonse
データパス：「/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee」、出力先パス：「output」
```


## テーブルメタデータディレクトリを外部の URL に出力する

この手順は、`--test-mode` フラグを追加する点を除き、データディレクトリをローカルファイルシステムに出力する場合と同様です。出力ディレクトリを指定する代わりに、`--url` フラグを使用してターゲット URL を指定する必要があります。

`test` モードが有効な場合、テーブルメタデータディレクトリは PUT リクエストで指定された URL にアップロードされます。

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```


## テーブルメタデータディレクトリを使用して ClickHouse テーブルを作成する {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

テーブルメタデータディレクトリを取得したら、それを使用して別のサーバー上に ClickHouse テーブルを作成できます。

デモを含む[この GitHub リポジトリ](https://github.com/ClickHouse/web-tables-demo)を参照してください。例では、`web` ディスクを使用してテーブルを作成し、別のサーバー上のデータセットにテーブルをアタッチしています。
