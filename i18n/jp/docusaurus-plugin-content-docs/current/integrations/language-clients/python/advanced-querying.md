---
sidebar_label: '高度なクエリ'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: 'ClickHouse Connect を使用した高度なクエリ'
slug: /integrations/language-clients/python/advanced-querying
title: '高度なクエリ'
doc_type: 'reference'
---

# ClickHouse Connect を使ったデータクエリの高度な使い方 \\{#querying-data-with-clickhouse-connect--advanced-usage\\}

## QueryContexts \\{#querycontexts\\}

ClickHouse Connect は通常のクエリを `QueryContext` 内で実行します。`QueryContext` には、ClickHouse データベースに対してクエリを構築するために使用される主要な構造と、結果を `QueryResult` またはその他の応答データ構造へと変換するために使用される設定が含まれます。これには、クエリ本体、パラメータ、設定、読み取りフォーマット、その他のプロパティが含まれます。

`QueryContext` はクライアントの `create_query_context` メソッドを使用して取得できます。このメソッドは、コアのクエリメソッドと同じパラメータを受け取ります。このクエリコンテキストは、その後 `query`、`query_df`、`query_np` メソッドに対して、他の引数の一部またはすべての代わりに `context` キーワード引数として渡すことができます。メソッド呼び出し時に追加で指定された引数は、QueryContext のプロパティを上書きする点に注意してください。

`QueryContext` の代表的なユースケースは、異なるバインドパラメータ値で同じクエリを送信することです。すべてのパラメータ値は、辞書を引数として `QueryContext.set_parameters` メソッドを呼び出すことで更新でき、任意の単一の値は、目的の `key` と `value` のペアを指定して `QueryContext.set_parameter` を呼び出すことで更新できます。

```python
client.create_query_context(query='SELECT value1, value2 FROM data_table WHERE key = {k:Int32}',
                            parameters={'k': 2},
                            column_oriented=True)
result = client.query(context=qc)
assert result.result_set[1][0] == 'second_value2'
qc.set_parameter('k', 1)
result = test_client.query(context=qc)
assert result.result_set[1][0] == 'first_value2'
```

`QueryContext` はスレッドセーフではありませんが、マルチスレッド環境で使用する場合は、`QueryContext.updated_copy` メソッドを呼び出してコピーを取得できます。

## ストリーミングクエリ \\{#streaming-queries\\}

ClickHouse Connect Client は、ストリームとしてデータを取得するための複数のメソッド（Python のジェネレーターとして実装されています）を提供します。

- `query_column_block_stream` -- ネイティブな Python オブジェクトを使用して、クエリデータをブロック単位で列のシーケンスとして返します
- `query_row_block_stream` -- ネイティブな Python オブジェクトを使用して、クエリデータをブロック単位の行集合として返します
- `query_rows_stream` -- ネイティブな Python オブジェクトを使用して、クエリデータを行のシーケンスとして返します
- `query_np_stream` -- クエリデータの各 ClickHouse ブロックを NumPy 配列として返します
- `query_df_stream` -- クエリデータの各 ClickHouse ブロックを Pandas DataFrame として返します
- `query_arrow_stream` -- クエリデータを PyArrow の RecordBlocks として返します
- `query_df_arrow_stream` -- クエリデータの各 ClickHouse ブロックを、`dataframe_library` という kwarg に応じて（デフォルトは "pandas"）、Arrow バックエンドの Pandas DataFrame または Polars DataFrame として返します。

これらの各メソッドは `ContextStream` オブジェクトを返し、ストリームの処理を開始するには `with` 文を使ってオープンする必要があります。

### データブロック \\{#data-blocks\\}

ClickHouse Connect は、主要な `query` メソッドからのすべてのデータを、ClickHouse サーバーから受信したブロックのストリームとして処理します。これらのブロックは、ClickHouse との間でカスタムの「Native」フォーマットで送受信されます。「ブロック」は単にバイナリデータのカラムの並びであり、それぞれのカラムには、指定されたデータ型のデータ値が同数含まれています。（カラムナデータベースである ClickHouse は、このデータを類似の形式で保存します。）クエリから返されるブロックのサイズは、複数のレベル（ユーザープロファイル、ユーザー、セッション、またはクエリ）で設定可能な 2 つの設定によって制御されます。それらは次のとおりです。

