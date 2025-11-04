---
'slug': '/guides/developer/dynamic-column-selection'
'sidebar_label': '動的カラム選択'
'title': '動的カラム選択'
'description': 'ClickHouseで代替クエリ言語を使用する'
'doc_type': 'guide'
---

[Dynamic column selection](/docs/sql-reference/statements/select#dynamic-column-selection) は強力ですが、あまり活用されていない ClickHouse の機能で、各カラムを個別に名前を付けるのではなく、正規表現を使用してカラムを選択することができます。また、`APPLY` 修飾子を使用して一致するカラムに関数を適用することもでき、データ分析や変換タスクに非常に便利です。

この機能の使い方を、[New York taxis dataset](/docs/getting-started/example-datasets/nyc-taxi) の助けを借りて学びましょう。このデータセットは、[ClickHouse SQL playground](https://sql.clickhouse.com?query=LS0gRGF0YXNldCBjb250YWluaW5nIHRheGkgcmlkZSBkYXRhIGluIE5ZQyBmcm9tIDIwMDkuIE1vcmUgaW5mbyBoZXJlOiBodHRwczovL2NsaWNraG91c2UuY29tL2RvY3MvZW4vZ2V0dGluZy1zdGFydGVkL2V4YW1wbGUtZGF0YXNldHMvbnljLXRheGkKU0VMRUNUICogRlJPTSBueWNfdGF4aS50cmlwcyBMSU1JVCAxMDA) にもあります。

<iframe width="768" height="432" src="https://www.youtube.com/embed/moabRqqHNo4?si=jgmInV-u3UxtLvMS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## パターンに一致するカラムの選択  {#selecting-columns}

一般的なシナリオから始めましょう: NYC タクシーデータセットから `_amount` を含むカラムだけを選択します。各カラム名を手動で入力する代わりに、正規表現を使用した `COLUMNS` 表現を使用できます:

```sql
FROM nyc_taxi.trips
SELECT COLUMNS('.*_amount')
LIMIT 10;
```

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudCcpCkZST00gbnljX3RheGkudHJpcHMKTElNSVQgMTA7&run_query=true)

このクエリは、最初の 10 行を返しますが、カラム名が `.*_amount` というパターンに一致するカラムのみに対してです（"_amount" の前に任意の文字）。 

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

次に `fee` や `tax` という用語を含むカラムを返したいとしましょう。正規表現を更新してそれを含めることができます:

```sql
SELECT COLUMNS('.*_amount|fee|tax')
FROM nyc_taxi.trips
ORDER BY rand() 
LIMIT 3;
```

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykKRlJPTSBueWNfdGF4aS50cmlwcwpPUkRFUiBCWSByYW5kKCkgCkxJTUlUIDM7&run_query=true)

```text
   ┌─fare_amount─┬─mta_tax─┬─tip_amount─┬─tolls_amount─┬─ehail_fee─┬─total_amount─┐
1. │           5 │     0.5 │          1 │            0 │         0 │          7.8 │
2. │        12.5 │     0.5 │          0 │            0 │         0 │         13.8 │
3. │         4.5 │     0.5 │       1.66 │            0 │         0 │         9.96 │
   └─────────────┴─────────┴────────────┴──────────────┴───────────┴──────────────┘
```

## 複数のパターンを選択  {#selecting-multiple-patterns}

単一のクエリ内で複数のカラムパターンを組み合わせることもできます:

```sql
SELECT 
    COLUMNS('.*_amount'),
    COLUMNS('.*_date.*')
FROM nyc_taxi.trips
LIMIT 5;
```

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=U0VMRUNUIAogICAgQ09MVU1OUygnLipfYW1vdW50JyksCiAgICBDT0xVTU5TKCcuKl9kYXRlLionKQpGUk9NIG55Y190YXhpLnRyaXBzCkxJTUlUIDU7&run_query=true)

```text
   ┌─fare_amount─┬─tip_amount─┬─tolls_amount─┬─total_amount─┬─pickup_date─┬─────pickup_datetime─┬─dropoff_date─┬────dropoff_datetime─┐
1. │           9 │          0 │            0 │          9.8 │  2001-01-01 │ 2001-01-01 00:01:48 │   2001-01-01 │ 2001-01-01 00:15:47 │
2. │           9 │          0 │            0 │          9.8 │  2001-01-01 │ 2001-01-01 00:01:48 │   2001-01-01 │ 2001-01-01 00:15:47 │
3. │         3.5 │          0 │            0 │          4.8 │  2001-01-01 │ 2001-01-01 00:02:08 │   2001-01-01 │ 2001-01-01 01:00:02 │
4. │         3.5 │          0 │            0 │          4.8 │  2001-01-01 │ 2001-01-01 00:02:08 │   2001-01-01 │ 2001-01-01 01:00:02 │
5. │         3.5 │          0 │            0 │          4.3 │  2001-01-01 │ 2001-01-01 00:02:26 │   2001-01-01 │ 2001-01-01 00:04:49 │
   └─────────────┴────────────┴──────────────┴──────────────┴─────────────┴─────────────────────┴──────────────┴─────────────────────┘
```

## すべてのカラムに関数を適用  {#applying-functions}

