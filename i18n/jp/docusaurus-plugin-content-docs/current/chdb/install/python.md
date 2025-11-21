---
title: 'Python 向け chDB のインストール'
sidebar_label: 'Python'
slug: /chdb/install/python
description: 'Python 向け chDB のインストール方法'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'python', 'install']
doc_type: 'guide'
---



## 要件 {#requirements}

- Python 3.8以上
- サポート対象プラットフォーム: macOSおよびLinux (x86_64およびARM64)


## インストール {#install}

```bash
pip install chdb
```


## 使用方法 {#usage}

### コマンドラインインターフェース {#command-line-interface}

コマンドラインから直接SQLクエリを実行できます:


```bash
# 基本的なクエリ
python3 -m chdb "SELECT 1, 'abc'" Pretty
```


# フォーマット指定付きのクエリ

python3 -m chdb &quot;SELECT version()&quot; JSON

````

### 基本的なPythonの使用方法 {#basic-python-usage}

```python
import chdb
````


# 簡単なクエリ
result = chdb.query("SELECT 1 as id, 'Hello World' as message", "CSV")
print(result)



# クエリ統計情報の取得

print(f&quot;Rows read: {result.rows_read()}&quot;)
print(f&quot;Bytes read: {result.bytes_read()}&quot;)
print(f&quot;Execution time: {result.elapsed()} seconds&quot;)

````

### 接続ベースのAPI（推奨） {#connection-based-api}

リソース管理とパフォーマンスを向上させるため：

```python
import chdb
````


# 接続を作成（デフォルトではメモリ内）
conn = chdb.connect(":memory:")
# ファイルベースを使用することも可能: conn = chdb.connect("mydata.db")



# クエリ実行用のカーソルを作成
cur = conn.cursor()



# クエリの実行
cur.execute("SELECT number, toString(number) as str FROM system.numbers LIMIT 3")



# 結果をさまざまな方法で取得する
print(cur.fetchone())    # 単一行: (0, '0')
print(cur.fetchmany(2))  # 複数行: ((1, '1'), (2, '2'))



# メタデータを取得する
print(cur.column_names())  # ['number', 'str']
print(cur.column_types())  # ['UInt64', 'String']



# カーソルをイテレータとして使用する
for row in cur:
    print(row)



# リソースは必ずクローズすること

cur.close()
conn.close()

```
```


## データ入力方法 {#data-input}

### ファイルベースのデータソース {#file-based-data-sources}

chDBは、ファイルに対する直接クエリのために70種類以上のデータフォーマットをサポートしています:


```python
import chdb
# データを準備
# ...
```


# Parquet ファイルにクエリを実行
result = chdb.query("""
    SELECT customer_id, sum(amount) as total
    FROM file('sales.parquet', Parquet) 
    GROUP BY customer_id 
    ORDER BY total DESC 
    LIMIT 10
""", 'JSONEachRow')



# ヘッダー行付きCSVをクエリする
result = chdb.query("""
    SELECT * FROM file('data.csv', CSVWithNames) 
    WHERE column1 > 100
""", 'DataFrame')



# 複数のファイル形式

