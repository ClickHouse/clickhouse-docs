---
'description': 'ClickHouseにおけるドメインタイプの概要で、基本タイプに追加機能を拡張します'
'sidebar_label': 'ドメイン'
'sidebar_position': 56
'slug': '/sql-reference/data-types/domains/'
'title': 'ドメイン'
'doc_type': 'reference'
---


# ドメイン

ドメインは、既存の基本型の上に追加機能を加える特別な目的の型であり、基になるデータ型のオンワイヤーおよびオンディスクフォーマットはそのまま維持されます。現在、ClickHouseはユーザー定義のドメインをサポートしていません。

ドメインは、対応する基本型が使用できる任意の場所で使用することができます。例えば：

- ドメイン型のカラムを作成する
- ドメインカラムから値を読み書きする
- 基本型がインデックスとして使用できる場合にインデックスとして使用する
- ドメインカラムの値を用いて関数を呼び出す

### ドメインの追加機能 {#extra-features-of-domains}

- `SHOW CREATE TABLE`または`DESCRIBE TABLE`における明示的なカラム型名
- `INSERT INTO domain_table(domain_column) VALUES(...)`を使用して人間に優しいフォーマットからの入力
- `SELECT domain_column FROM domain_table`のための人間に優しいフォーマットへの出力
- 人間に優しいフォーマットでの外部ソースからのデータの読み込み: `INSERT INTO domain_table FORMAT CSV ...`

### 制限事項 {#limitations}

- `ALTER TABLE`を通じて基本型のインデックスカラムをドメイン型に変換することはできません。
- 別のカラムまたはテーブルからデータを挿入する際に、文字列値をドメイン値に暗黙的に変換することはできません。
- ドメインは保存された値に制約を追加しません。
