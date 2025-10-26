---
'sidebar_label': 'プラグイン設定'
'sidebar_position': 3
'slug': '/integrations/grafana/config'
'description': 'GrafanaにおけるClickHouseデータソースプラグインの設定オプション'
'title': 'GrafanaでのClickHouseデータソースの設定'
'doc_type': 'guide'
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


# ClickHouse データソースの Grafana での設定

<ClickHouseSupportedBadge/>

設定を変更する最も簡単な方法は、Grafana UI のプラグイン設定ページで行うことですが、データソースは [YAML ファイルでプロビジョニングすることもできます](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

このページでは、ClickHouse プラグインでの設定に利用できるオプションのリストと、YAML を使用してデータソースをプロビジョニングするための設定スニペットを示します。

すべてのオプションの簡単な概要については、すべての設定オプションの完全なリストを [こちら](#all-yaml-options) で確認できます。

## 一般設定 {#common-settings}

設定画面の例：
<Image size="sm" img={config_common} alt="Example secure native config" border />

一般設定の例 YAML：
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

UI から設定が保存されるときに `version` プロパティが追加されることに注意してください。これにより、設定が保存されたプラグインのバージョンが表示されます。

### HTTP プロトコル {#http-protocol}

HTTP プロトコルを介して接続することを選択した場合、さらに設定が表示されます。

<Image size="md" img={config_http} alt="Extra HTTP config options" border />

#### HTTP パス {#http-path}

HTTP サーバーが異なる URL パスで公開されている場合は、ここに追加できます。

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### カスタム HTTP ヘッダー {#custom-http-headers}

サーバーに送信されるリクエストにカスタムヘッダーを追加できます。

ヘッダーはプレーンテキストまたはセキュアな形式にできます。すべてのヘッダーキーはプレーンテキストで保存され、セキュアなヘッダー値はセキュアな設定に保存されます（`password` フィールドに類似）。

:::warning セキュアな値は HTTP を介して送信される
セキュアなヘッダー値は設定に安全に保存されていますが、セキュア接続が無効の場合、値は依然として HTTP 経由で送信されます。
:::

プレーン/セキュアヘッダーの例 YAML：
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

## 追加設定 {#additional-settings}

これらの追加設定はオプションです。

<Image size="sm" img={config_additional} alt="Example additional settings" border />

例の YAML：
```yaml
jsonData:
  defaultDatabase: default # default database loaded by the query builder. Defaults to "default".
  defaultTable: <string>   # default table loaded by the query builder.

  dialTimeout: 10    # dial timeout when connecting to the server, in seconds. Defaults to "10".
  queryTimeout: 60   # query timeout when running a query, in seconds. Defaults to 60. This requires permissions on the user, if you get a permission error try setting it to "0" to disable it.
  validateSql: false # when set to true, will validate the SQL in the SQL editor.
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) はプラグイン内に深く統合されています。OpenTelemetry データは、私たちの [exporter plugin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を使用して ClickHouse にエクスポートできます。最適な使用のためには、OTel を [ログ](#logs) と [トレース](#traces) の両方に設定することを推奨します。

[データリンク](./query-builder.md#data-links) を有効にするためのデフォルトを設定することが必要で、これは強力な可観測性ワークフローを可能にする機能です。

### ログ {#logs}

[ログのクエリビルディングを加速するため](./query-builder.md#logs)、デフォルトのデータベース/テーブルおよびログクエリ用のカラムを設定できます。これにより、クエリビルダーが実行可能なログクエリで事前に読み込まれ、可観測性のためのエクスプローラーページでのブラウジングが速くなります。

OpenTelemetry を使用している場合は、「**OTel を使用する**」スイッチを有効にし、**デフォルトのログテーブル**を `otel_logs` に設定する必要があります。これにより、選択した OTel スキーマバージョンを使用するためにデフォルトのカラムを自動的に上書きします。

OpenTelemetry はログには必要ありませんが、単一のログ/トレースデータセットを使用することで、[データリンク](./query-builder.md#data-links) を用いたスムーズな可観測性ワークフローが実現します。

ログ設定画面の例：
<Image size="sm" img={config_logs} alt="Logs config" border />

ログ設定の例 YAML：
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

### トレース {#traces}

[トレースのクエリビルディングを加速するため](./query-builder.md#traces)、デフォルトのデータベース/テーブルおよびトレースクエリ用のカラムを設定できます。これにより、クエリビルダーが実行可能なトレース検索クエリで事前に読み込まれ、可観測性のためのエクスプローラーページでのブラウジングが速くなります。

OpenTelemetry を使用している場合は、「**OTel を使用する**」スイッチを有効にし、**デフォルトのトレーステーブル**を `otel_traces` に設定する必要があります。これにより、選択した OTel スキーマバージョンを使用するためにデフォルトのカラムを自動的に上書きします。OpenTelemetry は必須ではありませんが、この機能はトレースに OTel のスキーマを使用している場合に最も効果的に機能します。

トレース設定画面の例：
<Image size="sm" img={config_traces} alt="Traces config" border />

トレース設定の例 YAML：
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

### カラムエイリアス {#column-aliases}

カラムエイリアスは、異なる名前や型でデータをクエリする便利な方法です。エイリアスを使用することで、ネストされたスキーマを平坦化し、Grafana で簡単に選択できるようになります。

エイリアスが relevant である場合：
- スキーマとそのほとんどのネストされたプロパティ/型を知っている
- データを Map タイプで保存している
- JSON を文字列として保存している
- 選択するカラムに関数を適用していることが多い

#### テーブル定義のエイリアスカラム {#table-defined-alias-columns}

ClickHouse にはエイリアスカラムの組み込み機能があり、Grafana との互換性があります。エイリアスカラムは、テーブル上で直接定義できます。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

上の例では、ナノ秒のタイムスタンプを `Date` 型に変換するエイリアス `TimestampDate` を作成しています。このデータは、最初のカラムのようにディスクに保存されるのではなく、クエリ時に計算されます。テーブル定義のエイリアスは `SELECT *` では返されませんが、これはサーバー設定で構成できます。

詳細については、[ALIAS](/sql-reference/statements/create/table#alias) カラムタイプのドキュメントを参照してください。

#### カラムエイリアステーブル {#column-alias-tables}

デフォルトでは、Grafana は `DESC table` からのレスポンスに基づいてカラムの提案を提供します。場合によっては、Grafana が見るカラムを完全に上書きしたいことがあります。これにより、テーブルの複雑さに応じて、Grafana でカラムを選択する際にスキーマを隠すことができます。

これに対する利点は、テーブルを変更することなく簡単に更新できることです。一部のスキーマでは、これが何千ものエントリになり、基になるテーブル定義を混乱させることがあります。また、ユーザーに無視させたいカラムを隠すこともできます。

Grafana は、エイリアステーブルが以下のカラム構造を持っていることを要求します：
```sql
CREATE TABLE aliases (
  `alias` String,  -- The name of the alias, as seen in the Grafana column selector
  `select` String, -- The SELECT syntax to use in the SQL generator
  `type` String    -- The type of the resulting column, so the plugin can modify the UI options to match the data type.
)
```

これが、エイリアステーブルを使用して `ALIAS` カラムの動作を再現する方法です：
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- Preserve original column from table (optional)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- Add new column that converts TimestampNanos to a Date
```

このテーブルを Grafana で使用するように設定します。名前は何でも構いませんし、別のデータベースで定義することもできます：
<Image size="md" img={alias_table_config_example} alt="Example alias table config" border />

これにより、Grafana は `DESC example_table` からの結果ではなく、エイリアステーブルの結果を見るようになります：
<Image size="md" img={alias_table_select_example} alt="Example alias table select" border />

両方のエイリアスタイプは、複雑な型変換や JSON フィールドの抽出を実行するために使用できます。

## すべての YAML オプション {#all-yaml-options}

これらは、プラグインによって提供されるすべての YAML 設定オプションです。一部のフィールドには例として値が示されていますが、他のフィールドは単にフィールドの型を示しています。

YAML でデータソースをプロビジョニングする方法についての詳細は、[Grafana ドキュメント](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) を参照してください。

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
