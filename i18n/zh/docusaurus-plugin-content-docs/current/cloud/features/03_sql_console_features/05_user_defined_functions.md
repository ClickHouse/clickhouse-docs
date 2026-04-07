---
sidebar_label: '用户自定义函数'
slug: /cloud/features/user-defined-functions
title: 'Cloud 中的用户自定义函数'
description: '在 Cloud 中添加您自己的可执行 Python 函数'
doc_type: 'guide'
keywords: ['用户自定义函数', 'UDF']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

用户自定义函数 (UDF) 允许用户将 ClickHouse 的行为扩展到一千多种开箱即用的[函数](/sql-reference/functions/regular-functions)所提供的功能之外。

在 ClickHouse Cloud 中，有两种创建用户自定义函数的方法：

1. 使用 SQL
2. 使用 UI 和您自己的代码 (私有预览) 

## SQL 用户定义函数 \{#sql-udfs\}

可以使用 [`CREATE FUNCTION`](/sql-reference/statements/create/function) 语句通过 lambda 表达式创建 SQL UDF。

在本示例中，我们将创建一个简单的可执行用户定义函数 `isBusinessHours`。
该函数会检查某个时间戳是否落在正常营业时间内：如果是，则返回 true；否则返回 false。

1. 登录 Cloud Console 并打开 SQL 控制台
2. 编写以下 SQL 查询以创建 `isBusinessHours` 函数：

```sql
CREATE FUNCTION isBusinessHours AS (ts) ->
toDayOfWeek(ts) BETWEEN 1 AND 5
AND toHour(ts) BETWEEN 9 AND 17;
```

3. 运行以下内容来测试新创建的 UDF：

```sql
SELECT isBusinessHours('2026-03-20 10:00:00'::DateTime), isBusinessHours('2026-03-20 23:00:00'::DateTime);
```

你应该会看到如下结果：

```response
1   0
```

4. 您可以使用 `DROP FUNCTION` 命令删除您刚刚创建的 UDF：

```sql
DROP FUNCTION isBusinessHours
```

:::warning 重要
ClickHouse Cloud 中的 UDF **不会继承用户级设置**。它们会以系统默认设置执行。
:::

这意味着：

* 会话级设置 (通过 `SET` 语句设置) 不会传递到 UDF 的执行上下文中
* UDF 不会继承用户 profile 设置
* 查询级设置在 UDF 执行过程中不生效

## 通过 UI 创建的用户自定义函数 \{#ui-udfs\}

<PrivatePreviewBadge />

ClickHouse Cloud 提供了通过 UI 配置来创建用户自定义函数的功能。

:::note
如果你有兴趣试用此功能，请联系 [support](https://clickhouse.com/support/program) 以加入私有预览。
:::

在本示例中，我们将创建一个与前面相同的简单可执行用户自定义函数 `isBusinessHours`，用于检查某个时间戳是否处于正常工作时间内。
此前我们使用 SQL 创建了它，这次我们将使用 Python 并通过 UI 进行配置。

<VerticalStepper headerLevel="h3">
  ### 创建 Python 文件 \{#create-python-file\}

  在本地创建一个新文件 `main.py`：

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

  现在将该文件压缩为 ZIP 归档文件：

  ```bash
  zip is_business_hours.zip main.py
  ```

  :::note
  ClickHouse Cloud 期望在下一步通过 UI 上传的 zip 文件中找到 `main.py`。
  如果你将文件命名为其他名称，就会遇到错误。
  :::

  ### 通过 UI 创建 UDF \{#create-udf-via-ui\}

  1. 在 Cloud 控制台主页，点击左下角菜单中的组织名称。
  2. 在菜单中选择 **用户自定义函数**。
  3. 在用户自定义函数页面，点击 **Set up a UDF**。屏幕右侧会打开一个配置面板。
  4. 输入函数名称。本示例使用 `isBusinessHours`。
  5. 选择函数类型，可选 **Executable pool** 或 **Executable**：
     * **Executable pool**：维护一个持久化进程池，并从池中取出进程来处理读取。
     * **Executable**：脚本会在每次查询时运行。
  6. 本示例使用默认设置。有关配置参数的完整列表，请参见 [Executable 用户自定义函数](/sql-reference/functions/udf#executable-user-defined-functions)。
  7. 点击 **Browse File**，上传在本教程开头创建的 `.zip` File。
  8. 添加一个新参数。本示例中，添加一个类型为 `DateTime` 的参数 `timestamp`。
  9. 选择返回类型。本示例中，选择 `Bool`。
  10. 点击 **Create UDF**。系统会显示一个对话框，显示当前构建状态。
      * 如果出现任何问题，状态会变为 **error**。
      * 否则，状态会从 **building** 进入 **provisioning**。你的服务必须处于唤醒状态才能完成预配。如果服务处于空闲状态，请在服务名称旁的 **UDF details** 面板中点击 **Wake Up Service**。
      * 完成后，状态会变为 **deployed**。

  ### 测试你的 UDF \{#test-your-udf\}

  1. 点击页面左上角的 **Settings - return to your service view**，返回 SQL 控制台 主页
  2. 点击左侧菜单中的 **SQL 控制台**
  3. 编写以下查询：

  ```sql
  SELECT isBusinessHours('2026-03-20 10:00:00'::DateTime), isBusinessHours('2026-03-20 23:00:00'::DateTime);
  ```

  你应该会看到结果：

  ```response
  true    false
  ```

  ### 创建新版本 \{#create-new-version\}

  1. 在 Cloud 控制台主页，点击左下角菜单中的组织名称。
  2. 在菜单中选择 **用户自定义函数**。
  3. 在 `isBusinessHours` UDF 的 **Actions** 下点击三个点，然后点击 **Create new version**
  4. 上传包含修改后代码的 zip 文件，或修改设置后点击 **Create new version**

  你已成功通过 UI 添加了第一个用户自定义函数，确认了它可以运行，并了解了如何在需要时创建它的新版本。
</VerticalStepper>