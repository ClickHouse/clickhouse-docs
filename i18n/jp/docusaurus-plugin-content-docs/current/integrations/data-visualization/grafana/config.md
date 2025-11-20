---
sidebar_label: 'プラグインの設定'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Grafana における ClickHouse データソースプラグインの構成オプション'
title: 'Grafana における ClickHouse データソースの構成'
doc_type: 'guide'
keywords: ['Grafana プラグインの構成', 'データソースの設定', '接続パラメータ', '認証設定', 'プラグインオプション']
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


# Grafana での ClickHouse データソースの構成

<ClickHouseSupportedBadge/>

構成を変更する最も簡単な方法は、Grafana のプラグイン設定ページにある UI を使うことですが、データソースは [YAML ファイルでプロビジョニングすることもできます](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

このページでは、ClickHouse プラグインで設定可能なオプションの一覧と、YAML でデータソースをプロビジョニングする場合の設定スニペットを紹介します。

すべてのオプションを手早く確認したい場合は、設定オプションの完全な一覧が [こちら](#all-yaml-options) にあります。



## 共通設定 {#common-settings}

設定画面の例:

<Image
  size='sm'
  img={config_common}
  alt='セキュアなネイティブ設定の例'
  border
/>

共通設定のYAML設定例:

```yaml
jsonData:
  host: 127.0.0.1 # (必須) サーバーアドレス
  port: 9000 # (必須) サーバーポート。ネイティブの場合、デフォルトはセキュア接続で9440、非セキュア接続で9000。HTTPの場合、デフォルトはセキュア接続で8443、非セキュア接続で8123

  protocol: native # (必須) 接続に使用するプロトコル。"native"または"http"を設定可能
  secure: false # 接続がセキュアな場合はtrueに設定

  username: default # 認証に使用するユーザー名

  tlsSkipVerify: <boolean> # trueに設定するとTLS検証をスキップ
  tlsAuth: <boolean> # TLSクライアント認証を有効にする場合はtrueに設定
  tlsAuthWithCACert: <boolean> # CA証明書が提供されている場合はtrueに設定。自己署名TLS証明書の検証に必要

secureJsonData:
  password: secureExamplePassword # 認証に使用するパスワード

  tlsCACert: <string> # TLS CA証明書
  tlsClientCert: <string> # TLSクライアント証明書
  tlsClientKey: <string> # TLSクライアントキー
```

UIから設定を保存すると`version`プロパティが追加されます。これは設定が保存されたプラグインのバージョンを示します。

### HTTPプロトコル {#http-protocol}

HTTPプロトコル経由で接続する場合、追加の設定が表示されます。

<Image size='md' img={config_http} alt='追加のHTTP設定オプション' border />

#### HTTPパス {#http-path}

HTTPサーバーが異なるURLパスで公開されている場合、ここで指定できます。

```yaml
jsonData:
  # 先頭のスラッシュは除く
  path: additional/path/example
```

#### カスタムHTTPヘッダー {#custom-http-headers}

サーバーに送信されるリクエストにカスタムヘッダーを追加できます。

ヘッダーはプレーンテキストまたはセキュアのいずれかを指定できます。
すべてのヘッダーキーはプレーンテキストで保存され、セキュアなヘッダー値はセキュア設定に保存されます(`password`フィールドと同様)。

:::warning HTTP経由のセキュア値
セキュアなヘッダー値は設定内で安全に保存されますが、セキュア接続が無効な場合、値はHTTP経由で送信されます。
:::

プレーン/セキュアヘッダーのYAML例:

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

<Image
  size='sm'
  img={config_additional}
  alt='追加設定の例'
  border
/>

YAMLの例：

```yaml
jsonData:
  defaultDatabase: default # クエリビルダーで読み込まれるデフォルトデータベース。デフォルトは "default"。
  defaultTable: <string> # クエリビルダーで読み込まれるデフォルトテーブル。

  dialTimeout: 10 # サーバー接続時のダイヤルタイムアウト（秒単位）。デフォルトは "10"。
  queryTimeout: 60 # クエリ実行時のクエリタイムアウト（秒単位）。デフォルトは60。ユーザー権限が必要です。権限エラーが発生した場合は、"0" に設定して無効化してください。
  validateSql: false # true に設定すると、SQLエディタでSQLを検証します。
```

### OpenTelemetry {#opentelemetry}

OpenTelemetry（OTel）はプラグインに深く統合されています。
OpenTelemetryデータは、[エクスポータープラグイン](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)を使用してClickHouseにエクスポートできます。
最適な利用のためには、[ログ](#logs)と[トレース](#traces)の両方でOTelを設定することを推奨します。

また、強力なオブザーバビリティワークフローを実現する[データリンク](./query-builder.md#data-links)機能を有効にするには、これらのデフォルト設定を構成する必要があります。

### ログ {#logs}

[ログのクエリ構築](./query-builder.md#logs)を高速化するために、デフォルトのデータベース/テーブルおよびログクエリ用のカラムを設定できます。これにより、実行可能なログクエリがクエリビルダーに事前読み込みされ、オブザーバビリティのための探索ページの閲覧が高速化されます。

OpenTelemetryを使用している場合は、「**Use OTel**」スイッチを有効にし、**デフォルトログテーブル**を `otel_logs` に設定してください。
これにより、選択されたOTelスキーマバージョンを使用するようにデフォルトカラムが自動的に上書きされます。

OpenTelemetryはログに必須ではありませんが、単一のログ/トレースデータセットを使用することで、[データリンク](./query-builder.md#data-links)によるよりスムーズなオブザーバビリティワークフローが実現されます。

ログ設定画面の例：

<Image size='sm' img={config_logs} alt='ログ設定' border />

ログ設定YAMLの例：

```yaml
jsonData:
  logs:
    defaultDatabase: default # デフォルトログデータベース。
    defaultTable: otel_logs # デフォルトログテーブル。OTelを使用している場合は、"otel_logs" に設定してください。

    otelEnabled: false # OTelが有効な場合はtrueに設定します。
    otelVersion: latest # 使用するotel collectorスキーマバージョン。バージョンはUIに表示されますが、"latest" はプラグインで利用可能な最新バージョンを使用します。

    # 新しいログクエリを開く際に選択されるデフォルトカラム。OTelが有効な場合は無視されます。
    timeColumn: <string> # ログのプライマリ時刻カラム。
    levelColumn: <string> # ログのレベル/重大度。値は通常 "INFO"、"error"、"Debug" のようになります。
    messageColumn: <string> # ログのメッセージ/内容。
```

### トレース {#traces}

[トレースのクエリ構築](./query-builder.md#traces)を高速化するために、デフォルトのデータベース/テーブルおよびトレースクエリ用のカラムを設定できます。これにより、実行可能なトレース検索クエリがクエリビルダーに事前読み込みされ、オブザーバビリティのための探索ページの閲覧が高速化されます。

OpenTelemetryを使用している場合は、「**Use OTel**」スイッチを有効にし、**デフォルトトレーステーブル**を `otel_traces` に設定してください。
これにより、選択されたOTelスキーマバージョンを使用するようにデフォルトカラムが自動的に上書きされます。
OpenTelemetryは必須ではありませんが、この機能はトレースにそのスキーマを使用する場合に最も効果的に動作します。

トレース設定画面の例：

<Image size='sm' img={config_traces} alt='トレース設定' border />

トレース設定YAMLの例：

```yaml
jsonData:
  traces:
    defaultDatabase: default # デフォルトトレースデータベース。
    defaultTable: otel_traces # デフォルトトレーステーブル。OTelを使用している場合は、"otel_traces" に設定してください。

    otelEnabled: false # OTelが有効な場合はtrueに設定します。
    otelVersion: latest # 使用するotel collectorスキーマバージョン。バージョンはUIに表示されますが、"latest" はプラグインで利用可能な最新バージョンを使用します。
```


    # 新しいトレースクエリを開く際に選択されるデフォルトカラム。OTelが有効な場合は無視されます。
    traceIdColumn:       <string>    # トレースIDカラム。
    spanIdColumn:        <string>    # スパンIDカラム。
    operationNameColumn: <string>    # オペレーション名カラム。
    parentSpanIdColumn:  <string>    # 親スパンIDカラム。
    serviceNameColumn:   <string>    # サービス名カラム。
    durationTimeColumn:  <string>    # 実行時間カラム。
    durationUnitColumn:  <time unit> # 実行時間の単位。"seconds"、"milliseconds"、"microseconds"、または"nanoseconds"に設定可能。OTelの場合、デフォルトは"nanoseconds"です。
    startTimeColumn:     <string>    # 開始時刻カラム。トレーススパンの主要な時刻カラムです。
    tagsColumn:          <string>    # タグカラム。マップ型である必要があります。
    serviceTagsColumn:   <string>    # サービスタグカラム。マップ型である必要があります。

````

### カラムエイリアス {#column-aliases}

カラムエイリアスは、異なる名前や型でデータをクエリするための便利な機能です。
エイリアスを使用することで、ネストされたスキーマを平坦化し、Grafanaで簡単に選択できるようになります。

エイリアスは以下の場合に有用です:
- スキーマとそのネストされたプロパティ/型のほとんどを把握している場合
- データをMap型で保存している場合
- JSONを文字列として保存している場合
- 選択するカラムを変換する関数を頻繁に適用する場合

#### テーブル定義のALIASカラム {#table-defined-alias-columns}

ClickHouseにはカラムエイリアス機能が組み込まれており、Grafanaとすぐに連携できます。
エイリアスカラムはテーブル上で直接定義できます。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
````

上記の例では、ナノ秒のタイムスタンプを`Date`型に変換する`TimestampDate`というエイリアスを作成しています。
このデータは最初のカラムのようにディスクに保存されず、クエリ実行時に計算されます。
テーブル定義のエイリアスは`SELECT *`では返されませんが、サーバー設定で変更可能です。

詳細については、[ALIAS](/sql-reference/statements/create/table#alias)カラム型のドキュメントを参照してください。

#### カラムエイリアステーブル {#column-alias-tables}

デフォルトでは、Grafanaは`DESC table`のレスポンスに基づいてカラムの候補を提供します。
場合によっては、Grafanaが認識するカラムを完全に上書きしたいことがあります。
これにより、カラム選択時にGrafanaでスキーマを隠蔽でき、テーブルの複雑さに応じてユーザーエクスペリエンスを向上させることができます。

テーブル定義のエイリアスに対するこの方法の利点は、テーブルを変更することなく簡単に更新できることです。一部のスキーマでは、エイリアスが数千のエントリに及ぶ可能性があり、基礎となるテーブル定義を煩雑にする可能性があります。また、ユーザーに表示したくないカラムを隠すこともできます。

Grafanaでは、エイリアステーブルが以下のカラム構造を持つ必要があります:

```sql
CREATE TABLE aliases (
  `alias` String,  -- Grafanaのカラムセレクターに表示されるエイリアスの名前
  `select` String, -- SQLジェネレーターで使用するSELECT構文
  `type` String    -- 結果カラムの型。プラグインがデータ型に合わせてUIオプションを変更できるようにします。
)
```

エイリアステーブルを使用して`ALIAS`カラムの動作を再現する方法は次のとおりです:

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- テーブルの元のカラムを保持(オプション)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- TimestampNanosをDateに変換する新しいカラムを追加
```

その後、このテーブルをGrafanaで使用するように設定できます。名前は任意のものにでき、別のデータベースで定義することもできます:

<Image
  size='md'
  img={alias_table_config_example}
  alt='エイリアステーブル設定の例'
  border
/>

これで、Grafanaは`DESC example_table`の結果ではなく、エイリアステーブルの結果を認識するようになります:

<Image
  size='md'
  img={alias_table_select_example}
  alt='エイリアステーブル選択の例'
  border
/>

両方のタイプのエイリアスは、複雑な型変換やJSONフィールドの抽出を実行するために使用できます。


## すべてのYAMLオプション {#all-yaml-options}

以下は、このプラグインで利用可能なすべてのYAML設定オプションです。
一部のフィールドには例示値が記載されており、その他のフィールドは型のみを示しています。

YAMLを使用したデータソースのプロビジョニングの詳細については、[Grafanaドキュメント](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)を参照してください。

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
      tlsCACert: <string>
      tlsClientCert: <string>
      tlsClientKey: <string>
      secureHttpHeaders.X-Example-Secure-Header: secure header value
```
