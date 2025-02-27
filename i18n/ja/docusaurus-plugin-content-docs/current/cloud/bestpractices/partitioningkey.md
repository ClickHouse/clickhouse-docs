---
slug: /cloud/bestpractices/low-cardinality-partitioning-key
sidebar_label: 低カーディナリティのパーティションキーを選択する
title: 低カーディナリティのパーティションキーを選択する
---

ClickHouse Cloudのテーブルに多くの行を含む挿入ステートメントを送信するとき（[上記のセクション](/optimize/bulk-inserts)を参照）、そのテーブルが[パーティションキー](/engines/table-engines/mergetree-family/custom-partitioning-key.md)を使用していない場合、挿入されたすべての行データは新しいパーツとしてストレージに書き込まれます：

![圧縮ブロックダイアグラム](images/partitioning-01.png)

しかし、ClickHouse Cloudのテーブルに挿入ステートメントを送信し、そのテーブルにパーティションキーがある場合、ClickHouseは次のように動作します：
- 挿入された行のパーティションキー値をチェックします
- 一意のパーティションキー値ごとにストレージに新しいパーツを作成します
- パーティションキー値に応じて行を対応するパーツに配置します

![圧縮ブロックダイアグラム](images/partitioning-02.png)

したがって、ClickHouse Cloudのオブジェクトストレージへの書き込みリクエストの数を最小限に抑えるために、低カーディナリティのパーティションキーを使用するか、テーブルにパーティションキーを使用しないことをお勧めします。
