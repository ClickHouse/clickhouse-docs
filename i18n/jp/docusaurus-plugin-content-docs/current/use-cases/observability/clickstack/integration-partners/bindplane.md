---
slug: /use-cases/observability/clickstack/integration-partners/bindplane
title: 'Bindplane を使用して ClickStack に OpenTelemetry を送信する'
sidebar_label: 'Bindplane'
pagination_prev: null
pagination_next: null
description: 'Bindplane を使用してテレメトリを ClickStack にルーティングし、コレクターの管理を一元化します'
doc_type: 'guide'
keywords: ['Bindplane', 'OTEL', 'ClickStack', 'OpenTelemetry', 'コレクター管理']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import bindplane_hyperdx from '@site/static/images/clickstack/bindplane/bindplane-hyperdx.png';
import bindplane_configuration from '@site/static/images/clickstack/bindplane/bindplane-configuration.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Bindplane を使って OpenTelemetry を ClickStack に送信する {#bindplane-clickstack}

<PartnerBadge/>

:::note[要約]
このガイドでは、Bindplane のネイティブな ClickStack 宛先を使用して、テレメトリを ClickStack にルーティングする方法を説明します。次のことを行えるようになります。

- Bindplane で ClickStack を宛先として設定する
- テレメトリを処理してルーティングするコンフィグレーションを作成する
- コンフィグレーションをリモートで OTel collector にデプロイし、データ収集を開始する
- ClickStack でテレメトリを確認する

この連携により、ClickStack の高性能なインジェスト機能と Bindplane による collector の集中管理が組み合わさり、運用負荷を増やすことなくオブザーバビリティをスケールしやすくなります。

所要時間: 10〜15 分
:::

## Bindplane とは {#what-is-bindplane}

Bindplane は、OpenTelemetry Collector を集中管理するための、OpenTelemetry ネイティブなテレメトリパイプラインです。設定のビジュアル編集、安全なロールアウト、およびパイプラインインテリジェンスを提供することで、大規模な Collector 群の運用を簡素化します。

## なぜ Bindplane + ClickStack なのか {#why-bindplane-clickstack}

大規模環境では、多数の OpenTelemetry Collector 群の管理が運用上のボトルネックになります。ClickStack は極めて大きなインジェスト量を処理できることが実証されており、実際にお客様は毎秒ギガバイト単位のテレメトリを取り込み、数百 PB を保存しています。課題はクエリ性能から、ClickHouse にデータを送り込む Collector 基盤をいかに安定して運用するかへとシフトします。

Bindplane は次の方法でこの課題を解決します:

- 数千から 100 万を超える OpenTelemetry Collector を集中管理可能
- 安全なワンクリック・ロールアウトが可能なビジュアルな設定編集
- ClickStack に届く前のデータに対し、一貫して適用される自動リソース検出とメタデータ付与
- ファンアウト・ルーティングにより、同じテレメトリストリームを ClickStack と他の宛先へ同時に送信可能
- Collector のヘルス、スループット、エンドツーエンド性能を含むパイプライン全体の可視化

:::tip 重要なポイント

- **ClickStack は極めて大きなインジェスト量とストレージ、そして高速な分析クエリを処理できる**
- **Bindplane はインジェストパイプラインと、Collector 群を運用する際の複雑さを管理する**
:::

## 前提条件 {#prerequisites}

