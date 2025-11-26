---
sidebar_label: '高度なデータ挿入'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: 'ClickHouse Connect を使用した高度なデータ挿入'
slug: /integrations/language-clients/python/advanced-inserting
title: '高度なデータ挿入'
doc_type: 'reference'
---



## ClickHouse Connect を使用したデータ挿入: 高度な利用方法

### InsertContexts

ClickHouse Connect は、すべての insert を `InsertContext` 内で実行します。`InsertContext` には、クライアントの `insert` メソッドに引数として渡されたすべての値が含まれます。加えて、`InsertContext` が最初に構築される際、ClickHouse Connect は、Native フォーマットで効率的に挿入するために必要な対象カラムのデータ型を取得します。複数回の挿入で同じ `InsertContext` を再利用することで、この &quot;pre-query&quot; が不要となり、挿入処理をより高速かつ効率的に実行できます。

`InsertContext` は、クライアントの `create_insert_context` メソッドを使用して取得できます。このメソッドは、`insert` 関数と同じ引数を取ります。再利用のためには、`InsertContext` の `data` プロパティのみを変更すべきである点に注意してください。これは、同じテーブルに対して新しいデータを繰り返し挿入するための再利用可能なオブジェクトを提供するという本来の目的にも合致しています。

```python
test_data = [[1, 'v1', 'v2'], [2, 'v3', 'v4']]
ic = test_client.create_insert_context(table='test_table', data='test_data')
client.insert(context=ic)
assert client.command('SELECT count() FROM test_table') == 2
new_data = [[3, 'v5', 'v6'], [4, 'v7', 'v8']]
ic.data = new_data
client.insert(context=ic)
qr = test_client.query('SELECT * FROM test_table ORDER BY key DESC')
assert qr.row_count == 4
assert qr[0][0] == 4
```

`InsertContext` には挿入処理中に更新されるミュータブルな状態が含まれるため、スレッドセーフではありません。

### 書き込みフォーマット

書き込みフォーマットは現在、限られた数の型に対してのみ実装されています。多くの場合、ClickHouse Connect は最初の（非 NULL）データ値の型を確認することで、そのカラムに対して正しい書き込みフォーマットを自動的に判定しようとします。たとえば、`DateTime` カラムに挿入する際、そのカラムの最初の挿入値が Python の整数であれば、ClickHouse Connect は、その値が実際にはエポック秒であるとみなして、その整数値をそのまま挿入します。

ほとんどの場合、あるデータ型に対して書き込みフォーマットを明示的に上書きする必要はありませんが、`clickhouse_connect.datatypes.format` パッケージ内の関連メソッドを使用することで、グローバルレベルで上書きできます。

#### 書き込みフォーマットのオプション


