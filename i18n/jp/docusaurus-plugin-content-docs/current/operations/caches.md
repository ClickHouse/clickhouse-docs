---
slug: /operations/caches
sidebar_position: 65
sidebar_label: キャッシュ
title: "キャッシュの種類"
description: クエリを実行する際、ClickHouseはさまざまなキャッシュを使用します。
---

クエリを実行する際、ClickHouseはさまざまなキャッシュを使用します。

主なキャッシュの種類:

- `mark_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md)ファミリーのテーブルエンジンで使用されるマークのキャッシュ。
- `uncompressed_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md)ファミリーのテーブルエンジンで使用される非圧縮データのキャッシュ。
- `skipping_index_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md)ファミリーのテーブルエンジンで使用されるインメモリのスキッピングインデックスグラニュールのキャッシュ。
- オペレーティングシステムのページキャッシュ（実際のデータを含むファイルに対して間接的に使用される）。

追加のキャッシュの種類:

- DNSキャッシュ。
- [Regexp](../interfaces/formats.md#data-format-regexp)キャッシュ。
- コンパイル済み式キャッシュ。
- [Avroフォーマット](../interfaces/formats.md#data-format-avro)スキーマキャッシュ。
- [Dictionary](../sql-reference/dictionaries/index.md)データキャッシュ。
- スキーマ推論キャッシュ。
- S3、Azure、ローカル及びその他のディスク上の[ファイルシステムキャッシュ](storing-data.md)。
- [クエリキャッシュ](query-cache.md)。

キャッシュの一つを削除するには、[SYSTEM DROP ... CACHE](../sql-reference/statements/system.md#drop-mark-cache)文を使用してください。
