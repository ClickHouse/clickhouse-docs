---
Date: 2023-05-08
---

# Title here

One-liner intro; give enough info to let the reader know they are in the right place to learn
about the topic.

:::note
If you want something to show up in a "Note:" block, use this.
:::


## Steps {#steps}

1. Do this

```
put commands in here.  If you are putting in SQL, then make the top line ```sql if commandline commands, then ```bash
```

2. Next step

```sql
SELECT * 
FROM system.functions
```

3. Another step

```bash
./clickhouse local --query ...
```

4. Create a python source file named `main.py`:

```py
import clickhouse_connect
import sys
import json
```

:::tip
Tips look a little different from Notes; green vs. gray.  Please do not use `:::warning` or `:::danger`
:::
