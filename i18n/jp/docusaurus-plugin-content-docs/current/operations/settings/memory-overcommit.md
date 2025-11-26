---
description: 'クエリごとにより柔軟なメモリ制限を設定できるようにすることを目的とした実験的な手法。'
slug: /operations/settings/memory-overcommit
title: 'メモリオーバーコミット'
doc_type: 'reference'
---



# メモリオーバーコミット

メモリオーバーコミットは、クエリに対してより柔軟にメモリ制限を設定できるようにすることを目的とした実験的な手法です。

この手法の考え方は、クエリが使用できるメモリの保証量を表現する設定を導入することにあります。
メモリオーバーコミットが有効な状態でメモリ制限に達した場合、ClickHouse は最もオーバーコミットしているクエリを選択し、そのクエリを強制終了することでメモリの解放を試みます。

メモリ制限に達した場合、クエリは新しいメモリの割り当てを試みている間、一定時間待機します。
タイムアウトまでにメモリが解放されれば、そのクエリは実行を継続します。
そうでない場合は例外がスローされ、そのクエリは強制終了されます。

停止または強制終了するクエリの選択は、どのメモリ制限に達したかに応じて、グローバルまたはユーザーのオーバーコミットトラッカーのいずれかによって行われます。
オーバーコミットトラッカーが停止させるクエリを選択できない場合、MEMORY_LIMIT_EXCEEDED 例外がスローされます。



## ユーザーオーバーコミットトラッカー

ユーザーオーバーコミットトラッカーは、ユーザーのクエリの中から、最もオーバーコミット率が高いクエリを特定します。
クエリのオーバーコミット率は、割り当てられたバイト数を `memory_overcommit_ratio_denominator_for_user` 設定値で割ることで計算されます。

そのクエリに対する `memory_overcommit_ratio_denominator_for_user` がゼロの場合、オーバーコミットトラッカーはそのクエリを選択しません。

待機タイムアウトは、`memory_usage_overcommit_max_wait_microseconds` 設定で指定されます。

**例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```


## グローバルオーバーコミットトラッカー {#global-overcommit-tracker}

グローバルオーバーコミットトラッカーは、すべてのクエリの一覧の中から、オーバーコミット率が最大のクエリを検出します。
ここでのオーバーコミット率は、割り当てられたバイト数を設定値 `memory_overcommit_ratio_denominator` で割った値として計算されます。

そのクエリの `memory_overcommit_ratio_denominator` が 0 に設定されている場合、オーバーコミットトラッカーはそのクエリを選択しません。

待機タイムアウトは、設定ファイル内のパラメータ `memory_usage_overcommit_max_wait_microseconds` によって設定されます。
