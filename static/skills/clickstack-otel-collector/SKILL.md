---
name: clickstack-otel-collector
description: Use when a user wants to stand up a local Docker OpenTelemetry collector for Managed ClickStack on a ClickHouse Cloud service, send logs/traces/metrics, and verify the data is visible in ClickStack.
license: Apache-2.0
metadata:
  author: ClickHouse Inc
  version: "0.2.0"
---

# Set up the ClickStack OpenTelemetry collector (local Docker)

This skill wires a **local Docker** OpenTelemetry collector into a Managed ClickStack
service running on ClickHouse Cloud, sends synthetic telemetry through it, and confirms
the data is actually visible in ClickStack. It uses
[`clickhousectl`](https://clickhouse.com/docs/interfaces/cli) for all cloud and SQL
operations.

**Scope.** This is deliberately the *local Docker collector* path. It is one of several
things a user might want: they may already run a collector and only need exporter config,
or they may want a Kubernetes deployment with secrets in K8s Secrets. Those are out of
scope here. If the user clearly wants one of those instead, say so and stop, rather than
building a local container they did not ask for.

The end state is:

- A dedicated `hyperdx_ingest` SQL user on the target service, with exactly the grants
  this collector image needs (including the `default.*` grant its migrations require).
- A ClickStack-distribution OpenTelemetry collector running locally as a Docker container,
  accepting OTLP on `4317`/`4318`, exposing a health endpoint on `13133`, and writing into
  the `otel` database on the target service.
- Synthetic telemetry exercising the logs, traces, and metrics pipelines.
- The service confirmed **awake**, and the user pointed to the ClickHouse Cloud console to
  complete ClickStack onboarding (Getting Started, auto-detect sources) so they can actually
  *see* their data.

Secrets (the OTLP auth token and the SQL password) are generated locally, written **once**
to a `0600` env file, and passed to Docker via `--env-file`. They are never pasted into the
chat, never passed with `docker run -e`, and never echoed back after creation.

Follow these steps in order. Each step depends on state established by the previous one.

---

## Step 0: Batch the permissions up front

Coding agents prompt for approval the first time they see each shell command. To avoid
interrupting the user every few steps, ask them once, up front, to allowlist these command
prefixes (the "always allow for this project / session" option in their agent). There are no
destructive operations and nothing targets anything outside this project or their ClickHouse
Cloud service:

| Command prefix | Used for |
| --- | --- |
| `openssl rand …` | generate the OTLP token and SQL password |
| `clickhousectl cloud …` | auth status, resolve the service, run SQL via the Query API |
| `docker …` | run/inspect the collector and the telemetry generator |
| `curl …` | one local health check against `localhost:13133` |
| `jq …` | parse JSON from `clickhousectl` |

Tell the user, in your own words: *"If your agent supports it, choose 'always allow' for
each of these the first time it asks. The whole run is read-only against your machine except
for one Docker container, and write operations against ClickHouse are limited to creating the
ingest user and the `otel` schema."*

Then continue.

---

## Step 1: Confirm the target service and lay down the secrets file

The user's prompt contains a service identifier, either a service ID (UUID) or a service
name. Treat that value as `SERVICE_REF`.

Create a working directory and a **`0600` env file** that will hold all configuration and
secrets for this run. The key names match exactly what the collector image reads, so this
same file is passed straight to `docker run --env-file` in Step 5. Write it under a tight
`umask` so the secret is never briefly world-readable:

```bash
WORKDIR="${WORKDIR:-$HOME/clickstack-otel-collector}"
mkdir -p "$WORKDIR" && chmod 700 "$WORKDIR"
ENV_FILE="$WORKDIR/collector.env"

# Generate secrets WITHOUT printing them; write straight into a private file.
( umask 177
  {
    echo "SERVICE_REF=$SERVICE_REF"
    echo "OTLP_AUTH_TOKEN=$(openssl rand -hex 32)"
    echo "CLICKHOUSE_USER=hyperdx_ingest"
    echo "CLICKHOUSE_PASSWORD=$(openssl rand -hex 24)Aa1-"
    echo "HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE=otel"
  } > "$ENV_FILE"
)
chmod 600 "$ENV_FILE"
ls -l "$ENV_FILE"
```

Two things about these values matter and are easy to get wrong:

- **Key names are exact.** The collector reads `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`,
  `CLICKHOUSE_ENDPOINT`, and `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`. Store the SQL
  password under `CLICKHOUSE_PASSWORD` (not a custom name); if it is missing, the collector
  starts with an **empty** password and dies with `code: 516, Authentication failed`.
- **The password charset is constrained from three directions at once.** ClickHouse Cloud
  rejects passwords without at least one uppercase character and one special character, so a
  plain hex string fails at `CREATE USER`. At the same time, the collector's migration tool
  embeds the password in a connection URL, so `@`, `:`, `/`, `?`, `#`, and `%` corrupt it
  (symptom: `code: 516` at startup even though the password is "correct"). The recipe above
  is random hex (lowercase + digits) plus the suffix `Aa1-`, which adds the required
  uppercase, a digit, and a **URL-unreserved** special character (`-`). The OTLP token has no
  such rules (it is just a bearer token), so plain hex is fine for it.

The env file uses **bare `KEY=VALUE` lines with no quotes**: Docker's `--env-file` does not
do shell parsing, so any quotes you add become part of the value. The charset above needs no
quoting anywhere (SQL, the env file, or `"$VAR"` in the shell).

From now on, load the file when you need a value instead of typing secrets:

```bash
set -a; . "$ENV_FILE"; set +a
```

**Confirm with the user** that `SERVICE_REF` is correct. Tell them the working directory and
that `collector.env` (mode `0600`) now holds the OTLP token and the SQL password. Do **not**
print either secret. If they want to see a value, point them at the file
(`grep OTLP_AUTH_TOKEN "$ENV_FILE"`).

If the user supplied their own token or password, write those into the file instead of the
generated ones, but keep the same `0600` discipline and make sure any custom password still
meets the charset rules above.

---

## Step 2: Authenticate `clickhousectl` (separate terminal by default)

Check `clickhousectl` is on `PATH`:

```bash
which clickhousectl || curl -fsSL https://clickhouse.com/cli | sh
```

Check authentication:

```bash
clickhousectl cloud auth status
```

This skill needs **API key authentication**: OAuth is read-only and cannot create users or
run write queries. If the `API key` row is not `Active`, the user must authenticate.

**Do not ask the user to paste their API key and secret into the chat.** Anything pasted
into the conversation lives in the transcript and has to be rotated afterward. Instead, ask
them to authenticate in a **separate terminal**, then tell you when they are done:

> I need a ClickHouse Cloud **Admin** API key to create the ingest user and verify the data.
> Please don't paste it here. Instead:
>
> 1. In the [Cloud console](https://console.clickhouse.cloud), open **Organization → API keys
>    → New API key**, and give it the **Admin** role. (Developer-scoped keys can't provision
>    the per-service Query API endpoint that `cloud service query` uses.)
> 2. In a **separate terminal**, run:
>
>    ```bash
>    clickhousectl cloud auth login --api-key <key-id> --api-secret <key-secret>
>    ```
>
> 3. Tell me when that's done and I'll re-check the auth status.

Poll until the API key row reports `Active`, then confirm with a real privileged call rather
than trusting the status table alone:

```bash
clickhousectl cloud auth status
clickhousectl cloud service get "$SERVICE_REF" --json | jq -r '.name, .state'
```

If the service resolves, you are authenticated; continue.

**Fallback if a separate-terminal login isn't picked up.** Some `clickhousectl` builds save
the credentials file but a freshly spawned shell (such as the one your tool calls run in)
doesn't read it, so `auth status` keeps showing `Not configured`. In that case, load the
saved credentials into the environment for your own calls, without printing them:

```bash
export CLICKHOUSE_CLOUD_API_KEY="$(jq -r .api_key  "$HOME/.clickhouse/credentials.json")"
export CLICKHOUSE_CLOUD_API_SECRET="$(jq -r .api_secret "$HOME/.clickhouse/credentials.json")"
```

Re-run the `service get` check above; the `Env vars` row should now read `Active`. This still
keeps the secret out of the chat. Do not continue until a real call succeeds.

---

## Step 3: Resolve the service and capture the HTTPS endpoint

Load the env file (`set -a; . "$ENV_FILE"; set +a`) and resolve the service. If `SERVICE_REF`
is a UUID, use it directly; otherwise look it up by name:

```bash
# UUID form
clickhousectl cloud service get "$SERVICE_REF" --json > "$WORKDIR/svc.json"

# Name form (note the double quotes: service names can contain spaces or apostrophes,
# e.g. "Alex's test")
clickhousectl cloud service list --json \
  | jq --arg n "$SERVICE_REF" '.[] | select(.name==$n)' > "$WORKDIR/svc.json"
```

Extract the values you need, coercing the port to an integer. The port serializes as a
float (`8443.0`); if `:8443.0` leaks into the endpoint the collector's ClickHouse exporter
cannot dial it:

```bash
SERVICE_ID=$(jq -r '.id' "$WORKDIR/svc.json")
SERVICE_NAME=$(jq -r '.name' "$WORKDIR/svc.json")
STATE=$(jq -r '.state' "$WORKDIR/svc.json")
CLICKHOUSE_ENDPOINT=$(jq -r '.endpoints[] | select(.protocol=="https")
  | "https://\(.host):\(.port | tonumber | floor)"' "$WORKDIR/svc.json")

# Persist the resolved values back into the env file for later steps and docker --env-file.
{ echo "SERVICE_ID=$SERVICE_ID"
  echo "CLICKHOUSE_ENDPOINT=$CLICKHOUSE_ENDPOINT"
} >> "$ENV_FILE"
printf 'service=%q state=%s endpoint=%s\n' "$SERVICE_NAME" "$STATE" "$CLICKHOUSE_ENDPOINT"
```

`STATE` must be `running`. If it is `stopped` or `starting`, ask the user to start the
service (or wait), and do not proceed. ClickHouse Cloud services **idle-suspend**, so even a
"running" service can be asleep; the next query both checks reachability and wakes it:

```bash
clickhousectl cloud service query --id "$SERVICE_ID" --query "SELECT version()"
```

A successful response confirms the service is awake and that the per-service Query API key is
provisioned. On the first call `clickhousectl` prints `Provisioning Query API endpoint + key
for service '<name>'...`, which is expected.

---

## Step 4: Create the `hyperdx_ingest` SQL user and grant it `otel.*`

The user name is fixed and the password charset (Step 1) needs no escaping, so single-quoting
it in SQL is safe. Load the env file first so `$CLICKHOUSE_PASSWORD` is set:

```bash
set -a; . "$ENV_FILE"; set +a

clickhousectl cloud service query --id "$SERVICE_ID" --query \
  "CREATE USER IF NOT EXISTS hyperdx_ingest IDENTIFIED WITH sha256_password BY '$CLICKHOUSE_PASSWORD'"

# If the user already existed from a prior run, force the password to this run's value.
clickhousectl cloud service query --id "$SERVICE_ID" --query \
  "ALTER USER hyperdx_ingest IDENTIFIED WITH sha256_password BY '$CLICKHOUSE_PASSWORD'"
```

Grant the least privilege the collector needs to create and write the `otel.*` schema. On the
current image the schema migrations and their version table also live in `otel`, so `otel.*`
is sufficient:

```bash
clickhousectl cloud service query --id "$SERVICE_ID" --query \
  "GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO hyperdx_ingest"
```

> **Older image builds:** some earlier collector versions ran their goose migrations against a
> version table in the `default` database, so startup looped on `ACCESS_DENIED` until
> `default.*` was also granted. If you see `ACCESS_DENIED` referencing `default` in the
> collector logs (Step 5), add this and restart the container:
>
> ```bash
> clickhousectl cloud service query --id "$SERVICE_ID" --query \
>   "GRANT SELECT, INSERT, CREATE TABLE ON default.* TO hyperdx_ingest"
> ```

Verify:

```bash
clickhousectl cloud service query --id "$SERVICE_ID" --query "SHOW GRANTS FOR hyperdx_ingest"
```

You should see `GRANT SELECT, INSERT, CREATE DATABASE, CREATE TABLE, CREATE VIEW ON otel.* TO
hyperdx_ingest`.

---

## Step 5: Deploy the ClickStack OpenTelemetry collector

Run the ClickStack-distribution collector locally. It creates the `otel.*` schema on first
write and routes Session Replay events to `otel.hyperdx_sessions`.

Make sure Docker is running:

```bash
docker info > /dev/null
```

Create a user-defined network. The collector joins it so the telemetry generator in Step 6
can reach it by container name without any local install:

```bash
docker network create clickstack-net 2>/dev/null || true
```

Start the collector, passing **all secrets via `--env-file`** (never `-e`, which would put
the secret on the command line, in shell history, and in `ps`). Expose the health port too.
The `docker rm -f` first makes the step safe to re-run:

```bash
docker rm -f clickstack-otel-collector 2>/dev/null || true
docker run -d \
  --name clickstack-otel-collector \
  --network clickstack-net \
  --env-file "$ENV_FILE" \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 13133:13133 \
  clickhouse/clickstack-otel-collector:latest
```

The image reads `OTLP_AUTH_TOKEN`, `CLICKHOUSE_ENDPOINT`, `CLICKHOUSE_USER`,
`CLICKHOUSE_PASSWORD`, and `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` from the env file. It
enables bearer-token auth on the OTLP receiver with an empty scheme, so callers send the raw
token as the `authorization` header (no `Bearer ` prefix).

Confirm it is healthy. The health check needs no install:

```bash
docker ps --filter name=clickstack-otel-collector --format '{{.Status}}'
curl -fsS http://localhost:13133/ && echo
docker logs --tail 40 clickstack-otel-collector 2>&1 | tail -40
```

A healthy start shows the seed migrations running to completion (`[seed] OK ...` lines ending
in `goose: up to current file version: N`), then `Everything is ready. Begin running and
processing data.` (or equivalent), `docker ps` reporting `Up ... (healthy)`, and the health
check returning HTTP 200. If instead the container exits, the cause is almost always in the
seed step:

- `code: 516, Authentication failed: password is incorrect` → `CLICKHOUSE_PASSWORD` is empty
  or wrong in the env file. The most common slip is storing the password under a different key
  name (it **must** be `CLICKHOUSE_PASSWORD`), or using a password containing `@ : / ? # %`,
  which corrupts the migration tool's connection URL.
- `[HTTP 403]` / `data size should be 0 < <huge number>` at "server hello" → same root cause:
  an empty/wrong password against the HTTPS endpoint.
- TLS / dial errors → `CLICKHOUSE_ENDPOINT` is malformed (it must be `https://<host>:8443`,
  with no `.0` on the port).
- `ACCESS_DENIED` referencing `default` → only on older image builds; apply the `default.*`
  grant from the Step 4 note and restart.

---

## Step 6: Send synthetic telemetry and verify ingestion

Use `telemetrygen` (the OpenTelemetry Collector Contrib generator). Run it from its **Docker
image** on the same network, so nothing is installed on the host. Its `--duration` flag
terminates the run reliably, so no watchdog wrapper is needed.

Load the env file so the token is available as a variable, then reference `$OTLP_AUTH_TOKEN`
so the literal token never appears in the command text, your output, or shell history.
`telemetrygen`'s header syntax requires the value to be a quoted string: `key="value"`.

```bash
set -a; . "$ENV_FILE"; set +a

TG_IMAGE=ghcr.io/open-telemetry/opentelemetry-collector-contrib/telemetrygen:latest
tg() {
  # usage: tg <logs|traces|metrics> [extra telemetrygen flags...]
  local signal="$1"; shift
  docker run --rm --network clickstack-net "$TG_IMAGE" "$signal" \
    --otlp-endpoint clickstack-otel-collector:4317 \
    --otlp-insecure \
    --otlp-header "authorization=\"$OTLP_AUTH_TOKEN\"" \
    --rate 5 --duration 10s "$@"
}

tg logs
tg traces
tg metrics --metric-type Sum
```

(`--metric-type` accepts `Gauge`, `Sum`, `Histogram`, or `ExponentialHistogram`. Use `--otlp-http`
with `--otlp-endpoint clickstack-otel-collector:4318` if you want to exercise the HTTP path
instead of gRPC.)

Wait ~15 seconds for the collector to flush its batch, then confirm the tables exist:

```bash
clickhousectl cloud service query --id "$SERVICE_ID" --query \
  "SELECT name FROM system.tables WHERE database='otel' ORDER BY name"
```

Then confirm rows are landing. Count by `parts.rows`, which is signal-agnostic and avoids
hard-coding per-signal column names:

```bash
clickhousectl cloud service query --id "$SERVICE_ID" --query \
  "SELECT table, sum(rows) AS rows
   FROM system.parts
   WHERE database='otel' AND active
     AND table IN ('otel_logs','otel_traces',
                   'otel_metrics_sum','otel_metrics_gauge',
                   'otel_metrics_histogram','otel_metrics_exponential_histogram',
                   'otel_metrics_summary')
   GROUP BY table ORDER BY table"
```

You should see non-zero `rows` for `otel_logs`, `otel_traces`, and `otel_metrics_sum`. If a
signal is missing:

1. Tail the collector logs (`docker logs --tail 50 clickstack-otel-collector`) for export errors.
2. Confirm the `authorization` header matches `$OTLP_AUTH_TOKEN` (a mismatch shows in the
   generator output as `code = Unauthenticated desc = provided authorization does not match
   expected scheme or token`).
3. Re-check `CLICKHOUSE_ENDPOINT` has the `https://` scheme and `:8443` port.
4. Some metric kinds flush slowly. Re-run the count after another 30 seconds before declaring failure.

Do not proceed until every expected signal has non-zero rows.

---

## Step 7: Own the last mile in ClickStack (wake the service, then complete onboarding)

Rows in ClickHouse are **not** the same as the user seeing telemetry in ClickStack. The
ClickStack UI requires a one-time onboarding step that detects the data sources, and that step
fails if the ClickHouse service has idle-suspended in the meantime. So immediately before
sending the user to the console, **wake the service and keep it awake**:

```bash
clickhousectl cloud service query --id "$SERVICE_ID" --query "SELECT 1"
```

Then tell the user to finish the onboarding in the ClickHouse Cloud console. Do not just say
"done", walk them through it:

1. Go back to the [ClickHouse Cloud console](https://console.clickhouse.cloud) and open the
   target service.
2. Select **ClickStack** from the left-hand menu.
3. Open **Getting Started** in the left-hand menu and complete the onboarding flow to detect
   sources.
4. The sources are **auto-detected**, and logs and traces become available in ClickStack.

The direct link is `https://console.clickhouse.cloud/services/<SERVICE_ID>/clickstack`.

**If source detection fails**, the service almost certainly idle-suspended between the data
send and the console step. Re-run the wake query above for the user, then have them re-run the
detection, rather than leaving them to debug an opaque failure.

---

## Step 8: Summarize and hand off (without echoing secrets)

Print a summary in exactly this format. Note the token is **referenced, not printed**, the
SQL password is not shown at all, and the collector keeps running until the user stops it:

```
✅ ClickStack is set up and ingesting telemetry for service <SERVICE_NAME> (<SERVICE_ID>),
   and the data sources are detected in ClickStack.

Local OpenTelemetry collector
  ▸ Container: clickstack-otel-collector (Docker, network clickstack-net)
  ▸ Send OTLP gRPC to: localhost:4317
  ▸ Send OTLP HTTP to: localhost:4318
  ▸ Health check:      http://localhost:13133/
  ▸ Required header:   authorization: <OTLP token>
       (retrieve with:  grep OTLP_AUTH_TOKEN <WORKDIR>/collector.env)

ClickHouse target
  ▸ Endpoint: <CLICKHOUSE_ENDPOINT>
  ▸ SQL user: hyperdx_ingest   (password in <WORKDIR>/collector.env, mode 0600)
  ▸ Database: otel

Finish in the ClickHouse Cloud console:
  ▸ Open the service, select ClickStack in the left menu, then Getting Started,
    and complete onboarding to auto-detect sources.
  ▸ https://console.clickhouse.cloud/services/<SERVICE_ID>/clickstack
```

Then tell the user, in your own words, that:

1. All secrets live in `<WORKDIR>/collector.env` (mode `0600`). Nothing sensitive was pasted
   into this chat or passed on a `docker run` command line.
2. The collector keeps running until they stop it: `docker stop clickstack-otel-collector`
   shuts it down, `docker start clickstack-otel-collector` brings it back.
3. Any application, SDK, or agent on this host can now send OTLP to `localhost:4317` (gRPC) or
   `localhost:4318` (HTTP) with the `authorization` header from the env file.
4. The ClickHouse Cloud service idle-suspends. If ClickStack later shows no recent data, the
   service may simply be asleep; sending new telemetry or running any query wakes it.

---

## Cleanup (only if the user explicitly asks)

```bash
docker rm -f clickstack-otel-collector
docker network rm clickstack-net 2>/dev/null || true
clickhousectl cloud service query --id "$SERVICE_ID" --query "DROP USER IF EXISTS hyperdx_ingest"
# Optionally remove the local secrets once they are no longer needed:
# rm -f "$WORKDIR/collector.env" "$WORKDIR/svc.json"
```

Do **not** drop the `otel` database: it contains telemetry the user may want to retain.
