---
slug: /cloud/bestpractices/low-cardinality-partitioning-key
sidebar_label: 低カーディナリティのパーティショニングキーを選択
title: 低カーディナリティのパーティショニングキーを選択
---

import partitioning01 from '@site/static/images/cloud/bestpractices/partitioning-01.png';
import partitioning02 from '@site/static/images/cloud/bestpractices/partitioning-02.png';

ClickHouse Cloud のテーブルに対して（多くの行を含む必要がある）INSERT ステートメントを送信すると、そのテーブルが [パーティショニングキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md) を使用していない場合、INSERT のすべての行データはストレージの新しいパーツに書き込まれます:

<img src={partitioning01}
  class="image"
  alt="パーティショニングキーなしでのINSERT - 作成された1つのパーツ"
  style={{width: '100%', background: 'none'}} />

一方、ClickHouse Cloud のテーブルに対してINSERT ステートメントを送信し、そのテーブルがパーティショニングキーを持つ場合、ClickHouse は以下を実行します:
- INSERT に含まれる行のパーティショニングキー値をチェックします
- 異なるパーティショニングキー値ごとにストレージに新しいパーツを作成します
- パーティショニングキー値に基づいて行を対応するパーツに配置します

<img src={partitioning02}
  class="image"
  alt="パーティショニングキーありでのINSERT - パーティショニングキー値に基づいて作成された複数のパーツ"
  style={{width: '100%', background: 'none'}} />

したがって、ClickHouse Cloud のオブジェクトストレージへの書き込みリクエストの数を最小限に抑えるために、低カーディナリティのパーティショニングキーを使用するか、テーブルにパーティショニングキーを使用しないようにしてください。
