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
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

ClickStack のアーキテクチャは、3 つの中核コンポーネントである **ClickHouse**、**HyperDX**、そして **OpenTelemetry (OTel) コレクター**を中心に構成されています。**MongoDB** インスタンスはアプリケーション状態のストレージとして機能します。これらを組み合わせることで、ログ、メトリクス、トレースに最適化された高性能なオープンソースのオブザーバビリティスタックが実現されます。


## アーキテクチャの概要 {#architecture-overview}

<Image img={architecture} alt="アーキテクチャ" size="lg"/>

## ClickHouse: データベースエンジン {#clickhouse}

ClickStack の中核となるのが ClickHouse であり、大規模なリアルタイム分析向けに設計されたカラム指向データベースです。オブザーバビリティデータのインジェストとクエリ処理を担い、次のことを可能にします:

- テラバイト規模のイベントをサブ秒レイテンシで検索
- 1 日あたり数十億件規模の高カーディナリティレコードのインジェスト
- オブザーバビリティデータに対する少なくとも 10 倍の高い圧縮率
- 動的なスキーマ進化を可能にする、半構造化 JSON データのネイティブサポート
- 何百もの組み込み分析関数を備えた強力な SQL エンジン

ClickHouse はオブザーバビリティデータを「ワイドイベント」として扱うことで、ログ、メトリクス、トレース間の深い相関を、単一の統合された構造で実現します。

## OpenTelemetry collector: data ingestion {#open-telemetry-collector}

ClickStack には、オープンで標準化された方法でテレメトリーを取り込むための、事前構成済みの OpenTelemetry (OTel) コレクターが含まれています。OTLP プロトコルを使用して、次のいずれかの経路でデータを送信できます：

- gRPC（ポート `4317`）
- HTTP（ポート `4318`）

コレクターはテレメトリーを効率的なバッチ単位で ClickHouse にエクスポートします。データソースごとに最適化されたテーブルスキーマをサポートし、すべてのシグナル種別にわたってスケーラブルなパフォーマンスを実現します。

## HyperDX: the interface {#hyperdx}

HyperDX は ClickStack のユーザーインターフェースです。次の機能を提供します。

- 自然言語および Lucene 互換の検索
- リアルタイムデバッグのためのライブテール
- ログ・メトリクス・トレースの統合ビュー
- フロントエンド観測性のためのセッションリプレイ
- ダッシュボード作成およびアラート設定
- 高度な分析のための SQL クエリインターフェース

ClickHouse 向けに専用設計された HyperDX は、強力な検索機能と直感的なワークフローを組み合わせることで、異常を検知し、問題を調査し、迅速にインサイトを得られるようにします。 

## MongoDB: アプリケーション状態 {#mongo}

ClickStack は MongoDB を使用して、次のようなアプリケーションレベルの状態を保存します。

- ダッシュボード
- アラート
- ユーザープロフィール
- 保存済みの可視化

状態をイベントデータから分離することで、パフォーマンスとスケーラビリティを確保しつつ、バックアップおよび設定を簡素化します。

このモジュール化されたアーキテクチャにより、ClickStack は高速で柔軟かつオープンソースなオブザーバビリティプラットフォームを、すぐに利用可能な形で提供できます。