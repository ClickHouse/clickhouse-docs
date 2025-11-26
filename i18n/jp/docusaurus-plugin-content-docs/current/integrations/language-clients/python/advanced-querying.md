---
sidebar_label: '高度なクエリ'
sidebar_position: 4
keywords: ['clickhouse', 'python', 'query', 'advanced']
description: 'ClickHouse Connect を使用した高度なクエリ'
slug: /integrations/language-clients/python/advanced-querying
title: '高度なクエリ'
doc_type: 'reference'
---



# ClickHouse Connect を使ったデータのクエリ実行：高度な使い方 {#querying-data-with-clickhouse-connect--advanced-usage}



## QueryContexts

ClickHouse Connect は標準的なクエリを `QueryContext` 内で実行します。`QueryContext` には、ClickHouse データベースに対してクエリを構築するために使用される主要な構造や、結果を `QueryResult` またはその他の応答データ構造に加工するための設定が含まれます。ここには、クエリ本体、パラメータ、設定、読み込みフォーマット、およびその他のプロパティが含まれます。

`QueryContext` は、クライアントの `create_query_context` メソッドを使用して取得できます。このメソッドは、コアとなるクエリメソッドと同じパラメータを受け取ります。この `QueryContext` は、その後 `query`、`query_df`、または `query_np` メソッドに対して、これらのメソッドの他の引数の一部または全部の代わりに、`context` キーワード引数として渡すことができます。メソッド呼び出し時に追加で指定された引数は、QueryContext のプロパティを上書きする点に注意してください。

`QueryContext` の最も分かりやすいユースケースは、異なるバインドパラメータ値で同じクエリを送信する場合です。すべてのパラメータ値は、`QueryContext.set_parameters` メソッドを辞書とともに呼び出すことで更新できます。また、任意の単一の値は、目的の `key` と `value` のペアを指定して `QueryContext.set_parameter` を呼び出すことで更新できます。

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

`QueryContext` はスレッドセーフではないことに注意してください。マルチスレッド環境では、`QueryContext.updated_copy` メソッドを呼び出すことでコピーを取得できます。


## ストリーミングクエリ

ClickHouse Connect クライアントは、データをストリームとして取得するための複数のメソッドを提供します（Python ジェネレーターとして実装）:

* `query_column_block_stream` -- クエリデータを、ネイティブな Python オブジェクトを用いて列のシーケンスとしてブロック単位で返します
* `query_row_block_stream` -- クエリデータを、ネイティブな Python オブジェクトを用いて行のブロックとして返します
* `query_rows_stream` -- クエリデータを、ネイティブな Python オブジェクトを用いて行のシーケンスとして返します
* `query_np_stream` -- クエリデータの各 ClickHouse ブロックを NumPy 配列として返します
* `query_df_stream` -- クエリデータの各 ClickHouse ブロックを Pandas DataFrame として返します
* `query_arrow_stream` -- クエリデータを PyArrow の RecordBlocks として返します
* `query_df_arrow_stream` -- クエリデータの各 ClickHouse ブロックを、`dataframe_library` という kwarg に応じて Arrow バックエンドの Pandas DataFrame または Polars DataFrame として返します（デフォルトは &quot;pandas&quot;）。

これらの各メソッドは `ContextStream` オブジェクトを返し、ストリームの消費を開始するには `with` 文を使ってオープンする必要があります。

### データブロック

ClickHouse Connect は、プライマリな `query` メソッドからのすべてのデータを、ClickHouse サーバーから受信したブロックのストリームとして処理します。これらのブロックは、ClickHouse との間でカスタムの &quot;Native&quot; フォーマットで送受信されます。「ブロック」とは、単にバイナリデータの列のシーケンスであり、各列には指定されたデータ型のデータ値が同数格納されています。（カラム型データベースである ClickHouse は、このデータを同様の形式で保存します。）クエリから返されるブロックのサイズは、複数のレベル（ユーザープロファイル、ユーザー、セッション、またはクエリ）で設定可能な 2 つのユーザー設定によって制御されます。それらは次のとおりです:

