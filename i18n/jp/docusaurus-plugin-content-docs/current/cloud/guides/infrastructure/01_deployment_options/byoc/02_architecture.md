---
title: 'アーキテクチャ'
slug: /cloud/reference/byoc/architecture
sidebar_label: 'アーキテクチャ'
keywords: ['BYOC', 'クラウド', 'bring your own cloud']
description: 'ClickHouse をご自身のクラウドインフラストラクチャ上にデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## アーキテクチャ \\{#architecture\\}

メトリクスとログは、顧客の BYOC VPC 内に保存されます。ログは現在、ローカルの EBS に保存されています。今後のアップデートでは、ログは LogHouse（顧客の BYOC VPC 内で動作する ClickHouse サービス）に保存される予定です。メトリクス基盤は、Prometheus と Thanos から成るスタックで実装されており、そのデータも顧客の BYOC VPC 内にローカル保存されます。

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />
