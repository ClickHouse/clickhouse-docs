---
slug: /architecture/introduction
sidebar_label: はじめに
title: はじめに
sidebar_position: 1
---
import ReplicationShardingTerminology from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';

これらのデプロイメント例は、ClickHouse サポートおよびサービス組織からの ClickHouse ユーザーへのアドバイスに基づいています。これらは実際に機能する例であり、試してみてから自分のニーズに合わせて調整することをお勧めします。ここにあなたの要件に正確に合った例が見つかるかもしれません。あるいは、データが2回ではなく3回レプリケートされる必要がある場合は、ここで示されているパターンに従うことで、もう1つのレプリカを追加できるはずです。

<ReplicationShardingTerminology />

## 例 {#examples}

### 基本 {#basic}

- [**スケールアウト**](/deployment-guides/horizontal-scaling.md) の例では、データを2つのノードにシャードし、分散テーブルを使用する方法が示されています。これにより、2つの ClickHouse ノードにデータが格納されます。また、2つの ClickHouse ノードは ClickHouse Keeper を実行して分散同期を提供しています。3つ目のノードは ClickHouse Keeper をスタンドアロンで実行し、ClickHouse Keeper の過半数を完成させます。

- [**フォールトトレランスのためのレプリケーション**](/deployment-guides/replicated.md) の例では、データを2つのノードにレプリケートし、ReplicatedMergeTree テーブルを使用する方法が示されています。これにより、2つの ClickHouse ノードにデータが存在します。2つの ClickHouse サーバーノードに加えて、レプリケーションを管理するために3つの ClickHouse Keeper スタンドアロンノードがあります。

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

- 近日中に公開予定

### 上級 {#advanced}

- 近日中に公開予定
