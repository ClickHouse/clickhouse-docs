---
sidebar_label: 'プラグイン構成'
sidebar_position: 3
slug: '/integrations/grafana/config'
description: 'Grafana における ClickHouse データソースプラグインの構成オプション'
title: 'Grafana での ClickHouse データソースの構成'
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


# ClickHouse データソースの Grafana における設定

<ClickHouseSupportedBadge/>

構成を変更する最も簡単な方法は、Grafana UI のプラグイン設定ページで行うことですが、データソースも [YAML ファイルでプロビジョニング](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) できます。

このページでは、ClickHouse プラグインでの設定に利用可能なオプションのリストと、YAML でデータソースをプロビジョニングするための構成スニペットを示します。

すべてのオプションの概要については、完全な構成オプションのリストを [こちら](#all-yaml-options) で確認できます。

## 一般的な設定 {#common-settings}

例の設定画面：
<Image size="sm" img={config_common} alt="Example secure native config" border />

一般的な設定のための例の YAML：
```yaml
jsonData:
  host: 127.0.0.1 # (required) サーバーアドレス。
  port: 9000      # (required) サーバーポート。ネイティブの場合、9440がセキュア、9000が非セキュアのデフォルトです。HTTPの場合、8443がセキュア、8123が非セキュアのデフォルトです。

  protocol: native # (required) 接続に使用されるプロトコル。 "native" または "http" に設定できます。
  secure: false    # 接続がセキュアであれば true に設定します。

  username: default # 認証に使用されるユーザー名。

  tlsSkipVerify:     <boolean> # true に設定すると、TLS 検証をスキップします。
  tlsAuth:           <boolean> # TLS クライアント認証を有効にするために true に設定します。
  tlsAuthWithCACert: <boolean> # CA 証明書が提供されている場合は true に設定します。自己署名 TLS 証明書を検証するために必要です。

secureJsonData:
  password: secureExamplePassword # 認証に使用されるパスワード。

  tlsCACert:     <string> # TLS CA 証明書
  tlsClientCert: <string> # TLS クライアント証明書
  tlsClientKey:  <string> # TLS クライアントキー
```

設定が UI から保存されると、`version` プロパティが追加されることに注意してください。これにより、その設定が保存されたプラグインのバージョンが表示されます。

### HTTP プロトコル {#http-protocol}

HTTP プロトコル経由で接続を選択すると、追加の設定が表示されます。

<Image size="md" img={config_http} alt="Extra HTTP config options" border />

#### HTTP パス {#http-path}

HTTP サーバーが異なる URL パスで公開されている場合は、ここに追加できます。

```yaml
jsonData:
  # 最初のスラッシュを除外します
  path: additional/path/example
```

#### カスタム HTTP ヘッダー {#custom-http-headers}

サーバーに送信するリクエストにカスタムヘッダーを追加できます。

ヘッダーはプレーンテキストまたはセキュアであることができます。
すべてのヘッダーキーはプレーンテキストで保存され、セキュアヘッダー値はセキュア構成に保存されます（`password` フィールドに似ています）。

:::warning セキュア値を HTTP 経由で送信
セキュアヘッダー値はセキュア構成に安全に保存されますが、セキュア接続が無効になっている場合は、値が HTTP 経由で送信されます。
:::

プレーン/セキュアヘッダーの例 YAML：
```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value" は除外されます
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
  defaultDatabase: default # クエリビルダーによって読み込まれるデフォルトのデータベース。デフォルトは "default" です。
  defaultTable: <string>   # クエリビルダーによって読み込まれるデフォルトのテーブル。

  dialTimeout: 10    # サーバーへの接続時のダイアルタイムアウト（秒）。デフォルトは "10" です。
  queryTimeout: 60   # クエリ実行時のクエリタイムアウト（秒）。デフォルトは 60 です。これはユーザーの権限が必要です。権限エラーが発生した場合は、"0" に設定して無効にしてみてください。
  validateSql: false # true に設定すると、SQL エディタ内の SQL を検証します。
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) はプラグインに深く統合されています。
OpenTelemetry データは、当社の [exporter plugin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を使用して ClickHouse にエクスポートできます。
最適な使用法のために、[logs](#logs) と [traces](#traces) の両方に OTel を設定することをお勧めします。

また、[data links](./query-builder.md#data-links) を有効にするためのデフォルトも設定する必要があります。これは強力な可観測性ワークフローを可能にする機能です。

### ログ {#logs}

[ログのクエリビルディングを加速するため](./query-builder.md#logs)、デフォルトのデータベース/テーブルおよびログクエリのカラムを設定できます。これにより、クエリビルダーに実行可能なログクエリが事前ロードされ、探求ページでのブラウジングが速くなります。

OpenTelemetry を使用している場合は、"**Use OTel**" スイッチを有効にし、**default log table** を `otel_logs` に設定する必要があります。
これにより、デフォルトのカラムが選択された OTel スキーマバージョンを使用するように自動的に上書きされます。

OpenTelemetry がログに必要ではありませんが、単一のログ/トレースデータセットを使用すると、[data linking](./query-builder.md#data-links) による可観測性ワークフローがスムーズになるのに役立ちます。

ログ設定画面の例：
<Image size="sm" img={config_logs} alt="Logs config" border />

ログ設定の例 YAML：
```yaml
jsonData:
  logs:
    defaultDatabase: default # デフォルトのログデータベース。
    defaultTable: otel_logs  # デフォルトのログテーブル。OTel を使用している場合は "otel_logs" に設定する必要があります。

    otelEnabled: false  # OTel が有効な場合は true に設定します。
    otelVersion: latest # 使用する OTel コレクタのスキーマバージョン。バージョンは UI に表示されますが、"latest" はプラグインの利用可能な最新バージョンを使用します。

    # 新しいログクエリを開くときに選択されるデフォルトのカラム。OTel が有効な場合は無視されます。
    timeColumn:       <string> # ログの主要な時刻カラム。
    levelColumn:   <string> # ログのレベル/重大度。値は通常 "INFO"、"error"、または "Debug" のようになります。
    messageColumn: <string> # ログのメッセージ/コンテンツ。
```

### トレース {#traces}

[トレースのクエリビルディングを加速するため](./query-builder.md#traces)、デフォルトのデータベース/テーブルおよびトレースクエリのカラムを設定できます。これにより、クエリビルダーに実行可能なトレース検索クエリが事前ロードされ、探求ページでのブラウジングが速くなります。

OpenTelemetry を使用している場合は、"**Use OTel**" スイッチを有効にし、**default trace table** を `otel_traces` に設定する必要があります。
これにより、デフォルトのカラムが選択された OTel スキーマバージョンを使用するように自動的に上書きされます。
OpenTelemetry は必須ではありませんが、この機能はトレースのスキーマを使用する際に最も効果を発揮します。

トレース設定画面の例：
<Image size="sm" img={config_traces} alt="Traces config" border />

トレース設定の例 YAML：
```yaml
jsonData:
  traces:
    defaultDatabase: default  # デフォルトのトレースデータベース。
    defaultTable: otel_traces # デフォルトのトレーステーブル。OTel を使用している場合は "otel_traces" に設定する必要があります。

    otelEnabled: false  # OTel が有効な場合は true に設定します。
    otelVersion: latest # 使用する OTel コレクタのスキーマバージョン。バージョンは UI に表示されますが、"latest" はプラグインの利用可能な最新バージョンを使用します。

    # 新しいトレースクエリを開くときに選択されるデフォルトのカラム。OTel が有効な場合は無視されます。
    traceIdColumn:       <string>    # トレース ID カラム。
    spanIdColumn:        <string>    # スパン ID カラム。
    operationNameColumn: <string>    # 操作名カラム。
    parentSpanIdColumn:  <string>    # 親スパン ID カラム。
    serviceNameColumn:   <string>    # サービス名カラム。
    durationTimeColumn:  <string>    # 継続時間カラム。
    durationUnitColumn:  <time unit> # 継続時間の単位。 "seconds"、"milliseconds"、"microseconds"、または "nanoseconds" に設定できます。OTel のデフォルトは "nanoseconds" です。
    startTimeColumn:     <string>    # 開始時刻カラム。このカラムはトレーススパンの主要な時刻カラムです。
    tagsColumn:          <string>    # タグカラム。これはマップタイプであることが期待されます。
    serviceTagsColumn:   <string>    # サービスタグカラム。これはマップタイプであることが期待されます。
```

### カラムエイリアス {#column-aliases}

カラムエイリアスは、異なる名前や型でデータをクエリするための便利な方法です。
エイリアスを使用すると、ネストされたスキーマをフラット化し、Grafana で簡単に選択できるようにできます。

次の条件に当てはまる場合は、エイリアスが関連するかもしれません：
- スキーマとそのネストされたプロパティ/型のほとんどを知っている
- Map タイプでデータを保存している
- JSON を文字列として保存している
- 選択するカラムを変換するために関数を頻繁に適用している

#### テーブル定義エイリアスカラム {#table-defined-alias-columns}

ClickHouse にはエイリアス機能が組み込まれており、Grafana と連携して動作します。
エイリアスカラムはテーブル上で直接定義できます。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

上記の例では、ナノ秒のタイムスタンプを `Date` 型に変換するエイリアス `TimestampDate` を作成しています。
このデータは、最初のカラムのようにディスクに保存されることはなく、クエリ実行時に計算されます。
テーブル定義エイリアスは `SELECT *` で返されませんが、サーバー設定でこの動作を構成できます。

詳細については、[ALIAS](/sql-reference/statements/create/table#alias) カラムタイプのドキュメントを参照してください。

#### カラムエイリアステーブル {#column-alias-tables}

デフォルトでは、Grafana は `DESC table` の応答に基づいてカラムの提案を提供します。
場合によっては、Grafana が見るカラムを完全に上書きしたいことがあります。
これにより、カラムを選択する際に Grafana でスキーマを隠すことができ、テーブルの複雑さに応じてユーザーエクスペリエンスが向上します。

テーブル定義エイリアスの利点は、テーブルを変更することなく、エイリアスを簡単に更新できることです。一部のスキーマでは、これが何千件ものエントリに達することがあり、基になるテーブル定義が乱雑になる可能性があります。また、ユーザーに無視してほしいカラムを隠すこともできます。

Grafana では、エイリアステーブルに次のカラム構造が必要です：
```sql
CREATE TABLE aliases (
  `alias` String,  -- Grafana カラムセレクタで表示されるエイリアスの名前
  `select` String, -- SQL ジェネレータで使用する SELECT 構文
  `type` String    -- 結果カラムの型で、プラグインがデータ型に一致する UI オプションを変更できるようにします。
)
```

次のように、エイリアステーブルを使用して `ALIAS` カラムの動作を再現できます：
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- テーブルの元のカラムを保持（オプショナル）
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- TimestampNanos を日付に変換する新しいカラムを追加
```

このテーブルを Grafana で使用するように構成できます。名前は何でもよく、別のデータベースに定義することも可能です：
<Image size="md" img={alias_table_config_example} alt="Example alias table config" border />

これで、Grafana は `DESC example_table` の結果ではなく、エイリアステーブルの結果を表示します：
<Image size="md" img={alias_table_select_example} alt="Example alias table select" border />

両方のエイリアス方式を使用して、複雑な型変換や JSON フィールド抽出を実行できます。

## すべての YAML オプション {#all-yaml-options}

これが、プラグインによって提供されるすべての YAML 構成オプションです。
一部のフィールドには例の値が、他のフィールドにはフィールドの型が表示されます。

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
