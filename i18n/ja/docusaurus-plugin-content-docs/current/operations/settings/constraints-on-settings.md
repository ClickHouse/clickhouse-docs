---
slug: /operations/settings/constraints-on-settings
sidebar_position: 62
sidebar_label: 設定に関する制約
title: "設定に関する制約"
description: "設定に関する制約は、`user.xml` 設定ファイルの `profiles` セクションに定義でき、ユーザーが `SET` クエリを使用していくつかの設定を変更することを禁止します。"
---

# 設定に関する制約

設定に関する制約は、`user.xml` 設定ファイルの `profiles` セクションに定義でき、ユーザーが `SET` クエリを使用していくつかの設定を変更することを禁止します。制約は以下のように定義されます：

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

ユーザーが制約を違反しようとすると、例外がスローされ、設定は変更されません。サポートされている制約のタイプには、`min`、`max`、`readonly`（エイリアス `const`）および `changeable_in_readonly` があります。`min` と `max` の制約は、数値設定の上限と下限を指定し、組み合わせて使用できます。`readonly` または `const` の制約は、ユーザーが対応する設定を全く変更できないことを指定します。`changeable_in_readonly` の制約タイプは、`readonly` 設定が 1 に設定されている場合でも、`min`/`max` 範囲内で設定を変更できることを許可します。それ以外の場合、`readonly=1` モードでは設定を変更することができません。`changeable_in_readonly` は、`settings_constraints_replace_previous` が有効な場合にのみサポートされます：
``` xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```

ユーザーに対して複数のプロファイルがアクティブな場合、制約はマージされます。マージプロセスは `settings_constraints_replace_previous` に依存します：
- **true**（推奨）：同じ設定の制約がマージ中に置き換えられ、最後の制約が使用され、以前のすべてが無視され、新しい制約で設定されていないフィールドも無視されます。
- **false**（デフォルト）：同じ設定の制約は、設定されていない制約の種類は前のプロファイルから取得され、設定された制約の種類は新しいプロファイルからの値で置き換えられる方法でマージされます。

読み取り専用モードは `readonly` 設定によって有効になります（`readonly` 制約タイプと混同しないでください）：
- `readonly=0`: 読み取り専用の制限はありません。
- `readonly=1`: 読み取りクエリのみが許可され、`changeable_in_readonly` が設定されていない限り設定は変更できません。
- `readonly=2`: 読み取りクエリのみが許可されますが、設定は変更可能であり、`readonly` 設定自身を除きます。

**例:** `users.xml` に以下の行が含まれているとします：

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

次のクエリはすべて例外をスローします：

``` sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

``` text
Code: 452, e.displayText() = DB::Exception: 設定 max_memory_usage は 20000000000 を超えてはいけません。
Code: 452, e.displayText() = DB::Exception: 設定 max_memory_usage は 5000000000 未満であってはいけません。
Code: 452, e.displayText() = DB::Exception: 設定 force_index_by_date は変更してはいけません。
```

**注意:** `default` プロファイルには特別な処理があります：`default` プロファイルに定義されたすべての制約はデフォルトの制約となり、これによりすべてのユーザーが制約を受けますが、これらのユーザーに対して明示的にオーバーライドされるまで適用されます。

## マージツリー設定に関する制約 {#constraints-on-merge-tree-settings}
[マージツリー設定](merge-tree-settings.md) に対する制約を設定することができます。これらの制約は、マージツリーエンジンを使用してテーブルが作成されるときや、そのストレージ設定が変更されるときに適用されます。マージツリー設定の名前は、`<constraints>` セクション内で参照されるときには `merge_tree_` プレフィックスを前置しなければなりません。

**例:** 明示的に指定された `storage_policy` で新しいテーブルを作成することを禁止します。

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
