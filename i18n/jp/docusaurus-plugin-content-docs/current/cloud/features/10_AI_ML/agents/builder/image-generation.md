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
import Image from '@theme/IdealImage';
import toolsModal from '@site/static/images/cloud/agent-builder/tools-modal.png';

<BetaBadge />

画像生成では、エージェントはテキストのプロンプトから新しい画像を生成したり、ユーザーがアップロードした画像を編集したりできます。エージェントは、要求内容と利用可能なコンテキストに応じて、生成と編集のどちらを行うかを選択します。

## 画像生成を有効にする \{#enable-it\}

画像生成は、エージェントビルダーの **Add Tools** モーダルから追加します (Capabilities セクションではありません) 。エージェントビルダーのパネル下部にある **Add Tools** をクリックし、画像モデル用ツールを 1 つ追加します。たとえば、**OpenAI Image Tools**、**DALL-E-3**、**Stable Diffusion** などです。エージェントはリクエストに応じて適切なものを選択しますが、指示で使用するツールを制限することもできます。

<Image img={toolsModal} alt="OpenAI Image Tools、DALL-E-3、Stable Diffusion などの画像モデル連携が、ほかのサードパーティーツールとともに表示された Agent Tools モーダル" size="md" />

## 生成 \{#generation\}

ユーザーが画像を求めると、エージェントはプロンプトを指定して生成ツールを呼び出し、生成された画像をインラインで返します。エージェントはその画像への参照をコンテキスト内に保持するため、同じ会話の中でその画像を説明したり再利用したりできます。

## 編集 \{#editing\}

ユーザーが画像をアップロードし、色の変更、オブジェクトの追加、構図の拡張といった修正を依頼すると、エージェントはツールの編集用バリアントを呼び出します。出力では、該当する領域が置き換えられるか、要求に応じて元の画像が拡張されます。

## 注記 \{#notes\}

* 生成された画像が、別途ビジョン解析に自動的に渡されることはありません。エージェントに画像を*解釈*させる必要がある場合は、ユーザーがアップロードした画像で [vision](/cloud/features/ai-ml/agents/builder/vision) を使用してください。
* プロバイダーのコンテンツポリシーが適用されます。プロバイダーのポリシーに違反するプロンプトを使用した場合、画像ではなくエラーが返されます。