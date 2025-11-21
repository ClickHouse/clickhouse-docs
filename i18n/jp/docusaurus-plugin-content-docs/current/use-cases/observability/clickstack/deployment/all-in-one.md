---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: "オールインワン"
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: "オールインワンでClickStackをデプロイする - ClickHouse Observability Stack"
doc_type: "guide"
keywords: ["ClickStack", "observability", "all-in-one", "deployment"]
---

import JSONSupport from "@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md"
import Image from "@theme/IdealImage"
import hyperdx_login from "@site/static/images/use-cases/observability/hyperdx-login.png"
import hyperdx_logs from "@site/static/images/use-cases/observability/hyperdx-logs.png"

この包括的なDockerイメージには、すべてのClickStackコンポーネントがバンドルされています：

- **ClickHouse**
- **HyperDX**
- **OpenTelemetry (OTel) コレクター**（ポート`4317`および`4318`でOTLPを公開）
- **MongoDB**（永続的なアプリケーション状態の保存用）

このオプションには認証機能が含まれており、ダッシュボード、アラート、保存された検索をセッションおよびユーザー間で永続化することができます。

### 適用対象 {#suitable-for}

- デモ
- フルスタックのローカルテスト


## デプロイ手順 {#deployment-steps}

<br />

<VerticalStepper headerLevel="h3">

### Dockerでデプロイする {#deploy-with-docker}

以下のコマンドは、OpenTelemetryコレクター(ポート4317および4318)とHyperDX UI(ポート8080)を起動します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### HyperDX UIにアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。

要件を満たすユーザー名とパスワードを入力してユーザーを作成します。

`Create`をクリックすると、統合されたClickHouseインスタンス用のデータソースが作成されます。

<Image img={hyperdx_login} alt='HyperDX UI' size='lg' />

別のClickHouseインスタンスを使用する例については、["ClickHouse Cloud接続を作成する"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

### データを取り込む {#ingest-data}

データを取り込むには、["データの取り込み"](/use-cases/observability/clickstack/ingesting-data)を参照してください。

</VerticalStepper>


## データと設定の永続化 {#persisting-data-and-settings}

コンテナの再起動後もデータと設定を永続化するには、上記のdockerコマンドを変更して、パス `/data/db`、`/var/lib/clickhouse`、および `/var/log/clickhouse-server` をマウントしてください。例:


```shell
# ディレクトリの存在を確認
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# パスをマウントするようにコマンドを変更
docker run \
  -p 8080:8080 \
  -p 4317:4317 \
  -p 4318:4318 \
  -v "$(pwd)/.volumes/db:/data/db" \
  -v "$(pwd)/.volumes/ch_data:/var/lib/clickhouse" \
  -v "$(pwd)/.volumes/ch_logs:/var/log/clickhouse-server" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## 本番環境へのデプロイ {#deploying-to-production}

このオプションは、以下の理由により本番環境へのデプロイには適していません：

- **非永続的ストレージ：** すべてのデータはDockerネイティブのオーバーレイファイルシステムを使用して保存されます。この構成では大規模環境でのパフォーマンスがサポートされず、ユーザーが[必要なファイルパスをマウント](#persisting-data-and-settings)しない限り、コンテナの削除または再起動時にデータが失われます。
- **コンポーネントの分離の欠如：** すべてのコンポーネントが単一のDockerコンテナ内で実行されます。これにより、独立したスケーリングと監視が妨げられ、すべてのプロセスに対して`cgroup`の制限がグローバルに適用されます。その結果、コンポーネント間でCPUとメモリのリソース競合が発生する可能性があります。


## ポートのカスタマイズ {#customizing-ports-deploy}

HyperDX Localが使用するアプリケーションポート（8080）またはAPIポート（8000）をカスタマイズする必要がある場合は、`docker run`コマンドを変更して適切なポートをフォワードし、いくつかの環境変数を設定する必要があります。

OpenTelemetryポートのカスタマイズは、ポートフォワーディングフラグを変更するだけで行えます。例えば、`-p 4318:4318`を`-p 4999:4318`に置き換えることで、OpenTelemetry HTTPポートを4999に変更できます。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```


## ClickHouse Cloudの使用 {#using-clickhouse-cloud}

このディストリビューションはClickHouse Cloudと併用できます。ローカルのClickHouseインスタンスは引き続きデプロイされます(ただし使用されません)が、環境変数`CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`を設定することで、OTelコレクターをClickHouse Cloudインスタンスを使用するように構成できます。

例:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT`には、ポート`8443`を含むClickHouse CloudのHTTPSエンドポイントを指定する必要があります。例:`https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443`

HyperDX UIに接続したら、[`Team Settings`](http://localhost:8080/team)に移動し、ClickHouse Cloudサービスへの接続を作成した後、必要なソースを設定します。フローの例については、[こちら](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。


## OpenTelemetryコレクターの設定 {#configuring-collector}

必要に応じてOTelコレクターの設定を変更できます。詳細は["設定の変更"](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration)を参照してください。

<JSONSupport />

例:

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
