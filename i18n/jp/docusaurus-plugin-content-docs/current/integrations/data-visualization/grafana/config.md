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
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import config_common from '@site/static/images/integrations/data-visualization/grafana/config_common.png';
import config_http from '@site/static/images/integrations/data-visualization/grafana/config_http.png';
import config_additional from '@site/static/images/integrations/data-visualization/grafana/config_additional.png';
import config_logs from '@site/static/images/integrations/data-visualization/grafana/config_logs.png';
import config_traces from '@site/static/images/integrations/data-visualization/grafana/config_traces.png';
import alias_table_config_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_config_example.png';
import alias_table_select_example from '@site/static/images/integrations/data-visualization/grafana/alias_table_select_example.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Grafana での ClickHouse データソースの設定 {#configuring-clickhouse-data-source-in-grafana}

<ClickHouseSupportedBadge/>

設定を変更する最も簡単な方法は、Grafana の UI にあるプラグイン設定ページで行うことですが、データソースは[YAML ファイルでプロビジョニングする](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources)こともできます。

このページでは、ClickHouse プラグインで設定可能なオプションの一覧と、YAML ファイルでデータソースをプロビジョニングする場合の設定スニペットを示します。

すべてのオプションを手早く把握したい場合は、設定オプションの完全な一覧を[こちら](#all-yaml-options)で確認できます。

## 共通設定 {#common-settings}

設定画面の例:

<Image size="sm" img={config_common} alt="セキュアなネイティブ設定の例" border />

共通設定向けの設定 YAML の例:

```yaml
jsonData:
  host: 127.0.0.1 # (必須) サーバーアドレス。
  port: 9000      # (必須) サーバーポート。nativeの場合、セキュアはデフォルトで9440、非セキュアは9000。HTTPの場合、セキュアはデフォルトで8443、非セキュアは8123。

  protocol: native # (必須) 接続に使用するプロトコル。"native"または"http"を設定可能。
  secure: false    # 接続がセキュアな場合はtrueに設定。

  username: default # 認証に使用するユーザー名。

  tlsSkipVerify:     <boolean> # trueに設定するとTLS検証をスキップ。
  tlsAuth:           <boolean> # TLSクライアント認証を有効にする場合はtrueに設定。
  tlsAuthWithCACert: <boolean> # CA証明書が提供されている場合はtrueに設定。自己署名TLS証明書の検証に必要。

secureJsonData:
  password: secureExamplePassword # 認証に使用するパスワード。

  tlsCACert:     <string> # TLS CA証明書
  tlsClientCert: <string> # TLSクライアント証明書
  tlsClientKey:  <string> # TLSクライアントキー
```

UI から構成を保存すると、`version` プロパティが追加されることに注意してください。これは、その構成を保存したプラグインのバージョンを示します。


### HTTP プロトコル {#http-protocol}

HTTP プロトコル経由で接続する場合、追加の設定項目が表示されます。

<Image size="md" img={config_http} alt="追加の HTTP 設定オプション" border />

#### HTTP パス {#http-path}

HTTP サーバーが別の URL パスで公開されている場合は、ここに追加できます。

```yaml
jsonData:
  # 先頭のスラッシュを除く
  path: additional/path/example
```


#### カスタム HTTP ヘッダー {#custom-http-headers}

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
    value: プレーンテキスト値
    secure: false
  - name: X-Example-Secure-Header
    # "value" は除外されます
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: セキュアヘッダー値
```


## 追加設定 {#additional-settings}

これらの追加設定は必須ではありません。

<Image size="sm" img={config_additional} alt="追加設定の例" border />

YAML の例:

```yaml
jsonData:
  defaultDatabase: default # クエリビルダーで読み込まれるデフォルトデータベース。デフォルト値は "default"。
  defaultTable: <string>   # クエリビルダーで読み込まれるデフォルトテーブル。

  dialTimeout: 10    # サーバー接続時のダイヤルタイムアウト(秒)。デフォルト値は "10"。
  queryTimeout: 60   # クエリ実行時のタイムアウト(秒)。デフォルト値は60。ユーザー権限が必要です。権限エラーが発生する場合は "0" に設定して無効化してください。
  validateSql: false # trueに設定すると、SQLエディタでSQLを検証します。
```


### OpenTelemetry {#opentelemetry}

OpenTelemetry (OTel) は、このプラグインに深く統合されています。
OpenTelemetry データは、[exporter plugin](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) を使用して ClickHouse にエクスポートできます。
最適に活用するために、[logs](#logs) と [traces](#traces) の両方に対して OTel を構成することを推奨します。

また、強力なオブザーバビリティワークフローを実現する機能である [data links](./query-builder.md#data-links) を有効にするには、これらのデフォルトを構成することも必要です。

### Logs {#logs}

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
    defaultDatabase: default # デフォルトのログデータベース
    defaultTable: otel_logs  # デフォルトのログテーブル。OTelを使用している場合は"otel_logs"に設定してください。

    otelEnabled: false  # OTelを有効にする場合はtrueに設定します。
    otelVersion: latest # 使用するOTel collectorスキーマバージョン。バージョンはUIに表示されますが、"latest"を指定するとプラグインで利用可能な最新バージョンが使用されます。

    # 新しいログクエリを開く際に選択されるデフォルトのカラム。OTelが有効な場合は無視されます。
    timeColumn:       <string> # ログのプライマリ時刻カラム
    levelColumn:   <string> # ログのレベル/重大度。通常、"INFO"、"error"、"Debug"のような値になります。
    messageColumn: <string> # ログのメッセージ/内容
```


### トレース {#traces}

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
    defaultDatabase: default  # デフォルトのトレースデータベース
    defaultTable: otel_traces # デフォルトのトレーステーブル。OTelを使用している場合は"otel_traces"に設定してください。

    otelEnabled: false  # OTelが有効な場合はtrueに設定してください。
    otelVersion: latest # 使用するOTel collectorスキーマバージョン。バージョンはUIに表示されますが、"latest"を指定するとプラグインで利用可能な最新バージョンが使用されます。

    # 新しいトレースクエリを開く際に選択されるデフォルトのカラム。OTelが有効な場合は無視されます。
    traceIdColumn:       <string>    # トレースIDカラム
    spanIdColumn:        <string>    # スパンIDカラム
    operationNameColumn: <string>    # オペレーション名カラム
    parentSpanIdColumn:  <string>    # 親スパンIDカラム
    serviceNameColumn:   <string>    # サービス名カラム
    durationTimeColumn:  <string>    # 期間カラム
    durationUnitColumn:  <time unit> # 期間の単位。"seconds"、"milliseconds"、"microseconds"、または"nanoseconds"に設定できます。OTelのデフォルトは"nanoseconds"です。
    startTimeColumn:     <string>    # 開始時刻カラム。トレーススパンの主要な時刻カラムです。
    tagsColumn:          <string>    # タグカラム。マップ型であることが想定されます。
    serviceTagsColumn:   <string>    # サービスタグカラム。マップ型であることが想定されます。
```


### カラムエイリアス {#column-aliases}

カラムエイリアスは、データを別名や別の型として扱ってクエリするための便利な方法です。
エイリアスを使用すると、ネストされたスキーマをフラットな形に変換し、Grafana で簡単に選択できるようにできます。

次のような場合にエイリアスが特に有用です:

- スキーマと、その大半のネストされたプロパティ／型を把握している
- データを Map 型で保存している
- JSON を文字列として保存している
- 選択するカラムに対して変換用の関数を適用することが多い

#### テーブルで定義された ALIAS 列 {#table-defined-alias-columns}

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


#### カラムエイリアステーブル {#column-alias-tables}

デフォルトでは、Grafana は `DESC table` のレスポンスに基づいてカラム候補を提示します。
場合によっては、Grafana から見えるカラムをまるごと別のものに置き換えたいことがあります。
これにより、カラム選択時に Grafana 上でスキーマを見えにくくでき、テーブルの複雑さによってはユーザーエクスペリエンスを向上させられます。

テーブル側で定義するエイリアスと比較した場合の利点は、テーブル自体を変更することなく簡単に更新できる点です。
スキーマによってはエントリが数千件に及ぶことがあり、基盤となるテーブル定義が煩雑になる可能性があります。
また、ユーザーに意識させたくないカラムを非表示にすることもできます。

Grafana では、エイリアステーブルは次のカラム構造を持つ必要があります。

```sql
CREATE TABLE aliases (
  `alias` String,  -- Grafanaのカラムセレクターに表示されるエイリアス名
  `select` String, -- SQLジェネレーターで使用するSELECT構文
  `type` String    -- 結果カラムの型。プラグインがデータ型に応じてUIオプションを調整するために使用
)
```

`ALIAS` 列の動作は、エイリアステーブルを使って次のように再現できます。

```sql
CREATE TABLE example_table (
  TimestampNanos DateTime(9)
);

CREATE TABLE example_table_aliases (`alias` String, `select` String, `type` String);

INSERT INTO example_table_aliases (`alias`, `select`, `type`) VALUES
('TimestampNanos', 'TimestampNanos', 'DateTime(9)'), -- テーブルの元の列を保持（任意）
('TimestampDate', 'toDate(TimestampNanos)', 'Date'); -- TimestampNanosをDate型に変換する新しい列を追加
```

次に、このテーブルを Grafana で使用するように設定できます。名前は任意で、別のデータベースで定義することも可能です：

<Image size="md" img={alias_table_config_example} alt="エイリアステーブル設定の例" border />

これで Grafana は、`DESC example_table` の結果ではなく、エイリアステーブルの結果を参照するようになります：

<Image size="md" img={alias_table_select_example} alt="エイリアステーブルの SELECT 例" border />

これら 2 種類のエイリアスは、複雑な型変換や JSON フィールドの抽出を行うために利用できます。


## すべての YAML オプション {#all-yaml-options}

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
