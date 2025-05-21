---
description: 'ClickHouseにおけるクエリ条件キャッシュ機能の使用と設定に関するガイド'
sidebar_label: 'クエリ条件キャッシュ'
sidebar_position: 64
slug: /operations/query-condition-cache
title: 'クエリ条件キャッシュ'
---


# クエリ条件キャッシュ

多くの実世界のワークロードは、同じまたはほぼ同じデータに対する繰り返しクエリを含んでいます（たとえば、既存のデータに新しいデータを追加したもの）。
ClickHouseは、このようなクエリパターンを最適化するためのさまざまな最適化技術を提供しています。
1つの可能性は、インデックス構造（例：主キーインデックス、スキッピングインデックス、プロジェクション）や事前計算（マテリアライズドビュー）を使用して物理データレイアウトを調整することです。
別の可能性は、ClickHouseの[クエリキャッシュ](query-cache.md)を使用して再評価を避けることです。
最初のアプローチの欠点は、データベース管理者による手動の介入と監視が必要なことです。
2番目のアプローチは、クエリキャッシュがトランザクション的に一貫性がないため、古い結果を返す可能性があり、これはユースケースによって受け入れ可能かどうかが異なります。

クエリ条件キャッシュは、両方の問題に対するエレガントな解決策を提供します。
それは、同じデータに対するフィルター条件（例：`WHERE col = 'xyz'`）を評価すると、常に同じ結果が返されるという考えに基づいています。
より具体的には、クエリ条件キャッシュは、各評価されたフィルターと各グラニュール（デフォルトで8192行のブロック）について、グラニュール内の行がフィルター条件を満たさないかどうかを記憶します。
この情報は単一のビットとして記録されます：ビット0は行がフィルターに一致しないことを表し、ビット1は少なくとも1つの一致する行が存在することを意味します。
前者の場合、ClickHouseはフィルター評価中に対応するグラニュールをスキップすることができますが、後者の場合、グラニュールをロードして評価する必要があります。

クエリ条件キャッシュは、以下の3つの前提条件が満たされるときに効果的です：
- 最初に、ワークロードは同じフィルター条件を繰り返し評価しなければなりません。これは、クエリが複数回繰り返される場合に自然に発生しますが、2つのクエリが同じフィルターを共有する場合にも発生する可能性があります。例えば、`SELECT product FROM products WHERE quality > 3` と `SELECT vendor, count() FROM products WHERE quality > 3`。
- 次に、データの大部分は不変であり、つまりクエリ間で変化しない必要があります。これは一般的に、パーツが不変であり、INSERTによってのみ作成されるClickHouseの場合に該当します。
- 最後に、フィルターは選択的でなければなりません。つまり、フィルター条件を満たす行は比較的少数である必要があります。フィルター条件に一致する行が少ないほど、ビット0（一致する行なし）で記録されるグラニュールが多くなり、以降のフィルター評価から「プルーニング」できるデータがより多くなります。

## メモリ消費 {#memory-consumption}

クエリ条件キャッシュはフィルター条件とグラニュールごとに単一のビットのみを保存するため、必要なメモリはわずかです。
クエリ条件キャッシュの最大サイズは、サーバー設定 [`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size)（デフォルト：100 MB）で構成できます。
キャッシュサイズの100 MBは、100 * 1024 * 1024 * 8 = 838,860,800エントリに相当します。
各エントリはマーク（デフォルトで8192行）を表すため、キャッシュは単一のカラムの最大6,871,947,673,600（6.8兆）行をカバーできます。
実際には、フィルターは1つ以上のカラムで評価されるため、その数はフィルターされたカラムの数で割る必要があります。

## 設定と使用法 {#configuration-settings-and-usage}

設定 [use_query_condition_cache](settings/settings#use_query_condition_cache) は、特定のクエリまたは現在のセッションのすべてのクエリがクエリ条件キャッシュを利用するかどうかを制御します。

たとえば、クエリの最初の実行

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

は、述語を満たさないテーブルの範囲を保存します。
その後、同じクエリを再実行するときも、パラメータ `use_query_condition_cache = true` を指定すると、クエリ条件キャッシュを利用してより少ないデータをスキャンします。

## 管理 {#administration}

クエリ条件キャッシュは、ClickHouseの再起動間で保持されません。

クエリ条件キャッシュをクリアするには、[`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache) を実行します。

キャッシュの内容は、システムテーブル [system.query_condition_cache](system-tables/query_condition_cache.md) に表示されます。
クエリ条件キャッシュの現在のサイズをMB単位で計算するには、`SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache` を実行します。
個別のフィルター条件を調査したい場合は、`system.query_condition_cache` 内のフィールド `condition` を確認できます。
このフィールドは、設定 [query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext) が有効になっている場合にのみ人口されることに注意してください。

データベース起動以降のクエリ条件キャッシュのヒット数とミス数は、システムテーブル [system.events](system-tables/events.md) におけるイベント "QueryConditionCacheHits" と "QueryConditionCacheMisses" として表示されます。
両方のカウンターは、設定 `use_query_condition_cache = true` で実行された `SELECT` クエリのみで更新され、他のクエリは "QueryCacheMisses" に影響を与えません。

## 関連コンテンツ {#related-content}

- ブログ: [クエリ条件キャッシュの紹介](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [プディケートキャッシング: クエリ駆動型の二次インデックス作成をクラウドデータウェアハウスで（Schmidt et. al., 2024）](https://doi.org/10.1145/3626246.3653395)