* [max&#95;block&#95;size](/operations/settings/settings#max_block_size) -- ブロックの行数の上限。デフォルトは 65536。
* [preferred&#95;block&#95;size&#95;bytes](/operations/settings/settings#preferred_block_size_bytes) -- ブロックサイズ（バイト数）のソフトリミット。デフォルトは 1,000,0000。

`preferred_block_size_setting` に関係なく、各ブロックは `max_block_size` 行を超えることはありません。クエリの種類によっては、実際に返されるブロックはあらゆるサイズになり得ます。たとえば、多数のシャードをカバーする分散テーブルへのクエリでは、各シャードから直接取得された、より小さなブロックを含む場合があります。

クライアントの `query_*_stream` メソッドのいずれかを使用すると、結果はブロック単位で返されます。ClickHouse Connect は一度に 1 つのブロックだけを読み込みます。これにより、大きな結果セット全体をメモリに読み込むことなく、大量のデータを処理できます。アプリケーション側では任意の数のブロックを処理できるようにしておく必要があり、各ブロックの正確なサイズを制御することはできない点に注意してください。

### 低速処理向けの HTTP データバッファ

HTTP プロトコルの制約により、ブロックの処理速度が ClickHouse サーバーがデータをストリーミングする速度よりも大幅に遅い場合、ClickHouse サーバーは接続を閉じ、処理スレッドで Exception がスローされます。これをある程度軽減するには、共通設定 `http_buffer_size` を使用して、HTTP ストリーミングバッファ（デフォルトは 10 メガバイト）のバッファサイズを増やします。この状況では、アプリケーションで利用可能なメモリが十分にある場合、大きな `http_buffer_size` 値を使用しても問題ないはずです。`lz4` または `zstd` 圧縮を使用している場合、バッファ内のデータは圧縮された状態で保存されるため、これらの圧縮方式を使用すると、実質的に利用可能なバッファ全体の容量が増加します。

### StreamContexts

`query_*_stream` メソッド（`query_row_block_stream` など）のそれぞれは、Python のコンテキスト／ジェネレーターを組み合わせた ClickHouse の `StreamContext` オブジェクトを返します。基本的な使用方法は次のとおりです:

```python
with client.query_row_block_stream('SELECT pickup, dropoff, pickup_longitude, pickup_latitude FROM taxi_trips') as stream:
    for block in stream:
        for row in block:
            <各行のトリップデータに対する処理をここに記述>
```

`with` 文なしで `StreamContext` を使用しようとすると、エラーが発生する点に注意してください。Python のコンテキストを使用することで、ストリーム（この場合はストリーミング HTTP レスポンス）は、すべてのデータが消費されなかった場合や処理中に例外が発生した場合でも、確実にクローズされます。さらに、`StreamContext` はストリームを消費するために一度しか使用できません。`StreamContext` のコンテキストを抜けた後に再度使用しようとすると、`StreamClosedError` が発生します。

`StreamContext` の `source` プロパティを使用して、親の `QueryResult` オブジェクトにアクセスできます。このオブジェクトにはカラム名と型が含まれます。

### ストリーム型


`query_column_block_stream` メソッドは、ブロックをネイティブな Python データ型として格納されたカラムデータのシーケンスとして返します。上記の `taxi_trips` クエリを使用した場合、返されるデータはリストとなり、その各要素は、対応するカラムのすべてのデータを含む別のリスト（またはタプル）になります。したがって、`block[0]` は文字列だけを含むタプルになります。カラム指向フォーマットは、合計運賃の算出のように、カラム内のすべての値に対する集計処理を行う際に最もよく使用されます。

`query_row_block_stream` メソッドは、ブロックを従来のリレーショナルデータベースのように行のシーケンスとして返します。`taxi_trips` の場合、返されるデータはリストとなり、その各要素は 1 行分のデータを表す別のリストになります。したがって、`block[0]` には最初の `taxi_trips` レコードのすべてのフィールド（順番どおり）が含まれ、`block[1]` には 2 番目の `taxi_trips` レコードのすべてのフィールドを含む 1 行が入り、以降も同様です。行指向の結果は、通常は表示や変換処理に使用されます。

`query_row_stream` は、ストリームを反復処理する際に自動的に次のブロックへ進むための補助メソッドです。それ以外は `query_row_block_stream` と同一です。

`query_np_stream` メソッドは、各ブロックを 2 次元の NumPy Array として返します。内部的には、NumPy 配列は（通常）カラムとして格納されるため、行専用またはカラム専用の別個のメソッドは不要です。NumPy 配列の「shape」は (columns, rows) の形式で表現されます。NumPy ライブラリは NumPy 配列を操作する多数のメソッドを提供しています。クエリ内のすべてのカラムが同じ NumPy dtype を共有している場合、返される NumPy 配列も 1 つの dtype しか持たず、その内部構造を実際には変更せずに reshape や回転が可能である点に注意してください。

`query_df_stream` メソッドは、各 ClickHouse Block を 2 次元の Pandas DataFrame として返します。以下の例では、`StreamContext` オブジェクトを遅延的な形で（ただし 1 回のみ）コンテキストとして使用できることを示します。

```python
df_stream = client.query_df_stream('SELECT * FROM hits')
column_names = df_stream.source.column_names
with df_stream:
    for df in df_stream:
        <pandas DataFrameで処理を実行>
```

`query_df_arrow_stream` メソッドは、各 ClickHouse の Block を PyArrow の dtype バックエンドを使用する DataFrame として返します。このメソッドは、`dataframe_library` パラメータ（デフォルトは `"pandas"`）を通じて、Pandas（2.x 以降）と Polars の両方の DataFrame をサポートします。反復処理のたびに、PyArrow のレコードバッチから変換された DataFrame が生成され、特定のデータ型に対してより高いパフォーマンスとメモリ効率を実現します。

最後に、`query_arrow_stream` メソッドは、ClickHouse の `ArrowStream` 形式の結果を、`StreamContext` でラップされた `pyarrow.ipc.RecordBatchStreamReader` として返します。ストリームの各反復処理では、PyArrow の RecordBlock が返されます。

### ストリーミングの例

#### 行のストリーミング

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# 大きな結果セットを行ごとにストリーミング処理する

with client.query&#95;rows&#95;stream(&quot;SELECT number, number * 2 as doubled FROM system.numbers LIMIT 100000&quot;) as stream:
for row in stream:
print(row)  # 各行を処理する

# 出力:

# (0, 0)

# (1, 2)

# (2, 4)

# ....

````

#### 行ブロックのストリーム処理 {#stream-row-blocks}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# 行のブロック単位でストリーミングする（1 行ずつ処理するより効率的）

with client.query&#95;row&#95;block&#95;stream(&quot;SELECT number, number * 2 FROM system.numbers LIMIT 100000&quot;) as stream:
for block in stream:
print(f&quot;Received block with {len(block)} rows&quot;)

# 出力:

# 65409 行のブロックを受信しました

# 34591 行のブロックを受信しました

````

#### Pandas DataFrameのストリーミング {#stream-pandas-dataframes}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# Pandas DataFrame としてクエリ結果をストリーミングする

with client.query&#95;df&#95;stream(&quot;SELECT number, toString(number) AS str FROM system.numbers LIMIT 100000&quot;) as stream:
for df in stream:

# 各 DataFrame ブロックを処理する

print(f&quot;Received DataFrame with {len(df)} rows&quot;)
print(df.head(3))

# 出力:

# 65409 行の DataFrame を受信しました

# number str

# 0       0   0

# 1       1   1

# 2       2   2

# 34591 行の DataFrame を受信しました

# number    str

# 0   65409  65409

# 1   65410  65410

# 2   65411  65411

````

#### Arrowバッチのストリーミング {#stream-arrow-batches}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# クエリ結果を Arrow レコードバッチとしてストリーミング

with client.query&#95;arrow&#95;stream(&quot;SELECT * FROM large&#95;table&quot;) as stream:
for arrow&#95;batch in stream:

# 各 Arrow バッチを処理

print(f&quot;Received Arrow batch with {arrow_batch.num_rows} rows&quot;)

# 出力:

# 65409 行の Arrow バッチを受信しました

# 34591 行の Arrow バッチを受信しました

```
```


## NumPy、Pandas、および Arrow クエリ

ClickHouse Connect は、NumPy、Pandas、および Arrow のデータ構造を扱うための専用クエリメソッドを提供します。これらのメソッドを使用すると、手動での変換なしに、クエリ結果をこれらの広く利用されているデータ形式で直接取得できます。

### NumPy クエリ

`query_np` メソッドは、ClickHouse Connect の `QueryResult` の代わりに、クエリ結果を NumPy 配列として返します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
```


# クエリは NumPy 配列を返します
np_array = client.query_np("SELECT number, number * 2 AS doubled FROM system.numbers LIMIT 5")



print(type(np_array))

# 出力:

# <class "numpy.ndarray">


print(np&#95;array)

# 出力結果:

# [[0 0]

# [1 2]

# [2 4]

# [3 6]

# [4 8]]

````

### Pandasクエリ {#pandas-queries}

`query_df`メソッドは、ClickHouse Connectの`QueryResult`の代わりに、クエリ結果をPandas DataFrameとして返します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# クエリは Pandas DataFrame を返す
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

`query_arrow`メソッドは、クエリ結果をPyArrow Tableとして返します。ClickHouseの`Arrow`形式を直接利用するため、メインの`query`メソッドと共通する引数は`query`、`parameters`、`settings`の3つのみです。加えて、`use_strings`という追加の引数があり、これはArrow TableがClickHouseのString型を文字列として表示するか（Trueの場合）、バイトとして表示するか（Falseの場合）を決定します。

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

````


# クエリは PyArrow テーブルを返す
arrow_table = client.query_arrow("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")



print(type(arrow_table))

# Output:

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

ClickHouse Connectは、`query_df_arrow`および`query_df_arrow_stream`メソッドを介して、Arrow結果から高速かつメモリ効率の高いデータフレーム作成をサポートします。これらはArrowクエリメソッドの薄いラッパーであり、可能な限りゼロコピー変換でデータフレームに変換します。

- `query_df_arrow`: ClickHouseの`Arrow`出力形式を使用してクエリを実行し、データフレームを返します。
  - `dataframe_library='pandas'`の場合、Arrowベースのdtype（`pd.ArrowDtype`）を使用したpandas 2.xデータフレームを返します。これにはpandas 2.xが必要であり、可能な限りゼロコピーバッファを活用することで、優れたパフォーマンスと低メモリオーバーヘッドを実現します。
  - `dataframe_library='polars'`の場合、Arrowテーブルから作成されたPolarsデータフレーム（`pl.from_arrow`）を返します。これも同様に効率的であり、データに応じてゼロコピーが可能です。
- `query_df_arrow_stream`: Arrowストリームバッチから変換されたデータフレーム（pandas 2.xまたはPolars）のシーケンスとして結果をストリーミングします。

#### Arrowベースのデータフレームへのクエリ {#query-to-arrow-backed-dataframe}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
````


# クエリは Arrow データ型（dtypes）を持つ Pandas DataFrame を返します（pandas 2.x が必要）

df = client.query_df_arrow(
    "SELECT number, toString(number) AS str FROM system.numbers LIMIT 3",
    dataframe_library="pandas"
)



print(df.dtypes)
# 出力結果:
# number    uint64[pyarrow]
# str       string[pyarrow]
# dtype: object



# または Polars を使用する
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
print(f"{type(df_batch)}バッチを受信しました。行数: {len(df_batch)}、dtypes: {df_batch.dtypes}") # Output: # Received <class 'polars.dataframe.frame.DataFrame'> batch with 65409 rows and dtypes: [UInt64, String] # Received <class 'polars.dataframe.frame.DataFrame'> batch with 34591 rows and dtypes: [UInt64, String]

```

#### 注意事項と制限事項 {#notes-and-caveats}
- Arrow型マッピング: Arrow形式でデータを返す際、ClickHouseは型を最も近いサポート対象のArrow型にマッピングします。一部のClickHouse型にはネイティブなArrow相当型が存在せず、Arrowフィールド内で生バイトとして返されます（通常は`BINARY`または`FIXED_SIZE_BINARY`）。
  - 例: `IPv4`はArrowの`UINT32`として表現されます。`IPv6`および大きな整数型（`Int128/UInt128/Int256/UInt256`）は、多くの場合生バイトを含む`FIXED_SIZE_BINARY`/`BINARY`として表現されます。
  - これらの場合、DataFrameの列にはArrowフィールドに基づくバイト値が含まれます。これらのバイトをClickHouseのセマンティクスに従って解釈・変換するのはクライアントコードの責任となります。
- サポートされていないArrowデータ型（例: 真のArrow型としてのUUID/ENUM）は出力されません。値は最も近いサポート対象のArrow型（多くの場合バイナリバイト）を使用して表現されます。
- Pandasの要件: Arrowベースのdtypesにはpandas 2.xが必要です。古いバージョンのpandasを使用する場合は、代わりに`query_df`（非Arrow）を使用してください。
- 文字列とバイナリ: `use_strings`オプション（サーバー設定`output_format_arrow_string_as_string`でサポートされている場合）は、ClickHouseの`String`列をArrow文字列として返すか、バイナリとして返すかを制御します。

#### ClickHouse/Arrow型変換の不一致の例 {#mismatched-clickhousearrow-type-conversion-examples}

ClickHouseが列を生バイナリデータ（例: `FIXED_SIZE_BINARY`または`BINARY`）として返す場合、これらのバイトを適切なPython型に変換するのはアプリケーションコードの責任となります。以下の例は、一部の変換がDataFrameライブラリのAPIを使用して実行可能である一方、他の変換では`struct.unpack`のような純粋なPythonアプローチが必要になる場合があることを示しています（パフォーマンスは犠牲になりますが、柔軟性は維持されます）。

```


`Date` 列は `UINT16`（Unix エポック（1970‑01‑01）からの経過日数）として表現される場合があります。DataFrame 内で変換するのが効率的かつ容易です。

```python
# Polars
df = df.with_columns(pl.col("event_date").cast(pl.Date))
```


# Pandas

df[&quot;event&#95;date&quot;] = pd.to&#95;datetime(df[&quot;event&#95;date&quot;], unit=&quot;D&quot;)

```
```


`Int128` のようなカラムは、生のバイト列を持つ `FIXED_SIZE_BINARY` 型として渡される場合があります。Polars は 128 ビット整数をネイティブにサポートしています。

```python
# Polars - ネイティブサポート
df = df.with_columns(pl.col("data").bin.reinterpret(dtype=pl.Int128, endianness="little"))
```

NumPy 2.3 の時点では公開されている 128 ビット整数の dtype は存在しないため、純粋な Python にフォールバックして、次のように記述できます。


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

# 出力結果:

# [1234567898765432123456789, 8, 456789123456789]

```

重要なポイント：アプリケーションコードは、選択したDataFrameライブラリの機能と許容可能なパフォーマンストレードオフに基づいて、これらの変換を処理する必要があります。DataFrameネイティブの変換が利用できない場合、純粋なPythonによるアプローチも選択肢となります。
```


## 読み取りフォーマット

読み取りフォーマットは、クライアントの `query`、`query_np`、`query_df` メソッドから返される値のデータ型を制御します（`raw_query` と `query_arrow` は ClickHouse から受信したデータを変更しないため、フォーマット制御は適用されません）。たとえば、UUID の読み取りフォーマットをデフォルトの `native` フォーマットから `string` フォーマットに変更すると、`UUID` カラムに対する ClickHouse クエリの結果は、Python の UUID オブジェクトではなく、標準的な 8-4-4-4-12 の RFC 1422 形式の文字列値として返されます。

任意のフォーマット関数の「data type」引数にはワイルドカードを含めることができます。フォーマットは、小文字のみからなる 1 つの文字列です。

読み取りフォーマットは、複数のレベルで設定できます。

* グローバルレベル: `clickhouse_connect.datatypes.format` パッケージで定義されているメソッドを使用します。これにより、すべてのクエリに対して、指定したデータ型のフォーマットが制御されます。

```python
from clickhouse_connect.datatypes.format import set_read_format
```


# IPv6 と IPv4 の両方の値を文字列として返す
set_read_format('IPv*', 'string')



# すべての Date 型を内部表現であるエポック秒またはエポック日として返す

set&#95;read&#95;format(&#39;Date*&#39;, &#39;int&#39;)

````
- クエリ全体に対して、オプションの `query_formats` 辞書引数を使用します。この場合、指定されたデータ型のすべてのカラム（またはサブカラム）が、設定されたフォーマットを使用します。
```python
# すべてのUUIDカラムを文字列として返す
client.query('SELECT user_id, user_uuid, device_uuid from users', query_formats={'UUID': 'string'})
````

* 特定のカラムの値に対しては、オプションの `column_formats` 辞書引数を使用できます。キーには ClickHouse から返されるカラム名を指定し、値にはデータカラムのフォーマット、または ClickHouse の型名をキー、クエリフォーマットを値とする第二レベルの「format」辞書を指定します。この第二レベルの辞書は、Tuple や Map のようなネストされたカラム型に対して使用できます。

```python
# `dev_address`列のIPv6値を文字列として返す
client.query('SELECT device_id, dev_address, gw_address from devices', column_formats={'dev_address':'string'})
```

### 読み取りフォーマットのオプション（Python 型）

| ClickHouse Type       | ネイティブ Python 型          | 読み取りフォーマット        | コメント                                                                   |
| --------------------- | ----------------------- | ----------------- | ---------------------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                        |
| UInt64                | int                     | signed            | Superset は現在、大きな符号なしの UInt64 値を処理できません                                 |
| [U]Int[128,256]       | int                     | string            | Pandas および NumPy の int 値は最大 64 ビットのため、これらは文字列として返される場合があります            |
| BFloat16              | float                   | -                 | Python の float は内部的にはすべて 64 ビットです                                      |
| Float32               | float                   | -                 | Python の float は内部的にはすべて 64 ビットです                                      |
| Float64               | float                   | -                 |                                                                        |
| Decimal               | decimal.Decimal         | -                 |                                                                        |
| String                | string                  | bytes             | ClickHouse の String カラムには固有のエンコーディングがないため、可変長バイナリデータにも使用されます           |
| FixedString           | bytes                   | string            | FixedString は固定サイズのバイト配列ですが、Python の文字列として扱われることもあります                  |
| Enum[8,16]            | string                  | string, int       | Python の enum は空文字列を受け付けないため、すべての enum は文字列または基になる int 値としてレンダリングされます。 |
| Date                  | datetime.date           | int               | ClickHouse は Date を 1970/01/01 からの日数として保存します。この値は int として取得できます        |
| Date32                | datetime.date           | int               | Date と同様ですが、より広い日付範囲をサポートします                                           |
| DateTime              | datetime.datetime       | int               | ClickHouse は DateTime をエポック秒として保存します。この値は int として取得できます                |
| DateTime64            | datetime.datetime       | int               | Python の datetime.datetime はマイクロ秒精度までに制限されます。生の 64 ビットの int 値も取得できます   |
| Time                  | datetime.timedelta      | int, string, time | 時刻は Unix タイムスタンプとして保存されます。この値は int として取得できます                           |
| Time64                | datetime.timedelta      | int, string, time | Python の datetime.timedelta はマイクロ秒精度までに制限されます。生の 64 ビットの int 値も取得できます  |
| IPv4                  | `ipaddress.IPv4Address` | string            | IP アドレスは文字列として読み取ることができ、適切にフォーマットされた文字列は IP アドレスとして挿入できます              |
| IPv6                  | `ipaddress.IPv6Address` | string            | IP アドレスは文字列として読み取ることができ、適切にフォーマットされた値は IP アドレスとして挿入できます                |
| Tuple                 | dict or tuple           | tuple, json       | 名前付きタプルはデフォルトで辞書として返されます。名前付きタプルは JSON 文字列として返すこともできます                 |
| Map                   | dict                    | -                 |                                                                        |
| Nested                | Sequence[dict]          | -                 |                                                                        |
| UUID                  | uuid.UUID               | string            | UUID は RFC 4122 に従った形式の文字列として読み取ることができます<br />                         |
| JSON                  | dict                    | string            | デフォルトでは Python の辞書が返されます。`string` フォーマットでは JSON 文字列が返されます              |
| Variant               | object                  | -                 | 値に格納されている ClickHouse のデータ型に対応する Python 型を返します                          |
| Dynamic               | object                  | -                 | 値に格納されている ClickHouse のデータ型に対応する Python 型を返します                          |


## 外部データ

ClickHouse のクエリは、任意の ClickHouse フォーマットで外部データを受け取ることができます。このバイナリデータは、クエリ文字列と一緒に送信され、データ処理に利用されます。External Data 機能の詳細は[こちら](/engines/table-engines/special/external-data.md)を参照してください。クライアントの `query*` メソッドは、この機能を利用するために、オプションの `external_data` パラメータを取ります。`external_data` パラメータの値は、`clickhouse_connect.driver.external.ExternalData` オブジェクトである必要があります。このオブジェクトのコンストラクタは、次の引数を受け取ります。

| Name          | Type              | Description                                                                    |
| ------------- | ----------------- | ------------------------------------------------------------------------------ |
| file&#95;path | str               | 外部データを読み込むローカルシステム上のファイルパス。`file_path` または `data` のいずれか一方が必須です                 |
| file&#95;name | str               | 外部データ「ファイル」の名前。指定されない場合、`file_path` から（拡張子を除いて）決定されます                          |
| data          | bytes             | （ファイルから読み込む代わりに）バイナリ形式の外部データ。`data` または `file_path` のいずれか一方が必須です               |
| fmt           | str               | データの ClickHouse [Input Format](/sql-reference/formats.mdx)。デフォルトは `TSV` です     |
| types         | str or seq of str | 外部データ内のカラムデータ型のリスト。文字列の場合は、型をカンマ区切りで指定します。`types` または `structure` のいずれか一方が必須です |
| structure     | str or seq of str | データ内のカラム名 + データ型のリスト（例を参照）。`structure` または `types` のいずれか一方が必須です                |
| mime&#95;type | str               | ファイルデータの任意指定の MIME タイプ。現在 ClickHouse はこの HTTP サブヘッダーを無視します                     |

「movie」データを含む外部 CSV ファイルをクエリとともに送信し、そのデータを ClickHouse サーバー上にすでに存在する `directors` テーブルと結合するには、次のようにします。

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

追加の外部データファイルは、コンストラクタと同じパラメータを取る `add_file` メソッドを使用して、最初の `ExternalData` オブジェクトに追加できます。HTTP の場合、すべての外部データは `multipart/form-data` によるファイルアップロードの一部として送信されます。


## タイムゾーン {#time-zones}
ClickHouse の DateTime および DateTime64 値にタイムゾーンを適用する方法はいくつかあります。内部的には、ClickHouse サーバーはあらゆる DateTime または `DateTime64` オブジェクトを、エポック（1970-01-01 00:00:00 UTC）からの秒数を表す、タイムゾーン情報を持たない数値として常に保存します。`DateTime64` 値の場合、その表現は精度に応じて、エポックからのミリ秒、マイクロ秒、またはナノ秒になります。その結果、タイムゾーン情報の適用は常にクライアント側で行われます。これは無視できない追加計算を伴うため、パフォーマンスが重要なアプリケーションでは、ユーザー表示や変換の場合を除き、DateTime 型はエポックタイムスタンプとして扱うことを推奨します（例えば Pandas の Timestamp は、パフォーマンス向上のため、常にエポックナノ秒を表す 64 ビット整数です）。

クエリでタイムゾーン対応データ型を使用する場合――特に Python の `datetime.datetime` オブジェクトを使用する場合――`clickhouse-connect` は次の優先順位ルールに従って、クライアント側のタイムゾーンを適用します。

1. クエリメソッドの引数 `client_tzs` が指定されている場合、その特定のカラムのタイムゾーンが適用されます
2. ClickHouse カラムにタイムゾーンのメタデータがある場合（例: DateTime64(3, 'America/Denver') のような型）、ClickHouse カラムのタイムゾーンが適用されます。（ClickHouse バージョン 23.2 より前の DateTime カラムについては、このタイムゾーンメタデータは clickhouse-connect から利用できないことに注意してください）
3. クエリメソッドの引数 `query_tz` が指定されている場合、「クエリタイムゾーン」が適用されます。
4. クエリまたはセッションにタイムゾーン設定が適用されている場合、そのタイムゾーンが適用されます。（この機能はまだ ClickHouse サーバーではリリースされていません）
5. 最後に、クライアントの `apply_server_timezone` パラメータが True（デフォルト）に設定されている場合、ClickHouse サーバーのタイムゾーンが適用されます。

上記のルールに基づいて適用されるタイムゾーンが UTC の場合、`clickhouse-connect` は _常に_ タイムゾーン情報を持たない（naive）Python の `datetime.datetime` オブジェクトを返します。その後、必要に応じて、アプリケーションコードによってこのタイムゾーン情報を持たないオブジェクトに追加のタイムゾーン情報を付与できます。
