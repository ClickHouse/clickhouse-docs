---
slug: /operations/settings/constraints-on-settings
sidebar_position: 62
sidebar_label: 設定に関する制約
title: "設定に関する制約"
description: "設定に関する制約は `user.xml` 構成ファイルの `profiles` セクションで定義され、ユーザーが `SET` クエリを使用して一部の設定を変更することを禁止します。"
---


# 設定に関する制約

設定に関する制約は `user.xml` 構成ファイルの `profiles` セクションで定義され、ユーザーが `SET` クエリを使用して一部の設定を変更することを禁止します。
制約は以下のように定義されます:

``` xml
<profiles>
  <user_name>
    <constraints>
      <setting_name_1>
        <min>lower_boundary</min>
      </setting_name_1>
      <setting_name_2>
        <max>upper_boundary</max>
      </setting_name_2>
      <setting_name_3>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
      </setting_name_3>
      <setting_name_4>
        <readonly/>
      </setting_name_4>
      <setting_name_5>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
        <changeable_in_readonly/>
      </setting_name_5>
    </constraints>
  </user_name>
</profiles>
```

ユーザーが制約を破ろうとした場合、例外がスローされ、設定は変更されません。
サポートされている制約のタイプは、`min`、`max`、`readonly` (エイリアス `const`) および `changeable_in_readonly` です。`min` と `max` の制約は数値設定の上限と下限を指定し、組み合わせて使用することができます。`readonly` または `const` 制約は、ユーザーが対応する設定をまったく変更できないことを指定します。`changeable_in_readonly` 制約タイプは、`readonly` 設定が 1 に設定されている場合でも、ユーザーが `min` / `max` 範囲内で設定を変更できることを可能にします。それ以外の場合、`readonly=1` モードでは設定の変更は許可されません。`changeable_in_readonly` は、`settings_constraints_replace_previous` が有効な場合にのみサポートされます:
``` xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```

ユーザーに複数のプロファイルがアクティブな場合、制約はマージされます。マージプロセスは `settings_constraints_replace_previous` に依存します:
- **true** (推奨): 同じ設定の制約はマージ中に置き換えられ、最後の制約が使用され、以前のすべての制約は無視されます。
- **false** (デフォルト): 同じ設定の制約はマージされ、設定されていない各種類の制約は以前のプロファイルから取得され、設定されている各種類の制約は新しいプロファイルの値で置き換えられます。

読み取り専用モードは `readonly` 設定によって有効になります (ここで `readonly` 制約タイプと混同しないでください):
- `readonly=0`: 読み取り専用の制限なし。
- `readonly=1`: 読み取りクエリのみが許可され、`changeable_in_readonly` が設定されていない限り、設定は変更できません。
- `readonly=2`: 読み取りクエリのみが許可されますが、設定は変更可能で、`readonly` 設定自体は除外されます。

**例:** `users.xml` に以下の行が含まれているとします:

``` xml
<profiles>
  <default>
    <max_memory_usage>10000000000</max_memory_usage>
    <force_index_by_date>0</force_index_by_date>
    ...
    <constraints>
      <max_memory_usage>
        <min>5000000000</min>
        <max>20000000000</max>
      </max_memory_usage>
      <force_index_by_date>
        <readonly/>
      </force_index_by_date>
    </constraints>
  </default>
</profiles>
```

以下のクエリはすべて例外をスローします:

``` sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

``` text
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be greater than 20000000000.
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be less than 5000000000.
Code: 452, e.displayText() = DB::Exception: Setting force_index_by_date should not be changed.
```

**注:** `default` プロファイルは特別な扱いを受けます: `default` プロファイルで定義されたすべての制約はデフォルト制約となり、これらの制約は明示的にオーバーライドされない限りすべてのユーザーを制限します。

## マージツリー設定に関する制約 {#constraints-on-merge-tree-settings}
[マージツリー設定](merge-tree-settings.md)に対して制約を設定することが可能です。これらの制約は、マージツリーエンジンのテーブルが作成されるときや、そのストレージ設定が変更されるときに適用されます。マージツリー設定の名前は `<constraints>` セクションで参照される際に `merge_tree_` プレフィックスを追加する必要があります。

**例:** 明示的に指定された `storage_policy` で新しいテーブルの作成を禁止

``` xml
<profiles>
  <default>
    <constraints>
      <merge_tree_storage_policy>
        <const/>
      </merge_tree_storage_policy>
    </constraints>
  </default>
</profiles>
```
