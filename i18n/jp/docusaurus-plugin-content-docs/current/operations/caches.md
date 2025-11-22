---
description: 'クエリの実行時に、ClickHouse はさまざまなキャッシュを使用します。'
sidebar_label: 'キャッシュ'
sidebar_position: 65
slug: /operations/caches
title: 'キャッシュの種類'
keywords: ['cache']
doc_type: 'reference'
---

# キャッシュの種類

クエリを実行する際、ClickHouse はさまざまなキャッシュを使用してクエリを高速化し、
ディスクへの読み書きの必要性を減らします。

主なキャッシュの種類は次のとおりです。

- `mark_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンで使用される [マーク](/development/architecture#merge-tree) のキャッシュ。
- `uncompressed_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンで使用される、非圧縮データのキャッシュ。
- オペレーティングシステムのページキャッシュ（実データを格納したファイルに対して間接的に使用されます）。

そのほかにも、さまざまな種類の追加キャッシュがあります。

- DNS キャッシュ。
- [Regexp](/interfaces/formats/Regexp) キャッシュ。
- コンパイル済み式キャッシュ。
- [ベクトル類似度インデックス](../engines/table-engines/mergetree-family/annindexes.md) キャッシュ。
- [テキストインデックス](../engines/table-engines/mergetree-family/invertedindexes.md#caching) キャッシュ。
- [Avro 形式](/interfaces/formats/Avro) スキーマキャッシュ。
- [Dictionaries](../sql-reference/dictionaries/index.md) データキャッシュ。
- スキーマ推論キャッシュ。
- S3、Azure、ローカルディスクなどに対する [Filesystem cache](storing-data.md)。
- [Userspace page cache](/operations/userspace-page-cache)。
- [Query cache](query-cache.md)。
- [Query condition cache](query-condition-cache.md)。
- フォーマットスキーマキャッシュ。

パフォーマンスチューニング、トラブルシューティング、またはデータ整合性の理由でいずれかのキャッシュを削除したい場合は、
[`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md) ステートメントを使用できます。