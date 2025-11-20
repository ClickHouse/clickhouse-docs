---
slug: /architecture/introduction
sidebar_label: 'イントロダクション'
title: 'イントロダクション'
sidebar_position: 1
description: 'ClickHouse Support と Services 組織が ClickHouse ユーザーに提供している推奨事項に基づくデプロイメント例をまとめたページ'
doc_type: 'guide'
keywords: ['deployment', 'architecture', 'replication', 'sharding', 'cluster setup']
---

import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';

このセクションのデプロイ例は、ClickHouse Support and Services チームが ClickHouse ユーザーに提供しているアドバイスに基づいています。これらは実際に動作する例であり、まず試してからニーズに合わせて調整することをお勧めします。この中に、要件にぴったり合う例が見つかるかもしれません。

[example repo](https://github.com/ClickHouse/examples/tree/main/docker-compose-recipes/recipes) には、さまざまなトポロジ向けの複数の「レシピ」を用意しています。このセクションの例がニーズに完全には合わない場合は、こちらもあわせてご確認ください。

<ReplicationShardingTerminology />

<div class="vimeo-container">
  <iframe
    src="//www.youtube.com/embed/vBjCJtw_Ei0"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
fullscreen;
picture-in-picture"
    allowfullscreen
  />
</div>
