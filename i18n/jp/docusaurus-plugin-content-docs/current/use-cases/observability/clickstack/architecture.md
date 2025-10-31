---
'slug': '/use-cases/observability/clickstack/architecture'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackのアーキテクチャ - ClickHouse可観測スタック'
'title': 'アーキテクチャ'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

The ClickStack architecture is built around three core components: **ClickHouse**, **HyperDX**, and a **OpenTelemetry (OTel) collector**. A **MongoDB** instance provides storage for the application state. Together, they provide a high-performance, open-source observability stack optimized for logs, metrics, and traces.

## Architecture overview {#architecture-overview}

<Image img={architecture} alt="Architecture" size="lg"/>

## ClickHouse: the database engine {#clickhouse}

ClickStackの中心には、スケールにおけるリアルタイム分析のために設計された列指向データベースであるClickHouseがあります。これにより、観測データの取り込みとクエリ処理が可能になります。

- テラバイトのイベントに対する1秒未満での検索
- 毎日数十億の高カーディナリティレコードの取り込み
- 観測データの少なくとも10倍の高圧縮率
- 動的スキーマの進化を許可する半構造化JSONデータのネイティブサポート
- 数百の組み込み分析関数を備えた強力なSQLエンジン

ClickHouseは観測データを広いイベントとして処理し、単一の統一構造内でログ、メトリクス、およびトレースの深い相関を可能にします。

## OpenTelemetry collector: data ingestion {#open-telemetry-collector}

ClickStackには、オープンで標準化された方法でテレメトリを取り込むために事前に構成されたOpenTelemetry (OTel) コレクターが含まれています。ユーザーは、以下の方法でOTLPプロトコルを使用してデータを送信できます。

- gRPC (ポート `4317`)
- HTTP (ポート `4318`)

コレクターは、効率的なバッチでテレメトリをClickHouseにエクスポートします。データソースごとに最適化されたテーブルスキーマをサポートし、すべての信号タイプにわたるスケーラブルなパフォーマンスを保証します。

## HyperDX: the interface {#hyperdx}

HyperDXはClickStackのユーザーインターフェースです。以下の機能を提供します。

- 自然言語およびLuceneスタイルの検索
- リアルタイムデバッグ用のライブテーリング
- ログ、メトリクス、およびトレースの統一ビュー
- フロントエンドの観測用のセッションリプレイ
- ダッシュボードの作成およびアラート設定
- 高度な分析のためのSQLクエリインターフェース

ClickHouse専用に設計されたHyperDXは、強力な検索機能と直感的なワークフローを組み合わせており、ユーザーが異常を見つけ、問題を調査し、迅速に洞察を得られるようにします。

## MongoDB: application state {#mongo}

ClickStackは、以下のアプリケーションレベルの状態を保存するためにMongoDBを使用します。

- ダッシュボード
- アラート
- ユーザープロファイル
- 保存されたビジュアライゼーション

イベントデータから状態を分離することで、パフォーマンスとスケーラビリティが確保され、バックアップと構成が簡素化されます。

このモジュラーアーキテクチャにより、ClickStackは迅速で柔軟なオープンソースの観測プラットフォームを提供できます。
