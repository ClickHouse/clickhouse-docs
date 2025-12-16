---
title: 'Python向けchDBのインストール'
sidebar_label: 'Python'
slug: /chdb/install/python
description: 'Python向けchDBのインストール方法'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
doc_type: 'guide'
---

## 要件 {#requirements}

- Python 3.8以上
- 対応プラットフォーム：macOSおよびLinux（x86_64およびARM64）

## インストール {#install}

```bash
pip install chdb
```

## 使用方法 {#usage}

### コマンドラインインターフェース {#command-line-interface}

コマンドラインから直接SQLクエリを実行できます：

```bash
# 基本的なクエリ
python3 -m chdb "SELECT 1, 'abc'" Pretty

# フォーマット指定付きクエリ
python3 -m chdb "SELECT version()" JSON
```

### 基本的なPythonの使用方法 {#basic-python-usage}

```python
import chdb

# シンプルなクエリ
result = chdb.query("SELECT 1 as id, 'Hello World' as message", "CSV")
print(result)

# クエリ統計の取得
print(f"読み取り行数: {result.rows_read()}")
print(f"読み取りバイト数: {result.bytes_read()}")
print(f"実行時間: {result.elapsed()} 秒")
```

### コネクションベースAPI（推奨） {#connection-based-api}

より良いリソース管理とパフォーマンスのために：

```python
import chdb

# コネクションの作成（デフォルトはインメモリ）
conn = chdb.connect(":memory:")
# またはファイルベース: conn = chdb.connect("mydata.db")

# クエリ実行用のカーソルを作成
cur = conn.cursor()

# クエリの実行
cur.execute("SELECT number, toString(number) as str FROM system.numbers LIMIT 3")

# 様々な方法で結果を取得
print(cur.fetchone())    # 単一行: (0, '0')
print(cur.fetchmany(2))  # 複数行: ((1, '1'), (2, '2'))

# メタデータの取得
print(cur.column_names())  # ['number', 'str']
print(cur.column_types())  # ['UInt64', 'String']

# カーソルをイテレータとして使用
for row in cur:
    print(row)

# 必ずリソースをクローズ
cur.close()
conn.close()
```

## データ入力方法 {#data-input}

### ファイルベースのデータソース {#file-based-data-sources}

chDBは70以上のデータフォーマットに対応し、ファイルを直接クエリできます：

```python
import chdb
# データを準備
# ...

# Parquetファイルのクエリ
result = chdb.query("""
    SELECT customer_id, sum(amount) as total
    FROM file('sales.parquet', Parquet) 
    GROUP BY customer_id 
    ORDER BY total DESC 
    LIMIT 10
""", 'JSONEachRow')

# ヘッダー付きCSVのクエリ
result = chdb.query("""
    SELECT * FROM file('data.csv', CSVWithNames) 
    WHERE column1 > 100
""", 'DataFrame')

# 複数のファイルフォーマット
result = chdb.query("""
    SELECT * FROM file('logs*.jsonl', JSONEachRow)
    WHERE timestamp > '2024-01-01'
""", 'Pretty')
```

### 出力フォーマットの例 {#output-format-examples}

```python
# 分析用DataFrame
df = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'DataFrame')
print(type(df))  # <class 'pandas.core.frame.DataFrame'>

# 相互運用性のためのArrow Table
arrow_table = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'ArrowTable')
print(type(arrow_table))  # <class 'pyarrow.lib.Table'>

# API用JSON
json_result = chdb.query('SELECT version()', 'JSON')
print(json_result)

# デバッグ用Prettyフォーマット
pretty_result = chdb.query('SELECT * FROM system.numbers LIMIT 3', 'Pretty')
print(pretty_result)
```

### DataFrame操作 {#dataframe-operations}

#### レガシーDataFrame API {#legacy-dataframe-api}

```python
import chdb.dataframe as cdf
import pandas as pd

# 複数のDataFrameを結合
df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})

result_df = cdf.query(
    sql="SELECT * FROM __tbl1__ t1 JOIN __tbl2__ t2 ON t1.a = t2.c",
    tbl1=df1, 
    tbl2=df2
)
print(result_df)

# 結果DataFrameをクエリ
summary = result_df.query('SELECT b, sum(a) FROM __table__ GROUP BY b')
print(summary)
```

#### Pythonテーブルエンジン（推奨） {#python-table-engine-recommended}

```python
import chdb
import pandas as pd
import pyarrow as pa

# Pandas DataFrameを直接クエリ
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

# JSONサポート付きの直接DataFrameクエリ
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

# Arrow Tableのクエリ
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

### ステートフルセッション {#stateful-sessions}

セッションは複数の操作間でクエリ状態を維持し、複雑なワークフローを可能にします：

```python
from chdb import session

# 一時セッション（自動クリーンアップ）
sess = session.Session()

# または特定のパスで永続セッション
# sess = session.Session("/path/to/data")

# データベースとテーブルの作成
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

