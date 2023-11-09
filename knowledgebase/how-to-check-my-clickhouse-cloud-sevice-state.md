---
title: How to check my ClickHouse Cloud Service state
date: 2023-11-09 
---

# How do I check my ClickHouse Cloud Service state?

How do I check my ClickHouse Cloud Service state? I want to check if the Service is stopped, idle, or running, but I don't want to wake the Service up in doing so.

## Answer

The new ClickHouse Cloud API https://clickhouse.com/docs/en/cloud/manage/api/api-overview is great for this need of checking the Service status as well as many other Service characteristics. You will first need to create an API Key in your Service for securely using the Cloud API - you can do this in ClickHouse Cloud https://clickhouse.cloud

- [API Overview](/docs/en/cloud/manage/api/api-overview.md)
- [Swagger](/docs/en/cloud/manage/api/swagger)

Here are some examples for consuming the API. You'd be able to retrieve the specific status of your Service at any time. I ran a few tests with a Service that was Idle and then Running:

```shell
curl --user '[Key-ID]:[Key-Secret]' https://api.clickhouse.cloud/v1/organizations/[Org-ID]/services/[Service-ID]
```

```json
{"result":{"id":"[Service-ID]","name":"[Service-Name]","provider":"aws","region":"us-east-1","state":"**idle**","endpoints":[{"protocol":"nativesecure","host":"[Connect-URL]","port":9440},{"protocol":"https","host":"[Connect-URL]","port":8443}],"tier":"development","idleScaling":true,"idleTimeoutMinutes":15,"ipAccessList":[{"source":"[my-IP]","description":"[my-IP-name]"}],"createdAt":"2023-04-13T23:47:47Z"},"status":200}
```

```shell
curl --user '[Key-ID]:[Key-Secret]' https://api.clickhouse.cloud/v1/organizations/[Org-ID]/services/[Service-ID]
```

```json
{"result":{"id":"[Service-ID]","name":"[Service-Name]","provider":"aws","region":"us-east-1","state":"**running**","endpoints":[{"protocol":"nativesecure","host":"[Connect-URL]","port":9440},{"protocol":"https","host":"[Connect-URL]","port":8443}],"tier":"development","idleScaling":true,"idleTimeoutMinutes":15,"ipAccessList":[{"source":"[my-IP]","description":"my-IP-name]"}],"createdAt":"2023-04-13T23:47:47Z"},"status":200}
```
