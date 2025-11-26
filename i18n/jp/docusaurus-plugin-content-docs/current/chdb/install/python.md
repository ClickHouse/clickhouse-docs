---
title: 'Python 向け chDB のインストール'
sidebar_label: 'Python'
slug: /chdb/install/python
description: 'Python 向け chDB のインストール方法'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
doc_type: 'guide'
---

## 要件 {#requirements}

- Python 3.8 以降
- サポート対象のプラットフォーム: macOS および Linux（x86_64 と ARM64）

## インストール

```bash
pip install chdb
```


## 使用方法 {#usage} 

### コマンドラインインターフェイス

コマンドラインから直接 SQL クエリを実行できます：

```bash
# 基本的なクエリ
python3 -m chdb "SELECT 1, 'abc'" Pretty

# フォーマットを指定したクエリ
python3 -m chdb "SELECT version()" JSON
```


### 基本的な Python の使い方

```python
import chdb

# シンプルなクエリ
result = chdb.query("SELECT 1 as id, 'Hello World' as message", "CSV")
print(result)

# クエリ統計を取得
print(f"読み取り行数: {result.rows_read()}")
print(f"読み取りバイト数: {result.bytes_read()}")
print(f"実行時間: {result.elapsed()} 秒")
```


### 接続ベースの API（推奨）

リソース管理とパフォーマンスを改善するには、次の方法を使用します。

```python
import chdb

# 接続を作成（デフォルトはインメモリ）
conn = chdb.connect(":memory:")
# またはファイルベースを使用: conn = chdb.connect("mydata.db")

# クエリ実行用のカーソルを作成
cur = conn.cursor()

# クエリを実行
cur.execute("SELECT number, toString(number) as str FROM system.numbers LIMIT 3")

# 様々な方法で結果を取得
print(cur.fetchone())    # 単一行: (0, '0')
print(cur.fetchmany(2))  # 複数行: ((1, '1'), (2, '2'))

# メタデータを取得
print(cur.column_names())  # ['number', 'str']
print(cur.column_types())  # ['UInt64', 'String']

# カーソルをイテレータとして使用
for row in cur:
    print(row)

# 必ずリソースをクローズ
cur.close()
conn.close()
```


## データの入力方法 {#data-input}

### ファイルベースのデータソース

chDB は、ファイルを直接クエリできるよう、70 種類以上のデータ形式をサポートしています。

```python
import chdb
# データを準備する
# ...

# Parquetファイルにクエリを実行
result = chdb.query("""
    SELECT customer_id, sum(amount) as total
    FROM file('sales.parquet', Parquet) 
    GROUP BY customer_id 
    ORDER BY total DESC 
    LIMIT 10
""", 'JSONEachRow')

# ヘッダー付きCSVにクエリを実行
result = chdb.query("""
    SELECT * FROM file('data.csv', CSVWithNames) 
    WHERE column1 > 100
""", 'DataFrame')

# 複数のファイル形式を扱う
result = chdb.query("""
    SELECT * FROM file('logs*.jsonl', JSONEachRow)
    WHERE timestamp > '2024-01-01'
""", 'Pretty')
```


### 出力フォーマットの例

```python
# 分析用DataFrame
df = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'DataFrame')
print(type(df))  # <class 'pandas.core.frame.DataFrame'>

# 相互運用性のためのArrowテーブル  
arrow_table = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'ArrowTable')
print(type(arrow_table))  # <class 'pyarrow.lib.Table'>

# API用JSON
json_result = chdb.query('SELECT version()', 'JSON')
print(json_result)

# デバッグ用Pretty形式
pretty_result = chdb.query('SELECT * FROM system.numbers LIMIT 3', 'Pretty')
print(pretty_result)
```


### DataFrame の操作 {#dataframe-operations}

#### 従来の DataFrame API

```python
import chdb.dataframe as cdf
import pandas as pd

# 複数のDataFrameを結合する
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})

result_df = cdf.query(
    sql="SELECT * FROM __tbl1__ t1 JOIN __tbl2__ t2 ON t1.a = t2.c",
    tbl1=df1, 
    tbl2=df2
)
print(result_df)

# 結果のDataFrameに対してクエリを実行する
summary = result_df.query('SELECT b, sum(a) FROM __table__ GROUP BY b')
print(summary)
```


#### Python テーブルエンジン（推奨）

