---
slug: /architecture/introduction
sidebar_label: 'はじめに'
title: 'はじめに'
sidebar_position: 1
description: 'ClickHouse Support and Services チームが ClickHouse ユーザーに提供している推奨事項に基づいたデプロイメント例をまとめたページ'
doc_type: 'guide'
keywords: ['デプロイメント', 'アーキテクチャ', 'レプリケーション', 'シャーディング', 'クラスタ構成']
---

import ReplicationShardingTerminology from '@site/docs/_snippets/_replication-sharding-terminology.md';

このセクションのデプロイメント例は、ClickHouse の Support and Services チームが
ClickHouse ユーザーに提供しているアドバイスに基づいています。これらは実際に動作する例であり、
まず試してから、ご自身のニーズに合わせて調整することを推奨します。ここで紹介している例の中に、
要件にぴったり合致するものが見つかるかもしれません。

[example repo](https://github.com/ClickHouse/examples/tree/main/docker-compose-recipes/recipes) には、さまざまなトポロジに対応した「レシピ」を多数用意しており、
このセクションの例がニーズに完全には合わない場合は、それらも確認することをお勧めします。

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
