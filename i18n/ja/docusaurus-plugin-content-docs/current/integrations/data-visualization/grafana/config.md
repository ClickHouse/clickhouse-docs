---
sidebar_label: プラグイン設定
sidebar_position: 3
slug: /integrations/grafana/config
description: GrafanaにおけるClickHouseデータソースプラグインの設定オプション
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';

# GrafanaにおけるClickHouseデータソースの設定

設定を変更する最も簡単な方法は、Grafana UIのプラグイン設定ページで行うことですが、データソースは[ YAMLファイルでプロビジョニングすることも可能です](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

このページでは、ClickHouseプラグインにおいて利用可能な設定オプションのリストと、それに対するYAMLでのデータソースプロビジョニング用の設定スニペットを示します。

すべてのオプションの簡単な概要については、[こちら](#all-yaml-options)で完全な設定オプションリストを確認できます。

## 一般設定 {#common-settings}

設定画面の例:
<img src={require('./images/config_common.png').default} class="image" alt="設定のセキュアなネイティブ例" />

一般設定用のYAML例:
```yaml
jsonData:
  host: 127.0.0.1 # (必須) サーバーアドレス。
  port: 9000      # (必須) サーバーポート。ネイティブの場合、9440がセキュア、9000が非セキュアにデフォルト設定されています。HTTPの場合は、8443がセキュア、8123が非セキュアにデフォルト設定されています。

  protocol: native # (必須) 接続に使用するプロトコル。"native"または"http"に設定可能です。
  secure: false    # 接続がセキュアな場合はtrueに設定します。

  username: default # 認証に使用するユーザー名。

  tlsSkipVerify:     <boolean> # trueに設定するとTLS検証をスキップします。
  tlsAuth:           <boolean> # TLSクライアント認証を有効にするにはtrueに設定します。
  tlsAuthWithCACert: <boolean> # CA証明書が提供されている場合はtrueに設定します。自己署名TLS証明書を検証するために必要です。

secureJsonData:
  password: secureExamplePassword # 認証に使用するパスワード。

  tlsCACert:     <string> # TLS CA証明書
  tlsClientCert: <string> # TLSクライアント証明書
  tlsClientKey:  <string> # TLSクライアントキー
```

設定がUIから保存されると、`version`プロパティが追加されます。これは、設定が保存されたときのプラグインのバージョンを示します。

### HTTPプロトコル {#http-protocol}

HTTPプロトコルで接続することを選択すると、より多くの設定が表示されます。

<img src={require('./images/config_http.png').default} class="image" alt="追加のHTTP設定オプション" />

#### HTTPパス {#http-path}

HTTPサーバーが異なるURLパスで公開されている場合は、ここに追加できます。

```yaml
jsonData:
  # 最初のスラッシュを除外
  path: additional/path/example
```

#### カスタムHTTPヘッダー {#custom-http-headers}

サーバーに送信されるリクエストにカスタムヘッダーを追加できます。

ヘッダーはプレーンテキストまたはセキュアのいずれかにすることができます。
すべてのヘッダーキーはプレーンテキストで保存され、セキュアヘッダーの値はセキュアな設定に保存されます（`password`フィールドのように）。

:::warning セキュア値のHTTP送信
セキュアヘッダーの値は設定に安全に保存されますが、セキュア接続が無効の場合、値は依然としてHTTPで送信されます。
:::

プレーン/セキュアヘッダー用のYAML例:
```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value"は除外されています
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```

## 追加設定 {#additional-settings}

これらの追加設定はオプションです。

<img src={require('./images/config_additional.png').default} class="image" alt="追加設定の例" />

YAMLの例:
```yaml
jsonData:
  defaultDatabase: default # クエリビルダーによって読み込まれるデフォルトのデータベース。デフォルトは"default"です。
  defaultTable: <string>   # クエリビルダーによって読み込まれるデフォルトのテーブル。

  dialTimeout: 10    # サーバー接続時のダイヤルタイムアウト（秒）。デフォルトは"10"です。
  queryTimeout: 60   # クエリ実行時のタイムアウト（秒）。デフォルトは60です。これにはユーザー権限が必要で、権限エラーが発生した場合は"0"に設定して無効化してください。
  validateSql: false # trueに設定すると、SQLエディタ内でSQLを検証します。
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry（OTel）はプラグイン内に深く統合されています。
OpenTelemetryデータは、[エクスポータープラグイン](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)を使用してClickHouseにエクスポートできます。
最適な使用のためには、[ログ](#logs)と[トレース](#traces)に対するOTelの設定が推奨されます。

また、[データリンク](./query-builder.md#data-links)を有効にするためのデフォルト設定も構成する必要があります。これは、強力な可観測性ワークフローを可能にする機能です。

### ログ {#logs}

[ログ用のクエリビルディングを高速化](./query-builder.md#logs)するために、デフォルトのデータベース/テーブルおよびログクエリ用のカラムを設定できます。これにより、クエリビルダーが実行可能なログクエリを事前に読み込むことができ、探索ページでのブラウジングが可観測性のために高速化されます。

OpenTelemetryを使用している場合は、「**OTelを使用**」スイッチをオンにし、**デフォルトログテーブル**を`otel_logs`に設定してください。
これにより、自動的にデフォルトカラムが選択したOTelスキーマバージョンを使用するようにオーバーライドされます。

OpenTelemetryはログに必須ではありませんが、単一のログ/トレースデータセットを使用することで[データリンク](./query-builder.md#data-links)を持つスムーズな可観測性ワークフローを実現できます。

ログ設定画面の例:
<img src={require('./images/config_logs.png').default} class="image" alt="ログ設定" />

ログ設定YAMLの例:
```yaml
jsonData:
  logs:
    defaultDatabase: default # デフォルトのログデータベース。
    defaultTable: otel_logs  # デフォルトのログテーブル。OTelを使用している場合、ここは"otel_logs"に設定するべきです。

    otelEnabled: false  # OTelが有効な場合はtrueに設定します。
    otelVersion: latest # 使用するotelコレクタースキーマバージョン。バージョンはUIに表示されますが、"latest"はプラグインで利用可能な最新バージョンを使用します。

    # 新しいログクエリを開く際に選択されるデフォルトのカラム。OTelが有効な場合は無視されます。
    timeColumn:       <string> # ログの主要な時間カラム。
    levelColumn:   <string> # ログのレベル/重大度のカラム。値は通常、"INFO"、"error"、または"Debug"のように見えます。
    messageColumn: <string> # ログのメッセージ/コンテンツ。
```

### トレース {#traces}

[トレース用のクエリビルディングを高速化](./query-builder.md#traces)するために、デフォルトのデータベース/テーブルおよびトレースクエリ用のカラムを設定できます。これにより、クエリビルダーが実行可能なトレース検索クエリを事前に読み込むことができ、探索ページでのブラウジングが可観測性のために高速化されます。

OpenTelemetryを使用している場合は、「**OTelを使用**」スイッチをオンにし、**デフォルトトレーステーブル**を`otel_traces`に設定してください。
これにより、自動的にデフォルトのカラムが選択したOTelスキーマバージョンを使用するようにオーバーライドされます。
OpenTelemetryは必須ではありませんが、この機能はそのスキーマを使用する際に最も効果的です。

トレース設定画面の例:
<img src={require('./images/config_traces.png').default} class="image" alt="トレース設定" />

トレース設定YAMLの例:
```yaml
jsonData:
  traces:
    defaultDatabase: default  # デフォルトのトレースデータベース。
    defaultTable: otel_traces # デフォルトのトレーステーブル。OTelを使用している場合、ここは"otel_traces"に設定するべきです。

    otelEnabled: false  # OTelが有効な場合はtrueに設定します。
    otelVersion: latest # 使用するotelコレクタースキーマバージョン。バージョンはUIに表示されますが、"latest"はプラグインで利用可能な最新バージョンを使用します。

    # 新しいトレースクエリを開く際に選択されるデフォルトのカラム。OTelが有効な場合は無視されます。
    traceIdColumn:       <string>    # トレースIDカラム。
    spanIdColumn:        <string>    # スパンIDカラム。
    operationNameColumn: <string>    # オペレーション名カラム。
    parentSpanIdColumn:  <string>    # 親スパンIDカラム。
    serviceNameColumn:   <string>    # サービス名カラム。
    durationTimeColumn:  <string>    # 継続時間カラム。
    durationUnitColumn:  <time unit> # 継続時間の単位。"seconds"、"milliseconds"、"microseconds"、または"nanoseconds"に設定できます。OTelの場合、デフォルトは"nanoseconds"です。
    startTimeColumn:     <string>    # 開始時間カラム。これはトレーススパンの主要な時間カラムです。
    tagsColumn:          <string>    # タグカラム。これはマップ型であることが期待されます。
    serviceTagsColumn:   <string>    # サービスタグカラム。これもマップ型であることが期待されます。
```

### カラムエイリアス {#column-aliases}

カラムエイリアスは、異なる名前や型でデータをクエリする便利な方法です。
エイリアスを使用することで、ネストされたスキーマを平坦化してGrafanaで簡単に選択できるようにすることができます。

エイリアスは以下のような場合に関連するかもしれません：
- スキーマとそのネストされたプロパティ/型のほとんどを知っている
- データをマップ型で保存している
- JSONを文字列として保存している
- 選択するカラムに変換関数を適用することが多い

#### テーブル定義エイリアスカラム {#table-defined-alias-columns}

ClickHouseには標準でカラムエイリアスが組み込まれており、Grafanaとすぐに連携します。
エイリアスカラムは、テーブル上で直接定義できます。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

上記の例では、ナノ秒タイムスタンプを`Date`型に変換する`TimestampDate`というエイリアスを作成しています。
このデータは、最初のカラムのようにディスクに保存されることはなく、クエリ時に計算されます。
テーブル定義エイリアスは`SELECT *`では返されませんが、これはサーバー設定で構成可能です。

詳細については、[ALIAS](/sql-reference/statements/create/table#alias)カラムタイプのドキュメントを参照してください。

#### カラムエイリアスタブル {#column-alias-tables}

デフォルトでは、Grafanaは`DESC table`からの応答に基づいてカラムの提案を提供します。
場合によっては、Grafanaが見るカラムを完全にオーバーライドしたいことがあります。
これは、カラムを選択する際にスキーマを隠すのに役立ち、テーブルの複雑性に応じてユーザーエクスペリエンスを改善できます。

テーブル定義エイリアスとの利点は、テーブルを変更することなく簡単に更新できることです。一部のスキーマでは、これが何千ものエントリに及ぶことがあるため、基盤となるテーブル定義が煩雑になる可能性があります。また、ユーザーに無視してほしいカラムを隠すこともできます。

Grafanaは、以下のカラム構造を持つエイリアステーブルを要求します：
```sql
CREATE TABLE aliases (
  `alias` String,  -- Grafanaのカラムセレクタで見えるエイリアスの名前
  `select` String, -- SQL生成器で使用するSELECT構文
  `type` String    -- 結果カラムの型。これにより、プラグインがデータ型に合わせてUIオプションを変更できます。
)
```

エイリアステーブルを使用して`ALIAS`カラムの動作を再現する方法は次のとおりです：
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- テーブルからの元のカラムを保持（オプション）
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- TimestampNanosをDateに変換する新しいカラムを追加
```

このテーブルはGrafanaで使用されるよう構成できます。名前は何にでもでき、別のデータベースで定義されても構いません：
<img src={require('./images/alias_table_config_example.png').default} class="image" alt="エイリアステーブル設定の例" />

これで、Grafanaは`DESC example_table`の結果ではなく、エイリアステーブルの結果を表示します：
<img src={require('./images/alias_table_select_example.png').default} class="image" alt="エイリアステーブル選択の例" />

両方のタイプのエイリアスを使用して、複雑な型変換やJSONフィールド抽出を実行できます。

## すべてのYAMLオプション {#all-yaml-options}

これらはプラグインによって提供されるすべてのYAML設定オプションです。
一部のフィールドには例の値があり、他はフィールドの型を示すのみです。

YAMLでのデータソースプロビジョニングに関する詳細は、[Grafanaのドキュメント](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)を参照してください。

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