- [max_block_size](/operations/settings/settings#max_block_size) -- ブロックの行数に対する上限。既定値は 65536。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- ブロックのバイト数に対するソフトリミット。既定値は 1,000,0000。

`preferred_block_size_setting` に関係なく、各ブロックの行数が `max_block_size` を超えることはありません。クエリの種類に応じて、実際に返されるブロックサイズはさまざまになり得ます。たとえば、多数のシャードをカバーする分散テーブルに対するクエリでは、各シャードから直接取得された、より小さなブロックが含まれる場合があります。

クライアントの `query_*_stream` メソッドのいずれかを使用する場合、結果はブロック単位で返されます。ClickHouse Connect は常に一度に 1 つのブロックのみを読み込みます。これにより、大きな結果セット全体をメモリにロードすることなく、大量のデータを処理できます。アプリケーション側では任意の数のブロックを処理できるようにしておく必要があり、各ブロックの正確なサイズを制御することはできない点に注意してください。

### 処理が遅い場合の HTTP データバッファ \\{#http-data-buffer-for-slow-processing\\}

HTTP プロトコルの制約により、ブロックの処理速度が ClickHouse サーバーがデータをストリーミングする速度よりも大幅に遅い場合、ClickHouse サーバーは接続を閉じ、その結果として処理スレッドで例外 (Exception) がスローされます。これをある程度緩和するには、共通設定である `http_buffer_size` を使用して、HTTP ストリーミングバッファのバッファサイズ（デフォルトは 10 メガバイト）を増やします。この状況では、アプリケーションで利用可能なメモリが十分にある場合、大きな `http_buffer_size` の値でも問題ありません。`lz4` または `zstd` 圧縮を使用している場合、バッファ内のデータは圧縮された状態で保存されるため、これらの圧縮方式を利用することで、実質的に利用可能なバッファ容量を増やすことができます。

### StreamContexts \\{#streamcontexts\\}

`query_row_block_stream` のような `query_*_stream` メソッドはそれぞれ、Python のコンテキストマネージャ／ジェネレーターを組み合わせた ClickHouse の `StreamContext` オブジェクトを返します。基本的な使い方は次のとおりです。

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <do something with each row of Python trip data>
```

`with` 文を使わずに `StreamContext` を利用しようとすると、エラーが発生することに注意してください。Python のコンテキストマネージャーを使用することで、ストリーム（この場合はストリーミング HTTP レスポンス）が、すべてのデータが消費されなかった場合や処理中に例外が発生した場合でも、適切にクローズされることが保証されます。なお、`StreamContext` はストリームを消費するために 1 回しか使用できません。`StreamContext` の終了後に再度使用しようとすると、`StreamClosedError` が発生します。

`StreamContext` の `source` プロパティを使用して、親の `QueryResult` オブジェクトにアクセスできます。`QueryResult` には、列名やデータ型が含まれています。

### ストリームの種類 \\{#stream-types\\}

`query_column_block_stream` メソッドは、ブロックをネイティブな Python データ型として保存されたカラムデータのシーケンスとして返します。上記の `taxi_trips` クエリを使用した場合、返されるデータはリストになり、そのリストの各要素は、対応するカラムのすべてのデータを含む別のリスト（またはタプル）になります。したがって `block[0]` は文字列だけを含むタプルになります。カラム指向フォーマットは、合計料金の合算のように、そのカラム内のすべての値に対する集約処理を行う用途で最もよく使用されます。

`query_row_block_stream` メソッドは、ブロックを従来のリレーショナルデータベースのような行のシーケンスとして返します。taxi trips の場合、返されるデータはリストになり、そのリストの各要素は 1 行のデータを表す別のリストになります。したがって `block[0]` には最初の taxi trip のすべてのフィールド（順番どおり）が含まれ、`block[1]` には 2 番目の taxi trip のすべてのフィールドを持つ 1 行が含まれ、以降も同様です。行指向の結果は、通常、表示や変換処理のために使用されます。

`query_row_stream` は、ストリームを反復処理する際に自動的に次のブロックへ移動するための便利なメソッドです。それ以外は `query_row_block_stream` と同一です。

`query_np_stream` メソッドは、各ブロックを 2 次元の NumPy array として返します。内部的には、NumPy array は（通常）カラムとして保存されるため、行またはカラム専用のメソッドは必要ありません。NumPy array の「shape」は (columns, rows) として表されます。NumPy ライブラリは、NumPy array を操作する多くのメソッドを提供しています。クエリ内のすべてのカラムが同じ NumPy の dtype を共有している場合、返される NumPy array も 1 つの dtype のみを持ち、内部構造を実際に変更することなく reshape や回転が可能であることに注意してください。

`query_df_stream` メソッドは、各 ClickHouse Block を 2 次元の Pandas DataFrame として返します。以下の例は、`StreamContext` オブジェクトを 1 回だけ遅延的にコンテキストとして使用できることを示しています。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <do something with the pandas DataFrame>
```

`query_df_arrow_stream` メソッドは、各 ClickHouse の Block を、dtype バックエンドに PyArrow を用いる DataFrame として返します。このメソッドは、`dataframe_library` パラメータ（デフォルトは `"pandas"`）を通じて、Pandas（2.x 以降）および Polars の DataFrame の両方をサポートします。各イテレーションでは、PyArrow の record batch から変換された DataFrame が返され、特定のデータ型に対してパフォーマンスとメモリ効率が向上します。

最後に、`query_arrow_stream` メソッドは、ClickHouse の `ArrowStream` 形式の結果を、`StreamContext` でラップされた `pyarrow.ipc.RecordBatchStreamReader` として返します。ストリームの各イテレーションでは、PyArrow の RecordBlock が返されます。

### ストリーミングの例 \\{#streaming-examples\\}

#### 行のストリーミング \\{#stream-rows\\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Stream large result sets row by row
with client.query_rows_stream("SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000") as stream:
    for row in stream:
        print(row)  # Process each row
        # Output:
        # (0, 0)
        # (1, 2)
        # (2, 4)
        # ....
```

#### 行ブロックのストリーミング \\{#stream-row-blocks\\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Stream in blocks of rows (more efficient than row-by-row)
with client.query_row_block_stream("SELECT number, number * 2 FROM system.numbers LIMIT 100000") as stream:
    for block in stream:
        print(f"Received block with {len(block)} rows")
        # Output:
        # Received block with 65409 rows
        # Received block with 34591 rows
```

#### Pandas の DataFrame をストリーミングする \\{#stream-pandas-dataframes\\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Stream query results as Pandas DataFrames
with client.query_df_stream("SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000") as stream:
    for df in stream:
        # Process each DataFrame block
        print(f"Received DataFrame with {len(df)} rows")
        print(df.head(3))
        # Output:
        # Received DataFrame with 65409 rows
        #    number str
        # 0       0   0
        # 1       1   1
        # 2       2   2
        # Received DataFrame with 34591 rows
        #    number    str
        # 0   65409  65409
        # 1   65410  65410
        # 2   65411  65411
```

#### Arrow バッチのストリーミング \\{#stream-arrow-batches\\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Stream query results as Arrow record batches
with client.query_arrow_stream("SELECT * FROM large_table") as stream:
    for arrow_batch in stream:
        # Process each Arrow batch
        print(f"Received Arrow batch with {arrow_batch.num_rows} rows")
        # Output:
        # Received Arrow batch with 65409 rows
        # Received Arrow batch with 34591 rows
```

## NumPy、Pandas、Arrow クエリ \\{#numpy-pandas-and-arrow-queries\\}

ClickHouse Connect は、NumPy、Pandas、Arrow のデータ構造を扱うための専用クエリメソッドを提供します。これらのメソッドを使用すると、手動で変換することなく、クエリ結果をこれらの広く利用されているデータ形式で直接取得できます。

### NumPy クエリ \\{#numpy-queries\\}

`query_np` メソッドは、クエリ結果を ClickHouse Connect の `QueryResult` ではなく、NumPy の配列として返します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Query returns a NumPy array
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(np_array))
# Output:
# <class "numpy.ndarray">