| ClickHouse Type             | ネイティブ Python 型          | 書き込みフォーマット        | コメント                                                                      |
| --------------------------- | ----------------------- | ----------------- | ------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32]       | int                     | -                 |                                                                           |
| UInt64                      | int                     |                   |                                                                           |
| [U]Int[128,256]             | int                     |                   |                                                                           |
| BFloat16                    | float                   |                   |                                                                           |
| Float32                     | float                   |                   |                                                                           |
| Float64                     | float                   |                   |                                                                           |
| Decimal                     | decimal.Decimal         |                   |                                                                           |
| String                      | string                  |                   |                                                                           |
| FixedString                 | bytes                   | string            | 文字列として挿入された場合、余分なバイトはゼロで埋められます                                            |
| Enum[8,16]                  | string                  |                   |                                                                           |
| Date                        | datetime.date           | int               | ClickHouse は Date を 1970/01/01 からの日数として保存します。int 型はこの「エポック日付」の値であるとみなされます |
| Date32                      | datetime.date           | int               | Date と同じですが、より広い日付範囲を扱えます                                                 |
| DateTime                    | datetime.datetime       | int               | ClickHouse は DateTime をエポック秒として保存します。int 型はこの「エポック秒」の値であるとみなされます          |
| DateTime64                  | datetime.datetime       | int               | Python の datetime.datetime はマイクロ秒精度までに制限されます。64 ビット整数の生の値も利用可能です          |
| Time                        | datetime.timedelta      | int, string, time | ClickHouse は Time をエポック秒として保存します。int 型はこの「エポック秒」の値であるとみなされます              |
| Time64                      | datetime.timedelta      | int, string, time | Python の datetime.timedelta はマイクロ秒精度までに制限されます。64 ビット整数の生の値も利用可能です         |
| IPv4                        | `ipaddress.IPv4Address` | string            | 正しくフォーマットされた文字列は IPv4 アドレスとして挿入できます                                       |
| IPv6                        | `ipaddress.IPv6Address` | string            | 正しくフォーマットされた文字列は IPv6 アドレスとして挿入できます                                       |
| Tuple                       | dict or tuple           |                   |                                                                           |
| Map                         | dict                    |                   |                                                                           |
| Nested                      | Sequence[dict]          |                   |                                                                           |
| UUID                        | uuid.UUID               | string            | 正しくフォーマットされた文字列は ClickHouse の UUID として挿入できます                              |
| JSON/Object(&#39;json&#39;) | dict                    | string            | 辞書または JSON 文字列のいずれも JSON カラムに挿入できます（`Object('json')` は非推奨です）              |
| Variant                     | object                  |                   | 現時点ではすべての Variant は文字列として挿入され、ClickHouse サーバー側でパースされます                    |
| Dynamic                     | object                  |                   | 警告 -- 現時点では Dynamic カラムへの挿入はすべて ClickHouse の String として永続化されます            |

### 特殊な挿入メソッド

ClickHouse Connect は、一般的なデータ形式向けに特殊な挿入メソッドを提供します。

* `insert_df` -- Pandas DataFrame を挿入します。Python の Sequence of Sequences を受け取る `data` 引数の代わりに、このメソッドの 2 番目のパラメータとしては、Pandas DataFrame インスタンスである `df` 引数が必要です。ClickHouse Connect は DataFrame を列指向のデータソースとして自動的に処理するため、`column_oriented` パラメータは不要であり、指定することはできません。
* `insert_arrow` -- PyArrow Table を挿入します。ClickHouse Connect は Arrow テーブルを変更せずに ClickHouse サーバーへ渡して処理させるため、`table` と `arrow_table` に加えて指定可能な引数は `database` と `settings` のみです。
* `insert_df_arrow` -- Arrow バックエンドの Pandas DataFrame または Polars DataFrame を挿入します。ClickHouse Connect は DataFrame が Pandas か Polars かを自動的に判定します。Pandas の場合、各カラムの dtype バックエンドが Arrow ベースであることを検証し、そうでないカラムがある場合はエラーを送出します。

:::note
NumPy 配列は有効な Sequence of Sequences であり、メインの `insert` メソッドに対する `data` 引数として利用できるため、専用のメソッドは不要です。
:::

#### Pandas DataFrame の挿入

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
})

