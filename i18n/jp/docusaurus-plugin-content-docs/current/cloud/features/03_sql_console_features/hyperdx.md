---
'sidebar_label': 'HyperDX'
'slug': '/cloud/manage/hyperdx'
'title': 'HyperDX'
'description': '提供HyperDX，ClickStack的用户界面——一个基于ClickHouse和OpenTelemetry (OTel)构建的生产级可观察性平台，统一日志、跟踪、指标和会话于一个高性能可扩展的解决方案中。'
'doc_type': 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge/>

HyperDXは、[**ClickStack**](/use-cases/observability/clickstack) のユーザーインターフェースであり、ClickHouseとOpenTelemetry (OTel) を基盤とする生産グレードの可観測性プラットフォームです。これは、ログ、トレース、メトリクス、セッションを単一の高性能ソリューションに統合します。複雑なシステムの監視とデバッグのために設計されており、ClickStackは、開発者とSREがツールを切り替えたり、タイムスタンプや相関IDを使ってデータを手動で繋ぎ合わせたりせずに、エンドツーエンドで問題を追跡できるようにします。

HyperDXは、可観測性データを探索し可視化するための専用フロントエンドであり、LuceneスタイルおよびSQLクエリ、インタラクティブダッシュボード、アラート、トレース探索などをサポートします。すべてはClickHouseをバックエンドとして最適化されています。

ClickHouse CloudのHyperDXでは、ユーザーはよりターンキーなClickStack体験を楽しむことができます。管理するインフラは不要で、別途認証を設定する必要もありません。
HyperDXはワンクリックで立ち上げることができ、あなたのデータに接続され、可観測性のインサイトに対するシームレスで安全なアクセスのためにClickHouse Cloudの認証システムに完全に統合されています。

## デプロイメント {#main-concepts}

ClickHouse CloudのHyperDXは現在プライベートプレビュー中で、組織レベルで有効にされる必要があります。有効にされると、ユーザーは任意のサービスを選択した際に、左側のメインナビゲーションメニューでHyperDXを見つけることができます。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

ClickHouse CloudのHyperDXを使用するには、専用の[はじめにガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)をお勧めします。

ClickStackに関する詳細については、[完全なドキュメント](/use-cases/observability/clickstack)を参照してください。
