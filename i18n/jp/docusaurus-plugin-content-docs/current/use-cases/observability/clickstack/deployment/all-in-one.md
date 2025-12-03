---
slug: /use-cases/observability/clickstack/deployment/all-in-one
title: 'オールインワン構成'
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickStack をオールインワン構成でデプロイする - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['ClickStack', 'オブザーバビリティ', 'オールインワン', 'デプロイメント']
---

import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';

この包括的な Docker イメージには、すべての ClickStack コンポーネントがバンドルされています：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**（ポート `4317` および `4318` で OTLP を公開）
* **MongoDB**（アプリケーション状態を永続化するため）

このオプションには認証が含まれており、ダッシュボード、アラート、保存済み検索をセッションやユーザーをまたいで保持できます。

### 適した用途 {#suitable-for}

* デモ
* スタック全体のローカルテスト

## デプロイ手順 {#deployment-steps}

<br/>

<VerticalStepper headerLevel="h3">

### Docker でデプロイする {#deploy-with-docker}

次のコマンドで OpenTelemetry コレクター（ポート 4317 および 4318）と HyperDX UI（ポート 8080）を起動します。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

### HyperDX UI にアクセスする {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

要件を満たすユーザー名とパスワードを指定して、ユーザーを作成します。

`Create` をクリックすると、組み込みの ClickHouse インスタンス用のデータソースが作成されます。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

別の ClickHouse インスタンスを使用する例については、「[ClickHouse Cloud 接続を作成する](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)」を参照してください。

### データを取り込む {#ingest-data}

データを取り込む方法については、「[Ingesting data](/use-cases/observability/clickstack/ingesting-data)」を参照してください。

</VerticalStepper>

## データと設定の永続化 {#persisting-data-and-settings}

コンテナの再起動後もデータと設定を保持するには、前述の docker コマンドを変更し、パス `/data/db`、`/var/lib/clickhouse`、`/var/log/clickhouse-server` をマウントするようにします。例えば、次のようになります。

```shell
# ディレクトリの存在を確認 {#ensure-directories-exist}
mkdir -p .volumes/db .volumes/ch_data .volumes/ch_logs
# パスをマウントするためにコマンドを変更 {#modify-command-to-mount-paths}
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

次の理由から、このオプションを本番環境で使用することは推奨されません。

- **永続化されないストレージ:** すべてのデータは Docker ネイティブのオーバーレイファイルシステムを使用して保存されます。この構成は大規模なワークロードで十分な性能を発揮できず、コンテナが削除または再起動された場合、ユーザーが[必要なファイルパスをマウント](#persisting-data-and-settings)しない限り、データは失われます。
- **コンポーネント分離の欠如:** すべてのコンポーネントが 1 つの Docker コンテナ内で実行されます。このため、コンポーネント単位でのスケーリングや監視ができず、任意の `cgroup` 制限がすべてのプロセスに対してグローバルに適用されます。その結果、コンポーネント間で CPU やメモリを取り合う可能性があります。

## ポートのカスタマイズ {#customizing-ports-deploy}

HyperDX Local が使用するアプリケーション (8080) や API (8000) のポートをカスタマイズする必要がある場合は、適切なポートをポートフォワーディングし、いくつかの環境変数を設定するように `docker run` コマンドを変更する必要があります。

OpenTelemetry のポートは、ポートフォワーディングのフラグを変更するだけでカスタマイズできます。たとえば、OpenTelemetry の HTTP ポートを 4999 に変更するには、`-p 4318:4318` を `-p 4999:4318` に置き換えます。

```shell
docker run -p 8080:8080 -p 4317:4317 -p 4999:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

## ClickHouse Cloud の使用 {#using-clickhouse-cloud}

このディストリビューションは ClickHouse Cloud と組み合わせて使用できます。ローカルの ClickHouse インスタンスも引き続きデプロイされますが（使用はされません）、環境変数 `CLICKHOUSE_ENDPOINT`、`CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD` を設定することで、OTel collector が ClickHouse Cloud インスタンスを使用するように構成できます。

例:

```shell
export CLICKHOUSE_ENDPOINT=<HTTPS ENDPOINT>
export CLICKHOUSE_USER=<CLICKHOUSE_USER>
export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>

docker run -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} -e CLICKHOUSE_USER=default -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```

`CLICKHOUSE_ENDPOINT` には、ポート `8443` を含む ClickHouse Cloud の HTTPS エンドポイントを指定します。例えば `https://mxl4k3ul6a.us-east-2.aws.clickhouse.com:8443` のようになります。

HyperDX UI に接続したら、[`Team Settings`](http://localhost:8080/team) に移動し、ClickHouse Cloud サービスへの接続を作成し、その後で必要なソースの設定を行います。フローの一例については[こちら](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)を参照してください。

## OpenTelemetry collector の設定 {#configuring-collector}

必要に応じて OTel collector の設定を変更できます。詳細は [&quot;設定の変更&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration) を参照してください。

<JSONSupport />

例えば、次のように設定します。

```shell
docker run -e OTEL_AGENT_FEATURE_GATE_ARG='--feature-gates=clickhouse.json' -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 -p 4317:4317 -p 4318:4318 docker.hyperdx.io/hyperdx/hyperdx-all-in-one
```
