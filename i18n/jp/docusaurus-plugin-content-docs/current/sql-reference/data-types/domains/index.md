---
description: 'ClickHouse でベースタイプに追加機能を持たせたドメインタイプの概要'
sidebar_label: 'ドメイン'
sidebar_position: 56
slug: '/sql-reference/data-types/domains/'
title: 'ドメイン'
---




# ドメイン

ドメインは、既存の基本タイプの上に追加機能を加える特別目的の型ですが、基盤となるデータ型のオンワイヤおよびオンディスクフォーマットはそのまま維持されます。現在、ClickHouseはユーザー定義のドメインをサポートしていません。

ドメインは、対応する基本タイプが使用できる場所ならどこでも使用できます。例えば：

- ドメイン型のカラムを作成する
- ドメインカラムから値を読み書きする
- 基本タイプがインデックスとして使用できる場合、インデックスとして使用する
- ドメインカラムの値で関数を呼び出す

### ドメインの追加機能 {#extra-features-of-domains}

- `SHOW CREATE TABLE` または `DESCRIBE TABLE` における明示的なカラムタイプ名
- `INSERT INTO domain_table(domain_column) VALUES(...)` での人間に優しいフォーマットからの入力
- `SELECT domain_column FROM domain_table` の人間に優しいフォーマットへの出力
- 人間に優しいフォーマットで外部ソースからデータをロードする: `INSERT INTO domain_table FORMAT CSV ...`

### 制限事項 {#limitations}

- `ALTER TABLE`を介して基本タイプのインデックスカラムをドメインタイプに変換できません。
- 別のカラムやテーブルからデータを挿入する際に、文字列値をドメイン値に暗黙的に変換することはできません。
- ドメインは保存された値に対して制約を加えません。
