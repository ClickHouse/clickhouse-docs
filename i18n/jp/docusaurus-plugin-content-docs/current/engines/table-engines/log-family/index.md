---
description: 'Log エンジンファミリーに関するドキュメント'
sidebar_label: 'Log ファミリー'
sidebar_position: 20
slug: /engines/table-engines/log-family/
title: 'Log エンジンファミリー'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Log テーブルエンジンファミリー

<CloudNotSupportedBadge/>

これらのエンジンは、多数の小さなテーブル（1 テーブルあたり最大おおよそ 100 万行）を高速に書き込み、後からテーブル全体をまとめて読み出す必要があるシナリオ向けに開発されました。

このファミリーに属するエンジン:

| Log エンジン                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` ファミリーのテーブルエンジンは、[HDFS](/engines/table-engines/integrations/hdfs) や [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) といった分散ファイルシステムにデータを保存できます。

:::warning このエンジンはログデータ向けではありません
名前に反して、*Log テーブルエンジンはログデータの保存を目的としたものではありません。高速に書き込む必要がある小容量データにのみ使用してください。
:::



## 共通プロパティ {#common-properties}

エンジンの特性:

- データをディスクに保存します。

- 書き込み時にファイルの末尾にデータを追加します。

- 並行データアクセスのためのロックをサポートします。

  `INSERT`クエリの実行中はテーブルがロックされ、データの読み取りおよび書き込みを行う他のクエリはテーブルのロック解除を待機します。データ書き込みクエリが実行されていない場合は、任意の数のデータ読み取りクエリを同時に実行できます。

- [ミューテーション](/sql-reference/statements/alter#mutations)をサポートしていません。

- インデックスをサポートしていません。

  これは、データ範囲に対する`SELECT`クエリが効率的でないことを意味します。

- データをアトミックに書き込みません。

  書き込み操作が中断された場合(例: サーバーの異常終了)、データが破損したテーブルが生成される可能性があります。


## 相違点 {#differences}

`TinyLog`エンジンはこのファミリーの中で最もシンプルであり、機能性と効率性が最も低くなっています。`TinyLog`エンジンは、単一クエリ内での複数スレッドによる並列データ読み取りをサポートしていません。単一クエリからの並列読み取りをサポートする同ファミリーの他のエンジンと比較してデータ読み取りが遅く、各カラムを個別のファイルに格納するため、`Log`エンジンとほぼ同数のファイルディスクリプタを使用します。シンプルなシナリオでのみ使用してください。

`Log`エンジンと`StripeLog`エンジンは並列データ読み取りをサポートしています。データ読み取り時、ClickHouseは複数のスレッドを使用します。各スレッドは個別のデータブロックを処理します。`Log`エンジンはテーブルの各カラムに対して個別のファイルを使用します。`StripeLog`はすべてのデータを1つのファイルに格納します。その結果、`StripeLog`エンジンはより少ないファイルディスクリプタを使用しますが、`Log`エンジンはデータ読み取り時により高い効率性を提供します。
