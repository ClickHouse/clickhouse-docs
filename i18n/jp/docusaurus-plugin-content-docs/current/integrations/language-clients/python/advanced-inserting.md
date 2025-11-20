---
sidebar_label: '高度な挿入'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: 'ClickHouse Connect を使用した高度な挿入'
slug: /integrations/language-clients/python/advanced-inserting
title: '高度な挿入'
doc_type: 'reference'
---



## ClickHouse Connectを使用したデータ挿入: 高度な使用方法 {#inserting-data-with-clickhouse-connect--advanced-usage}

### InsertContext {#insertcontexts}

ClickHouse Connectは、すべての挿入を`InsertContext`内で実行します。`InsertContext`には、クライアントの`insert`メソッドに引数として渡されたすべての値が含まれます。さらに、`InsertContext`が最初に構築される際、ClickHouse Connectは効率的なNative形式の挿入に必要な挿入列のデータ型を取得します。複数の挿入で`InsertContext`を再利用することで、この「事前クエリ」を回避でき、挿入がより迅速かつ効率的に実行されます。

`InsertContext`は、クライアントの`create_insert_context`メソッドを使用して取得できます。このメソッドは`insert`関数と同じ引数を受け取ります。再利用する際に変更すべきなのは、`InsertContext`の`data`プロパティのみである点に注意してください。これは、同じテーブルへの新しいデータの繰り返し挿入のための再利用可能なオブジェクトを提供するという本来の目的と一致しています。

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

`InsertContext`には挿入プロセス中に更新される可変状態が含まれるため、スレッドセーフではありません。

### 書き込み形式 {#write-formats}

書き込み形式は現在、限られた数の型に対してのみ実装されています。ほとんどの場合、ClickHouse Connectは最初の(非null)データ値の型をチェックすることで、列の正しい書き込み形式を自動的に判断しようとします。たとえば、`DateTime`列に挿入する際、列の最初の挿入値がPythonの整数である場合、ClickHouse Connectはそれが実際にはエポック秒であると仮定して、整数値を直接挿入します。

ほとんどの場合、データ型の書き込み形式を上書きする必要はありませんが、`clickhouse_connect.datatypes.format`パッケージの関連メソッドを使用して、グローバルレベルで上書きすることができます。

#### 書き込み形式のオプション {#write-format-options}


| ClickHouse型       | ネイティブPython型      | 書き込みフォーマット     | コメント                                                                                                    |
| --------------------- | ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Int[8-64], UInt[8-32] | int                     | -                 |                                                                                                             |
| UInt64                | int                     |                   |                                                                                                             |
| [U]Int[128,256]       | int                     |                   |                                                                                                             |
| BFloat16              | float                   |                   |                                                                                                             |
| Float32               | float                   |                   |                                                                                                             |
| Float64               | float                   |                   |                                                                                                             |
| Decimal               | decimal.Decimal         |                   |                                                                                                             |
| String                | string                  |                   |                                                                                                             |
| FixedString           | bytes                   | string            | 文字列として挿入された場合、追加のバイトはゼロに設定されます                                              |
| Enum[8,16]            | string                  |                   |                                                                                                             |
| Date                  | datetime.date           | int               | ClickHouseは日付を1970年1月1日からの日数として保存します。int型はこの「エポック日付」値として扱われます   |
| Date32                | datetime.date           | int               | Dateと同様ですが、より広い範囲の日付に対応します                                                                |
| DateTime              | datetime.datetime       | int               | ClickHouseはDateTimeをエポック秒として保存します。int型はこの「エポック秒」値として扱われます      |
| DateTime64            | datetime.datetime       | int               | Pythonのdatetime.datetimeはマイクロ秒精度に制限されています。生の64ビットint値が利用可能です         |
| Time                  | datetime.timedelta      | int, string, time | ClickHouseはDateTimeをエポック秒として保存します。int型はこの「エポック秒」値として扱われます      |
| Time64                | datetime.timedelta      | int, string, time | Pythonのdatetime.timedeltaはマイクロ秒精度に制限されています。生の64ビットint値が利用可能です        |
| IPv4                  | `ipaddress.IPv4Address` | string            | 適切にフォーマットされた文字列はIPv4アドレスとして挿入できます                                                |
| IPv6                  | `ipaddress.IPv6Address` | string            | 適切にフォーマットされた文字列はIPv6アドレスとして挿入できます                                                |
| Tuple                 | dict or tuple           |                   |                                                                                                             |
| Map                   | dict                    |                   |                                                                                                             |
| Nested                | Sequence[dict]          |                   |                                                                                                             |
| UUID                  | uuid.UUID               | string            | 適切にフォーマットされた文字列はClickHouse UUIDとして挿入できます                                              |
| JSON/Object('json')   | dict                    | string            | 辞書またはJSON文字列のいずれかをJSON列に挿入できます（`Object('json')`は非推奨です） |
| Variant               | object                  |                   | 現時点では、すべてのバリアントは文字列として挿入され、ClickHouseサーバーによって解析されます                    |
| Dynamic               | object                  |                   | 警告 -- 現時点では、Dynamic列への挿入はすべてClickHouse文字列として永続化されます              |

