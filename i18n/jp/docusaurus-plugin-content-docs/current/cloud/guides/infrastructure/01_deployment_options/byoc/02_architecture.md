---
title: 'アーキテクチャ'
slug: /cloud/reference/byoc/architecture
sidebar_label: 'アーキテクチャ'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '自分のクラウドインフラストラクチャ上で ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## アーキテクチャ {#architecture}

メトリクスとログは、顧客のBYOC VPC内に保存されます。ログは現在、EBSにローカル保存されています。今後のアップデートでは、ログは顧客のBYOC VPC内のClickHouseサービスであるLogHouseに保存される予定です。メトリクスは、顧客のBYOC VPC内にローカル保存されるPrometheusおよびThanosスタックを介して実装されています。

<br />

<Image img={byoc1} size='lg' alt='BYOCアーキテクチャ' background='black' />

<br />
