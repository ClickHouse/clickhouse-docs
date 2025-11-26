---
description: 'ClickHouse では、`SELECT` クエリと一緒に、そのクエリの処理に必要なデータをサーバーに送信することができます。このデータは一時テーブルに格納され、クエリ内で（たとえば `IN` 演算子などで）使用できます。'
sidebar_label: 'クエリ処理のための外部データ'
sidebar_position: 130
slug: /engines/table-engines/special/external-data
title: 'クエリ処理のための外部データ'
doc_type: 'reference'
---

# クエリ処理のための外部データ

ClickHouse では、`SELECT` クエリと一緒に、そのクエリの処理に必要なデータをサーバーに送信できます。これらのデータは一時テーブル（「Temporary tables」のセクションを参照）に格納され、クエリ内（たとえば `IN` 演算子）で利用できます。

たとえば、重要なユーザー識別子が記載されたテキストファイルがある場合、そのリストでフィルタリングを行うクエリと一緒に、そのファイルをサーバーにアップロードできます。

大量の外部データを使って複数のクエリを実行する必要がある場合は、この機能は使用しないでください。その場合は、事前にデータを DB にアップロードしておく方が適切です。

外部データは、コマンドラインクライアント（非対話モード）または HTTP インターフェイスを使用してアップロードできます。

コマンドラインクライアントでは、次の形式でパラメータセクションを指定できます

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

転送されるテーブルの数に応じて、このようなセクションを複数指定することができます。

**–external** – 節の開始を示します。
**–file** – テーブルダンプのファイルへのパス、または stdin を参照する `-` を指定します。
stdin から取得できるのは単一のテーブルのみです。

次のパラメータは省略可能です: **–name** – テーブル名。省略した場合は &#95;data が使用されます。
**–format** – ファイル内のデータフォーマット。省略した場合は TabSeparated が使用されます。

次のパラメータのいずれか一つが必須です: **–types** – カンマ区切りのカラム型の一覧。例: `UInt64,String`。カラム名は &#95;1, &#95;2, ... のように付けられます。
**–structure** – `UserID UInt64`, `URL String` のような形式で指定するテーブル構造。カラム名と型を定義します。

`file` で指定されたファイルは、`format` で指定されたフォーマットとして解析され、`types` または `structure` で指定されたデータ型が使用されます。テーブルはサーバーにアップロードされ、`name` で指定された名前の一時テーブルとしてサーバー側で利用可能になります。

例:

```bash
$ echo -ne "1\n2\n3\n" | clickhouse-client --query="SELECT count() FROM test.visits WHERE TraficSourceID IN _data" --external --file=- --types=Int8
849897
$ cat /etc/passwd | sed 's/:/\t/g' | clickhouse-client --query="SELECT shell, count() AS c FROM passwd GROUP BY shell ORDER BY c DESC" --external --file=- --name=passwd --structure='login String, unused String, uid UInt16, gid UInt16, comment String, home String, shell String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

HTTP インターフェイスを使用する場合、外部データは multipart/form-data 形式で渡されます。各テーブルは個別のファイルとして送信されます。テーブル名はファイル名から取得されます。`query_string` にはパラメータ `name_format`、`name_types`、`name_structure` が渡されます。ここで `name` は、これらのパラメータが対応するテーブルの名前を表します。パラメータの意味は、コマンドラインクライアントを使用する場合と同じです。

例:

```bash
$ cat /etc/passwd | sed 's/:/\t/g' > passwd.tsv

$ curl -F 'passwd=@passwd.tsv;' 'http://localhost:8123/?query=SELECT+shell,+count()+AS+c+FROM+passwd+GROUP+BY+shell+ORDER+BY+c+DESC&passwd_structure=login+String,+unused+String,+uid+UInt16,+gid+UInt16,+comment+String,+home+String,+shell+String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

分散クエリ処理では、一時テーブルがすべてのリモートサーバーに送信されます。
