---
title: '追加インフラストラクチャのデプロイ'
slug: /cloud/reference/byoc/onboarding/new_region
sidebar_label: '追加インフラストラクチャ'
keywords: ['BYOC', 'クラウド', '自前のクラウド利用', 'オンボーディング', '追加インフラストラクチャ', 'マルチリージョン', 'マルチアカウント']
description: '新しいリージョンまたはアカウントに BYOC 用の追加インフラストラクチャをデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_new_infra_1 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'
import byoc_new_infra_2 from '@site/static/images/cloud/reference/byoc-new-infra-2.png'
import byoc_new_infra_3 from '@site/static/images/cloud/reference/byoc-new-infra-1.png'

初期のオンボーディングを完了した後、別のリージョンや別の AWS アカウント、GCP プロジェクトに追加の BYOC インフラストラクチャをデプロイしたくなる場合があります。

新しい BYOC デプロイメントを追加するには、次の手順を実行します。

<VerticalStepper headerLevel="list">
  1. ClickHouse Cloud コンソールで組織の「Infrastructure」ページに移動します。

  <Image img={byoc_new_infra_1} size="lg" alt="BYOC インフラページ" />

  2. 「Add new account」または「Add new infrastructure」を選択し、ガイド付きインターフェイスに従ってセットアップを完了します。

  <Image img={byoc_new_infra_2} size="lg" alt="BYOC インフラページ" />
</VerticalStepper>
