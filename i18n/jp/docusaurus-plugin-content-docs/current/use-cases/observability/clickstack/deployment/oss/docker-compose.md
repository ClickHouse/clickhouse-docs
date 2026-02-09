---
slug: /use-cases/observability/clickstack/deployment/docker-compose
title: 'Docker Compose'
pagination_prev: null
pagination_next: null
sidebar_position: 3
description: 'Docker Compose を使用した ClickStack オープンソース版のデプロイ - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['ClickStack Docker Compose', 'Docker Compose ClickHouse', 'HyperDX Docker デプロイメント', 'ClickStack デプロイ ガイド', 'OpenTelemetry Docker Compose']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

すべての ClickStack オープンソースコンポーネントは、個別の Docker イメージとして配布されています:

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**
* **MongoDB**

これらのイメージは、Docker Compose を使用してローカル環境に組み合わせてデプロイできます。

Docker Compose は、デフォルトの `otel-collector` セットアップに基づき、オブザーバビリティおよびインジェスト用の追加ポートを公開します:

* `13133`: `health_check` extension 用のヘルスチェックエンドポイント
* `24225`: ログインジェスト用の Fluentd レシーバー
* `4317`: OTLP gRPC レシーバー（トレース、ログ、メトリクスの標準）
* `4318`: OTLP HTTP レシーバー（gRPC の代替）
* `8888`: コレクター自体を監視するための Prometheus メトリクスエンドポイント

これらのポートにより、さまざまなテレメトリソースとの統合が可能になり、OpenTelemetry collector を多様なインジェスト要件に対応した本番環境向けとして利用できるようになります。


### 適した用途 \{#suitable-for\}

* ローカルテスト
* PoC（概念実証）
* フォールトトレランスが不要で、単一サーバーで全ての ClickHouse データをホストできる本番環境へのデプロイメント
* ClickStack をデプロイしつつ、ClickHouse は別でホスティングする場合（例: ClickHouse Cloud を使用する場合）

## デプロイ手順 \{#deployment-steps\}

<br/>

<VerticalStepper headerLevel="h3">

### リポジトリをクローンする \{#clone-the-repo\}

Docker Compose でデプロイするには、ClickStack リポジトリをクローンし、そのディレクトリに移動して `docker-compose up` を実行します:

```shell
git clone https://github.com/ClickHouse/ClickStack.git
docker compose up
```

### HyperDX UI にアクセスする \{#navigate-to-hyperdx-ui\}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

ユーザーを作成し、要件を満たすユーザー名とパスワードを設定します。 

`Create` をクリックすると、Docker Compose でデプロイされた ClickHouse インスタンス向けのデータソースが作成されます。

