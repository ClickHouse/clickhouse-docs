---
'description': 'ClickHouseにおけるクエリ条件キャッシュ機能の使用および設定に関するガイド'
'sidebar_label': 'クエリ条件キャッシュ'
'sidebar_position': 64
'slug': '/operations/query-condition-cache'
'title': 'クエリ条件キャッシュ'
'doc_type': 'guide'
---


# クエリ条件キャッシュ

:::note
クエリ条件キャッシュは、[enable_analyzer](https://clickhouse.com/docs/operations/settings/settings#enable_analyzer)がtrueに設定されているときのみ機能します。これはデフォルト値です。
:::

多くの実際のワークロードは、同じまたはほぼ同じデータに対する繰り返しクエリを含みます（例えば、以前のデータに新しいデータを追加したもの）。
ClickHouseは、そのようなクエリパターンに最適化するためのさまざまな最適化技術を提供します。
1つの可能性は、インデックス構造（例：主キーインデックス、スキッピングインデックス、プロジェクション）を使用して物理データレイアウトを調整したり、プレ計算（マテリアライズドビュー）を使用することです。
もう1つの可能性は、ClickHouseの[クエリキャッシュ](query-cache.md)を使用して、繰り返しクエリ評価を避けることです。
最初のアプローチの欠点は、データベース管理者による手動の介入と監視が必要であることです。
2番目のアプローチは、古い結果が返される可能性があります（クエリキャッシュはトランザクション的に一貫性がありません）。これは使用ケースによって受け入れ可能かどうかが異なります。

クエリ条件キャッシュは、両方の問題に対する優れた解決策を提供します。
これは、同じデータに対するフィルター条件（例：`WHERE col = 'xyz'`）を評価すると、常に同じ結果が返されるという考えに基づいています。
具体的には、クエリ条件キャッシュは、評価されたフィルターと各グラニュール（デフォルトでは8192行のブロック）ごとに、グラニュール内にフィルター条件を満たす行がない場合の情報を記憶します。
この情報は単一のビットとして記録されます：0ビットは行がフィルターと一致しないことを示し、1ビットは少なくとも1つの一致する行が存在することを意味します。
前者の場合、ClickHouseはフィルター評価中に対応するグラニュールをスキップでき、後者の場合、グラニュールはロードされて評価されなければなりません。

クエリ条件キャッシュが効果的であるためには、3つの前提条件が満たされる必要があります：
- まず、ワークロードは同じフィルター条件を繰り返し評価する必要があります。これはクエリが複数回繰り返された場合に自然に発生しますが、2つのクエリが同じフィルターを共有する場合にも発生する可能性があります。例えば、`SELECT product FROM products WHERE quality > 3`と`SELECT vendor, count() FROM products WHERE quality > 3`。
- 次に、データの大部分は不変である必要があります。つまり、クエリ間で変わらないことです。これは、パーツが不変で、INSERTによってのみ作成されるため、一般的にClickHouseに当てはまります。
- 最後に、フィルターは選択的である必要があります。すなわち、フィルター条件を満たす行は比較的少ないことです。フィルター条件に一致する行が少ないほど、ビット0（一致する行なし）で記録されるグラニュールが増え、後続のフィルター評価から「プルーニング」できるデータが増えます。

## メモリ消費 {#memory-consumption}

クエリ条件キャッシュは、各フィルター条件とグラニュールごとに単一のビットしか保存しないため、消費するメモリはわずかです。
クエリ条件キャッシュの最大サイズは、サーバー設定[`query_condition_cache_size`](server-configuration-parameters/settings.md#query_condition_cache_size)を使用して構成できます（デフォルト：100 MB）。
100 MBのキャッシュサイズは、100 * 1024 * 1024 * 8 = 838,860,800エントリに相当します。
各エントリはマーク（デフォルトで8192行）を表すため、このキャッシュは単一のカラムに最大6,871,947,673,600（6.8兆）行をカバーできます。
実際には、フィルターは複数のカラムで評価されるため、その数はフィルターされたカラムの数で割る必要があります。

## 構成設定と使用法 {#configuration-settings-and-usage}

[use_query_condition_cache](settings/settings#use_query_condition_cache)を設定することで、特定のクエリまたは現在のセッションのすべてのクエリがクエリ条件キャッシュを利用するかどうかを制御します。

たとえば、クエリの最初の実行で、

```sql
SELECT col1, col2
FROM table
WHERE col1 = 'x'
SETTINGS use_query_condition_cache = true;
```

は、述語を満たさないテーブルの範囲をストアします。
次の同じクエリの実行も、`use_query_condition_cache = true`パラメータを使用すると、クエリ条件キャッシュを利用してより少ないデータをスキャンします。

## 管理 {#administration}

クエリ条件キャッシュは、ClickHouseの再起動間で保持されません。

クエリ条件キャッシュをクリアするには、[`SYSTEM DROP QUERY CONDITION CACHE`](../sql-reference/statements/system.md#drop-query-condition-cache)を実行します。

キャッシュの内容はシステムテーブル[system.query_condition_cache](system-tables/query_condition_cache.md)に表示されます。
クエリ条件キャッシュの現在のサイズをMBで計算するには、`SELECT formatReadableSize(sum(entry_size)) FROM system.query_condition_cache`を実行します。
個々のフィルター条件を調査したい場合は、`system.query_condition_cache`の`condition`フィールドを確認できます。
このフィールドは、設定[query_condition_cache_store_conditions_as_plaintext](settings/settings#query_condition_cache_store_conditions_as_plaintext)が有効な場合のみ入力されることに注意してください。

データベースの起動以来のクエリ条件キャッシュのヒット数とミス数は、システムテーブル[system.events](system-tables/events.md)のイベント「QueryConditionCacheHits」と「QueryConditionCacheMisses」として表示されます。
両方のカウンターは、設定`use_query_condition_cache = true`で実行される`SELECT`クエリに対してのみ更新され、その他のクエリは「QueryCacheMisses」に影響しません。

## 関連コンテンツ {#related-content}

- ブログ: [クエリ条件キャッシュの紹介](https://clickhouse.com/blog/introducing-the-clickhouse-query-condition-cache)
- [Predicate Caching: Query-Driven Secondary Indexing for Cloud Data Warehouses (Schmidt et. al., 2024)](https://doi.org/10.1145/3626246.3653395)
