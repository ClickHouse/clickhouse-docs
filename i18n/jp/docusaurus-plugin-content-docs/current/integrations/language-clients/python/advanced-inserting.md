---
sidebar_label: '高度なデータ挿入'
sidebar_position: 5
keywords: ['clickhouse', 'python', 'insert', 'advanced']
description: 'ClickHouse Connect を用いた高度なデータ挿入'
slug: /integrations/language-clients/python/advanced-inserting
title: '高度なデータ挿入'
doc_type: 'reference'
---

## ClickHouse Connect を使ったデータの挿入: 高度な利用方法 \\{#inserting-data-with-clickhouse-connect--advanced-usage\\}

### InsertContexts \\{#insertcontexts\\}

ClickHouse Connect は、すべての挿入処理を `InsertContext` 内で実行します。`InsertContext` には、クライアントの `insert` メソッドに引数として渡されたすべての値が含まれます。さらに、`InsertContext` が最初に構築される際、ClickHouse Connect は、効率的な Native 形式での挿入に必要な挿入列のデータ型を取得します。複数回の挿入で同じ `InsertContext` を再利用することで、この「事前クエリ」を避けることができ、挿入処理をより高速かつ効率的に実行できます。

`InsertContext` は、クライアントの `create_insert_context` メソッドを使用して取得できます。このメソッドは、`insert` 関数と同じ引数を受け取ります。再利用のために変更すべきなのは `InsertContext` の `data` プロパティのみである点に注意してください。これは、同じテーブルに対して新しいデータを繰り返し挿入するための再利用可能なオブジェクトを提供するという、本来の目的と一致しています。

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

`InsertContext` には挿入処理中に更新される可変な状態が含まれるため、スレッドセーフではありません。

### 書き込みフォーマット \\{#write-formats\\}

書き込みフォーマットは、現在は限られた数の型に対してのみ実装されています。ほとんどの場合、ClickHouse Connect は、最初の（null でない）データ値の型を確認することで、その列に対して適切な書き込みフォーマットを自動的に判定しようとします。たとえば、`DateTime` 列に挿入する際に、その列の最初の挿入値が Python の整数であれば、ClickHouse Connect はそれが実際にはエポック秒であるとみなし、その整数値をそのまま挿入します。

多くの場合、データ型ごとに書き込みフォーマットを上書きする必要はありませんが、`clickhouse_connect.datatypes.format` パッケージ内の関連メソッドを使用することで、グローバルレベルで書き込みフォーマットを変更することもできます。

#### 書き込みフォーマットのオプション \\{#write-format-options\\}

