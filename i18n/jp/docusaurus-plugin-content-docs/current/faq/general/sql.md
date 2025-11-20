---
title: 'ClickHouse はどのような SQL 構文をサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/sql
description: 'ClickHouse は SQL 構文を 100% サポートしています'
doc_type: 'reference'
keywords: ['SQL syntax', 'ANSI SQL']
---

# ClickHouse はどのような SQL 構文をサポートしていますか？

ClickHouse は、次のような機能を含め、SQL 構文を完全にサポートしています。

- SQL/JSON と JSON データ型 (SQL-2023)
- ウィンドウ関数 (SQL-2003)
- 共通テーブル式および再帰クエリ (SQL-1999)
- ROLLUP、CUBE、GROUPING SETS (SQL-1999)
- RBAC の完全サポート (SQL-1999)
- 相関サブクエリ (SQL-1992)

このサポートは、TPC-H と TPC-DS のベンチマークおよび SQLTest によって検証されています。

ClickHouse では、ISO/IEC によって標準化されるより前から、次のような多くの機能を導入してきました。

- 条件付き集約関数
- `any` 集約関数
- `least` と `greatest`
- `GROUP BY ALL`
- エイリアスの拡張的な利用
- 数値リテラルでのアンダースコア

ClickHouse は、使い勝手を大きく向上させる機能を導入することで、SQL を拡張しています。

- エイリアスの自由な利用
- WITH 句内でのエイリアス
- 集約関数コンビネータ
- パラメータ化された集約関数
- 近似集約関数
- ネイティブおよびビッグ整数の数値データ型、拡張精度の Decimal
- 配列操作のための高階関数
- ARRAY JOIN 句と arrayJoin 関数
- 配列の集約
- LIMIT BY 句
- GROUP BY WITH TOTALS
- AS OF JOIN
- ANY/ALL JOIN
- JSON のための自然な構文
- カラム一覧における末尾のカンマ
- FROM ... SELECT の句順
- 型安全なクエリパラメータとパラメータ化ビュー

これらの一部は、今後の SQL 標準に取り込まれる可能性がありますが、ClickHouse ユーザーはすでに利用できます。