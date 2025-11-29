---
description: 'ClickHouse におけるドメイン型の概要。ドメイン型は基本型を拡張し、追加機能を提供します。'
sidebar_label: 'ドメイン'
sidebar_position: 56
slug: /sql-reference/data-types/domains/
title: 'ドメイン'
doc_type: 'reference'
---



# ドメイン {#domains}

ドメインは、既存の基本型の上に追加機能を付与するための特別な型であり、基になるデータ型のオンワイヤ形式およびオンディスク形式はそのまま保持されます。現在、ClickHouse はユーザー定義ドメインをサポートしていません。

ドメインは、対応する基本型が使用できるあらゆる場所で使用できます。例えば次のような用途があります。

- ドメイン型のカラムを作成する
- ドメインカラムから/へ値を読み書きする
- 基本型をインデックスとして使用できる場合、インデックスとして使用する
- ドメインカラムの値を引数として関数を呼び出す

### ドメインの追加機能 {#extra-features-of-domains}

- `SHOW CREATE TABLE` または `DESCRIBE TABLE` における明示的なカラム型名
- `INSERT INTO domain_table(domain_column) VALUES(...)` による、人間が読みやすい形式からの入力
- `SELECT domain_column FROM domain_table` に対する、人間が読みやすい形式での出力
- 外部ソースから人間が読みやすい形式のデータをロードする: `INSERT INTO domain_table FORMAT CSV ...`

### 制限事項 {#limitations}

- `ALTER TABLE` によって、基本型のインデックスカラムをドメイン型に変換することはできません。
- 他のカラムやテーブルからデータを挿入する際に、文字列値をドメイン値へ暗黙的に変換することはできません。
- ドメインは、保存される値に対して追加の制約を課しません。
