---
description: 'ClickHouse における Prometheus プロトコルサポートのドキュメント'
sidebar_label: 'Prometheus プロトコル'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Prometheus プロトコル'
doc_type: 'リファレンス'
---

# Prometheus プロトコル \{#prometheus-protocols\}

## メトリクスの公開 \{#expose\}

:::note
ClickHouse Cloud を使用している場合は、[Prometheus Integration](/integrations/prometheus) を使って Prometheus にメトリクスを公開できます。
:::

ClickHouse は、自身のメトリクスを Prometheus によるスクレイプ用に公開できます。

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
````

設定:

| 名前                           | デフォルト      | 説明                                                                                                        |
| ---------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| `port`                       | なし         | メトリクス公開プロトコルを待ち受けるポート。                                                                                    |
| `endpoint`                   | `/metrics` | Prometheus サーバーがメトリクスをスクレイプするための HTTP エンドポイント。`/` で始まります。`<handlers>` セクションと併用すべきではありません。                 |
| `url` / `headers` / `method` | なし         | リクエストに一致するハンドラーを特定するために使用されるフィルター。[`<http_handlers>`](/interfaces/http) セクション内の同名フィールドと同様です。              |
| `metrics`                    | true       | [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。                                    |
| `asynchronous_metrics`       | true       | [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。  |
| `events`                     | true       | [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。                                      |
| `errors`                     | true       | サーバーの最後の再起動以降に、エラーコードごとに発生したエラー数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。 |
| `histograms`                 | true       | [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) からヒストグラムメトリクスを公開します。          |
| `dimensional_metrics`        | true       | [system.dimensional&#95;metrics](/operations/system-tables/dimensional_metrics) からディメンショナルメトリクスを公開します。    |

確認（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）:

```bash
curl 127.0.0.1:9363/metrics
```

## Remote-write プロトコル

ClickHouse は [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) プロトコルをサポートしています。
このプロトコルで受信したデータは、[TimeSeries](/engines/table-engines/special/time_series) テーブルに書き込まれます
（あらかじめ作成しておく必要があります）。

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

Settings:

| Name                         | Default | Description                                                                                                              |
| ---------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `port`                       | none    | `remote-write` プロトコルを提供するポート。                                                                                            |
| `url` / `headers` / `method` | none    | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。同名フィールドについては、[`<http_handlers>`](/interfaces/http) セクションと同様。                        |
| `table`                      | none    | `remote-write` プロトコルで受信したデータを書き込む [TimeSeries](/engines/table-engines/special/time_series) テーブルの名前。任意でデータベース名を含めることもできる。 |
| `database`                   | none    | `table` 設定でデータベース名が指定されていない場合に、`table` 設定で指定されたテーブルが存在するデータベース名。                                                         |

## remote-read プロトコル

ClickHouse は [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) プロトコルをサポートしています。
データは [TimeSeries](/engines/table-engines/special/time_series) テーブルから読み出され、このプロトコルを介して送信されます。

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

Settings:

| Name                         | Default | Description                                                                                                                         |
| ---------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | `remote-read` プロトコルを提供するためのポート。                                                                                                     |
| `url` / `headers` / `method` | none    | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http) セクション内の同名フィールドと同様の意味を持ちます。                               |
| `table`                      | none    | `remote-read` プロトコルで送信するデータを読み取る対象の [TimeSeries](/engines/table-engines/special/time_series) テーブル名。この名前には、オプションでデータベース名も含めることができます。 |
| `database`                   | none    | `table` 設定で指定したテーブルについて、`table` 設定内でデータベース名を指定していない場合に、そのテーブルが存在するデータベース名。                                                          |

## 複数プロトコルの設定

複数のプロトコルを 1 か所でまとめて指定できます。

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
