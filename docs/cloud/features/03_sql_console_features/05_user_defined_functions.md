---
sidebar_label: 'User-defined functions'
slug: /cloud/features/user-defined-functions
title: 'User-defined functions in Cloud'
description: 'Add your own executable Python functions in Cloud'
doc_type: 'guide'
keywords: ['user defined function', 'UDF']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

User-defined functions (UDF) allow users to extend the behavior of ClickHouse beyond what is offered by over a thousand different out-of-box [functions](/sql-reference/functions/regular-functions).

In ClickHouse Cloud, there are two ways to create user-defined functions:
1. Using SQL
2. Using the UI and your own code (private preview)

## SQL user-defined functions {#sql-udfs}

SQL UDFs can be created using the [`CREATE FUNCTION`](/sql-reference/statements/create/function) statement from a lambda expression.

In this example we'll create a simple executable user-defined function, `isBusinessHours`.
The function will check if a certain timestamp falls inside of regular business hours and return true if it does, otherwise false.

1. Login to Cloud Console and open the SQL console
2. Write the following SQL query to create the `isBusinessHours` function:

```sql
CREATE FUNCTION isBusinessHours AS (ts) ->
toDayOfWeek(ts) BETWEEN 1 AND 5
AND toHour(ts) BETWEEN 9 AND 17;
```

3. Run the following below to test your newly created UDF:

```sql
SELECT isBusinessHours('2026-03-20 10:00:00'::DateTime), isBusinessHours('2026-03-20 23:00:00'::DateTime);
```

You should get back the result:

```response
1   0
```

4. You can use the `DROP FUNCTION` command to remove the UDF you just created:

```sql
DROP FUNCTION isBusinessHours
```

:::warning Important
UDFs in ClickHouse Cloud **do not inherit user-level settings**. They execute with default system settings.
:::

This means:
- Session-level settings (set via `SET` statement) are not propagated to UDF execution context
- User profile settings are not inherited by UDFs
- Query-level settings do not apply within UDF execution

## User-defined functions created via UI {#ui-udfs}

<PrivatePreviewBadge/>

ClickHouse Cloud offers a UI configuration experience for creating user-defined functions.

:::note
If you are interested in trying out this feature, please contact [support](https://clickhouse.com/support/program) to enroll in private preview.
:::

In this example we'll create the same simple executable user-defined function `isBusinessHours` that checks if a certain timestamp falls inside of regular business hours.
Previously we created it using SQL, but this time we will create it using Python and configure it via the UI.

### Create the Python file {#create-python-file}

Create a new file `main.py` locally:

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

Now compress the file into a ZIP archive:

```bash
zip is_business_hours.zip main.py
```

### Create a UDF via the UI {#create-udf-via-ui}

1. From the Cloud console homepage, click on the name of your organization in the bottom-left menu.
2. Select **User-defined functions** from the menu.
3. On the user-defined functions page, click **Set up a UDF**. A configuration panel opens on the right side of the screen.
4. Enter a function name. For this example, use `isBusinessHours`.
5. Select a function type, either **Executable pool** or **Executable**:
    - **Executable pool**: A pool of persistent processes is maintained, and a process is taken from the pool for reads.
    - **Executable**: The script runs on every query.
6. For this example, use the default settings. For a full list of configuration parameters, see [Executable user-defined functions](/sql-reference/functions/udf#executable-user-defined-functions).
7. Click **Browse File** to upload the `.zip` file created at the start of this tutorial.
8. Add a new argument. For this example, add an argument `timestamp` with type `DateTime`.
9. Select a return type. For this example, select `Bool`.
10. Click **Create UDF**. A dialog displays the current build status.
    - If there are any problems, the status changes to **error**.
    - Otherwise, the status progresses from **building** to **provisioning**. Your service must be awake to complete provisioning. If your service is idle, click **Wake Up Service** in the **UDF details** panel next to the service name.
    - Once complete, the status changes to **deployed**.

### Test your UDF {#test-your-udf}

1.  return back to the home page of the SQL Console by clicking **Settings - return to your service view** from the top left corner of the page
2.  click **SQL Console** in the left hand menu
3.  write the following query:

```sql
SELECT isBusinessHours('2026-03-20 10:00:00'::DateTime), isBusinessHours('2026-03-20 23:00:00'::DateTime);
```

You should see the result:

```response
true    false
```

### Create a new version {#create-new-version}

1. From the Cloud console homepage, click on the name of your organization in the bottom-left menu.
2. Select **User-defined functions** from the menu.
3. Select the three dots under **Actions** for the `isBusinessHours` UDF, click **Create new version**
4. Upload a zip with the modified code, or change settings and then click **Create new version**

You have successfully added your first user-defined function via the UI, confirmed it runs and seen how to create a new version of it if needed.
