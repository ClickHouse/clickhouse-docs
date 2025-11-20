---
sidebar_label: 'アーキテクチャ'
slug: /cloud/reference/architecture
title: 'ClickHouse Cloud のアーキテクチャ'
description: 'このページでは ClickHouse Cloud のアーキテクチャについて説明します'
keywords: ['ClickHouse Cloud', 'cloud architecture', 'separation of storage and compute']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import Architecture from '@site/static/images/cloud/reference/architecture.png';


# ClickHouse Cloud のアーキテクチャ

<Image img={Architecture} size='lg' alt='ClickHouse Cloud のアーキテクチャ'/>



## オブジェクトストアによるストレージ {#storage-backed-by-object-store}

- 実質無制限のストレージ容量
- データを手動で共有する必要がない
- データ保存コストの大幅な削減、特にアクセス頻度の低いデータで顕著


## コンピュート {#compute}

- 自動スケーリングとアイドリング：事前のサイジングが不要で、ピーク時の使用に備えた過剰プロビジョニングも不要です
- 自動アイドリングと再開：誰も使用していない間、未使用のコンピュートリソースを稼働させ続ける必要がありません
- デフォルトでセキュアかつ高可用性を実現


## 管理 {#administration}

- セットアップ、モニタリング、バックアップ、課金は自動的に実行されます。
- コスト管理機能はデフォルトで有効になっており、Cloudコンソールから調整可能です。


## サービスの分離 {#service-isolation}

### ネットワークの分離 {#network-isolation}

すべてのサービスはネットワーク層で分離されています。

### コンピューティングの分離 {#compute-isolation}

すべてのサービスは、それぞれのKubernetes名前空間内の個別のポッドにデプロイされ、ネットワークレベルで分離されています。

### ストレージの分離 {#storage-isolation}

すべてのサービスは、共有バケット(AWS、GCP)またはストレージコンテナ(Azure)の個別のサブパスを使用します。

AWSの場合、ストレージへのアクセスはAWS IAMを介して制御され、各IAMロールはサービスごとに一意です。Enterpriseサービスの場合、[CMEK](/cloud/security/cmek)を有効にすることで、保存データの高度な分離を提供できます。CMEKは現時点ではAWSサービスのみでサポートされています。

GCPとAzureの場合、サービスはオブジェクトストレージの分離が行われています(すべてのサービスが独自のバケットまたはストレージコンテナを持ちます)。


## Compute-compute separation {#compute-compute-separation}

[コンピュート-コンピュート分離](/cloud/reference/warehouses)により、ユーザーは複数のコンピュートノードグループを作成できます。各グループは独自のサービスURLを持ち、すべて同じ共有オブジェクトストレージを使用します。これにより、同じデータを共有しながら、読み取りと書き込みなど異なるユースケースのコンピュートを分離できます。また、必要に応じて各コンピュートグループを独立してスケーリングできるため、リソースをより効率的に利用できます。


## 同時実行数の制限 {#concurrency-limits}

ClickHouse Cloudサービスでは、1秒あたりのクエリ数（QPS）に制限はありません。ただし、レプリカあたりの同時実行クエリ数は1000に制限されています。QPSは、最終的にはクエリの平均実行時間とサービス内のレプリカ数によって決まります。

セルフマネージドのClickHouseインスタンスや他のデータベース/データウェアハウスと比較した場合、ClickHouse Cloudの大きな利点は、[レプリカを追加する（水平スケーリング）](/manage/scaling#manual-horizontal-scaling)ことで同時実行数を容易に増やせることです。
