---
slug: /use-cases/observability/clickstack/config
title: '設定オプション'
pagination_prev: null
pagination_next: null
description: 'ClickStack（ClickHouse Observability Stack）の設定オプション'
keywords: ['ClickStack の設定', 'オブザーバビリティ設定', 'HyperDX の設定', 'コレクター設定', '環境変数']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';

ClickStack の各コンポーネントには、以下の設定オプションがあります。

## 設定の変更 {#modifying-settings}

### Docker {#docker}

[All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)、または [Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only) を使用している場合は、環境変数で必要な設定値を指定するだけで構いません。例：

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 clickhouse/clickstack-all-in-one:latest
```


### Docker Compose {#docker-compose}

[Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) のデプロイメントガイドを使用している場合は、[`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) ファイルで設定を変更できます。

または、[`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) ファイル内で設定を明示的に上書きすることもできます。

例:

```yaml
services:
  app:
    environment:
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
      # ... その他の設定
```

### Helm {#helm}

#### 値のカスタマイズ（任意） {#customizing-values}

たとえば、`--set` フラグを使用して次のように設定をカスタマイズできます。

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

または `values.yaml` を編集します。デフォルト値を取得するには、次のコマンドを実行します：

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

設定例：

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

HyperDX は、各 Observability データタイプ/ピラーごとにソースをユーザーが定義することを前提としています:

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

この設定は、アプリケーション内の `Team Settings -> Sources` から行えます。以下は Logs の例です:

<Image img={hyperdx_25} alt="HyperDX Source configuration" size="lg"/>

各ソースでは、作成時に少なくとも 1 つのテーブルと、HyperDX がデータをクエリできるようにするための列セットを指定する必要があります。

ClickStack とともに配布されている [デフォルトの OpenTelemetry (OTel) スキーマ](/observability/integrating-opentelemetry#out-of-the-box-schema) を使用している場合、これらの列は各ソースごとに自動的に推論されます。[スキーマを変更する](#clickhouse) 場合やカスタムスキーマを使用する場合は、ユーザーがこれらのマッピングを指定および更新する必要があります。

:::note
ClickStack とともに配布されている ClickHouse のデフォルトスキーマは、[OTel collector 向け ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) によって作成されるスキーマです。これらのカラム名は、[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/) に記載されている OTel 公式仕様と相関付けられています。
:::

各ソースで利用可能な設定は以下のとおりです:

#### ログ {#logs}

| Setting                        | Description                                                                                                             | Required | Inferred in Default Schema       | Inferred Value                                      |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|----------------------------------|-----------------------------------------------------|
| `Name`                        | ソース名。                                                                                                              | はい     | いいえ                           | –                                                   |
| `Server Connection`           | サーバー接続名。                                                                                                        | はい     | いいえ                           | `Default`                                           |
| `Database`                    | ClickHouse データベース名。                                                                                             | はい     | はい                             | `default`                                           |
| `Table`                       | 対象テーブル名。デフォルトスキーマを使用する場合は `otel_logs` を指定します。                                           | はい     | いいえ                           |                                                     |
| `Timestamp Column`            | プライマリキーの一部となる日時カラムまたは式。                                                                          | はい     | はい                             | `TimestampTime`                                     |
| `Default Select`              | 既定の検索結果で表示されるカラム。                                                                                      | はい     | はい                             | `Timestamp`, `ServiceName`, `SeverityText`, `Body` |
| `Service Name Expression`     | サービス名に使用する式またはカラム。                                                                                    | はい     | はい                             | `ServiceName`                                       |
| `Log Level Expression`        | ログレベルに使用する式またはカラム。                                                                                    | はい     | はい                             | `SeverityText`                                      |
| `Body Expression`             | ログメッセージに使用する式またはカラム。                                                                                | はい     | はい                             | `Body`                                              |
| `Log Attributes Expression`   | カスタムログ属性に使用する式またはカラム。                                                                              | はい     | はい                             | `LogAttributes`                                     |
| `Resource Attributes Expression` | リソースレベルの属性に使用する式またはカラム。                                                                       | はい     | はい                             | `ResourceAttributes`                                |
| `Displayed Timestamp Column`  | UI 表示に使用されるタイムスタンプカラム。                                                                               | はい     | はい                             | `ResourceAttributes`                                |
| `Correlated Metric Source`    | 相関付け用のメトリクスソース（例: HyperDX のメトリクス）。                                                              | いいえ   | いいえ                           | –                                                   |
| `Correlated Trace Source`     | 相関付け用のトレースソース（例: HyperDX のトレース）。                                                                  | いいえ   | いいえ                           | –                                                   |
| `Trace Id Expression`         | Trace ID を抽出するための式またはカラム。                                                                               | はい     | はい                             | `TraceId`                                           |
| `Span Id Expression`          | Span ID を抽出するための式またはカラム。                                                                                | はい     | はい                             | `SpanId`                                            |
| `Implicit Column Expression`  | フィールドが指定されていない場合に全文検索（Lucene 形式）で使用されるカラム。通常はログ本文。                           | はい     | はい                             | `Body`                                              |

#### トレース {#traces}

| Setting                          | Description                                                                                                             | Required | Inferred in Default Schema | Inferred Value         |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                           | ソース名。                                                                                                              | Yes      | No                          | –                      |
| `Server Connection`              | サーバー接続名。                                                                                                        | Yes      | No                          | `Default`              |
| `Database`                       | ClickHouse のデータベース名。                                                                                           | Yes      | Yes                         | `default`                |
| `Table`                          | 対象テーブル名。デフォルトスキーマを使用する場合は `otel_traces` を設定します。                                         | Yes      | Yes                         |      -       |
| `Timestamp Column`              | プライマリキーの一部となる日時型のカラムまたは式。                                                                      | Yes      | Yes                         | `Timestamp`              |
| `Timestamp`                      | `Timestamp Column` のエイリアス。                                                                                       | Yes      | Yes                         | `Timestamp`              |
| `Default Select`                | デフォルトの検索結果で表示されるカラム。                                                                                | Yes      | Yes                         | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`           | スパンの継続時間を計算するための式。                                                                                    | Yes      | Yes                         | `Duration`               |
| `Duration Precision`            | 継続時間式の精度（例: ナノ秒、マイクロ秒）。                                                                            | Yes      | Yes                         | ns                     |
| `Trace Id Expression`           | Trace ID 用の式またはカラム。                                                                                           | Yes      | Yes                         | `TraceId`                |
| `Span Id Expression`            | Span ID 用の式またはカラム。                                                                                            | Yes      | Yes                         | `SpanId`                 |
| `Parent Span Id Expression`     | 親 Span ID 用の式またはカラム。                                                                                         | Yes      | Yes                         | `ParentSpanId`           |
| `Span Name Expression`          | スパン名用の式またはカラム。                                                                                            | Yes      | Yes                         | `SpanName`               |
| `Span Kind Expression`          | スパン種別（例: クライアント、サーバー）用の式またはカラム。                                                            | Yes      | Yes                         | `SpanKind`               |
| `Correlated Log Source`         | 任意。リンクされたログソース（例: HyperDX のログ）。                                                                    | No       | No                          | –                      |
| `Correlated Session Source`     | 任意。リンクされたセッションソース。                                                                                    | No       | No                          | –                      |
| `Correlated Metric Source`      | 任意。リンクされたメトリクスソース（例: HyperDX のメトリクス）。                                                        | No       | No                          | –                      |
| `Status Code Expression`        | スパンのステータスコード用の式。                                                                                        | Yes      | Yes                         | `StatusCode`             |
| `Status Message Expression`     | スパンのステータスメッセージ用の式。                                                                                    | Yes      | Yes                         | `StatusMessage`          |
| `Service Name Expression`       | サービス名用の式またはカラム。                                                                                          | Yes      | Yes                         | `ServiceName`            |
| `Resource Attributes Expression`| リソースレベルの属性用の式またはカラム。                                                                                | Yes      | Yes                         | `ResourceAttributes`     |
| `Event Attributes Expression`   | イベント属性用の式またはカラム。                                                                                        | Yes      | Yes                         | `SpanAttributes`         |
| `Span Events Expression`        | スパンイベントを抽出するための式。通常は `Nested` 型カラムです。対応する言語 SDKs を使用している場合、例外スタックトレースのレンダリングが可能になります。 | Yes      | Yes                         | `Events`                 |
| `Implicit Column Expression`   | フィールドが指定されていない場合に全文検索（Lucene 形式）に使用されるカラム。通常はログ本文です。  | Yes  | Yes  | `SpanName`|

#### メトリクス {#metrics}

| Setting               | Description                                                   | Required | Inferred in Default Schema      | Inferred Value       |
|------------------------|---------------------------------------------------------------|----------|----------------------------------|----------------------|
| `Name`                 | ソース名。                                                    | Yes      | No                               | –                    |
| `Server Connection`    | サーバー接続名。                                              | Yes      | No                               | `Default`            |
| `Database`             | ClickHouse データベース名。                                   | Yes      | Yes                              | `default`            |
| `Gauge Table`          | ゲージ型メトリクスを保存するテーブル。                        | Yes      | No                               | `otel_metrics_gauge` |
| `Histogram Table`      | ヒストグラム型メトリクスを保存するテーブル。                  | Yes      | No                               | `otel_metrics_histogram` |
| `Sum Table`            | 合計型（カウンタ）メトリクスを保存するテーブル。              | Yes      | No                               | `otel_metrics_sum`   |
| `Correlated Log Source`| オプション。相関付けられたログソース（例: HyperDX ログ）。    | No       | No                               | –                    |

#### セッション {#settings}

| Setting                        | Description                                                                                         | Required | Inferred in Default Schema        | Inferred Value |
|-------------------------------|-----------------------------------------------------------------------------------------------------|----------|-----------------------------------|----------------|
| `Name`                        | ソース名。                                                                                          | Yes      | No                                | –              |
| `Server Connection`           | サーバー接続名。                                                                                   | Yes      | No                                | `Default`      |
| `Database`                    | ClickHouse のデータベース名。                                                                      | Yes      | Yes                               | `default`      |
| `Table`                       | セッションデータの出力先となるテーブル。デフォルトスキーマを使用する場合は `hyperdx_sessions` に設定します。 | Yes      | Yes                               | -              |
| `Timestamp Column`            | プライマリキーの一部となる日時型カラムまたは式。                                                  | Yes      | Yes                               | `TimestampTime`|
| `Log Attributes Expression`   | セッションデータからログレベルの属性を抽出するための式。                                          | Yes      | Yes                               | `LogAttributes`|
| `LogAttributes`               | ログ属性を保存するために使用されるエイリアスまたはフィールド参照。                                | Yes      | Yes                               | `LogAttributes`|
| `Resource Attributes Expression` | リソースレベルのメタデータを抽出するための式。                                                 | Yes      | Yes                               | `ResourceAttributes` |
| `Correlated Trace Source`     | オプション。セッションを相関付けるためにリンクするトレースソース。                                | No       | No                                | –              |
| `Implicit Column Expression`  | フィールドが指定されていない場合に全文検索に使用されるカラム（例: Lucene 形式のクエリパース）。   | Yes      | Yes                               | `Body`         |

### 相関ソース {#correlated-sources}

ClickStack でソース間の完全な相関付けを有効にするには、ログ、トレース、メトリクス、セッションに対して相関ソースを設定する必要があります。これにより、HyperDX は関連するデータを相関付けて、イベントをレンダリングする際に豊富なコンテキストを提供できます。

- `Logs`: トレースおよびメトリクスと相関付けることができます。
- `Traces`: ログ、セッション、およびメトリクスと相関付けることができます。
- `Metrics`: ログと相関付けることができます。
- `Sessions`: トレースと相関付けることができます。

これらの相関関係を設定すると、さまざまな機能が有効になります。例えば、HyperDX はトレースに関連するログを並べて表示したり、セッションに紐づくメトリクス異常を可視化したりできます。

例えば、以下は相関ソースを設定した Logs ソースの例です:

<Image img={hyperdx_26} alt="相関ソースが設定された HyperDX のソース" size="md"/>

### アプリケーションの構成設定 {#application-configuration-settings}

:::note ClickHouse Cloud での HyperDX
HyperDX が ClickHouse Cloud 上で管理されている場合、これらの設定は変更できません。
:::

* `HYPERDX_API_KEY`
  * **Default:** なし（必須）
  * **Description:** HyperDX API 用の認証キー。
  * **Guidance:**
  * テレメトリおよびログ送信に必須
  * ローカル開発では、空でない任意の値を使用可能
  * 本番環境では、安全で一意なキーを使用すること
  * アカウント作成後にチーム設定ページから取得可能

* `HYPERDX_LOG_LEVEL`
  * **デフォルト:** `info`
  * **説明:** ログ出力の詳細度レベルを設定します。
  * **オプション:** `debug`, `info`, `warn`, `error`
  * **ガイダンス:**
  * 詳細なトラブルシューティングには `debug` を使用します。
  * 通常運用には `info` を使用します。
  * 本番環境ではログ量を減らすために `warn` または `error` を使用します。

* `HYPERDX_API_PORT`
  * **デフォルト:** `8000`
  * **説明:** HyperDX API サーバー用のポート。
  * **ガイダンス:**
  * このポートがホスト環境で利用可能（空いている）であることを確認してください
  * ポートが競合している場合は変更してください
  * API クライアント設定で指定しているポートと一致させる必要があります

* `HYPERDX_APP_PORT`
  * **デフォルト:** `8000`
  * **説明:** HyperDX フロントエンドアプリ用のポート。
  * **ガイダンス:**
  * このポートがホスト上で使用可能であることを確認してください
  * ポートの競合がある場合は変更してください
  * ブラウザからアクセス可能である必要があります

* `HYPERDX_APP_URL`
  * **Default:** `http://localhost`
  * **Description:** フロントエンドアプリのベースURL。
  * **Guidance:**
  * 本番環境では使用するドメインに設定する
  * プロトコル（http/https）を含める
  * 末尾のスラッシュは含めない

* `MONGO_URI`
  * **デフォルト:** `mongodb://db:27017/hyperdx`
  * **説明:** MongoDB の接続文字列。
  * **ガイドライン:**
  * Docker を用いたローカル開発ではデフォルトを使用する
  * 本番環境では安全な接続文字列を使用する
  * 必要に応じて認証情報を含める
  * 例: `mongodb://user:pass@host:port/db`

* `MINER_API_URL`
  * **デフォルト:** `http://miner:5123`
  * **説明:** ログパターンマイニングサービスの URL。
  * **ガイドライン:**
  * Docker を用いたローカル開発ではデフォルトを使用します
  * 本番環境では miner サービスの URL を設定します
  * API サービスからアクセス可能である必要があります

* `FRONTEND_URL`
  * **デフォルト:** `http://localhost:3000`
  * **説明:** フロントエンドアプリのURL。
  * **ガイダンス:**
  * ローカル開発ではデフォルトを使用する
  * 本番環境では利用するドメインを設定する
  * APIサービスからアクセス可能である必要がある

* `OTEL_SERVICE_NAME`
  * **デフォルト:** `hdx-oss-api`
  * **説明:** OpenTelemetry 計装用のサービス名です。
  * **ガイダンス:**
  * HyperDX が自己計装する場合に適用される HyperDX サービスには、内容が分かる名前を付けてください。
  * テレメトリデータ内で HyperDX サービスを識別しやすくできます

* `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  * **デフォルト:** `http://localhost:4318`
  * **説明:** OpenTelemetry collector のエンドポイント。
  * **ガイダンス:**
  * HyperDX をセルフインストルメントする場合に関連します
  * ローカル開発ではデフォルト値を使用します
  * 本番では利用している collector の URL を設定します
  * HyperDX サービスから到達可能である必要があります

* `USAGE_STATS_ENABLED`
  * **デフォルト:** `true`
  * **説明:** 利用状況統計の収集を有効／無効にします。
  * **ガイダンス:**
  * 利用状況トラッキングを無効化するには `false` に設定します
  * プライバシーに配慮が必要なデプロイメントで有用です
  * プロダクト改善のため、デフォルトは `true` です

* `IS_OSS`
  * **Default:** `true`
  * **Description:** OSS モードで実行しているかどうかを示します。
  * **Guidance:**
  * オープンソースのデプロイメントでは `true` のままにします
  * エンタープライズ デプロイメントでは `false` に設定します
  * 利用できる機能が変わります

* `IS_LOCAL_MODE`
  * **Default:** `false`
  * **Description:** ローカルモードで実行しているかどうかを示します。
  * **Guidance:**
  * ローカル開発環境では `true` に設定します
  * 一部の本番環境向け機能を無効化します
  * テストおよび開発用途に便利です

* `EXPRESS_SESSION_SECRET`
  * **デフォルト:** `hyperdx is cool 👋`
  * **説明:** Express のセッション管理用シークレット。
  * **ガイダンス:**
  * 本番環境では必ず変更すること
  * 強度の高いランダムな文字列を使用すること
  * シークレットを厳重に管理すること

* `ENABLE_SWAGGER`
  * **Default:** `false`
  * **Description:** Swagger API ドキュメントの有効化を切り替えます。
  * **Guidance:**
  * API ドキュメントを有効化する場合は `true` に設定します
  * 開発およびテスト環境で有用です
  * 本番環境では無効化してください

* `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  * **Default:** `false`
  * **Description:** HyperDX における JSON 型のベータ版サポートを有効にします。OTel collector で JSON サポートを有効にするには、[`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector) も参照してください。
  * **Guidance:**
  * `true` に設定すると、ClickStack で JSON サポートが有効になります。

