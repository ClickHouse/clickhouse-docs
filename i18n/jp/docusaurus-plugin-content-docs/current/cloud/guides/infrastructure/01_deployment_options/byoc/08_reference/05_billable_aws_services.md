---
title: 'AWS の課金対象サービス'
slug: /cloud/reference/byoc/billable-aws-services
sidebar_label: 'AWS の課金対象サービス'
keywords: ['BYOC', 'bring your own cloud', 'AWS', '請求', 'コスト', 'EKS', 'EC2', 'S3', 'NAT Gateway', 'PrivateLink']
description: 'ClickHouse BYOC がプロビジョニングする AWS サービスを必須または任意に分類し、AWS の請求対象となるサービスを示します'
doc_type: 'reference'
---

ClickHouse BYOC は、お客様の AWS アカウント内に自己完結型のデータプレーンをプロビジョニングします。このページでは、デプロイメントで使用されるすべての AWS サービスを一覧で示し、それぞれが必須か任意かを分類するとともに、AWS の請求対象となるものを記載しています。

:::note
AWS のインフラストラクチャ費用は AWS からお客様のアカウントに直接請求され、ClickHouse Cloud のサブスクリプションとは別です。
:::

## 必須サービス \{#mandatory-services\}

これらのサービスは、すべての BYOC デプロイメントでプロビジョニングされます。

| サービス                                                        | 用途                                                                                                                                                                | 課金対象?                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **Amazon EKS**                                              | ClickHouse データプレーンを実行するマネージド Kubernetes コントロールプレーン。                                                                                                               | はい — クラスター時間単位             |
| **Amazon EC2** (EKS マネージドノードグループ経由のワーカーインスタンス)              | ClickHouse サーバーポッド、ClickHouse Keeper、プラットフォームアドオン用のコンピュート。デフォルトではメモリ最適化インスタンスファミリーを使用します。                                                                         | はい — インスタンス時間単位            |
| **Amazon EBS** (gp3 ボリューム)                                  | ノード OS、コンテナーイメージ、ClickHouse サーバーログ用のローカルストレージ。                                                                                                                    | はい — GB 月単位 + IOPS/スループット  |
| **Amazon S3**                                               | ClickHouse テーブルのプライマリストレージ、バックアップ、プラットフォームテレメトリー。バケットポリシーでは `BucketOwnerEnforced`、パブリックアクセスのブロック、SSE を強制します。                                                      | はい — ストレージ + リクエスト + データ転送 |
| **Amazon VPC** (VPC、サブネット、ルートテーブル、セキュリティグループ、インターネットゲートウェイ) | データプレーン向けのネットワーク分離。AZ をまたいで 3 つのプライベートサブネットと 3 つのパブリックサブネットを構成します。                                                                                                | いいえ — VPC リソース自体は無料です      |
| **NAT Gateway + Elastic IP** (AZ ごとに 1 つ)                   | プライベートサブネットからのアウトバウンドインターネット通信 (コントロールプレーン接続、イメージの取得、テレメトリー) 。                                                                                                    | はい — 時間単位 + データ処理量         |
| **VPC Endpoint for S3** (ゲートウェイエンドポイント)                     | NAT を経由しないプライベートな S3 アクセス。                                                                                                                                        | いいえ — ゲートウェイエンドポイントは無料です   |
| **Elastic Load Balancing (NLB)**                            | ClickHouse サービスへのクライアントトラフィックの受信。クラスター内の AWS Load Balancer Controller によって作成されます。デフォルトでは内部向けです。                                                                   | はい — LCU 時間単位 + 処理データ量     |
| **AWS IAM** (ロール、ポリシー、OIDC プロバイダー、Pod Identity 関連付け)        | ClickHouse Cloud 向けのクロスアカウントアクセス、およびクラスター内コントローラー (cert-manager、external-dns、load-balancer-controller、cluster-autoscaler、EBS CSI driver、state-exporter) 向けの IRSA。 | いいえ                        |
| **Amazon CloudWatch Logs**                                  | EKS コントロールプレーンログ (api、audit、authenticator、controllerManager、scheduler) 。                                                                                          | はい — インジェスト + ストレージ        |

## オプションのサービス \{#optional-services\}

これらのサービスは、対応する機能が有効な場合にのみプロビジョニングされます。

| サービス                                       | 有効になる条件                                                         | 課金対象?                                    |
| ------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------- |
| **AWS PrivateLink** (VPC Endpoint Service) | NLB の代わりに、または NLB に追加して、クライアントトラフィック向けの PrivateLink 接続を有効にした場合。 | はい — VPC エンドポイント時間単位 + 処理データ量            |
| **VPC Peering Connection**                 | BYOC VPC と、お客様のアカウント内の別の VPC との間のピアリングをリクエストした場合。               | 接続自体は課金されません。AZ 間およびリージョン間のデータ転送は課金対象です。 |

## データ転送料金 \{#data-transfer-charges\}

個々のリソースが無料でも、AWS のデータ転送料金は発生します。

* マルチ AZ デプロイメントにおける、EKS ノード間およびレプリカ間の **AZ 間トラフィック**。
* コントロールプレーンのハートビート、テレメトリー、イメージプルのために NAT Gateway を経由する **インターネット向けの外向き通信**。
* 暗号化オーバーレイ (Tailscale) 経由の **ClickHouse Cloud コントロールプレーン向けの外向き通信**。
* NLB または PrivateLink エンドポイント経由の **クライアントネットワーク向けの外向き通信**。

最新の料金については、[AWS data transfer pricing](https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer) を参照してください。

## 関連 \{#related\}

* [BYOC アーキテクチャ](/cloud/reference/byoc/architecture) — ClickHouse Cloud がお客様のアカウント内にデプロイするコンポーネント
* [BYOC ネットワークセキュリティ](/cloud/reference/byoc/reference/network_security) — データプレーンの ClickHouse Cloud への接続方法
* [BYOC 権限](/cloud/reference/byoc/reference/privilege) — BYOC のセットアップ時に作成される IAM ロール