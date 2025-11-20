---
slug: /guides/developer/dynamic-column-selection
sidebar_label: 'Dynamic column selection'
title: '動的なカラム選択'
description: 'ClickHouse で代替的なクエリ記述方法を使用する'
doc_type: 'guide'
keywords: ['dynamic column selection', 'regular expressions', 'APPLY modifier', 'advanced queries', 'developer guide']
---

[動的なカラム選択](/docs/sql-reference/statements/select#dynamic-column-selection)は、各カラムを個別に名前指定するのではなく、正規表現を使ってカラムを選択できる、強力でありながらあまり活用されていない ClickHouse の機能です。`APPLY` 修飾子を使って、一致したカラムに関数を適用することもできるため、データ分析や変換タスクに非常に有用です。

ここでは、この機能の使い方を、[New York taxis データセット](/docs/getting-started/example-datasets/nyc-taxi)を題材に学びます。このデータセットは [ClickHouse SQL playground](https://sql.clickhouse.com?query=LS0gRGF0YXNldCBjb250YWluaW5nIHRheGkgcmlkZSBkYXRhIGluIE5ZQyBmcm9tIDIwMDkuIE1vcmUgaW5mbyBoZXJlOiBodHRwczovL2NsaWNraG91c2UuY29tL2RvY3MvZW4vZ2V0dGluZy1zdGFydGVkL2V4YW1wbGUtZGF0YXNldHMvbnljLXRheGkKU0VMRUNUICogRlJPTSBueWNfdGF4aS50cmlwcyBMSU1JVCAxMDA) でも参照できます。

<iframe width="768" height="432" src="https://www.youtube.com/embed/moabRqqHNo4?si=jgmInV-u3UxtLvMS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>



## パターンに一致するカラムの選択 {#selecting-columns}

よくあるシナリオから始めましょう。NYCタクシーデータセットから`_amount`を含むカラムのみを選択します。各カラム名を手動で入力する代わりに、正規表現と`COLUMNS`式を使用できます。

```sql
FROM nyc_taxi.trips
SELECT COLUMNS('.*_amount')
LIMIT 10;
```

> [SQLプレイグラウンドでこのクエリを試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudCcpCkZST00gbnljX3RheGkudHJpcHMKTElNSVQgMTA7&run_query=true)

このクエリは最初の10行を返しますが、パターン`.*_amount`(任意の文字の後に"\_amount"が続く)に一致する名前のカラムのみが対象となります。

```text
    ┌─fare_amount─┬─tip_amount─┬─tolls_amount─┬─total_amount─┐
 1. │           9 │          0 │            0 │          9.8 │
 2. │           9 │          0 │            0 │          9.8 │
 3. │         3.5 │          0 │            0 │          4.8 │
 4. │         3.5 │          0 │            0 │          4.8 │
 5. │         3.5 │          0 │            0 │          4.3 │
 6. │         3.5 │          0 │            0 │          4.3 │
 7. │         2.5 │          0 │            0 │          3.8 │
 8. │         2.5 │          0 │            0 │          3.8 │
 9. │           5 │          0 │            0 │          5.8 │
10. │           5 │          0 │            0 │          5.8 │
    └─────────────┴────────────┴──────────────┴──────────────┘
```

次に、`fee`または`tax`という用語を含むカラムも返したいとします。
これらを含めるように正規表現を更新できます。

```sql
SELECT COLUMNS('.*_amount|fee|tax')
FROM nyc_taxi.trips
ORDER BY rand()
LIMIT 3;
```

> [SQLプレイグラウンドでこのクエリを試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykKRlJPTSBueWNfdGF4aS50cmlwcwpPUkRFUiBCWSByYW5kKCkgCkxJTUlUIDM7&run_query=true)

```text
   ┌─fare_amount─┬─mta_tax─┬─tip_amount─┬─tolls_amount─┬─ehail_fee─┬─total_amount─┐
1. │           5 │     0.5 │          1 │            0 │         0 │          7.8 │
2. │        12.5 │     0.5 │          0 │            0 │         0 │         13.8 │
3. │         4.5 │     0.5 │       1.66 │            0 │         0 │         9.96 │
   └─────────────┴─────────┴────────────┴──────────────┴───────────┴──────────────┘
```


## 複数のパターンを選択する {#selecting-multiple-patterns}

1つのクエリで複数のカラムパターンを組み合わせることができます:

```sql
SELECT
    COLUMNS('.*_amount'),
    COLUMNS('.*_date.*')
FROM nyc_taxi.trips
LIMIT 5;
```

> [SQLプレイグラウンドでこのクエリを試す](https://sql.clickhouse.com?query=U0VMRUNUIAogICAgQ09MVU1OUygnLipfYW1vdW50JyksCiAgICBDT0xVTU5TKCcuKl9kYXRlLionKQpGUk9NIG55Y190YXhpLnRyaXBzCkxJTUlUIDU7&run_query=true)

```text
   ┌─fare_amount─┬─tip_amount─┬─tolls_amount─┬─total_amount─┬─pickup_date─┬─────pickup_datetime─┬─dropoff_date─┬────dropoff_datetime─┐
1. │           9 │          0 │            0 │          9.8 │  2001-01-01 │ 2001-01-01 00:01:48 │   2001-01-01 │ 2001-01-01 00:15:47 │
2. │           9 │          0 │            0 │          9.8 │  2001-01-01 │ 2001-01-01 00:01:48 │   2001-01-01 │ 2001-01-01 00:15:47 │
3. │         3.5 │          0 │            0 │          4.8 │  2001-01-01 │ 2001-01-01 00:02:08 │   2001-01-01 │ 2001-01-01 01:00:02 │
4. │         3.5 │          0 │            0 │          4.8 │  2001-01-01 │ 2001-01-01 00:02:08 │   2001-01-01 │ 2001-01-01 01:00:02 │
5. │         3.5 │          0 │            0 │          4.3 │  2001-01-01 │ 2001-01-01 00:02:26 │   2001-01-01 │ 2001-01-01 00:04:49 │
   └─────────────┴────────────┴──────────────┴──────────────┴─────────────┴─────────────────────┴──────────────┴─────────────────────┘
```


## すべてのカラムに関数を適用する {#applying-functions}

[`APPLY`](/sql-reference/statements/select)修飾子を使用すると、すべてのカラムに関数を適用できます。
例えば、これらの各カラムの最大値を求めたい場合は、次のクエリを実行します:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(max)
FROM nyc_taxi.trips;
```

> [SQLプレイグラウンドでこのクエリを試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkobWF4KQpGUk9NIG55Y190YXhpLnRyaXBzOw&run_query=true)

```text
   ┌─max(fare_amount)─┬─max(mta_tax)─┬─max(tip_amount)─┬─max(tolls_amount)─┬─max(ehail_fee)─┬─max(total_amount)─┐
1. │           998310 │     500000.5 │       3950588.8 │           7999.92 │           1.95 │         3950611.5 │
   └──────────────────┴──────────────┴─────────────────┴───────────────────┴────────────────┴───────────────────┘
```

または、平均値を確認したい場合は次のようにします:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg)
FROM nyc_taxi.trips
```

> [SQLプレイグラウンドでこのクエリを試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkoYXZnKQpGUk9NIG55Y190YXhpLnRyaXBzOw&run_query=true)

```text
   ┌─avg(fare_amount)─┬───────avg(mta_tax)─┬────avg(tip_amount)─┬──avg(tolls_amount)─┬──────avg(ehail_fee)─┬──avg(total_amount)─┐
1. │ 11.8044154834777 │ 0.4555942672733423 │ 1.3469850969211845 │ 0.2256511991414463 │ 3.37600560437412e-9 │ 14.423323722271563 │
   └──────────────────┴────────────────────┴────────────────────┴────────────────────┴─────────────────────┴────────────────────┘
```

これらの値には小数点以下の桁が多く含まれていますが、関数を連鎖させることで調整できます。この場合、avg関数を適用した後にround関数を適用します:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg) APPLY(round)
FROM nyc_taxi.trips;
```

> [SQLプレイグラウンドでこのクエリを試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkoYXZnKSBBUFBMWShyb3VuZCkKRlJPTSBueWNfdGF4aS50cmlwczs&run_query=true)

```text
   ┌─round(avg(fare_amount))─┬─round(avg(mta_tax))─┬─round(avg(tip_amount))─┬─round(avg(tolls_amount))─┬─round(avg(ehail_fee))─┬─round(avg(total_amount))─┐
1. │                      12 │                   0 │                      1 │                        0 │                     0 │                       14 │
   └─────────────────────────┴─────────────────────┴────────────────────────┴──────────────────────────┴───────────────────────┴──────────────────────────┘
```

ただし、これでは平均値が整数に丸められてしまいます。例えば小数点以下2桁に丸めたい場合も対応できます。`APPLY`修飾子は関数だけでなくラムダ式も受け取ることができるため、round関数で平均値を小数点以下2桁に丸めることが可能です:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg) APPLY(x -> round(x, 2))
FROM nyc_taxi.trips;
```


> [SQL Playground でこのクエリを試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkgYXZnIEFQUExZIHggLT4gcm91bmQoeCwgMikKRlJPTSBueWNfdGF4aS50cmlwcw\&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(mta_tax), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(tolls_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(total_amount), 2)─┐
1. │                       11.8 │                   0.46 │                      1.35 │                        0.23 │                        0 │                       14.42 │
   └────────────────────────────┴────────────────────────┴───────────────────────────┴─────────────────────────────┴──────────────────────────┴─────────────────────────────┘
```


## カラムの置換 {#replacing-columns}

ここまでは順調です。しかし、他の値はそのままにして、特定の値だけを調整したい場合を考えてみましょう。例えば、合計金額を2倍にし、MTA税を1.1で割りたいとします。これは[`REPLACE`](/sql-reference/statements/select)修飾子を使用することで実現できます。この修飾子は、他のカラムはそのままにして、指定したカラムを置換します。

```sql
FROM nyc_taxi.trips
SELECT
  COLUMNS('.*_amount|fee|tax')
  REPLACE(
    total_amount*2 AS total_amount,
    mta_tax/1.1 AS mta_tax
  )
  APPLY(avg)
  APPLY(col -> round(col, 2));
```

> [このクエリをSQLプレイグラウンドで試す](https://sql.clickhouse.com?query=RlJPTSBueWNfdGF4aS50cmlwcyAKU0VMRUNUIAogIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykKICBSRVBMQUNFKAogICAgdG90YWxfYW1vdW50KjIgQVMgdG90YWxfYW1vdW50LAogICAgbXRhX3RheC8xLjEgQVMgbXRhX3RheAogICkgCiAgQVBQTFkoYXZnKQogIEFQUExZKGNvbCAtPiByb3VuZChjb2wsIDIpKTs&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(di⋯, 1.1)), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(tolls_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(mu⋯nt, 2)), 2)─┐
1. │                       11.8 │                     0.41 │                      1.35 │                        0.23 │                        0 │                    28.85 │
   └────────────────────────────┴──────────────────────────┴───────────────────────────┴─────────────────────────────┴──────────────────────────┴──────────────────────────┘
```


## カラムの除外 {#excluding-columns}

[`EXCEPT`](/sql-reference/statements/select)修飾子を使用してフィールドを除外することもできます。例えば、`tolls_amount`カラムを削除する場合は、次のクエリを記述します:

```sql
FROM nyc_taxi.trips
SELECT
  COLUMNS('.*_amount|fee|tax') EXCEPT(tolls_amount)
  REPLACE(
    total_amount*2 AS total_amount,
    mta_tax/1.1 AS mta_tax
  )
  APPLY(avg)
  APPLY(col -> round(col, 2));
```

> [SQLプレイグラウンドでこのクエリを試す](https://sql.clickhouse.com?query=RlJPTSBueWNfdGF4aS50cmlwcyAKU0VMRUNUIAogIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgRVhDRVBUKHRvbGxzX2Ftb3VudCkKICBSRVBMQUNFKAogICAgdG90YWxfYW1vdW50KjIgQVMgdG90YWxfYW1vdW50LAogICAgbXRhX3RheC8xLjEgQVMgbXRhX3RheAogICkgCiAgQVBQTFkoYXZnKQogIEFQUExZKGNvbCAtPiByb3VuZChjb2wsIDIpKTs&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(di⋯, 1.1)), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(mu⋯nt, 2)), 2)─┐
1. │                       11.8 │                     0.41 │                      1.35 │                        0 │                    28.85 │
   └────────────────────────────┴──────────────────────────┴───────────────────────────┴──────────────────────────┴──────────────────────────┘
```