## OpenTelemetry collector {#otel-collector}

詳しくは「[ClickStack OpenTelemetry Collector](/use-cases/observability/clickstack/ingesting-data/otel-collector)」を参照してください。

- `CLICKHOUSE_ENDPOINT`
  - **Default:** *なし（必須）*。スタンドアロンイメージの場合に必要です。All-in-one または Docker Compose ディストリビューションの場合は、統合された ClickHouse インスタンスが設定されます。
  - **Description:** テレメトリデータをエクスポートする ClickHouse インスタンスの HTTPS URL。
  - **Guidance:**
    - ポートを含む完全な HTTPS エンドポイントである必要があります（例：`https://clickhouse.example.com:8443`）
    - コレクターが ClickHouse にデータを送信するために必須です

- `CLICKHOUSE_USER`
  - **Default:** `default`
  - **Description:** ClickHouse インスタンスで認証する際に使用するユーザー名。
  - **Guidance:**
    - ユーザーに `INSERT` および `CREATE TABLE` 権限が付与されていることを確認してください
    - インジェスト専用のユーザーを作成することを推奨します

- `CLICKHOUSE_PASSWORD`
  - **Default:** *なし（認証が有効な場合は必須）*
  - **Description:** 指定した ClickHouse ユーザーのパスワード。
  - **Guidance:**
    - ユーザーアカウントにパスワードが設定されている場合に必須です
    - 本番環境のデプロイでは Secret などを用いて安全に保管してください