| ClickHouse Type       | ネイティブ Python 型   | 書き込みフォーマット | コメント                                                                                                       |
|-----------------------|-------------------------|-----------------------|---------------------------------------------------------------------------------------------------------------|
| Int[8-64], UInt[8-32] | int                     | -                     |                                                                                                               |
| UInt64                | int                     |                       |                                                                                                               |
| [U]Int[128,256]       | int                     |                       |                                                                                                               |
| BFloat16              | float                   |                       |                                                                                                               |
| Float32               | float                   |                       |                                                                                                               |
| Float64               | float                   |                       |                                                                                                               |
| Decimal               | decimal.Decimal         |                       |                                                                                                               |
| String                | string                  |                       |                                                                                                               |
| FixedString           | bytes                   | string                | 文字列として挿入された場合、余剰バイトはゼロで埋められます                                                   |
| Enum[8,16]            | string                  |                       |                                                                                                               |
| Date                  | datetime.date           | int                   | ClickHouse は Date を 1970/01/01 からの日数として保存します。int 型の値はこの「エポック日」値として解釈されます |
| Date32                | datetime.date           | int                   | Date と同様ですが、より広い日付範囲をサポートします                                                          |
| DateTime              | datetime.datetime       | int                   | ClickHouse は DateTime をエポック秒として保存します。int 型の値はこの「エポック秒」値として解釈されます      |
| DateTime64            | datetime.datetime       | int                   | Python の datetime.datetime はマイクロ秒精度に制限されています。生の 64 ビット int 値も利用できます           |
| Time                  | datetime.timedelta      | int, string, time     | ClickHouse は DateTime をエポック秒として保存します。int 型の値はこの「エポック秒」値として解釈されます      |
| Time64                | datetime.timedelta      | int, string, time     | Python の datetime.timedelta はマイクロ秒精度に制限されています。生の 64 ビット int 値も利用できます          |
| IPv4                  | `ipaddress.IPv4Address` | string                | 適切に整形された文字列は IPv4 アドレスとして挿入できます                                                      |
| IPv6                  | `ipaddress.IPv6Address` | string                | 適切に整形された文字列は IPv6 アドレスとして挿入できます                                                      |
| Tuple                 | dict または tuple       |                       |                                                                                                               |
| Map                   | dict                    |                       |                                                                                                               |
| Nested                | Sequence[dict]          |                       |                                                                                                               |
| UUID                  | uuid.UUID               | string                | 適切に整形された文字列は ClickHouse の UUID として挿入できます                                               |
| JSON/Object('json')   | dict                    | string                | 辞書または JSON 文字列のいずれも JSON カラムに挿入できます（`Object('json')` は非推奨です）                 |
| Variant               | object                  |                       | 現時点では、すべての Variant は String として挿入され、ClickHouse サーバー側でパースされます                 |
| Dynamic               | object                  |                       | 警告: 現時点では Dynamic カラムへの挿入はすべて ClickHouse の String として永続化されます                    |

### 専用の挿入メソッド \\{#specialized-insert-methods\\}

ClickHouse Connect には、一般的なデータ形式向けの専用挿入メソッドがあります。

- `insert_df` -- Pandas DataFrame を挿入します。Python のシーケンスのシーケンスである `data` 引数を使用する代わりに、このメソッドの 2 番目のパラメータには、Pandas DataFrame インスタンスでなければならない `df` 引数が必要です。ClickHouse Connect は DataFrame を列指向のデータソースとして自動的に処理するため、`column_oriented` パラメータは不要であり、指定することもできません。
- `insert_arrow` -- PyArrow Table を挿入します。ClickHouse Connect は Arrow テーブルを変更せずに ClickHouse サーバーへ渡して処理させるため、`table` および `arrow_table` に加えて指定できる引数は `database` と `settings` のみです。
- `insert_df_arrow` -- Arrow バックエンドの Pandas DataFrame または Polars DataFrame を挿入します。ClickHouse Connect は DataFrame が Pandas か Polars かを自動的に判別します。Pandas の場合、各列の dtype バックエンドが Arrow ベースであることを検証し、1 つでも Arrow ベースでないものがあればエラーが発生します。

:::note
NumPy 配列は有効なシーケンスのシーケンスであり、メインの `insert` メソッドにおける `data` 引数として使用できるため、専用メソッドは不要です。
:::

#### Pandas DataFrame への挿入 \\{#pandas-dataframe-insert\\}

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

#### PyArrow テーブルへの挿入 \\{#pyarrow-table-insert\\}

```python
import clickhouse_connect
import pyarrow as pa

client = clickhouse_connect.get_client()

arrow_table = pa.table({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
})

client.insert_arrow("users", arrow_table)
```

#### Arrow バックエンドを利用した DataFrame 挿入（pandas 2.x） \\{#arrow-backed-dataframe-insert-pandas-2\\}

```python
import clickhouse_connect
import pandas as pd

client = clickhouse_connect.get_client()

# Convert to Arrow-backed dtypes for better performance
df = pd.DataFrame({
    "id": [1, 2, 3],
    "name": ["Alice", "Bob", "Joe"],
    "age": [25, 30, 28],
}).convert_dtypes(dtype_backend="pyarrow")

client.insert_df_arrow("users", df)
```

