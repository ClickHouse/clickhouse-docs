---
slug: /use-cases/observability/clickstack/integration-partners/odigos
title: 'Odigos で OpenTelemetry を ClickStack に OTLP 経由で送信する'
sidebar_label: 'Odigos'
pagination_prev: null
pagination_next: null
description: 'Odigos で Kubernetes ワークロードを自動インストルメンテーションし、OTLP 経由でテレメトリーを ClickStack にエクスポート'
doc_type: 'guide'
keywords: ['Odigos', 'ClickStack', 'ClickHouse', 'OpenTelemetry', 'eBPF', '自動インストルメンテーション']
---

import PartnerBadge from '@theme/badges/PartnerBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<PartnerBadge />

:::note[要点]
このガイドでは、Odigos のテレメトリーを ClickStack にエクスポートする方法を説明します。以下の内容を学べます。

* Helm を使用して Kubernetes に Odigos をデプロイする
* Odigos UI でログソースを追加する
* ClickStack を指定した OTLP HTTP 宛先を追加する
* ClickStack でログ、メトリクス、トレースを確認する

Odigos は、コードを変更したり再起動したりすることなく、アプリケーションを自動計装します。ClickStack は、そのデータを ClickHouse に保存し、クエリを実行できます。

所要時間: 10〜20分
:::

{/* vale off */ }

## Odigos とは？ \{#what-is-odigos\}

{/* vale on */ }

