---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni は、BI、データアプリケーション、組み込みアナリティクス向けのエンタープライズプラットフォームで、リアルタイムにインサイトを探索し共有することを可能にします。'
title: 'Omni'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Omni

<PartnerBadge/>

Omni は公式の ClickHouse データソースを介して、ClickHouse Cloud またはオンプレミスの ClickHouse 環境に接続できます。



## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

Admin -> Connectionsに移動し、右上隅の「Add Connection」ボタンをクリックします。

<Image
  size='lg'
  img={omni_01}
  alt='ConnectionsセクションのAdd Connectionボタンを表示しているOmni管理画面'
  border
/>
<br />

`ClickHouse`を選択します。フォームに認証情報を入力します。

<Image
  size='lg'
  img={omni_02}
  alt='ClickHouseの認証情報フォームフィールドを表示しているOmni接続設定画面'
  border
/>
<br />

これでOmniからClickHouseのデータをクエリして可視化できるようになります。
