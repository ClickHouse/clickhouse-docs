from urllib.parse import urlparse, urlunparse

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


def split_url_and_anchor(url):
    parsed_url = urlparse(url)
    url_without_anchor = urlunparse(parsed_url._replace(fragment=""))
    anchor = parsed_url.fragment
    return url_without_anchor, anchor


url = "https://clickhouse-docs-private.vercel.app/docs/en/about-us/cloud#what-version-of-clickhouse-does-clickhouse-cloud-use"
url_without_anchor, anchor = split_url_and_anchor(url)
print("URL without anchor:", url_without_anchor)
print("Anchor:", anchor)