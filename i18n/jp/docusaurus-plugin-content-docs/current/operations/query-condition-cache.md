---
description: 'ClickHouse でクエリ条件キャッシュ機能を使用および構成するためのガイド'
sidebar_label: 'クエリ条件キャッシュ'
sidebar_position: 64
slug: '/operations/query-condition-cache'
title: 'クエリ条件キャッシュ'
---




# クエリ条件キャッシュ

多くの実際のワークロードは、同じまたはほぼ同じデータに対する繰り返しクエリを含みます（たとえば、既存のデータに新しいデータを追加したものなど）。
ClickHouse は、そのようなクエリパターンを最適化するためのさまざまな最適化手法を提供しています。
1つの可能性は、インデックス構造（例：主キーインデックス、スキッピングインデックス、プロジェクション）や事前計算（マテリアライズドビュー）を使用して物理データレイアウトを調整することです。
もう1つの可能性は、ClickHouse の [クエリキャッシュ](query-cache.md) を使用して、繰り返しクエリ評価を回避することです。
最初のアプローチの欠点は、データベース管理者による手動の介入と監視が必要であることです。
2つ目のアプローチは、クエリキャッシュがトランザクショナルに一貫性がないため、古い結果を返すことがあるため、ユースケースによっては受け入れ可能であるかどうかが問題となります。

クエリ条件キャッシュは、両方の問題に優れた解決策を提供します。
これは、同じデータに対してフィルター条件（例： `WHERE col = 'xyz'`）を評価すると常に同じ結果が返されるという考えに基づいています。
より具体的には、クエリ条件キャッシュは、各評価されたフィルターと各グラニュール（デフォルトでは8192行のブロック）について、グラニュール内にフィルター条件を満たす行がないかどうかを記憶します。
その情報は1ビットとして記録されます：0ビットは行がフィルターに一致しないことを表し、1ビットは少なくとも1つの一致する行が存在することを意味します。
前者の場合、ClickHouse はフィルター評価中に対応するグラニュールをスキップすることができますが、後者の場合はグラニュールをロードし評価する必要があります。

クエリ条件キャッシュが効果的であるためには、3つの前提条件が満たされる必要があります：
- 第一に、ワークロードは同じフィルター条件を繰り返し評価する必要があります。これは、クエリが何度も繰り返される場合に自然に発生しますが、2つのクエリが同じフィルターを共有する場合（例： `SELECT product FROM products WHERE quality > 3` と `SELECT vendor, count() FROM products WHERE quality > 3` ）にも発生することがあります。
- 第二に、大多数のデータは不変である必要があります。すなわち、クエリ間で変更されないことです。これは、パーツが不変であり、INSERT によってのみ作成されるため、一般的に ClickHouse では当てはまります。
- 第三に、フィルターが選択的である必要があります。つまり、フィルター条件を満たす行は相対的に少数である必要があります。フィルター条件に一致する行が少ないほど、ビット0（一致する行がない）が記録されたグラニュールが増え、以降のフィルター評価から「プルーニング」できるデータが増えます。

## メモリ消費 {#memory-consumption}

クエリ条件キャッシュは、フィルター条件とグラニュールごとに1ビットのみを保存するため、消費するメモリは非常に少量です。
クエリ条件キャッシュの最大サイズは、サーバー設定 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size) を使用して構成でき、デフォルトは100 MBです。
100 MB のキャッシュサイズは、100 * 1024 * 1024 * 8 = 838,860,800 エントリに相当します。
各エントリはマーク（デフォルトで8192行）を示し、このキャッシュは単一のカラムに対して最大 6,871,947,673,600（6.8兆）行をカバーできます。
実際には、フィルターは 1 つ以上のカラムで評価されるため、その数はフィルター対象のカラム数で割る必要があります。

## 設定と使用法 {#configuration-settings-and-usage}

設定 [use_query_condition_cache](settings/settings#use_query_condition_cache) は、特定のクエリまたは現在のセッションのすべてのクエリがクエリ条件キャッシュを使用するかどうかを制御します。

たとえば、次のクエリの最初の実行は、

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

条件を満たさないテーブルの範囲を保存します。
同じクエリのその後の実行もパラメーター `use_query_condition_cache = true` で実施されると、クエリ条件キャッシュを利用してより少ないデータをスキャンします。

## 管理 {#administration}

クエリ条件キャッシュは ClickHouse の再起動間では保持されません。

クエリ条件キャッシュをクリアするには、 `SYSTEM DROP QUERY CONDITION CACHE` を実行します。

キャッシュの内容はシステムテーブル [system.query_condition_cache](system-tables/query_condition_cache.md) に表示されます。
現在のクエリ条件キャッシュのサイズを MB で計算するには、 `SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache` を実行します。
個々のフィルター条件を調査したい場合は、 `system.query_condition_cache` のフィールド `condition` を確認できます。
このフィールドは、クエリが設定 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) を有効にして実行される場合のみ populated されることに注意してください。

データベースの開始以来のクエリ条件キャッシュのヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) のイベント "QueryConditionCacheHits" と "QueryConditionCacheMisses" として表示されます。
これらのカウンターは、設定 `use_query_condition_cache = true` で実行される `SELECT` クエリのみに対して更新され、他のクエリは "QueryCacheMisses" に影響しません。

## 関連コンテンツ {#related-content}

- ブログ: [クエリ条件キャッシュの紹介](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [Predicate Caching: Query-Driven Secondary Indexing for Cloud Data Warehouses (Schmidt et. al., 2024)](https://doi.org/10.1145/3626246.3653395)