### タイムゾーン \\{#time-zones\\}

Python の `datetime.datetime` オブジェクトを ClickHouse の `DateTime` または `DateTime64` カラムに挿入する際、ClickHouse Connect はタイムゾーン情報を自動的に処理します。ClickHouse はすべての DateTime 値を内部的にはタイムゾーン情報を持たない Unix タイムスタンプ（エポックからの秒または小数秒）として保存するため、タイムゾーン変換は挿入時にクライアント側で自動的に行われます。

#### タイムゾーン対応の datetime オブジェクト \\{#timezone-aware-datetime-objects\\}

タイムゾーン情報を持つ Python の `datetime.datetime` オブジェクトを挿入すると、ClickHouse Connect は自動的に `.timestamp()` を呼び出して Unix タイムスタンプに変換し、タイムゾーンオフセットを正しく考慮します。つまり、任意のタイムゾーンの datetime オブジェクトを挿入しても、それらは UTC に対応するタイムスタンプとして正しく保存されます。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()
client.command("CREATE TABLE events (event_time DateTime) ENGINE Memory")

# Insert timezone-aware datetime objects
denver_tz = pytz.timezone('America/Denver')
tokyo_tz = pytz.timezone('Asia/Tokyo')

data = [
    [datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)],
    [denver_tz.localize(datetime(2023, 6, 15, 10, 30, 0))],
    [tokyo_tz.localize(datetime(2023, 6, 15, 10, 30, 0))]
]

client.insert('events', data, column_names=['event_time'])
results = client.query("SELECT * from events")
print(*results.result_rows, sep="\n")
# Output:
# (datetime.datetime(2023, 6, 15, 10, 30),)
# (datetime.datetime(2023, 6, 15, 16, 30),)
# (datetime.datetime(2023, 6, 15, 1, 30),)
```

この例では、3 つの datetime オブジェクトはそれぞれ異なるタイムゾーンを持つため、異なる時点を表します。各オブジェクトは対応する Unix タイムスタンプに正しく変換され、ClickHouse に保存されます。

:::note
pytz を使用する場合、タイムゾーン情報のない（naive な）datetime にタイムゾーン情報を付与するには、`localize()` メソッドを使用する必要があります。`tzinfo=` を直接 datetime コンストラクタに渡すと、過去のオフセットが誤った値になります。UTC の場合は、`tzinfo=pytz.UTC` は正しく動作します。詳細は [pytz docs](https://pythonhosted.org/pytz/#localized-times-and-date-arithmetic) を参照してください。
:::

#### タイムゾーン情報を持たない datetime オブジェクト \\{#timezone-naive-datetime-objects\\}

タイムゾーン情報を持たない Python の `datetime.datetime` オブジェクト（`tzinfo` が設定されていないもの）を挿入すると、`.timestamp()` メソッドはそれをシステムのローカルタイムゾーンとして解釈します。曖昧さを避けるため、次のいずれかを推奨します。

1. 挿入時には常にタイムゾーン情報を持つ datetime オブジェクトを使用する
2. システムのタイムゾーンを UTC に設定しておく
3. 挿入前に手動でエポックタイムスタンプに変換する

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()

# Recommended: Always use timezone-aware datetimes
utc_time = datetime(2023, 6, 15, 10, 30, 0, tzinfo=pytz.UTC)
client.insert('events', [[utc_time]], column_names=['event_time'])

# Alternative: Convert to epoch timestamp manually
naive_time = datetime(2023, 6, 15, 10, 30, 0)
epoch_timestamp = int(naive_time.replace(tzinfo=pytz.UTC).timestamp())
client.insert('events', [[epoch_timestamp]], column_names=['event_time'])
```

#### タイムゾーンメタデータを持つ DateTime カラム \\{#datetime-columns-with-timezone-metadata\\}