client.insert_df("users", df)
```

#### PyArrow テーブルへの挿入

```python
import clickhouse_connect
import pyarrow as pa
```


client = clickhouse_connect.get_client()

arrow_table = pa.table({
"id": [1, 2, 3],
"name": ["Alice", "Bob", "Joe"],
"age": [25, 30, 28],
})

client.insert_arrow("users", arrow_table)

````

#### Arrow-backed DataFrame insert (pandas 2.x) {#arrow-backed-dataframe-insert-pandas-2}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

````


# パフォーマンス向上のためArrowベースのdtypesに変換

df = pd.DataFrame({
"id": [1, 2, 3],
"name": ["Alice", "Bob", "Joe"],
"age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)

````

### タイムゾーン {#time-zones}

Pythonの`datetime.datetime`オブジェクトをClickHouseの`DateTime`または`DateTime64`カラムに挿入する際、ClickHouse Connectはタイムゾーン情報を自動的に処理します。ClickHouseは内部的にすべてのDateTime値をタイムゾーン非依存のUnixタイムスタンプ(エポックからの秒数または小数秒)として保存するため、挿入時にクライアント側でタイムゾーン変換が自動的に実行されます。

#### タイムゾーン対応のdatetimeオブジェクト {#timezone-aware-datetime-objects}

タイムゾーン対応のPython `datetime.datetime`オブジェクトを挿入する場合、ClickHouse Connectは自動的に`.timestamp()`を呼び出してUnixタイムスタンプに変換し、タイムゾーンオフセットを正確に反映します。これにより、任意のタイムゾーンのdatetimeオブジェクトを挿入でき、UTC相当のタイムスタンプとして正しく保存されます。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

````


# タイムゾーン情報付き datetime オブジェクトを挿入する
denver_tz = pytz.timezone('America/Denver')
tokyo_tz = pytz.timezone('Asia/Tokyo')

data = [
    [datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)],
    [denver_tz.localize(datetime(2023, 6, 15, 10, 30, 0))],
    [tokyo_tz.localize(datetime(2023, 6, 15, 10, 30, 0))]
]



client.insert(&#39;events&#39;, data, column&#95;names=[&#39;event&#95;time&#39;])
results = client.query(&quot;SELECT * from events&quot;)
print(*results.result&#95;rows, sep=&quot;\n&quot;)

# 出力:

# (datetime.datetime(2023, 6, 15, 10, 30),)

# (datetime.datetime(2023, 6, 15, 16, 30),)

# (datetime.datetime(2023, 6, 15, 1, 30),)

````

この例では、3つのdatetimeオブジェクトはそれぞれ異なるタイムゾーンを持つため、異なる時点を表します。各オブジェクトは対応するUnixタイムスタンプに正しく変換され、ClickHouseに格納されます。

:::note
pytzを使用する場合、タイムゾーン情報を持たないdatetimeにタイムゾーン情報を付加するには`localize()`メソッドを使用する必要があります。datetimeコンストラクタに直接`tzinfo=`を渡すと、誤った歴史的オフセットが使用されます。UTCの場合は`tzinfo=pytz.UTC`が正しく動作します。詳細は[pytzドキュメント](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic)を参照してください。
:::

#### タイムゾーン情報を持たないdatetimeオブジェクト {#timezone-naive-datetime-objects}

タイムゾーン情報を持たないPythonの`datetime.datetime`オブジェクト（`tzinfo`を持たないもの）を挿入すると、`.timestamp()`メソッドはそれをシステムのローカルタイムゾーンとして解釈します。曖昧さを避けるため、以下を推奨します：

1. 挿入時には常にタイムゾーン情報を持つdatetimeオブジェクトを使用する
2. システムのタイムゾーンがUTCに設定されていることを確認する
3. 挿入前に手動でエポックタイムスタンプに変換する

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# 推奨: 常にタイムゾーン情報を含む日時型を使用する
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])



# 代替案: 手動でエポックタイムスタンプに変換する

naive&#95;time = datetime(2023, 6, 15, 10, 30, 0)
epoch&#95;timestamp = int(naive&#95;time.replace(tzinfo=pytz.UTC).timestamp())
client.insert(&#39;events&#39;, [[epoch&#95;timestamp]], column&#95;names=[&#39;event&#95;time&#39;])

````

#### タイムゾーンメタデータを持つDateTime列 {#datetime-columns-with-timezone-metadata}

ClickHouseの列はタイムゾーンメタデータを指定して定義できます(例: `DateTime('America/Denver')` または `DateTime64(3, 'Asia/Tokyo')`)。このメタデータはデータの保存方法には影響しません(UTCタイムスタンプとして保存されます)が、ClickHouseからデータをクエリする際に使用されるタイムゾーンを制御します。

このような列にデータを挿入する際、ClickHouse ConnectはPythonのdatetimeをUnixタイムスタンプに変換します(タイムゾーンが存在する場合はそれを考慮します)。データをクエリする際、ClickHouse Connectは挿入時に使用したタイムゾーンに関係なく、列のタイムゾーンに変換されたdatetimeを返します。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# ロサンゼルスのタイムゾーン情報を持つテーブルを作成する
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")



# ニューヨーク現地時間 (10:30 AM EDT、14:30 UTC) を挿入する
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])



# クエリで取得する際、時刻は自動的にロサンゼルスのタイムゾーンに変換されます

# ニューヨーク 10:30 AM (UTC-4) = 14:30 UTC = ロサンゼルス 7:30 AM (UTC-7)

results = client.query("select * from events")
print(*results.result_rows, sep="\n")

# 出力:

# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)

```

```


## ファイルからの挿入

`clickhouse_connect.driver.tools` パッケージには、ファイルシステム上のデータを既存の ClickHouse テーブルに直接挿入できる `insert_file` メソッドが含まれています。パース処理は ClickHouse サーバー側で行われます。`insert_file` は次のパラメータを受け取ります:

| Parameter        | Type            | Default           | Description                                                                   |
| ---------------- | --------------- | ----------------- | ----------------------------------------------------------------------------- |
| client           | Client          | *Required*        | 挿入処理を実行するために使用される `driver.Client`                                             |
| table            | str             | *Required*        | 挿入先の ClickHouse テーブル。データベース名を含む完全修飾テーブル名も指定できます。                              |
| file&#95;path    | str             | *Required*        | データファイルへのネイティブファイルシステムパス                                                      |
| fmt              | str             | CSV, CSVWithNames | ファイルの ClickHouse 入力フォーマット。`column_names` が指定されていない場合は CSVWithNames が使用されます    |
| column&#95;names | Sequence of str | *None*            | データファイル内のカラム名のリスト。カラム名を含むフォーマットでは指定不要です                                       |
| database         | str             | *None*            | テーブルのデータベース。テーブル名が完全修飾されている場合は無視されます。指定しない場合、クライアントのデータベースが使用されます             |
| settings         | dict            | *None*            | [settings description](driver-api.md#settings-argument) を参照してください。            |
| compression      | str             | *None*            | Content-Encoding HTTP ヘッダーに使用される、ClickHouse でサポートされている圧縮タイプ (zstd, lz4, gzip) |

データの不整合があるファイルや、日付/時刻の値が通常とは異なるフォーマットで記録されているファイルに対しては、`input_format_allow_errors_num` や `input_format_allow_errors_num` など、データインポートに適用される設定もこのメソッドで有効になります。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
