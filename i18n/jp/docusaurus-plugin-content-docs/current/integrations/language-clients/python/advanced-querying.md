---
sidebar_label: '高度なクエリ操作'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: 'ClickHouse Connect を用いた高度なクエリ操作'
slug: /integrations/language-clients/python/advanced-querying
title: '高度なクエリ操作'
doc_type: 'reference'
---



# ClickHouse Connectによるデータクエリ: 高度な使用法 {#querying-data-with-clickhouse-connect--advanced-usage}


## QueryContext {#querycontexts}

ClickHouse Connectは、`QueryContext`内で標準クエリを実行します。`QueryContext`には、ClickHouseデータベースに対するクエリの構築に使用される主要な構造と、結果を`QueryResult`やその他のレスポンスデータ構造に処理するための設定が含まれます。具体的には、クエリ本体、パラメータ、設定、読み取りフォーマット、その他のプロパティが含まれます。

`QueryContext`は、クライアントの`create_query_context`メソッドを使用して取得できます。このメソッドは、コアクエリメソッドと同じパラメータを受け取ります。取得したクエリコンテキストは、`query`、`query_df`、または`query_np`メソッドに`context`キーワード引数として渡すことができ、これらのメソッドの他の引数の一部または全部の代わりに使用できます。なお、メソッド呼び出し時に指定された追加の引数は、QueryContextのプロパティを上書きします。

`QueryContext`の最も明確な使用例は、異なるバインディングパラメータ値で同じクエリを送信する場合です。すべてのパラメータ値は、辞書を指定して`QueryContext.set_parameters`メソッドを呼び出すことで更新でき、個別の値は、目的の`key`と`value`のペアを指定して`QueryContext.set_parameter`を呼び出すことで更新できます。

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

なお、`QueryContext`はスレッドセーフではありませんが、マルチスレッド環境では`QueryContext.updated_copy`メソッドを呼び出すことでコピーを取得できます。


## ストリーミングクエリ {#streaming-queries}

ClickHouse Connect Clientは、ストリーム（Pythonジェネレータとして実装）としてデータを取得するための複数のメソッドを提供します：

- `query_column_block_stream` -- ネイティブPythonオブジェクトを使用して、クエリデータをカラムのシーケンスとしてブロック単位で返します
- `query_row_block_stream` -- ネイティブPythonオブジェクトを使用して、クエリデータを行のブロックとして返します
- `query_rows_stream` -- ネイティブPythonオブジェクトを使用して、クエリデータを行のシーケンスとして返します
- `query_np_stream` -- 各ClickHouseブロックのクエリデータをNumPy配列として返します
- `query_df_stream` -- 各ClickHouseブロックのクエリデータをPandas DataFrameとして返します
- `query_arrow_stream` -- クエリデータをPyArrow RecordBlocksとして返します
- `query_df_arrow_stream` -- 各ClickHouseブロックのクエリデータを、kwarg `dataframe_library`（デフォルトは"pandas"）に応じて、Arrow基盤のPandas DataFrameまたはPolars DataFrameとして返します

これらのメソッドはそれぞれ`ContextStream`オブジェクトを返し、ストリームの消費を開始するには`with`文で開く必要があります。

### データブロック {#data-blocks}

ClickHouse Connectは、主要な`query`メソッドからのすべてのデータを、ClickHouseサーバーから受信したブロックのストリームとして処理します。これらのブロックは、ClickHouseとの間でカスタムの"Native"形式で送受信されます。「ブロック」とは、バイナリデータのカラムのシーケンスであり、各カラムには指定されたデータ型のデータ値が同数含まれています（カラム型データベースとして、ClickHouseはこのデータを同様の形式で保存します）。クエリから返されるブロックのサイズは、複数のレベル（ユーザープロファイル、ユーザー、セッション、またはクエリ）で設定できる2つのユーザー設定によって制御されます：

