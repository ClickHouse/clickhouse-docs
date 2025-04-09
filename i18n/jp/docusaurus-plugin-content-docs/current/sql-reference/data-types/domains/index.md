---
slug: /sql-reference/data-types/domains/
sidebar_position: 56
sidebar_label: ドメイン
---


# ドメイン

ドメインは特定の目的のための型であり、既存の基本型の上に追加の機能を提供しますが、基盤となるデータ型のオンワイヤーおよびオンディスクフォーマットはそのまま維持されます。現在、ClickHouseはユーザー定義のドメインをサポートしていません。

ドメインは、対応する基本型が使用できる場所であればどこでも使用できます。例えば：

- ドメイン型のカラムを作成する
- ドメインカラムに対して値を読み書きする
- 基本型がインデックスとして使用可能な場合、インデックスとして使用する
- ドメインカラムの値を持つ関数を呼び出す

### ドメインの追加機能 {#extra-features-of-domains}

- `SHOW CREATE TABLE` または `DESCRIBE TABLE` における明示的なカラム型名
- `INSERT INTO domain_table(domain_column) VALUES(...)` での人間に優しい形式からの入力
- `SELECT domain_column FROM domain_table` に対する人間に優しい形式への出力
- 外部ソースからのデータを人間に優しい形式で読み込む: `INSERT INTO domain_table FORMAT CSV ...`

### 制限事項 {#limitations}

- `ALTER TABLE` を介して基本型のインデックスカラムをドメイン型に変換できません。
- 別のカラムやテーブルからデータを挿入する際に、文字列値をドメイン値に暗黙的に変換することはできません。
- ドメインは保存された値に対する制約を追加しません。
