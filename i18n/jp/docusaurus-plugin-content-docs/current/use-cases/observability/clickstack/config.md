---
slug: /use-cases/observability/clickstack/config
title: '設定オプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack（ClickHouse Observability Stack）の設定オプション'
keywords: ['ClickStack 設定', 'オブザーバビリティ設定', 'HyperDX 設定', 'コレクター設定', '環境変数']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';

ClickStack の各コンポーネントでは、以下の構成オプションが利用可能です。


## 設定の変更

### Docker

[All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)、または [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only) を使用している場合は、必要な設定値を環境変数として渡します（例:

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Docker Compose

[Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) デプロイガイドを使用している場合は、[`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) ファイルを使って設定を変更できます。

または、[`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) ファイル内で設定を明示的に上書きすることもできます。例:

例:

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... その他の設定
```

### Helm

#### 値のカスタマイズ（任意）

`--set` フラグを使用して、たとえば次のように設定をカスタマイズできます。

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

または `values.yaml` を編集します。デフォルト値を取得するには、次のコマンドを実行します:

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

HyperDX は、各 Observability データタイプ／ピラーごとにユーザーがソースを定義することを前提としています:

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

この設定は、アプリケーション内の `Team Settings -> Sources` から行えます。以下は Logs の例です:

<Image img={hyperdx_25} alt="HyperDX Source configuration" size="lg"/>

これらの各ソースには、作成時に少なくとも 1 つのテーブルと、HyperDX がデータをクエリするための一連のカラムを指定する必要があります。

ClickStack に同梱されている [デフォルトの OpenTelemetry (OTel) スキーマ](/observability/integrating-opentelemetry#out-of-the-box-schema) を使用している場合、これらのカラムは各ソースに対して自動的に推論されます。[スキーマを変更する](#clickhouse) 場合や独自スキーマを使用する場合は、ユーザーがこれらのマッピングを指定および更新する必要があります。

:::note
ClickStack に同梱されている ClickHouse 用のデフォルトスキーマは、[ClickHouse exporter for the OTel collector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) によって作成されるスキーマです。これらのカラム名は、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/) に記載されている OTel 公式仕様と対応しています。
:::

各ソースでは、次の設定を行えます:

#### Logs {#logs}

| Setting                        | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value                                      |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------------------------------|
| `Name`                        | ソース名。                                                                                                              | Yes      | No                          | –                                                   |
| `Server Connection`           | サーバー接続名。                                                                                                        | Yes      | No                          | `Default`                                             |
| `Database`                    | ClickHouse データベース名。                                                                                             | Yes      | Yes                         | `default`                                             |
| `Table`                       | 対象テーブル名。デフォルトのスキーマを使用する場合は `otel_logs` を指定します。                                         | Yes      | No                          |                                                     |
| `Timestamp Column`            | プライマリキーの一部となる Datetime カラムまたは式。                                                                   | Yes      | Yes                         | `TimestampTime`                                       |
| `Default Select`              | デフォルトの検索結果に表示されるカラム。                                                                                | Yes      | Yes                         | `Timestamp`, `ServiceName`, `SeverityText`, `Body`         |
| `Service Name Expression`     | サービス名を表す式またはカラム。                                                                                        | Yes      | Yes                         | `ServiceName`                                         |
| `Log Level Expression`        | ログレベルを表す式またはカラム。                                                                                        | Yes      | Yes                         | `SeverityText`                                        |
| `Body Expression`             | ログメッセージを表す式またはカラム。                                                                                    | Yes      | Yes                         | `Body`                                                |
| `Log Attributes Expression`   | カスタムログ属性を表す式またはカラム。                                                                                  | Yes      | Yes                         | `LogAttributes`                                       |
| `Resource Attributes Expression` | リソースレベルの属性を表す式またはカラム。                                                                            | Yes      | Yes                         | `ResourceAttributes`                                  |
| `Displayed Timestamp Column`  | UI 表示に使用されるタイムスタンプカラム。                                                                               | Yes      | Yes                         | `ResourceAttributes`                                  |
| `Correlated Metric Source`    | 相関付けられたメトリクスソース (例: HyperDX metrics)。                                                                  | No       | No                          | –                                                   |
| `Correlated Trace Source`     | 相関付けられたトレースソース (例: HyperDX traces)。                                                                     | No       | No                          | –                                                   |
| `Trace Id Expression`         | Trace ID を抽出するために使用される式またはカラム。                                                                     | Yes      | Yes                         | `TraceId`                                             |
| `Span Id Expression`          | Span ID を抽出するために使用される式またはカラム。                                                                      | Yes      | Yes                         | `SpanId`                                              |
| `Implicit Column Expression`  | フィールドが指定されていない場合に全文検索 (Lucene 形式) に使用されるカラム。通常はログ本文。                           | Yes      | Yes                         | `Body`                                                |

#### Traces {#traces}



| Setting                          | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                           | ソース名。                                                                                                              | はい      | いいえ                          | –                      |
| `Server Connection`              | サーバー接続の名前。                                                                                                    | はい      | いいえ                          | `Default`              |
| `Database`                       | ClickHouse のデータベース名。                                                                                           | はい      | はい                         | `default`                |
| `Table`                          | 対象テーブル名。デフォルトスキーマを使用している場合は `otel_traces` を設定します。                                      | はい      | はい                         |      -       |
| `Timestamp Column`              | プライマリキーの一部である日時カラムまたは式。                                                                          | はい      | はい                         | `Timestamp`              |
| `Timestamp`                      | `Timestamp Column` のエイリアス。                                                                                       | はい      | はい                         | `Timestamp`              |
| `Default Select`                | デフォルトの検索結果に表示されるカラム。                                                                                | はい      | はい                         | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`           | Span の継続時間を計算する式。                                                                                           | はい      | はい                         | `Duration`               |
| `Duration Precision`            | Duration 式の精度（例: ナノ秒、マイクロ秒）。                                                                           | はい      | はい                         | ns                     |
| `Trace Id Expression`           | Trace ID 用の式またはカラム。                                                                                           | はい      | はい                         | `TraceId`                |
| `Span Id Expression`            | Span ID 用の式またはカラム。                                                                                            | はい      | はい                         | `SpanId`                 |
| `Parent Span Id Expression`     | Parent Span ID 用の式またはカラム。                                                                                     | はい      | はい                         | `ParentSpanId`           |
| `Span Name Expression`          | Span 名用の式またはカラム。                                                                                             | はい      | はい                         | `SpanName`               |
| `Span Kind Expression`          | Span Kind（例: client, server）を表す式またはカラム。                                                                    | はい      | はい                         | `SpanKind`               |
| `Correlated Log Source`         | オプション。相関付けられたログソース（例: HyperDX logs）。                                                               | いいえ       | いいえ                          | –                      |
| `Correlated Session Source`     | オプション。相関付けられたセッションソース。                                                                            | いいえ       | いいえ                          | –                      |
| `Correlated Metric Source`      | オプション。相関付けられたメトリクスソース（例: HyperDX metrics）。                                                     | いいえ       | いいえ                          | –                      |
| `Status Code Expression`        | Span のステータスコード用の式。                                                                                         | はい      | はい                         | `StatusCode`             |
| `Status Message Expression`     | Span のステータスメッセージ用の式。                                                                                     | はい      | はい                         | `StatusMessage`          |
| `Service Name Expression`       | サービス名用の式またはカラム。                                                                                          | はい      | はい                         | `ServiceName`            |
| `Resource Attributes Expression`| リソースレベルの属性用の式またはカラム。                                                                                | はい      | はい                         | `ResourceAttributes`     |
| `Event Attributes Expression`   | イベント属性用の式またはカラム。                                                                                        | はい      | はい                         | `SpanAttributes`         |
| `Span Events Expression`        | Span イベントを抽出する式。通常は `Nested` 型カラムです。対応言語の SDK では、これにより例外スタックトレースをレンダリングできるようになります。 | はい      | はい                         | `Events`                 |
| `Implicit Column Expression`   | フィールドが指定されていない場合に全文検索（Lucene 形式）に使用されるカラム。通常はログ本文です。  | はい  | はい  | `SpanName`|

