---
sidebar_label: 'ユーザー定義関数'
slug: /cloud/features/user-defined-functions
title: 'Cloud のユーザー定義関数'
description: 'Cloud で独自の実行可能な Python 関数を追加'
doc_type: 'guide'
keywords: ['ユーザー定義関数', 'UDF']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

ユーザー定義関数 (UDF) を使用すると、ClickHouse に標準搭載されている 1,000 種類を超える[関数](/sql-reference/functions/regular-functions)で提供される範囲を超えて、その動作を拡張できます。

ClickHouse Cloud では、ユーザー定義関数を作成する方法は 2 つあります。

1. SQL を使用する
2. UI と独自のコードを使用する (プライベートプレビュー)

## SQL ユーザー定義関数 \{#sql-udfs\}

SQL UDF は、ラムダ式を使用して [`CREATE FUNCTION`](/sql-reference/statements/create/function) 文で作成できます。

この例では、シンプルな実行可能なユーザー定義関数 `isBusinessHours` を作成します。
この関数は、特定のタイムスタンプが通常の営業時間内に含まれているかどうかをチェックし、含まれていれば true、そうでなければ false を返します。

1. Cloud Console にログインし、SQL コンソールを開きます
2. 次の SQL クエリを記述して、`isBusinessHours` 関数を作成します:

```sql
CREATE FUNCTION isBusinessHours AS (ts) ->
toDayOfWeek(ts) BETWEEN 1 AND 5
AND toHour(ts) BETWEEN 9 AND 17;
```

3. 新しく作成したUDFをテストするには、以下を実行します。

```sql
SELECT isBusinessHours('2026-03-20 10:00:00'::DateTime), isBusinessHours('2026-03-20 23:00:00'::DateTime);
```

次のような結果が返されるはずです:

```response
1   0
```

4. `DROP FUNCTION` コマンドを使用して、先ほど作成した UDF を削除できます：

```sql
DROP FUNCTION isBusinessHours
```

:::warning 重要
ClickHouse Cloud の UDF は**ユーザーレベルの設定を継承しません**。デフォルトのシステム設定で実行されます。
:::

これは、次のことを意味します。

* セッションレベルの設定 (`SET` ステートメントで設定) は、UDF の実行コンテキストには引き継がれません
* ユーザープロファイルの設定は UDF に継承されません
* クエリレベルの設定は UDF の実行時には適用されません

## UI で作成するユーザー定義関数 \{#ui-udfs\}

<PrivatePreviewBadge />

ClickHouse Cloud では、UI からユーザー定義関数を作成するための設定機能を提供しています。

:::note
この機能を試したい場合は、プライベートプレビュー への登録について [support](https://clickhouse.com/support/program) にお問い合わせください。
:::

この例では、特定のタイムスタンプが通常の営業時間内かどうかを判定する、シンプルな実行可能ユーザー定義関数 `isBusinessHours` を同様に作成します。
前回は SQL を使って作成しましたが、今回は Python を使い、UI から設定します。

<VerticalStepper headerLevel="h3">
  ### Python ファイルを作成する \{#create-python-file\}

  ローカルで新しいファイル `main.py` を作成します。

  ```python
  cat > main.py << 'EOF'
  import sys
  from datetime import datetime

  for line in sys.stdin:
      ts = datetime.fromisoformat(line.strip())
      result = 1 if (0 <= ts.weekday() <= 4 and 9 <= ts.hour <= 17) else 0
      print(result)
      sys.stdout.flush()
  EOF
  ```

  次に、このファイルを ZIP アーカイブに圧縮します。

  ```bash
  zip is_business_hours.zip main.py
  ```

  :::note
  ClickHouse Cloud は、次の手順で UI からアップロードする zip ファイル内に `main.py` が含まれていることを前提としています。
  別の名前のファイルにするとエラーが発生します。
  :::

  ### UI から UDF を作成する \{#create-udf-via-ui\}

  1. Cloud コンソールのホームで、左下のメニューにある組織名をクリックします。
  2. メニューから **User-defined functions** を選択します。
  3. **User-defined functions** ページで **Set up a UDF** をクリックします。画面右側に設定パネルが開きます。
  4. 関数名を入力します。この例では `isBusinessHours` を使用します。
  5. 関数タイプとして **Executable pool** または **Executable** を選択します。
     * **Executable pool**: 永続的なプロセスのプールが維持され、読み込み時にはそのプールからプロセスが取得されます。
     * **Executable**: スクリプトはクエリごとに実行されます。
  6. この例では、デフォルト設定を使用します。設定パラメータの一覧については、[Executable user-defined functions](/sql-reference/functions/udf#executable-user-defined-functions) を参照してください。
  7. **Browse File** をクリックして、このチュートリアルの冒頭で作成した `.zip` ファイルをアップロードします。
  8. 新しい引数を追加します。この例では、型 `DateTime` の引数 `timestamp` を追加します。
  9. 戻り値の型を選択します。この例では `Bool` を選択します。
  10. **Create UDF** をクリックします。ダイアログに現在のビルド状況が表示されます。
      * 問題がある場合、ステータスは **error** に変わります。
      * 問題がなければ、ステータスは **building** から **provisioning** に進みます。プロビジョニングを完了するには、サービスが稼働中である必要があります。サービスがアイドル状態の場合は、サービス名の横にある **UDF details** パネルで **Wake Up Service** をクリックします。
      * 完了すると、ステータスは **deployed** に変わります。

  ### UDF をテストする \{#test-your-udf\}

  1. ページ左上の **Settings - return to your service view** をクリックして、SQL Console のホームページに戻ります
  2. 左側のメニューで **SQL Console** をクリックします
  3. 次のクエリを入力します。

  ```sql
  SELECT isBusinessHours('2026-03-20 10:00:00'::DateTime), isBusinessHours('2026-03-20 23:00:00'::DateTime);
  ```

  結果は次のようになります。

  ```response
  true    false
  ```

  ### 新しいバージョンを作成する \{#create-new-version\}

  1. Cloud コンソールのホームで、左下のメニューにある組織名をクリックします。
  2. メニューから **User-defined functions** を選択します。
  3. `isBusinessHours` UDF の **Actions** の下にある 3 点メニューを選択し、**Create new version** をクリックします
  4. 変更したコードを含む zip をアップロードするか、設定を変更してから **Create new version** をクリックします

  これで、UI から最初のユーザー定義関数を正常に追加し、実行を確認し、必要に応じて新しいバージョンを作成する方法も確認できました。
</VerticalStepper>