### 特殊な挿入メソッド {#specialized-insert-methods}

ClickHouse Connectは、一般的なデータフォーマット用の特殊な挿入メソッドを提供します：

- `insert_df` -- Pandas DataFrameを挿入します。Pythonのシーケンスのシーケンスである`data`引数の代わりに、このメソッドの第2パラメータはPandas DataFrameインスタンスである必要がある`df`引数を必要とします。ClickHouse ConnectはDataFrameを列指向データソースとして自動的に処理するため、`column_oriented`パラメータは不要であり、利用できません。
- `insert_arrow` -- PyArrow Tableを挿入します。ClickHouse ConnectはArrowテーブルを変更せずにClickHouseサーバーに渡して処理するため、`table`と`arrow_table`に加えて、`database`と`settings`引数のみが利用可能です。
- `insert_df_arrow` -- Arrowベースの Pandas DataFrameまたはPolars DataFrameを挿入します。ClickHouse ConnectはDataFrameがPandas型かPolars型かを自動的に判定します。Pandasの場合、各列のdtypeバックエンドがArrowベースであることを確認する検証が実行され、そうでない場合はエラーが発生します。

:::note
NumPy配列は有効なシーケンスのシーケンスであり、メインの`insert`メソッドの`data`引数として使用できるため、特殊なメソッドは不要です。
:::

#### Pandas DataFrameの挿入 {#pandas-dataframe-insert}

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

#### PyArrow Tableの挿入 {#pyarrow-table-insert}

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

Pythonの`datetime.datetime`オブジェクトをClickHouseの`DateTime`または`DateTime64`カラムに挿入する際、ClickHouse Connectはタイムゾーン情報を自動的に処理します。ClickHouseは内部的にすべてのDateTime値をタイムゾーン非依存のUnixタイムスタンプ(エポックからの秒数または小数秒)として保存するため、挿入時にクライアント側でタイムゾーン変換が自動的に行われます。

#### タイムゾーン対応datetimeオブジェクト {#timezone-aware-datetime-objects}

タイムゾーン対応のPython`datetime.datetime`オブジェクトを挿入すると、ClickHouse Connectは自動的に`.timestamp()`を呼び出してUnixタイムスタンプに変換し、タイムゾーンオフセットを正しく考慮します。つまり、任意のタイムゾーンのdatetimeオブジェクトを挿入でき、それらはUTC相当のタイムスタンプとして正しく保存されます。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

````


# タイムゾーン対応の datetime オブジェクトを挿入する
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

# 出力例:

# (datetime.datetime(2023, 6, 15, 10, 30),)

# (datetime.datetime(2023, 6, 15, 16, 30),)

# (datetime.datetime(2023, 6, 15, 1, 30),)

````

この例では、3つのdatetimeオブジェクトはそれぞれ異なるタイムゾーンを持つため、異なる時点を表しています。各オブジェクトは対応するUnixタイムスタンプに正しく変換され、ClickHouseに格納されます。

:::note
pytzを使用する場合、タイムゾーン情報を持たないdatetimeにタイムゾーン情報を付加するには、`localize()`メソッドを使用する必要があります。datetimeコンストラクタに直接`tzinfo=`を渡すと、誤った歴史的オフセットが使用されます。UTCの場合は、`tzinfo=pytz.UTC`が正しく動作します。詳細については[pytzドキュメント](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic)を参照してください。
:::

