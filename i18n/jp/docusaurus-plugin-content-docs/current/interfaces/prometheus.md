---
description: 'ClickHouse の Prometheus プロトコルサポートに関するドキュメント'
sidebar_label: 'Prometheus プロトコル'
sidebar_position: 19
slug: /interfaces/prometheus
title: 'Prometheus プロトコル'
doc_type: 'reference'
---

# Prometheus プロトコル {#prometheus-protocols}

## メトリクスの公開 {#expose}

:::note
ClickHouse Cloud を使用している場合、[Prometheus Integration](/integrations/prometheus) を利用して Prometheus にメトリクスを公開できます。
:::

ClickHouse は、自身のメトリクスを Prometheus からスクレイプできる形で公開できます。

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

`<prometheus.handlers>` セクションを使用することで、より高度なハンドラーを作成できます。
このセクションは [<http_handlers>](/interfaces/http) と同様ですが、Prometheusプロトコルに対応します:

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

Settings:

| Name                         | Default    | Description                                                                                                |
| ---------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| `port`                       | none       | メトリクス公開用プロトコルを提供するポート。                                                                                     |
| `endpoint`                   | `/metrics` | Prometheus サーバーによるメトリクスのスクレイプ用 HTTP エンドポイント。`/` から開始します。`&lt;handlers&gt;` セクションと組み合わせて使用しないでください。         |
| `url` / `headers` / `method` | none       | リクエストにマッチするハンドラーを特定するために使用されるフィルター。同名フィールドを持つ [`&lt;http_handlers&gt;`](/interfaces/http) セクションと同様です。      |
| `metrics`                    | true       | [system.metrics](/operations/system-tables/metrics) テーブルからメトリクスを公開します。                                     |
| `asynchronous_metrics`       | true       | [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics) テーブルから現在のメトリクス値を公開します。   |
| `events`                     | true       | [system.events](/operations/system-tables/events) テーブルからメトリクスを公開します。                                       |
| `errors`                     | true       | サーバーの最後の再起動以降に発生した、エラーコードごとのエラー数を公開します。この情報は [system.errors](/operations/system-tables/errors) からも取得できます。  |
| `histograms`                 | true       | [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) テーブルからヒストグラムメトリクスを公開します。       |
| `dimensional_metrics`        | true       | [system.dimensional&#95;metrics](/operations/system-tables/dimensional_metrics) テーブルからディメンショナルメトリクスを公開します。 |

確認（`127.0.0.1` を ClickHouse サーバーの IP アドレスまたはホスト名に置き換えてください）:

```bash
curl 127.0.0.1:9363/metrics
```

## Remote-write プロトコル {#remote-write}

ClickHouse は [remote-write](https://prometheus.io/docs/specs/remote_write_spec/) プロトコルをサポートしています。
このプロトコルを通じてデータを受信し、[TimeSeries](/engines/table-engines/special/time_series) テーブルに書き込みます
（テーブルは事前に作成しておく必要があります）。

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

| Name                         | Default | Description                                                                                                                      |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | `remote-write` プロトコル用に待ち受けるポート。                                                                                                  |
| `url` / `headers` / `method` | none    | リクエストに対して一致するハンドラーを見つけるために使用されるフィルター。[`<http_handlers>`](/interfaces/http) セクション内の同名フィールドと同様です。                                  |
| `table`                      | none    | `remote-write` プロトコルで受信したデータを書き込む [TimeSeries](/engines/table-engines/special/time_series) テーブルの名前。この名前には、任意でデータベース名も含めることができます。 |
| `database`                   | none    | `table` 設定で指定されたテーブル名にデータベース名が含まれていない場合に、そのテーブルが存在するデータベースの名前。                                                                   |

## リモートリードプロトコル {#remote-read}

ClickHouse は [remote-read](https://prometheus.io/docs/prometheus/latest/querying/remote_read_api/) プロトコルをサポートしています。
データは [TimeSeries](/engines/table-engines/special/time_series) テーブルから読み出され、このプロトコル経由で送信されます。

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

| Name                         | Default | Description                                                                                                                        |
| ---------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `port`                       | none    | `remote-read` プロトコルを待ち受けるためのポート。                                                                                                   |
| `url` / `headers` / `method` | none    | リクエストに対して一致するハンドラーを見つけるために使用されるフィルタ。[`<http_handlers>`](/interfaces/http) セクション内の同名フィールドと同様です。                                     |
| `table`                      | none    | `remote-read` プロトコルで送信するデータを読み取るための [TimeSeries](/engines/table-engines/special/time_series) テーブル名。この名前にはオプションでデータベース名も含めることができます。 |
| `database`                   | none    | `table` 設定で指定されたテーブルが存在するデータベース名。テーブル名にデータベース名が含まれていない場合に使用されます。                                                                   |

## 複数プロトコルの設定 {#multiple-protocols}

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
