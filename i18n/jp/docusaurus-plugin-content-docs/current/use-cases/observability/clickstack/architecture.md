---
slug: /use-cases/observability/clickstack/architecture
pagination_prev: null
pagination_next: null
description: 'ClickStack のアーキテクチャ - ClickHouse のオブザーバビリティスタック'
title: 'アーキテクチャ'
doc_type: 'reference'
keywords: ['ClickStack アーキテクチャ', 'オブザーバビリティアーキテクチャ', 'HyperDX', 'OpenTelemetry コレクター', 'MongoDB', 'システム設計']
---

import Image from '@theme/IdealImage';
import oss_architecture from '@site/static/images/use-cases/observability/clickstack-oss-architecture.png';
import managed_architecture from '@site/static/images/use-cases/observability/clickstack-managed-architecture.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack のアーキテクチャは、デプロイ方法によって異なります。すべてのコンポーネントをセルフマネージドで運用する **ClickStack Open Source** と、ClickHouse と HyperDX UI が ClickHouse Cloud 上でホストおよび運用される **Managed ClickStack** の間には、重要なアーキテクチャ上の違いがあります。どちらのモデルでも中核コンポーネントそのものは同一ですが、各コンポーネントのホスティング、スケーリング、およびセキュリティ確保に関する責任の所在が異なります。

