---
description: 'クエリの実行時に、ClickHouse はさまざまな種類のキャッシュを使用します。'
sidebar_label: 'キャッシュ'
sidebar_position: 65
slug: /operations/caches
title: 'キャッシュの種類'
keywords: ['cache']
doc_type: 'reference'
---

# キャッシュの種類 {#cache-types}

クエリを実行する際には、ClickHouse はさまざまなキャッシュを利用してクエリ処理を高速化し、
ディスクからの読み取りやディスクへの書き込みの必要性を減らします。

主なキャッシュの種類は次のとおりです：

* `mark_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンで使用される [marks](/development/architecture#merge-tree) のキャッシュ。
* `uncompressed_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンで使用される非圧縮データのキャッシュ。
* オペレーティングシステムのページキャッシュ（実データを保持するファイルに対して間接的に利用される）。

このほかにも、多数の追加キャッシュがあります：

* DNS キャッシュ。
* [Regexp](/interfaces/formats/Regexp) キャッシュ。
* コンパイル済み式のキャッシュ。
* [ベクトル類似性インデックス](../engines/table-engines/mergetree-family/annindexes.md) キャッシュ。
* [テキストインデックス](../engines/table-engines/mergetree-family/invertedindexes.md#caching) キャッシュ。
* [Avro format](/interfaces/formats/Avro) スキーマキャッシュ。
* [Dictionaries](../sql-reference/dictionaries/index.md) データキャッシュ。
* スキーマ推論キャッシュ。
* S3、Azure、ローカルおよびその他のディスクを対象とした [Filesystem cache](storing-data.md)。
* [Userspace page cache](/operations/userspace-page-cache)。
* [Query cache](query-cache.md)。
* [Query condition cache](query-condition-cache.md)。
* フォーマットスキーマキャッシュ。

パフォーマンスチューニング、トラブルシューティング、またはデータ整合性の観点から
これらのキャッシュのいずれかを削除したい場合は、
[`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md) ステートメントを使用できます。