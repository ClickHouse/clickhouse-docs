---
sidebar_label: 'プラグイン設定'
sidebar_position: 3
slug: /integrations/grafana/config
description: 'Grafana における ClickHouse データソースプラグインの設定オプション'
title: 'Grafana における ClickHouse データソースの設定'
doc_type: 'guide'
keywords: ['Grafana プラグイン設定', 'データソース設定', '接続パラメータ', '認証設定', 'プラグインオプション']
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

構成を変更する最も簡単な方法は、Grafana の UI にあるプラグイン設定ページから行うことですが、データソースは [YAML ファイルでプロビジョニングすることもできます](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)。

このページでは、ClickHouse プラグインで構成可能なオプションの一覧と、YAML を使ってデータソースをプロビジョニングする場合の設定スニペットを示します。

すべてのオプションを手早く把握したい場合は、設定オプションの完全な一覧を[こちら](#all-yaml-options)で確認できます。



## 共通設定

設定画面の例：

<Image size="sm" img={config_common} alt="セキュアなネイティブ設定の例" border />

共通設定の例となる YAML 設定:

```yaml
jsonData:
  host: 127.0.0.1 # (必須) サーバーアドレス。
  port: 9000      # (必須) サーバーポート。nativeの場合、セキュアはデフォルトで9440、非セキュアは9000。HTTPの場合、セキュアはデフォルトで8443、非セキュアは8123。

  protocol: native # (必須) 接続に使用するプロトコル。"native"または"http"を設定可能。
  secure: false    # 接続がセキュアな場合はtrueに設定。

  username: default # 認証に使用するユーザー名。

  tlsSkipVerify:     <boolean> # trueに設定するとTLS検証をスキップ。
  tlsAuth:           <boolean> # TLSクライアント認証を有効にする場合はtrueに設定。
  tlsAuthWithCACert: <boolean> # CA証明書が提供されている場合はtrueに設定。自己署名TLS証明書の検証に必須。

secureJsonData:
  password: secureExamplePassword # 認証に使用するパスワード。

  tlsCACert:     <string> # TLS CA証明書
  tlsClientCert: <string> # TLSクライアント証明書
  tlsClientKey:  <string> # TLSクライアントキー
```

`version` プロパティは、UI から設定を保存すると追加されます。このプロパティは、その設定がどのバージョンのプラグインで保存されたかを示します。

### HTTP プロトコル

HTTP プロトコル経由で接続するよう選択すると、さらに多くの設定項目が表示されます。

<Image size="md" img={config_http} alt="追加の HTTP 設定オプション" border />

#### HTTP パス

HTTP サーバーが別の URL パスで公開されている場合は、ここで指定できます。

```yaml
jsonData:
  # 先頭のスラッシュは除外
  path: additional/path/example
```

#### カスタム HTTP ヘッダー

サーバーに送信されるリクエストにカスタムヘッダーを追加できます。

ヘッダーはプレーンテキストまたはセキュア値のいずれかにできます。
すべてのヘッダーキーはプレーンテキストで保存されますが、セキュアなヘッダー値はセキュア設定（`password` フィールドと同様）として保存されます。

:::warning HTTP で送信されるセキュア値
セキュアなヘッダー値は設定上は安全に保存されますが、セキュア接続が無効になっている場合は、その値は HTTP 経由で送信されます。
:::

プレーン／セキュアヘッダーの YAML 例:

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


## 追加設定

これらの追加設定は任意です。

<Image size="sm" img={config_additional} alt="追加設定の例" border />

YAML の例:

```yaml
jsonData:
  defaultDatabase: default # クエリビルダーで読み込まれるデフォルトデータベース。デフォルト値は "default"。
  defaultTable: <string>   # クエリビルダーで読み込まれるデフォルトテーブル。

  dialTimeout: 10    # サーバー接続時のダイヤルタイムアウト(秒)。デフォルト値は "10"。
  queryTimeout: 60   # クエリ実行時のタイムアウト(秒)。デフォルト値は 60。ユーザー権限が必要。権限エラーが発生する場合は "0" に設定して無効化すること。
  validateSql: false # true に設定すると、SQLエディタでSQLを検証する。
```

### OpenTelemetry

OpenTelemetry (OTel) は、このプラグインに深く統合されています。
OpenTelemetry のデータは、こちらの [exporter plugin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を使って ClickHouse にエクスポートできます。
最適に利用するために、[logs](#logs) と [traces](#traces) の両方について OTel を構成することを推奨します。

また、強力なオブザーバビリティワークフローを実現する機能である [data links](./query-builder.md#data-links) を有効化するには、これらのデフォルト設定を行っておくことも必須です。

### Logs

[ログクエリの構築](./query-builder.md#logs) を高速化するために、ログクエリ用のデフォルトのデータベース/テーブルおよびカラムを設定できます。これにより、クエリビルダーには実行可能なログクエリがあらかじめ読み込まれ、オブザーバビリティ用途での Explore ページでのブラウジングがより高速になります。

OpenTelemetry を使用している場合は、「**Use OTel**」スイッチを有効にし、**default log table** を `otel_logs` に設定する必要があります。
これにより、選択した OTel スキーマバージョンを使用するように、デフォルトのカラム設定が自動的に上書きされます。

ログに OpenTelemetry は必須ではありませんが、ログ/トレースを単一のデータセットとして扱うことで、[data linking](./query-builder.md#data-links) を用いたスムーズなオブザーバビリティワークフローを実現しやすくなります。

ログ設定画面の例:

<Image size="sm" img={config_logs} alt="Logs の設定" border />

ログ設定 YAML の例:

```yaml
jsonData:
  logs:
    defaultDatabase: default # デフォルトのログデータベース
    defaultTable: otel_logs  # デフォルトのログテーブル。OTelを使用している場合は"otel_logs"に設定してください。

    otelEnabled: false  # OTelを有効にする場合はtrueに設定します。
    otelVersion: latest # 使用するOTel collectorスキーマバージョン。バージョンはUIに表示されますが、"latest"を指定するとプラグインで利用可能な最新バージョンが使用されます。

    # 新しいログクエリを開く際に選択されるデフォルトのカラム。OTelが有効な場合は無視されます。
    timeColumn:       <string> # ログの主要な時刻カラム
    levelColumn:   <string> # ログのレベル/重大度。値は通常"INFO"、"error"、"Debug"のような形式です。
    messageColumn: <string> # ログのメッセージ/内容
```

### トレース

[トレース用のクエリ作成](./query-builder.md#traces)を高速化するために、トレースクエリ用のデフォルトのデータベース / テーブルおよびカラムを設定できます。これにより、クエリビルダーにすぐに実行可能なトレース検索クエリがあらかじめ入力され、観測のために Explore ページでブラウズする操作がより高速になります。

OpenTelemetry を使用している場合は、「**Use OTel**」スイッチを有効にし、**default trace table** を `otel_traces` に設定してください。
これにより、選択した OTel スキーマバージョンを使用するようにデフォルトのカラムが自動的に上書きされます。
OpenTelemetry は必須ではありませんが、この機能はトレースにそのスキーマを使用している場合に最も効果的です。

トレース設定画面の例:

<Image size="sm" img={config_traces} alt="トレース設定" border />

トレース設定 YAML の例:

```yaml
jsonData:
  traces:
    defaultDatabase: default  # デフォルトのトレースデータベース。
    defaultTable: otel_traces # デフォルトのトレーステーブル。OTelを使用している場合は"otel_traces"に設定してください。

    otelEnabled: false  # OTelが有効な場合はtrueに設定してください。
    otelVersion: latest # 使用するOTel collectorスキーマバージョン。バージョンはUIに表示されますが、"latest"を指定するとプラグインで利用可能な最新バージョンが使用されます。
```


    # 新しいトレースクエリを開く際に選択されるデフォルトカラム。OTelが有効な場合は無視されます。
    traceIdColumn:       <string>    # トレースIDカラム。
    spanIdColumn:        <string>    # スパンIDカラム。
    operationNameColumn: <string>    # オペレーション名カラム。
    parentSpanIdColumn:  <string>    # 親スパンIDカラム。
    serviceNameColumn:   <string>    # サービス名カラム。
    durationTimeColumn:  <string>    # 実行時間カラム。
    durationUnitColumn:  <time unit> # 実行時間の単位。"seconds"、"milliseconds"、"microseconds"、または"nanoseconds"に設定可能。OTelのデフォルトは"nanoseconds"です。
    startTimeColumn:     <string>    # 開始時刻カラム。トレーススパンの主要な時刻カラムです。
    tagsColumn:          <string>    # タグカラム。マップ型であることが想定されます。
    serviceTagsColumn:   <string>    # サービスタグカラム。マップ型であることが想定されます。

````

### カラムエイリアス {#column-aliases}

カラムエイリアスは、異なる名前や型でデータをクエリするための便利な方法です。
エイリアスを使用することで、ネストされたスキーマを平坦化し、Grafanaで簡単に選択できるようになります。

エイリアスは以下の場合に有用です:
- スキーマとそのネストされたプロパティ/型のほとんどを把握している
- データをMap型で保存している
- JSONを文字列として保存している
- 選択するカラムを変換するために関数を頻繁に適用する

#### テーブル定義のALIASカラム {#table-defined-alias-columns}

ClickHouseにはカラムエイリアス機能が組み込まれており、Grafanaとそのまま連携します。
エイリアスカラムはテーブル上で直接定義できます。

```sql
CREATE TABLE alias_example (
  TimestampNanos DateTime(9),
  TimestampDate ALIAS toDate(TimestampNanos)
)
````

上記の例では、ナノ秒のタイムスタンプを`Date`型に変換する`TimestampDate`というエイリアスを作成しています。
このデータは最初のカラムのようにディスクに保存されず、クエリ時に計算されます。
テーブル定義のエイリアスは`SELECT *`では返されませんが、サーバー設定で変更可能です。

詳細については、[ALIAS](/sql-reference/statements/create/table#alias)カラム型のドキュメントを参照してください。

#### カラムエイリアステーブル {#column-alias-tables}

デフォルトでは、Grafanaは`DESC table`のレスポンスに基づいてカラムの候補を提供します。
場合によっては、Grafanaが認識するカラムを完全に上書きしたい場合があります。
これにより、カラム選択時にGrafana上でスキーマを隠蔽でき、テーブルの複雑さに応じてユーザーエクスペリエンスを向上させることができます。

テーブル定義のエイリアスと比較した利点は、テーブルを変更することなく簡単に更新できることです。一部のスキーマでは、数千のエントリになることがあり、基礎となるテーブル定義が煩雑になる可能性があります。また、ユーザーに無視してほしいカラムを非表示にすることもできます。

Grafanaでは、エイリアステーブルに以下のカラム構造が必要です:

```sql
CREATE TABLE aliases (
  `alias` String,  -- Grafanaのカラムセレクターに表示されるエイリアスの名前
  `select` String, -- SQLジェネレーターで使用するSELECT構文
  `type` String    -- 結果カラムの型。プラグインがデータ型に合わせてUIオプションを変更できるようにします。
)
```

エイリアステーブルを使用して`ALIAS`カラムの動作を再現する方法は以下の通りです:

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- テーブルの元のカラムを保持(オプション)
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- TimestampNanosをDateに変換する新しいカラムを追加
```

その後、このテーブルをGrafanaで使用するように設定できます。名前は任意で、別のデータベースで定義することも可能です:

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


## すべての YAML オプション

これらは、このプラグインで利用可能なすべての YAML 設定オプションです。
一部のフィールドには値の例が示されており、その他のフィールドはフィールドの型のみが示されています。

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
