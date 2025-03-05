---
title: "メモリオーバーコミット"
description: "クエリのためにより柔軟なメモリ制限を設定することを目的とした実験的な技術。"
slug: /operations/settings/memory-overcommit
---


# メモリオーバーコミット

メモリオーバーコミットは、クエリのためにより柔軟なメモリ制限を設定することを目的とした実験的な技術です。

この技術のアイデアは、クエリが使用できるメモリの保証された量を表す設定を導入することです。  
メモリオーバーコミットが有効になり、メモリ制限に達すると、ClickHouseは最もオーバーコミットされたクエリを選択し、そのクエリを終了させることによってメモリを解放しようとします。

メモリ制限に達すると、どのクエリも新しいメモリを割り当てようとする試みの間にしばらく待機します。  
タイムアウトが過ぎてメモリが解放されると、クエリは実行を続けます。  
そうでない場合は例外がスローされ、クエリは終了されます。

停止または終了するクエリの選択は、達成されたメモリ制限に応じて、グローバルまたはユーザーオーバーコミットトラッカーによって行われます。  
オーバーコミットトラッカーが停止するクエリを選択できない場合、MEMORY_LIMIT_EXCEEDED 例外がスローされます。

## ユーザーオーバーコミットトラッカー {#user-overcommit-tracker}

ユーザーオーバーコミットトラッカーは、ユーザーのクエリリスト内で最もオーバーコミット比率が大きいクエリを見つけます。  
クエリのオーバーコミット比率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator_for_user` 設定の値で割ることによって計算されます。

クエリの `memory_overcommit_ratio_denominator_for_user` がゼロである場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは `memory_usage_overcommit_max_wait_microseconds` 設定によって設定されます。

**例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```

## グローバルオーバーコミットトラッカー {#global-overcommit-tracker}

グローバルオーバーコミットトラッカーは、全てのクエリのリスト内で最もオーバーコミット比率が大きいクエリを見つけます。  
この場合、オーバーコミット比率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator` 設定の値で割ることによって計算されます。

クエリの `memory_overcommit_ratio_denominator` がゼロである場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは、設定ファイル内の `memory_usage_overcommit_max_wait_microseconds` パラメータによって設定されます。
