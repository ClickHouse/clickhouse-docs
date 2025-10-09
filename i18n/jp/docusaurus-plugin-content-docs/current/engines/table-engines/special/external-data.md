---
'description': 'ClickHouse は、クエリを処理するために必要なデータを、`SELECT` クエリと共にサーバーに送信することを許可します。このデータは一時テーブルに格納され、クエリ内で使用できます（例えば、`IN`
  演算子で）。'
'sidebar_label': '外部データ'
'sidebar_position': 130
'slug': '/engines/table-engines/special/external-data'
'title': 'クエリ処理のための外部データ'
'doc_type': 'reference'
---


# クエリ処理のための外部データ

ClickHouse は、クエリを処理するために必要なデータをサーバーに送信し、`SELECT` クエリと一緒に送信することを可能にします。このデータは一時テーブルに入れられ（「一時テーブル」セクションを参照）、クエリ内で使用することができます（例えば、`IN` 演算子で）。

たとえば、重要なユーザー識別子を含むテキストファイルがある場合、フィルタリングにこのリストを使用するクエリと一緒にサーバーにアップロードすることができます。

外部データの大容量での複数クエリを実行する必要がある場合、この機能の使用は避けてください。データを事前にDBにアップロードする方が良いです。

外部データは、コマンドラインクライアント（非対話モード）または HTTP インターフェースを使用してアップロードできます。

コマンドラインクライアントでは、以下のフォーマットでパラメータセクションを指定できます。

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

テーブルの数に応じて、このようなセクションを複数持つことができます。

**–external** – 条項の開始をマークします。  
**–file** – テーブルダンプのファイルパス、または stdin を参照する - 。  
stdin からは単一のテーブルのみを取得できます。

以下のパラメータはオプションです: **–name** – テーブルの名前。省略した場合、_data が使用されます。  
**–format** – ファイル内のデータ形式。省略した場合、TabSeparated が使用されます。

次のパラメータのうちの1つが必須です: **–types** – カンマ区切りのカラムタイプのリスト。例えば: `UInt64,String`。カラムは _1, _2, ... と名付けられます。  
**–structure** – テーブル構造のフォーマット `UserID UInt64`, `URL String`。カラムの名前とタイプを定義します。

'file' に指定されたファイルは、'format' に指定された形式で解析され、'types' または 'structure' に指定されたデータ型が使用されます。テーブルはサーバーにアップロードされ、'name' に指定された名前の一時テーブルとしてそこにアクセス可能になります。

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

HTTP インターフェースを使用する場合、外部データは multipart/form-data フォーマットで渡されます。各テーブルは別々のファイルとして送信されます。テーブル名はファイル名から取得されます。`query_string` に `name_format`, `name_types`, および `name_structure` のパラメータが渡され、ここで `name` はこれらのパラメータに対応するテーブルの名前です。パラメータの意味はコマンドラインクライアントを使用する際と同じです。

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

分散クエリ処理のために、一時テーブルはすべてのリモートサーバーに送信されます。
