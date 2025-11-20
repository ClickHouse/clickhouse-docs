---
slug: /use-cases/observability/clickstack/config
title: '設定オプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack - ClickHouse Observability Stack の設定オプション'
keywords: ['ClickStack configuration', 'observability configuration', 'HyperDX settings', 'collector configuration', 'environment variables']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';

ClickStack の各コンポーネントには、次の構成オプションが用意されています。


## 設定の変更 {#modifying-settings}

### Docker {#docker}

[All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)、または[Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only)を使用している場合は、環境変数を介して目的の設定を渡すだけです。例:

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Docker Compose {#docker-compose}

[Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)デプロイメントガイドを使用している場合は、[`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env)ファイルを使用して設定を変更できます。

または、[`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml)ファイル内で設定を明示的に上書きすることもできます。例:

例:

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... other settings
```

### Helm {#helm}

#### 値のカスタマイズ(オプション) {#customizing-values}

`--set`フラグを使用して設定をカスタマイズできます。例:

```shell
helm install my-hyperdx hyperdx/hdx-oss-v2 \
  --set replicaCount=2 \
  --set resources.limits.cpu=500m \
  --set resources.limits.memory=512Mi \
  --set resources.requests.cpu=250m \
  --set resources.requests.memory=256Mi \
  --set ingress.enabled=true \
  --set ingress.annotations."kubernetes\.io/ingress\.class"=nginx \
  --set ingress.hosts[0].host=hyperdx.example.com \
  --set ingress.hosts[0].paths[0].path=/ \
  --set ingress.hosts[0].paths[0].pathType=ImplementationSpecific \
  --set env[0].name=CLICKHOUSE_USER \
  --set env[0].value=abc
```

または、`values.yaml`を編集します。デフォルト値を取得するには:

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

設定例:

```yaml
replicaCount: 2
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
  hosts:
    - host: hyperdx.example.com
      paths:
        - path: /
          pathType: ImplementationSpecific
  env:
    - name: CLICKHOUSE_USER
      value: abc
```


## HyperDX {#hyperdx}

### データソース設定 {#datasource-settings}

HyperDXでは、オブザーバビリティデータの各タイプ/柱に対してソースを定義する必要があります:

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

この設定は、アプリケーション内の`Team Settings -> Sources`から実行できます。以下はログの設定例です:

<Image img={hyperdx_25} alt='HyperDX Source configuration' size='lg' />

各ソースには、作成時に少なくとも1つのテーブルと、HyperDXがデータをクエリするために必要な一連のカラムを指定する必要があります。

ClickStackに付属する[デフォルトのOpenTelemetry（OTel）スキーマ](/observability/integrating-opentelemetry#out-of-the-box-schema)を使用する場合、これらのカラムは各ソースに対して自動的に推論されます。[スキーマを変更](#clickhouse)する場合やカスタムスキーマを使用する場合は、これらのマッピングを指定および更新する必要があります。

:::note
ClickStackに付属するClickHouseのデフォルトスキーマは、[OTelコレクター用のClickHouseエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)によって作成されたスキーマです。これらのカラム名は、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)に記載されているOTel公式仕様に対応しています。
:::

各ソースで利用可能な設定は以下の通りです:

#### Logs {#logs}

| 設定                          | 説明                                                                                       | 必須 | デフォルトスキーマで推論 | 推論値                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | -------------------------- | -------------------------------------------------- |
| `Name`                           | ソース名。                                                                                      | Yes      | No                         | –                                                  |
| `Server Connection`              | サーバー接続名。                                                                           | Yes      | No                         | `Default`                                          |
| `Database`                       | ClickHouseデータベース名。                                                                         | Yes      | Yes                        | `default`                                          |
| `Table`                          | ターゲットテーブル名。デフォルトスキーマを使用する場合は`otel_logs`に設定します。                                  | Yes      | No                         |                                                    |
| `Timestamp Column`               | プライマリキーの一部である日時カラムまたは式。                                   | Yes      | Yes                        | `TimestampTime`                                    |
| `Default Select`                 | デフォルトの検索結果に表示されるカラム。                                                          | Yes      | Yes                        | `Timestamp`, `ServiceName`, `SeverityText`, `Body` |
| `Service Name Expression`        | サービス名の式またはカラム。                                                        | Yes      | Yes                        | `ServiceName`                                      |
| `Log Level Expression`           | ログレベルの式またはカラム。                                                           | Yes      | Yes                        | `SeverityText`                                     |
| `Body Expression`                | ログメッセージの式またはカラム。                                                         | Yes      | Yes                        | `Body`                                             |
| `Log Attributes Expression`      | カスタムログ属性の式またはカラム。                                                   | Yes      | Yes                        | `LogAttributes`                                    |
| `Resource Attributes Expression` | リソースレベル属性の式またはカラム。                                               | Yes      | Yes                        | `ResourceAttributes`                               |
| `Displayed Timestamp Column`     | UI表示に使用されるタイムスタンプカラム。                                                              | Yes      | Yes                        | `ResourceAttributes`                               |
| `Correlated Metric Source`       | 関連付けられたメトリクスソース（例: HyperDXメトリクス）。                                                      | No       | No                         | –                                                  |
| `Correlated Trace Source`        | 関連付けられたトレースソース（例: HyperDXトレース）。                                                        | No       | No                         | –                                                  |
| `Trace Id Expression`            | トレースIDを抽出するために使用される式またはカラム。                                                    | Yes      | Yes                        | `TraceId`                                          |
| `Span Id Expression`             | スパンIDを抽出するために使用される式またはカラム。                                                     | Yes      | Yes                        | `SpanId`                                           |
| `Implicit Column Expression`     | フィールドが指定されていない場合に全文検索に使用されるカラム（Lucene形式）。通常はログ本文。 | Yes      | Yes                        | `Body`                                             |

#### Traces {#traces}


| 設定                          | 説明                                                                                                                                        | 必須 | デフォルトスキーマでの推論 | 推論値                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Name`                           | ソース名。                                                                                                                                       | Yes      | No                         | –                                                                                                     |
| `Server Connection`              | サーバー接続名。                                                                                                                            | Yes      | No                         | `Default`                                                                                             |
| `Database`                       | ClickHouseデータベース名。                                                                                                                          | Yes      | Yes                        | `default`                                                                                             |
| `Table`                          | 対象テーブル名。デフォルトスキーマを使用する場合は`otel_traces`に設定します。                                                                               | Yes      | Yes                        | -                                                                                                     |
| `Timestamp Column`               | プライマリキーの一部である日時カラムまたは式。                                                                                                    | Yes      | Yes                        | `Timestamp`                                                                                           |
| `Timestamp`                      | `Timestamp Column`のエイリアス。                                                                                                                      | Yes      | Yes                        | `Timestamp`                                                                                           |
| `Default Select`                 | デフォルトの検索結果に表示されるカラム。                                                                                                           | Yes      | Yes                        | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`            | スパン期間を計算するための式。                                                                                                          | Yes      | Yes                        | `Duration`                                                                                            |
| `Duration Precision`             | 期間式の精度（例：ナノ秒、マイクロ秒）。                                                                            | Yes      | Yes                        | ns                                                                                                    |
| `Trace Id Expression`            | トレースIDの式またはカラム。                                                                                                                | Yes      | Yes                        | `TraceId`                                                                                             |
| `Span Id Expression`             | スパンIDの式またはカラム。                                                                                                                 | Yes      | Yes                        | `SpanId`                                                                                              |
| `Parent Span Id Expression`      | 親スパンIDの式またはカラム。                                                                                                          | Yes      | Yes                        | `ParentSpanId`                                                                                        |
| `Span Name Expression`           | スパン名の式またはカラム。                                                                                                               | Yes      | Yes                        | `SpanName`                                                                                            |
| `Span Kind Expression`           | スパン種別の式またはカラム（例：client、server）。                                                                                          | Yes      | Yes                        | `SpanKind`                                                                                            |
| `Correlated Log Source`          | オプション。リンクされたログソース（例：HyperDXログ）。                                                                                                   | No       | No                         | –                                                                                                     |
| `Correlated Session Source`      | オプション。リンクされたセッションソース。                                                                                                                   | No       | No                         | –                                                                                                     |
| `Correlated Metric Source`       | オプション。リンクされたメトリクスソース（例：HyperDXメトリクス）。                                                                                             | No       | No                         | –                                                                                                     |
| `Status Code Expression`         | スパンステータスコードの式。                                                                                                               | Yes      | Yes                        | `StatusCode`                                                                                          |
| `Status Message Expression`      | スパンステータスメッセージの式。                                                                                                            | Yes      | Yes                        | `StatusMessage`                                                                                       |
| `Service Name Expression`        | サービス名の式またはカラム。                                                                                                         | Yes      | Yes                        | `ServiceName`                                                                                         |
| `Resource Attributes Expression` | リソースレベル属性の式またはカラム。                                                                                                | Yes      | Yes                        | `ResourceAttributes`                                                                                  |
| `Event Attributes Expression`    | イベント属性の式またはカラム。                                                                                                         | Yes      | Yes                        | `SpanAttributes`                                                                                      |
| `Span Events Expression`         | スパンイベントを抽出するための式。通常は`Nested`型のカラム。サポートされている言語SDKで例外スタックトレースをレンダリングできます。 | Yes      | Yes                        | `Events`                                                                                              |
| `Implicit Column Expression`     | フィールドが指定されていない場合に全文検索で使用されるカラム（Lucene形式）。通常はログ本文。                                                  | Yes      | Yes                        | `SpanName`                                                                                            |

#### メトリクス {#metrics}


| 設定                 | 説明                                      | 必須 | デフォルトスキーマで推論 | 推論値           |
| ----------------------- | ------------------------------------------------ | -------- | -------------------------- | ------------------------ |
| `Name`                  | ソース名。                                     | Yes      | No                         | –                        |
| `Server Connection`     | サーバー接続名。                          | Yes      | No                         | `Default`                |
| `Database`              | ClickHouseデータベース名。                        | Yes      | Yes                        | `default`                |
| `Gauge Table`           | ゲージ型メトリクスを格納するテーブル。                | Yes      | No                         | `otel_metrics_gauge`     |
| `Histogram Table`       | ヒストグラム型メトリクスを格納するテーブル。            | Yes      | No                         | `otel_metrics_histogram` |
| `Sum Table`             | 合計型（カウンター）メトリクスを格納するテーブル。        | Yes      | No                         | `otel_metrics_sum`       |
| `Correlated Log Source` | オプション。リンクされたログソース（例：HyperDXログ）。 | No       | No                         | –                        |

#### セッション {#settings}

| 設定                          | 説明                                                                                              | 必須 | デフォルトスキーマで推論 | 推論値       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | -------------------------- | -------------------- |
| `Name`                           | ソース名。                                                                                             | Yes      | No                         | –                    |
| `Server Connection`              | サーバー接続名。                                                                                  | Yes      | No                         | `Default`            |
| `Database`                       | ClickHouseデータベース名。                                                                                | Yes      | Yes                        | `default`            |
| `Table`                          | セッションデータのターゲットテーブル。デフォルトスキーマを使用する場合は`hyperdx_sessions`に設定します。 | Yes      | Yes                        | -                    |
| `Timestamp Column`               | プライマリキーの一部である日時カラムまたは式。                                          | Yes      | Yes                        | `TimestampTime`      |
| `Log Attributes Expression`      | セッションデータからログレベル属性を抽出するための式。                                        | Yes      | Yes                        | `LogAttributes`      |
| `LogAttributes`                  | ログ属性を格納するために使用されるエイリアスまたはフィールド参照。                                                   | Yes      | Yes                        | `LogAttributes`      |
| `Resource Attributes Expression` | リソースレベルのメタデータを抽出するための式。                                                       | Yes      | Yes                        | `ResourceAttributes` |
| `Correlated Trace Source`        | オプション。セッション相関のためのリンクされたトレースソース。                                                   | No       | No                         | –                    |
| `Implicit Column Expression`     | フィールドが指定されていない場合に全文検索に使用されるカラム（例：Lucene形式のクエリ解析）。           | Yes      | Yes                        | `Body`               |

### 相関ソース {#correlated-sources}

ClickStackで完全なクロスソース相関を有効にするには、ログ、トレース、メトリクス、セッションの相関ソースを設定する必要があります。これにより、HyperDXは関連データを関連付け、イベントをレンダリングする際に豊富なコンテキストを提供できます。

- `Logs`: トレースおよびメトリクスと相関できます。
- `Traces`: ログ、セッション、メトリクスと相関できます。
- `Metrics`: ログと相関できます。
- `Sessions`: トレースと相関できます。

これらの相関を設定することで、HyperDXは例えば、トレースと共に関連ログをレンダリングしたり、セッションにリンクされたメトリクス異常を表示したりできます。適切な設定により、統一された文脈的なオブザーバビリティ体験が保証されます。

例えば、以下は相関ソースで設定されたLogsソースです：

<Image img={hyperdx_26} alt='HyperDX Source correlated' size='md' />

### アプリケーション設定 {#application-configuration-settings}

:::note ClickHouse CloudのHyperDX
HyperDXがClickHouse Cloudで管理されている場合、これらの設定は変更できません。
:::

- `HYPERDX_API_KEY`
  - **デフォルト:** なし（必須）
  - **説明:** HyperDX APIの認証キー。
  - **ガイダンス:**
  - テレメトリとロギングに必須
  - ローカル開発では、空でない任意の値を使用可能
  - 本番環境では、安全で一意なキーを使用
  - アカウント作成後、チーム設定ページから取得可能

- `HYPERDX_LOG_LEVEL`
  - **デフォルト:** `info`
  - **説明:** ロギングの詳細レベルを設定します。
  - **オプション:** `debug`, `info`, `warn`, `error`
  - **ガイダンス:**
  - 詳細なトラブルシューティングには`debug`を使用
  - 通常の運用には`info`を使用
  - 本番環境ではログ量を削減するために`warn`または`error`を使用


- `HYPERDX_API_PORT`
  - **Default:** `8000`
  - **Description:** HyperDX API サーバーのポート。
  - **Guidance:**
  - このポートがホスト上で使用可能であることを確認する
  - ポート競合がある場合は変更する
  - API クライアント設定で指定したポートと一致している必要がある

- `HYPERDX_APP_PORT`
  - **Default:** `8000`
  - **Description:** HyperDX フロントエンドアプリのポート。
  - **Guidance:**
  - このポートがホスト上で使用可能であることを確認する
  - ポート競合がある場合は変更する
  - ブラウザからアクセス可能である必要がある

- `HYPERDX_APP_URL`
  - **Default:** `http://localhost`
  - **Description:** フロントエンドアプリのベース URL。
  - **Guidance:**
  - 本番環境では自分のドメインを設定する
  - プロトコル (http/https) を含める
  - 末尾のスラッシュは含めない

- `MONGO_URI`
  - **Default:** `mongodb://db:27017/hyperdx`
  - **Description:** MongoDB 接続文字列。
  - **Guidance:**
  - Docker を用いたローカル開発ではデフォルトを使用する
  - 本番環境では安全な接続文字列を使用する
  - 必要に応じて認証情報を含める
  - 例: `mongodb://user:pass@host:port/db`

- `MINER_API_URL`
  - **Default:** `http://miner:5123`
  - **Description:** ログパターンマイニングサービスの URL。
  - **Guidance:**
  - Docker を用いたローカル開発ではデフォルトを使用する
  - 本番環境では自分の miner サービスの URL を設定する
  - API サービスからアクセス可能である必要がある

- `FRONTEND_URL`
  - **Default:** `http://localhost:3000`
  - **Description:** フロントエンドアプリの URL。
  - **Guidance:**
  - ローカル開発ではデフォルトを使用する
  - 本番環境では自分のドメインを設定する
  - API サービスからアクセス可能である必要がある

- `OTEL_SERVICE_NAME`
  - **Default:** `hdx-oss-api`
  - **Description:** OpenTelemetry 計装用のサービス名。
  - **Guidance:**
  - HyperDX サービスを表すわかりやすい名前を使用する。HyperDX 自身を計装する場合に適用される
  - テレメトリーデータ内で HyperDX サービスを識別するのに役立つ

- `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  - **Default:** `http://localhost:4318`
  - **Description:** OpenTelemetry Collector のエンドポイント。
  - **Guidance:**
  - HyperDX 自身を計装する場合に関連する
  - ローカル開発ではデフォルトを使用する
  - 本番環境では自分の Collector の URL を設定する
  - HyperDX サービスからアクセス可能である必要がある

- `USAGE_STATS_ENABLED`
  - **Default:** `true`
  - **Description:** 利用状況統計の収集を切り替えるフラグ。
  - **Guidance:**
  - 利用状況トラッキングを無効にする場合は `false` に設定する
  - プライバシー要件の高いデプロイメントに有用
  - 製品改善のため、デフォルトは `true`

- `IS_OSS`
  - **Default:** `true`
  - **Description:** OSS モードで実行しているかどうかを示すフラグ。
  - **Guidance:**
  - オープンソースとしてデプロイする場合は `true` のままにする
  - エンタープライズデプロイの場合は `false` に設定する
  - 利用可能な機能に影響する

- `IS_LOCAL_MODE`
  - **Default:** `false`
  - **Description:** ローカルモードで実行しているかどうかを示すフラグ。
  - **Guidance:**
  - ローカル開発では `true` に設定する
  - 一部の本番向け機能を無効化する
  - テストおよび開発に有用

- `EXPRESS_SESSION_SECRET`
  - **Default:** `hyperdx is cool 👋`
  - **Description:** Express セッション管理用のシークレット。
  - **Guidance:**
  - 本番環境では変更する
  - 強力でランダムな文字列を使用する
  - 秘密として安全に保管する

- `ENABLE_SWAGGER`
  - **Default:** `false`
  - **Description:** Swagger API ドキュメントを有効／無効にするフラグ。
  - **Guidance:**
  - API ドキュメントを有効にするには `true` に設定する
  - 開発およびテストに有用
  - 本番環境では無効にする

- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  - **Default:** `false`
  - **Description:** HyperDX における JSON 型のベータサポートを有効にする。OTel Collector で JSON サポートを有効にするには [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) も参照。
  - **Guidance:**
  - ClickStack で JSON サポートを有効にするには `true` に設定する



## OpenTelemetry collector {#otel-collector}

詳細については、["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)を参照してください。

- `CLICKHOUSE_ENDPOINT`
  - **デフォルト:** スタンドアロンイメージの場合は_なし(必須)_。All-in-oneまたはDocker Compose配布の場合は、統合されたClickHouseインスタンスに設定されます。
  - **説明:** テレメトリデータをエクスポートするClickHouseインスタンスのHTTPS URL。
  - **ガイダンス:**
    - ポートを含む完全なHTTPSエンドポイントである必要があります(例: `https://clickhouse.example.com:8443`)
    - コレクターがClickHouseにデータを送信するために必須です

- `CLICKHOUSE_USER`
  - **デフォルト:** `default`
  - **説明:** ClickHouseインスタンスへの認証に使用されるユーザー名。
  - **ガイダンス:**
    - ユーザーが`INSERT`および`CREATE TABLE`権限を持っていることを確認してください
    - データ取り込み専用のユーザーを作成することを推奨します

- `CLICKHOUSE_PASSWORD`
  - **デフォルト:** _なし(認証が有効な場合は必須)_
  - **説明:** 指定されたClickHouseユーザーのパスワード。
  - **ガイダンス:**
    - ユーザーアカウントにパスワードが設定されている場合は必須です
    - 本番環境ではシークレット経由で安全に保管してください

- `HYPERDX_LOG_LEVEL`
  - **デフォルト:** `info`
  - **説明:** コレクターのログ詳細レベル。
  - **ガイダンス:**
    - `debug`、`info`、`warn`、`error`などの値を受け付けます
    - トラブルシューティング時には`debug`を使用してください

- `OPAMP_SERVER_URL`
  - **デフォルト:** スタンドアロンイメージの場合は_なし(必須)_。All-in-oneまたはDocker Compose配布の場合は、デプロイされたHyperDXインスタンスを指します。
  - **説明:** コレクターを管理するために使用されるOpAMPサーバーのURL(例: HyperDXインスタンス)。デフォルトではポート`4320`です。
  - **ガイダンス:**
    - HyperDXインスタンスを指す必要があります
    - 動的な設定と安全なデータ取り込みを可能にします

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **デフォルト:** `default`
  - **説明:** コレクターがテレメトリデータを書き込むClickHouseデータベース。
  - **ガイダンス:**
    - カスタムデータベース名を使用する場合に設定してください
    - 指定されたユーザーがこのデータベースへのアクセス権を持っていることを確認してください

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **デフォルト:** `<空文字列>`
  - **説明:** コレクターで有効にする機能フラグを設定します。`--feature-gates=clickhouse.json`に設定すると、コレクターでJSON型のベータサポートが有効になり、スキーマがこの型で作成されることを保証します。HyperDXでJSONサポートを有効にするには、[`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx)も参照してください。
  - **ガイダンス:**
  - ClickStackでJSONサポートを有効にするには`true`に設定してください。


## ClickHouse {#clickhouse}

ClickStackには、マルチテラバイト規模向けに設計されたデフォルトのClickHouse設定が付属していますが、ユーザーは自身のワークロードに合わせて自由に変更および最適化できます。

ClickHouseを効果的にチューニングするには、[パート](/parts)、[パーティション](/partitions)、[シャードとレプリカ](/shards)などの主要なストレージ概念、および挿入時に[マージ](/merges)がどのように発生するかを理解する必要があります。[プライマリインデックス](/primary-indexes)、[スパースセカンダリインデックス](/optimize/skipping-indexes)、データスキッピングインデックスの基礎、およびTTLライフサイクルの使用などの[データライフサイクル管理](/observability/managing-data)手法を確認することを推奨します。

ClickStackは[スキーマのカスタマイズ](/use-cases/observability/schema-design)をサポートしています。ユーザーは、カラム型の変更、新しいフィールドの抽出（ログからの抽出など）、コーデックと辞書の適用、プロジェクションを使用したクエリの高速化が可能です。

さらに、マテリアライズドビューを使用して[取り込み時にデータを変換またはフィルタリング](/use-cases/observability/schema-design#materialized-columns)できます。ただし、データはビューのソーステーブルに書き込まれ、アプリケーションはターゲットテーブルから読み取る必要があります。

詳細については、スキーマ設計、インデックス戦略、データ管理のベストプラクティスに関するClickHouseドキュメントを参照してください。これらのほとんどはClickStackデプロイメントに直接適用できます。
