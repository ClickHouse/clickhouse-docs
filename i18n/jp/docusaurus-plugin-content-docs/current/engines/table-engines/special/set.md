---
description: 'A data set that is always in RAM. It is intended for use on the right
  side of the `IN` operator.'
sidebar_label: 'Set'
sidebar_position: 60
slug: '/engines/table-engines/special/set'
title: 'Set Table Engine'
---




# Set Table Engine

常にRAMにあるデータセットです。`IN`演算子の右側での使用を目的としています（「IN演算子」セクションを参照）。

`INSERT`を使用してテーブルにデータを挿入できます。新しい要素はデータセットに追加され、重複は無視されます。しかし、テーブルから`SELECT`を実行することはできません。データを取得する唯一の方法は、`IN`演算子の右半分で使用することです。

データは常にRAMにあります。`INSERT`の場合、挿入されたデータのブロックもディスク上のテーブルのディレクトリに書き込まれます。サーバーを起動すると、このデータがRAMに読み込まれます。言い換えれば、再起動後もデータはそのまま残ります。

サーバーが強制的に再起動されると、ディスク上のデータブロックが失われるか、損傷する可能性があります。後者の場合、損傷したデータのファイルを手動で削除する必要があるかもしれません。

### Limitations and Settings {#join-limitations-and-settings}

テーブルを作成するとき、以下の設定が適用されます。

#### persistent {#persistent}

Setおよび[Join](/engines/table-engines/special/join)テーブルエンジンの永続性を無効にします。

I/Oオーバーヘッドを削減します。パフォーマンスを追求し、永続性を必要としないシナリオに適しています。

考えられる値：

- 1 — 有効。
- 0 — 無効。

デフォルト値: `1`。
