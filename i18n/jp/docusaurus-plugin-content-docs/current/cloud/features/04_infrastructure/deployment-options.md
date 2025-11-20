---
title: 'デプロイオプション'
slug: /infrastructure/deployment-options
description: 'ClickHouse のお客様が利用可能なデプロイオプション'
keywords: ['bring yor own cloud', 'byoc', 'private', 'government', 'self-deployed']
doc_type: 'reference'
---



# ClickHouse のデプロイオプション

ClickHouse は、多様な顧客要件に対応するため、さまざまなデプロイオプションを提供しており、それぞれコントロール、コンプライアンス、運用負荷のレベルが異なります。
本ドキュメントでは、利用可能なデプロイタイプの違いを概説し、ユーザーが自らのアーキテクチャ上の方針、法規制上の要件、およびリソース管理戦略に最適に合致するソリューションを選択できるようにします。



## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloudは、フルマネージド型のクラウドネイティブサービスであり、自己管理に伴う運用上の複雑さを排除しながら、ClickHouseのパワーとスピードを提供します。
このオプションは、迅速なデプロイ、スケーラビリティ、最小限の管理オーバーヘッドを優先するユーザーに最適です。
ClickHouse Cloudは、インフラストラクチャのプロビジョニング、スケーリング、メンテナンス、アップデートのすべてを処理するため、ユーザーはデータ分析とアプリケーション開発に完全に集中できます。
従量課金制の料金体系と自動スケーリングを提供し、分析ワークロードに対して信頼性が高くコスト効率の良いパフォーマンスを保証します。AWS、GCP、Azureで利用可能であり、各マーケットプレイスでの直接請求オプションも提供されています。

[ClickHouse Cloud](/getting-started/quick-start/cloud)の詳細をご覧ください。


## Bring Your Own Cloud {#byoc}

ClickHouse Bring Your Own Cloud (BYOC) は、組織が独自のクラウド環境内でClickHouseをデプロイ・管理しながら、マネージドサービス層を活用できるオプションです。このオプションは、ClickHouse Cloudのフルマネージド体験と、セルフマネージドデプロイメントの完全な制御の間のギャップを埋めます。ClickHouse BYOCを使用することで、ユーザーはデータ、インフラストラクチャ、セキュリティポリシーに対する制御を保持し、特定のコンプライアンスおよび規制要件を満たしながら、パッチ適用、監視、スケーリングなどの運用タスクをClickHouseにオフロードできます。このモデルは、プライベートクラウドデプロイメントの柔軟性とマネージドサービスの利点を兼ね備えており、厳格なセキュリティ、ガバナンス、データレジデンシー要件を持つ企業での大規模デプロイメントに適しています。

[Bring Your Own Cloud](/cloud/reference/byoc/overview)の詳細をご覧ください。


## ClickHouse Private {#clickhouse-private}

ClickHouse Privateは、ClickHouse Cloudを支える独自技術を活用した、セルフデプロイ型のClickHouseです。このオプションは最高レベルの制御を提供し、厳格なコンプライアンス、ネットワーク、セキュリティ要件を持つ組織や、自社インフラストラクチャを管理する運用専門知識を有するチームに最適です。ClickHouse Cloud環境で十分にテストされた定期的な更新とアップグレード、機能豊富なロードマップの恩恵を受け、専門サポートチームによるバックアップが提供されます。

[ClickHouse Private](/cloud/infrastructure/clickhouse-private)の詳細をご覧ください。


## ClickHouse Government {#clickhouse-government}

ClickHouse Governmentは、隔離された認定環境を必要とする政府機関および公共部門組織の特有かつ厳格な要件を満たすように設計された、セルフデプロイ型のClickHouseです。このデプロイオプションは、OpenSSLを活用したFIPS 140-3準拠、追加のシステム強化、脆弱性管理に重点を置き、高度にセキュアで準拠性の高い隔離環境を提供します。ClickHouse Cloudの堅牢な機能を活用しつつ、政府機関特有の運用およびセキュリティ要件に対応するための専門的な機能と構成を統合しています。ClickHouse Governmentにより、政府機関は管理された認定インフラストラクチャ内で機密データに対する高性能な分析を実現でき、公共部門のニーズに特化した専門家によるサポートを受けることができます。

[ClickHouse Government](/cloud/infrastructure/clickhouse-government)の詳細をご覧ください。
