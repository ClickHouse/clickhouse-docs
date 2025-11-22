---
description: 'クエリに対して、より柔軟なメモリ制限を設定できるようにするための実験的な手法。'
slug: /operations/settings/memory-overcommit
title: 'メモリオーバーコミット'
doc_type: 'reference'
---



# メモリオーバーコミット

メモリオーバーコミットは、クエリに対してより柔軟なメモリ制限を設定できるようにすることを目的とした実験的な手法です。

この手法の考え方は、クエリが使用できるメモリの保証量を表現できる設定項目を導入することです。
メモリオーバーコミットが有効でメモリ制限に達した場合、ClickHouse は最もオーバーコミットしているクエリを選択し、そのクエリを強制終了することでメモリを解放しようとします。

メモリ制限に達したとき、すべてのクエリは新たなメモリ割り当てを試みている間、一定時間待機します。
タイムアウトが経過するまでにメモリが解放されれば、そのクエリは実行を継続します。
そうでない場合は例外がスローされ、そのクエリは強制終了されます。

停止または強制終了するクエリの選択は、どのメモリ制限に達したかに応じて、グローバルまたはユーザーレベルのオーバーコミットトラッカーのいずれかによって行われます。
オーバーコミットトラッカーが停止すべきクエリを選択できない場合、`MEMORY_LIMIT_EXCEEDED` 例外がスローされます。



## ユーザーオーバーコミットトラッカー {#user-overcommit-tracker}

ユーザーオーバーコミットトラッカーは、ユーザーのクエリリスト内で最大のオーバーコミット比率を持つクエリを検出します。
クエリのオーバーコミット比率は、割り当てられたバイト数を`memory_overcommit_ratio_denominator_for_user`設定の値で除算して計算されます。

クエリの`memory_overcommit_ratio_denominator_for_user`がゼロの場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは`memory_usage_overcommit_max_wait_microseconds`設定で設定されます。

**例**

```sql
SELECT number FROM numbers(1000) GROUP BY number SETTINGS memory_overcommit_ratio_denominator_for_user=4000, memory_usage_overcommit_max_wait_microseconds=500
```


## グローバルオーバーコミットトラッカー {#global-overcommit-tracker}

グローバルオーバーコミットトラッカーは、全クエリのリストから最大のオーバーコミット比率を持つクエリを検出します。
この場合、オーバーコミット比率は、割り当てられたバイト数を`memory_overcommit_ratio_denominator`設定の値で除算して計算されます。

クエリの`memory_overcommit_ratio_denominator`がゼロの場合、オーバーコミットトラッカーはこのクエリを選択しません。

待機タイムアウトは、設定ファイルの`memory_usage_overcommit_max_wait_microseconds`パラメータによって設定されます。
