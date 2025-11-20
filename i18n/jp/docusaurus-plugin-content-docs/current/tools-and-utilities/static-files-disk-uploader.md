---
slug: /operations/utilities/static-files-disk-uploader
title: 'clickhouse-static-files-disk-uploader'
keywords: ['clickhouse-static-files-disk-uploader', 'utility', 'disk', 'uploader']
description: 'clickhouse-static-files-disk-uploader ユーティリティについて説明します'
doc_type: 'guide'
---



# clickhouse-static-files-disk-uploader

指定した ClickHouse テーブルのメタデータを含むデータディレクトリを出力します。このメタデータを使用すると、`web` ディスクをバックエンドとする読み取り専用データセットを持つ ClickHouse テーブルを、別のサーバー上に作成できます。

このツールをデータ移行には使用しないでください。代わりに、[`BACKUP` および `RESTORE` コマンド](/operations/backup) を使用してください。



## 使用方法 {#usage}

```bash
$ clickhouse static-files-disk-uploader [args]
```


## コマンド {#commands}

| コマンド                  | 説明                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| `-h`, `--help`           | ヘルプ情報を表示します                                                                   |
| `--metadata-path [path]` | 指定されたテーブルのメタデータを含むパス                                      |
| `--test-mode`            | `test`モードを有効にし、テーブルメタデータを含むPUTリクエストを指定されたURLに送信します |
| `--link`                 | 出力ディレクトリにファイルをコピーする代わりにシンボリックリンクを作成します                         |
| `--url [url]`            | `test`モード用のWebサーバーURL                                                            |
| `--output-dir [dir]`     | `non-test`モードでファイルを出力するディレクトリ                                              |


## 指定したテーブルのメタデータパスを取得する {#retrieve-metadata-path-for-the-specified-table}

`clickhouse-static-files-disk-uploader`を使用する場合は、対象テーブルのメタデータパスを取得する必要があります。

1. 対象のテーブルとデータベースを指定して、以下のクエリを実行します：

<br />

```sql
SELECT data_paths
  FROM system.tables
  WHERE name = 'mytable' AND database = 'default';
```

2. 指定したテーブルのデータディレクトリへのパスが返されます：

<br />

```response
┌─data_paths────────────────────────────────────────────┐
│ ['./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/'] │
└───────────────────────────────────────────────────────┘
```


## テーブルメタデータディレクトリをローカルファイルシステムに出力する {#output-table-metadata-directory-to-the-local-filesystem}

出力先ディレクトリ `output` と指定されたメタデータパスを使用して、以下のコマンドを実行します:

```bash
$ clickhouse static-files-disk-uploader --output-dir output --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```

成功すると、以下のメッセージが表示され、`output` ディレクトリに指定されたテーブルのメタデータが格納されます:

```repsonse
Data path: "/Users/john/store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee", destination path: "output"
```


## テーブルメタデータディレクトリを外部URLに出力する {#output-table-metadata-directory-to-an-external-url}

この手順は、データディレクトリをローカルファイルシステムに出力する場合と似ていますが、`--test-mode`フラグを追加する点が異なります。出力ディレクトリを指定する代わりに、`--url`フラグでターゲットURLを指定する必要があります。

`test`モードを有効にすると、テーブルメタデータディレクトリはPUTリクエストによって指定されたURLにアップロードされます。

```bash
$ clickhouse static-files-disk-uploader --test-mode --url http://nginx:80/test1 --metadata-path ./store/bcc/bccc1cfd-d43d-43cf-a5b6-1cda8178f1ee/
```


## テーブルメタデータディレクトリを使用したClickHouseテーブルの作成 {#using-the-table-metadata-directory-to-create-a-clickhouse-table}

テーブルメタデータディレクトリを取得したら、それを使用して別のサーバー上にClickHouseテーブルを作成できます。

デモについては[このGitHubリポジトリ](https://github.com/ClickHouse/web-tables-demo)を参照してください。この例では、`web`ディスクを使用してテーブルを作成しており、別のサーバー上のデータセットにテーブルをアタッチすることができます。