#### メトリクス {#metrics}



| Setting               | Description                                                                                   | Required | Inferred in Default Schema | Inferred Value              |
|------------------------|-----------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------|
| `Name`                 | ソース名。                                                                                     | Yes      | No                          | –                           |
| `Server Connection`    | サーバー接続名。                                                                               | Yes      | No                          | `Default`                   |
| `Database`             | ClickHouse データベース名。                                                                    | Yes      | Yes                         | `default`                   |
| `Gauge Table`          | ゲージ型メトリクスを保存するテーブル。                                                         | Yes      | No                         | `otel_metrics_gauge`        |
| `Histogram Table`      | ヒストグラム型メトリクスを保存するテーブル。                                                   | Yes      | No                         | `otel_metrics_histogram`    |
| `Sum Table`            | 合計型（カウンタ）メトリクスを保存するテーブル。                                               | Yes      | No                         | `otel_metrics_sum`          |
| `Correlated Log Source`| オプション。相関付け用にリンクされたログソース（例: HyperDX ログ）。                            | No       | No                          | –                           |

#### Sessions {#settings}

| Setting                        | Description                                                                                         | Required | Inferred in Default Schema | Inferred Value         |
|-------------------------------|-----------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                        | ソース名。                                                                                          | Yes      | No                          | –                      |
| `Server Connection`           | サーバー接続名。                                                                                     | Yes      | No                          | `Default`              |
| `Database`                    | ClickHouse データベース名。                                                                         | Yes      | Yes                         | `default`              |
| `Table`                       | セッションデータの書き込み先テーブル。デフォルトスキーマを使用する場合は `hyperdx_sessions` に設定します。 | Yes      | Yes                         | -      |
| `Timestamp Column`            | プライマリキーの一部である日時カラムまたは式。                                                      | Yes      | Yes                         | `TimestampTime`            |
| `Log Attributes Expression`   | セッションデータからログレベル属性を抽出するための式。                                              | Yes      | Yes                         | `LogAttributes`        |
| `LogAttributes`               | ログ属性を保存するために使用されるエイリアスまたはフィールド参照。                                 | Yes      | Yes                         | `LogAttributes`        |
| `Resource Attributes Expression` | リソースレベルのメタデータを抽出するための式。                                                   | Yes      | Yes                         | `ResourceAttributes`   |
| `Correlated Trace Source`     | オプション。セッションの相関付け用にリンクされたトレースソース。                                   | No       | No                          | –                      |
| `Implicit Column Expression`  | フィールドが指定されていない場合に全文検索に使用されるカラム（例: Lucene スタイルのクエリパース時）。 | Yes      | Yes                         | `Body` |