print(np_array)
# Output:
# [[0 0]
#  [1 2]
#  [2 4]
#  [3 6]
#  [4 8]]
```

### Pandas クエリ \\{#pandas-queries\\}

`query_df` メソッドは、ClickHouse Connect の `QueryResult` ではなく、Pandas の DataFrame としてクエリ結果を返します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Query returns a Pandas DataFrame
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")

print(type(df))
# Output: <class "pandas.core.frame.DataFrame">
print(df)
# Output:
#    number  doubled
# 0       0        0
# 1       1        2
# 2       2        4
# 3       3        6
# 4       4        8
```

### PyArrow クエリ \\{#pyarrow-queries\\}

`query_arrow` メソッドは、クエリ結果を PyArrow テーブルとして返します。ClickHouse の `Arrow` フォーマットを直接利用するため、メインの `query` メソッドと共通する引数は `query`、`parameters`、`settings` の 3 つのみです。さらに、`use_strings` という追加の引数があり、Arrow テーブルが ClickHouse の String 型を文字列（True の場合）として扱うか、バイト列（False の場合）として扱うかを制御します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Query returns a PyArrow Table
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

print(type(arrow_table))
# Output:
# <class "pyarrow.lib.Table">

print(arrow_table)
# Output:
# pyarrow.Table
# number: uint64 not null
# str: string not null
# ----
# number: [[0,1,2]]
# str: [["0","1","2"]]
```

### Arrow バックエンド DataFrame \\{#arrow-backed-dataframes\\}

ClickHouse Connect は、`query_df_arrow` メソッドと `query_df_arrow_stream` メソッドを通じて、Arrow の結果から高速かつメモリ効率の高い DataFrame の作成をサポートします。これらは Arrow クエリメソッドの薄いラッパーであり、可能な場合にはゼロコピーで DataFrame に変換します。

- `query_df_arrow`: ClickHouse の `Arrow` 出力フォーマットを使用してクエリを実行し、DataFrame を返します。
  - `dataframe_library='pandas'` の場合、Arrow バックエンドの dtype（`pd.ArrowDtype`）を使用する pandas 2.x の DataFrame を返します。これは pandas 2.x を必要とし、可能な限りゼロコピーバッファを活用することで、優れたパフォーマンスと低いメモリオーバーヘッドを実現します。
  - `dataframe_library='polars'` の場合、Arrow テーブル（`pl.from_arrow`）から作成された Polars DataFrame を返します。これも同様に効率的であり、データに応じてゼロコピーになることがあります。
- `query_df_arrow_stream`: Arrow のストリームバッチから変換された DataFrame（pandas 2.x または Polars）のシーケンスとして結果をストリーミングします。

#### Arrow バックエンドの DataFrame へのクエリ \\{#query-to-arrow-backed-dataframe\\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Query returns a Pandas DataFrame with Arrow dtypes (requires pandas 2.x)
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)

print(df.dtypes)
# Output:
# number    uint64[pyarrow]
# str       string[pyarrow]
# dtype: object

# Or use Polars
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)
# Output:
# [UInt64, String]


# Streaming into batches of DataFrames (polars shown)
with client.query_df_arrow_stream(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
    for df_batch in stream:
        print(f"Received {type(df_batch)} batch with {len(df_batch)} rows and dtypes: {df_batch.dtypes}")
        # Output:
        # Received <class 'polars.dataframe.frame.DataFrame'> batch with 65409 rows and dtypes: [UInt64, String]
        # Received <class 'polars.dataframe.frame.DataFrame'> batch with 34591 rows and dtypes: [UInt64, String]
```

