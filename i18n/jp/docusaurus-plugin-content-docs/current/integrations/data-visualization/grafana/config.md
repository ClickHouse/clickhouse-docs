---
sidebar_label: 'プラグイン設定'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Grafana における ClickHouse データソースプラグインの設定オプション'
title: 'Grafana における ClickHouse データソースの設定'
doc_type: 'guide'
keywords: ['Grafana プラグイン設定', 'データソース設定', '接続パラメータ', '認証設定', 'プラグインオプション']
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# Grafana での ClickHouse データソースの設定 \\{#configuring-clickhouse-data-source-in-grafana\\}

<ClickHouseSupportedBadge/>

設定を変更する最も簡単な方法は、Grafana の UI にあるプラグイン設定ページで行うことですが、データソースは[YAML ファイルでプロビジョニングする](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)こともできます。

このページでは、ClickHouse プラグインで設定可能なオプションの一覧と、YAML ファイルでデータソースをプロビジョニングする場合の設定スニペットを示します。

すべてのオプションを手早く把握したい場合は、設定オプションの完全な一覧を[こちら](#all-yaml-options)で確認できます。

## 共通設定 \\{#common-settings\\}

設定画面の例:

<Image size="sm" img={config_common} alt="セキュアなネイティブ設定の例" border />

共通設定向けの設定 YAML の例:

```yaml
jsonData:
  host: 127.0.0.1 # (required) server address.
  port: 9000      # (required) server port. For native, defaults to 9440 secure and 9000 insecure. For HTTP, defaults to 8443 secure and 8123 insecure.

  protocol: native # (required) the protocol used for the connection. Can be set to "native" or "http".
  secure: false    # set to true if the connection is secure.

  username: default # the username used for authentication.

  tlsSkipVerify:     <boolean> # skips TLS verification when set to true.
  tlsAuth:           <boolean> # set to true to enable TLS client authentication.
  tlsAuthWithCACert: <boolean> # set to true if CA certificate is provided. Required for verifying self-signed TLS certificates.

secureJsonData:
  password: secureExamplePassword # the password used for authentication.

  tlsCACert:     <string> # TLS CA certificate
  tlsClientCert: <string> # TLS client certificate
  tlsClientKey:  <string> # TLS client key
```

UI から構成を保存すると、`version` プロパティが追加されることに注意してください。これは、その構成を保存したプラグインのバージョンを示します。

### HTTP プロトコル \\{#http-protocol\\}

HTTP プロトコル経由で接続する場合、追加の設定項目が表示されます。

<Image size="md" img={config_http} alt="追加の HTTP 設定オプション" border />

#### HTTP パス \\{#http-path\\}

HTTP サーバーが別の URL パスで公開されている場合は、ここに追加できます。

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### カスタム HTTP ヘッダー \\{#custom-http-headers\\}

サーバーに送信されるリクエストにカスタムヘッダーを追加できます。

ヘッダーはプレーンテキストまたはセキュア値として指定できます。
すべてのヘッダーキーはプレーンテキストで保存され、セキュアヘッダーの値はセキュア設定に保存されます（`password` フィールドと同様）。

:::warning HTTP 経由のセキュア値
セキュアヘッダーの値は設定内では安全に保存されますが、セキュア接続が無効な場合、その値は HTTP 経由で送信されます。
:::

プレーン/セキュアヘッダーの YAML の例:

```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value" is excluded
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```

## 追加設定 \\{#additional-settings\\}

これらの追加設定は必須ではありません。

<Image size="sm" img={config_additional} alt="追加設定の例" border />

YAML の例:

```yaml
jsonData:
  defaultDatabase: default # default database loaded by the query builder. Defaults to "default".
  defaultTable: <string>   # default table loaded by the query builder.

  dialTimeout: 10    # dial timeout when connecting to the server, in seconds. Defaults to "10".
  queryTimeout: 60   # query timeout when running a query, in seconds. Defaults to 60. This requires permissions on the user, if you get a permission error try setting it to "0" to disable it.
  validateSql: false # when set to true, will validate the SQL in the SQL editor.
```

### OpenTelemetry \\{#opentelemetry\\}

OpenTelemetry (OTel) は、このプラグインに深く統合されています。
OpenTelemetry データは、[exporter plugin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を使用して ClickHouse にエクスポートできます。
最適に活用するために、[logs](#logs) と [traces](#traces) の両方に対して OTel を構成することを推奨します。

また、強力なオブザーバビリティワークフローを実現する機能である [data links](./query-builder.md#data-links) を有効にするには、これらのデフォルトを構成することも必要です。

### Logs \\{#logs\\}

[ログ用クエリビルダー](./query-builder.md#logs)でのログクエリ作成を高速化するために、ログクエリ用のデフォルトのデータベース / テーブルおよびカラムを設定できます。これにより、実行可能なログクエリがあらかじめクエリビルダーに読み込まれ、Explore ページでの探索がオブザーバビリティの観点でより高速になります。

OpenTelemetry を使用している場合は、「**Use OTel**」スイッチを有効にし、**default log table** を `otel_logs` に設定してください。
これにより、選択した OTel スキーマバージョンを使用するように、デフォルトのカラムが自動的に上書きされます。

ログで OpenTelemetry が必須というわけではありませんが、ログ / トレースを単一のデータセットにまとめることで、[data linking](./query-builder.md#data-links) を用いたスムーズなオブザーバビリティワークフローを実現しやすくなります。

ログ設定画面の例:

<Image size="sm" img={config_logs} alt="Logs config" border />

ログ設定 YAML の例:

```yaml
jsonData:
  logs:
    defaultDatabase: default # default log database.
    defaultTable: otel_logs  # default log table. If you're using OTel, this should be set to "otel_logs".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new log query. Will be ignored if OTel is enabled.
    timeColumn:       <string> # the primary time column for the log.
    levelColumn:   <string> # the log level/severity of the log. Values typically look like "INFO", "error", or "Debug".
    messageColumn: <string> # the log's message/content.
```

### トレース \\{#traces\\}

[トレース用のクエリビルダー](./query-builder.md#traces)でのクエリ作成を高速化するために、トレースクエリ用のデフォルトのデータベース／テーブルおよびカラムを設定できます。これにより、クエリビルダーに実行可能なトレース検索クエリがあらかじめ読み込まれ、Explore ページ上でのオブザーバビリティ向けのブラウジングが高速化されます。

OpenTelemetry を使用している場合は、「**Use OTel**」スイッチを有効にし、**default trace table** を `otel_traces` に設定してください。
これにより、選択した OTel スキーマバージョンを使用するように、デフォルトのカラムが自動的に上書きされます。
OpenTelemetry は必須ではありませんが、この機能はトレースに対してそのスキーマを使用している場合に最も効果的に動作します。

トレース設定画面の例:

<Image size="sm" img={config_traces} alt="Traces config" border />

トレース設定 YAML の例:

```yaml
jsonData:
  traces:
    defaultDatabase: default  # default trace database.
    defaultTable: otel_traces # default trace table. If you're using OTel, this should be set to "otel_traces".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new trace query. Will be ignored if OTel is enabled.
    traceIdColumn:       <string>    # trace ID column.
    spanIdColumn:        <string>    # span ID column.
    operationNameColumn: <string>    # operation name column.
    parentSpanIdColumn:  <string>    # parent span ID column.
    serviceNameColumn:   <string>    # service name column.
    durationTimeColumn:  <string>    # duration time column.
    durationUnitColumn:  <time unit> # duration time unit. Can be set to "seconds", "milliseconds", "microseconds", or "nanoseconds". For OTel the default is "nanoseconds".
    startTimeColumn:     <string>    # start time column. This is the primary time column for the trace span.
    tagsColumn:          <string>    # tags column. This is expected to be a map type.
    serviceTagsColumn:   <string>    # service tags column. This is expected to be a map type.
```

### カラムエイリアス \\{#column-aliases\\}

カラムエイリアスは、データを別名や別の型として扱ってクエリするための便利な方法です。
エイリアスを使用すると、ネストされたスキーマをフラットな形に変換し、Grafana で簡単に選択できるようにできます。

次のような場合にエイリアスが特に有用です:

- スキーマと、その大半のネストされたプロパティ／型を把握している
- データを Map 型で保存している
- JSON を文字列として保存している
- 選択するカラムに対して変換用の関数を適用することが多い

#### テーブルで定義された ALIAS 列 \\{#table-defined-alias-columns\\}

ClickHouse には列エイリアス機能が組み込まれており、Grafana と追加の設定なしに連携して動作します。
エイリアス列はテーブル定義内で直接定義できます。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

上記の例では、ナノ秒単位のタイムスタンプを `Date` 型に変換する `TimestampDate` というエイリアスを作成しています。
このデータは最初の列のようにディスク上に保存されるのではなく、クエリ実行時に計算されます。
テーブルで定義されたエイリアス列は `SELECT *` では返されませんが、サーバー設定で変更可能です。

詳細については、[ALIAS](/sql-reference/statements/create/table#alias) カラム型のドキュメントを参照してください。

#### カラムエイリアステーブル \\{#column-alias-tables\\}

デフォルトでは、Grafana は `DESC table` のレスポンスに基づいてカラム候補を提示します。
場合によっては、Grafana から見えるカラムをまるごと別のものに置き換えたいことがあります。
これにより、カラム選択時に Grafana 上でスキーマを見えにくくでき、テーブルの複雑さによってはユーザーエクスペリエンスを向上させられます。

テーブル側で定義するエイリアスと比較した場合の利点は、テーブル自体を変更することなく簡単に更新できる点です。
スキーマによってはエントリが数千件に及ぶことがあり、基盤となるテーブル定義が煩雑になる可能性があります。
また、ユーザーに意識させたくないカラムを非表示にすることもできます。

Grafana では、エイリアステーブルは次のカラム構造を持つ必要があります。

```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

`ALIAS` 列の動作は、エイリアステーブルを使って次のように再現できます。

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

次に、このテーブルを Grafana で使用するように設定できます。名前は任意で、別のデータベースで定義することも可能です：

<Image size="md" img={alias_table_config_example} alt="エイリアステーブル設定の例" border />

これで Grafana は、`DESC example_table` の結果ではなく、エイリアステーブルの結果を参照するようになります：

<Image size="md" img={alias_table_select_example} alt="エイリアステーブルの SELECT 例" border />

これら 2 種類のエイリアスは、複雑な型変換や JSON フィールドの抽出を行うために利用できます。

## すべての YAML オプション \\{#all-yaml-options\\}

以下は、プラグインで利用可能なすべての YAML 設定オプションです。
一部のフィールドには値の例があり、他のフィールドはフィールドの型のみを示しています。

YAML を使用したデータソースのプロビジョニングの詳細については、[Grafana のドキュメント](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)を参照してください。

```yaml
datasources:
  - name: Example ClickHouse
    uid: clickhouse-example
    type: grafana-clickhouse-datasource
    jsonData:
      host: 127.0.0.1
      port: 9000
      protocol: native
      secure: false
      username: default
      tlsSkipVerify: <boolean>
      tlsAuth: <boolean>
      tlsAuthWithCACert: <boolean>
      defaultDatabase: default
      defaultTable: <string>
      dialTimeout: 10
      queryTimeout: 60
      validateSql: false
      httpHeaders:
      - name: X-Example-Plain-Header
        value: plain text value
        secure: false
      - name: X-Example-Secure-Header
        secure: true
      logs:
        defaultDatabase: default
        defaultTable: otel_logs
        otelEnabled: false
        otelVersion: latest
        timeColumn: <string>
        levelColumn: <string>
        messageColumn: <string>
      traces:
        defaultDatabase: default
        defaultTable: otel_traces
        otelEnabled: false
        otelVersion: latest
        traceIdColumn: <string>
        spanIdColumn: <string>
        operationNameColumn: <string>
        parentSpanIdColumn: <string>
        serviceNameColumn: <string>
        durationTimeColumn: <string>
        durationUnitColumn: <time unit>
        startTimeColumn: <string>
        tagsColumn: <string>
        serviceTagsColumn: <string>
    secureJsonData:
      tlsCACert:     <string>
      tlsClientCert: <string>
      tlsClientKey:  <string>
      secureHttpHeaders.X-Example-Secure-Header: secure header value
```