### Correlated sources {#correlated-sources}

ClickStack でソース間の完全な相関付けを有効にするには、ログ、トレース、メトリクス、セッションの相関ソースを設定する必要があります。これにより、HyperDX は関連データを相関付け、イベントをレンダリングする際に充実したコンテキストを提供できます。

- `Logs`: トレースおよびメトリクスと相関付けることができます。
- `Traces`: ログ、セッション、メトリクスと相関付けることができます。
- `Metrics`: ログと相関付けることができます。
- `Sessions`: トレースと相関付けることができます。

これらの相関付けを設定することで、いくつかの機能が有効になります。例えば、HyperDX はトレースに関連するログを併せて表示したり、セッションにリンクされたメトリクスの異常を検出して表示したりできます。

例えば、以下は相関ソースが設定された Logs ソースの例です:

<Image img={hyperdx_26} alt="HyperDX Source correlated" size="md"/>

### Application configuration settings {#application-configuration-settings}

:::note HyperDX in ClickHouse Cloud
HyperDX が ClickHouse Cloud で管理されている場合、これらの設定は変更できません。
:::

- `HYPERDX_API_KEY`
  - **Default:** なし（必須）
  - **Description:** HyperDX API 用の認証キー。
  - **Guidance:**
  - テレメトリとロギングに必須
  - ローカル開発では任意の非空値を使用可能
  - 本番環境では安全で一意なキーを使用すること
  - アカウント作成後、チーム設定ページから取得可能

