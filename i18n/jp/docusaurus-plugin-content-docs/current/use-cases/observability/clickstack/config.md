---
'slug': '/use-cases/observability/clickstack/config'
'title': '設定オプション'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack の設定オプション - ClickHouse 可観測スタック'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import hyperdx_25 from '@site/static/images/use-cases/observability/hyperdx-25.png';
import hyperdx_26 from '@site/static/images/use-cases/observability/hyperdx-26.png';


以下の設定オプションは、ClickStackの各コンポーネントに利用できます。

## 設定の変更 {#modifying-settings}

### Docker {#docker}

[All in One](/use-cases/observability/clickstack/deployment/all-in-one)、[HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)、または[Local Mode](/use-cases/observability/clickstack/deployment/local-mode-only)を使用している場合、希望の設定を環境変数を介して指定します。たとえば：

```shell
docker run  -e HYPERDX_LOG_LEVEL='debug' -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### Docker Compose {#docker-compose}

[Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) 配置ガイドを使用している場合、[`.env`](https://github.com/hyperdxio/hyperdx/blob/main/.env) ファイルを使用して設定を変更できます。

または、[`docker-compose.yaml`](https://github.com/hyperdxio/hyperdx/blob/main/docker-compose.yml) ファイル内で明示的に設定を上書きすることもできます。たとえば：

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

#### 値のカスタマイズ (オプション) {#customizing-values}

`--set` フラグを使用して設定をカスタマイズできます。たとえば：

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

または `values.yaml` を編集します。デフォルトの値を取得するには：

```shell
helm show values hyperdx/hdx-oss-v2 > values.yaml
```

設定の例：

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

HyperDX は、各可観測性データタイプ/ピラーのソースをユーザーが定義することに依存しています：

- `Logs`
- `Traces`
- `Metrics`
- `Sessions`

この設定は、`Team Settings -> Sources` 内のアプリケーションから行うことができます。以下にログの例を示します：

<Image img={hyperdx_25} alt="HyperDX Source configuration" size="lg"/>

これらの各ソースは、作成時に指定されたテーブルと、HyperDXがデータをクエリできるカラムのセットを少なくとも1つ必要とします。

[デフォルトのOpenTelemetry (OTel) スキーマ](/observability/integrating-opentelemetry#out-of-the-box-schema)を使用してClickStackに付属している場合、これらのカラムは各ソースに対して自動的に推測できます。もし[スキーマを変更する](#clickhouse)か、カスタムスキーマを使用している場合は、ユーザーがこれらのマッピングを指定し、更新する必要があります。

:::note
ClickStackに付属しているClickHouseのデフォルトスキーマは、[OTel コレクター用のClickHouseエクスポーター](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)によって作成されたスキーマです。これらのカラム名は、公式のOTel仕様に記載されているものと相関します。詳細は[こちら](https://opentelemetry.io/docs/specs/otel/logs/data-model/)を参照してください。
:::

各ソースに利用可能な設定は以下の通りです：

#### Logs {#logs}

| 設定                        | 説明                                                                                                             | 必要 | デフォルトスキーマでの推測 | 推測される値                                      |
|-------------------------------|-----------------------------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------------------------------|
| `Name`                        | ソース名。                                                                                                        | はい      | いいえ                          | –                                                   |
| `Server Connection`           | サーバ接続名。                                                                                                | はい      | いいえ                          | `Default`                                             |
| `Database`                    | ClickHouseデータベース名。                                                                                      | はい      | はい                         | `default`                                             |
| `Table`                       | 対象のテーブル名。デフォルトスキーマを使用する場合は `otel_logs` に設定します。                                                                                                     | はい      | いいえ                         |                                            |
| `Timestamp Column`            | 主キーの一部となる日時カラムまたは式。                                                                        | はい       | はい                         | `TimestampTime`                                       |
| `Default Select`              | デフォルトの検索結果に表示されるカラム。                                                                       | はい       | はい                         | `Timestamp`, `ServiceName`, `SeverityText`, `Body`         |
| `Service Name Expression`     | サービス名のための式またはカラム。                                                                             | はい       | はい                         | `ServiceName`                                         |
| `Log Level Expression`        | ログレベルのための式またはカラム。                                                                            | はい       | はい                         | `SeverityText`                                        |
| `Body Expression`             | ログメッセージのための式またはカラム。                                                                          | はい       | はい                         | `Body`                                                |
| `Log Attributes Expression`   | カスタムログ属性のための式またはカラム。                                                                        | はい       | はい                         | `LogAttributes`                                       |
| `Resource Attributes Expression` | リソースレベルの属性のための式またはカラム。                                                                   | はい       | はい                         | `ResourceAttributes`                                  |
| `Displayed Timestamp Column`  | UI表示に使用されるタイムスタンプカラム。                                                                       | はい       | はい                         | `ResourceAttributes`                                  |
| `Correlated Metric Source`    | 関連付けられたメトリクソース (例: HyperDX メトリクス)。                                                        | いいえ       | いいえ                          | –                                                   |
| `Correlated Trace Source`     | 関連付けられたトレースソース (例: HyperDX トレース)。                                                          | いいえ       | いいえ                          | –                                                   |
| `Trace Id Expression`         | トレースIDを抽出するための式またはカラム。                                                                     | はい       | はい                         | `TraceId`                                             |
| `Span Id Expression`          | スパンIDを抽出するための式またはカラム。                                                                        | はい       | はい                         | `SpanId`                                              |
| `Implicit Column Expression`  | フルテキスト検索に使用されるカラム (フィールドが指定されていない場合)。通常はログ本文。                      | はい       | はい                         | `Body`                                                |

#### Traces {#traces}

| 設定                          | 説明                                                                                                            | 必要 | デフォルトスキーマでの推測 | 推測される値         |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                           | ソース名。                                                                                                        | はい      | いいえ                          | –                      |
| `Server Connection`              | サーバ接続名。                                                                                                | はい      | いいえ                          | `Default`              |
| `Database`                       | ClickHouseデータベース名。                                                                                      | はい      | はい                         | `default`                |
| `Table`                          | 対象のテーブル名。デフォルトスキーマを使用する場合は `otel_traces` に設定します。                                                                                                   | はい      | はい                         |      -       |
| `Timestamp Column`              | 主キーの一部となる日時カラムまたは式。                                                                        | はい      | はい                         | `Timestamp`              |
| `Timestamp`                      | `Timestamp Column` のエイリアス。                                                                             | はい      | はい                         | `Timestamp`              |
| `Default Select`                | デフォルトの検索結果に表示されるカラム。                                                                       | はい      | はい                         | `Timestamp, ServiceName as service, StatusCode as level, round(Duration / 1e6) as duration, SpanName` |
| `Duration Expression`           | スパンの持続時間を計算するための式。                                                                          | はい      | はい                         | `Duration`               |
| `Duration Precision`            | 持続時間式の精度 (例: ナノ秒、マイクロ秒)。                                                                    | はい      | はい                         | ns                     |
| `Trace Id Expression`           | トレースIDのための式またはカラム。                                                                              | はい      | はい                         | `TraceId`                |
| `Span Id Expression`            | スパンIDのための式またはカラム。                                                                               | はい      | はい                         | `SpanId`                 |
| `Parent Span Id Expression`     | 親スパンIDのための式またはカラム。                                                                              | はい      | はい                         | `ParentSpanId`           |
| `Span Name Expression`          | スパン名のための式またはカラム。                                                                               | はい      | はい                         | `SpanName`               |
| `Span Kind Expression`          | スパンの種類のための式またはカラム (例: クライアント、サーバー)。                                            | はい      | はい                         | `SpanKind`               |
| `Correlated Log Source`         | オプション。関連付けられたログソース (例: HyperDX ログ)。                                                     | いいえ       | いいえ                          | –                      |
| `Correlated Session Source`     | オプション。関連付けられたセッションソース。                                                                  | いいえ       | いいえ                          | –                      |
| `Correlated Metric Source`      | オプション。関連付けられたメトリクソース (例: HyperDX メトリクス)。                                         | いいえ       | いいえ                          | –                      |
| `Status Code Expression`        | スパンのステータスコードのための式。                                                                          | はい      | はい                         | `StatusCode`             |
| `Status Message Expression`     | スパンのステータスメッセージのための式。                                                                      | はい      | はい                         | `StatusMessage`          |
| `Service Name Expression`       | サービス名のための式またはカラム。                                                                             | はい      | はい                         | `ServiceName`            |
| `Resource Attributes Expression`| リソースレベル属性のための式またはカラム。                                                                    | はい      | はい                         | `ResourceAttributes`     |
| `Event Attributes Expression`   | イベント属性のための式またはカラム。                                                                          | はい      | はい                         | `SpanAttributes`         |
| `Span Events Expression`        | スパンイベントを抽出するための式。通常は `Nested` タイプのカラムです。対応する言語SDKで例外スタックトレースをレンダリングできます。              | はい      | はい                         | `Events`                 |
| `Implicit Column Expression`   | フルテキスト検索に使用されるカラム (フィールドが指定されていない場合)。通常はログの本文です。                 | はい  | はい  | `SpanName`|

#### Metrics {#metrics}

| 設定               | 説明                                                                                                          | 必要 | デフォルトスキーマでの推測 | 推測される値              |
|--------------------|---------------------------------------------------------------------------------------------------------------|----------|-----------------------------|-----------------------------|
| `Name`             | ソース名。                                                                                                | はい      | いいえ                          | –                           |
| `Server Connection`| サーバ接続名。                                                                                            | はい      | いいえ                          | `Default`                   |
| `Database`         | ClickHouseデータベース名。                                                                                 | はい      | はい                         | `default`                   |
| `Gauge Table`      | ガウジ型メトリクスを格納するテーブル。                                                                    | はい      | いいえ                          | `otel_metrics_gauge`        |
| `Histogram Table`  | ヒストグラム型メトリクスを格納するテーブル。                                                              | はい      | いいえ                          | `otel_metrics_histogram`    |
| `Sum Table`        | 合計型 (カウンター) メトリクスを格納するテーブル。                                                        | はい      | いいえ                          | `otel_metrics_sum`          |
| `Correlated Log Source`| オプション。関連付けられたログソース (例: HyperDX ログ)。                                                | いいえ       | いいえ                          | –                           |

#### Sessions {#settings}

| 設定                        | 説明                                                                                                    | 必要 | デフォルトスキーマでの推測 | 推測される値         |
|-----------------------------|--------------------------------------------------------------------------------------------------------|----------|-----------------------------|------------------------|
| `Name`                      | ソース名。                                                                                            | はい      | いいえ                          | –                      |
| `Server Connection`         | サーバ接続名。                                                                                         | はい      | いいえ                          | `Default`              |
| `Database`                  | ClickHouseデータベース名。                                                                             | はい      | はい                         | `default`              |
| `Table`                     | セッションデータの対象テーブル。デフォルトスキーマを使用する場合は `hyperdx_sessions` に設定します。                                      | はい      | はい                         | -      |
| `Timestamp Column`          | 主キーの一部となる日時カラムまたは式。                                                                | はい      | はい                         | `TimestampTime`            |
| `Log Attributes Expression` | セッションデータからログレベル属性を抽出するための式。                                               | はい      | はい                         | `LogAttributes`        |
| `LogAttributes`             | ログ属性を格納するために使用されるエイリアスまたはフィールド参照。                                      | はい      | はい                         | `LogAttributes`        |
| `Resource Attributes Expression` | リソースレベルメタデータを抽出するための式。                                                  | はい      | はい                         | `ResourceAttributes`   |
| `Correlated Trace Source`   | オプション。セッション相関のための関連付けられたトレースソース。                                        | いいえ       | いいえ                          | –                      |
| `Implicit Column Expression` | フルテキスト検索に使用されるカラム (フィールドが指定されていない場合)。                                   | はい      | はい                         | `Body` |

### 相関ソース {#correlated-sources}

ClickStackでフルクロスソース相関を可能にするためには、ユーザーはログ、トレース、メトリクス、およびセッションのための相関ソースを設定する必要があります。これにより、HyperDXは関連データを関連付け、イベントをレンダリングする際に豊かなコンテキストを提供します。

- `Logs`: トレースやメトリクスと相関できます。
- `Traces`: ログ、セッション、メトリクスと相関できます。
- `Metrics`: ログと相関できます。
- `Sessions`: トレースと相関できます。

これらの相関を設定することにより、HyperDXは例えば、トレースに関連するログを一緒にレンダリングしたり、セッションに関連するメトリクスの異常をサーフェスしたりすることができます。適切な設定により、統一感のある文脈的な可観測性体験が保証されます。

以下に、相関ソースで構成されたLogsソースの例を示します：

<Image img={hyperdx_26} alt="HyperDX Source correlated" size="md"/>

### アプリケーション設定 {#application-configuration-settings}

:::note HyperDX in ClickHouse Cloud
これらの設定は、ClickHouse CloudでHyperDXが管理されている場合には変更できません。
:::

- `HYPERDX_API_KEY`
  - **デフォルト:** なし (必須)
  - **説明:** HyperDX APIの認証キー。
  - **ガイダンス:** 
  - テレメトリーとロギングのために必要
  - ローカル開発時には空でない値を使用できます
  - 本番環境では安全でユニークなキーを使用してください
  - アカウント作成後、チーム設定ページから入手できます

- `HYPERDX_LOG_LEVEL`
  - **デフォルト:** `info`
  - **説明:** ロギングの詳細レベルを設定します。
  - **オプション:** `debug`, `info`, `warn`, `error`
  - **ガイダンス:**
  - 詳細なトラブルシューティングには `debug` を使用します
  - 通常の操作には `info` を使用します
  - 本番環境では、ログ量を減らすために `warn` または `error` を使用します

- `HYPERDX_API_PORT`
  - **デフォルト:** `8000`
  - **説明:** HyperDX APIサーバのポート。
  - **ガイダンス:**
  - このポートがホストで使用可能であることを確認してください
  - ポートの競合がある場合には変更してください
  - APIクライアント設定のポートと一致させる必要があります

- `HYPERDX_APP_PORT`
  - **デフォルト:** `8000`
  - **説明:** HyperDXフロントエンドアプリのポート。
  - **ガイダンス:**
  - このポートがホストで使用可能であることを確認してください
  - ポートの競合がある場合には変更してください
  - ブラウザからアクセスできる必要があります

- `HYPERDX_APP_URL`
  - **デフォルト:** `http://localhost`
  - **説明:** フロントエンドアプリのベースURL。
  - **ガイダンス:**
  - 本番環境ではあなたのドメインに設定してください
  - プロトコルを含めてください (http/https)
  - スラッシュを後ろに付けないでください

