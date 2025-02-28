---
sidebar_label: アーキテクチャ
slug: /cloud/reference/architecture
---

import architecture from '@site/static/images/cloud/reference/architecture.svg';

# ClickHouse Cloud アーキテクチャ

<img src={architecture} alt='ClickHouse Cloud architecture' class='image' />
## オブジェクトストレージによるストレージ {#storage-backed-by-object-store}
- 実質的に無限のストレージ
- データを手動で共有する必要がない
- 特にアクセス頻度が低いデータのストレージコストが大幅に低下
## コンピュート {#compute}
- 自動スケーリングとアイドル: 前もってサイズを指定する必要がなく、ピーク使用時に過剰にプロビジョニングする必要がない
- 自動アイドルおよび再開: 誰も使用していない間は未使用のコンピュートを稼働させる必要がない
- デフォルトで安全および高可用性
## 管理 {#administration}
- セットアップ、モニタリング、バックアップ、および請求が自動的に行われる。
- コスト管理がデフォルトで有効になっており、Cloud コンソールを通じて調整可能。
## サービスの分離 {#service-isolation}
### ネットワーク分離 {#network-isolation}

すべてのサービスはネットワーク層で分離されています。
### コンピュート分離 {#compute-isolation}

すべてのサービスはそれぞれの Kubernetes スペース内で個別のポッドに展開され、ネットワークレベルの分離がされています。
### ストレージ分離 {#storage-isolation}

すべてのサービスは共有バケット (AWS, GCP) またはストレージコンテナ (Azure) の別々のサブパスを使用しています。

AWS の場合、ストレージへのアクセスは AWS IAM を介して制御されており、各 IAM ロールはサービスごとにユニークです。エンタープライズサービスの場合、[CMEK](/cloud/security/cmek) を有効にすると、静止データの高度な分離を提供できます。CMEK は現時点では AWS サービスのみサポートされています。

GCP および Azure の場合、サービスはオブジェクトストレージの分離を持っています (すべてのサービスは独自のバケットまたはストレージコンテナを持っています)。
## コンピュート-コンピュート分離 {#compute-compute-separation}
[コンピュート-コンピュート分離](/cloud/reference/warehouses) により、ユーザーはそれぞれ独自のサービス URL を持ち、すべて同じ共有オブジェクトストレージを使用する複数のコンピュートノードグループを作成できます。これにより、同じデータを共有する読み取りと書き込みなどの異なるユースケースのコンピュート分離が可能になります。また、コンピュートグループの独立したスケーリングを可能にすることで、リソースの効率的な利用につながります。
## 同時実行制限 {#concurrency-limits}

ClickHouse Cloud サービスにおける1秒あたりのクエリ数 (QPS) に制限はありません。ただし、各レプリカでの同時クエリは1000件までの制限があります。QPS は最終的には平均クエリ実行時間とサービス内のレプリカ数の関数です。

ClickHouse Cloud の大きな利点は、セルフマネージドの ClickHouse インスタンスやその他のデータベース/データウェアハウスと比較して、[より多くのレプリカを追加することで (水平スケーリング)](/manage/scaling#manual-horizontal-scaling) 同時実行性を簡単に増やせることです。