- [max_block_size](/operations/settings/settings#max_block_size) -- 行数でのブロックサイズの上限。デフォルトは65536です。
- [preferred_block_size_bytes](/operations/settings/settings#preferred_block_size_bytes) -- バイト数でのブロックサイズのソフトリミット。デフォルトは1,000,0000です。

`preferred_block_size_setting`に関係なく、各ブロックは`max_block_size`行を超えることはありません。クエリの種類によっては、実際に返されるブロックは任意のサイズになる可能性があります。たとえば、多数のシャードをカバーする分散テーブルへのクエリでは、各シャードから直接取得された小さなブロックが含まれる場合があります。

Clientの`query_*_stream`メソッドのいずれかを使用する場合、結果はブロック単位で返されます。ClickHouse Connectは一度に1つのブロックのみをロードします。これにより、大規模な結果セット全体をメモリにロードすることなく、大量のデータを処理できます。アプリケーションは任意の数のブロックを処理できるように準備する必要があり、各ブロックの正確なサイズは制御できないことに注意してください。

### 低速処理のためのHTTPデータバッファ {#http-data-buffer-for-slow-processing}

HTTPプロトコルの制限により、ClickHouseサーバーがデータをストリーミングする速度よりも大幅に遅い速度でブロックが処理される場合、ClickHouseサーバーは接続を閉じ、処理スレッドで例外がスローされます。この問題の一部は、共通の`http_buffer_size`設定を使用してHTTPストリーミングバッファのバッファサイズ（デフォルトは10メガバイト）を増やすことで軽減できます。アプリケーションに十分なメモリが利用可能であれば、この状況では大きな`http_buffer_size`値でも問題ありません。`lz4`または`zstd`圧縮を使用している場合、バッファ内のデータは圧縮された状態で保存されるため、これらの圧縮タイプを使用すると、利用可能な全体的なバッファが増加します。

### StreamContexts {#streamcontexts}

各`query_*_stream`メソッド（`query_row_block_stream`など）は、ClickHouseの`StreamContext`オブジェクトを返します。これはPythonのコンテキストとジェネレータを組み合わせたものです。基本的な使用方法は次のとおりです：

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <Pythonのトリップデータの各行で何かを実行>
```

`with`文なしでStreamContextを使用しようとするとエラーが発生することに注意してください。Pythonコンテキストを使用することで、すべてのデータが消費されない場合や処理中に例外が発生した場合でも、ストリーム（この場合はストリーミングHTTPレスポンス）が適切に閉じられることが保証されます。また、`StreamContext`はストリームを消費するために一度しか使用できません。終了後に`StreamContext`を使用しようとすると、`StreamClosedError`が発生します。

`StreamContext`の`source`プロパティを使用して、カラム名と型を含む親の`QueryResult`オブジェクトにアクセスできます。

### ストリームタイプ {#stream-types}


`query_column_block_stream` メソッドは、ネイティブPythonデータ型として格納されたカラムデータのシーケンスとしてブロックを返します。上記の `taxi_trips` クエリを使用した場合、返されるデータはリストとなり、リストの各要素は関連するカラムのすべてのデータを含む別のリスト(またはタプル)になります。したがって、`block[0]` は文字列のみを含むタプルになります。カラム指向形式は、カラム内のすべての値に対する集計操作(運賃の合計など)を行う際に最もよく使用されます。

`query_row_block_stream` メソッドは、従来のリレーショナルデータベースのように、行のシーケンスとしてブロックを返します。タクシー乗車データの場合、返されるデータはリストとなり、リストの各要素はデータの1行を表す別のリストになります。したがって、`block[0]` には最初のタクシー乗車のすべてのフィールド(順序通り)が含まれ、`block[1]` には2番目のタクシー乗車のすべてのフィールドが含まれる、といった具合になります。行指向の結果は、通常、表示や変換処理に使用されます。

`query_row_stream` は、ストリームを反復処理する際に自動的に次のブロックに移動する便利なメソッドです。それ以外は `query_row_block_stream` と同一です。

`query_np_stream` メソッドは、各ブロックを2次元のNumPy配列として返します。内部的には、NumPy配列は(通常)カラムとして格納されるため、行やカラムを区別するメソッドは必要ありません。NumPy配列の「shape」は(カラム数、行数)として表現されます。NumPyライブラリは、NumPy配列を操作するための多くのメソッドを提供しています。なお、クエリ内のすべてのカラムが同じNumPy dtypeを共有している場合、返されるNumPy配列も1つのdtypeのみを持ち、内部構造を実際に変更することなく再形成や回転が可能です。

`query_df_stream` メソッドは、各ClickHouseブロックを2次元のPandas DataFrameとして返します。以下は、`StreamContext` オブジェクトを遅延的にコンテキストとして使用できる(ただし1回のみ)ことを示す例です。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <pandas DataFrameで何かを行う>
```

`query_df_arrow_stream` メソッドは、各ClickHouseブロックをPyArrow dtypeバックエンドを持つDataFrameとして返します。このメソッドは、`dataframe_library` パラメータ(デフォルトは `"pandas"`)を介して、Pandas(2.x以降)とPolars DataFrameの両方をサポートします。各反復処理では、PyArrowレコードバッチから変換されたDataFrameが生成され、特定のデータ型に対してより優れたパフォーマンスとメモリ効率を提供します。

最後に、`query_arrow_stream` メソッドは、ClickHouseの `ArrowStream` 形式の結果を、`StreamContext` でラップされた `pyarrow.ipc.RecordBatchStreamReader` として返します。ストリームの各反復処理では、PyArrow RecordBlockが返されます。

### ストリーミングの例 {#streaming-examples}

#### 行のストリーミング {#stream-rows}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# 大きな結果セットを行ごとにストリーミングする

with client.query&#95;rows&#95;stream(&quot;SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000&quot;) as stream:
for row in stream:
print(row)  # 各行を処理

# 出力:

# (0, 0)

# (1, 2)

# (2, 4)

# ....

````

#### 行ブロックのストリーミング {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 行をブロック単位でストリーミングする（1 行ずつより効率的）

with client.query&#95;row&#95;block&#95;stream(&quot;SELECT number, number * 2 FROM system.numbers LIMIT 100000&quot;) as stream:
for block in stream:
print(f&quot;Received block with {len(block)} rows&quot;)

# 出力:

# Received block with 65409 rows

# Received block with 34591 rows

````

#### Pandas DataFrameのストリーミング {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# クエリ結果を Pandas DataFrame としてストリーム処理する

with client.query&#95;df&#95;stream(&quot;SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000&quot;) as stream:
for df in stream:

# 各 DataFrame ブロックを処理する

print(f&quot;Received DataFrame with {len(df)} rows&quot;)
print(df.head(3))

# 出力:

# Received DataFrame with 65409 rows

# number str

# 0       0   0

# 1       1   1

# 2       2   2

# Received DataFrame with 34591 rows

# number    str

# 0   65409  65409

# 1   65410  65410

# 2   65411  65411

````

#### Arrowバッチのストリーム {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# クエリ結果を Arrow レコードバッチとしてストリーミングする

with client.query&#95;arrow&#95;stream(&quot;SELECT * FROM large&#95;table&quot;) as stream:
for arrow&#95;batch in stream:

# 各 Arrow バッチを処理する

print(f&quot;Received Arrow batch with {arrow_batch.num_rows} rows&quot;)

# 出力:

# Received Arrow batch with 65409 rows

# Received Arrow batch with 34591 rows

```
```


## NumPy、Pandas、Arrowクエリ {#numpy-pandas-and-arrow-queries}

ClickHouse Connectは、NumPy、Pandas、Arrowのデータ構造を扱うための専用クエリメソッドを提供します。これらのメソッドを使用することで、手動変換を行うことなく、これらの一般的なデータ形式でクエリ結果を直接取得できます。

### NumPyクエリ {#numpy-queries}

`query_np`メソッドは、ClickHouse Connectの`QueryResult`ではなく、NumPy配列としてクエリ結果を返します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

```


# クエリが NumPy 配列を返す
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(np_array))

# 出力:

# <class "numpy.ndarray">


print(np&#95;array)

# 出力:

# [[0 0]

# [1 2]

# [2 4]

# [3 6]

# [4 8]]

````

### Pandas クエリ {#pandas-queries}

`query_df` メソッドは、ClickHouse Connect の `QueryResult` ではなく、クエリ結果を Pandas DataFrame として返します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# クエリが Pandas の DataFrame を返す
df = client.query_df("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(df))

# 出力: <class "pandas.core.frame.DataFrame">

print(df)

# 出力:

# number doubled

# 0 0 0

# 1 1 2

# 2 2 4

# 3 3 6

# 4 4 8

````

### PyArrowクエリ {#pyarrow-queries}

`query_arrow`メソッドは、クエリ結果をPyArrow Tableとして返します。ClickHouseの`Arrow`形式を直接利用するため、メインの`query`メソッドと共通する引数は`query`、`parameters`、`settings`の3つのみです。加えて、`use_strings`という追加の引数があり、これはArrow TableがClickHouseのString型を文字列として表示するか(Trueの場合)、バイト列として表示するか(Falseの場合)を決定します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# クエリは PyArrow Table を返す
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")



print(type(arrow_table))

# 出力:

# <class "pyarrow.lib.Table">


print(arrow&#95;table)

# 出力:

# pyarrow.Table

# number: uint64 not null

# str: string not null

# ----

# number: [[0,1,2]]

# str: [[&quot;0&quot;,&quot;1&quot;,&quot;2&quot;]]

````

### Arrowベースのデータフレーム {#arrow-backed-dataframes}

ClickHouse Connectは、`query_df_arrow`および`query_df_arrow_stream`メソッドを使用して、Arrow結果から高速かつメモリ効率の高いデータフレームの作成をサポートしています。これらはArrowクエリメソッドの薄いラッパーであり、可能な限りゼロコピー変換を実行してデータフレームを生成します。

- `query_df_arrow`: ClickHouseの`Arrow`出力形式を使用してクエリを実行し、データフレームを返します。
  - `dataframe_library='pandas'`の場合、Arrowベースのdtype（`pd.ArrowDtype`）を使用したpandas 2.xデータフレームを返します。pandas 2.xが必要で、可能な限りゼロコピーバッファを活用することで、優れたパフォーマンスと低メモリオーバーヘッドを実現します。
  - `dataframe_library='polars'`の場合、Arrowテーブルから作成されたPolarsデータフレーム（`pl.from_arrow`）を返します。同様に効率的で、データに応じてゼロコピーが可能です。
- `query_df_arrow_stream`: Arrowストリームバッチから変換されたデータフレーム（pandas 2.xまたはPolars）のシーケンスとして結果をストリーミングします。

#### Arrowベースのデータフレームへのクエリ {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# クエリは Arrow の dtype を持つ Pandas DataFrame を返します（pandas 2.x が必要）
df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)



print(df.dtypes)
# 出力例:
# number    uint64[pyarrow]
# str       string[pyarrow]
# dtype: object



# または Polars を使う
polars_df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="polars"
)
print(df.dtypes)
# 出力:
# [UInt64, String]




# DataFrameのバッチへのストリーミング（polarsの例）

with client.query_df_arrow_stream(
"SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000", dataframe_library="polars"
) as stream:
for df_batch in stream:
print(f"{type(df_batch)} バッチを受信しました。行数: {len(df_batch)}、dtypes: {df_batch.dtypes}") # Output: # Received <class 'polars.dataframe.frame.DataFrame'> batch with 65409 rows and dtypes: [UInt64, String] # Received <class 'polars.dataframe.frame.DataFrame'> batch with 34591 rows and dtypes: [UInt64, String]

```

#### 注意事項と制限事項 {#notes-and-caveats}
- Arrow型マッピング: Arrow形式でデータを返す際、ClickHouseは型を最も近いサポート対象のArrow型にマッピングします。一部のClickHouse型にはネイティブなArrow相当型が存在せず、Arrowフィールド内で生バイトとして返されます（通常は`BINARY`または`FIXED_SIZE_BINARY`）。
  - 例: `IPv4`はArrowの`UINT32`として表現されます。`IPv6`および大きな整数型（`Int128/UInt128/Int256/UInt256`）は、多くの場合生バイトを含む`FIXED_SIZE_BINARY`/`BINARY`として表現されます。
  - これらの場合、DataFrameの列にはArrowフィールドに基づくバイト値が含まれます。これらのバイトをClickHouseのセマンティクスに従って解釈・変換するのはクライアントコードの責任となります。
- サポートされていないArrowデータ型（例: 真のArrow型としてのUUID/ENUM）は出力されません。値は出力時に最も近いサポート対象のArrow型（多くの場合バイナリバイト）を使用して表現されます。
- Pandasの要件: Arrowベースのdtypesにはpandas 2.xが必要です。古いバージョンのpandasを使用する場合は、代わりに`query_df`（非Arrow）を使用してください。
- 文字列 vs バイナリ: `use_strings`オプション（サーバー設定`output_format_arrow_string_as_string`でサポートされている場合）は、ClickHouseの`String`列をArrow文字列として返すか、バイナリとして返すかを制御します。

#### ClickHouse/Arrow型変換の不一致の例 {#mismatched-clickhousearrow-type-conversion-examples}

ClickHouseが列を生バイナリデータ（例: `FIXED_SIZE_BINARY`または`BINARY`）として返す場合、これらのバイトを適切なPython型に変換するのはアプリケーションコードの責任となります。以下の例は、一部の変換がDataFrameライブラリのAPIを使用して実現可能である一方、他の変換では`struct.unpack`のような純粋なPythonアプローチが必要になる場合があることを示しています（パフォーマンスは犠牲になりますが、柔軟性は維持されます）。

```


`Date` 列は `UINT16`（Unix エポック（1970‑01‑01）からの日数）として届く場合があります。DataFrame 内での変換は効率的かつ簡単です。

```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))
```


# Pandas

df[&quot;event&#95;date&quot;] = pd.to&#95;datetime(df[&quot;event&#95;date&quot;], unit=&quot;D&quot;)

```
```


`Int128` のようなカラムは、生のバイト列を含む `FIXED_SIZE_BINARY` として渡される場合があります。Polars は 128 ビット整数をネイティブにサポートしています。

```python
# Polars - ネイティブサポート
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

