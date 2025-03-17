---
sidebar_label: プラグイン設定
sidebar_position: 3
slug: /integrations/grafana/config
description: Grafana における ClickHouse データソースプラグインの設定オプション
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';


# Grafana での ClickHouse データソースの設定

設定を変更する最も簡単な方法は、Grafana UI のプラグイン設定ページで行うことですが、データソースは [YAML ファイルでプロビジョニング](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) することもできます。

このページでは、ClickHouse プラグインでの設定に利用可能なオプションのリストと、YAML でデータソースをプロビジョニングするための設定スニペットを示します。

すべてのオプションの簡単な概要については、完全な設定オプションのリストを [こちら](#all-yaml-options) で確認できます。

## 共通設定 {#common-settings}

例の設定画面:
<img src={config_common} class="image" alt="Example secure native config" />

共通設定のための例の YAML 構成:
```yaml
jsonData:
  host: 127.0.0.1 # (required) サーバーアドレス。
  port: 9000      # (required) サーバーポート。ネイティブの場合、デフォルトは9440（セキュア）および9000（非セキュア）。HTTPの場合、デフォルトは8443（セキュア）および8123（非セキュア）。

  protocol: native # (required) 接続に使用されるプロトコル。"native" または "http" に設定できます。
  secure: false    # 接続がセキュアな場合は true に設定します。

  username: default # 認証に使用されるユーザー名。

  tlsSkipVerify:     <boolean> # true に設定すると TLS 検証をスキップします。
  tlsAuth:           <boolean> # true に設定すると TLS クライアント認証を有効にします。
  tlsAuthWithCACert: <boolean> # CA 証明書が提供されている場合は true に設定します。自己署名 TLS 証明書の検証に必要です。

secureJsonData:
  password: secureExamplePassword # 認証に使用されるパスワード。

  tlsCACert:     <string> # TLS CA 証明書
  tlsClientCert: <string> # TLS クライアント証明書
  tlsClientKey:  <string> # TLS クライアントキー
```

構成が UI から保存されるときに `version` プロパティが追加されます。これは、その設定が保存されたプラグインのバージョンを示します。

### HTTP プロトコル {#http-protocol}

HTTP プロトコルで接続することを選択した場合、さらに設定が表示されます。

<img src={config_http} class="image" alt="Extra HTTP config options" />

#### HTTP パス {#http-path}

HTTP サーバーが別の URL パスの下に公開されている場合、ここに追加できます。

```yaml
jsonData:
  # 最初のスラッシュを除外
  path: additional/path/example
```

#### カスタム HTTP ヘッダー {#custom-http-headers}

サーバーに送信されるリクエストにカスタムヘッダーを追加できます。

ヘッダーはプレーンテキスト、またはセキュアであることができます。
すべてのヘッダーキーはプレーンテキストで格納され、セキュアなヘッダー値はセキュアな設定に保存されます（`password` フィールドに似ています）。

:::warning HTTP のセキュア値
セキュアヘッダー値は設定でセキュアに保存されますが、セキュア接続が無効の場合、値は HTTP 経由で送信されます。
:::

プレーン/セキュアヘッダーの例 YAML:
```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value" は除外されています
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```

## 追加設定 {#additional-settings}

これらの追加設定は任意です。

<img src={config_additional} class="image" alt="Example additional settings" />

例の YAML:
```yaml
jsonData:
  defaultDatabase: default # クエリビルダーによって読み込まれるデフォルトデータベース。デフォルトは "default"。
  defaultTable: <string>   # クエリビルダーによって読み込まれるデフォルトテーブル。

  dialTimeout: 10    # サーバーへの接続時のダイヤルタイムアウト（秒）。デフォルトは "10"。
  queryTimeout: 60   # クエリ実行時のタイムアウト（秒）。デフォルトは 60。ユーザーに権限が必要です。権限エラーが発生した場合は、"0" に設定して無効にしてみてください。
  validateSql: false # true に設定すると、SQL エディタ内の SQL を検証します。
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) はプラグイン内に深く統合されています。
OpenTelemetry データは、当社の [エクスポータープラグイン](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を使用して ClickHouse にエクスポートできます。
最良の使用法のためには、[ログ](#logs) および [トレース](#traces) の両方に OTel を設定することをお勧めします。

また、[データリンク](./query-builder.md#data-links) を有効にするために、これらのデフォルトを設定する必要があります。データリンク機能は強力な可観測性ワークフローを実現します。

### ログ {#logs}

[ログのクエリビルディングを迅速化するために](./query-builder.md#logs)、デフォルトのデータベース/テーブルと、ログクエリのためのカラムを設定できます。これにより、クエリビルダーが実行可能なログクエリで事前にロードされ、可観測性のための探索ページでのブラウジングが迅速になります。

OpenTelemetry を使用している場合は、"**Use OTel**" スイッチを有効にし、**デフォルトログテーブル**を `otel_logs` に設定する必要があります。
これにより、デフォルトのカラムが選択された OTel スキーマバージョンを使用するように自動的にオーバーライドされます。

OpenTelemetry はログに必須ではありませんが、単一のログ/トレースデータセットを使用することで、[データリンク](./query-builder.md#data-links) を介したスムーズな可観測性ワークフローが可能になります。

例のログ設定画面:
<img src={config_logs} class="image" alt="Logs config" />

例のログ設定 YAML:
```yaml
jsonData:
  logs:
    defaultDatabase: default # デフォルトのログデータベース。
    defaultTable: otel_logs  # デフォルトのログテーブル。OTel を使用する場合、これは "otel_logs" に設定する必要があります。

    otelEnabled: false  # OTel が有効な場合は true に設定します。
    otelVersion: latest # 使用される OTel コレクタースキーマバージョン。バージョンは UI に表示されますが、"latest" はプラグインで入手可能な最新のバージョンを使用します。

    # 新しいログクエリを開くときに選択されるデフォルトのカラム。OTel が有効な場合は無視されます。
    timeColumn:       <string> # ログの主要な時間カラム。
    levelColumn:   <string> # ログのレベル/重大度。値は通常 "INFO"、"error"、または "Debug" のようになります。
    messageColumn: <string> # ログのメッセージ/コンテンツ。
```

### トレース {#traces}

[トレースのクエリビルディングを迅速化するために](./query-builder.md#traces)、デフォルトのデータベース/テーブルと、トレースクエリのためのカラムを設定できます。これにより、クエリビルダーが実行可能なトレース検索クエリで事前にロードされ、可観測性のための探索ページでのブラウジングが迅速になります。

OpenTelemetry を使用している場合は、"**Use OTel**" スイッチを有効にし、**デフォルトトレーステーブル**を `otel_traces` に設定する必要があります。
これにより、デフォルトのカラムが選択された OTel スキーマバージョンを使用するように自動的にオーバーライドされます。
OpenTelemetry は必ずしも必要ではありませんが、この機能はトレース用のスキーマを使用する場合に最適に機能します。

例のトレース設定画面:
<img src={config_traces} class="image" alt="Traces config" />

例のトレース設定 YAML:
```yaml
jsonData:
  traces:
    defaultDatabase: default  # デフォルトのトレースデータベース。
    defaultTable: otel_traces # デフォルトのトレーステーブル。OTel を使用する場合、これは "otel_traces" に設定する必要があります。

    otelEnabled: false  # OTel が有効な場合は true に設定します。
    otelVersion: latest # 使用される OTel コレクタースキーマバージョン。バージョンは UI に表示されますが、"latest" はプラグインで入手可能な最新のバージョンを使用します。

    # 新しいトレースクエリを開くときに選択されるデフォルトのカラム。OTel が有効な場合は無視されます。
    traceIdColumn:       <string>    # トレース ID カラム。
    spanIdColumn:        <string>    # スパン ID カラム。
    operationNameColumn: <string>    # 操作名カラム。
    parentSpanIdColumn:  <string>    # 親スパン ID カラム。
    serviceNameColumn:   <string>    # サービス名カラム。
    durationTimeColumn:  <string>    # 所要時間カラム。
    durationUnitColumn:  <time unit> # 所要時間単位。 "seconds"、"milliseconds"、"microseconds"、または "nanoseconds" に設定できます。OTel のデフォルトは "nanoseconds" です。
    startTimeColumn:     <string>    # 開始時間カラム。これはトレーススパンの主要な時間カラムです。
    tagsColumn:          <string>    # タグカラム。これはマップ型であることが期待されます。
    serviceTagsColumn:   <string>    # サービスタグカラム。これはマップ型であることが期待されます。
```

### カラムエイリアス {#column-aliases}

カラムのエイリアスは、異なる名前や型でデータをクエリする便利な方法です。
エイリアスを使用すると、ネストされたスキーマをフラット化し、Grafana で簡単に選択できるようにできます。

あなたに関連するかもしれないエイリアスは次の通りです：
- スキーマとそのほとんどのネストされたプロパティ/型を知っている
- データを Map 型で保存している
- JSON を文字列として保存している
- 選択するカラムを変換するために関数を適用することがよくある

#### テーブル定義エイリアスカラム {#table-defined-alias-columns}

ClickHouse にはカラムエイリアスが組み込まれており、Grafana でそのまま動作します。
エイリアスカラムはテーブルに直接定義できます。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

上記の例では、ナノ秒タイムスタンプを `Date` 型に変換する `TimestampDate` というエイリアスを作成します。
このデータは最初のカラムのようにディスクに保存されるのではなく、クエリ時に計算されます。
テーブル定義エイリアスは `SELECT *` では返されませんが、これはサーバー設定で構成できます。

詳細については、[ALIAS](/sql-reference/statements/create/table#alias) カラムタイプのドキュメントを参照してください。

#### カラムエイリアステーブル {#column-alias-tables}

デフォルトでは、Grafana は `DESC table` の応答に基づいてカラムの提案を提供します。
場合によっては、Grafana が見るカラムを完全にオーバーライドしたいことがあります。
これにより、複雑なテーブルを持つ場合のユーザーエクスペリエンスが向上します。

テーブル定義のエイリアスに対する利点は、テーブルを変更することなく簡単に更新できることです。一部のスキーマでは、これが数千のエントリに及ぶことがあり、基となるテーブル定義が混雑する可能性があります。また、ユーザーに無視してほしいカラムを非表示にすることもできます。

Grafana には、エイリアステーブルに次のカラム構造が必要です：
```sql
CREATE TABLE aliases (
  `alias` String,  -- Grafana カラムセレクタに表示されるエイリアスの名前
  `select` String, -- SQL ジェネレーターで使用する SELECT 構文
  `type` String    -- 結果のカラムの型。プラグインはデータ型に合わせて UI オプションを変更できます。
)
```

次のようにしてエイリアステーブルを使用して `ALIAS` カラムの動作を再現できます：
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- オリジナルカラムをテーブルから保持（オプション）
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- TimestampNanos を Date に変換する新しいカラムを追加
```

このテーブルを Grafana で使用するように構成できます。名前は何にでも設定でき、別のデータベースに定義することもできます：
<img src={alias_table_config_example} class="image" alt="Example alias table config" />

これで、Grafana は `DESC example_table` の結果ではなく、エイリアステーブルの結果を確認します：
<img src={alias_table_select_example} class="image" alt="Example alias table select" />

両方のタイプのエイリアスを使用して、複雑な型変換や JSON フィールドの抽出を実行できます。

## すべての YAML オプション {#all-yaml-options}

これらはプラグインによって利用可能にされたすべての YAML 設定オプションです。
いくつかのフィールドには例の値があり、他のものは単にフィールドの型を示しています。

YAML でデータソースをプロビジョニングする詳細については、[Grafana ドキュメント](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) を参照してください。

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
