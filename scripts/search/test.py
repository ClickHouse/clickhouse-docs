import re

content = """
---
slug: /en/architecture/horizontal-scaling
sidebar_label: Scaling out
sidebar_position: 10
title: Scaling out
---
import ReplicationShardingTerminology from '@site/docs/en/_snippets/_replication-sharding-terminology.md';
import ConfigFileNote from '@site/docs/en/_snippets/_config-files.md';


## Description
This example architecture is designed to provide scalability.  It includes three nodes: two combined ClickHouse plus coordination (ClickHouse Keeper) servers, and a third server with only ClickHouse Keeper to finish the quorum of three. With this example, we'll create a database, table, and a distributed table that will be able to query the data on both of the nodes.


<ScalePlanFeatureBadge feature="The fast release channel"/>

<ScalePlanFeatureBadge/>
"""


def clean_content(content):
    # Remove code blocks
    content = re.sub(r'```.*?```', '', content, flags=re.DOTALL)
    content = re.sub(r'^import .+?from .+?$', '', content, flags=re.MULTILINE)
    content = re.sub(r'<[A-Za-z0-9_-]+\s*[^>]*\/>', '', content)
    return content

print(clean_content(content))