# データの挿入
sess.query("""
    INSERT INTO sales VALUES 
        (1, 'Laptop', 999.99, '2024-01-15'),
        (2, 'Mouse', 29.99, '2024-01-16'),
        (3, 'Keyboard', 79.99, '2024-01-17')
""")

# マテリアライズドビューの作成
sess.query("""
    CREATE MATERIALIZED VIEW daily_sales AS
    SELECT 
        sale_date,
        count() as orders,
        sum(amount) as revenue
    FROM sales 
    GROUP BY sale_date
""")

# ビューのクエリ
result = sess.query("SELECT * FROM daily_sales ORDER BY sale_date", "Pretty")
print(result)

# セッションは自動的にリソースを管理
sess.close()  # オプション - オブジェクト削除時に自動クローズ
```

### 高度なセッション機能 {#advanced-session-features}

```python
# カスタム設定付きセッション
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

参照：[test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py)。

### Python DB-API 2.0インターフェース {#python-db-api-20}

既存のPythonアプリケーションとの互換性のための標準データベースインターフェース：

```python
import chdb.dbapi as dbapi

# ドライバー情報の確認
print(f"chDBドライバーバージョン: {dbapi.get_client_info()}")

# コネクションの作成
conn = dbapi.connect()
cursor = conn.cursor()

# パラメータ付きクエリの実行
cursor.execute("""
    SELECT number, number * ? as doubled 
    FROM system.numbers 
    LIMIT ?
""", (2, 5))

# メタデータの取得
print("カラム説明:", cursor.description)
print("行数:", cursor.rowcount)

# 結果の取得
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

### ユーザー定義関数（UDF） {#user-defined-functions}

カスタムPython関数でSQLを拡張：

#### 基本的なUDFの使用方法 {#basic-udf-usage}

```python
from chdb.udf import chdb_udf
from chdb import query

# シンプルな数学関数
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

# クエリでUDFを使用
result = query("""
    SELECT 
        add_numbers('10', '20') as sum_result,
        reverse_string('hello') as reversed,
        extract_json_field('{"name": "John", "age": 30}', 'name') as name
""")
print(result)
```

#### カスタム戻り値型を持つ高度なUDF {#advanced-udf-custom-return-types}

```python
# 特定の戻り値型を持つUDF
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

# 複雑なクエリで使用
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

#### UDFのベストプラクティス {#udf-best-practices}

1. **ステートレス関数**：UDFは副作用のない純粋関数であるべき
2. **関数内でインポート**：必要なモジュールはすべてUDF内でインポートする
3. **文字列入出力**：すべてのUDFパラメータは文字列（TabSeparatedフォーマット）
4. **エラー処理**：堅牢なUDFにはtry-catchブロックを含める
5. **パフォーマンス**：UDFは各行で呼び出されるため、パフォーマンスを最適化

```python
# エラー処理を含む構造化されたUDF
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

# 複雑なネストされたJSONで使用
query("""
    SELECT safe_json_extract(
        '{"user": {"profile": {"name": "Alice", "age": 25}}}',
        'user.profile.name'
    ) as extracted_name
""")
```

### ストリーミングクエリ処理 {#streaming-queries}

一定のメモリ使用量で大規模データセットを処理：

```python
from chdb import session

sess = session.Session()

# 大規模データセットのセットアップ
sess.query("""
    CREATE TABLE large_data ENGINE = Memory() AS 
    SELECT number as id, toString(number) as data 
    FROM numbers(1000000)
""")

# 例1：コンテキストマネージャーを使用した基本的なストリーミング
total_rows = 0
with sess.send_query("SELECT * FROM large_data", "CSV") as stream:
    for chunk in stream:
        chunk_rows = len(chunk.data().split('\n')) - 1
        total_rows += chunk_rows
        print(f"処理済みチャンク: {chunk_rows} 行")
        
        # 必要に応じて早期終了
        if total_rows > 100000:
            break

print(f"処理した合計行数: {total_rows}")

# 例2：明示的なクリーンアップを伴う手動イテレーション
stream = sess.send_query("SELECT * FROM large_data WHERE id % 100 = 0", "JSONEachRow")
processed_count = 0

while True:
    chunk = stream.fetch()
    if chunk is None:
        break
    
    # チャンクデータの処理
    lines = chunk.data().strip().split('\n')
    for line in lines:
        if line:  # 空行をスキップ
            processed_count += 1
    
    print(f"これまでに{processed_count}レコードを処理しました...")
    
stream.close()  # 重要：明示的なクリーンアップ

# 例3：外部ライブラリとのArrow統合
import pyarrow as pa
from deltalake import write_deltalake

# Arrowフォーマットで結果をストリーム
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

### Pythonテーブルエンジン {#python-table-engine}

#### Pandas DataFrameのクエリ {#query-pandas-dataframes}

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

# JSON操作を含む高度なクエリ
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

# DataFrameでのウィンドウ関数
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

#### PyReaderによるカスタムデータソース {#custom-data-sources-pyreader}

特殊なデータソース用のカスタムデータリーダーを実装：

```python
import chdb
from typing import List, Tuple, Any
import json

