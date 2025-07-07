---
'description': 'Log Engine Familyのドキュメント'
'sidebar_label': 'ログファミリー'
'sidebar_position': 20
'slug': '/engines/table-engines/log-family/'
'title': 'Log Engine Family'
---




# Log Engine Family

これらのエンジンは、多くの小さなテーブル（約100万行まで）を迅速に書き込み、その後全体として読み取る必要があるシナリオ向けに開発されました。

ファミリーのエンジン:

| Log Engines                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log`ファミリーのテーブルエンジンは、[HDFS](/engines/table-engines/integrations/hdfs)または[S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3)の分散ファイルシステムにデータを保存できます。

:::warning このエンジンはログデータ用ではありません。
名前に反して、*Logテーブルエンジンはログデータの保存を目的としたものではありません。 迅速に書き込む必要がある小規模なボリュームにのみ使用するべきです。
:::

## Common Properties {#common-properties}

エンジンの特性:

- ディスクにデータを保存します。

- 書き込み時にファイルの末尾にデータを追加します。

- 同時データアクセスのためのロックをサポートしています。

    `INSERT`クエリの間、テーブルはロックされ、他のデータの読み書きクエリはテーブルのロック解除を待機します。データ書き込みクエリがない場合、任意の数のデータ読み込みクエリを同時に実行できます。

- [ミューテーション](/sql-reference/statements/alter#mutations)をサポートしていません。

- インデックスをサポートしていません。

    これは、データの範囲に対する`SELECT`クエリが効率的でないことを意味します。

- データを原子性で書き込みません。

    書き込み操作が破損した場合（例えば、異常なサーバーシャットダウン）、破損したデータを持つテーブルが得られる可能性があります。

## Differences {#differences}

`TinyLog`エンジンはファミリーの中で最も単純で、最も機能が限られ、効率が低いです。`TinyLog`エンジンは、単一のクエリ内で複数のスレッドによる並列データ読み込みをサポートしていません。データを読む速度は、単一のクエリからの並列読み込みをサポートしているファミリーの他のエンジンよりも遅く、各カラムを別々のファイルに保存するため、`Log`エンジンとほぼ同じ数のファイルディスクリプタを使用します。単純なシナリオでのみ使用してください。

`Log`および`StripeLog`エンジンは並列データ読み込みをサポートしています。データを読み取る際、ClickHouseは複数のスレッドを使用します。各スレッドは別々のデータブロックを処理します。`Log`エンジンはテーブルの各カラムに対して別々のファイルを使用します。`StripeLog`はすべてのデータを1つのファイルに保存します。その結果、`StripeLog`エンジンはファイルディスクリプタの数が少なくなりますが、データを読み込む際の効率は`Log`エンジンの方が高いです。