#### 注意事項と補足 \\{#notes-and-caveats\\}

- Arrow 型のマッピング: データを Arrow フォーマットで返す際、ClickHouse は型をサポートされている最も近い Arrow 型にマッピングします。一部の ClickHouse 型にはネイティブな Arrow の対応型がなく、その場合は Arrow フィールド内で生のバイト列として返されます（通常は `BINARY` または `FIXED_SIZE_BINARY`）。
  - 例: `IPv4` は Arrow の `UINT32` として表現されます。`IPv6` と大きな整数（`Int128/UInt128/Int256/UInt256`）は、多くの場合、生のバイト列を格納した `FIXED_SIZE_BINARY`/`BINARY` として表現されます。
  - このような場合、DataFrame のカラムには、その背後で Arrow フィールドによりバッキングされたバイト値が格納されます。これらのバイトを ClickHouse のセマンティクスに従って解釈・変換するかどうかは、クライアントコード側の責任です。
- 非対応の Arrow データ型（例: 真の Arrow 型としての UUID/ENUM）は出力されません。その値は、出力用にサポートされている最も近い Arrow 型（多くの場合バイナリのバイト列）として表現されます。
- pandas の要件: Arrow バックエンドの dtype を利用するには pandas 2.x が必要です。古いバージョンの pandas を使用している場合は、代わりに `query_df`（非 Arrow）を使用してください。
- 文字列とバイナリ: `use_strings` オプション（サーバー設定 `output_format_arrow_string_as_string` でサポートされている場合）は、ClickHouse の `String` カラムを Arrow の文字列として返すか、バイナリとして返すかを制御します。

