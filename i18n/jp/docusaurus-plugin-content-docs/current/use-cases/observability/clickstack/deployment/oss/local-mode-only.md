---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: 'ローカルモードのみ'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'ClickStack をローカルモードのみでデプロイする - ClickHouse オブザーバビリティスタック'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

[オールインワンイメージ](/use-cases/observability/clickstack/deployment/docker-compose) と同様に、この包括的な Docker イメージには ClickStack のすべてのコンポーネントがバンドルされています：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) コレクター**（ポート `4317` と `4318` で OTLP を公開）
* **MongoDB**（アプリケーション状態の永続化用）

**ただし、このディストリビューションの HyperDX ではユーザー認証が無効になっています**


### 適した用途 \{#suitable-for\}

* デモ
* デバッグ
* HyperDX を利用する開発

## デプロイ手順 \{#deployment-steps\}

<br />

<VerticalStepper headerLevel="h3">
  ### Docker を使用してデプロイする

  ローカルモードでは、HyperDX UI がポート 8080 で起動します。

  ```shell
  docker run -p 8080:8080 clickhouse/clickstack-local:latest
  ```

  ### HyperDX UI にアクセスする

  [http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

  **このデプロイモードでは認証が有効化されていないため、ユーザー作成を求められることはありません。**

  外部の自前 ClickHouse クラスター（例: ClickHouse Cloud）に接続します。

  <Image img={hyperdx_2} alt="ログインを作成" size="md" />

  ソースを作成し、デフォルト値はすべて保持したまま、`Table` フィールドに `otel_logs` を入力します。他の設定は自動検出されるため、そのまま `Save New Source` をクリックします。

  <Image img={hyperdx_logs} alt="ログソースを作成" size="md" />
</VerticalStepper>

<JSONSupport />

ローカルモード専用イメージの場合、ユーザーは `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメーターだけを設定すればよく、例えば次のように指定します。

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 clickhouse/clickstack-local:latest
```