NumPy 2.3 の時点では公開されている 128 ビット整数 dtype が存在しないため、純粋な Python にフォールバックする必要があり、次のように記述できます。


```python
# dtype が fixed_size_binary[16][pyarrow] の Int128 カラムを持つ pandas DataFrame があると仮定します
```


print(df)
# 出力:
#   str_col                                        int_128_col
# 0    num1  b'\\x15}\\xda\\xeb\\x18ZU\\x0fn\\x05\\x01\\x00\\x00\\x00...
# 1    num2  b'\\x08\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00...
# 2    num3  b'\\x15\\xdfp\\x81r\\x9f\\x01\\x00\\x00\\x00\\x00\\x00\\x...



print([int.from&#95;bytes(n, byteorder=&quot;little&quot;) for n in df[&quot;int&#95;128&#95;col&quot;].to&#95;list()])

# 出力:

# [1234567898765432123456789, 8, 456789123456789]

```

重要なポイント：アプリケーションコードは、選択したDataFrameライブラリの機能と許容可能なパフォーマンストレードオフに基づいて、これらの変換を処理する必要があります。DataFrameネイティブの変換が利用できない場合、純粋なPythonによるアプローチも選択肢として利用できます。
```


## 読み取りフォーマット {#read-formats}

読み取りフォーマットは、クライアントの`query`、`query_np`、`query_df`メソッドから返される値のデータ型を制御します。(`raw_query`と`query_arrow`はClickHouseからの受信データを変更しないため、フォーマット制御は適用されません。)例えば、UUIDの読み取りフォーマットをデフォルトの`native`フォーマットから代替の`string`フォーマットに変更すると、`UUID`カラムに対するClickHouseクエリの結果は、PythonのUUIDオブジェクトではなく、文字列値(標準的な8-4-4-4-12のRFC 1422フォーマットを使用)として返されます。

任意のフォーマット関数の「data type」引数にはワイルドカードを含めることができます。フォーマットは単一の小文字文字列です。

読み取りフォーマットは複数のレベルで設定できます:

- グローバルレベル: `clickhouse_connect.datatypes.format`パッケージで定義されたメソッドを使用します。これにより、すべてのクエリに対して設定されたデータ型のフォーマットが制御されます。

```python
from clickhouse_connect.datatypes.format import set_read_format

```


# IPv6 と IPv4 の両方の値を文字列として返す
set_read_format('IPv*', 'string')



# すべてのDate型を基底のエポック秒またはエポック日として返す

set_read_format('Date\*', 'int')

````
- クエリ全体に対して、オプションの`query_formats`辞書引数を使用します。この場合、指定されたデータ型の任意のカラム(またはサブカラム)が設定されたフォーマットを使用します。
```python
# すべてのUUIDカラムを文字列として返す
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
````

- 特定のカラムの値に対して、オプションの`column_formats`辞書引数を使用します。キーはClickHouseが返すカラム名であり、データカラムのフォーマット、またはClickHouse型名とクエリフォーマットの値を持つ第2レベルの"format"辞書を指定します。この第2レベルの辞書は、TupleやMapなどのネストされたカラム型に使用できます。

```python
# `dev_address`カラムのIPv6値を文字列として返す
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### 読み取りフォーマットオプション(Python型) {#read-format-options-python-types}

| ClickHouse型          | ネイティブPython型      | 読み取りフォーマット | コメント                                                                                                          |
| --------------------- | ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                                   |
| UInt64                | int                     | signed            | Supersetは現在、大きな符号なしUInt64値を処理できません                                                   |
| [U]Int[128,256]       | int                     | string            | PandasとNumPyのint値は最大64ビットであるため、これらは文字列として返すことができます                              |
| BFloat16              | float                   | -                 | すべてのPython floatは内部的に64ビットです                                                                          |
| Float32               | float                   | -                 | すべてのPython floatは内部的に64ビットです                                                                          |
| Float64               | float                   | -                 |                                                                                                                   |
| Decimal               | decimal.Decimal         | -                 |                                                                                                                   |
| String                | string                  | bytes             | ClickHouseのStringカラムには固有のエンコーディングがないため、可変長バイナリデータにも使用されます        |
| FixedString           | bytes                   | string            | FixedStringは固定サイズのバイト配列ですが、Python文字列として扱われることもあります                              |
| Enum[8,16]            | string                  | string, int       | Python enumは空文字列を受け付けないため、すべてのenumは文字列または基底のint値としてレンダリングされます |
| Date                  | datetime.date           | int               | ClickHouseはDateを1970年1月1日からの日数として保存します。この値はintとして利用できます                               |
| Date32                | datetime.date           | int               | Dateと同じですが、より広い日付範囲に対応します                                                                      |
| DateTime              | datetime.datetime       | int               | ClickHouseはDateTimeをエポック秒で保存します。この値はintとして利用できます                                    |
| DateTime64            | datetime.datetime       | int               | Python datetime.datetimeはマイクロ秒精度に制限されています。生の64ビットint値が利用できます               |
| Time                  | datetime.timedelta      | int, string, time | 時刻はUnixタイムスタンプとして保存されます。この値はintとして利用できます                                 |
| Time64                | datetime.timedelta      | int, string, time | Python datetime.timedeltaはマイクロ秒精度に制限されています。生の64ビットint値が利用できます              |
| IPv4                  | `ipaddress.IPv4Address` | string            | IPアドレスは文字列として読み取ることができ、適切にフォーマットされた文字列をIPアドレスとして挿入できます                |
| IPv6                  | `ipaddress.IPv6Address` | string            | IPアドレスは文字列として読み取ることができ、適切にフォーマットされた文字列をIPアドレスとして挿入できます                        |
| Tuple                 | dict or tuple           | tuple, json       | 名前付きタプルはデフォルトで辞書として返されます。名前付きタプルはJSON文字列としても返すことができます               |
| Map                   | dict                    | -                 |                                                                                                                   |
| Nested                | Sequence[dict]          | -                 |                                                                                                                   |
| UUID                  | uuid.UUID               | string            | UUIDはRFC 4122に従ってフォーマットされた文字列として読み取ることができます<br/>                                                       |
| JSON                  | dict                    | string            | デフォルトでPython辞書が返されます。`string`フォーマットはJSON文字列を返します                         |
| Variant               | object                  | -                 | 値に対して保存されたClickHouseデータ型に対応するPython型を返します                                 |
| Dynamic               | object                  | -                 | 値に対して保存されたClickHouseデータ型に対応するPython型を返します                                 |


## 外部データ {#external-data}

ClickHouseクエリは、任意のClickHouse形式で外部データを受け入れることができます。このバイナリデータは、データ処理に使用するためにクエリ文字列と共に送信されます。外部データ機能の詳細は[こちら](/engines/table-engines/special/external-data.md)を参照してください。クライアントの`query*`メソッドは、この機能を利用するためのオプションパラメータ`external_data`を受け入れます。`external_data`パラメータの値は、`clickhouse_connect.driver.external.ExternalData`オブジェクトである必要があります。このオブジェクトのコンストラクタは、以下の引数を受け入れます:

| Name      | Type              | Description                                                                                                                                   |
| --------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| file_path | str               | 外部データを読み込むローカルシステム上のファイルパス。`file_path`または`data`のいずれかが必須                              |
| file_name | str               | 外部データ「ファイル」の名前。指定されない場合は、`file_path`から(拡張子を除いて)決定される                           |
| data      | bytes             | バイナリ形式の外部データ(ファイルから読み込む代わりに使用)。`data`または`file_path`のいずれかが必須                                |
| fmt       | str               | データのClickHouse[入力形式](/sql-reference/formats.mdx)。デフォルトは`TSV`                                                      |
| types     | str or seq of str | 外部データ内のカラムデータ型のリスト。文字列の場合、型はカンマで区切る。`types`または`structure`のいずれかが必須 |
| structure | str or seq of str | データ内のカラム名+データ型のリスト(例を参照)。`structure`または`types`のいずれかが必須                                       |
| mime_type | str               | ファイルデータのオプションのMIMEタイプ。現在、ClickHouseはこのHTTPサブヘッダーを無視する                                                         |

「映画」データを含む外部CSVファイルを使用してクエリを送信し、そのデータをClickHouseサーバー上に既に存在する`directors`テーブルと結合する例:

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

追加の外部データファイルは、コンストラクタと同じパラメータを受け取る`add_file`メソッドを使用して、初期の`ExternalData`オブジェクトに追加できます。HTTPの場合、すべての外部データは`multipart/form-data`ファイルアップロードの一部として送信されます。


## タイムゾーン {#time-zones}

ClickHouseのDateTimeおよびDateTime64値にタイムゾーンを適用する仕組みは複数存在します。内部的には、ClickHouseサーバーは常にDateTimeまたは`DateTime64`オブジェクトを、エポック(1970-01-01 00:00:00 UTC)からの秒数を表すタイムゾーン非依存の数値として保存します。`DateTime64`値の場合、精度に応じて、エポックからのミリ秒、マイクロ秒、またはナノ秒として表現されます。その結果、タイムゾーン情報の適用は常にクライアント側で行われます。これには相応の追加計算が伴うため、パフォーマンスが重要なアプリケーションでは、ユーザー表示や変換を除き、DateTime型をエポックタイムスタンプとして扱うことを推奨します(例えば、Pandas Timestampsはパフォーマンス向上のため常にエポックナノ秒を表す64ビット整数です)。

クエリでタイムゾーン対応のデータ型を使用する場合、特にPythonの`datetime.datetime`オブジェクトを使用する場合、`clickhouse-connect`は以下の優先順位ルールに従ってクライアント側のタイムゾーンを適用します:

1. クエリメソッドパラメータ`client_tzs`がクエリに指定されている場合、特定のカラムのタイムゾーンが適用されます
2. ClickHouseカラムにタイムゾーンメタデータがある場合(例: DateTime64(3, 'America/Denver')のような型)、ClickHouseカラムのタイムゾーンが適用されます。(注: このタイムゾーンメタデータは、ClickHouseバージョン23.2より前のDateTimeカラムではclickhouse-connectで利用できません)
3. クエリメソッドパラメータ`query_tz`がクエリに指定されている場合、「クエリタイムゾーン」が適用されます。
4. クエリまたはセッションにタイムゾーン設定が適用されている場合、そのタイムゾーンが適用されます。(この機能はClickHouseサーバーではまだリリースされていません)
5. 最後に、クライアントの`apply_server_timezone`パラメータがTrue(デフォルト)に設定されている場合、ClickHouseサーバーのタイムゾーンが適用されます。

これらのルールに基づいて適用されるタイムゾーンがUTCの場合、`clickhouse-connect`は_常に_タイムゾーン非依存のPython `datetime.datetime`オブジェクトを返すことに注意してください。必要に応じて、アプリケーションコードでこのタイムゾーン非依存オブジェクトに追加のタイムゾーン情報を付加することができます。
