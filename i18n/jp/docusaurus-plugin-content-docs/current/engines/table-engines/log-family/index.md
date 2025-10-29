---
'description': 'Documentation for Log Engine Family'
'sidebar_label': 'ログファミリー'
'sidebar_position': 20
'slug': '/engines/table-engines/log-family/'
'title': 'ログエンジンファミリー'
'doc_type': 'guide'
---


# Logエンジンファミリー

これらのエンジンは、多くの小さなテーブル（約100万行まで）を迅速に書き込む必要があり、後でそれらを全体として読み取るシナリオのために開発されました。

ファミリーのエンジン:

| Logエンジン                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log`ファミリーのテーブルエンジンは、[HDFS](/engines/table-engines/integrations/hdfs)または[S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)分散ファイルシステムにデータを保存できます。

:::warning このエンジンはログデータ用ではありません。
名前に反して、*Logテーブルエンジンはログデータの保存を目的としていません。迅速に書き込む必要がある少量のデータにのみ使用するべきです。
:::

## 共通のプロパティ {#common-properties}

エンジン:

- ディスクにデータを保存します。

- 書き込み時にファイルの末尾にデータを追加します。

- 競合データアクセスのためのロックをサポートします。

    `INSERT`クエリ中は、テーブルがロックされ、データの読み書きの他のクエリは、テーブルのロック解除を待機します。データ書き込みクエリがない場合は、任意の数のデータ読み取りクエリを同時に実行できます。

- [ミューテーション](/sql-reference/statements/alter#mutations)をサポートしていません。

- インデックスをサポートしていません。

    これは、データの範囲に対する`SELECT`クエリが非効率的であることを意味します。

- データを原子的に書き込みません。

    書き込み操作を中断する何かがあった場合、例えば異常なサーバーシャットダウンなど、壊れたデータを含むテーブルが生成される可能性があります。

## 違い {#differences}

`TinyLog`エンジンはファミリーの中で最もシンプルで、機能が最も乏しく、効率も最も低いです。`TinyLog`エンジンは、単一のクエリ内で複数のスレッドによる並列データ読み取りをサポートしていません。他のエンジンよりもデータの読み取りが遅く、各カラムを別々のファイルに保存するため、`Log`エンジンとほぼ同数のファイルディスクリプタを使用します。単純なシナリオでのみ使用してください。

`Log`および`StripeLog`エンジンは、並列データ読み取りをサポートしています。データを読み取る際、ClickHouseは複数のスレッドを使用します。各スレッドは、別々のデータブロックを処理します。`Log`エンジンは、テーブルの各カラムのために別々のファイルを使用します。`StripeLog`は、すべてのデータを1つのファイルに保存します。その結果、`StripeLog`エンジンはより少ないファイルディスクリプタを使用しますが、データを読み込む際には`Log`エンジンがより高い効率を提供します。
