---
'sidebar_label': 'アーキテクチャ'
'slug': '/cloud/reference/architecture'
'title': 'ClickHouse Cloud アーキテクチャ'
'description': 'このページでは ClickHouse Cloud のアーキテクチャについて説明します。'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import Architecture from '@site/static/images/cloud/reference/architecture.png';

# ClickHouse Cloud アーキテクチャ

<Image img={Architecture} size='lg' alt='Cloud architecture'/>

## オブジェクトストアにバックアップされたストレージ {#storage-backed-by-object-store}
- 実質的に無限のストレージ
- データを手動で共有する必要がない
- 特にあまり頻繁にアクセスされないデータのストレージコストが大幅に削減

## コンピュート {#compute}
- 自動スケーリングとアイドル状態: 事前にサイズを指定する必要はなく、ピーク使用のために過剰にプロビジョニングする必要がない
- 自動アイドルと再開: 誰も使用していない間、未使用のコンピュートを実行し続ける必要がない
- デフォルトで安全かつ高可用性

## 管理 {#administration}
- セットアップ、監視、バックアップ、請求は自動で行われます。
- コスト管理はデフォルトで有効になっており、Cloud コンソールを通じて調整可能です。

## サービスの隔離 {#service-isolation}

### ネットワークの隔離 {#network-isolation}

すべてのサービスはネットワーク層で隔離されています。

### コンピュートの隔離 {#compute-isolation}

すべてのサービスは、それぞれのKubernetesスペースの独立したポッドにデプロイされ、ネットワークレベルの隔離が実施されています。

### ストレージの隔離 {#storage-isolation}

すべてのサービスは、共有バケット (AWS, GCP) またはストレージコンテナ (Azure) の別々のサブパスを使用します。

AWSの場合、ストレージへのアクセスはAWS IAMを通じて制御され、各IAMロールはサービスごとにユニークです。エンタープライズサービスについては、[CMEK](/cloud/security/cmek)を有効にすることで、静止データの高度な隔離を提供できます。CMEKは現在のところAWSサービスにのみ対応しています。

GCPとAzureの場合、サービスはオブジェクトストレージの隔離を持っており（すべてのサービスには独自のバケットまたはストレージコンテナがあります）。

## コンピュート間の分離 {#compute-compute-separation}
[コンピュート間の分離](/cloud/reference/warehouses)により、ユーザーはそれぞれ独自のサービスURLを持つ複数のコンピュートノードグループを作成できます。これらのグループはすべて同じ共有オブジェクトストレージを使用します。これにより、同じデータを共有する書き込みからの読み込みなど、異なるユースケースのコンピュート隔離が可能になります。必要に応じてコンピュートグループを独立してスケールさせることで、リソースの利用効率も向上します。

## 同時実行制限 {#concurrency-limits}

ClickHouse Cloudサービスでの秒間クエリ数 (QPS) に制限はありません。ただし、各レプリカに対して1000の同時クエリ制限があります。QPSは最終的には平均クエリ実行時間とサービス内のレプリカ数によって決まります。

ClickHouse Cloudの主要な利点は、セルフマネージドのClickHouseインスタンスや他のデータベース/データウェアハウスと比較して、[レプリカを追加することで同時実行性を簡単に増加させることができる (水平スケーリング)](/manage/scaling#manual-horizontal-scaling) ということです。
