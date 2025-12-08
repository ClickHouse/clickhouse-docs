---
title: 'ClickHouse はどのような SQL 構文をサポートしていますか？'
toc_hidden: true
toc_priority: 10
slug: /faq/general/sql
description: 'ClickHouse は SQL 構文を 100% サポートしています'
doc_type: 'reference'
keywords: ['SQL 構文', 'ANSI SQL']
---

# ClickHouse はどのような SQL 構文をサポートしていますか？ {#what-sql-syntax-does-clickhouse-support}

ClickHouse は SQL 構文を完全にサポートしており、次のような機能が含まれます。

* SQL/JSON と JSON データ型 (SQL-2023)
* ウィンドウ関数 (SQL-2003)
* 共通テーブル式 (CTE) と再帰クエリ (SQL-1999)
* ROLLUP、CUBE、GROUPING SETS (SQL-1999)
* RBAC の完全サポート (SQL-1999)
* 相関サブクエリ (SQL-1992)

このサポートは、TPC-H および TPC-DS ベンチマーク、ならびに SQLTest によって検証されています。

ClickHouse は、ISO/IEC によって標準化される以前から、次のような多くの機能を導入してきました。

* 条件付き集約関数
* `any` 集約関数
* `least` と `greatest`
* `GROUP BY ALL`
* エイリアスの拡張的な利用
* 数値リテラル内でのアンダースコア

ClickHouse は、次のような大きな利便性向上機能を導入することで、SQL を拡張しています。

* エイリアスの自由な利用
* WITH 句内でのエイリアス
* 集約関数コンビネータ
* パラメータ化された集約関数
* 近似集約関数
* ネイティブおよびビッグ整数の数値データ型、拡張精度の decimal
* 配列操作のための高階関数
* ARRAY JOIN 句および arrayJoin 関数
* 配列集約
* LIMIT BY 句
* GROUP BY WITH TOTALS
* AS OF JOIN
* ANY/ALL JOIN
* JSON の自然な構文
* カラムリスト末尾のカンマ
* FROM ... SELECT の句順
* 型安全なクエリパラメータおよびパラメータ化ビュー

これらの一部は、今後の SQL 標準に取り込まれる可能性がありますが、ClickHouse ではすでに利用可能です。