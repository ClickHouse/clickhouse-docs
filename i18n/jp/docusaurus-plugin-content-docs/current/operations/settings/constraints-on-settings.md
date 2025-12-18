---
description: '`user.xml` 設定ファイルの `profiles` セクションで設定に対する制約を定義でき、これによりユーザーが `SET` クエリを使って一部の設定を変更することを禁止できます。'
sidebar_label: '設定への制約'
sidebar_position: 62
slug: /operations/settings/constraints-on-settings
title: '設定への制約'
doc_type: 'reference'
---

# 設定上の制約事項 {#constraints-on-settings}

## 概要 {#overview}

ClickHouse における設定に対する「制約」とは、その設定に付与できる制限やルールを指します。これらの制約を適用することで、データベースの安定性、セキュリティ、および予測可能な動作を維持できます。

## 制約の定義 {#defining-constraints}

設定に対する制約は、`user.xml` 設定ファイルの `profiles` セクションで定義できます。これにより、ユーザーが [`SET`](/sql-reference/statements/set) ステートメントを使用して一部の設定を変更できないようにします。

制約は次のように定義します。

```xml
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
      <setting_name_6>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
        <disallowed>value1</disallowed>
        <disallowed>value2</disallowed>
        <disallowed>value3</disallowed>
        <changeable_in_readonly/>
      </setting_name_6>
    </constraints>
  </user_name>
</profiles>
```

ユーザーが制約に違反しようとすると例外がスローされ、設定は変更されずにそのまま維持されます。

## 制約の種類 {#types-of-constraints}

ClickHouse でサポートされている制約には、いくつかの種類があります。

* `min`
* `max`
* `disallowed`
* `readonly`（エイリアス `const`）
* `changeable_in_readonly`

`min` と `max` 制約は、数値設定に対する下限および上限を指定し、互いに組み合わせて使用できます。

`disallowed` 制約は、特定の設定に対して許可してはならない値を指定するために使用できます。

`readonly` または `const` 制約は、ユーザーが対応する設定を一切変更できないことを示します。

`changeable_in_readonly` 制約タイプを使用すると、`readonly` 設定が `1` に設定されている場合でも、`min`/`max` の範囲内であればその設定を変更できます。それ以外の設定は、`readonly=1` モードでは変更できません。

:::note
`changeable_in_readonly` は、`settings_constraints_replace_previous`
が有効化されている場合にのみサポートされます。

```xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```

:::

## 複数の制約プロファイル {#multiple-constraint-profiles}

ユーザーに対して複数のプロファイルがアクティブな場合、それらの制約はマージされます。
マージ方法は `settings_constraints_replace_previous` によって決まります:
- **true** (推奨): 同じ設定に対する制約はマージ時に置き換えられ、最後に適用される制約のみが使用され、それ以前のものはすべて無視されます。
  これには、新しい制約で設定されていないフィールドも含まれます。
- **false** (デフォルト): 同じ設定に対する制約は、未設定の種類の制約は前のプロファイルから引き継ぎ、設定されている種類の制約は新しいプロファイルの値で置き換える形でマージされます。

## 読み取り専用モード {#read-only}

読み取り専用モードは `readonly` 設定によって有効になります。これは
`readonly` 制約タイプと混同しないでください。

* `readonly=0`: 読み取り専用に関する制限はありません。
* `readonly=1`: 読み取りクエリのみ許可され、`changeable_in_readonly` が設定されていない限り、設定を変更できません。
* `readonly=2`: 読み取りクエリのみ許可されますが、`readonly` 設定自体を除き、その他の設定を変更できます。

### 例 {#example-read-only}

`users.xml` に次の行が含まれているとします。

```xml
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

以下のクエリはすべて例外をスローします。

```sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

```text
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be greater than 20000000000.
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be less than 5000000000.
Code: 452, e.displayText() = DB::Exception: Setting force_index_by_date should not be changed.
```

:::note
`default` プロファイルは特別に扱われます。`default` プロファイルに定義されたすべての制約はデフォルトの制約となり、各ユーザーに対して明示的に上書きされるまで、すべてのユーザーに対して制約として適用されます。
:::

## MergeTree 設定に対する制約 {#constraints-on-merge-tree-settings}

[MergeTree 設定](merge-tree-settings.md) に対して制約を設定できます。
これらの制約は、MergeTree エンジンを使用するテーブルを作成するとき、
またはそのストレージ設定を変更するときに適用されます。

`<constraints>` セクション内で参照する場合は、
MergeTree 設定名の前に `merge_tree_` プレフィックスを付ける必要があります。

### 例 {#example-mergetree}

明示的に `storage_policy` を指定して新しいテーブルを作成できないようにすることができます。

```xml
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
