---
slug: /en/guides/developer/working-with-json/json-intro
sidebar_label: Handling JSON
sidebar_position: 2
description: Introduction to Handling JSON
---

# Handling JSON

JSON has established itself as one of the most popular language-independent data interchange formats. As a “semi-structured” data format, it balances user readability with greater space efficiency than alternatives such as XML. Although typically used as the data format for requests and responses in web APIs, it is increasingly used for logging and general-purpose dataset distribution. 

ClickHouse provides several approaches for handling JSON, each with its respective pros and cons and usage. More recent versions of ClickHouse have introduced new types which allow even greater flexibility and performance for JSON storage and querying. 

For example purposes, we utilize two datasets: a 1m row subset of the [Github dataset](https://ghe.clickhouse.tech/#how-this-dataset-is-created) and an example [NGINX log](https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/documents-01.ndjson.gz) in JSON format. The former includes nested columns, useful for example purposes. It is also deliberately sparse, which helps illustrate some challenges of JSON. The latter allows us to discuss standard techniques for JSON logs. 

## Related Content

- [Getting Data Into ClickHouse - Part 2 - A JSON detour](https://clickhouse.com/blog/getting-data-into-clickhouse-part-2-json)
