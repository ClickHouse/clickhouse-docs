---
slug: /architecture/introduction
sidebar_label: 'イントロダクション'
title: 'イントロダクション'
sidebar_position: 1
description: 'ClickHouse Support and Services から ClickHouse ユーザーに提供されるアドバイスに基づいたデプロイメントの例があるページ'
---

import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';

これらのデプロイメント例は、ClickHouse Support and Services 組織から ClickHouse ユーザーに提供されたアドバイスに基づいています。これらは実働の例であり、試してみてからニーズに合わせて調整することをお勧めします。ここにあなたの要件に正確に合った例が見つかるかもしれません。また、データが2回の代わりに3回レプリケーションされる必要がある場合は、ここで示されたパターンに従って別のレプリカを追加できるはずです。

<ReplicationShardingTerminology />

## 例 {#examples}

### 基本 {#basic}

- [**スケーリングアウト**](/deployment-guides/horizontal-scaling.md) の例は、データを2つのノードにシャーディングし、分散テーブルを使用する方法を示しています。これにより、2つの ClickHouse ノードにデータが配置されます。さらに、2つの ClickHouse ノードは ClickHouse Keeper を実行し、分散同期を提供します。3つ目のノードは、ClickHouse Keeper のクォーラムを完了させるためにスタンドアロンの ClickHouse Keeper を実行しています。

- [**フォールトトレランスのためのレプリケーション**](/deployment-guides/replicated.md) の例は、データを2つのノードにレプリケーションし、ReplicatedMergeTree テーブルを使用する方法を示しています。これにより、2つの ClickHouse ノードにデータが配置されます。2つの ClickHouse サーバーノードに加え、レプリケーションを管理するために3つのスタンドアロンの ClickHouse Keeper ノードがあります。

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

- 近日公開

### 上級 {#advanced}

- 近日公開