- `HYPERDX_LOG_LEVEL`
  - **Default:** `info`
  - **Description:** コレクターのログの詳細レベル。
  - **Guidance:**
    - `debug`、`info`、`warn`、`error` などの値を指定できます
    - トラブルシューティング時は `debug` を使用してください

- `OPAMP_SERVER_URL`
  - **Default:** *なし（必須）*。スタンドアロンイメージの場合に必要です。All-in-one または Docker Compose ディストリビューションの場合は、デプロイされた HyperDX インスタンスを指します。
  - **Description:** コレクターを管理するために使用される OpAMP サーバー（例：HyperDX インスタンス）の URL。デフォルトではポート `4320` を使用します。
  - **Guidance:**
    - 自身の HyperDX インスタンスを指す必要があります
    - 動的な設定とセキュアなインジェストを有効にします

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`
  - **Default:** `default`
  - **Description:** コレクターがテレメトリデータを書き込む ClickHouse データベース。
  - **Guidance:**
    - カスタムのデータベース名を使用する場合に設定します
    - 指定したユーザーがこのデータベースにアクセスできることを確認してください

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **Default:** `<empty string>`
  - **Description:** コレクターで有効にする feature flag を指定します。`--feature-gates=clickhouse.json` を設定すると、コレクターで JSON 型のベータサポートが有効になり、スキーマがその型で作成されるようになります。HyperDX で JSON サポートを有効にするには、[`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx) も参照してください。
  - **Guidance:**
    - ClickStack で JSON サポートを有効にするには `true` を設定します。