- `MONGO_URI`
  - **デフォルト:** `mongodb://db:27017/hyperdx`
  - **説明:** MongoDB接続文字列。
  - **ガイダンス:**
  - Dockerでのローカル開発にはデフォルトを使用してください
  - 本番環境では安全な接続文字列を使用してください
  - 必要に応じて認証を含めてください
  - 例: `mongodb://user:pass@host:port/db`

- `MINER_API_URL`
  - **デフォルト:** `http://miner:5123`
  - **説明:** ログパターンマイニングサービスのURL。
  - **ガイダンス:**
  - Dockerでのローカル開発にはデフォルトを使用してください
  - 本番環境ではマイナーサービスのURLに設定してください
  - APIサービスからアクセスできる必要があります

- `FRONTEND_URL`
  - **デフォルト:** `http://localhost:3000`
  - **説明:** フロントエンドアプリのURL。
  - **ガイダンス:**
  - ローカル開発ではデフォルトを使用してください
  - 本番環境ではあなたのドメインに設定してください
  - APIサービスからアクセスできる必要があります

- `OTEL_SERVICE_NAME`
  - **デフォルト:** `hdx-oss-api`
  - **説明:** OpenTelemetryインストゥルメンテーションのサービス名。
  - **ガイダンス:**
  - HyperDXサービスのために説明的な名前を使用してください。HyperDXが自動計測を行う場合に適用されます。
  - テレメトリデータにおいてHyperDXサービスを特定するのに役立ちます

