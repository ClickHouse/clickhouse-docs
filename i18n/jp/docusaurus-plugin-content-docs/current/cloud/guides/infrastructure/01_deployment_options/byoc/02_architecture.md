---
title: 'アーキテクチャ'
slug: /cloud/reference/byoc/architecture
sidebar_label: 'アーキテクチャ'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '自前のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## アーキテクチャ {#architecture}

メトリクスとログは、お客様のBYOC VPC内に保存されます。ログは現在、EBS内にローカルで保存されています。今後のアップデートでは、ログはLogHouseに保存される予定です。LogHouseは、お客様のBYOC VPC内で動作するClickHouseサービスです。メトリクスは、お客様のBYOC VPC内にローカルで保存されるPrometheusとThanosスタックを介して実装されています。

<br />

<Image img={byoc1} size='lg' alt='BYOCアーキテクチャ' background='black' />

<br />