ClickHouse のカラムはタイムゾーンメタデータ付きで定義できます（例: `DateTime('America/Denver')` や `DateTime64(3, 'Asia/Tokyo')`）。このメタデータはデータの保存方法には影響せず（データは引き続き UTC タイムスタンプとして保存されます）、ClickHouse からデータをクエリする際に使用されるタイムゾーンを制御します。

そのようなカラムにデータを挿入する場合、ClickHouse Connect は Python の datetime オブジェクトを Unix タイムスタンプに変換します（タイムゾーン情報があればそれを考慮します）。その後データを再度クエリすると、挿入時にどのタイムゾーンを使用していたかに関係なく、ClickHouse Connect はカラムに設定されたタイムゾーンに変換された datetime を返します。

```python
import clickhouse_connect
from datetime import datetime
import pytz

client = clickhouse_connect.get_client()

# Create table with Los Angeles timezone metadata
client.command("CREATE TABLE events (event_time DateTime('America/Los_Angeles')) ENGINE Memory")

# Insert a New York time (10:30 AM EDT, which is 14:30 UTC)
ny_tz = pytz.timezone("America/New_York")
data = ny_tz.localize(datetime(2023, 6, 15, 10, 30, 0))
client.insert("events", [[data]], column_names=["event_time"])

# When queried back, the time is automatically converted to Los Angeles timezone
# 10:30 AM New York (UTC-4) = 14:30 UTC = 7:30 AM Los Angeles (UTC-7)
results = client.query("select * from events")
print(*results.result_rows, sep="\n")
# Output:
# (datetime.datetime(2023, 6, 15, 7, 30, tzinfo=<DstTzInfo 'America/Los_Angeles' PDT-1 day, 17:00:00 DST>),)
```

## ファイルからの挿入 \\{#file-inserts\\}

`clickhouse_connect.driver.tools` パッケージには、既存の ClickHouse テーブルへファイルシステムから直接データを挿入できる `insert_file` メソッドが含まれています。パース処理は ClickHouse サーバー側で行われます。`insert_file` は次のパラメータを受け取ります:

| Parameter        | Type            | Default           | Description                                                                    |
| ---------------- | --------------- | ----------------- | ------------------------------------------------------------------------------ |
| client           | Client          | *Required*        | 挿入処理を実行するために使用される `driver.Client`                                              |
| table            | str             | *Required*        | 挿入先の ClickHouse テーブル。データベース名を含む完全修飾テーブル名も指定できます。                               |
| file&#95;path    | str             | *Required*        | データファイルへのネイティブファイルシステムパス                                                       |
| fmt              | str             | CSV, CSVWithNames | ファイルの ClickHouse Input Format。`column_names` が指定されていない場合は CSVWithNames が使用されます |
| column&#95;names | Sequence of str | *None*            | データファイル内のカラム名リスト。カラム名を含むフォーマットの場合は必須ではありません                                    |
| database         | str             | *None*            | テーブルのデータベース。テーブルが完全修飾されている場合は無視されます。指定されていない場合は、クライアントのデータベースが使用されます           |
| settings         | dict            | *None*            | [settings description](driver-api.md#settings-argument) を参照してください。             |
| compression      | str             | *None*            | Content-Encoding HTTP ヘッダーに使用される、ClickHouse で認識される圧縮形式 (zstd, lz4, gzip)       |

不整合なデータを含むファイルや、日付/時刻値が通常とは異なる形式で記述されているファイルについては、このメソッドでもデータインポートに適用される設定（`input_format_allow_errors_num` や `input_format_allow_errors_num` など）が有効になります。

```python
import clickhouse_connect
from clickhouse_connect.driver.tools import insert_file

client = clickhouse_connect.get_client()
insert_file(client, 'example_table', 'my_data.csv',
            settings={'input_format_allow_errors_ratio': .2,
                      'input_format_allow_errors_num': 5})
```
