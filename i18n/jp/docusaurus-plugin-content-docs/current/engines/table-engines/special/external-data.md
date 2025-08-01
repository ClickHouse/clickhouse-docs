---
description: 'ClickHouseは、`SELECT`クエリと一緒にクエリ処理に必要なデータをサーバーに送信することを可能にします。このデータは一時テーブルに配置され、クエリ内で使用できます（たとえば、`IN`演算子で）。'
sidebar_label: '外部データ'
sidebar_position: 130
slug: '/engines/table-engines/special/external-data'
title: 'クエリ処理の外部データ'
---




# クエリ処理のための外部データ

ClickHouseは、必要なデータをサーバーに送信し、`SELECT`クエリと一緒に処理することを許可します。このデータは一時テーブルに格納され（「一時テーブル」セクションを参照）、クエリ内で使用できます（例えば、`IN`演算子内で）。

たとえば、重要なユーザー識別子を含むテキストファイルがある場合、そのファイルをサーバーにアップロードし、このリストによるフィルタリングを使用するクエリと一緒に送信できます。

複数のクエリを大容量の外部データと共に実行する必要がある場合、この機能を使用しないでください。データを事前にDBにアップロードする方が良いです。

外部データは、コマンドラインクライアント（非対話モード）を介して、またはHTTPインターフェースを通じてアップロードできます。

コマンドラインクライアントでは、次の形式でパラメータセクションを指定できます。

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

送信されるテーブルの数に応じて、複数のセクションをこのように指定できます。

**–external** – 条項の開始を示します。  
**–file** – テーブルダンプのファイルパス、または標準入力を指す -。  
標準入力からは単一のテーブルしか取得できません。

次のパラメータは任意です: 
**–name**– テーブルの名前。省略すると、_data が使用されます。  
**–format** – ファイル内のデータフォーマット。省略すると、TabSeparated が使用されます。

次のパラメータのいずれかが必須です: 
**–types** – カンマ区切りのカラムタイプのリスト。例えば: `UInt64,String`。カラムは _1, _2, ... と名付けられます。  
**–structure**– `UserID UInt64`, `URL String` 形式のテーブル構造。カラム名とタイプを定義します。

'file' で指定されたファイルは、'format' で指定された形式で解析され、'types' または 'structure' で指定されたデータ型が使用されます。テーブルはサーバーにアップロードされ、'name' の名前の一時テーブルとしてそこにアクセス可能です。

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

HTTPインターフェースを使用する場合、外部データは multipart/form-data 形式で渡されます。各テーブルは別のファイルとして送信されます。テーブル名はファイル名から取得されます。`query_string` には、`name_format`、`name_types`、および `name_structure` のパラメータが渡されます。ここで、`name` はこれらのパラメータが対応するテーブルの名前です。パラメータの意味はコマンドラインクライアントを使用した場合と同じです。

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
