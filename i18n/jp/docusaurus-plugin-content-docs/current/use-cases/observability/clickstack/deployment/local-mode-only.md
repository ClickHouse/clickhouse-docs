---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: 'ローカルモードのみ'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'ローカルモードのみで ClickStack をデプロイ - ClickHouse Observability スタック'
doc_type: 'ガイド'
keywords: ['clickstack', 'デプロイメント', 'セットアップ', '構成', '可観測性']
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

[all-in-one image](/use-cases/observability/clickstack/deployment/docker-compose) と同様に、この包括的な Docker イメージには、すべての ClickStack コンポーネントが含まれています：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**（ポート `4317` および `4318` で OTLP を公開）
* **MongoDB**（アプリケーション状態の永続化用）

**ただし、この HyperDX のディストリビューションではユーザー認証は無効になっています**


### 適した用途 {#suitable-for}

* デモ
* デバッグ
* HyperDX を用いた開発

## デプロイ手順

<br />

<VerticalStepper headerLevel="h3">
  ### Docker を使用してデプロイする

  ローカルモードでは、HyperDX UI がポート 8080 で動作します。

  ```shell
  docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
  ```

  ### HyperDX UI にアクセスする

  [http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を開きます。

  **このデプロイモードでは認証が有効になっていないため、ユーザーアカウントの作成を求められることはありません。**

  ClickHouse Cloud など、ご自身の外部 ClickHouse クラスターに接続します。

  <Image img={hyperdx_2} alt="ログイン作成" size="md" />

  ソースを作成し、デフォルト値はすべてそのまま保持したうえで、`Table` フィールドに `otel_logs` を設定します。その他の設定は自動検出されるため、`Save New Source` をクリックできます。

  <Image img={hyperdx_logs} alt="ログソースの作成" size="md" />
</VerticalStepper>

<JSONSupport />

ローカルモード専用イメージを使用する場合、ユーザーは `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` パラメーターだけを設定すればよく、例えば次のように指定します。

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```
