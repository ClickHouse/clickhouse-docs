---
description: 'ClickHouse での Prometheus プロトコルサポートのドキュメント'
sidebar_label: 'Prometheus プロトコル'
sidebar_position: 19
slug: '/interfaces/prometheus'
title: 'Prometheus プロトコル'
---




# Prometheusプロトコル

## メトリクスの公開 {#expose}

:::note
ClickHouse Cloudを使用している場合、[Prometheus Integration](/integrations/prometheus)を使用してPrometheusにメトリクスを公開できます。
:::

ClickHouseは、Prometheusからスクレイピングするための自分のメトリクスを公開できます:

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
このセクションは [<http_handlers>](/interfaces/http) と似ていますが、prometheusプロトコル用に機能します:

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

| 名前                          | デフォルト  | 説明                                                                                                                                                                                          |
|-------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                        | なし        | メトリクス公開プロトコルの提供に使用されるポート。                                                                                                                                          |
| `endpoint`                    | `/metrics`  | prometheusサーバーによるメトリクスのスクレイピング用HTTPエンドポイント。`/`で始まります。`<handlers>`セクションと一緒には使用できません。                                                        |
| `url` / `headers` / `method`  | なし         | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http)セクションの同名のフィールドと似ています。                                      |
| `metrics`                     | true        | [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。                                                                                                 |
| `asynchronous_metrics`        | true        | [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。                                                             |
| `events`                      | true        | [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。                                                                                                     |
| `errors`                      | true        | 最後のサーバー再起動以降に発生したエラーコードによるエラー数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。                                         |

確認（`127.0.0.1` をあなたのClickHouseサーバーのIPアドレスまたはホスト名に置き換えます）:
```bash
curl 127.0.0.1:9363/metrics
```

## リモート書き込みプロトコル {#remote-write}

ClickHouseは [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) プロトコルをサポートしています。
データはこのプロトコルによって受信され、[TimeSeries](/engines/table-engines/special/time_series) テーブルに書き込まれます（テーブルは事前に作成する必要があります）。

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

| 名前                          | デフォルト | 説明                                                                                                                                                                                              |
|-------------------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                        | なし       | `remote-write`プロトコルの提供に使用されるポート。                                                                                                                                               |
| `url` / `headers` / `method`  | なし        | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http)セクションの同名のフィールドと似ています。                                        |
| `table`                      | なし       | `remote-write`プロトコルで受信したデータを書き込む[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前にはオプションでデータベース名を含めることができます。   |
| `database`                   | なし       | `table`設定で指定されたテーブルが存在するデータベース名（`table`設定で指定されていない場合）。                                                                                              |

## リモート読み込みプロトコル {#remote-read}

ClickHouseは [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) プロトコルをサポートしています。
データは[TimeSeries](/engines/table-engines/special/time_series) テーブルから読み取られ、このプロトコルを介して送信されます。

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

| 名前                          | デフォルト | 説明                                                                                                                                                                                        |
|-------------------------------|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                        | なし       | `remote-read`プロトコルの提供に使用されるポート。                                                                                                                                         |
| `url` / `headers` / `method`  | なし        | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http)セクションの同名のフィールドと似ています。                                    |
| `table`                      | なし       | `remote-read`プロトコルによって送信されるデータを読み取る[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前にはオプションでデータベース名を含めることができます。 |
| `database`                   | なし       | `table`設定で指定されたテーブルが存在するデータベース名（`table`設定で指定されていない場合）。                                                                                          |

## 複数プロトコルの設定 {#multiple-protocols}

複数のプロトコルを1つの場所に指定できます:

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
