---
description: 'When performing queries, ClickHouse uses different caches.'
sidebar_label: 'Caches'
sidebar_position: 65
slug: '/operations/caches'
title: 'Cache Types'
---




# キャッシュタイプ

クエリを実行する際、ClickHouseは異なるキャッシュを使用します。

主なキャッシュタイプ:

- `mark_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンによって使用されるマークのキャッシュ。
- `uncompressed_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンによって使用される非圧縮データのキャッシュ。
- オペレーティングシステムのページキャッシュ（実際のデータを含むファイルに対して間接的に使用されます）。

追加のキャッシュタイプ:

- DNS キャッシュ。
- [Regexp](../interfaces/formats.md#data-format-regexp) キャッシュ。
- コンパイル済み式キャッシュ。
- [Vector Similarity Index](../engines/table-engines/mergetree-family/annindexes.md) キャッシュ。
- [Avroフォーマット](../interfaces/formats.md#data-format-avro) スキーマキャッシュ。
- [Dictionaries](../sql-reference/dictionaries/index.md) データキャッシュ。
- スキーマ推論キャッシュ。
- [Filesystem cache](storing-data.md) S3、Azure、ローカルおよびその他のディスク上。
- [Userspace page cache](/operations/userspace-page-cache)
- [Query cache](query-cache.md)。
- [Query condition cache](query-condition-cache.md)。
- フォーマットスキーマキャッシュ。

キャッシュのいずれかを削除するには、[SYSTEM DROP ... CACHE](../sql-reference/statements/system.md) ステートメントを使用します。
