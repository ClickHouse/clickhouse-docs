---
description: 'Log エンジンファミリーのドキュメント'
sidebar_label: 'Log ファミリー'
sidebar_position: 20
slug: /engines/table-engines/log-family/
title: 'Log エンジンファミリー'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Log テーブルエンジンファミリー {#log-table-engine-family}

<CloudNotSupportedBadge/>

これらのエンジンは、多数の小さなテーブル（およそ 100 万行まで）を高速に書き込み、後からテーブル全体をまとめて読み取る必要があるシナリオ向けに開発されています。

このファミリーに属するエンジン:

| Log Engines                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` ファミリーのテーブルエンジンは、[HDFS](/engines/table-engines/integrations/hdfs) や [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) などの分散ファイルシステムにデータを保存できます。

:::warning This engine is not for log data.
名前に *Log* と付いているものの、Log テーブルエンジンはログデータの保存を目的としたものではありません。高速な書き込みが必要な、少量のデータに対してのみ使用してください。
:::

## 共通プロパティ {#common-properties}

エンジンの共通特性:

- データをディスク上に保存します。

- 書き込み時にはファイルの末尾にデータを追記します。

- 並行データアクセス向けのロックをサポートします。

    `INSERT` クエリの実行中はテーブルがロックされ、他の読み取りおよび書き込みクエリはテーブルのロック解除を待機します。書き込みクエリがなければ、任意の数の読み取りクエリを同時に実行できます。

- [mutations](/sql-reference/statements/alter#mutations) をサポートしません。

- インデックスをサポートしません。

    これは、データ範囲に対する `SELECT` クエリが効率的でないことを意味します。

- データのアトミックな書き込みを行いません。

    たとえばサーバーの異常終了などにより書き込み処理が中断された場合、破損したデータを含むテーブルが生成される可能性があります。

## 違い {#differences}

`TinyLog` エンジンはこのファミリーの中で最も単純で、提供される機能が最も少なく、効率も最も低いエンジンです。`TinyLog` エンジンは、単一のクエリ内で複数スレッドによる並列データ読み取りをサポートしません。単一クエリからの並列読み取りをサポートする同じファミリー内の他のエンジンと比べてデータ読み取りが遅く、また各カラムを個別のファイルとして保存するため、`Log` エンジンとほぼ同じ数のファイルディスクリプタを使用します。シンプルな用途でのみ使用してください。

`Log` エンジンと `StripeLog` エンジンは並列データ読み取りをサポートします。データ読み取り時には、ClickHouse は複数のスレッドを使用します。各スレッドは個別のデータブロックを処理します。`Log` エンジンはテーブルの各カラムごとに個別のファイルを使用します。`StripeLog` はすべてのデータを 1 つのファイルに保存します。その結果、`StripeLog` エンジンは使用するファイルディスクリプタが少なくなりますが、データ読み取り時の効率は `Log` エンジンの方が高くなります。
