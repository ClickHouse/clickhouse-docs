---
title: 'デプロイメントオプション'
slug: /infrastructure/deployment-options
description: 'ClickHouse のお客様が利用できるデプロイメントオプション'
keywords: ['自前クラウド', 'byoc', 'プライベート', '政府機関向け', 'セルフデプロイ']
doc_type: 'reference'
---



# ClickHouse デプロイメントオプション

ClickHouse は、多様な顧客要件に対応するため、制御性、コンプライアンス、および運用負荷の観点から異なる、幅広いデプロイメントオプションを提供しています。
本ドキュメントでは、利用可能な各種デプロイメントタイプの特徴を整理し、利用者が自らのアーキテクチャ上の要件、規制上の義務、およびリソース管理戦略に最適に合致するソリューションを選択できるようにします。



## ClickHouse Cloud {#clickhouse-cloud}

ClickHouse Cloud は、自己管理に伴う運用上の複雑さなしに、ClickHouse の性能とスピードを提供する、フルマネージドなクラウドネイティブサービスです。
このオプションは、迅速なデプロイ、スケーラビリティ、最小限の管理負荷を重視するユーザーに最適です。
ClickHouse Cloud は、インフラストラクチャのプロビジョニング、スケーリング、メンテナンス、アップデートのあらゆる側面を引き受けるため、ユーザーはデータ分析やアプリケーション開発に専念できます。
従量課金制の料金モデルと自動スケーリングを提供し、分析ワークロードに対して信頼性が高くコスト効率の良いパフォーマンスを実現します。AWS、GCP、Azure 上で利用可能で、マーケットプレイス経由の直接課金にも対応しています。

詳しくは、[ClickHouse Cloud](/getting-started/quick-start/cloud) を参照してください。



## 自前クラウド環境での利用（Bring Your Own Cloud） {#byoc}

ClickHouse Bring Your Own Cloud (BYOC) は、組織が自社のクラウド環境内に ClickHouse をデプロイしつつ、マネージドサービスレイヤーの利点も活用できるようにするモデルです。このオプションは、ClickHouse Cloud によるフルマネージドな体験と、完全に自己管理されたデプロイメントとのギャップを埋めるものです。ClickHouse BYOC を利用すると、ユーザーはデータ、インフラストラクチャ、セキュリティポリシーを自ら管理して特定のコンプライアンスや規制要件を満たしながら、パッチ適用、監視、スケーリングといった運用タスクを ClickHouse にオフロードできます。このモデルは、マネージドサービスのメリットを享受しつつプライベートクラウドデプロイメントの柔軟性も備えており、厳格なセキュリティ、ガバナンス、データレジデンシー要件を持つエンタープライズでの大規模デプロイメントに適しています。

詳しくは、[Bring Your Own Cloud](/cloud/reference/byoc/overview) を参照してください。



## ClickHouse Private {#clickhouse-private}

ClickHouse Private は、ClickHouse をセルフホストして利用するためのバージョンであり、ClickHouse Cloud を支えるのと同じ独自技術を活用しています。このオプションはきわめて高いレベルの制御性を提供するため、厳格なコンプライアンス、ネットワークおよびセキュリティ要件を持つ組織や、自前のインフラストラクチャを運用できるだけの専門的な運用ノウハウを備えたチームに最適です。ClickHouse Cloud 環境で徹底的にテストされた定期的なアップデートおよびアップグレード、豊富な機能を備えたロードマップの恩恵を受けられ、さらに当社のエキスパートによるサポートチームによって支えられています。

[ClickHouse Private](/cloud/infrastructure/clickhouse-private) の詳細については、こちらをご覧ください。



## ClickHouse Government {#clickhouse-government}

ClickHouse Government は、分離された認定済み環境を必要とする政府機関や公共部門組織の、特有で厳格な要件を満たすように設計された、セルフホスト型の ClickHouse です。このデプロイメントオプションは、OpenSSL を利用した FIPS 140-3 準拠、追加のシステムハードニング、および脆弱性管理に重点を置きつつ、高度に安全で、各種コンプライアンス要件を満たした分離環境を提供します。ClickHouse Cloud の堅牢な機能を活用しながら、政府組織特有の運用要件とセキュリティ要件に対応するための専用機能および設定を統合しています。ClickHouse Government を利用することで、機関は、公共部門のニーズに合わせたエキスパートサポートを受けつつ、管理された認定インフラストラクチャ内で機微なデータに対する高性能な分析を実現できます。

[ClickHouse Government](/cloud/infrastructure/clickhouse-government) についての詳細をご覧ください。