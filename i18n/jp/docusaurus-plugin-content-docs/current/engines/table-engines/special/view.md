---
description: 'ビューを実装するために使用されます（詳細は `CREATE VIEW` クエリを参照してください）。データ自体は保存せず、指定された `SELECT` クエリのみを保持します。テーブルから読み取る際にはこのクエリを実行し、その際にクエリから不要な列をすべて削除します。'
sidebar_label: 'View'
sidebar_position: 90
slug: /engines/table-engines/special/view
title: 'View テーブルエンジン'
doc_type: 'reference'
---

# View テーブルエンジン

ビューを実装するために使用されます（詳細は `CREATE VIEW` クエリを参照してください）。データ自体は保持せず、指定された `SELECT` クエリのみを保持します。テーブルから読み出す際には、このクエリを実行し、その際に不要なカラムはクエリからすべて削除されます。