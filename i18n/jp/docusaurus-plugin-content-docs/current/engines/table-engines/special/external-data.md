---
description: 'ClickHouse では、`SELECT` クエリと一緒に、そのクエリの処理に必要なデータをサーバーへ送信できます。このデータは一時テーブルに格納され、クエリ内で使用できます（例えば `IN` 演算子などで）。'
sidebar_label: 'クエリ処理のための外部データ'
sidebar_position: 130
slug: /engines/table-engines/special/external-data
title: 'クエリ処理のための外部データ'
doc_type: 'reference'
---

# クエリ処理のための外部データ

ClickHouse では、`SELECT` クエリと一緒に、そのクエリを処理するために必要なデータをサーバーに送信できます。このデータは一時テーブル（「Temporary tables」のセクションを参照）に配置され、クエリ内で使用できます（例えば、`IN` 演算子で利用可能です）。

例えば、重要なユーザー識別子が含まれているテキストファイルがある場合、そのリストでフィルタリングを行うクエリと一緒に、そのファイルをサーバーにアップロードできます。

大量の外部データを使って複数のクエリを実行する必要がある場合は、この機能は使用しないでください。事前にデータベースにデータをアップロードしておく方が適切です。

外部データは、コマンドラインクライアント（非対話モード）を使用するか、HTTP インターフェイス経由でアップロードできます。

コマンドラインクライアントでは、次の形式でパラメータセクションを指定できます

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

このセクションは、送信されるテーブルの数に応じて複数回指定できます。

**–external** – 節の開始を示します。
**–file** – テーブルダンプを含むファイルへのパス、または stdin を指す `-` を指定します。
stdin から取得できるテーブルは 1 つだけです。

次のパラメータは省略可能です: **–name** – テーブル名。省略した場合は &#95;data が使用されます。
**–format** – ファイル内のデータフォーマット。省略した場合は TabSeparated が使用されます。

次のいずれか一方のパラメータが必須です: **–types** – カンマ区切りのカラム型のリスト。例: `UInt64,String`。カラム名は &#95;1, &#95;2, ... のようになります。
**–structure** – `UserID UInt64`, `URL String` のような形式で指定するテーブル構造。カラム名と型を定義します。

&#39;file&#39; で指定されたファイルは、&#39;format&#39; で指定されたフォーマットとして解析され、&#39;types&#39; または &#39;structure&#39; で指定されたデータ型が使用されます。テーブルはサーバーにアップロードされ、&#39;name&#39; で指定された名前を持つ一時テーブルとしてサーバー側から参照可能になります。

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

HTTP インターフェースを使用する場合、外部データは multipart/form-data 形式で渡されます。各テーブルは個別のファイルとして送信されます。テーブル名はファイル名から取得されます。`query_string` には、パラメータ `name_format`、`name_types`、`name_structure` が渡され、ここで `name` には、それぞれのパラメータが対応するテーブル名が入ります。パラメータの意味は、コマンドラインクライアントを使用する場合と同じです。

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
