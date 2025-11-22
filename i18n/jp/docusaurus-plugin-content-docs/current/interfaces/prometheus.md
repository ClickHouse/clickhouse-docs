---
description: 'ClickHouse における Prometheus プロトコルサポートに関するドキュメント'
sidebar_label: 'Prometheus プロトコル'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Prometheus プロトコル'
doc_type: 'reference'
---



# Prometheus プロトコル



## メトリクスの公開 {#expose}

:::note
ClickHouse Cloudを使用している場合は、[Prometheus Integration](/integrations/prometheus)を使用してPrometheusにメトリクスを公開できます。
:::

ClickHouseは、Prometheusによるスクレイピングのために独自のメトリクスを公開できます:

````xml
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

`<prometheus.handlers>`セクションを使用して、より拡張されたハンドラーを作成できます。
このセクションは[<http_handlers>](/interfaces/http)と似ていますが、Prometheusプロトコル用に動作します:

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
````

設定:

| 名前                         | デフォルト    | 説明                                                                                                                                                                               |
| ---------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none       | メトリクス公開プロトコルを提供するためのポート。                                                                                                                                           |
| `endpoint`                   | `/metrics` | Prometheusサーバーによるメトリクススクレイピング用のHTTPエンドポイント。`/`で始まります。`<handlers>`セクションと併用しないでください。                                                               |
| `url` / `headers` / `method` | none       | リクエストに一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http)セクションの同名フィールドと同様です。                                    |
| `metrics`                    | true       | [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開します。                                                                                                        |
| `asynchronous_metrics`       | true       | [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから現在のメトリクス値を公開します。                                                               |
| `events`                     | true       | [system.events](/operations/system-tables/events)テーブルからメトリクスを公開します。                                                                                                          |
| `errors`                     | true       | 最後のサーバー再起動以降に発生したエラーコード別のエラー数を公開します。この情報は[system.errors](/operations/system-tables/errors)からも取得できます。 |
| `histograms`                 | true       | [system.histogram_metrics](/operations/system-tables/histogram_metrics)からヒストグラムメトリクスを公開します                                                                                     |
| `dimensional_metrics`        | true       | [system.dimensional_metrics](/operations/system-tables/dimensional_metrics)から次元メトリクスを公開します                                                                               |

確認(`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えてください):

```bash
curl 127.0.0.1:9363/metrics
```


## Remote-writeプロトコル {#remote-write}

ClickHouseは[remote-write](https://prometheus.io/docs/specs/remote_write_spec/)プロトコルをサポートしています。
このプロトコルで受信したデータは、[TimeSeries](/engines/table-engines/special/time_series)テーブル
(事前に作成しておく必要があります)に書き込まれます。

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

| 名前                         | デフォルト | 説明                                                                                                                                                                                      |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `port`                       | なし    | `remote-write`プロトコルを提供するポート。                                                                                                                                                    |
| `url` / `headers` / `method` | なし    | リクエストに一致するハンドラを検索するために使用されるフィルタ。[`<http_handlers>`](/interfaces/http)セクションの同名のフィールドと同様です。                                           |
| `table`                      | なし    | `remote-write`プロトコルで受信したデータを書き込む[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前にはオプションでデータベース名を含めることもできます。 |
| `database`                   | なし    | `table`設定で指定されたテーブルが配置されているデータベースの名前。`table`設定でデータベース名が指定されていない場合に使用されます。                                                                 |


## Remote-readプロトコル {#remote-read}

ClickHouseは[remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/)プロトコルをサポートしています。
データは[TimeSeries](/engines/table-engines/special/time_series)テーブルから読み取られ、このプロトコルを介して送信されます。

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

| 名前                         | デフォルト | 説明                                                                                                                                                                                   |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | なし    | `remote-read`プロトコルを提供するポート。                                                                                                                                                  |
| `url` / `headers` / `method` | なし    | リクエストに一致するハンドラを検索するために使用されるフィルタ。[`<http_handlers>`](/interfaces/http)セクションの同名フィールドと同様です。                                        |
| `table`                      | なし    | `remote-read`プロトコルで送信するデータを読み取る[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前にはデータベース名を含めることもできます。 |
| `database`                   | なし    | `table`設定で指定されたテーブルが配置されているデータベースの名前。`table`設定でデータベース名が指定されていない場合に使用されます。                                                              |


## 複数プロトコルの設定 {#multiple-protocols}

複数のプロトコルを1箇所にまとめて指定できます:

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
