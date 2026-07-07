---
title: 'BYOC コストモデル（AWS）'
slug: /cloud/reference/byoc/cost-model-aws
sidebar_label: 'コストモデル（AWS）'
keywords: ['BYOC', 'bring your own cloud', 'AWS', 'コスト', '請求', 'TCO', '価格', 'EC2', 'S3', 'EBS']
description: 'BYOC デプロイメントにおける総所有コストを構成する、ClickHouse Cloud の料金と AWS インフラストラクチャ料金の仕組み'
doc_type: 'reference'
---

ClickHouse BYOC デプロイメントでは、独立した 2 種類の請求が発生します。

1. **ClickHouse Cloud の料金** — 合計メモリ割り当て量に基づいて、ClickHouse サービスに対し ClickHouse から請求されます。
2. **AWS インフラストラクチャ料金** — BYOC デプロイメントによって AWS 上にプロビジョニングされた各リソースについて、AWS からお客様の AWS アカウントに直接請求されます。

このページでは、それぞれの料金の計算方法と、それらを合算して総所有コスト (TCO) を算出する仕組みを説明します。

## ClickHouse Cloud の料金 \{#clickhouse-cloud-charges\}

ClickHouse Cloud の料金は、合計メモリ割り当て量に基づいて算出されます。お使いの構成にどのように適用されるかについては、[チームにお問い合わせください](https://clickhouse.com/cloud/bring-your-own-cloud)。

## AWS インフラストラクチャ料金 \{#aws-infrastructure-charges\}

BYOC によってプロビジョニングされたすべてのリソースについて、AWS はお客様のアカウントに直接請求します。ClickHouse が AWS のキャパシティにマージンを上乗せしたり、再販したりすることはありません。必須サービスと任意サービスの全一覧については、[課金対象の AWS サービス](/cloud/reference/byoc/billable-aws-services)を参照してください。

通常、BYOC の請求額への寄与が大きい順に並べると、主なコスト要因は次のとおりです。

1. **Amazon EC2** — EKS マネージドノードグループの基盤となるワーカーインスタンスです。デフォルトでは標準の Graviton ファミリー (たとえば `m7g`) が使用されます。ファミリーと台数は、サービスに割り当てられたメモリ量とノードグループのオートスケーリングに応じて増減します。
2. **Amazon S3** — お客様のバケットに保存される ClickHouse のテーブルデータとバックアップです。GB/月単位の料金に加え、リクエストごとおよびリージョン間転送料金が課金されます。
3. **Amazon EBS** — OS、コンテナイメージ、ClickHouse ログ用としてワーカーノードにアタッチされる gp3 ボリュームです。
4. **NAT Gateway と AZ 間データ転送** — プライベートサブネットからの外向きトラフィックに加え、アベイラビリティゾーン間のトラフィックが含まれます (マルチ AZ デプロイメントでは、AZ をまたいでデータがレプリケートされます) 。
5. **Amazon EKS** — クラスター時間ごとに発生する固定のコントロールプレーン料金です。
6. **Elastic Load Balancing (NLB)** — クライアントのイングレストラフィックに対して、LCU 時間ごとに課金されます。
7. **CloudWatch Logs、Route 53、KMS、VPC エンドポイント** — 通常、請求総額に占める割合は小さいものの、ワークロードによって変動します。

最新の AWS の定価については、[aws.amazon.com](https://aws.amazon.com/pricing/) の各サービスの料金ページを参照してください。

## 関連 \{#related\}

* [課金対象のAWSサービス](/cloud/reference/byoc/billable-aws-services) — BYOC によってプロビジョニングされる AWS サービスの全一覧
* [AWS のサービス制限とクォータ](/cloud/reference/byoc/aws-service-limits) — デプロイ前に確認すべきクォータ
* [BYOC アーキテクチャ](/cloud/reference/byoc/architecture) — ClickHouse Cloud がお客様のアカウントにデプロイする構成要素