<Tabs groupId="architectures">
  <TabItem value="managed-clickstack" label="マネージド ClickStack" default>
    Managed ClickStack は **ClickHouse Cloud** 内だけで動作し、同じ ClickStack のデータモデルとユーザーエクスペリエンスを維持しつつ、フルマネージドなオブザーバビリティ基盤を提供します。

    このモデルでは、**ClickHouse および ClickStack UI (HyperDX)** は ClickHouse Cloud によってホスト・運用・セキュリティ保護されます。ユーザーは、マネージドサービスにテレメトリデータを送信するための **OpenTelemetry (OTel) collector** の運用だけを担当します。

    <Image img={managed_architecture} alt="マネージドアーキテクチャ" size="lg" />

    ## ClickHouse Cloud: エンジン \{#clickhouse-cloud\}

    Managed ClickStack の中核にあるのは ClickHouse Cloud です。これは ClickHouse のサーバーレス版であり、大規模なリアルタイム分析向けに設計されたカラム指向データベースです。ClickHouse Cloud はオブザーバビリティデータのインジェストとクエリ処理を担い、次のことを可能にします:

    * テラバイト規模のイベントに対するサブ秒レイテンシの検索
    * 1 日あたり数十億件規模の高カーディナリティレコードのインジェスト
    * オブザーバビリティデータに対する少なくとも 10 倍の高圧縮率
    * 動的なスキーマ進化を可能にする、半構造化 JSON データのネイティブサポート
    * 何百ものビルトイン分析関数を備えた強力な SQL エンジン

    ClickHouse Cloud はオブザーバビリティデータをワイドイベントとして扱い、単一の統一構造の中でログ・メトリクス・トレース間の深い相関付けを可能にします。

    ClickHouse オープンソース版に加えて、オブザーバビリティ用途向けに次のような利点を提供します:

    * ストレージと独立したコンピュートリソースの自動スケーリング
    * オブジェクトストレージに基づく、低コストかつ実質的に無制限の保持期間
    * Warehouse を用いた読み取りおよび書き込みワークロードの独立分離
    * 統合認証
    * 自動バックアップ
    * セキュリティおよびコンプライアンス機能
    * シームレスなアップグレード

    ## OpenTelemetry collector: データインジェスト \{#open-telemetry-collector-managed\}

    ClickStack Managed には、標準化されたオープンな方法でテレメトリをインジェストするための事前構成済みの OpenTelemetry (OTel) collector が含まれます。OTLP プロトコルを使用して、次の方法でデータを送信できます:

    * gRPC (ポート `4317`)
    * HTTP (ポート `4318`)

    collector は、効率的なバッチでテレメトリを ClickHouse Cloud にエクスポートします。データソースごとに最適化されたテーブルスキーマをサポートし、すべてのシグナルタイプにわたるスケーラブルなパフォーマンスを実現します。

    **このアーキテクチャコンポーネントはユーザーが管理します**

    ## ClickStack UI (HyperDX): インターフェース \{#hyperdx\}

    ClickStack UI (HyperDX) は ClickStack のユーザーインターフェースです。次の機能を提供します:

    * 自然言語および Lucene スタイルの検索機能
    * リアルタイムデバッグのためのライブテーリング
    * ログ、メトリクス、トレースの統合ビュー
    * フロントエンドのオブザーバビリティのためのセッションリプレイ
    * ダッシュボード作成およびアラート設定
    * 高度な分析のための SQL クエリインターフェース

    HyperDX は ClickHouse 向けに特別に設計されており、強力な検索機能と直感的なワークフローを組み合わせて、異常の検出、問題の調査、洞察の迅速な獲得を可能にします。

    Managed ClickStack では、UI は ClickHouse Cloud コンソールの認証システムに統合されています。
  </TabItem>

  <TabItem value="oss-clickstack" label="オープンソース版 ClickStack">
    ClickStack のオープンソースアーキテクチャは、3 つのコアコンポーネント **ClickHouse**、**HyperDX**、そして **OpenTelemetry (OTel) collector** を中心に構成されています。**MongoDB** インスタンスはアプリケーション状態のストレージを提供します。これらを組み合わせることで、ログ・メトリクス・トレースに最適化された高性能なオープンソースのオブザーバビリティスタックを実現します。

    ## アーキテクチャ概要 \{#architecture-overview\}

    <Image img={oss_architecture} alt="Architecture" size="lg" />

    ## ClickHouse: データベースエンジン \{#clickhouse\}

    ClickStack の中核にあるのは ClickHouse であり、リアルタイム分析向けに設計されたカラム指向データベースです。オブザーバビリティデータのインジェストとクエリ処理を担い、次のことを可能にします:

    * テラバイト級イベントに対するサブセカンド検索
    * 1 日あたり数十億件規模の高カーディナリティレコードのインジェスト
    * オブザーバビリティデータに対する少なくとも 10 倍の高い圧縮率
    * 動的なスキーマ進化を可能にする、半構造化 JSON データのネイティブサポート
    * 何百ものビルトイン分析関数を備えた強力な SQL エンジン

    ClickHouse はオブザーバビリティデータをワイドイベントとして扱い、単一の統一構造内でログ、メトリクス、トレース間の深い相関を可能にします。

    ## OpenTelemetry collector: データインジェスト \{#open-telemetry-collector\}

    ClickStack には、オープンで標準化された方法でテレメトリを取り込むための事前設定済み OpenTelemetry (OTel) collector が含まれています。OTLP プロトコルを使用して、次の経路でデータを送信できます:

    * gRPC (ポート `4317`)
    * HTTP (ポート `4318`)

    collector は ClickHouse へテレメトリを効率的なバッチでエクスポートします。データソースごとに最適化されたテーブルスキーマをサポートし、すべてのシグナルタイプにわたってスケーラブルなパフォーマンスを実現します。

    ## ClickStack UI (HyperDX): インターフェース \{#hyperdx-ui\}

    ClickStack UI (HyperDX) は ClickStack のユーザーインターフェースです。以下を提供します:

    * 自然言語および Lucene スタイルの検索
    * リアルタイムデバッグのためのライブテーリング
    * ログ・メトリクス・トレースの統合ビュー
    * フロントエンドオブザーバビリティ向けのセッションリプレイ
    * ダッシュボード作成とアラート設定
    * 詳細な分析のための SQL クエリインターフェース

    ClickHouse 向けに特別に設計された HyperDX は、強力な検索機能と直感的なワークフローを組み合わせることで、異常の検知、問題の調査、インサイトの獲得を迅速に行えるようにします。

    ## MongoDB: アプリケーション状態 \{#mongo\}

    ClickStack は MongoDB を使用して、次のようなアプリケーションレベルの状態を保存します:

    * ダッシュボード
    * アラート
    * ユーザープロファイル
    * 保存された可視化

    イベントデータから状態を分離することで、パフォーマンスとスケーラビリティを確保しつつ、バックアップと構成を簡素化します。

    このモジュラーアーキテクチャにより、ClickStack は高速・柔軟・オープンソースな、すぐに利用可能なオブザーバビリティプラットフォームを提供します。
  </TabItem>
</Tabs>