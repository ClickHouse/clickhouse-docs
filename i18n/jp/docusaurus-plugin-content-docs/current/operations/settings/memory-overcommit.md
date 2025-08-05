---
description: 'クエリの柔軟なメモリ制限を設定できるようにするための実験的なテクニック。'
slug: '/operations/settings/memory-overcommit'
title: 'メモリオーバーコミット'
---




# メモリオーバーコミット

メモリオーバーコミットは、クエリのメモリ制限をより柔軟に設定できるようにするための実験的な技術です。

この技術のアイデアは、クエリが使用できることが保証されたメモリ量を表す設定を導入することです。
メモリオーバーコミットが有効になっていてメモリ制限に達すると、ClickHouseは最もオーバーコミットされたクエリを選択し、このクエリを停止させることによってメモリを解放しようとします。

メモリ制限に達すると、クエリは新しいメモリを割り当てようとする際にしばらく待機します。
タイムアウトが経過してメモリが解放されると、クエリは実行を続行します。
そうでなければ、例外がスローされ、クエリは殺されます。

停止または殺すクエリの選択は、どのメモリ制限に達したかに応じて、グローバルまたはユーザーオーバーコミットトラッカーによって行われます。
オーバーコミットトラッカーが停止するクエリを選択できない場合、MEMORY_LIMIT_EXCEEDED例外がスローされます。

## ユーザーオーバーコミットトラッカー {#user-overcommit-tracker}

ユーザーオーバーコミットトラッカーは、ユーザーのクエリリストの中で最もオーバーコミット比率が大きいクエリを見つけます。
クエリのオーバーコミット比率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator_for_user` 設定の値で割ることで計算されます。

クエリの `memory_overcommit_ratio_denominator_for_user` がゼロの場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは `memory_usage_overcommit_max_wait_microseconds` 設定によって設定されます。

**例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## グローバルオーバーコミットトラッカー {#global-overcommit-tracker}

グローバルオーバーコミットトラッカーは、すべてのクエリのリストの中で最もオーバーコミット比率が大きいクエリを見つけます。
この場合、オーバーコミット比率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator` 設定の値で割ることで計算されます。

クエリの `memory_overcommit_ratio_denominator` がゼロの場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは、構成ファイル内の `memory_usage_overcommit_max_wait_microseconds` パラメータによって設定されます。
