---
slug: /architecture/introduction
sidebar_label: はじめに
title: はじめに
sidebar_position: 1
---
import ReplicationShardingTerminology from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_replication-sharding-terminology.md';

これらのデプロイメント例は、ClickHouse Support and Services組織がClickHouseユーザーに提供したアドバイスに基づいています。これらは実行可能な例であり、ぜひ試してみてから必要に応じて調整することをお勧めします。ここにあなたの要件にぴったり合った例が見つかるかもしれません。あるいは、データが二回ではなく三回レプリケートされる必要がある場合は、ここで示されたパターンに従ってもう一つのレプリカを追加できるはずです。

<ReplicationShardingTerminology />

## 例 {#examples}

### 基本 {#basic}

- [**スケールアウト**](/deployment-guides/horizontal-scaling.md)の例では、データを二つのノードにシャーディングし、分散テーブルを使用する方法が示されています。これにより、二つのClickHouseノードにデータが分散されます。二つのClickHouseノードは、分散同期を提供するClickHouse Keeperも実行しています。三台目のノードは、ClickHouse Keeperのクォーラムを完成させるためにスタンドアロンでClickHouse Keeperを実行します。

- [**障害耐性のためのレプリケーション**](/deployment-guides/replicated.md)の例では、データを二つのノードにレプリケートし、ReplicatedMergeTreeテーブルを使用する方法が示されています。これにより、二つのClickHouseノードにデータが分散されます。二つのClickHouseサーバーノードに加え、レプリケーションを管理するために三つのスタンドアロンClickHouse Keeperノードがあります。

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
