---
sidebar_label: アーキテクチャ
slug: /cloud/reference/architecture
---

import Architecture from '@site/static/images/cloud/reference/architecture.svg';


# ClickHouse Cloud アーキテクチャ

<Architecture alt='ClickHouse Cloud architecture' class='image' />

## オブジェクトストアに基づくストレージ {#storage-backed-by-object-store}
- 実質的に無制限のストレージ
- データを手動で共有する必要なし
- 特にアクセス頻度の低いデータのストレージのために、大幅に低コスト

## コンピュート {#compute}
- 自動スケーリングとアイドル: 事前にサイズを決める必要なし、ピーク使用に対して過剰プロビジョニングする必要なし
- 自動アイドルと再開: 誰も使用していない間は未使用のコンピュートを実行する必要なし
- デフォルトでセキュアかつ HA

## 管理 {#administration}
- セットアップ、監視、バックアップ、請求は自動で行われます。
- コスト制御はデフォルトで有効になっており、Cloud コンソールを通じて調整可能です。

## サービスの分離 {#service-isolation}

### ネットワーク分離 {#network-isolation}

すべてのサービスはネットワーク層で隔離されています。

### コンピュート分離 {#compute-isolation}

すべてのサービスはそれぞれの Kubernetes スペースの別々のポッドにデプロイされ、ネットワークレベルの分離が行われています。

### ストレージ分離 {#storage-isolation}

すべてのサービスは共有バケット（AWS、GCP）またはストレージコンテナ（Azure）の別々のサブパスを使用します。

AWSの場合、ストレージへのアクセスは AWS IAM によって制御され、各 IAM ロールはサービスごとにユニークです。Enterprise サービスでは、[CMEK](/cloud/security/cmek) を有効にして、静止データの高度な分離を提供できます。CMEK は現時点では AWS サービスのみがサポートされています。

GCP および Azure では、サービスはオブジェクトストレージの分離を持ち（すべてのサービスが独自のバケットまたはストレージコンテナを持ちます）、います。

## コンピュート-コンピュート分離 {#compute-compute-separation}
[コンピュート-コンピュート分離](/cloud/reference/warehouses) により、ユーザーは複数のコンピュートノードグループを作成でき、それぞれが独自のサービス URL を持ち、同じ共有オブジェクトストレージを使用します。これにより、同じデータを共有する書き込みと読み取りなど、異なるユースケースのコンピュート分離が可能になります。また、必要に応じてコンピュートグループの独立したスケーリングを可能にすることで、リソースの効率的な利用が実現されます。

## 同時実行制限 {#concurrency-limits}

ClickHouse Cloud サービスでの 1 秒あたりのクエリ数 (QPS) に制限はありません。ただし、各レプリカごとに 1000 の同時クエリの制限があります。QPS は最終的には平均クエリ実行時間とサービス内のレプリカ数の関数です。

ClickHouse Cloud の大きな利点は、セルフマネージドの ClickHouse インスタンスや他のデータベース/データウェアハウスに比べて、[レプリカを追加することで簡単に同時実行性を増加できること（水平スケーリング）](/manage/scaling#manual-horizontal-scaling)です。
