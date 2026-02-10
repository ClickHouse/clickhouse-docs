---
title: 'chDB で Apache Arrow をクエリする方法'
sidebar_label: 'Apache Arrow のクエリ'
slug: /chdb/guides/apache-arrow
description: 'このガイドでは、chDB を使って Apache Arrow テーブルをクエリする方法を説明します'
keywords: ['chdb', 'Apache Arrow']
doc_type: 'guide'
---

[Apache Arrow](https://arrow.apache.org/) は、データコミュニティで広く利用されている標準化されたカラム指向のメモリフォーマットです。
このガイドでは、`Python` テーブル関数を使用して Apache Arrow をクエリする方法を学びます。

## セットアップ \{#setup\}

まずは仮想環境を作成します：

```bash
python -m venv .venv
source .venv/bin/activate
```

次に、chDB をインストールします。
バージョン 2.0.2 以上であることを確認してください。

```bash
pip install "chdb>=2.0.2"
```

それでは、PyArrow、pandas、および IPython をインストールします。

```bash
pip install pyarrow pandas ipython
```

このガイドの残りのコマンドは `ipython` を使って実行します。次のコマンドを実行して起動してください：

```bash
ipython
```

このコードは、Python スクリプトやお好みのノートブック環境でも使用できます。

## ファイルから Apache Arrow テーブルを作成する \{#creating-an-apache-arrow-table-from-a-file\}

まず、[Ookla データセット](https://github.com/teamookla/ookla-open-data)の Parquet ファイルの一つを、[AWS CLI ツール](https://aws.amazon.com/cli/)を使ってダウンロードします。

```bash
aws s3 cp \
  --no-sign \
  s3://ookla-open-data/parquet/performance/type=mobile/year=2023/quarter=2/2023-04-01_performance_mobile_tiles.parquet .
```

:::note
より多くのファイルをダウンロードしたい場合は、`aws s3 ls` を使用してすべてのファイルの一覧を表示し、それに合わせて上記のコマンドを更新してください。
:::

次に、`pyarrow` パッケージから Parquet モジュールをインポートします。

```python
import pyarrow.parquet as pq
```

次に、Parquet ファイルを Apache Arrow のテーブルとして読み込みます:

```python
arrow_table = pq.read_table("./2023-04-01_performance_mobile_tiles.parquet")
```

スキーマは次のとおりです。

```python
arrow_table.schema
```

```text
quadkey: string
tile: string
tile_x: double
tile_y: double
avg_d_kbps: int64
avg_u_kbps: int64
avg_lat_ms: int64
avg_lat_down_ms: int32
avg_lat_up_ms: int32
tests: int64
devices: int64
```

`shape` 属性から行数と列数を取得できます。

```python
arrow_table.shape
```

```text
(3864546, 11)
```

## Apache Arrow をクエリする \{#querying-apache-arrow\}

ここでは、chDB から Apache Arrow テーブルをクエリしてみましょう。
まず、chDB をインポートします。

```python
import chdb
```

次に、テーブルの構造を確認します。

```python
chdb.query("""
DESCRIBE Python(arrow_table)
SETTINGS describe_compact_output=1
""", "DataFrame")
```

```text
               name     type
0           quadkey   String
1              tile   String
2            tile_x  Float64
3            tile_y  Float64
4        avg_d_kbps    Int64
5        avg_u_kbps    Int64
6        avg_lat_ms    Int64
7   avg_lat_down_ms    Int32
8     avg_lat_up_ms    Int32
9             tests    Int64
10          devices    Int64
```

行数も取得できます。

```python
chdb.query("SELECT count() FROM Python(arrow_table)", "DataFrame")
```

```text
   count()
0  3864546
```

では、もう少し興味深いことをしてみましょう。
次のクエリは `quadkey` と `tile.*` カラムを除外したうえで、残りのすべてのカラムについて平均値と最大値を計算します。

```python
chdb.query("""
WITH numericColumns AS (
  SELECT * EXCEPT ('tile.*') EXCEPT(quadkey)
  FROM Python(arrow_table)
)
SELECT * APPLY(max), * APPLY(avg) APPLY(x -> round(x, 2))
FROM numericColumns
""", "Vertical")
```

```text
Row 1:
──────
max(avg_d_kbps):                4155282
max(avg_u_kbps):                1036628
max(avg_lat_ms):                2911
max(avg_lat_down_ms):           2146959360
max(avg_lat_up_ms):             2146959360
max(tests):                     111266
max(devices):                   1226
round(avg(avg_d_kbps), 2):      84393.52
round(avg(avg_u_kbps), 2):      15540.4
round(avg(avg_lat_ms), 2):      41.25
round(avg(avg_lat_down_ms), 2): 554355225.76
round(avg(avg_lat_up_ms), 2):   552843178.3
round(avg(tests), 2):           6.31
round(avg(devices), 2):         2.88
```
