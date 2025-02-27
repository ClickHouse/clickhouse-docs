---
slug: /operations/caches
sidebar_position: 65
sidebar_label: キャッシュ
title: "キャッシュの種類"
description: クエリを実行する際、ClickHouseは異なるキャッシュを使用します。
---

クエリを実行する際、ClickHouseは異なるキャッシュを使用します。

主なキャッシュの種類：

- `mark_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンが使用するマークのキャッシュ。
- `uncompressed_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンが使用する未圧縮データのキャッシュ。
- `skipping_index_cache` — [MergeTree](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンが使用するメモリ内スキッピングインデックスグラニュールのキャッシュ。
- オペレーティングシステムのページキャッシュ（実際のデータを含むファイルに間接的に使用される）。

追加のキャッシュの種類：

- DNSキャッシュ。
- [Regexp](../interfaces/formats.md#data-format-regexp) キャッシュ。
- コンパイルされた式のキャッシュ。
- [Avroフォーマット](../interfaces/formats.md#data-format-avro) スキーマのキャッシュ。
- [Dictionary](../sql-reference/dictionaries/index.md) データのキャッシュ。
- スキーマ推論のキャッシュ。
- S3、Azure、ローカルおよびその他のディスク上の[ファイルシステムキャッシュ](storing-data.md)。
- [クエリキャッシュ](query-cache.md)。

キャッシュの一つを削除するには、[SYSTEM DROP ... CACHE](../sql-reference/statements/system.md#drop-mark-cache) ステートメントを使用します。
