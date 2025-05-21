---
description: 'ClickHouseにおけるPrometheusプロトコルサポートのドキュメント'
sidebar_label: 'Prometheusプロトコル'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Prometheusプロトコル'
---


# Prometheusプロトコル

## メトリクスの公開 {#expose}

:::note
ClickHouse Cloudを使用している場合は、[Prometheus Integration](/integrations/prometheus)を使用してPrometheusにメトリクスを公開できます。
:::

ClickHouseは、Prometheusからスクレイピングのために独自のメトリクスを公開できます：

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
このセクションは、[<http_handlers>](/interfaces/http)と似ていますが、prometheusプロトコルのために機能します：

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

設定：

| 名前                         | デフォルト    | 説明                                                                                                                                                                                      |
|------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none          | メトリクス公開プロトコル用のポート。                                                                                                                                                   |
| `endpoint`                   | `/metrics`    | prometheusサーバーによるメトリクスのスクレイピング用のHTTPエンドポイント。`/`で始まります。`<handlers>`セクションと一緒に使用してはいけません。                                                                 |
| `url` / `headers` / `method` | none          | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。同名のフィールドと同様に、[`<http_handlers>`](/interfaces/http)セクションに存在します。                             |
| `metrics`                    | true          | [system.metrics](/operations/system-tables/metrics)テーブルからのメトリクスを公開します。                                                                                                    |
| `asynchronous_metrics`       | true          | [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics)テーブルからの現在のメトリクス値を公開します。                                                                        |
| `events`                     | true          | [system.events](/operations/system-tables/events)テーブルからのメトリクスを公開します。                                                                                                    |
| `errors`                     | true          | 最後のサーバー再起動以来発生したエラーコードによるエラーの数を公開します。この情報は、[system.errors](/operations/system-tables/errors)からも取得できます。                                    |

確認（`127.0.0.1`をClickHouseサーバーのIPアドレスまたはホスト名に置き換えます）：
```bash
curl 127.0.0.1:9363/metrics
```

## リモートライティングプロトコル {#remote-write}

ClickHouseは[remote-write](https://prometheus.io/docs/specs/remote_write_spec/)プロトコルをサポートしています。
データはこのプロトコルによって受信され、[TimeSeries](/engines/table-engines/special/time_series)テーブルに書き込まれます
（このテーブルは事前に作成しておく必要があります）。

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

設定：

| 名前                         | デフォルト | 説明                                                                                                                                                                                         |
|------------------------------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none       | `remote-write`プロトコル用のポート。                                                                                                                                                       |
| `url` / `headers` / `method` | none       | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。同名のフィールドと同様に、[`<http_handlers>`](/interfaces/http)セクションに存在します。                                   |
| `table`                      | none       | `remote-write`プロトコルによって受信したデータを書き込む[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前はオプションでデータベースの名前も含むことができます。   |
| `database`                   | none       | `table`設定で指定されたテーブルが存在するデータベースの名前（`table`設定で指定されていない場合）。                                                                                       |

## リモートリードプロトコル {#remote-read}

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

設定：

| 名前                         | デフォルト | 説明                                                                                                                                                                                        |
|------------------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `port`                       | none       | `remote-read`プロトコル用のポート。                                                                                                                                                      |
| `url` / `headers` / `method` | none       | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。同名のフィールドと同様に、[`<http_handlers>`](/interfaces/http)セクションに存在します。                                         |
| `table`                      | none       | `remote-read`プロトコルによって送信されるデータを読み取るための[TimeSeries](/engines/table-engines/special/time_series)テーブルの名前。この名前はオプションでデータベースの名前も含むことができます。        |
| `database`                   | none       | `table`設定で指定されたテーブルが存在するデータベースの名前（`table`設定で指定されていない場合）。                                                                                                |

## 複数プロトコルの設定 {#multiple-protocols}

複数のプロトコルを1か所で合わせて指定することができます：

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
