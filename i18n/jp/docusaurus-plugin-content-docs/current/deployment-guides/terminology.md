---
slug: '/architecture/introduction'
sidebar_label: '紹介'
title: '紹介'
sidebar_position: 1
description: 'ClickHouseのサポートおよびサービス機関から提供されたアドバイスに基づいて、展開の例を示すページ'
---

import ReplicationShardingTerminology from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';

これらのデプロイメントの例は、ClickHouseサポートおよびサービス組織がClickHouseユーザーに提供したアドバイスに基づいています。これらは動作する例であり、試してみてからニーズに合わせて調整することをお勧めします。こちらに、あなたの要件にぴったり合う例を見つけられるかもしれません。Alternatively, もしデータを2回ではなく3回レプリケートする必要がある場合は、ここで示されたパターンに従うことで、別のレプリカを追加できるはずです。

<ReplicationShardingTerminology />

## 例 {#examples}

### 基本 {#basic}

- [**スケーリングアウト**](/deployment-guides/horizontal-scaling.md) の例は、データを2つのノードにシャードし、分散テーブルを使用する方法を示しています。これにより、2つのClickHouseノード上にデータが存在することになります。2つのClickHouseノードは、分散同期を提供するClickHouse Keeperも実行しています。また、3番目のノードは、ClickHouse Keeperのクオラムを完成させるためにスタンドアロンの状態でClickHouse Keeperを実行しています。

- [**フォールトトレランスのためのレプリケーション**](/deployment-guides/replicated.md) の例は、データを2つのノードにレプリケートし、ReplicatedMergeTreeテーブルを使用する方法を示しています。これにより、2つのClickHouseノード上にデータが存在することになります。2つのClickHouseサーバーノードに加えて、レプリケーションを管理するための3つのスタンドアロンのClickHouse Keeperノードがあります。

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/vBjCJtw_Ei0"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

### 中級 {#intermediate}

- 近日公開予定

### 上級 {#advanced}

- 近日公開予定
