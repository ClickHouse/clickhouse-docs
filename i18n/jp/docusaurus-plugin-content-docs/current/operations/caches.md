---
'description': 'クエリを実行する際、ClickHouseはさまざまなキャッシュを使用します。'
'sidebar_label': 'キャッシュ'
'sidebar_position': 65
'slug': '/operations/caches'
'title': 'キャッシュの種類'
'keywords':
- 'cache'
'doc_type': 'reference'
---


# キャッシュの種類

クエリを実行する際、ClickHouseはさまざまなキャッシュを使用してクエリの速度を向上させ、ディスクへの読み書きの必要性を減らします。

主なキャッシュの種類は次のとおりです：

- `mark_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンによって使用される [マーク](/development/architecture#merge-tree) のキャッシュ。
- `uncompressed_cache` — [`MergeTree`](../engines/table-engines/mergetree-family/mergetree.md) ファミリーのテーブルエンジンによって使用される非圧縮データのキャッシュ。
- オペレーティングシステムのページキャッシュ（実際のデータがあるファイルに対して間接的に使用されます）。

さらに多数の追加キャッシュタイプがあります：

- DNSキャッシュ。
- [Regexp](../interfaces/formats.md#data-format-regexp) キャッシュ。
- コンパイル済み式キャッシュ。
- [ベクトル類似性インデックス](../engines/table-engines/mergetree-family/annindexes.md) キャッシュ。
- [Avro形式](../interfaces/formats.md#data-format-avro) スキーマのキャッシュ。
- [辞書](../sql-reference/dictionaries/index.md) データキャッシュ。
- スキーマ推論キャッシュ。
- S3、Azure、ローカルおよびその他のディスクに対する [ファイルシステムキャッシュ](storing-data.md)。
- [ユーザースペースページキャッシュ](/operations/userspace-page-cache)。
- [クエリキャッシュ](query-cache.md)。
- [クエリ条件キャッシュ](query-condition-cache.md)。
- 形式スキーマキャッシュ。

パフォーマンスチューニング、トラブルシューティング、またはデータ整合性の理由からキャッシュの1つを削除したい場合は、[`SYSTEM DROP ... CACHE`](../sql-reference/statements/system.md) ステートメントを使用できます。