result = chdb.query(&quot;&quot;&quot;
SELECT * FROM file(&#39;logs*.jsonl&#39;, JSONEachRow)
WHERE timestamp &gt; &#39;2024-01-01&#39;
&quot;&quot;&quot;, &#39;Pretty&#39;)

```

### 出力形式の例 {#output-format-examples}
```


```python
# 分析用DataFrame
df = chdb.query('SELECT * FROM system.numbers LIMIT 5', 'DataFrame')
print(type(df))  # <class 'pandas.core.frame.DataFrame'>
```


# 相互運用性のためのArrow Table

arrow_table = chdb.query('SELECT \* FROM system.numbers LIMIT 5', 'ArrowTable')
print(type(arrow_table)) # <class 'pyarrow.lib.Table'>


# API 用 JSON
json_result = chdb.query('SELECT version()', 'JSON')
print(json_result)



# デバッグ用の Pretty 形式

pretty&#95;result = chdb.query(&#39;SELECT * FROM system.numbers LIMIT 3&#39;, &#39;Pretty&#39;)
print(pretty&#95;result)

````

### DataFrame操作 {#dataframe-operations}

#### レガシーDataFrame API {#legacy-dataframe-api}

```python
import chdb.dataframe as cdf
import pandas as pd
````


# 複数のDataFrameを結合する

df1 = pd.DataFrame({'a': [1, 2, 3], 'b': ["one", "two", "three"]})
df2 = pd.DataFrame({'c': [1, 2, 3], 'd': ["①", "②", "③"]})

result_df = cdf.query(
sql="SELECT \* FROM **tbl1** t1 JOIN **tbl2** t2 ON t1.a = t2.c",
tbl1=df1,
tbl2=df2
)
print(result_df)


# 結果のDataFrameにクエリを実行する

summary = result&#95;df.query(&#39;SELECT b, sum(a) FROM **table** GROUP BY b&#39;)
print(summary)

````

#### Pythonテーブルエンジン（推奨） {#python-table-engine-recommended}

```python
import chdb
import pandas as pd
import pyarrow as pa
````


# Pandas DataFrameに直接クエリを実行する

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


# JSON 対応の DataFrame への直接クエリ
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



# Arrow テーブルへのクエリ

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

````

### ステートフルセッション {#stateful-sessions}

セッションは複数の操作間でクエリの状態を保持し、複雑なワークフローを実現します：

```python
from chdb import session

````


# 一時セッション（自動クリーンアップ）
sess = session.Session()



# または特定のパスを指定した永続的なセッション
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



# データを挿入
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



# ビューに対してクエリを実行する
result = sess.query("SELECT * FROM daily_sales ORDER BY sale_date", "Pretty")
print(result)



# セッションはリソースを自動管理する

sess.close()  # 省略可能 - オブジェクト削除時に自動的にクローズされる

```

### 高度なセッション機能 {#advanced-session-features}
```


```python
# カスタム設定を使用したセッション
sess = session.Session(
    path="/tmp/analytics_db",
)
```


# クエリパフォーマンスの最適化

result = sess.query(&quot;&quot;&quot;
SELECT product, sum(amount) as total
FROM sales
GROUP BY product
ORDER BY total DESC
SETTINGS max&#95;threads = 4
&quot;&quot;&quot;, &quot;JSON&quot;)

````

参照: [test_stateful.py](https://github.com/chdb-io/chdb/blob/main/tests/test_stateful.py)

### Python DB-API 2.0 インターフェース {#python-db-api-20}

既存のPythonアプリケーションとの互換性を保つための標準データベースインターフェース:

```python
import chdb.dbapi as dbapi
````


# ドライバ情報の確認
print(f"chDB driver version: {dbapi.get_client_info()}")



# 接続を作成
conn = dbapi.connect()
cursor = conn.cursor()



# パラメータ付きクエリを実行する
cursor.execute("""
    SELECT number, number * ? as doubled 
    FROM system.numbers 
    LIMIT ?
""", (2, 5))



# メタデータを取得
print("Column descriptions:", cursor.description)
print("Row count:", cursor.rowcount)



# 結果を取得
print("First row:", cursor.fetchone())
print("Next 2 rows:", cursor.fetchmany(2))



# 残りの行を取得
for row in cursor.fetchall():
    print("Row:", row)



# バッチ処理

data = [(1, &#39;Alice&#39;), (2, &#39;Bob&#39;), (3, &#39;Charlie&#39;)]
cursor.execute(&quot;&quot;&quot;
CREATE TABLE temp&#95;users (
id UInt64,
name String
) ENGINE = MergeTree()
ORDER BY (id)
&quot;&quot;&quot;)
cursor.executemany(
&quot;INSERT INTO temp&#95;users (id, name) VALUES (?, ?)&quot;,
data
)

````

### ユーザー定義関数（UDF） {#user-defined-functions}

カスタムPython関数でSQLを拡張します：

#### 基本的なUDFの使用方法 {#basic-udf-usage}

```python
from chdb.udf import chdb_udf
from chdb import query
````


# 簡単な数値演算関数
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



# クエリでのUDFの使用

result = query("""
SELECT
add_numbers('10', '20') as sum_result,
reverse_string('hello') as reversed,
extract_json_field('{"name": "John", "age": 30}', 'name') as name
""")
print(result)

```

#### カスタム戻り値型を使用した高度なUDF {#advanced-udf-custom-return-types}

```


```python
# 特定の戻り値型を持つUDF
@chdb_udf(return_type="Float64")
def calculate_bmi(height_str, weight_str):
    height = float(height_str) / 100  # cmをmに変換
    weight = float(weight_str)
    return weight / (height * height)
```


# データ検証用のUDF

@chdb*udf(return_type="UInt8")
def is_valid_email(email):
import re
pattern = r'^[a-zA-Z0-9.*%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
return 1 if re.match(pattern, email) else 0


# 複雑なクエリでの使用

result = query(&quot;&quot;&quot;
SELECT
name,
calculate&#95;bmi(height, weight) as bmi,
is&#95;valid&#95;email(email) as has&#95;valid&#95;email
FROM (
SELECT
&#39;John&#39; as name, &#39;180&#39; as height, &#39;75&#39; as weight, &#39;[john@example.com](mailto:john@example.com)&#39; as email
UNION ALL
SELECT
&#39;Jane&#39; as name, &#39;165&#39; as height, &#39;60&#39; as weight, &#39;invalid-email&#39; as email
)
&quot;&quot;&quot;, &quot;Pretty&quot;)
print(result)

```

#### UDFのベストプラクティス {#udf-best-practices}

1. **ステートレス関数**: UDFは副作用のない純粋関数にする必要があります
2. **関数内でのインポート**: 必要なモジュールはすべてUDF内でインポートする必要があります
3. **文字列の入出力**: すべてのUDFパラメータは文字列です（TabSeparated形式）
4. **エラー処理**: 堅牢なUDFにするためにtry-catchブロックを含めてください
5. **パフォーマンス**: UDFは各行ごとに呼び出されるため、パフォーマンスを最適化してください
```


```python
# エラー処理を備えた適切に構造化されたUDF
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
```


# 複雑にネストされたJSONの使用

query("""
SELECT safe_json_extract(
'{"user": {"profile": {"name": "Alice", "age": 25}}}',
'user.profile.name'
) as extracted_name
""")

````

### ストリーミングクエリ処理 {#streaming-queries}

一定のメモリ使用量で大規模データセットを処理：

```python
from chdb import session

sess = session.Session()

````


# 大規模データセットの準備
sess.query("""
    CREATE TABLE large_data ENGINE = Memory() AS 
    SELECT number as id, toString(number) as data 
    FROM numbers(1000000)
""")



# 例 1: コンテキストマネージャーを用いた基本的なストリーミング
total_rows = 0
with sess.send_query("SELECT * FROM large_data", "CSV") as stream:
    for chunk in stream:
        chunk_rows = len(chunk.data().split('\n')) - 1
        total_rows += chunk_rows
        print(f"Processed chunk: {chunk_rows} rows")
        
        # 必要に応じて早期終了する
        if total_rows > 100000:
            break

print(f"Total rows processed: {total_rows}")



# 例 2: 明示的なクリーンアップを伴う手動イテレーション
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
    
    print(f"Processed {processed_count} records so far...")
    
stream.close()  # 重要: 明示的なクリーンアップ処理



# 例3: 外部ライブラリとのArrow統合

import pyarrow as pa
from deltalake import write_deltalake


# 結果を Arrow 形式でストリーミング取得する
stream = sess.send_query("SELECT * FROM large_data LIMIT 100000", "Arrow")



# カスタムのバッチサイズで RecordBatchReader を作成する
batch_reader = stream.record_batch(rows_per_batch=10000)



# Delta Lake へのエクスポート

write&#95;deltalake(
table&#95;or&#95;uri=&quot;./my&#95;delta&#95;table&quot;,
data=batch&#95;reader,
mode=&quot;overwrite&quot;
)

stream.close()
sess.close()

````

### Pythonテーブルエンジン {#python-table-engine}

#### Pandas DataFrameへのクエリ {#query-pandas-dataframes}

```python
import chdb
import pandas as pd
````


# ネストされたデータを含む複雑な DataFrame

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



# DataFrame に対するウィンドウ関数

window&#95;result = chdb.query(&quot;&quot;&quot;
SELECT
customer&#95;name,
toFloat64(orders.amount) as amount,
sum(toFloat64(orders.amount)) OVER (
PARTITION BY customer&#95;name
ORDER BY toInt32(orders.order&#95;id)
) as running&#95;total
FROM Python(df)
ORDER BY customer&#95;name, toInt32(orders.order&#95;id)
&quot;&quot;&quot;, &quot;Pretty&quot;)
print(window&#95;result)

````

#### PyReaderを使用したカスタムデータソース {#custom-data-sources-pyreader}

特殊なデータソース用のカスタムデータリーダーを実装します：

```python
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
            return []  # データなし
        
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

### JSON型推論と処理 {#json-type-inference-handling}

chDBは複雑なネストされたデータ構造を自動的に処理します：

```python
import pandas as pd
import chdb
````


# 混在するJSONオブジェクトを含むDataFrame

df_with_json = pd.DataFrame({
"user_id": [1, 2, 3, 4],
"profile": [
{"name": "Alice", "age": 25, "preferences": ["music", "travel"]},
{"name": "Bob", "age": 30, "location": {"city": "NYC", "country": "US"}},
{"name": "Charlie", "skills": ["python", "sql", "ml"], "experience": 5},
{"score": 95, "rank": "gold", "achievements": [{"title": "Expert", "date": "2024-01-01"}]}
]
})


# 設定で JSON 推論を制御する
result = chdb.query("""
    SELECT 
        user_id,
        profile.name as name,
        profile.age as age,
        length(profile.preferences) as pref_count,
        profile.location.city as city
    FROM Python(df_with_json)
    SETTINGS pandas_analyze_sample = 1000  -- JSON 検出のためにすべての行を分析する
""", "Pretty")
print(result)



# 高度な JSON 操作

complex&#95;json = chdb.query(&quot;&quot;&quot;
SELECT
user&#95;id,
JSONLength(toString(profile)) as json&#95;fields,
JSONType(toString(profile), &#39;preferences&#39;) as pref&#95;type,
if(
JSONHas(toString(profile), &#39;achievements&#39;),
JSONExtractString(toString(profile), &#39;achievements[0].title&#39;),
&#39;None&#39;
) as first&#95;achievement
FROM Python(df&#95;with&#95;json)
&quot;&quot;&quot;, &quot;JSONEachRow&quot;)
print(complex&#95;json)

```
```


## パフォーマンスと最適化 {#performance-optimization}

### ベンチマーク {#benchmarks}

chDBは他の組み込みエンジンを一貫して上回るパフォーマンスを発揮します：

- **DataFrame操作**: 分析クエリにおいて従来のDataFrameライブラリより2～5倍高速
- **Parquet処理**: 主要なカラムナエンジンに匹敵する性能
- **メモリ効率**: 代替手段よりも低いメモリフットプリント

[ベンチマーク結果の詳細](https://github.com/chdb-io/chdb?tab=readme-ov-file#benchmark)

### パフォーマンスのヒント {#performance-tips}

```python
import chdb

```


# 1. 適切な出力フォーマットを使用する
df_result = chdb.query("SELECT * FROM large_table", "DataFrame")  # 分析用
arrow_result = chdb.query("SELECT * FROM large_table", "Arrow")    # 他システムとの相互運用向け
native_result = chdb.query("SELECT * FROM large_table", "Native")   # chDB 同士のやり取り用



# 2. 設定でクエリを最適化する
fast_result = chdb.query("""
    SELECT customer_id, sum(amount) 
    FROM sales 
    GROUP BY customer_id
    SETTINGS 
        max_threads = 8,
        max_memory_usage = '4G',
        use_uncompressed_cache = 1
""", "DataFrame")



# 3. 大規模データセットにはストリーミングを活用する
from chdb import session

sess = session.Session()



# 大規模データセットの準備
sess.query("""
    CREATE TABLE large_sales ENGINE = Memory() AS 
    SELECT 
        number as sale_id,
        number % 1000 as customer_id,
        rand() % 1000 as amount
    FROM numbers(10000000)
""")



# 一定のメモリ使用量で行うストリーム処理
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
        
        print(f"{processed_rows} 件の顧客レコードを処理しました。現在の合計: {total_amount}")
        
        # デモのための早期終了
        if processed_rows > 1000:
            break

print(f"最終結果: {processed_rows} 件の顧客を処理しました。合計金額: {total_amount}")



# 外部システム（例: Delta Lake）へのストリーミング
stream = sess.send_query("SELECT * FROM large_sales LIMIT 1000000", "Arrow")
batch_reader = stream.record_batch(rows_per_batch=50000)



# バッチ単位で処理する

for batch in batch&#95;reader:
print(f&quot;Processing batch with {batch.num_rows} rows...&quot;)

# 各バッチを変換またはエクスポートする

# df&#95;batch = batch.to&#95;pandas()

# process&#95;batch(df&#95;batch)

stream.close()
sess.close()

```
```


## GitHubリポジトリ {#github-repository}

- **メインリポジトリ**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **問題報告とサポート**: 問題は[GitHubリポジトリ](https://github.com/chdb-io/chdb/issues)で報告してください
