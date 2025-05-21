---
description: 'ClickHouseは、クエリを処理するために必要なデータを、`SELECT`クエリとともにサーバーに送信することを許可します。このデータは一時テーブルに配置され、クエリ内で使用することができます（例えば、`IN`演算子で）。'
sidebar_label: '外部データ'
sidebar_position: 130
slug: /engines/table-engines/special/external-data
title: 'クエリ処理のための外部データ'
---


# クエリ処理のための外部データ

ClickHouseは、クエリを処理するために必要なデータを、`SELECT`クエリとともにサーバーに送信することを許可します。このデータは一時テーブル（「一時テーブル」のセクションを参照）に配置され、クエリ内で使用することができます（例えば、`IN`演算子で）。

例えば、重要なユーザー識別子を含むテキストファイルがある場合、このリストによるフィルタリングを使用するクエリとともに、サーバーにアップロードすることができます。

1つのクエリで外部データの大容量を扱う必要がある場合、この機能は使用しないでください。事前にデータをDBにアップロードする方が良いです。

外部データは、コマンドラインクライアント（非対話モード）やHTTPインターフェースを使用してアップロードできます。

コマンドラインクライアントでは、次の形式のパラメータセクションを指定できます。

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

このセクションは、伝送されるテーブルの数に応じて複数回指定することができます。

**–external** – 句の開始を示します。  
**–file** – テーブルダンプのファイルへのパス、または、標準入力を参照する -。  
標準入力からは単一のテーブルのみを取得できます。

次のパラメータはオプションです: **–name**– テーブルの名前。省略した場合、_data が使用されます。  
**–format** – ファイル内のデータ形式。省略した場合、TabSeparated が使用されます。

次のいずれかのパラメータが必要です: **–types** – カンマ区切りのカラムタイプのリスト。例えば: `UInt64,String`。 カラムは _1, _2, ... と名付けられます。  
**–structure**– テーブル構造の形式`UserID UInt64`, `URL String`。カラム名と型を定義します。

'file' で指定されたファイルは、'format' で指定された形式で解析され、'types' または 'structure' で指定されたデータ型を使用します。テーブルはサーバーにアップロードされ、'name' に指定された名前の一時テーブルとしてアクセス可能になります。

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

HTTPインターフェースを使用する際には、外部データはmultipart/form-data形式で渡されます。各テーブルは別々のファイルとして送信されます。テーブル名はファイル名から取得されます。`query_string` には `name_format`, `name_types`, `name_structure` のパラメータが渡され、`name` はこれらのパラメータが対応するテーブルの名前です。パラメータの意味は、コマンドラインクライアントを使用する場合と同じです。

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

分散クエリ処理の場合、一時テーブルはすべてのリモートサーバーに送信されます。