[`APPLY`](/sql-reference/statements/select) 修飾子を使用してすべてのカラムに関数を適用することもできます。例えば、これらのカラムの最大値を見つけたい場合、次のクエリを実行できます:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(max)
FROM nyc_taxi.trips;
```

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkobWF4KQpGUk9NIG55Y190YXhpLnRyaXBzOw&run_query=true)

```text
   ┌─max(fare_amount)─┬─max(mta_tax)─┬─max(tip_amount)─┬─max(tolls_amount)─┬─max(ehail_fee)─┬─max(total_amount)─┐
1. │           998310 │     500000.5 │       3950588.8 │           7999.92 │           1.95 │         3950611.5 │
   └──────────────────┴──────────────┴─────────────────┴───────────────────┴────────────────┴───────────────────┘
```

また、平均を知りたい場合もあります:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg)
FROM nyc_taxi.trips
```

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkoYXZnKQpGUk9NIG55Y190YXhpLnRyaXBzOw&run_query=true)

```text
   ┌─avg(fare_amount)─┬───────avg(mta_tax)─┬────avg(tip_amount)─┬──avg(tolls_amount)─┬──────avg(ehail_fee)─┬──avg(total_amount)─┐
1. │ 11.8044154834777 │ 0.4555942672733423 │ 1.3469850969211845 │ 0.2256511991414463 │ 3.37600560437412e-9 │ 14.423323722271563 │
   └──────────────────┴────────────────────┴────────────────────┴────────────────────┴─────────────────────┴────────────────────┘
```

これらの値は多くの小数点を含んでいますが、幸運にも、関数をチェーンすることで解決できます。この場合、avg関数を適用した後、round関数を適用します:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg) APPLY(round)
FROM nyc_taxi.trips;
```

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkoYXZnKSBBUFBMWShyb3VuZCkKRlJPTSBueWNfdGF4aS50cmlwczs&run_query=true)

```text
   ┌─round(avg(fare_amount))─┬─round(avg(mta_tax))─┬─round(avg(tip_amount))─┬─round(avg(tolls_amount))─┬─round(avg(ehail_fee))─┬─round(avg(total_amount))─┐
1. │                      12 │                   0 │                      1 │                        0 │                     0 │                       14 │
   └─────────────────────────┴─────────────────────┴────────────────────────┴──────────────────────────┴───────────────────────┴──────────────────────────┘
```

ただし、それは平均を整数に丸めることになります。もし、小数点以下2桁に丸めたい場合ももちろん可能です。関数を受け入れるだけでなく、`APPLY` 修飾子はラムダを受け入れます。これにより、round関数を使用して平均値を小数点以下2桁に丸める柔軟性が得られます:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg) APPLY(x -> round(x, 2))
FROM nyc_taxi.trips;
```

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkgYXZnIEFQUExZIHggLT4gcm91bmQoeCwgMikKRlJPTSBueWNfdGF4aS50cmlwcw&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(mta_tax), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(tolls_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(total_amount), 2)─┐
1. │                       11.8 │                   0.46 │                      1.35 │                        0.23 │                        0 │                       14.42 │
   └────────────────────────────┴────────────────────────┴───────────────────────────┴─────────────────────────────┴──────────────────────────┴─────────────────────────────┘
```

## カラムの置換  {#replacing-columns}

ここまで順調です。しかし、他の値はそのままにしておきながら、特定の値を調整したいとしましょう。例えば、合計金額を2倍にし、MTA税を1.1で割りたい場合です。この場合、[`REPLACE`](/sql-reference/statements/select) 修飾子を使用できます。この修飾子はカラムを置き換え、他のカラムはそのままにします。

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

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=RlJPTSBueWNfdGF4aS50cmlwcyAKU0VMRUNUIAogIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykKICBSRVBMQUNFKAogICAgdG90YWxfYW1vdW50KjIgQVMgdG90YWxfYW1vdW50LAogICAgbXRhX3RheC8xLjEgQVMgbXRhX3RheAogICkgCiAgQVBQTFkoYXZnKQogIEFQUExZKGNvbCAtPiByb3VuZChjb2wsIDIpKTs&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(di⋯, 1.1)), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(tolls_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(mu⋯nt, 2)), 2)─┐
1. │                       11.8 │                     0.41 │                      1.35 │                        0.23 │                        0 │                    28.85 │
   └────────────────────────────┴──────────────────────────┴───────────────────────────┴─────────────────────────────┴──────────────────────────┴──────────────────────────┘
```

## カラムの除外  {#excluding-columns}

[`EXCEPT`](/sql-reference/statements/select) 修飾子を使用してフィールドを除外することもできます。例えば、`tolls_amount` カラムを削除するには、次のクエリを記述します:

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

> [このクエリを SQL playground で試す](https://sql.clickhouse.com?query=RlJPTSBueWNfdGF4aS50cmlwcyAKU0VMRUNUIAogIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgRVhDRVBUKHRvbGxzX2Ftb3VudCkKICBSRVBMQUNFKAogICAgdG90YWxfYW1vdW50KjIgQVMgdG90YWxfYW1vdW50LAogICAgbXRhX3RheC8xLjEgQVMgbXRhX3RheAogICkgCiAgQVBQTFkoYXZnKQogIEFQUExZKGNvbCAtPiByb3VuZChjb2wsIDIpKTs&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(di⋯, 1.1)), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(mu⋯nt, 2)), 2)─┐
1. │                       11.8 │                     0.41 │                      1.35 │                        0 │                    28.85 │
   └────────────────────────────┴──────────────────────────┴───────────────────────────┴──────────────────────────┴──────────────────────────┘
```
