---
slug: '/operations/caches'
sidebar_position: 65
sidebar_label: 'キャッシュ'
title: 'キャッシュの種類'
description: 'クエリを実行する際、ClickHouseは異なるキャッシュを使用します。'
---

クエリを実行する際、ClickHouseは異なるキャッシュを使用します。

主要なキャッシュの種類:

- `mark_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) 系のテーブルエンジンによって使用されるマークのキャッシュ。
- `uncompressed_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) 系のテーブルエンジンによって使用される非圧縮データのキャッシュ。
- `skipping_index_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) 系のテーブルエンジンによって使用されるメモリ内スキップインデックスグラニュールのキャッシュ。
- オペレーティングシステムのページキャッシュ（実際のデータを含むファイルに対して間接的に使用される）。

追加のキャッシュの種類:

- DNSキャッシュ。
- [Regexp](../interfaces/formats.md#data-format-regexp) キャッシュ。
- コンパイルされた式キャッシュ。
- [Avro形式](../interfaces/formats.md#data-format-avro) スキーマキャッシュ。
- [Dictionaries](../sql-reference/dictionaries/index.md) データキャッシュ。
- スキーマ推論キャッシュ。
- [ファイルシステムキャッシュ](storing-data.md)（S3、Azure、ローカルおよびその他のディスク上）。
- [クエリキャッシュ](query-cache.md)。
- フォーマットスキーマキャッシュ。

キャッシュの1つを削除するには、[SYSTEM DROP ... CACHE](../sql-reference/statements/system.md#drop-mark-cache) ステートメントを使用します。

フォーマットスキーマキャッシュを削除するには、[SYSTEM DROP FORMAT SCHEMA CACHE](/sql-reference/statements/system#system-drop-schema-format) ステートメントを使用します。
