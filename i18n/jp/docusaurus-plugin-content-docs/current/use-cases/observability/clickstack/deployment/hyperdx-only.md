---
slug: /use-cases/observability/clickstack/deployment/hyperdx-only
title: 'HyperDX のみ'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'HyperDX のみをデプロイする'
doc_type: 'guide'
keywords: ['HyperDX 単体デプロイ', 'HyperDX と ClickHouse の統合', 'HyperDX のみをデプロイする', 'HyperDX の Docker でのインストール', 'ClickHouse 用可視化ツール']
---

import Image from '@theme/IdealImage';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

このオプションは、すでに稼働中の ClickHouse インスタンスがあり、そこにオブザーバビリティデータまたはイベントデータが蓄積されているユーザーを対象としています。

HyperDX はスタックの他のコンポーネントとは独立して利用でき、OpenTelemetry (OTel) に限らず、あらゆるデータスキーマと互換性があります。これにより、すでに ClickHouse 上に構築済みのカスタムオブザーバビリティパイプラインにも適しています。

完全な機能を有効にするには、ダッシュボード、保存済み検索、ユーザー設定、アラートなどのアプリケーション状態を保存するための MongoDB インスタンスを用意する必要があります。

このモードでは、データのインジェストは完全にユーザー側の責任となります。独自にホストしている OpenTelemetry collector、クライアントライブラリからの直接インジェスト、Kafka や S3 などの ClickHouse ネイティブテーブルエンジン、ETL パイプライン、あるいは ClickPipes のようなマネージドインジェストサービスを使用して、データを ClickHouse に取り込むことができます。このアプローチは柔軟性が最も高く、すでに ClickHouse を運用していて、その上に HyperDX を重ねて可視化、検索、アラートを実現したいチームに適しています。

### 適しているユースケース

* 既存の ClickHouse ユーザー
* カスタムイベントパイプライン


## デプロイ手順 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### Docker を使用してデプロイする {#deploy-hyperdx-with-docker}

必要に応じて `YOUR_MONGODB_URI` を変更し、次のコマンドを実行します。 

```shell
docker run -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```

### HyperDX UI に移動する {#navigate-to-hyperdx-ui}

[http://localhost:8080](http://localhost:8080) にアクセスして、HyperDX UI を開きます。

要件を満たすユーザー名とパスワードを入力してユーザーを作成します。 

`Create` をクリックすると、接続情報の入力を求められます。

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

### 接続情報を入力する {#complete-connection-details}

ClickHouse Cloud などの外部 ClickHouse クラスターに接続します。

<Image img={hyperdx_2} alt="HyperDX ログイン" size="md"/>

ソースの作成を求められた場合は、すべてのデフォルト値をそのまま使用し、`Table` フィールドに `otel_logs` を入力します。その他の設定は自動検出されるはずなので、`Save New Source` をクリックします。

:::note ソースの作成
ソースを作成するには、ClickHouse にテーブルが存在している必要があります。データがない場合は、テーブルを作成するために ClickStack の OpenTelemetry コレクターをデプロイすることを推奨します。
:::

</VerticalStepper>



## Docker Compose の使用 {#using-docker-compose}

ユーザーは、[Docker Compose 構成](/use-cases/observability/clickstack/deployment/docker-compose) を変更することで、マニフェストから OTel collector と ClickHouse インスタンスを削除し、本ガイドと同等の効果を得ることができます。



## ClickStack OpenTelemetry collector

スタック内の他のコンポーネントとは独立して独自の OpenTelemetry collector を運用している場合でも、ClickStack ディストリビューションの collector を使用することを推奨します。これにより、デフォルトのスキーマが使用され、インジェストのベストプラクティスが適用されます。

スタンドアロンの collector のデプロイと設定の詳細については、[&quot;Ingesting with OpenTelemetry&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#modifying-otel-collector-configuration) を参照してください。

<JSONSupport />

HyperDX 専用イメージの場合、`BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメータを設定するだけで十分です。例:

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -e MONGO_URI=mongodb://YOUR_MONGODB_URI -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx
```
