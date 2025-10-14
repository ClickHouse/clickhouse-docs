---
'description': 'ClickHouse における Prometheus プロトコルサポートの Documentation'
'sidebar_label': 'Prometheus プロトコル'
'sidebar_position': 19
'slug': '/interfaces/prometheus'
'title': 'Prometheus プロトコル'
'doc_type': 'reference'
---


# Prometheus プロトコル

## メトリクスの公開 {#expose}

:::note
ClickHouse Cloud を使用している場合は、[Prometheus Integration](/integrations/prometheus) を使用してメトリクスを Prometheus に公開できます。
:::

ClickHouseは、Prometheusからのスクレイピングのために独自のメトリクスを公開できます：

```xml
<prometheus>
    <port>9363</port>
    <endpoint>/metrics</endpoint>
    <metrics>true</metrics>
    <asynchronous_metrics>true</asynchronous_metrics>
    <events>true</events>
    <errors>true</errors>
    <histograms>true</histograms>
    <dimensional_metrics>true</dimensional_metrics>
</prometheus>

Section `<prometheus.handlers>` can be used to make more extended handlers.
This section is similar to [<http_handlers>](/interfaces/http) but works for prometheus protocols:

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/metrics</url>
            <handler>
                <type>expose_metrics</type>
                <metrics>true</metrics>
                <asynchronous_metrics>true</asynchronous_metrics>
                <events>true</events>
                <errors>true</errors>
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

設定:

| 名称                         | デフォルト  | 説明                                                                                                                                                                                  |
|------------------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | なし       | メトリクスを公開するプロトコルのためのポート。                                                                                                                                              |
| `endpoint`                   | `/metrics` | Prometheus サーバーがメトリクスをスクレイピングするための HTTP エンドポイント。`/`で始まります。`<handlers>` セクションとは併用しないでください。                                                                  |
| `url` / `headers` / `method` | なし       | リクエストに対するマッチングハンドラを見つけるために使用されるフィルタ。[`<http_handlers>`](/interfaces/http) セクションの同名のフィールドと類似しています。                                    |
| `metrics`                    | true       | [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。                                                                                                        |
| `asynchronous_metrics`       | true       | [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。                                                               |
| `events`                     | true       | [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。                                                                                                          |
| `errors`                     | true       | 最後のサーバー再起動以来発生したエラーコードによるエラーの数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。 |
| `histograms`                 | true       | [system.histogram_metrics](/operations/system-tables/histogram_metrics) からヒストグラム メトリクスを公開します。 |
| `dimensional_metrics`        | true       | [system.dimensional_metrics](/operations/system-tables/dimensional_metrics) から次元メトリクスを公開します。 |

チェック (ClickHouse サーバーの IP アドレスまたはホスト名で `127.0.0.1` を置き換えます):
```bash
curl 127.0.0.1:9363/metrics
```

## リモート書き込みプロトコル {#remote-write}

ClickHouseは [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) プロトコルをサポートしています。
データはこのプロトコルで受信され、[TimeSeries](/engines/table-engines/special/time_series) テーブルに書き込まれます
（これは事前に作成しておく必要があります）。

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/write</url>
            <handler>
                <type>remote_write</type>
                <database>db_name</database>
                <table>time_series_table</table>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

設定:

| 名称                         | デフォルト | 説明                                                                                                                                                                                         |
|------------------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | なし    | `remote-write` プロトコルを提供するためのポート。                                                                                                                                                       |
| `url` / `headers` / `method` | なし    | リクエストに対するマッチングハンドラを見つけるために使用されるフィルタ。[`<http_handlers>`](/interfaces/http) セクションの同名のフィールドと類似しています。                                           |
| `table`                      | なし    | `remote-write` プロトコルで受信したデータを書き込む [TimeSeries](/engines/table-engines/special/time_series) テーブルの名前。この名前にはオプションでデータベースの名前も含むことができます。 |
| `database`                   | なし    | `table` 設定で指定されたテーブルが存在するデータベースの名前が指定されていない場合、そのデータベースの名前。                                                                    |

## リモート読み取りプロトコル {#remote-read}

ClickHouseは [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) プロトコルをサポートしています。
データは [TimeSeries](/engines/table-engines/special/time_series) テーブルから読み取られ、このプロトコルで送信されます。

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/read</url>
            <handler>
                <type>remote_read</type>
                <database>db_name</database>
                <table>time_series_table</table>
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

設定:

| 名称                         | デフォルト | 説明                                                                                                                                                                                      |
|------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | なし    | `remote-read` プロトコルを提供するためのポート。                                                                                                                                                     |
| `url` / `headers` / `method` | なし    | リクエストに対するマッチングハンドラを見つけるために使用されるフィルタ。[`<http_handlers>`](/interfaces/http) セクションの同名のフィールドと類似しています。                                        |
| `table`                      | なし    | `remote-read` プロトコルで送信するデータを読み取るための [TimeSeries](/engines/table-engines/special/time_series) テーブルの名前。この名前にはオプションでデータベースの名前も含むことができます。 |
| `database`                   | なし    | `table` 設定で指定されたテーブルが存在するデータベースの名前が指定されていない場合、そのデータベースの名前。                                                                 |

## 複数プロトコルの設定 {#multiple-protocols}

複数のプロトコルを一箇所で指定できます：

```xml
<prometheus>
    <port>9363</port>
    <handlers>
        <my_rule_1>
            <url>/metrics</url>
            <handler>
                <type>expose_metrics</type>
                <metrics>true</metrics>
                <asynchronous_metrics>true</asynchronous_metrics>
                <events>true</events>
                <errors>true</errors>
                <histograms>true</histograms>
                <dimensional_metrics>true</dimensional_metrics>
            </handler>
        </my_rule_1>
        <my_rule_2>
            <url>/write</url>
            <handler>
                <type>remote_write</type>
                <table>db_name.time_series_table</table>
            </handler>
        </my_rule_2>
        <my_rule_3>
            <url>/read</url>
            <handler>
                <type>remote_read</type>
                <table>db_name.time_series_table</table>
            </handler>
        </my_rule_3>
    </handlers>
</prometheus>
```
