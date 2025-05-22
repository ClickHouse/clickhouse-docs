---
'sidebar_label': 'Architecture'
'slug': '/cloud/reference/architecture'
'title': 'ClickHouse Cloud Architecture'
'description': 'This page describes the architecture of ClickHouse Cloud'
---

import Architecture from '@site/static/images/cloud/reference/architecture.svg';


# ClickHouse Cloudアーキテクチャ

<Architecture alt='ClickHouse Cloud architecture' class='image' />

## オブジェクトストアに支えられたストレージ {#storage-backed-by-object-store}
- 実質的に無限のストレージ
- データを手動で共有する必要がない
- 特に頻繁にアクセスされないデータの保存に対して、データの保存コストが大幅に低くなる

## コンピュート {#compute}
- 自動スケーリングとアイドル状態: 事前にサイズを決める必要がなく、ピーク使用時に過剰にプロビジョニングする必要もない
- 自動アイドル状態と再開: 誰も使用していない間、未使用のコンピュートを稼働させる必要がない
- デフォルトでセキュアで高可用性

## 管理 {#administration}
- セットアップ、監視、バックアップ、請求は全て自動で行われる。
- コスト管理機能はデフォルトで有効になっており、Cloudコンソールを通じて調整可能。

## サービスの隔離 {#service-isolation}

### ネットワーク隔離 {#network-isolation}

全てのサービスはネットワーク層で隔離されている。

### コンピュート隔離 {#compute-isolation}

全てのサービスはそれぞれのKubernetesスペースの個別のポッドに展開され、ネットワークレベルでの隔離が行われている。

### ストレージ隔離 {#storage-isolation}

全てのサービスは共有バケット（AWS、GCP）またはストレージコンテナ（Azure）の別々のサブパスを使用する。

AWSの場合、ストレージへのアクセスはAWS IAMを介して制御されており、各IAMロールはサービスごとにユニークである。エンタープライズサービスの場合、[CMEK](/cloud/security/cmek)を有効にすることで、静止データに対して高度なデータ隔離を提供できる。CMEKは現時点ではAWSサービスのみサポートされている。

GCPおよびAzureの場合、サービスはオブジェクトストレージの隔離を持っている（全てのサービスはそれぞれのバケットまたはストレージコンテナを持つ）。

## コンピュートの分離 {#compute-compute-separation}
[コンピュートの分離](/cloud/reference/warehouses)により、ユーザーはそれぞれ独自のサービスURLを持つ複数のコンピュートノードグループを作成でき、全てが同じ共有オブジェクトストレージを使用します。これにより、同じデータを共有する読み取りと書き込みといった異なるユースケースのコンピュート隔離が可能になります。また、必要に応じてコンピュートグループの独立したスケーリングを許可することで、リソースの効率的な利用も促進します。

## 同時実行制限 {#concurrency-limits}

ClickHouse Cloudサービスにおいて、1秒あたりのクエリ数（QPS）には制限がありません。ただし、各レプリカに対して最大1000の同時クエリの制限があります。QPSは最終的には平均クエリ実行時間とサービス内のレプリカ数の関数です。

セルフマネージドのClickHouseインスタンスや他のデータベース/データウェアハウスに比べ、ClickHouse Cloudの大きな利点は、[レプリカを追加することで同時実行性を簡単に増加させることができる（水平スケーリング）](/manage/scaling#manual-horizontal-scaling)点です。