[Odigos](https://odigos.io/) は、**eBPF** を使ってカーネルレベルでアプリケーションをインストルメンテーションする、Kubernetes と VM 向けのインストルメンテーションのコントロールプレーンです。収集処理はカーネル内で実行されるため、アプリのオーバーヘッドを低く抑えつつ、高い可観測性を確保できます。アプリケーションコードに新たなエージェントを組み込んだり、すべてのサービスでライブラリのアップグレードを待ったりしなくても、本番環境で使える OpenTelemetry のトレース、メトリクス、ログ、プロファイルを取得できます。

この eBPF レイヤーによって、大規模環境でも深く一貫したテレメトリーを実現できます。Odigos は必要に応じて、問題のデバッグやトラブルシューティングを支援するため、より詳細なインストルメンテーションを自動的に有効化または無効化できます。

* **コードレベルのコンテキスト** — 関数やランタイムの挙動に結び付いた属性
* **HTTP トラフィック** — サービス間を流れるリクエストとレスポンス
* **メッセージングシステム** — Kafka や同様のブローカーからのペイロードやメッセージ
* **エラーの詳細** — 障害発生時のスタックトレース
* **カスタムインストルメンテーション** — コード変更や再起動なしで、自動インストルメンテーションの対象外になる部分までカバレッジを拡張

Odigos はバックグラウンドで、クラスター向けの完全な OpenTelemetry パイプラインを作成・管理します。これには、負荷に応じてスケールする collector、選択したバックエンドへのルーティング、UI で制御できるパイプラインロジックが含まれます。データ量を管理するための **sampling**、機微なデータがエクスポートに含まれないようにする **PII masking**、さらにテレメトリーがクラスター外に出る前にフィルタリング、変換、または拡充するための **OTTL rules** を定義できます。

{/* vale off */ }

## Odigos + ClickStack を選ぶ理由 \{#why-odigos-clickstack\}

{/* vale on */ }

多数のサービスに OpenTelemetry を展開するには時間がかかりがちで、アプリケーション内部の可視性も表層的なものにとどまりやすくなります。Odigos は、より深いテレメトリーを得るための eBPF インストルメンテーションと Kubernetes 上での collector 運用を担い、ClickStack は ClickHouse をバックエンドとするストレージと、大規模なテレメトリーをクエリするための HyperDX UI を提供します。

:::tip[重要なポイント]

* **Odigos** は、再起動なしであらゆる Kubernetes ワークロードに自動でインストルメンテーションを適用し、OpenTelemetry パイプラインも自動的に管理します。
* **ClickStack** は、ログ、メトリクス、トレースを ClickHouse に保存し、HyperDX で可視化します。
  :::

## 前提条件 \{#prerequisites\}

* Kubernetes クラスターから到達可能な **ClickStack** がインストールされていること。[オープンソース版 ClickStack の Getting Started](/use-cases/observability/clickstack/getting-started/oss) または [Managed ClickStack の Getting Started](/use-cases/observability/clickstack/getting-started/managed) を参照してください。
* ClickStack の **OTLP HTTP エンドポイント** (ポート `4318`) と、Odigos が `Authorization` ヘッダーで渡す認証値。オープンソース版 ClickStack の場合、これは HyperDX UI の **Team Settings → API Keys** にある **API ingestion key** です。Managed ClickStack の場合、これは独自の standalone ClickStack collector の起動時に設定する **`OTLP_AUTH_TOKEN`** です。
* **Kubernetes クラスター** (eBPF インストルメンテーションには、カーネル 4.18 以降の Linux ノードが必要)
* `odigos-system` ネームスペースにインストールするための **Helm**、**kubectl**、およびクラスター認証情報
* **Odigos Enterprise オンプレミス トークン** — アクセスするには [Odigos team](https://odigos.io/) にお問い合わせください

{/* vale off */ }

## ClickStackとOdigosを統合する \{#integrate-odigos-clickstack\}

{/* vale on */ }

<VerticalStepper headerLevel="h4">
  #### Helmを使用したOdigosのデプロイ \{#deploy-odigos\}

  Odigos Enterpriseにはオンプレミスのライセンストークンが必要です。シェルで以下をエクスポートしてください：

  ```bash
  export ODIGOS_ONPREM_TOKEN="<your-enterprise-token>"
  ```

  または、インストール前にトークンを `odigos-pro` という名前の Kubernetes Secret に保存することもできます。詳細は [Odigos Enterprise のインストール](https://docs.odigos.io/enterprise/setup/installation)を参照してください。

  Odigos の Helm リポジトリを追加し、`odigos-system` にチャートをインストールします。

  ```bash
  helm repo add odigos https://odigos-io.github.io/odigos/
  helm repo update

  helm upgrade --install odigos odigos/odigos \
    --namespace odigos-system \
    --create-namespace \
    --set onPremToken=$ODIGOS_ONPREM_TOKEN
  ```

  `--set` フラグまたはカスタム値ファイル (`-f`) を使用して、追加の設定オーバーライドを指定できます。チャートのデフォルト値は、GitHub の [helm/odigos/values.yaml](https://github.com/odigos-io/odigos/blob/main/helm/odigos/values.yaml) を参照してください。

  Odigos のポッドが起動していることを確認します：

  ```bash
  kubectl get pods -n odigos-system
  ```

  #### Odigos UIでログソースを追加する \{#add-sources\}

  1. Odigos UIサービスをポートフォワードします:

  ```bash
  kubectl port-forward svc/ui -n odigos-system 3000:3000
  ```

  2. ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。
  3. **SOURCES** に移動し、計装したいネームスペースまたはワークロードを選択します。
  4. すべてのワークロードをインストルメンテーション対象としてマークしたら、下部の done をクリックします。
  5. 「Sources」カラムで、ワークロードのインストルメンテーションが正常に行われていることを確認します。

  #### Odigos UIでClickStackを宛先として追加する \{#add-destination-ui\}

  ClickStack にテレメトリーを送信するには、Odigos で **OTLP HTTP** の宛先を追加します。具体的な設定方法は、ClickStack のデプロイ方法によって異なります。Open Source ClickStack では OpenTelemetry Collector がバンドルされており、インジェストキーは HyperDX UI で自動生成されます。Managed ClickStack では、独自のスタンドアロン ClickStack collector を実行し、コンテナー起動時に認証トークンを自分で選択します。

  :::tip[代替手段: ClickHouse に直接書き込む]
  ClickHouse が Kubernetes クラスターから到達可能な場合は、OTLP collector を省略して、代わりに Odigos の [ネイティブ **ClickHouse** 宛先](#native-clickhouse-destination) を使用できます。これはオープンソースおよび Managed ClickStack の両方に対応しています。
  :::

  <Tabs groupId="clickstack-deployment">
    <TabItem value="oss-clickstack" label="Open Source ClickStack" default>
      Open Source ClickStack では、たとえば all-in-one イメージを使う場合、ゲートウェイ OpenTelemetry collector が含まれており、インジェスト API key は HyperDX によって自動生成されます。

      1. Odigos UI で **Add Destination** をクリックし、**OTLP HTTP** を選択します。
      2. **OTLP HTTP Endpoint** を ClickStack の collector (たとえば `http://clickstack.example.com:4318`) に設定します。endpoint の詳細は、[OpenTelemetry でインジェストする](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-data-to-collector-oss) を参照してください。
      3. ClickStack UI の **Team Settings → API Keys** からインジェスト API key をコピーします。
      4. **Headers** に以下を追加します。
         * **Key**: `Authorization`
         * **Value**: インジェスト API key
      5. **Logs**、**Metrics**、**Traces** を有効にします。
      6. 宛先を保存します。
    </TabItem>

    <TabItem value="managed-clickstack" label="Managed ClickStack">
      Managed ClickStack にはホストされた OpenTelemetry collector は含まれておらず、UI にインジェスト key も表示されません。代わりに、[ClickStack ディストリビューションの collector を standalone モードで実行](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector) し、コンテナーの起動時に `OTLP_AUTH_TOKEN` 環境変数で認証トークンを設定します。その後、Odigos は同じトークンを `Authorization` header に含めて、その collector に OTLP HTTP トラフィックを送信します。

      1. standalone モードで ClickStack collector を起動し、ClickHouse Cloud サービスを向くように設定しつつ、任意の `OTLP_AUTH_TOKEN` で保護します。

         ```shell
         export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
         export CLICKHOUSE_USER=<CLICKHOUSE_USER>
         export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
         export OTLP_AUTH_TOKEN="a_very_secure_string"

         docker run \
           -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
           -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
           -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
           -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
           -p 4317:4317 \
           -p 4318:4318 \
           clickhouse/clickstack-otel-collector:latest
         ```

         TLS、専用のインジェストユーザー、その他の本番環境向け推奨事項については、[collector の保護](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector) を参照してください。
      2. Odigos UI で **Add Destination** をクリックし、**OTLP HTTP** を選択します。
      3. **OTLP HTTP Endpoint** を、先ほど起動した standalone collector (たとえば `http://my-collector.example.com:4318`) に設定します。
      4. **Headers** に以下を追加します。
         * **Key**: `Authorization`
         * **Value**: collector に設定した `OTLP_AUTH_TOKEN` の値
      5. **Logs**、**Metrics**、**Traces** を有効にします。
      6. 宛先を保存します。

      :::note[任意: Kubernetes マニフェスト]
      UI の代わりに `Destination` マニフェストを使って同じ宛先を設定することもできます。Advanced configuration の [Kubernetes マニフェストで宛先を設定する](#destination-manifest) を参照してください。
      :::
    </TabItem>
  </Tabs>

  #### ClickStackでテレメトリーを確認する \{#verify-telemetry\}

  1. ClickStack UI (HyperDX) を開きます。
     * **Open source ClickStack**: たとえば、all-in-oneイメージでは `http://<host>:8080` です。
     * **Managed ClickStack**: [ClickHouse Cloud console](https://console.clickhouse.cloud) でサービスを開いてから、**Launch ClickStack** をクリックします。詳しくは、[ClickStack UI に移動する](/use-cases/observability/clickstack/getting-started/managed#navigate-to-clickstack-ui-cloud)を参照してください。
  2. **ログ**、**メトリクス**、**トレース**で、インストルメント化したサービスからのデータを確認してください。
  3. `odigos.version` でトレースをフィルタリングし、エンドツーエンドのエクスポートを検証します。

  データが見当たらない場合は、collector のログを確認してください: `kubectl logs deploy/odigos-gateway -n odigos-system`
</VerticalStepper>

## 高度な設定 \{#advanced-configuration\}

### HyperDX ログ正規化機能 \{#hyperdx-log-normalizer\}

OTLP HTTP 経由で ClickStack に送信する代わりに、Odigos のネイティブな **ClickHouse** 宛先を使って ClickHouse に直接エクスポートする場合は、**HyperDX ログ正規化機能** (`HYPERDX_LOG_NORMALIZER: true`) を有効にします。これにより、JSON のログ本文が解析され、ClickStack UI でより効率的にクエリできるように属性が正規化されます。

### ネイティブ ClickHouse 宛先 \{#native-clickhouse-destination\}

クラスターから ClickHouse に直接接続できる場合は、OTLP HTTP の代わりに Odigos のネイティブ **ClickHouse** 宛先を使用できます。ClickHouse のエンドポイント、データベース名、スキーマオプションは、UI またはマニフェストで設定します。詳しくは、[Odigos ClickHouse destination](https://docs.odigos.io/backends/clickhouse) を参照してください。

* **本番用スキーマ**: `CLICKHOUSE_CREATE_SCHEME` を `false` に設定し、独自の DDL を適用します。
* **TLS / 認証**: `CLICKHOUSE_TLS_ENABLED`、`CLICKHOUSE_USERNAME`、およびパスワードを格納した Kubernetes Secret を使用します。

### Kubernetesマニフェストで宛先を設定する \{#destination-manifest\}

**OTLP HTTP (ClickStack)**

```yaml
apiVersion: odigos.io/v1alpha1
kind: Destination
metadata:
  name: clickstack
  namespace: odigos-system
spec:
  type: otlphttp
  destinationName: otlphttp
  signals:
    - TRACES
    - METRICS
    - LOGS
  data:
    OTLP_HTTP_ENDPOINT: 'http://clickstack.example.com:4318'
    # API ingestion key for open source ClickStack, or OTLP_AUTH_TOKEN for Managed ClickStack
    OTLP_HTTP_HEADERS: 'Authorization:<YOUR_AUTHORIZATION_VALUE>'
```

**ClickHouse (直接接続)&#x20;**

```yaml
apiVersion: odigos.io/v1alpha1
kind: Destination
metadata:
  name: clickhouse
  namespace: odigos-system
spec:
  type: clickhouse
  destinationName: clickhouse
  signals:
    - TRACES
    - METRICS
    - LOGS
  data:
    CLICKHOUSE_ENDPOINT: 'http://clickstack.example.com:8123'
    CLICKHOUSE_DATABASE_NAME: 'otel'
    CLICKHOUSE_CREATE_SCHEME: 'true'
```

マニフェストを適用します。

```bash
kubectl apply -f destination.yaml
```

{/* vale off */ }

### Odigos VM Agent \{#odigos-vm-agent\}

{/* vale on */ }

[Odigos VM Agent](https://docs.odigos.io/vmagent/overview) は、eBPF を使用して Linux プロセス、systemd サービス、Docker コンテナーにインストルメンテーションを適用します。テレメトリーは、OTLP HTTP 経由の ClickStack を含め、クラスター ベースの Odigos と同じ宛先にエクスポートされます。

VM Agent は Odigos Pro の一部です。セットアップ、ログソース、宛先の設定については、[VM Agent の概要](https://docs.odigos.io/vmagent/overview) を参照してください。

{/* vale off */ }

### Odigos Central \{#odigos-central\}

{/* vale on */ }

[Odigos Central](https://docs.odigos.io/central/overview) は、集中管理用のコントロールプレーンです。各クラスターを個別に設定する代わりに、1 つの UI から複数の Kubernetes クラスターにわたるインストルメンテーション、宛先、パイプライン構成を管理できます。

Odigos Central は Odigos Enterprise で利用できます。マルチクラスター管理、SSO、統合サンプリングルールについては、[Central の概要](https://docs.odigos.io/central/overview) を参照してください。

## 次のステップ \{#next-steps\}

* ClickStack で**計装されたサービス全体のトレースを確認**
* Odigos がエクスポートするメトリクスの**ダッシュボードを作成**
* 保持期間やクエリパターンに合わせて、**ClickHouse のスキーマと有効期限 (TTL) を調整**

## さらに読む \{#read-more\}

* [Odigos Enterprise のインストール](https://docs.odigos.io/enterprise/setup/installation)
* [Odigos ClickHouse 宛先](https://docs.odigos.io/backends/clickhouse)
* [Odigos VM Agent の概要](https://docs.odigos.io/vmagent/overview)
* [Odigos Central の概要](https://docs.odigos.io/central/overview)
* [本番環境での勘頼みをやめる: ClickHouse と Odigos による大規模な完全忠実度トレーシング](https://clickhouse.com/blog/odigos-full-fidelity-tracing)
* [オープンソース版 ClickStack の利用を始める](/use-cases/observability/clickstack/getting-started/oss)