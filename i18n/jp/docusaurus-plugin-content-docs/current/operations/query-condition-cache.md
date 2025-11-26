---
description: 'ClickHouse のクエリ条件キャッシュ機能の利用と設定方法を解説するガイド'
sidebar_label: 'クエリ条件キャッシュ'
sidebar_position: 64
slug: /operations/query-condition-cache
title: 'クエリ条件キャッシュ'
doc_type: 'guide'
---



# クエリ条件キャッシュ

:::note
クエリ条件キャッシュは、[enable_analyzer](https://clickhouse.com/docs/operations/settings/settings#enable_analyzer) が true に設定されている場合にのみ動作します。これはデフォルト値です。
:::

多くの実運用ワークロードでは、同一またはほぼ同一のデータ（たとえば、既存データに新規データが追加されたもの）に対して、同じクエリが繰り返し実行されます。
ClickHouse には、そのようなクエリパターンを最適化するためのさまざまな最適化手法があります。
1 つの方法は、インデックス構造（例: プライマリキーインデックス、スキップインデックス、プロジェクション）や事前計算（マテリアライズドビュー）を用いて物理データ配置を調整することです。
もう 1 つの方法は、ClickHouse の [query cache](query-cache.md) を使用して、クエリの再評価を回避することです。
最初のアプローチの欠点は、データベース管理者による手動での調整と監視が必要になることです。
2 つ目のアプローチは、古い結果を返す可能性があります（query cache はトランザクション整合性を保証しないため）が、これはユースケースによっては許容できない場合があります。

クエリ条件キャッシュは、これら 2 つの問題に対してエレガントな解決策を提供します。
これは、同じデータに対してフィルタ条件（例: `WHERE col = 'xyz'`）を評価すると、常に同じ結果が返されるという考えに基づいています。
より具体的には、クエリ条件キャッシュは、評価された各フィルタおよび各グラニュール（＝デフォルトでは 8192 行のブロック）について、そのグラニュール内のいずれの行もフィルタ条件を満たさないかどうかを記録します。
この情報は 1 ビットとして記録されます。ビット 0 は一致する行が 1 行もないことを表し、ビット 1 は少なくとも 1 行の一致する行が存在することを意味します。
前者の場合、ClickHouse はフィルタ評価時に対応するグラニュールをスキップできますが、後者の場合、そのグラニュールは読み込んで評価する必要があります。

クエリ条件キャッシュが有効に機能するためには、次の 3 つの前提条件が満たされている必要があります:
- 1 つ目に、ワークロードが同じフィルタ条件を繰り返し評価している必要があります。これは、同じクエリが何度も繰り返し実行される場合には自然に起こりますが、2 つのクエリが同じフィルタを共有している場合にも起こり得ます。例: `SELECT product FROM products WHERE quality > 3` および `SELECT vendor, count() FROM products WHERE quality > 3`。
- 2 つ目に、データの大部分が不変（クエリ間で変化しない）である必要があります。これは一般に ClickHouse では当てはまります。なぜなら、パーツは不変であり、INSERT によってのみ作成されるからです。
- 3 つ目に、フィルタが選択的である、つまりフィルタ条件を満たす行が相対的に少ない必要があります。フィルタ条件に一致する行が少なければ少ないほど、ビット 0（該当行なし）で記録されるグラニュールが増え、その結果として後続のフィルタ評価から「プルーニング（prune）」できるデータ量が増加します。



## メモリ使用量 {#memory-consumption}

クエリ条件キャッシュは、フィルタ条件とグラニュールごとに 1 ビットのみを保存するため、使用するメモリ量はごくわずかです。
クエリ条件キャッシュの最大サイズは、サーバー設定 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size)（デフォルト: 100 MB）で設定できます。
キャッシュサイズが 100 MB の場合、100 * 1024 * 1024 * 8 = 838,860,800 エントリに相当します。
各エントリは 1 つのマーク（デフォルトでは 8192 行）を表すため、キャッシュは 1 つのカラムについて最大 6,871,947,673,600（6.8 兆）行をカバーできます。
実際には、フィルタは複数のカラムに対して評価されるため、この数値はフィルタ対象のカラム数で割る必要があります。



## 設定項目と使用方法

[use&#95;query&#95;condition&#95;cache](settings/settings#use_query_condition_cache) 設定は、特定のクエリ、または現在のセッション内のすべてのクエリでクエリ条件キャッシュを利用するかどうかを制御します。

たとえば、このクエリを最初に実行すると

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

クエリ条件キャッシュは、述語を満たさないテーブルの範囲を保存します。
以降に同じクエリを、パラメータ `use_query_condition_cache = true` を指定して実行した場合、クエリ条件キャッシュを利用してスキャン対象のデータ量を減らします。


## 管理 {#administration}

クエリ条件キャッシュは、ClickHouse を再起動しても保持されません。

クエリ条件キャッシュをクリアするには、[`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache) を実行します。

キャッシュの内容は、システムテーブル [system.query_condition_cache](system-tables/query_condition_cache.md) に表示されます。
現在のクエリ条件キャッシュのサイズを MB 単位で取得するには、`SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache` を実行します。
個別のフィルター条件を調査したい場合は、`system.query_condition_cache` の `condition` フィールドを確認できます。
このフィールドは、設定 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) を有効にしてクエリを実行した場合にのみ値が設定される点に注意してください。

データベースの起動以降のクエリ条件キャッシュのヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) において、イベント "QueryConditionCacheHits" および "QueryConditionCacheMisses" として表示されます。
いずれのカウンタも、設定 `use_query_condition_cache = true` を有効にして実行された `SELECT` クエリに対してのみ更新され、その他のクエリは "QueryCacheMisses" に影響しません。



## 関連コンテンツ {#related-content}

- ブログ記事: [Query Condition Cache の紹介](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [Predicate Caching: Query-Driven Secondary Indexing for Cloud Data Warehouses (Schmidt ほか, 2024)](https://doi.org/10.1145/3626246.3653395)
