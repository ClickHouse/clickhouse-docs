---
date: 2023-06-07
---

# How to start, stop and resume a Cloud service using the ClickHouse API and cURL

## Question

How can a ClickHouse Cloud service be started, stopped and resumed using API endpoints?

## Answer

1. To wake up/resume a Cloud service from an idle state, you can ping the instance:

```bash
curl -X GET https://abc123.us-west-2.aws.clickhouse.cloud:8443/ping
```

2. To stop a Cloud service, use the `/state` endpoint along with the `stop` command. The syntax looks like:

```bash
curl -X PATCH https://api.clickhouse.cloud/v1/organizations/<org_uuid>/services/<service_uuid>/state -u <key_id>:<key_secret> -H "Content-Type: application/json" -d ''{"command": "<stop|start>"}''
```

For example, the following command stops the `2e2124ca-c5ac-459d-a6f2-abc123549d2a` service:

```bash
curl -X PATCH https://api.clickhouse.cloud/v1/organizations/123abcd0-e9b5-4f55-9e42-0fb04392445c/services/2e2124ca-c5ac-459d-a6f2-abc123549d2a/state -u abc123:ABC123 -H "Content-Type: application/json" -d '{"command": "stop"}'
```

The output looks like:

```response
{"result":{"id":"2e2124ca-c5ac-459d-a6f2-abc123549d2a","name":"mars-s3","provider":"aws","regionId":"us-west-2","state":"stopping","endpoints":[{"protocol":"nativesecure","host":"abc123.us-west-2.aws.clickhouse.cloud","port":9440},{"protocol":"https","host":"abc123ntrb.us-west-2.aws.clickhouse.cloud","port":8443}],"tier":"production","idleScaling":true,"idleTimeoutMinutes":5,"minTotalMemoryGb":24,"maxTotalMemoryGb":48,"ipAccessList":[{"source":"[0.0.0.0/0](http://0.0.0.0/0)","description":"Anywhere"}],"createdAt":"2022-10-21T18:46:31Z"},"status":200}%
```

3. To start the service again, use the `start` command:

```bash
curl -X PATCH https://api.clickhouse.cloud/v1/organizations/123abcd0-e9b5-4f55-9e42-0fb04392445c/services/2e2124ca-c5ac-459d-a6f2-abc123549d2a/state -u abc123:ABC123 -H "Content-Type: application/json" -d '{"command": "start"}'
```

:::note
Here are the various states that a service can be in:

```
"state":"stopping"
"state":"stopped"
"state":"starting"
"state":"running"
"state":"idle"
```
:::

:::note
A Cloud service that is **"idle"** is considered started, so a `start` command will not resume/wake it up. Use the `ping` endpoint shown in Step 1 to wake up a service.
:::