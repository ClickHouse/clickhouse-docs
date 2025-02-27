---
slug: /sql-reference/data-types/domains/
sidebar_position: 56
sidebar_label: ドメイン
---

# ドメイン

ドメインは、既存の基本型の上にいくつかの追加機能を提供する特別な目的の型ですが、基盤となるデータ型のオンワイヤーおよびオンディスク形式はそのまま保持されます。現時点では、ClickHouseはユーザー定義のドメインをサポートしていません。

ドメインは、対応する基本型が使用できる場所であればどこでも使用できます。例えば：

- ドメイン型のカラムを作成する
- ドメインカラムから値を読み書きする
- 基本型がインデックスとして使用できる場合、インデックスとして使用する
- ドメインカラムの値を使用して関数を呼び出す

### ドメインの追加機能 {#extra-features-of-domains}

- `SHOW CREATE TABLE` または `DESCRIBE TABLE` における明示的なカラム型名
- 人間に優しい形式からの入力：`INSERT INTO domain_table(domain_column) VALUES(...)`
- 人間に優しい形式での出力：`SELECT domain_column FROM domain_table`
- 外部ソースから人間に優しい形式でデータをロードする：`INSERT INTO domain_table FORMAT CSV ...`

### 制限事項 {#limitations}

- 基本型のインデックスカラムをドメイン型に変換することはできません（`ALTER TABLE`を介して）。
- 別のカラムまたはテーブルからデータを挿入する際に、文字列値をドメイン値に暗黙的に変換することはできません。
- ドメインは保存される値に対する制約を追加しません。
