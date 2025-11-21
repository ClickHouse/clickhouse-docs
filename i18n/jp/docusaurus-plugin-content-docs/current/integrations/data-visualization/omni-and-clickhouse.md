---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', 'connect', 'integrate', 'ui']
description: 'Omni は、BI、データアプリケーション、組み込みアナリティクス向けのエンタープライズ向けプラットフォームで、リアルタイムにインサイトを探索・共有するのに役立ちます。'
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

Omni は、公式の ClickHouse データソースを使用して、ClickHouse Cloud またはオンプレミス環境の ClickHouse デプロイメントに接続できます。



## 1. 接続情報を収集する {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. ClickHouseデータソースを作成する {#2-create-a-clickhouse-data-source}

Admin -> Connectionsに移動し、右上隅にある「Add Connection」ボタンをクリックします。

<Image
  size='lg'
  img={omni_01}
  alt='ConnectionsセクションにあるAdd Connectionボタンを表示しているOmni管理画面'
  border
/>
<br />

`ClickHouse`を選択します。フォームに認証情報を入力してください。

<Image
  size='lg'
  img={omni_02}
  alt='認証情報フォームフィールドを表示しているClickHouse用のOmni接続設定画面'
  border
/>
<br />

これでOmni内でClickHouseのデータをクエリおよび可視化できるようになります。
