---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'ClickHouse と OpenTelemetry (OTel) 上に構築された本番環境対応のオブザーバビリティ・プラットフォームである ClickStack 向けの UI、HyperDX を提供します。ログ、トレース、メトリクス、セッションを単一の高性能かつスケーラブルなソリューションとして統合します。'
doc_type: 'guide'
keywords: ['hyperdx', 'observability', 'integration', 'cloud features', 'monitoring']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX は [**ClickStack**](/use-cases/observability/clickstack) のユーザーインターフェースであり、ClickHouse と OpenTelemetry (OTel) の上に構築された本番運用グレードのオブザーバビリティプラットフォームです。ログ、トレース、メトリクス、セッションを 1 つの高性能なソリューションとして統合します。複雑なシステムのモニタリングとデバッグ向けに設計された ClickStack により、開発者と SRE は、ツール間を行き来したり、タイムスタンプや相関 ID を使って手作業でデータを突き合わせることなく、問題をエンドツーエンドでトレースできます。

HyperDX は、オブザーバビリティデータの探索と可視化に特化したフロントエンドであり、Lucene 形式および SQL クエリの両方に対応し、インタラクティブなダッシュボード、アラーティング、トレースの探索などをサポートします。これらはすべて、バックエンドとしての ClickHouse に最適化されています。

ClickHouse Cloud における HyperDX により、ユーザーはより「ターンキー」な ClickStack エクスペリエンスを得ることができます。管理すべきインフラはなく、別個の認証設定も不要です。
HyperDX はワンクリックで起動してデータに接続でき、ClickHouse Cloud の認証システムに完全に統合されているため、オブザーバビリティインサイトへシームレスかつ安全にアクセスできます。


## デプロイメント {#main-concepts}

ClickHouse CloudのHyperDXは現在プライベートプレビュー段階であり、組織レベルで有効化する必要があります。有効化すると、任意のサービスを選択した際に、左側のメインナビゲーションメニューからHyperDXを利用できるようになります。

<Image img={hyperdx_cloud} alt='ClickHouse Cloud HyperDX' size='lg' />

ClickHouse CloudでHyperDXを使い始めるには、専用の[スタートガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)をご参照ください。

ClickStackの詳細については、[完全なドキュメント](/use-cases/observability/clickstack)をご参照ください。
