---
slug: /architecture/introduction
sidebar_label: '概要'
title: '概要'
sidebar_position: 1
description: 'ClickHouse Support および Services 組織が ClickHouse ユーザーに提供してきたアドバイスに基づくデプロイメント例をまとめたページ'
doc_type: 'guide'
keywords: ['デプロイメント', 'アーキテクチャ', 'レプリケーション', 'シャーディング', 'クラスター構成']
---

import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';

このセクションのデプロイ例は、ClickHouse の Support &amp; Services 組織が
ClickHouse ユーザーに提供してきたアドバイスに基づいています。これらは実際に動作する例であり、
まず試したうえで、ニーズに合わせて調整することをお勧めします。ここで紹介する例の中に、
要件に完全に合致するものが見つかるかもしれません。

[example repo](https://github.com/ClickHouse/examples/tree/main/docker-compose-recipes/recipes) には、さまざまなトポロジーの「レシピ」を用意しています。
このセクションの例がニーズに完全には合致しない場合には、そちらもぜひ参照してください。

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
