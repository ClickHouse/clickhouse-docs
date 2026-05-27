---
sidebar_label: '画像生成'
sidebar_position: 4
slug: /cloud/features/ai-ml/agents/builder/image-generation
title: '画像生成'
description: 'ClickHouse Agents 内で画像を生成・編集'
keywords: ['AI', 'ClickHouse Cloud', 'エージェント', '画像生成', 'DALL-E', 'Flux', 'Stable Diffusion']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge />

画像生成では、エージェントはテキストのプロンプトから新しい画像を生成したり、ユーザーがアップロードした画像を編集したりできます。エージェントは、要求内容と利用可能なコンテキストに応じて、生成と編集のどちらを行うかを選択します。

## 有効にする \{#enable-it\}

Agent Builder の capabilities セクションで、画像生成ツールを有効にします。一部のエージェントは複数の画像プロバイダー (たとえば DALL-E や Flux) を利用できます。この場合、適切なプロバイダーはエージェントが選択しますが、指示で制限することもできます。

## 生成 \{#generation\}

ユーザーが画像を求めると、エージェントはプロンプトを指定して生成ツールを呼び出し、生成された画像をインラインで返します。エージェントはその画像への参照をコンテキスト内に保持するため、同じ会話の中でその画像を説明したり再利用したりできます。

## 編集 \{#editing\}

ユーザーが画像をアップロードし、色の変更、オブジェクトの追加、構図の拡張といった修正を依頼すると、エージェントはツールの編集用バリアントを呼び出します。出力では、該当する領域が置き換えられるか、要求に応じて元の画像が拡張されます。

## 注記 \{#notes\}

* 生成された画像が、別途ビジョン解析に自動的に渡されることはありません。エージェントに画像を*解釈*させる必要がある場合は、ユーザーがアップロードした画像で [vision](/cloud/features/ai-ml/agents/builder/vision) を使用してください。
* プロバイダーのコンテンツポリシーが適用されます。プロバイダーのポリシーに違反するプロンプトを使用した場合、画像ではなくエラーが返されます。