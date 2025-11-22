---
description: 'ClickHouse におけるクエリ条件キャッシュ機能の利用と設定に関するガイド'
sidebar_label: 'クエリ条件キャッシュ'
sidebar_position: 64
slug: /operations/query-condition-cache
title: 'クエリ条件キャッシュ'
doc_type: 'guide'
---



# クエリ条件キャッシュ

:::note
クエリ条件キャッシュが動作するのは、[enable_analyzer](https://clickhouse.com/docs/operations/settings/settings#enable_analyzer) が true に設定されている場合のみです。これはデフォルト値です。
:::

多くの実運用ワークロードでは、同じ、またはほぼ同じデータに対して繰り返しクエリが実行されます（例えば、既存データに新規データが追加されたものなど）。
ClickHouse は、そのようなクエリパターンを最適化するために、さまざまな最適化手法を提供しています。
1 つの手段は、インデックス構造（例: プライマリキーインデックス、スキップインデックス、プロジェクション）や事前計算（マテリアライズドビュー）を用いて、物理的なデータレイアウトをチューニングすることです。
別の手段は、ClickHouse の [query cache](query-cache.md) を利用して、クエリの再評価を避けることです。
最初の手法のデメリットは、データベース管理者による手動での調整と監視が必要になることです。
2 番目の手法のデメリットは、（クエリキャッシュはトランザクションレベルで一貫していないため）古い結果を返す可能性があることであり、これが許容できるかどうかはユースケースに依存します。

クエリ条件キャッシュは、これら両方の問題に対してエレガントな解決策を提供します。
これは、同じデータに対してフィルタ条件（例: `WHERE col = 'xyz'`）を評価すると、常に同じ結果が返るという考えに基づいています。
より具体的には、クエリ条件キャッシュは、評価された各フィルタと各グラニュール（= デフォルトでは 8192 行のブロック）について、そのグラニュール内のどの行もフィルタ条件を満たさないかどうかを記録します。
この情報は 1 ビットとして記録されます。ビット 0 はフィルタに一致する行が 1 行も存在しないことを表し、ビット 1 は少なくとも 1 行の一致する行が存在することを意味します。
前者の場合、ClickHouse はフィルタ評価時に対応するグラニュールをスキップできますが、後者の場合、そのグラニュールは読み込んで評価しなければなりません。

クエリ条件キャッシュが効果を発揮するには、次の 3 つの前提条件が満たされている必要があります:
- 1 つ目に、ワークロードが同じフィルタ条件を繰り返し評価している必要があります。これは、同じクエリが複数回繰り返し実行される場合には自然に発生しますが、2 つのクエリが同じフィルタを共有している場合にも発生します。例: `SELECT product FROM products WHERE quality > 3` と `SELECT vendor, count() FROM products WHERE quality > 3`。
- 2 つ目に、データの大部分が不変、すなわちクエリ間で変更されない必要があります。これは一般に ClickHouse では成り立ちます。なぜなら、パーツは不変であり、INSERT によってのみ作成されるためです。
- 3 つ目に、フィルタが選択的であり、フィルタ条件を満たす行が比較的少ない必要があります。フィルタ条件に一致する行が少なければ少ないほど、ビット 0（一致する行なし）として記録されるグラニュールが多くなり、その結果として、後続のフィルタ評価から除外（プルーニング）できるデータ量が多くなります。



## メモリ消費量 {#memory-consumption}

クエリ条件キャッシュは、フィルタ条件とグラニュールごとに1ビットのみを格納するため、メモリ消費量はわずかです。
クエリ条件キャッシュの最大サイズは、サーバー設定 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) (デフォルト: 100 MB) を使用して設定できます。
100 MBのキャッシュサイズは、100 _ 1024 _ 1024 \* 8 = 838,860,800 エントリに相当します。
各エントリはマーク(デフォルトで8192行)を表すため、キャッシュは単一カラムの最大 6,871,947,673,600 行(6.8兆行)をカバーできます。
実際には、フィルタは複数のカラムに対して評価されるため、この数値はフィルタ対象のカラム数で除算する必要があります。


## 設定項目と使用方法 {#configuration-settings-and-usage}

設定項目 [use_query_condition_cache](settings/settings#use_query_condition_cache) は、特定のクエリまたは現在のセッションのすべてのクエリでクエリ条件キャッシュを利用するかどうかを制御します。

例えば、以下のクエリを最初に実行すると

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

述語を満たさないテーブルの範囲が保存されます。
同じクエリを後続で実行する際も、パラメータ `use_query_condition_cache = true` を指定することで、クエリ条件キャッシュを利用してスキャンするデータ量を削減できます。


## 管理 {#administration}

クエリ条件キャッシュはClickHouseの再起動後は保持されません。

クエリ条件キャッシュをクリアするには、[`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)を実行します。

キャッシュの内容は、システムテーブル[system.query_condition_cache](system-tables/query_condition_cache.md)で確認できます。
クエリ条件キャッシュの現在のサイズをMB単位で計算するには、`SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`を実行します。
個別のフィルタ条件を調査する場合は、`system.query_condition_cache`の`condition`フィールドを確認してください。
なお、このフィールドは、設定[query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext)を有効にしてクエリを実行した場合にのみ値が格納されます。

データベース起動以降のクエリ条件キャッシュのヒット数とミス数は、システムテーブル[system.events](system-tables/events.md)にイベント「QueryConditionCacheHits」および「QueryConditionCacheMisses」として表示されます。
これらのカウンタは、設定`use_query_condition_cache = true`で実行される`SELECT`クエリに対してのみ更新され、その他のクエリは「QueryCacheMisses」に影響しません。


## 関連コンテンツ {#related-content}

- ブログ: [Introducing the Query Condition Cache](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [Predicate Caching: Query-Driven Secondary Indexing for Cloud Data Warehouses (Schmidt et. al., 2024)](https://doi.org/10.1145/3626246.3653395)