class DatabaseReader(chdb.PyReader):
    """データベースライクなデータソース用カスタムリーダー"""
    
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
            ("metadata", "String")  # JSONは文字列として保存
        ]
    
    def read(self, col_names: List[str], count: int) -> List[List[Any]]:
        """バッチ単位でデータを読み取り"""
        if self.cursor >= len(self.data["id"]):
            return []  # データなし
        
        end_pos = min(self.cursor + min(count, self.batch_size), len(self.data["id"]))
        
        # 要求されたカラムのデータを返す
        result = []
        for col in col_names:
            if col in self.data:
                result.append(self.data[col][self.cursor:end_pos])
            else:
                # 欠損カラムの処理
                result.append([None] * (end_pos - self.cursor))
        
        self.cursor = end_pos
        return result

### JSON型推論と処理 {#json-type-inference-handling}

chDBは複雑なネストされたデータ構造を自動的に処理します：

```python
import pandas as pd
import chdb

# 混合JSONオブジェクトを含むDataFrame {#dataframe-with-mixed-json-objects}
df_with_json = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "profile": [
        {"name": "Alice", "age": 25, "preferences": ["music", "travel"]},
        {"name": "Bob", "age": 30, "location": {"city": "NYC", "country": "US"}},
        {"name": "Charlie", "skills": ["python", "sql", "ml"], "experience": 5},
        {"score": 95, "rank": "gold", "achievements": [{"title": "Expert", "date": "2024-01-01"}]}
    ]
})

# 設定でJSON推論を制御 {#control-json-inference-with-settings}
result = chdb.query("""
    SELECT 
        user_id,
        profile.name as name,
        profile.age as age,
        length(profile.preferences) as pref_count,
        profile.location.city as city
    FROM Python(df_with_json)
    SETTINGS pandas_analyze_sample = 1000  -- JSON検出のため全行を分析
""", "Pretty")
print(result)

# 高度なJSON操作 {#advanced-json-operations}
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
```

## パフォーマンスと最適化 {#performance-optimization}

### ベンチマーク {#benchmarks}

chDBは他の組み込みエンジンを一貫して上回ります：
- **DataFrame操作**：分析クエリで従来のDataFrameライブラリより2〜5倍高速
- **Parquet処理**：主要なカラム型エンジンと同等の性能
- **メモリ効率**：代替製品よりも低いメモリフットプリント

[ベンチマーク結果の詳細](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### パフォーマンスのヒント {#performance-tips}

```python
import chdb

# 1. 適切な出力フォーマットを使用 {#1-use-appropriate-output-formats}
df_result = chdb.query("SELECT * FROM large_table", "DataFrame")  # 分析用
arrow_result = chdb.query("SELECT * FROM large_table", "Arrow")    # 相互運用性用
native_result = chdb.query("SELECT * FROM large_table", "Native")   # chDB間用

# 2. 設定でクエリを最適化 {#2-optimize-queries-with-settings}
fast_result = chdb.query("""
    SELECT customer_id, sum(amount) 
    FROM sales 
    GROUP BY customer_id
    SETTINGS 
        max_threads = 8,
        max_memory_usage = '4G',
        use_uncompressed_cache = 1
""", "DataFrame")

# 3. 大規模データセットにはストリーミングを活用 {#3-leverage-streaming-for-large-datasets}
from chdb import session

sess = session.Session()

# 大規模データセットのセットアップ {#setup-large-dataset}
sess.query("""
    CREATE TABLE large_sales ENGINE = Memory() AS 
    SELECT 
        number as sale_id,
        number % 1000 as customer_id,
        rand() % 1000 as amount
    FROM numbers(10000000)
""")

# 一定のメモリ使用量でストリーム処理 {#stream-processing-with-constant-memory-usage}
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
        
        print(f"{processed_rows}件の顧客レコードを処理、累計: {total_amount}")
        
        # デモ用の早期終了
        if processed_rows > 1000:
            break

print(f"最終結果: {processed_rows}件の顧客を処理、合計金額: {total_amount}")

# 外部システム（例：Delta Lake）へのストリーム {#stream-to-external-systems-eg-delta-lake}
stream = sess.send_query("SELECT * FROM large_sales LIMIT 1000000", "Arrow")
batch_reader = stream.record_batch(rows_per_batch=50000)

# バッチ単位で処理 {#process-in-batches}
for batch in batch_reader:
    print(f"{batch.num_rows}行のバッチを処理中...")
    # 各バッチを変換またはエクスポート
    # df_batch = batch.to_pandas()
    # process_batch(df_batch)

stream.close()
sess.close()
```

## GitHubリポジトリ {#github-repository}

- **メインリポジトリ**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **問題とサポート**: [GitHubリポジトリ](https://github.com/chdb-io/chdb/issues)で問題を報告してください