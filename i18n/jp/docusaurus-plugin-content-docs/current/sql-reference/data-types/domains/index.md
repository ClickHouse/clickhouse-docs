---
description: 'ClickHouse におけるドメイン型の概要。基本型を拡張し、追加機能を提供します'
sidebar_label: 'ドメイン型'
sidebar_position: 56
slug: /sql-reference/data-types/domains/
title: 'ドメイン型'
doc_type: 'reference'
---



# ドメイン

ドメインは、既存の基本型に追加機能を付与する特殊用途の型であり、基礎となるデータ型のネットワーク転送時およびディスク保存時のフォーマットはそのまま保持されます。現在、ClickHouseはユーザー定義ドメインをサポートしていません。

ドメインは、対応する基本型が使用できる場所であればどこでも使用できます。例えば:

- ドメイン型のカラムを作成する
- ドメインカラムから値を読み取る、またはドメインカラムに値を書き込む
- 基本型がインデックスとして使用できる場合、インデックスとして使用する
- ドメインカラムの値を使用して関数を呼び出す

### ドメインの追加機能 {#extra-features-of-domains}

- `SHOW CREATE TABLE`または`DESCRIBE TABLE`での明示的なカラム型名の表示
- `INSERT INTO domain_table(domain_column) VALUES(...)`による人間が読みやすい形式からの入力
- `SELECT domain_column FROM domain_table`での人間が読みやすい形式への出力
- 人間が読みやすい形式での外部ソースからのデータ読み込み: `INSERT INTO domain_table FORMAT CSV ...`

### 制限事項 {#limitations}

- `ALTER TABLE`を使用して基本型のインデックスカラムをドメイン型に変換することはできません。
- 別のカラムやテーブルからデータを挿入する際に、文字列値をドメイン値に暗黙的に変換することはできません。
- ドメインは格納される値に制約を追加しません。