- `NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT`
  - **デフォルト:** `http://localhost:4318`
  - **説明:** OpenTelemetryコレクターのエンドポイント。
  - **ガイダンス:**
  - 自動計測を行うHyperDXに該当します。
  - ローカル開発ではデフォルトを使用してください
  - 本番環境ではコレクターのURLに設定してください
  - HyperDXサービスからアクセスできる必要があります

- `USAGE_STATS_ENABLED`
  - **デフォルト:** `true`
  - **説明:** 使用統計の収集を切り替えます。
  - **ガイダンス:**
  - 使用追跡を無効にするには `false` に設定します
  - プライバシーに敏感なデプロイメントに役立ちます
  - 製品改善のためにデフォルトは `true` です

- `IS_OSS`
  - **デフォルト:** `true`
  - **説明:** OSSモードで実行されているかどうかを示します。
  - **ガイダンス:**
  - オープンソースデプロイメントでは `true` のままにします
  - エンタープライズデプロイメントでは `false` に設定します
  - 機能の可用性に影響します

- `IS_LOCAL_MODE`
  - **デフォルト:** `false`
  - **説明:** ローカルモードで実行されているかどうかを示します。
  - **ガイダンス:**
  - ローカル開発には `true` に設定します
  - 特定の本番機能が無効になります
  - テストと開発に役立ちます