:::note Overriding default connection
組み込みの ClickHouse インスタンスへのデフォルト接続を上書きできます。詳細については、「[Using ClickHouse Cloud](#using-clickhouse-cloud)」を参照してください。
:::

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

代替の ClickHouse インスタンスを使用する例については、「[Create a ClickHouse Cloud connection](/use-cases/observability/clickstack/getting-started/oss#create-a-cloud-connection)」を参照してください。

### 接続情報を入力する \{#complete-connection-details\}

デプロイ済みの ClickHouse インスタンスに接続するには、**Create** をクリックしてデフォルト設定をそのまま使用します。  

独自の **外部 ClickHouse クラスター**（例: ClickHouse Cloud）へ接続したい場合は、接続用の認証情報を手動で入力できます。

ソースの作成を求められた場合は、すべてのデフォルト値を維持し、`Table` フィールドに `otel_logs` を入力します。他の設定は自動検出されるはずなので、`Save New Source` をクリックできます。

<Image img={hyperdx_logs} alt="Create logs source" size="md"/>

</VerticalStepper>

## Compose 設定の変更 \{#modifying-settings\}

環境変数ファイルを使って、使用するバージョンなどスタックの設定を変更できます。

```shell
user@example-host clickstack % cat .env

# Used by docker-compose.yml
IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-all-in-one
LOCAL_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-local
ALL_IN_ONE_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-all-in-one
OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB=clickhouse/clickstack-otel-collector
CODE_VERSION=2.8.0
IMAGE_VERSION_SUB_TAG=.8.0
IMAGE_VERSION=2
IMAGE_NIGHTLY_TAG=2-nightly
IMAGE_LATEST_TAG=latest

# Set up domain URLs
HYPERDX_API_PORT=8000 #optional (should not be taken by other services)
HYPERDX_APP_PORT=8080
HYPERDX_APP_URL=http://localhost
HYPERDX_LOG_LEVEL=debug
HYPERDX_OPAMP_PORT=4320

# Otel/Clickhouse config
HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=default
```


### OpenTelemetry collector の設定 \{#configuring-collector\}

必要に応じて OTel collector の設定を変更できます。詳細は「[設定の変更](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)」を参照してください。

## ClickHouse Cloud の使用 \{#using-clickhouse-cloud\}

このディストリビューションは ClickHouse Cloud と併用できますが、[Managed ClickStack](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud) とは異なります。この構成では、ClickStack UI は自分で管理し、ClickHouse Cloud はコンピュートおよびストレージのみに使用します。特別な理由がない限り UI を独立運用する必要はないため、認証の統合や追加のエンタープライズ機能が含まれ、ClickStack UI を自分で管理する必要がなくなる Managed ClickStack の利用を推奨します。

次の作業を行ってください:

* `docker-compose.yml` ファイルから ClickHouse サービスを削除します。これはテスト用途であれば任意です。デプロイされた ClickHouse インスタンスは単に無視されますが、ローカルリソースを消費します。サービスを削除する場合は、`depends_on` などそのサービスへの参照も削除してください。

* compose ファイル内で環境変数 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` を設定し、OTel collector が ClickHouse Cloud インスタンスを使用するように変更します。具体的には、これらの環境変数を OTel collector サービスに追加します:

  ```shell
  otel-collector:
      image: ${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
      environment:
        CLICKHOUSE_ENDPOINT: '<CLICKHOUSE_ENDPOINT>' # ここに HTTPS エンドポイントを指定
        CLICKHOUSE_USER: '<CLICKHOUSE_USER>'
        CLICKHOUSE_PASSWORD: '<CLICKHOUSE_PASSWORD>'
        HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: ${HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE}
        HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
        OPAMP_SERVER_URL: 'http://app:${HYPERDX_OPAMP_PORT}'
      ports:
        - '13133:13133' # health_check 拡張機能
        - '24225:24225' # fluentd レシーバー
        - '4317:4317' # OTLP gRPC レシーバー
        - '4318:4318' # OTLP HTTP レシーバー
        - '8888:8888' # メトリクス拡張機能
      restart: always
      networks:
        - internal
  ```

  `CLICKHOUSE_ENDPOINT` には、ポート `8443` を含む ClickHouse Cloud の HTTPS エンドポイントを指定します。例: `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

* HyperDX UI に接続し、ClickHouse への接続を作成する際には、ClickHouse Cloud の認証情報を使用します。

<JSONSupport />

これらを設定するには、`docker-compose.yml` 内の該当するサービスを変更します:

```yaml
  app:
    image: ${IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    ports:
      - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
      - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
    environment:
      BETA_CH_OTEL_JSON_SCHEMA_ENABLED: true # enable JSON
      FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
      HYPERDX_API_KEY: ${HYPERDX_API_KEY}
      HYPERDX_API_PORT: ${HYPERDX_API_PORT}
    # truncated for brevity

  otel-collector:
    image: ${OTEL_COLLECTOR_IMAGE_NAME_DOCKERHUB}:${IMAGE_VERSION}
    environment:
      OTEL_AGENT_FEATURE_GATE_ARG: '--feature-gates=clickhouse.json' # enable JSON
      CLICKHOUSE_ENDPOINT: 'tcp://ch-server:9000?dial_timeout=10s' 
      # truncated for brevity
```
