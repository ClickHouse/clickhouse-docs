---
slug: /en/manage/security/ip-access-list
sidebar_label: IP Access List
sidebar_position: 1
---
import Content from '@site/docs/en/_snippets/_ip_filtering.md';

# IP Access List

<Content/>

## Importing and exporting filters
From the **Security** tab you can also share (import or export) your filters.

![No traffic permitted](@site/docs/en/_snippets/images/ip-filter-share.png)

:::note
If you import filters they will be appended to the existing filter list.
:::

Here is an example of an exported filter list:
```json
{
    "addresses": [
        {
            "address": "45.47.199.79",
            "description": "Home IP"
        }
    ]
}
```

:::important
If you do not configure an IP Access List, then there will be no access to your ClickHouse Cloud service.
:::

## Limitations

- Currently IP Access Lists support only IPV4
