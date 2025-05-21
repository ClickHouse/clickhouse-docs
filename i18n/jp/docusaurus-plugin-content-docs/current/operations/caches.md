---
description: 'クエリを実行する際、ClickHouseは異なるキャッシュを使用します。'
sidebar_label: 'キャッシュ'
sidebar_position: 65
slug: /operations/caches
title: 'キャッシュの種類'
---


# キャッシュの種類

クエリを実行する際、ClickHouseは異なるキャッシュを使用します。

主なキャッシュの種類:

- `mark_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンによって使用されるマークのキャッシュ。
- `uncompressed_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンによって使用される非圧縮データのキャッシュ。
- オペレーティングシステムのページキャッシュ（実際のデータを含むファイルのために間接的に使用されます）。

追加のキャッシュの種類:

- DNSキャッシュ。
- [Regexp](../interfaces/formats.md#data-format-regexp) キャッシュ。
- コンパイルされた式のキャッシュ。
- [Vector Similarity Index](../engines/table-engines/mergetree-family/annindexes.md) キャッシュ。
- [Avroフォーマット](../interfaces/formats.md#data-format-avro) スキーマのキャッシュ。
- [Dictionaries](../sql-reference/dictionaries/index.md) データキャッシュ。
- スキーマ推論キャッシュ。
- S3、Azure、ローカルおよびその他のディスク上の[ファイルシステムキャッシュ](storing-data.md)。
- [ユーザ空間ページキャッシュ](/operations/userspace-page-cache)
- [クエリキャッシュ](query-cache.md)。
- [クエリ条件キャッシュ](query-condition-cache.md)。
- フォーマットスキーマキャッシュ。

キャッシュのうちの1つを削除するには、[SYSTEM DROP ... CACHE](../sql-reference/statements/system.md) ステートメントを使用します。
