---
slug: /interfaces/prometheus
sidebar_position: 19
sidebar_label: Prometheusプロトコル
---

# Prometheusプロトコル

## メトリクスの公開 {#expose}

:::note
ClickHouse Cloudを使用している場合、[Prometheus統合](/integrations/prometheus)を使用してメトリクスをPrometheusに公開できます。
:::

ClickHouseは、Prometheusからスクレイピングされるためのメトリクスを公開できます：

```xml
<prometheus>
    <port>9363</port>
    <endpoint>/metrics</endpoint>
    <metrics>true</metrics>
    <asynchronous_metrics>true</asynchronous_metrics>
    <events>true</events>
    <errors>true</errors>
</prometheus>

セクション `<prometheus.handlers>` は、より拡張されたハンドラーを作成するために使用できます。
このセクションは、[<http_handlers>](/interfaces/http)と似ていますが、Prometheusプロトコル専用です：

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
|------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | なし       | メトリクス公開プロトコルを提供するためのポート。                                                                                                                                              |
| `endpoint`                   | `/metrics` | Prometheusサーバーによるメトリクスのスクレイピング用のHTTPエンドポイント。`/`で始まります。`<handlers>`セクションでは使用しないでください。                                                                  |
| `url` / `headers` / `method` | なし       | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http)セクションの同じ名前を持つフィールドと類似しています。                                    |
| `metrics`                    | true       | [system.metrics](/operations/system-tables/metrics)テーブルからメトリクスを公開します。                                                                                                        |
| `asynchronous_metrics`       | true       | [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルから現在のメトリクス値を公開します。                                                               |
| `events`                     | true       | [system.events](/operations/system-tables/events)テーブルからメトリクスを公開します。                                                                                                          |
| `errors`                     | true       | サーバー再起動以来発生したエラーコードごとのエラー数を公開します。この情報は、[system.errors](/operations/system-tables/errors)からも取得できます。 |

確認するには（`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えます）：
```bash
curl 127.0.0.1:9363/metrics
```

## リモート書き込みプロトコル {#remote-write}

ClickHouseは[remote-write](https://prometheus.io/docs/specs/remote_write_spec/)プロトコルをサポートしています。
データはこのプロトコルによって受信され、[TimeSeries](/engines/table-engines/special/time_series)テーブルに書き込まれます（事前に作成しておく必要があります）。

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
| `port`                       | なし    | `remote-write`プロトコルを提供するためのポート。                                                                                                                                                       |
| `url` / `headers` / `method` | なし    | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http)セクションの同じ名前を持つフィールドと類似しています。                                           |
| `table`                      | なし    | `remote-write`プロトコルで受信したデータを書き込むための[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前には、データベース名を含めることもできます。 |
| `database`                   | なし    | `table`設定で指定されたテーブルが存在するデータベースの名前。`table`設定で指定されていない場合。                                                                    |

## リモート読み取りプロトコル {#remote-read}

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

| 名前                         | デフォルト | 説明                                                                                                                                                                                      |
|------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | なし    | `remote-read`プロトコルを提供するためのポート。                                                                                                                                                     |
| `url` / `headers` / `method` | なし    | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http)セクションの同じ名前を持つフィールドと類似しています。                                        |
| `table`                      | なし    | `remote-read`プロトコルで送信するデータを読み取るための[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前には、データベース名を含めることもできます。 |
| `database`                   | なし    | `table`設定で指定されたテーブルが存在するデータベースの名前。`table`設定で指定されていない場合。                                                                 |

## 複数プロトコルの設定 {#multiple-protocols}

複数のプロトコルを一か所で指定できます：

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