```python
import chdb
import pandas as pd
import pyarrow as pa

# Pandas DataFrameを直接クエリする
df = pd.DataFrame({
    "customer_id": [1, 2, 3, 1, 2],
    "product": ["A", "B", "A", "C", "A"],
    "amount": [100, 200, 150, 300, 250],
    "metadata": [
        {'category': 'electronics', 'priority': 'high'},
        {'category': 'books', 'priority': 'low'},
        {'category': 'electronics', 'priority': 'medium'},
        {'category': 'clothing', 'priority': 'high'},
        {'category': 'books', 'priority': 'low'}
    ]
})

# JSONサポートによるDataFrameの直接クエリ
result = chdb.query("""
    SELECT 
        customer_id,
        sum(amount) as total_spent,
        toString(metadata.category) as category
    FROM Python(df)
    WHERE toString(metadata.priority) = 'high'
    GROUP BY customer_id, toString(metadata.category)
    ORDER BY total_spent DESC
""").show()

# Arrow Tableをクエリする
arrow_table = pa.table({
    "id": [1, 2, 3, 4],
    "name": ["Alice", "Bob", "Charlie", "David"],
    "score": [98, 89, 86, 95]
})

chdb.query("""
    SELECT name, score
    FROM Python(arrow_table)
    ORDER BY score DESC
""").show()
```


### ステートフル セッション

セッションは複数の操作にわたってクエリの状態を保持し、複雑なワークフローを可能にします。

```python
from chdb import session

# 一時セッション(自動クリーンアップ)
sess = session.Session()

# または特定のパスを指定した永続セッション
# sess = session.Session("/path/to/data")

# データベースとテーブルを作成
sess.query("CREATE DATABASE IF NOT EXISTS analytics ENGINE = Atomic")
sess.query("USE analytics")

sess.query("""
    CREATE TABLE sales (
        id UInt64,
        product String,
        amount Decimal(10,2),
        sale_date Date
    ) ENGINE = MergeTree() 
    ORDER BY (sale_date, id)
""")

# データを挿入
sess.query("""
    INSERT INTO sales VALUES 
        (1, 'Laptop', 999.99, '2024-01-15'),
        (2, 'Mouse', 29.99, '2024-01-16'),
        (3, 'Keyboard', 79.99, '2024-01-17')
""")

# マテリアライズドビューを作成
sess.query("""
    CREATE MATERIALIZED VIEW daily_sales AS
    SELECT 
        sale_date,
        count() as orders,
        sum(amount) as revenue
    FROM sales 
    GROUP BY sale_date
""")

# ビューをクエリ
result = sess.query("SELECT * FROM daily_sales ORDER BY sale_date", "Pretty")
print(result)

# セッションはリソースを自動管理
sess.close()  # オプション - オブジェクト削除時に自動クローズ
```


### 高度なセッション機能

```python
# カスタム設定を使用したセッション
sess = session.Session(
    path="/tmp/analytics_db",
)

# クエリパフォーマンスの最適化
result = sess.query("""
    SELECT product, sum(amount) as total
    FROM sales 
    GROUP BY product
    ORDER BY total DESC
    SETTINGS max_threads = 4
""", "JSON")
```