#### 型が一致しない ClickHouse/Arrow 変換の例 \\{#mismatched-clickhousearrow-type-conversion-examples\\}

ClickHouse がカラムを生のバイナリデータ（例: `FIXED_SIZE_BINARY` や `BINARY`）として返す場合、これらのバイト列を適切な Python 型へ変換する責任はアプリケーションコード側にあります。以下の例は、いくつかの変換は DataFrame ライブラリの API を使って実現可能である一方、他の変換については `struct.unpack` のような純粋な Python の手法が必要になる場合があることを示します（これはパフォーマンスを犠牲にしますが、柔軟性を維持できます）。

`Date` カラムは `UINT16`（Unix エポック 1970‑01‑01 からの日数）として返されることがあります。DataFrame 内での変換は効率的かつ容易です。

```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))

# Pandas
df["event_date"] = pd.to_datetime(df["event_date"], unit="D")
```

`Int128` のような列は、生のバイト列を持つ `FIXED_SIZE_BINARY` として読み込まれる場合があります。Polars は 128 ビット整数をネイティブにサポートしています。

```python
# Polars - native support
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

NumPy 2.3 の時点では公開されている 128 ビット整数の dtype が存在しないため、純粋な Python にフォールバックする必要があり、次のようにできます。

```python
# Assuming we have a pandas dataframe with an Int128 column of dtype fixed_size_binary[16][pyarrow]

print(df)
# Output:
#   str_col                                        int_128_col
# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00...
# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00...
# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x...

print([int.from_bytes(n, byteorder="little") for n in df["int_128_col"].to_list()])
# Output:
# [1234567898765432123456789, 8, 456789123456789]
```

重要なポイントは、アプリケーションコードは、選択した DataFrame ライブラリの機能と許容可能なパフォーマンス上のトレードオフに基づいて、これらの変換を処理しなければならないということです。DataFrame ネイティブな変換が利用できない場合は、純粋な Python ベースのアプローチが引き続き選択肢として残ります。

## 読み取りフォーマット \\{#read-formats\\}

読み取りフォーマットは、クライアントの `query`、`query_np`、`query_df` メソッドから返される値のデータ型を制御します（`raw_query` と `query_arrow` は ClickHouse から受信したデータを変更しないため、フォーマット制御は適用されません）。たとえば、UUID の読み取りフォーマットをデフォルトの `native` フォーマットから代替の `string` フォーマットに変更すると、UUID 型カラムに対する ClickHouse のクエリ結果は、Python の UUID オブジェクトではなく、（標準的な 8-4-4-4-12 の RFC 1422 形式を使用した）文字列値として返されます。

任意のフォーマット関数の &quot;data type&quot; 引数にはワイルドカードを含めることができます。フォーマット指定は、小文字のみから成る 1 つの文字列です。

読み取りフォーマットは複数のレベルで設定できます：

* `clickhouse_connect.datatypes.format` パッケージで定義されているメソッドを使用してグローバルに設定します。これにより、すべてのクエリで指定したデータ型のフォーマットが制御されます。

```python
from clickhouse_connect.datatypes.format import set_read_format

# Return both IPv6 and IPv4 values as strings
set_read_format('IPv*', 'string')

# Return all Date types as the underlying epoch second or epoch day
set_read_format('Date*', 'int')
```

* クエリ全体に対してオプションの `query_formats` 辞書引数を使用する方法。この場合、指定したデータ型の任意の列（またはサブカラム）には、設定されたフォーマットが適用されます。

```python
# Return any UUID column as a string
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
```

* 特定のカラム内の値に対しては、オプションの `column_formats` 辞書引数を使用します。キーには ClickHouse が返すカラム名を指定し、値にはデータカラム用のフォーマット、または ClickHouse の型名をキー、クエリフォーマットを値とする第2レベルの「format」辞書を指定します。この第2レベルの辞書は、Tuple や Map のようなネストされたカラム型に対して使用できます。

```python
# Return IPv6 values in the `dev_address` column as strings
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### 読み取りフォーマットオプション（Python 型） \\{#read-format-options-python-types\\}

