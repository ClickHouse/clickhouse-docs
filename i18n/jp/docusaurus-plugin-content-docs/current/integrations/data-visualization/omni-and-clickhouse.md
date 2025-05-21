---
sidebar_label: 'Omni'
slug: /integrations/omni
keywords: ['clickhouse', 'Omni', '接続', '統合', 'ui']
description: 'Omniは、 BI、データアプリケーション、埋め込み分析のためのエンタープライズプラットフォームで、リアルタイムで洞察を探索し共有するのに役立ちます。'
title: 'Omni'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import omni_01 from '@site/static/images/integrations/data-visualization/omni_01.png';
import omni_02 from '@site/static/images/integrations/data-visualization/omni_02.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Omni

<CommunityMaintainedBadge/>

Omniは、公式のClickHouseデータソースを介して、ClickHouse Cloudまたはオンプレミスの展開に接続できます。

## 1. 接続詳細の収集 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. ClickHouseデータソースの作成 {#2-create-a-clickhouse-data-source}

Admin -> Connectionsに移動し、右上隅の「接続を追加」ボタンをクリックします。

<Image size="lg" img={omni_01} alt="Omniの管理インターフェースで、接続セクションの接続を追加ボタンを表示" border />
<br/>

`ClickHouse`を選択します。フォームに認証情報を入力します。

<Image size="lg" img={omni_02} alt="ClickHouseのためのOmni接続構成インターフェースで、認証情報フォームフィールドを表示" border />
<br/>

これで、OmniでClickHouseからデータをクエリし、視覚化することができるようになります。
