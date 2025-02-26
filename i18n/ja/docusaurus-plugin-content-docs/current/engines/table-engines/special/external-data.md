---
slug: /engines/table-engines/special/external-data
sidebar_position: 130
sidebar_label: 外部データ
title: "クエリ処理のための外部データ"
description: "ClickHouseは、クエリ処理に必要なデータをサーバーに送信することを許可しており、それと共に`SELECT`クエリを送信します。このデータは一時テーブルに配置され、クエリ内で使用できます（例えば、`IN`演算子で）。"
---

# クエリ処理のための外部データ

ClickHouseは、クエリ処理に必要なデータをサーバーに送信することを許可しており、それと共に`SELECT`クエリを送信します。このデータは一時テーブル（「一時テーブル」セクションを参照）に配置され、クエリ内で使用できます（例えば、`IN`演算子で）。

例えば、重要なユーザー識別子が含まれているテキストファイルがある場合、そのファイルをサーバーにアップロードして、このリストによるフィルタリングを使用するクエリを実行できます。

大容量の外部データを使用して複数のクエリを実行する必要がある場合は、この機能を使用しないでください。データを事前にDBにアップロードする方が良いです。

外部データは、コマンドラインクライアント（非対話モード）を使用してアップロードするか、HTTPインターフェースを使用してアップロードできます。

コマンドラインクライアントでは、以下の形式でパラメータセクションを指定できます。

``` bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

送信されるテーブルの数に応じて、複数のこのようなセクションを持つことができます。

**–external** – 節の開始を示します。  
**–file** – テーブルダンプのあるファイルへのパス、または、---がstdinを指します。  
stdinからは単一のテーブルのみを取得できます。

以下のパラメータはオプションです：  
**–name** – テーブル名。省略した場合は、_dataが使用されます。  
**–format** – ファイル内のデータ形式。省略した場合は、TabSeparatedが使用されます。

次のうちの1つのパラメータが必要です：  
**–types** – コンマで区切られたカラムタイプのリスト。例えば、`UInt64,String`。カラムは _1, _2, ... という名前になります。  
**–structure** – `UserID UInt64`, `URL String`の形式で、テーブル構造を定義します。カラムの名前とタイプを定義します。

'file'で指定されたファイルは、'format'で指定された形式によって解析され、'types'または'structure'で指定されたデータタイプを使用します。テーブルはサーバーにアップロードされ、'name'で指定された名前の一時テーブルとしてアクセス可能になります。

例:

``` bash
$ echo -ne "1\n2\n3\n" | clickhouse-client --query="SELECT count() FROM test.visits WHERE TraficSourceID IN _data" --external --file=- --types=Int8
849897
$ cat /etc/passwd | sed 's/:/\t/g' | clickhouse-client --query="SELECT shell, count() AS c FROM passwd GROUP BY shell ORDER BY c DESC" --external --file=- --name=passwd --structure='login String, unused String, uid UInt16, gid UInt16, comment String, home String, shell String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

HTTPインターフェースを使用する場合、外部データはmultipart/form-data形式で渡されます。各テーブルは別々のファイルとして送信されます。テーブル名はファイル名から取得されます。`query_string`には、`name_format`、`name_types`、`name_structure`のパラメータが渡され、`name`はこれらのパラメータに対応するテーブルの名前です。パラメータの意味は、コマンドラインクライアントを使用する場合と同じです。

例:

``` bash
$ cat /etc/passwd | sed 's/:/\t/g' > passwd.tsv

$ curl -F 'passwd=@passwd.tsv;' 'http://localhost:8123/?query=SELECT+shell,+count()+AS+c+FROM+passwd+GROUP+BY+shell+ORDER+BY+c+DESC&passwd_structure=login+String,+unused+String,+uid+UInt16,+gid+UInt16,+comment+String,+home+String,+shell+String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

分散クエリ処理のために、一時テーブルはすべてのリモートサーバーに送信されます。
