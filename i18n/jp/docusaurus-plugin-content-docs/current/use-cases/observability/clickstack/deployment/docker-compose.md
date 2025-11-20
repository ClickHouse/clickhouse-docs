---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: "Docker Compose"
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: "Docker ComposeによるClickStackのデプロイ - ClickHouse Observability Stack"
doc_type: "guide"
keywords:
  [
    "ClickStack Docker Compose",
    "Docker Compose ClickHouse",
    "HyperDX Docker deployment",
    "ClickStack deployment guide",
    "OpenTelemetry Docker Compose"
  ]
---

import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"
import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"

ClickStackの全コンポーネントは、個別のDockerイメージとして配布されています：

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) コレクター**
- **MongoDB**

これらのイメージは、Docker Composeを使用してローカル環境で組み合わせてデプロイできます。

Docker Composeは、デフォルトの`otel-collector`設定に基づき、可観測性とデータ取り込みのための追加ポートを公開します：

- `13133`: `health_check`拡張機能のヘルスチェックエンドポイント
- `24225`: ログ取り込み用のFluentdレシーバー
- `4317`: OTLP gRPCレシーバー（トレース、ログ、メトリクスの標準プロトコル）
- `4318`: OTLP HTTPレシーバー（gRPCの代替プロトコル）
- `8888`: コレクター自体を監視するためのPrometheusメトリクスエンドポイント

これらのポートにより、多様なテレメトリーソースとの統合が可能になり、OpenTelemetryコレクターを様々な取り込みニーズに対応した本番環境レベルで運用できます。

### 適用対象 {#suitable-for}

- ローカル環境でのテスト
- 概念実証（PoC）
- 耐障害性が不要で、単一サーバーで全てのClickHouseデータをホストできる本番環境デプロイ
- ClickStackをデプロイしつつ、ClickHouseは別途ホストする場合（例：ClickHouse Cloudの利用）


## デプロイ手順 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### リポジトリのクローン {#clone-the-repo}

Docker Composeでデプロイするには、HyperDXリポジトリをクローンし、ディレクトリに移動して`docker-compose up`を実行してください:


```shell
git clone git@github.com:hyperdxio/hyperdx.git
cd hyperdx
# v2ブランチに切り替え
git checkout v2
docker compose up
```

### HyperDX UIへのアクセス {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。

要件を満たすユーザー名とパスワードを指定してユーザーを作成します。

`Create`をクリックすると、HelmチャートでデプロイされたClickHouseインスタンス用のデータソースが作成されます。

:::note デフォルト接続の上書き
統合されたClickHouseインスタンスへのデフォルト接続を上書きできます。詳細については、["ClickHouse Cloudの使用"](#using-clickhouse-cloud)を参照してください。
:::

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

別のClickHouseインスタンスを使用する例については、["ClickHouse Cloud接続の作成"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

### 接続詳細の入力 {#complete-connection-details}

デプロイされたClickHouseインスタンスに接続するには、**Create**をクリックしてデフォルト設定を適用します。

独自の**外部ClickHouseクラスタ**（例:ClickHouse Cloud）に接続する場合は、接続認証情報を手動で入力できます。

ソースの作成を求められた場合は、すべてのデフォルト値を保持し、`Table`フィールドに`otel_logs`を入力します。その他の設定は自動検出されるため、`Save New Source`をクリックできます。

<Image img={hyperdx_logs} alt='ログソースの作成' size='md' />

</VerticalStepper>


## Compose設定の変更 {#modifying-settings}

環境変数ファイルを使用して、使用するバージョンなどのスタック設定を変更できます：


```shell
user@example-host hyperdx % cat .env
# docker-compose.yml で使用
# docker-compose.yml で使用
HDX_IMAGE_REPO=docker.hyperdx.io
IMAGE_NAME=ghcr.io/hyperdxio/hyperdx
IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx
LOCAL_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-local
LOCAL_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-local
ALL_IN_ONE_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-all-in-one
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-all-in-one
OTEL_COLLECTOR_IMAGE_NAME=ghcr.io/hyperdxio/hyperdx-otel-collector
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=hyperdx/hyperdx-otel-collector
CODE_VERSION=2.0.0-beta.16
IMAGE_VERSION_SUB_TAG=.16
IMAGE_VERSION=2-beta
IMAGE_NIGHTLY_TAG=2-nightly
```


# ドメイン URL の設定
HYPERDX_API_PORT=8000 # 任意（他のサービスと競合しない値にしてください）
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320



# Otel/Clickhouse の設定

HYPERDX&#95;OTEL&#95;EXPORTER&#95;CLICKHOUSE&#95;DATABASE=default

```

### OpenTelemetryコレクターの設定 {#configuring-collector}

必要に応じてOTelコレクターの設定を変更できます。詳細は[「設定の変更」](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)を参照してください。
```


## ClickHouse Cloudの使用 {#using-clickhouse-cloud}

このディストリビューションはClickHouse Cloudで使用できます。ユーザーは以下の手順を実行してください：

- `docker-compose.yaml`ファイルからClickHouseサービスを削除します。テスト時にはこの手順は任意です。デプロイされたClickHouseインスタンスは単に無視されますが、ローカルリソースを無駄に消費します。サービスを削除する場合は、`depends_on`などのサービスへの参照も必ず削除してください。
- composeファイルで環境変数`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`を設定することで、OTel collectorがClickHouse Cloudインスタンスを使用するように変更します。具体的には、OTel collectorサービスに以下の環境変数を追加します：

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME}:${IMAGE_VERSION}
      environment:
        CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # httpsエンドポイントをここに指定
        CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
        CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
        HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: ${HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE}
        HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
        OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
      ports:
        - '13133:13133' # health_check拡張
        - '24225:24225' # fluentdレシーバー
        - '4317:4317' # OTLP gRPCレシーバー
        - '4318:4318' # OTLP httpレシーバー
        - '8888:8888' # metrics拡張
      restart: always
      networks:
        - internal
  ```

  `CLICKHOUSE_ENDPOINT`にはポート`8443`を含むClickHouse CloudのHTTPSエンドポイントを指定してください。例：`https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

- HyperDX UIに接続してClickHouseへの接続を作成する際は、Cloudの認証情報を使用してください。

<JSONSupport />

これらを設定するには、`docker-compose.yaml`内の関連サービスを以下のように変更します：

```yaml
app:
  image: ${HDX_IMAGE_REPO}/${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
  ports:
    - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
    - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
  environment:
    BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # JSONを有効化
    FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
    HYPERDX_API_KEY: ${HYPERDX_API_KEY}
    HYPERDX_API_PORT: ${HYPERDX_API_PORT}
  # 簡潔にするため省略

otel-collector:
  image: ${HDX_IMAGE_REPO}/${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
  environment:
    OTEL_AGENT_FEATURE_GATE_ARG: "--feature-gates=clickhouse.json" # JSONを有効化
    CLICKHOUSE_ENDPOINT: "tcp://ch-server:9000?dial_timeout=10s"
    # 簡潔にするため省略
```
