---
slug: /en/manage/security/ip-filters
sidebar_label: IP Filtering
sidebar_position: 1
---
import ConnectionDetails from '@site/docs/en/_snippets/_ip_filtering.md';

# IP Filtering

<ConnectionDetails/>

## Importing and exporting filters
From the **Security** tab you can also share, including import and export of your filters.

<img src={require('@site/docs/en/_snippets/images/ip-filter-share.png').default}/>

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