## ClickHouse {#clickhouse}

ClickStack には、マルチテラバイト規模を想定したデフォルトの ClickHouse 構成が含まれていますが、ユーザーは自分たちのワークロードに合わせて自由に変更・最適化できます。

ClickHouse を効果的にチューニングするには、[parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards) といった主要なストレージの概念や、[merges](/merges) が挿入時にどのように行われるかを理解しておく必要があります。[primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes)、およびデータスキッピングインデックスの基礎と、TTL によるライフサイクル管理などの[データライフサイクル管理](/observability/managing-data)手法を確認しておくことを推奨します。

ClickStack は [schema customization](/use-cases/observability/schema-design) をサポートしており、ユーザーはカラム型の変更、（例: ログからの）新しいフィールドの抽出、codec と辞書の適用、そしてプロジェクションを用いたクエリの高速化を行えます。

さらに、ビューのソーステーブルにデータを書き込み、アプリケーションがターゲットテーブルを読み取る構成であれば、マテリアライズドビューを使用して[インジェスト時にデータを変換またはフィルタリング](/use-cases/observability/schema-design#materialized-columns)することができます。

詳細については、スキーマ設計、インデックス戦略、およびデータ管理のベストプラクティスに関する ClickHouse ドキュメントを参照してください。これらの多くは、そのまま ClickStack のデプロイメントにも適用できます。