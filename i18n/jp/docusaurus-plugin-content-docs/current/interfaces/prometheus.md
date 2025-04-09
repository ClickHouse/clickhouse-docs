---
slug: /interfaces/prometheus
sidebar_position: 19
sidebar_label: Prometheusプロトコル
---


# Prometheusプロトコル

## メトリクスの公開 {#expose}

:::note
ClickHouse Cloudを使用している場合は、[Prometheus Integration](/integrations/prometheus)を使用してメトリクスをPrometheusに公開できます。
:::

ClickHouseは、Prometheusからスクレイピングされるための独自のメトリクスを公開できます：

```xml
<prometheus>
    <port>9363</port>
    <endpoint>/metrics</endpoint>
    <metrics>true</metrics>
    <asynchronous_metrics>true</asynchronous_metrics>
    <events>true</events>
    <errors>true</errors>
</prometheus>

Section `<prometheus.handlers>`は、より拡張されたハンドラーを作成するために使用できます。
このセクションは[<http_handlers>](/interfaces/http)に似ていますが、prometheusプロトコル用に機能します：

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
            </handler>
        </my_rule_1>
    </handlers>
</prometheus>
```

設定:

| 名前                         | デフォルト    | 説明                                                                                                                                                                                  |
|------------------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none       | メトリクス公開プロトコル用のポート。                                                                                                                                              |
| `endpoint`                   | `/metrics` | prometheusサーバーによるメトリクスのスクレイピングのためのHTTPエンドポイント。`/`で始める必要があります。`<handlers>`セクションでは使用しないでください。                                                                  |
| `url` / `headers` / `method` | none       | リクエストに対して一致するハンドラーを見つけるために使用するフィルター。[`<http_handlers>`](/interfaces/http)セクションの同名のフィールドに類似しています。                                    |
| `metrics`                    | true       | [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開します。                                                                                                        |
| `asynchronous_metrics`       | true       | [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから現在のメトリクス値を公開します。                                                               |
| `events`                     | true       | [system.events](/operations/system-tables/events)テーブルからメトリクスを公開します。                                                                                                          |
| `errors`                     | true       | 最後のサーバー再起動以降に発生したエラーコード別のエラー数を公開します。この情報は、[system.errors](/operations/system-tables/errors)からも取得できます。 |

確認する（`127.0.0.1`をClickHouseサーバーのIPアドレスやホスト名に置き換えます）：
```bash
curl 127.0.0.1:9363/metrics
```

## リモート書き込みプロトコル {#remote-write}

ClickHouseは、[remote-write](https://prometheus.io/docs/specs/remote_write_spec/)プロトコルをサポートしています。
データはこのプロトコルで受信され、[TimeSeries](/engines/table-engines/special/time_series)テーブル（事前に作成しておく必要があります）に書き込まれます。

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

| 名前                         | デフォルト | 説明                                                                                                                                                                                         |
|------------------------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none    | `remote-write`プロトコル用のポート。                                                                                                                                                       |
| `url` / `headers` / `method` | none    | リクエストに対して一致するハンドラーを見つけるために使用するフィルター。[`<http_handlers>`](/interfaces/http)セクションの同名のフィールドに類似しています。                                           |
| `table`                      | none    | `remote-write`プロトコルで受信したデータを書き込む[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前にはデータベースの名前を含めることもできます。 |
| `database`                   | none    | `table`設定に指定されたテーブルが存在するデータベースの名前。この設定で指定されていない場合に使用されます。                                                                    |

## リモート読み込みプロトコル {#remote-read}

ClickHouseは、[remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/)プロトコルをサポートしています。
データは[TimeSeries](/engines/table-engines/special/time_series)テーブルから読み取られ、このプロトコルで送信されます。

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

| 名前                         | デフォルト | 説明                                                                                                                                                                                      |
|------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none    | `remote-read`プロトコル用のポート。                                                                                                                                                     |
| `url` / `headers` / `method` | none    | リクエストに対して一致するハンドラーを見つけるために使用するフィルター。[`<http_handlers>`](/interfaces/http)セクションの同名のフィールドに類似しています。                                        |
| `table`                      | none    | `remote-read`プロトコルで送信するデータを読み取る[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前にはデータベースの名前を含めることもできます。 |
| `database`                   | none    | `table`設定に指定されたテーブルが存在するデータベースの名前。この設定で指定されていない場合に使用されます。                                                                 |

## 複数プロトコルの設定 {#multiple-protocols}

複数のプロトコルを同じ場所で一緒に指定することができます：

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
