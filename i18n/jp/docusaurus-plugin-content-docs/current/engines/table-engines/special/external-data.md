---
slug: /engines/table-engines/special/external-data
sidebar_position: 130
sidebar_label: 外部データ
title: "クエリ処理のための外部データ"
description: "ClickHouseでは、クエリを処理するために必要なデータをサーバーに送信し、`SELECT` クエリと一緒に処理します。このデータは一時テーブルに格納され、クエリ内で使用することができます（例えば、`IN` 演算子内で）。"
---


# クエリ処理のための外部データ

ClickHouseでは、クエリを処理するために必要なデータをサーバーに送信し、`SELECT` クエリと一緒に処理します。このデータは一時テーブル（「一時テーブル」セクションを参照）に格納され、クエリ内で使用することができます（例えば、`IN` 演算子内で）。

例えば、重要なユーザー識別子を含むテキストファイルがある場合、そのファイルをサーバーにアップロードし、このリストによるフィルタリングを使用したクエリと一緒に処理することができます。

大量の外部データを伴う複数のクエリを実行する必要がある場合は、この機能を使用しない方が良いでしょう。データを事前にDBにアップロードする方がより良いです。

外部データは、コマンドラインクライアント（非対話モード）を使用するか、HTTPインターフェースを介してアップロードできます。

コマンドラインクライアントでは、次の形式でパラメータセクションを指定できます。

``` bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

このようなセクションを、送信するテーブルの数だけ複数指定することができます。

**–external** – clausesの始まりを示します。  
**–file** – テーブルダンプのファイルへのパス、または、stdinを指す-。  
stdinからは単一のテーブルのみを取得できます。

次のパラメータはオプションです： **–name**– テーブルの名前。省略した場合は、_dataが使用されます。  
**–format** – ファイルのデータフォーマット。省略した場合は、TabSeparatedが使用されます。

次のいずれかのパラメータが必要です： **–types** – コンマ区切りのカラムタイプのリスト。例えば： `UInt64,String`。カラムは_1, _2, ...と名付けられます。  
**–structure**– `UserID UInt64`, `URL String`形式でのテーブル構造。カラム名とタイプを定義します。

'file'で指定されたファイルは、'format'で指定されたフォーマットに従って解析され、'types'または'structure'で指定されたデータタイプが使用されます。テーブルはサーバーにアップロードされ、'name'で指定された名前の一時テーブルとしてアクセス可能になります。

例：

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

HTTPインターフェースを使用する場合、外部データはmultipart/form-data形式で送信されます。各テーブルは別のファイルとして伝送されます。テーブル名はファイル名から取得されます。 `query_string`には、`name_format`、`name_types`、および`name_structure`というパラメータが渡され、`name`はこれらのパラメータに対応するテーブルの名前です。パラメータの意味は、コマンドラインクライアントを使用する場合と同じです。

例：

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