| ClickHouse Type       | Native Python Type      | Read Formats      | Comments                                                                                                          |
|-----------------------|-------------------------|-------------------|-------------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                   |
| UInt64                | int                     | signed            | Superset は現在、大きな符号なし UInt64 値を扱えません                                                            |
| [U]Int[128,256]       | int                     | string            | Pandas および NumPy の int 値は最大 64 ビットであるため、これらは文字列として返されることがあります             |
| BFloat16              | float                   | -                 | Python の float 型はすべて内部的には 64 ビットです                                                               |
| Float32               | float                   | -                 | Python の float 型はすべて内部的には 64 ビットです                                                               |
| Float64               | float                   | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                   |
| String                | string                  | bytes             | ClickHouse の String カラムには固有のエンコーディングがないため、可変長バイナリデータにも使用されます            |
| FixedString           | bytes                   | string            | FixedString は固定サイズのバイト配列ですが、Python の文字列として扱われる場合があります                         |
| Enum[8,16]            | string                  | string, int       | Python の enum は空文字列を受け付けないため、すべての enum は文字列またはその基盤となる int 値として表現されます |
| Date                  | datetime.date           | int               | ClickHouse は Date を 1970/01/01 からの日数として保存します。この値は int として利用できます                     |
| Date32                | datetime.date           | int               | Date と同様ですが、より広い日付範囲に対応します                                                                   |
| DateTime              | datetime.datetime       | int               | ClickHouse は DateTime をエポック秒として保存します。この値は int として利用できます                             |
| DateTime64            | datetime.datetime       | int               | Python の datetime.datetime はマイクロ秒精度までに制限されます。生の 64 ビット int 値を利用できます              |
| Time                  | datetime.timedelta      | int, string, time | 時刻は Unix タイムスタンプとして保存されます。この値は int として利用できます                                    |
| Time64                | datetime.timedelta      | int, string, time | Python の datetime.timedelta はマイクロ秒精度までに制限されます。生の 64 ビット int 値を利用できます             |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP アドレスは文字列として読み取ることができ、適切にフォーマットされた文字列は IP アドレスとして挿入できます       |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP アドレスは文字列として読み取ることができ、適切にフォーマットされたものは IP アドレスとして挿入できます        |
| Tuple                 | dict or tuple           | tuple, json       | 名前付きタプルはデフォルトで辞書として返されます。名前付きタプルは JSON 文字列として返すこともできます          |
| Map                   | dict                    | -                 |                                                                                                                   |
| Nested                | Sequence[dict]          | -                 |                                                                                                                   |
| UUID                  | uuid.UUID               | string            | UUID は RFC 4122 に従ってフォーマットされた文字列として読み取ることができます<br/>                               |
| JSON                  | dict                    | string            | デフォルトでは Python の辞書が返されます。`string` フォーマットでは JSON 文字列が返されます                     |
| Variant               | object                  | -                 | 値に保存されている ClickHouse データ型に対応する Python 型を返します                                             |
| Dynamic               | object                  | -                 | 値に保存されている ClickHouse データ型に対応する Python 型を返します                                             |

## 外部データ \\{#external-data\\}

ClickHouse のクエリは、任意の ClickHouse 対応フォーマットの外部データを受け付けることができます。このバイナリデータは、データ処理に使用するためにクエリ文字列と一緒に送信されます。External Data 機能の詳細については[こちら](/engines/table-engines/special/external-data.md)を参照してください。クライアントの `query*` メソッドは、この機能を利用するためにオプションの `external_data` パラメータを受け付けます。`external_data` パラメータの値は `clickhouse_connect.driver.external.ExternalData` オブジェクトである必要があります。このオブジェクトのコンストラクタは、次の引数を受け付けます:

