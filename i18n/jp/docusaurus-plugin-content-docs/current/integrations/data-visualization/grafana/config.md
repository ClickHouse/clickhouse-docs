---
sidebar_label: 'プラグインの設定'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'GrafanaにおけるClickHouseデータソースプラグインの設定オプション'
title: 'GrafanaにおけるClickHouseデータソースの設定'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# GrafanaにおけるClickHouseデータソースの設定

<ClickHouseSupportedBadge/>

設定を変更する最も簡単な方法は、GrafanaのUIでプラグイン設定ページを使用することですが、データソースは[YAMLファイルでプロビジョニングすることも可能です](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

このページでは、ClickHouseプラグインで利用できる設定オプションのリストと、YAMLを使用してデータソースをプロビジョニングするための設定スニペットを示します。

すべてのオプションのクイック概要については、[こちら](#all-yaml-options)で完全な設定オプションのリストを確認できます。

## 一般設定 {#common-settings}

例の設定画面：
<Image size="sm" img={config_common} alt="Example secure native config" border />

一般設定のための設定YAMLの例：
```yaml
jsonData:
  host: 127.0.0.1 # (required) サーバーアドレス。
  port: 9000      # (required) サーバーポート。ネイティブの場合は9440の安全なポートと9000の安全でないポートにデフォルト設定されます。HTTPの場合は8443の安全なポートと8123の安全でないポートにデフォルト設定されます。

  protocol: native # (required) 接続に使用されるプロトコル。"native"または"http"に設定できます。
  secure: false    # 接続が安全な場合はtrueに設定します。

  username: default # 認証に使用されるユーザー名。

  tlsSkipVerify:     <boolean> # trueに設定するとTLS検証をスキップします。
  tlsAuth:           <boolean> # trueに設定するとTLSクライアント認証が有効になります。
  tlsAuthWithCACert: <boolean> # CA証明書が提供されている場合はtrueに設定します。自己署名のTLS証明書の検証に必要です。

secureJsonData:
  password: secureExamplePassword # 認証に使用されるパスワード。

  tlsCACert:     <string> # TLS CA証明書
  tlsClientCert: <string> # TLSクライアント証明書
  tlsClientKey:  <string> # TLSクライアントキー
```

設定がUIから保存されると、`version`プロパティが追加されます。これは、設定が保存されたプラグインのバージョンを示します。

### HTTPプロトコル {#http-protocol}

HTTPプロトコル経由で接続することを選択すると、さらに設定項目が表示されます。

<Image size="md" img={config_http} alt="Extra HTTP config options" border />

#### HTTPパス {#http-path}

HTTPサーバーが別のURLパスの下に公開されている場合は、ここに追加できます。

```yaml
jsonData:
  # 最初のスラッシュを除外
  path: additional/path/example
```

#### カスタムHTTPヘッダー {#custom-http-headers}

サーバーに送信されるリクエストにカスタムヘッダーを追加できます。

ヘッダーはプレーンテキストまたはセキュアである可能性があります。
すべてのヘッダーキーはプレーンテキストで保存され、セキュアなヘッダー値はセキュアな設定に保存されます（`password`フィールドに似ています）。

:::warning セキュア値はHTTPを通じて送信
セキュアヘッダー値は設定で安全に保存されますが、安全な接続が無効にされている場合、値はHTTPを通じて送信されます。
:::

プレーン/セキュアヘッダーの例YAML：
```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value"は除外
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```

## 追加設定 {#additional-settings}

これらの追加設定はオプションです。

<Image size="sm" img={config_additional} alt="Example additional settings" border />

例のYAML：
```yaml
jsonData:
  defaultDatabase: default # クエリビルダーによって読み込まれるデフォルトのデータベース。デフォルトは"default"。
  defaultTable: <string>   # クエリビルダーによって読み込まれるデフォルトのテーブル。

  dialTimeout: 10    # サーバーへの接続時のダイヤルタイムアウト（秒単位）。デフォルトは"10"。
  queryTimeout: 60   # クエリを実行する際のクエリタイムアウト（秒単位）。デフォルトは60。これにはユーザーの権限が必要で、権限エラーが発生した場合は、"0"に設定して無効にしてみてください。
  validateSql: false # trueに設定すると、SQLエディタ内のSQLが検証されます。
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) はプラグイン内に深く統合されています。
OpenTelemetryデータは、当社の[エクスポータープラグイン](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)を使用してClickHouseにエクスポートできます。
最良の使用法を考慮して、OTelを[ログ](#logs)と[トレース](#traces)の両方に設定することをお勧めします。

また、[データリンク](./query-builder.md#data-links)を有効にするためにこれらのデフォルトを設定する必要があります。この機能は強力な可観測性ワークフローを可能にします。

### ログ {#logs}

[ログのクエリビルディングを高速化する](./query-builder.md#logs)ためには、デフォルトのデータベース/テーブルおよびログクエリ用のカラムを設定できます。これにより、クエリビルダーに実行可能なログクエリが事前に読み込まれ、可観測性のための探索ページでの閲覧が速くなります。

OpenTelemetryを使用している場合は、"**OTelを使用**"スイッチを有効にし、**デフォルトのログテーブル**を`otel_logs`に設定する必要があります。
これにより、デフォルトのカラムが自動的に選択したOTelスキーマバージョンを使用するように上書きされます。

OpenTelemetryはログには必要ではありませんが、単一のログ/トレースデータセットを使用することで、[データリンク](./query-builder.md#data-links)を使用したスムーズな可観測性ワークフローを実現できます。

例のログ設定画面：
<Image size="sm" img={config_logs} alt="Logs config" border />

例のログ設定YAML：
```yaml
jsonData:
  logs:
    defaultDatabase: default # デフォルトのログデータベース。
    defaultTable: otel_logs  # デフォルトのログテーブル。OTelを使用している場合、これは"otel_logs"に設定する必要があります。

    otelEnabled: false  # OTelが有効な場合はtrueに設定します。
    otelVersion: latest # 使用されるotelコレクタースキーマのバージョン。バージョンはUIに表示されますが、"latest"はプラグインで入手可能な最新バージョンを使用します。

    # 新しいログクエリを開くときに選択されるデフォルトカラム。OTelが有効な場合は無視されます。
    timeColumn:       <string> # ログの主な時間カラム。
    levelColumn:   <string> # ログのレベル/深刻度。値は通常"INFO"、"error"、または"Debug"のようになります。
    messageColumn: <string> # ログのメッセージ/内容。
```

### トレース {#traces}

[トレースのクエリビルディングを高速化する](./query-builder.md#traces)ためには、デフォルトのデータベース/テーブルおよびトレースクエリ用のカラムを設定できます。これにより、クエリビルダーに実行可能なトレース検索クエリが事前に読み込まれ、可観測性のための探索ページでの閲覧が速くなります。

OpenTelemetryを使用している場合は、"**OTelを使用**"スイッチを有効にし、**デフォルトのトレーステーブル**を`otel_traces`に設定する必要があります。
これにより、デフォルトのカラムが自動的に選択したOTelスキーマバージョンを使用するように上書きされます。
OpenTelemetryは必須ではありませんが、この機能はトレースにOTelのスキーマを使用すると最良の結果が得られます。

例のトレース設定画面：
<Image size="sm" img={config_traces} alt="Traces config" border />

例のトレース設定YAML：
```yaml
jsonData:
  traces:
    defaultDatabase: default  # デフォルトのトレースデータベース。
    defaultTable: otel_traces # デフォルトのトレーステーブル。OTelを使用している場合、これは"otel_traces"に設定する必要があります。

    otelEnabled: false  # OTelが有効な場合はtrueに設定します。
    otelVersion: latest # 使用されるotelコレクタースキーマのバージョン。バージョンはUIに表示されますが、"latest"はプラグインで入手可能な最新バージョンを使用します。

    # 新しいトレースクエリを開くときに選択されるデフォルトカラム。OTelが有効な場合は無視されます。
    traceIdColumn:       <string>    # トレースIDカラム。
    spanIdColumn:        <string>    # スパンIDカラム。
    operationNameColumn: <string>    # 操作名カラム。
    parentSpanIdColumn:  <string>    # 親スパンIDカラム。
    serviceNameColumn:   <string>    # サービス名カラム。
    durationTimeColumn:  <string>    # 持続時間カラム。
    durationUnitColumn:  <time unit> # 持続時間単位。"seconds"、"milliseconds"、"microseconds"、または"nanoseconds"のいずれかに設定できます。OTelの場合、デフォルトは"nanoseconds"です。
    startTimeColumn:     <string>    # 開始時間カラム。これはトレーススパンの主な時間カラムです。
    tagsColumn:          <string>    # タグカラム。これはマップ型であることが期待されます。
    serviceTagsColumn:   <string>    # サービスタグカラム。これもマップ型であることが期待されます。
```

### カラム別名 {#column-aliases}

カラムエイリアスは、異なる名前やタイプでデータをクエリする便利な方法です。
エイリアスを使用すると、ネストされたスキーマを取り込み、それをフラットにしてGrafanaで簡単に選択できるようにします。

エイリアスは、次のような場合に関連があります：
- スキーマとそのほとんどのネストされたプロパティ/タイプを知っている場合
- Mapタイプにデータを保存している場合
- JSONを文字列として保存している場合
- 選択するカラムを変換する関数を適用することが多い場合

#### テーブル定義のALIASカラム {#table-defined-alias-columns}

ClickHouseにはカラムエイリアスが組み込まれており、Grafanaとすぐに連携します。
エイリアスカラムはテーブル上で直接定義できます。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
```

上記の例では、ナノ秒のタイムスタンプを`Date`型に変換する`TimestampDate`というエイリアスを作成します。
このデータは最初のカラムのようにディスク上に保存されることはなく、クエリ実行時に計算されます。
テーブル定義のエイリアスは`SELECT *`で返されないため、これはサーバー設定で構成できます。

詳細については、[ALIAS](/sql-reference/statements/create/table#alias)カラムタイプのドキュメントを参照してください。

#### カラムエイリアステーブル {#column-alias-tables}

デフォルトでは、Grafanaは`DESC table`からの応答に基づいてカラムのサジェストを提供します。
時には、Grafanaが参照するカラムを完全に上書きしたいことがあります。
これはカラムを選択する際のスキーマを隠すのに役立ち、その結果、テーブルの複雑さに応じてユーザーエクスペリエンスを向上させることができます。

テーブル定義のエイリアスとの利点は、テーブルを変更することなしに簡単に更新できる点です。一部のスキーマでは、これが千件以上のエントリに及ぶことがあり、基盤となるテーブル定義が煩雑になる可能性があります。また、ユーザーに無視させたいカラムを隠すこともできます。

Grafanaは、エイリアステーブルに以下のカラム構造を要求します：
```sql
CREATE TABLE aliases (
  `alias` String,  -- Grafanaカラムセレクタに表示されるエイリアスの名前
  `select` String, -- SQLジェネレーターで使用するSELECT構文
  `type` String    -- 結果カラムの種類。プラグインがデータ型に合わせてUIオプションを変更できるようにします。
)
```

次のように、エイリアステーブルを使用して`ALIAS`カラムの動作を複製できます：
```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- オリジナルカラムをテーブルから保持（オプション）
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- TimestampNanosをDateに変換する新しいカラムを追加
```

このテーブルをGrafanaで使用するように構成できます。名前は何でも構いませんし、別のデータベースに定義しても構いません：
<Image size="md" img={alias_table_config_example} alt="Example alias table config" border />

これでGrafanaは、`DESC example_table`の結果の代わりにエイリアステーブルの結果を表示します：
<Image size="md" img={alias_table_select_example} alt="Example alias table select" border />

両方のタイプのエイリアスを使用して、複雑な型変換やJSONフィールド抽出を実行できます。

## すべてのYAMLオプション {#all-yaml-options}

以下は、プラグインによって提供されるすべてのYAML設定オプションです。
一部のフィールドには例の値が含まれており、他のフィールドは単にフィールドの型を示しています。

データソースをYAMLでプロビジョニングする詳細については、[Grafanaドキュメント](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)を参照してください。

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