- `EXPRESS_SESSION_SECRET`
  - **デフォルト:** `hyperdx is cool 👋`
  - **説明:** Expressセッション管理のためのシークレット。
  - **ガイダンス:**
  - 本番環境では変更してください
  - 強力でランダムな文字列を使用してください
  - 秘密にして安全に保ってください

- `ENABLE_SWAGGER`
  - **デフォルト:** `false`
  - **説明:** Swagger APIドキュメントを切り替えます。
  - **ガイダンス:**
  - APIドキュメントを有効にするには `true` に設定します
  - 開発およびテストに役立ちます
  - 本番環境では無効にしてください

- `BETA_CH_OTEL_JSON_SCHEMA_ENABLED`
  - **デフォルト:** `false`
  - **説明:** HyperDXにおけるJSON型のBetaサポートを有効にします。OTel コレクターでJSONサポートを有効にするには[`OTEL_AGENT_FEATURE_GATE_ARG`](#otel-collector)も参照してください。
  - **ガイダンス:**
  - ClickStackにおけるJSONサポートを有効にするには `true` に設定します。

## OpenTelemetryコレクター {#otel-collector}

詳細については["ClickStack OpenTelemetry Collector"](/use-cases/observability/clickstack/ingesting-data/otel-collector)を参照してください。

- `CLICKHOUSE_ENDPOINT`  
  - **デフォルト:** スタンドアロンイメージの場合は*なし (必須)*。All-in-oneまたはDocker Compose配布の場合は統合されたClickHouseインスタンスに設定されています。
  - **説明:** テレメトリーデータをエクスポートするためのClickHouseインスタンスのHTTPS URL。  
  - **ガイダンス:**  
    - ポートを含む完全なHTTPSエンドポイントである必要があります (例: `https://clickhouse.example.com:8443`)  
    - コレクターがデータをClickHouseに送信するために必須です  

- `CLICKHOUSE_USER`  
  - **デフォルト:** `default`  
  - **説明:** ClickHouseインスタンスに対する認証に使用されるユーザー名。  
  - **ガイダンス:**  
    - ユーザーが `INSERT` および `CREATE TABLE` 権限を持っていることを確認してください  
    - 取り込み用に専用のユーザーを作成することを推奨します  

- `CLICKHOUSE_PASSWORD`  
  - **デフォルト:** *なし (認証が有効な場合は必須)*  
  - **説明:** 指定されたClickHouseユーザーのパスワード。  
  - **ガイダンス:**  
    - ユーザーアカウントにパスワードが設定されている場合は必須です  
    - 本番環境で安全に保管してください  

- `HYPERDX_LOG_LEVEL`  
  - **デフォルト:** `info`  
  - **説明:** コレクターのログ詳細レベル。  
  - **ガイダンス:**  
    -  `debug`, `info`, `warn`, `error` などの値を受け入れます  
    - トラブルシューティングの際は `debug` を使用します  

- `OPAMP_SERVER_URL`  
  - **デフォルト:** *なし (必須)* スタンドアロンイメージの場合。All-in-oneまたはDocker Compose配布の場合、デプロイされたHyperDXインスタンスを指します。
  - **説明:** コレクターを管理するために使用されるOpAMPサーバのURL (例: HyperDXインスタンス)。デフォルトではポート `4320` です。
  - **ガイダンス:**  
    - あなたのHyperDXインスタンスを指す必要があります  
    - 動的な設定と安全な取り込みを有効にします  

- `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`  
  - **デフォルト:** `default`  
  - **説明:** コレクターがテレメトリーデータを書き込むClickHouseのデータベース。  
  - **ガイダンス:**  
    - カスタムデータベース名を使用する場合は設定してください  
    - 指定されたユーザーがこのデータベースにアクセスできることを確認してください  

- `OTEL_AGENT_FEATURE_GATE_ARG`
  - **デフォルト:** `<空文字列>`
  - **説明:** コレクターで有効にする機能フラグを有効にします。`--feature-gates=clickhouse.json`に設定すると、コレクター内でのJSON型のBetaサポートが有効になり、スキーマがその型で作成されます。HyperDXでのJSONサポートを有効にするには[`BETA_CH_OTEL_JSON_SCHEMA_ENABLED`](#hyperdx)も参照してください。
  - **ガイダンス:**
  - ClickStackにおけるJSONサポートを有効にするには `true` に設定します。

## ClickHouse {#clickhouse}

ClickStackはマルチテラバイトスケールに最適化されたデフォルトのClickHouse構成を提供しますが、ユーザーは仕事の負荷に合わせて変更および最適化することができます。

ClickHouseを効果的に調整するためには、ユーザーは[parts](/parts)、[partitions](/partitions)、[shards and replicas](/shards)などの主要なストレージの概念、および[merges](/merges)が挿入時にどのように発生するかを理解しておく必要があります。 [primary indices](/primary-indexes)、[sparse secondary indices](/optimize/skipping-indexes)、およびデータスキッピングインデックスの基本を確認し、TTLライフサイクルなどの[データライフサイクル管理](/observability/managing-data)の技術を利用することをお勧めします。

ClickStackは[スキーマカスタマイズ](/use-cases/observability/schema-design)をサポートしており、ユーザーはカラムの型を変更したり、新しいフィールド (例えばログから) を抽出したり、コーデックや辞書を適用したり、プロジェクションを使用してクエリを加速したりすることができます。

さらに、マテリアライズドビューを使用して、データがビューのソーステーブルに書き込まれ、アプリケーションがターゲットテーブルから読み取る限り、[取り込み時にデータを変換またはフィルタリングする](https://use-cases/observability/schema-design#materialized-columns)ことができます。

詳細については、スキーマ設計、インデックス戦略、およびデータ管理のベストプラクティスに関するClickHouseのドキュメントを参照してください。これらの多くはClickStackのデプロイメントに直接適用されます。