| Name          | Type              | Description                                                                |
| ------------- | ----------------- | -------------------------------------------------------------------------- |
| file&#95;path | str               | 外部データを読み込むローカルシステム上のファイルパス。`file_path` または `data` のいずれかが必須です               |
| file&#95;name | str               | 外部データ「ファイル」の名前。指定されない場合は、`file_path` から（拡張子を除いて）決定されます                     |
| data          | bytes             | （ファイルから読み込む代わりに）バイナリ形式の外部データ。`data` または `file_path` のいずれかが必須です             |
| fmt           | str               | データの ClickHouse [Input Format](/sql-reference/formats.mdx)。デフォルトは `TSV` です |
| types         | str or seq of str | 外部データ内の列データ型のリスト。文字列の場合は、型をカンマで区切ります。`types` または `structure` のいずれかが必須です    |
| structure     | str or seq of str | データ内の「列名 + データ型」のリスト（例を参照）。`structure` または `types` のいずれかが必須です              |
| mime&#95;type | str               | ファイルデータの省略可能な MIME タイプ。現在 ClickHouse はこの HTTP サブヘッダーを無視します                 |

&quot;movie&quot; データを含む外部 CSV ファイルをクエリと共に送信し、そのデータを ClickHouse サーバー上に既に存在する `directors` テーブルと結合するには:

```python
import clickhouse_connect
from clickhouse_connect.driver.external import ExternalData

client = clickhouse_connect.get_client()
ext_data = ExternalData(file_path='/data/movies.csv',
                        fmt='CSV',
                        structure=['movie String', 'year UInt16', 'rating Decimal32(3)', 'director String'])
result = client.query('SELECT name, avg(rating) FROM directors INNER JOIN movies ON directors.name = movies.director GROUP BY directors.name',
                      external_data=ext_data).result_rows
```

追加の外部データファイルは、コンストラクタと同じパラメータを受け取る `add_file` メソッドを使用して、最初に作成した `ExternalData` オブジェクトに追加できます。HTTPの場合、すべての外部データは `multipart/form-data` によるファイルアップロードの一部として送信されます。

## タイムゾーン \\{#time-zones\\}

ClickHouse の DateTime および DateTime64 値にタイムゾーンを適用する方法はいくつかあります。内部的には、ClickHouse サーバーはすべての DateTime および `DateTime64` オブジェクトを、「エポック (1970-01-01 00:00:00 UTC) からの経過秒数」を表すタイムゾーン情報を持たない数値として常に保存します。`DateTime64` 値の場合、その表現は精度に応じて、エポックからのミリ秒数、マイクロ秒数、またはナノ秒数になります。その結果、タイムゾーン情報の適用は常にクライアント側で行われます。これは無視できない追加計算を伴うため、性能が重要なアプリケーションでは、ユーザーへの表示や変換の場合を除き、DateTime 型はエポックタイムスタンプとして扱うことを推奨します (たとえば Pandas の Timestamps は、性能向上のため常にエポックナノ秒を表す 64 ビット整数です)。

クエリでタイムゾーン対応データ型を使用する場合、特に Python の `datetime.datetime` オブジェクトを使用する場合、`clickhouse-connect` は次の優先順位ルールに従ってクライアント側のタイムゾーンを適用します。

1. クエリのメソッド引数 `client_tzs` が指定されている場合、その特定カラムのタイムゾーンが適用される
2. ClickHouse カラムにタイムゾーンのメタデータがある場合 (たとえば DateTime64(3, 'America/Denver') のような型)、ClickHouse カラムのタイムゾーンが適用される。(なお、このタイムゾーンメタデータは、ClickHouse バージョン 23.2 より前の DateTime カラムに対しては clickhouse-connect からは利用できません)
3. クエリのメソッド引数 `query_tz` が指定されている場合、「クエリタイムゾーン」が適用される。
4. クエリまたはセッションにタイムゾーン設定が適用されている場合、そのタイムゾーンが適用される。(この機能はまだ ClickHouse サーバーではリリースされていません)
5. 最後に、クライアントの `apply_server_timezone` パラメータが True (デフォルト) に設定されている場合、ClickHouse サーバーのタイムゾーンが適用される。

これらのルールに基づいて適用されるタイムゾーンが UTC の場合、`clickhouse-connect` は _常に_ タイムゾーン情報を持たない Python の `datetime.datetime` オブジェクトを返すことに注意してください。必要であれば、その後アプリケーションコードによって、このタイムゾーン情報を持たないオブジェクトに追加のタイムゾーン情報を付与できます。