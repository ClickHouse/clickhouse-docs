---
description: 'ビューの実装に使用されます（詳細は `CREATE VIEW` クエリを参照してください）。データ自体は保存せず、指定された `SELECT` クエリのみを保持します。このエンジンを使用するテーブルから読み取る際には、このクエリを実行し（クエリから不要な列をすべて削除した上で）、結果を返します。'
sidebar_label: 'View'
sidebar_position: 90
slug: /engines/table-engines/special/view
title: 'View テーブルエンジン'
doc_type: 'reference'
---

# View テーブルエンジン

ビューを実装するために使用されます（詳細は `CREATE VIEW query` を参照してください）。データ自体は保存せず、指定された `SELECT` クエリだけを保持します。テーブルから読み取る際には、このクエリを実行し（不要なカラムはクエリからすべて削除され）、結果を返します。