---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'ClickHouse と OpenTelemetry (OTel) 上に構築された本番運用レベルのオブザーバビリティプラットフォーム ClickStack の UI である HyperDX を提供し、ログ、トレース、メトリクス、セッションを単一の高性能かつスケーラブルなソリューションとして統合します。'
doc_type: 'guide'
keywords: ['hyperdx', 'observability', 'integration', 'cloud features', 'monitoring']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX は [**ClickStack**](/use-cases/observability/clickstack) 向けのユーザーインターフェイスです。ClickStack は、ClickHouse と OpenTelemetry (OTel) 上に構築された本番環境向けのオブザーバビリティ・プラットフォームであり、ログ、トレース、メトリクス、セッションを単一の高性能なソリューションとして統合します。複雑なシステムの監視とデバッグ向けに設計されており、ClickStack により、開発者および SRE はツール間を行き来したり、タイムスタンプやコリレーション ID を使って手動でデータを突き合わせたりすることなく、問題をエンドツーエンドでトレースできます。

HyperDX は、オブザーバビリティ・データの探索と可視化に特化して設計されたフロントエンドであり、Lucene スタイルおよび SQL クエリ、インタラクティブなダッシュボード、アラート、トレースの探索などをサポートします。これらはすべて、バックエンドとしての ClickHouse に最適化されています。

ClickHouse Cloud における HyperDX により、ユーザーはより「ターンキー」な ClickStack 体験を得ることができます。管理すべきインフラストラクチャは不要で、別個の認証設定も必要ありません。
HyperDX はワンクリックで起動してデータに接続でき、ClickHouse Cloud の認証システムと完全に統合されているため、オブザーバビリティに関するインサイトへシームレスかつ安全にアクセスできます。


## デプロイメント {#main-concepts}

ClickHouse CloudのHyperDXは現在プライベートプレビュー中であり、組織レベルで有効化する必要があります。有効化すると、任意のサービスを選択した際に、左側のメインナビゲーションメニューからHyperDXにアクセスできるようになります。

<Image img={hyperdx_cloud} alt='ClickHouse Cloud HyperDX' size='lg' />

ClickHouse CloudでHyperDXを使い始めるには、専用の[スタートガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)を参照することをお勧めします。

ClickStackの詳細については、[完全なドキュメント](/use-cases/observability/clickstack)を参照してください。