こちらも参照してください: [test&#95;stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py)


### Python DB-API 2.0 インターフェイス

既存の Python アプリケーションとの互換性を確保するための標準的なデータベースインターフェイス。

```python
import chdb.dbapi as dbapi

# ドライバー情報を確認
print(f"chDBドライバーバージョン: {dbapi.get_client_info()}")

# 接続を作成
conn = dbapi.connect()
cursor = conn.cursor()

# パラメータ付きクエリを実行
cursor.execute("""
    SELECT number, number * ? as doubled 
    FROM system.numbers 
    LIMIT ?
""", (2, 5))

# メタデータを取得
print("カラムの説明:", cursor.description)
print("行数:", cursor.rowcount)

# 結果を取得
print("最初の行:", cursor.fetchone())
print("次の2行:", cursor.fetchmany(2))

# 残りの行を取得
for row in cursor.fetchall():
    print("行:", row)

# バッチ操作
data = [(1, 'Alice'), (2, 'Bob'), (3, 'Charlie')]
cursor.execute("""
    CREATE TABLE temp_users (
        id UInt64,
        name String
    ) ENGINE = MergeTree()
    ORDER BY (id)
""")
cursor.executemany(
    "INSERT INTO temp_users (id, name) VALUES (?, ?)", 
    data
)
```


### ユーザー定義関数 (UDF) {#user-defined-functions}

カスタム Python 関数で SQL を拡張できます。

#### 基本的な UDF の使い方

```python
from chdb.udf import chdb_udf
from chdb import query

# シンプルな数値演算関数
@chdb_udf()
def add_numbers(a, b):
    return int(a) + int(b)

# 文字列処理関数
@chdb_udf()
def reverse_string(text):
    return text[::-1]

# JSON処理関数  
@chdb_udf()
def extract_json_field(json_str, field):
    import json
    try:
        data = json.loads(json_str)
        return str(data.get(field, ''))
    except:
        return ''

# クエリでUDFを使用する
result = query("""
    SELECT 
        add_numbers('10', '20') as sum_result,
        reverse_string('hello') as reversed,
        extract_json_field('{"name": "John", "age": 30}', 'name') as name
""")
print(result)
```


#### カスタムの戻り値型を持つ高度な UDF

```python
# 戻り値の型を指定したUDF
@chdb_udf(return_type="Float64")
def calculate_bmi(height_str, weight_str):
    height = float(height_str) / 100  # cmをメートルに変換
    weight = float(weight_str)
    return weight / (height * height)

# データ検証用UDF
@chdb_udf(return_type="UInt8") 
def is_valid_email(email):
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return 1 if re.match(pattern, email) else 0

# 複雑なクエリでの使用例
result = query("""
    SELECT 
        name,
        calculate_bmi(height, weight) as bmi,
        is_valid_email(email) as has_valid_email
    FROM (
        SELECT 
            'John' as name, '180' as height, '75' as weight, 'john@example.com' as email
        UNION ALL
        SELECT 
            'Jane' as name, '165' as height, '60' as weight, 'invalid-email' as email
    )
""", "Pretty")
print(result)
```


#### UDF のベストプラクティス

1. **ステートレス関数**: UDF は副作用のない純粋関数であることが望ましいです
2. **関数内でのインポート**: 必要なモジュールはすべて UDF 内でインポートする必要があります
3. **文字列の入出力**: すべての UDF パラメータは文字列（TabSeparated 形式）です
4. **エラー処理**: 堅牢な UDF にするために、try-catch ブロックを組み込んでください
5. **パフォーマンス**: UDF は各行ごとに呼び出されるため、パフォーマンスを最適化してください

```python
# エラー処理を実装した適切に構造化されたUDF
@chdb_udf(return_type="String")
def safe_json_extract(json_str, path):
    import json
    try:
        data = json.loads(json_str)
        keys = path.split('.')
        result = data
        for key in keys:
            if isinstance(result, dict) and key in result:
                result = result[key]
            else:
                return 'null'
        return str(result)
    except Exception as e:
        return f'error: {str(e)}'

# 複雑にネストされたJSONでの使用
query("""
    SELECT safe_json_extract(
        '{"user": {"profile": {"name": "Alice", "age": 25}}}',
        'user.profile.name'
    ) as extracted_name
""")
```


### ストリーミングクエリ処理

一定のメモリ使用量で大規模データセットを処理できます：

```python
from chdb import session

sess = session.Session()

# 大規模データセットのセットアップ
sess.query("""
    CREATE TABLE large_data ENGINE = Memory() AS 
    SELECT number as id, toString(number) as data 
    FROM numbers(1000000)
""")

# 例1: コンテキストマネージャーを使用した基本的なストリーミング
total_rows = 0
with sess.send_query("SELECT * FROM large_data", "CSV") as stream:
    for chunk in stream:
        chunk_rows = len(chunk.data().split('\n')) - 1
        total_rows += chunk_rows
        print(f"チャンクを処理しました: {chunk_rows} 行")
        
        # 必要に応じて早期終了
        if total_rows > 100000:
            break

print(f"処理された総行数: {total_rows}")

# 例2: 明示的なクリーンアップを伴う手動イテレーション
stream = sess.send_query("SELECT * FROM large_data WHERE id % 100 = 0", "JSONEachRow")
processed_count = 0

while True:
    chunk = stream.fetch()
    if chunk is None:
        break
    
    # チャンクデータを処理
    lines = chunk.data().strip().split('\n')
    for line in lines:
        if line:  # 空行をスキップ
            processed_count += 1
    
    print(f"これまでに {processed_count} 件のレコードを処理しました...")
    
stream.close()  # 重要: 明示的なクリーンアップ

# 例3: 外部ライブラリとのArrow統合
import pyarrow as pa
from deltalake import write_deltalake

# Arrow形式で結果をストリーミング
stream = sess.send_query("SELECT * FROM large_data LIMIT 100000", "Arrow")

# カスタムバッチサイズでRecordBatchReaderを作成
batch_reader = stream.record_batch(rows_per_batch=10000)

# Delta Lakeへエクスポート
write_deltalake(
    table_or_uri="./my_delta_table",
    data=batch_reader,
    mode="overwrite"
)

stream.close()
sess.close()
```


### Python テーブルエンジン {#python-table-engine}

#### Pandas DataFrame をクエリする

```python
import chdb
import pandas as pd

# ネストされたデータを含む複雑なDataFrame
df = pd.DataFrame({
    "customer_id": [1, 2, 3, 4, 5, 6],
    "customer_name": ["Alice", "Bob", "Charlie", "Alice", "Bob", "David"],
    "orders": [
        {"order_id": 101, "amount": 250.50, "items": ["laptop", "mouse"]},
        {"order_id": 102, "amount": 89.99, "items": ["book"]},
        {"order_id": 103, "amount": 1299.99, "items": ["phone", "case", "charger"]},
        {"order_id": 104, "amount": 45.50, "items": ["pen", "paper"]},
        {"order_id": 105, "amount": 199.99, "items": ["headphones"]},
        {"order_id": 106, "amount": 15.99, "items": ["cable"]}
    ]
})

# JSON操作による高度なクエリ
result = chdb.query("""
    SELECT 
        customer_name,
        count() as order_count,
        sum(toFloat64(orders.amount)) as total_spent,
        arrayStringConcat(
            arrayDistinct(
                arrayFlatten(
                    groupArray(orders.items)
                )
            ), 
            ', '
        ) as all_items
    FROM Python(df)
    GROUP BY customer_name
    HAVING total_spent > 100
    ORDER BY total_spent DESC
""").show()

# DataFrameに対するウィンドウ関数
window_result = chdb.query("""
    SELECT 
        customer_name,
        toFloat64(orders.amount) as amount,
        sum(toFloat64(orders.amount)) OVER (
            PARTITION BY customer_name 
            ORDER BY toInt32(orders.order_id)
        ) as running_total
    FROM Python(df)
    ORDER BY customer_name, toInt32(orders.order_id)
""", "Pretty")
print(window_result)
```


#### PyReader を使用したカスタムデータソース

独自のデータソース向けにカスタムデータリーダーを実装します。

````python
import chdb
from typing import List, Tuple, Any
import json

class DatabaseReader(chdb.PyReader):
    """データベース型データソース用のカスタムリーダー"""
    
    def __init__(self, connection_string: str):
        # データベース接続をシミュレート
        self.data = self._load_data(connection_string)
        self.cursor = 0
        self.batch_size = 1000
        super().__init__(self.data)
    
    def _load_data(self, conn_str):
        # データベースからの読み込みをシミュレート
        return {
            "id": list(range(1, 10001)),
            "name": [f"user_{i}" for i in range(1, 10001)],
            "score": [i * 10 + (i % 7) for i in range(1, 10001)],
            "metadata": [
                json.dumps({"level": i % 5, "active": i % 3 == 0})
                for i in range(1, 10001)
            ]
        }
    
    def get_schema(self) -> List[Tuple[str, str]]:
        """明示的な型でテーブルスキーマを定義"""
        return [
            ("id", "UInt64"),
            ("name", "String"),
            ("score", "Int64"),
            ("metadata", "String")  # JSONは文字列として格納
        ]
    
    def read(self, col_names: List[str], count: int) -> List[List[Any]]:
        """データをバッチで読み込み"""
        if self.cursor >= len(self.data["id"]):
            return []  # これ以上データなし
        
        end_pos = min(self.cursor + min(count, self.batch_size), len(self.data["id"]))
        
        # 要求された列のデータを返す
        result = []
        for col in col_names:
            if col in self.data:
                result.append(self.data[col][self.cursor:end_pos])
            else:
                # 欠落している列を処理
                result.append([None] * (end_pos - self.cursor))
        
        self.cursor = end_pos
        return result

### JSON型推論と処理

chDBは複雑なネスト構造のデータを自動的に処理します:

```python
import pandas as pd
import chdb

# 混在したJSONオブジェクトを含むDataFrame
df_with_json = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "profile": [
        {"name": "Alice", "age": 25, "preferences": ["music", "travel"]},
        {"name": "Bob", "age": 30, "location": {"city": "NYC", "country": "US"}},
        {"name": "Charlie", "skills": ["python", "sql", "ml"], "experience": 5},
        {"score": 95, "rank": "gold", "achievements": [{"title": "Expert", "date": "2024-01-01"}]}
    ]
})

# 設定でJSON推論を制御
result = chdb.query("""
    SELECT 
        user_id,
        profile.name as name,
        profile.age as age,
        length(profile.preferences) as pref_count,
        profile.location.city as city
    FROM Python(df_with_json)
    SETTINGS pandas_analyze_sample = 1000  -- JSON検出のため全行を解析
""", "Pretty")
print(result)

# 高度なJSON操作
complex_json = chdb.query("""
    SELECT 
        user_id,
        JSONLength(toString(profile)) as json_fields,
        JSONType(toString(profile), 'preferences') as pref_type,
        if(
            JSONHas(toString(profile), 'achievements'),
            JSONExtractString(toString(profile), 'achievements[0].title'),
            'None'
        ) as first_achievement
    FROM Python(df_with_json)
""", "JSONEachRow")
print(complex_json)
````


## パフォーマンスと最適化 {#performance-optimization}

### ベンチマーク {#benchmarks}

chDB は他の組み込みエンジンと比べて一貫して高い性能を発揮します。

- **DataFrame 操作**: 分析クエリにおいて、従来の DataFrame ライブラリより 2～5 倍高速
- **Parquet 処理**: 主要なカラムナ型エンジンと同等の性能
- **メモリ効率**: 代替手段よりもメモリ使用量が少ない

[ベンチマーク結果の詳細](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### パフォーマンス向上のヒント

```python
import chdb

# 1. 適切な出力形式を使用
df_result = chdb.query("SELECT * FROM large_table", "DataFrame")  # 分析用
arrow_result = chdb.query("SELECT * FROM large_table", "Arrow")    # 相互運用用
native_result = chdb.query("SELECT * FROM large_table", "Native")   # chDB間通信用

# 2. 設定によるクエリの最適化
fast_result = chdb.query("""
    SELECT customer_id, sum(amount) 
    FROM sales 
    GROUP BY customer_id
    SETTINGS 
        max_threads = 8,
        max_memory_usage = '4G',
        use_uncompressed_cache = 1
""", "DataFrame")

# 3. 大規模データセットに対するストリーミングの活用
from chdb import session

sess = session.Session()

# 大規模データセットのセットアップ
sess.query("""
    CREATE TABLE large_sales ENGINE = Memory() AS 
    SELECT 
        number as sale_id,
        number % 1000 as customer_id,
        rand() % 1000 as amount
    FROM numbers(10000000)
""")

# 一定のメモリ使用量でのストリーム処理
total_amount = 0
processed_rows = 0

with sess.send_query("SELECT customer_id, sum(amount) as total FROM large_sales GROUP BY customer_id", "JSONEachRow") as stream:
    for chunk in stream:
        lines = chunk.data().strip().split('\n')
        for line in lines:
            if line:  # 空行をスキップ
                import json
                row = json.loads(line)
                total_amount += row['total']
                processed_rows += 1
        
        print(f"Processed {processed_rows} customer records, running total: {total_amount}")
        
        # デモ用の早期終了
        if processed_rows > 1000:
            break

print(f"Final result: {processed_rows} customers processed, total amount: {total_amount}")

# 外部システムへのストリーミング（例：Delta Lake）
stream = sess.send_query("SELECT * FROM large_sales LIMIT 1000000", "Arrow")
batch_reader = stream.record_batch(rows_per_batch=50000)

# バッチ処理
for batch in batch_reader:
    print(f"Processing batch with {batch.num_rows} rows...")
    # 各バッチの変換またはエクスポート
    # df_batch = batch.to_pandas()
    # process_batch(df_batch)

stream.close()
sess.close()
```


## GitHub リポジトリ {#github-repository}

- **メインリポジトリ**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **Issue とサポート**: [GitHub リポジトリ](https://github.com/chdb-io/chdb/issues)で Issue を報告してください