#### タイムゾーン情報を持たないdatetimeオブジェクト {#timezone-naive-datetime-objects}

タイムゾーン情報を持たないPythonの`datetime.datetime`オブジェクト(`tzinfo`を持たないもの)を挿入すると、`.timestamp()`メソッドはそれをシステムのローカルタイムゾーンとして解釈します。曖昧さを避けるため、以下の対応を推奨します:

1. 挿入時には常にタイムゾーン情報を持つdatetimeオブジェクトを使用する
2. システムのタイムゾーンがUTCに設定されていることを確認する
3. 挿入前に手動でエポックタイムスタンプに変換する

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# 推奨: 常にタイムゾーン対応の日時を使用する
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])



# 別案: 手動で epoch タイムスタンプに変換する

naive&#95;time = datetime(2023, 6, 15, 10, 30, 0)
epoch&#95;timestamp = int(naive&#95;time.replace(tzinfo=pytz.UTC).timestamp())
client.insert(&#39;events&#39;, [[epoch&#95;timestamp]], column&#95;names=[&#39;event&#95;time&#39;])

````

#### タイムゾーンメタデータを持つDateTime列 {#datetime-columns-with-timezone-metadata}

ClickHouseの列はタイムゾーンメタデータを指定して定義できます(例: `DateTime('America/Denver')` または `DateTime64(3, 'Asia/Tokyo')`)。このメタデータはデータの保存形式には影響せず(UTCタイムスタンプとして保存されます)、ClickHouseからデータを取得する際に使用されるタイムゾーンを制御します。

このような列にデータを挿入する際、ClickHouse ConnectはPythonのdatetimeをUnixタイムスタンプに変換します(タイムゾーンが指定されている場合はそれを考慮します)。データを取得する際、ClickHouse Connectは挿入時に使用したタイムゾーンに関係なく、列のタイムゾーンに変換されたdatetimeを返します。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
````


# ロサンゼルスのタイムゾーン情報を持つテーブルを作成する
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")



# ニューヨーク時間を挿入する（午前10時30分 EDT、UTC では午後2時30分）
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])



# クエリで取得すると、時刻は自動的にロサンゼルスのタイムゾーンに変換されます

# ニューヨーク 10:30 AM (UTC-4) = 14:30 UTC = ロサンゼルス 7:30 AM (UTC-7)

results = client.query("select * from events")
print(*results.result_rows, sep="\n")

# 出力:

# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)

```

```


## ファイル挿入 {#file-inserts}

`clickhouse_connect.driver.tools`パッケージには、ファイルシステムから既存のClickHouseテーブルへ直接データを挿入する`insert_file`メソッドが含まれています。データの解析はClickHouseサーバーに委譲されます。`insert_file`は以下のパラメータを受け取ります:

| パラメータ    | 型              | デフォルト値       | 説明                                                                                                                      |
| ------------ | --------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| client       | Client          | _必須_            | 挿入処理に使用する`driver.Client`                                                                                          |
| table        | str             | _必須_            | 挿入先のClickHouseテーブル。データベース名を含む完全修飾テーブル名を指定可能                                                |
| file_path    | str             | _必須_            | データファイルへのネイティブファイルシステムパス                                                                            |
| fmt          | str             | CSV, CSVWithNames | ファイルのClickHouse入力フォーマット。`column_names`が指定されていない場合はCSVWithNamesとみなされます                      |
| column_names | Sequence of str | _None_            | データファイル内のカラム名のリスト。カラム名を含むフォーマットでは不要                                                      |
| database     | str             | _None_            | テーブルのデータベース。テーブルが完全修飾されている場合は無視されます。指定されていない場合、挿入処理はクライアントデータベースを使用します |
| settings     | dict            | _None_            | [設定の説明](driver-api.md#settings-argument)を参照してください。                                                          |
| compression  | str             | _None_            | Content-Encoding HTTPヘッダーに使用される、ClickHouseで認識される圧縮タイプ(zstd, lz4, gzip)                                |

データに一貫性がないファイルや、通常とは異なる形式の日付/時刻値を含むファイルの場合、データインポートに適用される設定(`input_format_allow_errors_num`や`input_format_allow_errors_ratio`など)がこのメソッドで認識されます。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
