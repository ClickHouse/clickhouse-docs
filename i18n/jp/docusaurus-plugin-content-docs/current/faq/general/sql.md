---
title: 'ClickHouse はどのような SQL 構文をサポートしていますか?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/sql
description: 'ClickHouse は SQL 構文を 100% サポートしています'
doc_type: 'reference'
keywords: ['SQL syntax', 'ANSI SQL']
---

# ClickHouse はどのような SQL 構文をサポートしていますか？

ClickHouse は、次のような機能を含む SQL 構文を完全にサポートしています。

- SQL/JSON および JSON データ型 (SQL-2023)
- ウィンドウ関数 (SQL-2003)
- 共通テーブル式および再帰クエリ (SQL-1999)
- ROLLUP、CUBE、GROUPING SETS (SQL-1999)
- RBAC を完全にサポート (SQL-1999)
- 相関サブクエリ (SQL-1992)

このサポートは、TPC-H および TPC-DS ベンチマーク、ならびに SQLTest によって検証されています。

ClickHouse は、以下のような多くの機能を ISO/IEC によって標準化される前に導入しました。

- 条件付き集約関数
- `any` 集約関数
- `least` および `greatest`
- `GROUP BY ALL`
- エイリアスの拡張的な活用
- 数値リテラルでのアンダースコアの使用

ClickHouse は、使い勝手を大きく向上させる機能を数多く導入することで SQL を拡張しています。

- エイリアスの自由な利用
- WITH 句内部でのエイリアス
- 集約関数コンビネータ
- パラメータ化された集約関数
- 近似集約関数
- ネイティブおよびビッグ整数の数値型、拡張精度の Decimal
- 配列操作のための高階関数
- ARRAY JOIN 句および arrayJoin 関数
- 配列集約
- LIMIT BY 句
- GROUP BY WITH TOTALS
- AS OF JOIN
- ANY/ALL JOIN
- JSON の自然な構文
- カラムリスト末尾のトレーリングカンマ
- FROM ... SELECT という句順序
- 型安全なクエリパラメータおよびパラメータ化されたビュー

これらの一部は、今後の SQL 標準に取り込まれる可能性がありますが、ClickHouse のユーザーはすでに利用できます。