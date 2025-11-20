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

ClickHouse は、次のような機能を含む SQL 構文を完全にサポートしています：

- SQL/JSON および JSON データ型 (SQL-2023)
- ウィンドウ関数 (SQL-2003)
- 共通テーブル式および再帰クエリ (SQL-1999)
- ROLLUP、CUBE、GROUPING SETS (SQL-1999)
- RBAC の完全サポート (SQL-1999)
- 相関サブクエリ (SQL-1992)

このサポートは、TPC-H および TPC-DS ベンチマークならびに SQLTest によって検証されています。

ClickHouse は、ISO/IEC によって標準化される前に、次のような多くの機能を導入しました：

- 条件付き集約関数
- `any` 集約関数
- `least` と `greatest`
- `GROUP BY ALL`
- エイリアスの拡張的な利用
- 数値リテラルでのアンダースコア

ClickHouse は、利便性を大きく高める機能を導入することで SQL を拡張しています：

- エイリアスの制限のない使用
- WITH 句内でのエイリアス
- 集約関数コンビネータ
- パラメータ化された集約関数
- 近似集約関数
- ネイティブおよびビッグ整数の数値データ型、拡張精度 decimal
- 配列操作向けの高階関数
- ARRAY JOIN 句および arrayJoin 関数
- 配列集約
- LIMIT BY 句
- GROUP BY WITH TOTALS
- AS OF JOIN
- ANY/ALL JOIN
- JSON 向けの自然な構文
- カラムリスト末尾のカンマ
- FROM ... SELECT の句順
- 型安全なクエリパラメータおよびパラメータ化ビュー

これらのうちいくつかは、今後の SQL 標準に取り込まれる可能性がありますが、ClickHouse ユーザーはすでに利用できます。