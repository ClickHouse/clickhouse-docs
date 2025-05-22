---
'description': 'Constraints on settings can be defined in the `profiles` section of
  the `user.xml` configuration file and prohibit users from changing some of the settings
  with the `SET` query.'
'sidebar_label': 'Constraints on Settings'
'sidebar_position': 62
'slug': '/operations/settings/constraints-on-settings'
'title': 'Constraints on Settings'
---




# 設定に対する制約

## 概要 {#overview}

ClickHouseにおける「設定に対する制約」とは、設定に対して割り当てることができる制限やルールを指します。これらの制約は、データベースの安定性、セキュリティ、および予測可能な動作を維持するために適用されます。

## 制約の定義 {#defining-constraints}

設定に対する制約は、`user.xml`構成ファイルの`profiles`セクションで定義できます。これにより、ユーザーが一部の設定を[`SET`](/sql-reference/statements/set)ステートメントを使用して変更することを禁止します。

制約は以下のように定義されます：

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

ユーザーが制約に違反しようとすると、例外がスローされ、設定は変更されません。

## 制約の種類 {#types-of-constraints}

ClickHouseでサポートされている制約の種類はいくつかあります：
- `min`
- `max`
- `disallowed`
- `readonly`（エイリアス `const`）
- `changeable_in_readonly`

`min`および`max`制約は、数値設定の上限および下限を指定し、相互に組み合わせて使用できます。

`disallowed`制約は、特定の設定に対して許可されていない特定の値を指定するために使用できます。

`readonly`または`const`制約は、ユーザーが対応する設定を一切変更できないことを指定します。

`changeable_in_readonly`制約タイプは、`readonly`設定が`1`に設定されていても、`min`/`max`範囲内で設定を変更できるようにします。それ以外の場合、`readonly=1`モードでは設定を変更できません。

:::note
`changeable_in_readonly`は、`settings_constraints_replace_previous`が有効な場合のみサポートされます：

```xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```
:::

## 複数の制約プロファイル {#multiple-constraint-profiles}

ユーザーに対して複数のプロファイルがアクティブな場合、制約はマージされます。マージプロセスは`settings_constraints_replace_previous`に依存します：
- **true**（推奨）：同じ設定の制約はマージ時に置き換えられ、最後の制約が使用され、すべての以前の制約は無視されます。これには新しい制約で設定されていないフィールドも含まれます。
- **false**（デフォルト）：同じ設定の制約は、すべての未設定の制約タイプは以前のプロファイルから取得され、すべての設定済みの制約タイプは新しいプロファイルからの値で置き換えられます。

## 読み取り専用モード {#read-only}

読み取り専用モードは、`readonly`設定によって有効化され、`readonly`制約タイプと混同してはいけません：
- `readonly=0`：読み取り専用の制限なし。
- `readonly=1`：読み取りクエリのみが許可され、`changeable_in_readonly`が設定されていない限り設定は変更できません。
- `readonly=2`：読み取りクエリのみが許可されますが、設定は変更可能で、`readonly`設定自体は除きます。

### 例 {#example-read-only}

`users.xml`に以下の行が含まれているとします：

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

次のクエリはすべて例外をスローします：

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
`default`プロファイルは独自に処理されます：`default`プロファイルのために定義されたすべての制約はデフォルトの制約となり、それによって明示的にオーバーライドされるまで、すべてのユーザーを制限します。
:::

## MergeTree設定の制約 {#constraints-on-merge-tree-settings}

[Merge tree設定](merge-tree-settings.md)に対する制約を設定することが可能です。これらの制約は、MergeTreeエンジンを持つテーブルが作成されるときや、そのストレージ設定が変更されるときに適用されます。

Merge tree設定の名前は、`<constraints>`セクションで参照される際に`merge_tree_`プレフィックスを先頭に付ける必要があります。

### 例 {#example-mergetree}

`storage_policy`が明示的に指定された新しいテーブルの作成を禁止することができます：

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
