---
description: 'ClickHouseにおけるドメインタイプの概要。基本タイプに追加機能を拡張しますが、基盤となるデータタイプのオンワイヤーおよびオンディスクフォーマットはそのままです。'
sidebar_label: 'ドメイン'
sidebar_position: 56
slug: /sql-reference/data-types/domains/
title: 'ドメイン'
---


# ドメイン

ドメインは、既存の基本タイプの上に追加機能を提供する特別目的のタイプであり、基盤となるデータタイプのオンワイヤーおよびオンディスクフォーマットには手を加えません。現時点では、ClickHouseはユーザー定義のドメインをサポートしていません。

ドメインは、対応する基本タイプが使用できる場所ならどこでも使用できます。例えば：

- ドメインタイプのカラムを作成する
- ドメインカラムから値を読み書きする
- 基本タイプがインデックスとして使用できる場合、それをインデックスとして使用する
- ドメインカラムの値を使って関数を呼び出す

### ドメインの追加機能 {#extra-features-of-domains}

- `SHOW CREATE TABLE` または `DESCRIBE TABLE` における明示的なカラムタイプ名
- 人間に優しい形式からの入力： `INSERT INTO domain_table(domain_column) VALUES(...)`
- 人間に優しい形式への出力： `SELECT domain_column FROM domain_table`
- 人間に優しい形式での外部ソースからのデータの読み込み： `INSERT INTO domain_table FORMAT CSV ...`

### 制限事項 {#limitations}

- `ALTER TABLE` を使用して基本タイプのインデックスカラムをドメインタイプに変換することはできません。
- 別のカラムやテーブルからデータを挿入する際に、文字列値をドメイン値に暗黙的に変換することはできません。
- ドメインは格納された値に対して制約を加えません。