- ClickStack インスタンスが実行中であること（ローカル、Server、または ClickHouse Cloud）
- Bindplane アカウント（[`app.bindplane.com` でアカウントを作成](https://app.bindplane.com)）
- Bindplane OTel Collector がインストール済みであること（[Install Your First Collector](https://docs.bindplane.com/readme/install-your-first-collector) を参照）
- Bindplane コレクターから ClickStack の OTLP エンドポイントへのネットワーク接続が確立されていること
- ClickStack API Ingestion Key（ClickStack の Team Settings > API Keys にあります。参考として[こちらのドキュメント](/docs/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-otel-data)を参照）
- 適切なネットワークポートが開いていること（HTTP(S) 用に `4318`、gRPC 用に `4317`）

## Bindplane と ClickStack を統合する {#integrate-bindplane-clickstack}

<VerticalStepper headerLevel="h4">

#### ClickStack を宛先として構成する {#configure-destination}

1. Bindplane アカウントにログインします
2. **Library** に移動します
3. **Add Destination** をクリックします
4. 利用可能な宛先の一覧から **ClickStack** を選択します
5. 接続を構成します:
   - **Protocol**: HTTP または gRPC を選択します (デフォルト: ポート `4318` 上の HTTP)
   - **Hostname**: ClickStack の OTLP エンドポイントのホスト名または IP アドレスを入力します
   - **Port**: ポートを入力します (HTTP の場合は `4318`、gRPC の場合は `4317`)
   - **API Ingestion Key**: ClickStack の API インジェストキーを入力します
6. 宛先に名前を付けます (例: "ClickStack Production")
7. **Save** をクリックして宛先を作成します

:::tip 重要なポイント
ClickStack 宛先は HTTP と gRPC の両方のプロトコルをサポートしています。高ボリュームなシナリオでは、圧縮 (gzip、zstd、snappy) を伴う gRPC を使用することで、より高いパフォーマンスが期待できます。
:::

#### 構成を作成する {#create-configuration}

ClickStack 宛先を構成したら、テレメトリを処理およびルーティングするための構成を作成します:

1. **Configurations** → **Create Configuration** に移動します
2. 構成に名前を付けます (例: "ClickStack Pipeline")
3. デプロイメント用の **Collector Type** と **Platform** を選択します
4. ソースを追加します:
   - **Add Source** をクリックして、80 以上の利用可能なソースから選択します
   - テスト目的では、トラフィックをシミュレートするテレメトリジェネレーターソースを追加できます
   - 本番環境では、実際のテレメトリ (ログ、メトリクス、トレース) 用のソースを追加します
5. ClickStack 宛先を追加します:
   - **Add Destination** をクリックします
   - 先ほど作成した ClickStack 宛先を選択します
   - 送信するテレメトリタイプ (Logs、Metrics、Traces、またはそのすべて) を選択します

:::tip 重要なポイント
ClickStack に到達する前にテレメトリを整形するために、フィルタリング、サンプリング、マスキング、エンリッチメント、バッチ処理などのプロセッサを追加できます。これにより、一貫性のある構造化データが ClickHouse に到達することが保証されます。
:::

#### プロセッサを追加する (オプション) {#add-processors}

Bindplane はパイプラインインテリジェンスを備えており、プロセッサの推奨も提供します。次の目的でプロセッサを追加できます:

- **Filter**: 不要なテレメトリを除外してデータ量を削減します
- **Sample**: 高ボリュームなトレースにサンプリング戦略を適用します
- **Enrich**: リソース属性、ラベル、またはメタデータを追加します
- **Transform**: テレメトリの構造や内容を変更します
- **Batch**: 効率的な送信のためにバッチサイズを最適化します

これらのプロセッサは、データが ClickStack に到達する前に、コレクタフリート全体に対して一貫して適用されます。

#### コレクタをデプロイしてロールアウトを開始する {#deploy-collectors}

1. 構成にコレクタ (BDOT Collector) を追加します:
   - Bindplane で **Agents** に移動します
   - 対象システムに Bindplane コレクタをインストールします ([Bindplane のインストール手順](https://docs.bindplane.com/readme/install-your-first-collector) に従います)
   - 接続されると、コレクタはコレクタ一覧に表示されます

2. 構成をコレクタに割り当てます:
   - 使用するコレクタを選択します
   - それらに ClickStack 構成を割り当てます

3. ロールアウトを開始します:
   - **Start Rollout** をクリックして構成をデプロイします
   - Bindplane はロールアウト前に構成を検証します
   - Bindplane UI でロールアウト状況を監視します

:::tip 重要なポイント
Bindplane は検証付きの安全なワンクリックロールアウトを提供します。Bindplane インターフェイスから、コレクタの健全性、スループット、およびエラーをリアルタイムで監視できます。
:::

<Image img={bindplane_configuration} alt="Bindplane 経由で ClickStack に送信されるテレメトリシグナル" size="lg"/>

#### ClickStack でテレメトリを検証する {#verify-telemetry}

構成がロールアウトされると、管理されたコレクタフリートから ClickStack へのテレメトリのフローが開始されます:

1. ClickStack インスタンス (HyperDX UI) にログインします
2. **Logs**、**Metrics**、または **Traces** エクスプローラーに移動します
3. Bindplane 管理下のコレクタからのテレメトリデータが表示されるはずです
4. ClickStack に到着するデータは、すでに Bindplane のプロセッサによってエンリッチされ、構造化されています

<Image img={bindplane_hyperdx} alt="Bindplane 経由で ClickStack に表示されるテレメトリシグナル" size="lg"/>

</VerticalStepper>

## 高度な設定 {#advanced-configuration}

### ファンアウトルーティング {#fan-out-routing}

Bindplane はファンアウトルーティングをサポートしており、同じテレメトリストリームを複数の宛先に同時に送信できます。次のことが可能です:

- ログ、メトリクス、トレースを ClickStack に送信し、長期保管と分析に利用する
- 同じデータを他のオブザーバビリティプラットフォームにルーティングし、リアルタイムなアラートに利用する
- 特定のテレメトリを SIEM プラットフォームに転送し、セキュリティ分析に利用する

これは、Bindplane の設定に複数の宛先を追加することで構成します。

### 圧縮とパフォーマンス {#compression}

高トラフィックな環境では、ClickStack の送信先で圧縮を設定します：

- **HTTP**: gzip、deflate、snappy、zstd、または none をサポート（デフォルト：gzip）
- **gRPC**: gzip、snappy、zstd、または none をサポート（デフォルト：gzip）

圧縮を有効にすると、特に大規模環境で ClickStack にテレメトリを送信する際の帯域幅使用量を削減できます。

## 次のステップ {#next-steps}

Bindplane から ClickStack へテレメトリが流れるようになったので、次のことを実行できます:

- **ダッシュボードを構築する**: ClickStack（HyperDX）でログ、メトリクス、トレースの可視化を作成する
- **アラートを設定する**: 重大な状態に備えたアラートを ClickStack 上で設定する
- **デプロイメントをスケールする**: オブザーバビリティのニーズの増加に応じてコレクターやソースを追加する
- **パイプラインを最適化する**: Bindplane のパイプラインインテリジェンスを使用して最適化の機会を特定する

## さらに詳しく学ぶ {#read-more}

* [Bindplane ドキュメントの ClickStack 連携](https://docs.bindplane.com/integrations/destinations/clickstack)

{/* - [Bindplane ブログ「Bindplane + ClickStack の統合: OpenTelemetry (OTel) を ClickStack に送信する」](tbd) -- 公開後にリンクを追加します */ }