- `HYPERDX_LOG_LEVEL`
  - **Default:** `info`
  - **Description:** ログ出力の詳細度レベルを設定します。
  - **Options:** `debug`, `info`, `warn`, `error`
  - **Guidance:**
  - 詳細なトラブルシューティングには `debug` を使用
  - 通常運用には `info` を使用
  - ログ量を減らすため、本番環境では `warn` または `error` を使用

- `HYPERDX_API_PORT`
  - **Default:** `8000`
  - **Description:** HyperDX API サーバーのポート。
  - **Guidance:**
  - このポートがホスト上で利用可能であることを確認する
  - ポート競合がある場合は変更する
  - API クライアントの設定で使用しているポートと一致している必要がある



- `HYPERDX_APP_PORT`
  - **Default:** `8000`
  - **Description:** HyperDX フロントエンドアプリ用のポート。
  - **Guidance:**
  - このポートがホスト上で空いていることを確認する
  - ポート競合がある場合は変更する
  - ブラウザからアクセス可能である必要がある

- `HYPERDX_APP_URL`
  - **Default:** `http://localhost`
  - **Description:** フロントエンドアプリのベース URL。
  - **Guidance:**
  - 本番環境では自分のドメインを設定する
  - プロトコル (http/https) を含める
  - 末尾にスラッシュを付けないこと

- `MONGO_URI`
  - **Default:** `mongodb://db:27017/hyperdx`
  - **Description:** MongoDB 接続文字列。
  - **Guidance:**
  - Docker を使ったローカル開発ではデフォルトを使用する
  - 本番環境では安全な接続文字列を使用する
  - 必要に応じて認証情報を含める
  - 例: `mongodb://user:pass@host:port/db`

- `MINER_API_URL`
  - **Default:** `http://miner:5123`
  - **Description:** ログパターンマイニングサービスの URL。
  - **Guidance:**
  - Docker を使ったローカル開発ではデフォルトを使用する
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
  - HyperDX を自己計測する場合、自分の HyperDX サービスに対してわかりやすい名前を使用する
  - テレメトリデータ内で HyperDX サービスを特定するのに役立つ

- `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  - **Default:** `http://localhost:4318`
  - **Description:** OpenTelemetry collector のエンドポイント。
  - **Guidance:**
  - HyperDX を自己計測する場合に使用する
  - ローカル開発ではデフォルトを使用する
  - 本番環境では自分の collector の URL を設定する
  - 自分の HyperDX サービスからアクセス可能である必要がある

- `USAGE_STATS_ENABLED`
  - **Default:** `true`
  - **Description:** 利用状況統計の収集を有効／無効にする設定。
  - **Guidance:**
  - 利用状況トラッキングを無効にするには `false` を設定する
  - プライバシー要件の厳しいデプロイメントで有用
  - 製品改善のため、デフォルトは `true`

- `IS_OSS`
  - **Default:** `true`
  - **Description:** OSS モードで実行しているかどうかを示す。
  - **Guidance:**
  - オープンソースデプロイメントでは `true` のままにする
  - エンタープライズデプロイメントでは `false` に設定する
  - 機能の利用可否に影響する

- `IS_LOCAL_MODE`
  - **Default:** `false`
  - **Description:** ローカルモードで実行しているかどうかを示す。
  - **Guidance:**
  - ローカル開発には `true` を設定する
  - 一部の本番機能を無効にする
  - テストおよび開発に有用

- `EXPRESS_SESSION_SECRET`
  - **Default:** `hyperdx is cool 👋`
  - **Description:** Express セッション管理用のシークレット。
  - **Guidance:**
  - 本番環境では変更する
  - 強力でランダムな文字列を使用する
  - 秘密として安全に保持する

- `ENABLE_SWAGGER`
  - **Default:** `false`
  - **Description:** Swagger API ドキュメントを有効／無効にする設定。
  - **Guidance:**
  - API ドキュメントを有効にするには `true` を設定する
  - 開発およびテストに有用
  - 本番環境では無効にする

- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  - **Default:** `false`
  - **Description:** HyperDX における JSON 型のベータサポートを有効にする。OTel collector で JSON サポートを有効にするには [`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) も参照。
  - **Guidance:**
  - ClickStack で JSON サポートを有効にするには `true` を設定する。



## OpenTelemetry collector {#otel-collector}

詳細は["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)を参照してください。

- `CLICKHOUSE_ENDPOINT`
  - **Default:** スタンドアロンイメージの場合は *なし（必須）*。All-in-one または Docker Compose ディストリビューションでは、組み込みの ClickHouse インスタンスが設定されます。
  - **Description:** テレメトリ データをエクスポートする ClickHouse インスタンスの HTTPS URL。
  - **Guidance:**
    - ポートを含む完全な HTTPS エンドポイントである必要があります（例: `https://clickhouse.example.com:8443`）
    - コレクターが ClickHouse にデータを送信するために必須です

- `CLICKHOUSE_USER`
  - **Default:** `default`
  - **Description:** ClickHouse インスタンスへの認証に使用されるユーザー名。
  - **Guidance:**
    - ユーザーに `INSERT` および `CREATE TABLE` 権限が付与されていることを確認してください
    - インジェスト専用のユーザーを作成することを推奨します

- `CLICKHOUSE_PASSWORD`
  - **Default:** *なし（認証が有効な場合は必須）*
  - **Description:** 指定した ClickHouse ユーザーのパスワード。
  - **Guidance:**
    - ユーザーアカウントにパスワードが設定されている場合に必須です
    - 本番デプロイメントでは Secret などを使って安全に保存してください

- `HYPERDX_LOG_LEVEL`
  - **Default:** `info`
  - **Description:** コレクターのログ出力の詳細度（ログレベル）。
  - **Guidance:**
    - `debug`, `info`, `warn`, `error` などの値を受け付けます
    - トラブルシューティング時は `debug` を使用してください

- `OPAMP_SERVER_URL`
  - **Default:** スタンドアロンイメージの場合は *なし（必須）*。All-in-one または Docker Compose ディストリビューションでは、デプロイ済みの HyperDX インスタンスを指します。
  - **Description:** コレクターの管理に使用する OpAMP サーバー（例: HyperDX インスタンス）の URL。デフォルトではポート `4320` を使用します。
  - **Guidance:**
    - 自身の HyperDX インスタンスを指している必要があります
    - 動的な設定と安全なインジェストを可能にします

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **Default:** `default`
  - **Description:** コレクターがテレメトリ データを書き込む ClickHouse データベース。
  - **Guidance:**
    - カスタムデータベース名を使用する場合に設定します
    - 指定したユーザーがこのデータベースへアクセスできることを確認してください

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **Default:** `<empty string>`
  - **Description:** コレクターで有効化するフィーチャーフラグを指定します。`--feature-gates=clickhouse.json` を設定すると、コレクターで JSON 型のベータサポートが有効になり、スキーマがその型で作成されるようになります。HyperDX で JSON サポートを有効にするには [`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) も参照してください。
  - **Guidance:**
    - ClickStack で JSON サポートを有効にするには `true` を設定します。



## ClickHouse {#clickhouse}

ClickStack には、マルチテラバイト規模を想定したデフォルトの ClickHouse 設定が含まれていますが、ユーザーは自分のワークロードに合わせて自由に変更して最適化できます。

ClickHouse を効果的にチューニングするには、[parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards) といった主要なストレージの概念や、インサート時に [merges](/merges) がどのように発生するかを理解しておく必要があります。[primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes)、およびデータスキッピングインデックスの基礎と、TTL によるライフサイクル管理など [managing data lifecycle](/observability/managing-data) のテクニックを確認することを推奨します。

ClickStack は [schema customization](/use-cases/observability/schema-design) をサポートしており、ユーザーはカラム型の変更、（例: ログからの）新規フィールド抽出、コーデックやディクショナリの適用、さらにプロジェクションを用いたクエリの高速化を行うことができます。

さらに、マテリアライズドビューを利用して、ビューのソーステーブルにデータを書き込み、アプリケーションがターゲットテーブルから読み取ることを前提に、[インジェスト中にデータを変換またはフィルタリングする](/use-cases/observability/schema-design#materialized-columns) ことができます。

詳細については、スキーマ設計、インデックス戦略、およびデータ管理のベストプラクティスに関する ClickHouse ドキュメントを参照してください。これらの多くは、そのまま ClickStack のデプロイメントに適用できます。
