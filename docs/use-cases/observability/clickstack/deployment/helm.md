---
slug: /use-cases/observability/clickstack/deployment/helm
title: 'Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 2
description: 'Deploying ClickStack with Helm - The ClickHouse Observability Stack'
doc_type: 'guide'
keywords: ['ClickStack Helm chart', 'Helm ClickHouse deployment', 'HyperDX Helm installation', 'Kubernetes observability stack', 'ClickStack Kubernetes deployment']
---

import Image from '@theme/IdealImage';
import hyperdx_24 from '@site/static/images/use-cases/observability/hyperdx-24.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

:::note Chart Migration
If you are currently using the `hdx-oss-v2` chart, please migrate to the `clickstack` chart. The `hdx-oss-v2` chart is now in maintenance mode and will no longer receive new features or updates. All new development and improvements are focused on the `clickstack` chart.

The `clickstack` chart provides the same functionality with improved naming and better organization.
:::

The Helm chart for ClickStack can be found [here](https://github.com/hyperdxio/helm-charts) and is the **recommended** method for production deployments.

By default, the Helm chart provisions all core components, including:
* **ClickHouse** (for storing logs, traces, and metrics)
* **HyperDX** (API, UI, and OpAMP server)
* **OpenTelemetry (OTel) collector** (for receiving and processing telemetry data)
* **MongoDB** (for persistent application metadata)

However, it can be easily customized to integrate with existing infrastructure, such as external ClickHouse deployments (including **ClickHouse Cloud**) or external OTEL collectors.

The chart supports standard Kubernetes best practices, including:
- Environment-specific configuration via `values.yaml`
- Resource limits and pod-level scaling
- TLS and ingress configuration
- Secrets management and authentication setup

### Suitable for {#suitable-for}

* Proof of concepts
* Production deployments
* Cloud-native environments (GKE, EKS, AKS)

## Quick start {#quick-start}

<br/>
<VerticalStepper headerLevel="h3">

### Prerequisites {#prerequisites}

- [Helm](https://helm.sh/) v3+
- Kubernetes cluster (v1.20+ recommended)
- `kubectl` configured to interact with your cluster

### Add the ClickStack Helm repository {#add-the-clickstack-helm-repository}
```shell
helm repo add clickstack https://hyperdxio.github.io/helm-charts
helm repo update
```

### Install ClickStack (full stack) {#install-clickstack-full-stack}

Install with default values (includes ClickHouse, OTEL collector, MongoDB, and HyperDX):
```shell
helm install my-clickstack clickstack/clickstack
```

**That's it!** ClickStack is now running with all components included.

### Verify the installation {#verify-the-installation}
```shell
kubectl get pods -l "app.kubernetes.io/name=clickstack"
```

Wait for all pods to reach `Running` status before proceeding.

### Access the HyperDX UI {#access-the-hyperdx-ui}

For initial setup and testing, use port forwarding:
```shell
kubectl port-forward \
  pod/$(kubectl get pod -l app.kubernetes.io/name=clickstack -o jsonpath='{.items[0].metadata.name}') \
  8080:3000
```

:::note Production Access
Port forwarding is suitable for local development or one-off administrative tasks. For production deployments, expose the service via an [ingress](#ingress-setup) or load balancer to ensure proper network access, TLS termination, and scalability.
:::

Visit [http://localhost:8080](http://localhost:8080) to access the HyperDX UI.

Create a user by providing a username and password that meets the requirements.

<Image img={hyperdx_login} alt="HyperDX UI" size="lg"/>

On clicking `Create`, data sources will be created for the ClickHouse instance deployed with the Helm chart.

</VerticalStepper>

## Deployment Options {#deployment-options}

ClickStack's Helm chart supports multiple deployment configurations to fit your infrastructure needs.

### Full stack (Default) {#full-stack-default}

By default, the chart deploys the complete ClickStack including all dependencies:
```shell
helm install my-clickstack clickstack/clickstack
```

This is ideal for:
- Getting started quickly
- Development and testing environments
- Self-contained production deployments

### External ClickHouse {#external-clickhouse}

If you have an existing ClickHouse cluster (including ClickHouse Cloud), you can disable the built-in ClickHouse and connect to your external instance.

#### Option 1: Inline Configuration (Development/Testing) {#external-clickhouse-inline}

Use this approach for quick testing or non-production environments:
```yaml
# values-external-clickhouse.yaml
clickhouse:
  enabled: false  # Disable the built-in ClickHouse

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363"  # Optional

hyperdx:
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
```
```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse.yaml
```

#### Option 2: External Secret (Production Recommended) {#external-clickhouse-secret}

For production deployments where you want to keep credentials separate from your Helm configuration:

**1. Create your configuration files:**

```json
cat <<EOF > connections.json
[
  {
    "name": "Production ClickHouse",
    "host": "https://your-production-clickhouse.com",
    "port": 8123,
    "username": "hyperdx_user",
    "password": "your-secure-password"
  }
]
EOF

# Create sources.json
cat <<EOF > sources.json
[
  {
    "from": {
      "databaseName": "default",
      "tableName": "otel_logs"
    },
    "kind": "log",
    "name": "Logs",
    "connection": "Production ClickHouse",
    "timestampValueExpression": "TimestampTime",
    "displayedTimestampValueExpression": "Timestamp",
    "implicitColumnExpression": "Body",
    "serviceNameExpression": "ServiceName",
    "bodyExpression": "Body",
    "eventAttributesExpression": "LogAttributes",
    "resourceAttributesExpression": "ResourceAttributes",
    "severityTextExpression": "SeverityText",
    "traceIdExpression": "TraceId",
    "spanIdExpression": "SpanId"
  },
  {
    "from": {
      "databaseName": "default",
      "tableName": "otel_traces"
    },
    "kind": "trace",
    "name": "Traces",
    "connection": "Production ClickHouse",
    "timestampValueExpression": "Timestamp",
    "displayedTimestampValueExpression": "Timestamp",
    "implicitColumnExpression": "SpanName",
    "serviceNameExpression": "ServiceName",
    "traceIdExpression": "TraceId",
    "spanIdExpression": "SpanId",
    "durationExpression": "Duration"
  }
]
EOF
```

**2. Create the Kubernetes secret:**
```bash
kubectl create secret generic hyperdx-external-config \
  --from-file=connections.json=connections.json \
  --from-file=sources.json=sources.json

# Clean up local files
rm connections.json sources.json
```

**3. Configure Helm to use the secret:**
```yaml
# values-external-clickhouse-secret.yaml
clickhouse:
  enabled: false

otel:
  clickhouseEndpoint: "tcp://your-clickhouse-server:9000"
  clickhousePrometheusEndpoint: "http://your-clickhouse-server:9363"

hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "hyperdx-external-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```
```shell
helm install my-clickstack clickstack/clickstack -f values-external-clickhouse-secret.yaml
```

#### Using ClickHouse Cloud {#using-clickhouse-cloud}

For ClickHouse Cloud specifically:
```yaml
# values-clickhouse-cloud.yaml
clickhouse:
  enabled: false
  persistence:
    enabled: false

otel:
  clickhouseEndpoint: "tcp://your-cloud-instance.clickhouse.cloud:9440?secure=true"

hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "clickhouse-cloud-config"
  existingConfigConnectionsKey: "connections.json"
  existingConfigSourcesKey: "sources.json"
```

For a complete example of connecting to ClickHouse Cloud, see ["Create a ClickHouse Cloud connection"](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection).

### External OTEL Collector {#external-otel-collector}

If you have an existing OTEL collector infrastructure:
```yaml
# values-external-otel.yaml
otel:
  enabled: false  # Disable the built-in OTEL collector

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
```
```shell
helm install my-clickstack clickstack/clickstack -f values-external-otel.yaml
```

For instructions on exposing OTEL collector endpoints via ingress, see the [OTEL Collector Ingress](#otel-collector-ingress) section.

### Minimal Deployment {#minimal-deployment}

For organizations with existing infrastructure, deploy only HyperDX:
```yaml
# values-minimal.yaml
clickhouse:
  enabled: false

otel:
  enabled: false

hyperdx:
  otelExporterEndpoint: "http://your-otel-collector:4318"
  
  # Option 1: Inline (for testing)
  defaultConnections: |
    [
      {
        "name": "External ClickHouse",
        "host": "http://your-clickhouse-server:8123",
        "port": 8123,
        "username": "your-username",
        "password": "your-password"
      }
    ]
  
  # Option 2: External secret (production)
  # useExistingConfigSecret: true
  # existingConfigSecret: "my-external-config"
  # existingConfigConnectionsKey: "connections.json"
  # existingConfigSourcesKey: "sources.json"
```
```shell
helm install my-clickstack clickstack/clickstack -f values-minimal.yaml
```

## Configuration {#configuration}

### API Key Setup {#api-key-setup}

After successfully deploying ClickStack, configure the API key to enable telemetry data collection:

1. **Access your HyperDX instance** via the configured ingress or service endpoint
2. **Log into the HyperDX dashboard** and navigate to Team settings to generate or retrieve your API key
3. **Update your deployment** with the API key using one of the following methods:

#### Method 1: Update via Helm upgrade with values file {#api-key-values-file}

Add the API key to your `values.yaml`:
```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

Then upgrade your deployment:
```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

#### Method 2: Update via Helm upgrade with --set flag {#api-key-set-flag}
```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```

#### Restart pods to apply changes {#restart-pods}

After updating the API key, restart the pods to pick up the new configuration:
```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
The chart automatically creates a Kubernetes secret (`<release-name>-app-secrets`) with your API key. No additional secret configuration is needed unless you want to use an external secret.
:::

### Secret Management {#secret-management}

For handling sensitive data such as API keys or database credentials, use Kubernetes secrets.

#### Using Pre-Configured Secrets {#using-pre-configured-secrets}

The Helm chart includes a default secret template located at [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). This file provides a base structure for managing secrets.

If you need to manually apply a secret, modify and apply the provided `secrets.yaml` template:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: hyperdx-secret
  annotations:
    "helm.sh/resource-policy": keep
type: Opaque
data:
  API_KEY: <base64-encoded-api-key>
```

Apply the secret to your cluster:
```shell
kubectl apply -f secrets.yaml
```

#### Creating a Custom Secret {#creating-a-custom-secret}

Create a custom Kubernetes secret manually:
```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

#### Referencing a Secret in values.yaml {#referencing-a-secret}
```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

### Ingress Setup {#ingress-setup}

To expose the HyperDX UI and API via a domain name, enable ingress in your `values.yaml`.

#### General Ingress Configuration {#general-ingress-configuration}
```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note Important Configuration Note
`hyperdx.frontendUrl` should match the ingress host and include the protocol (e.g., `https://hyperdx.yourdomain.com`). This ensures that all generated links, cookies, and redirects work correctly.
:::

#### Enabling TLS (HTTPS) {#enabling-tls}

To secure your deployment with HTTPS:

**1. Create a TLS secret with your certificate and key:**
```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. Enable TLS in your ingress configuration:**
```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

#### Example ingress configuration {#example-ingress-configuration}

For reference, here's what the generated ingress resource looks like:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hyperdx-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: hyperdx.yourdomain.com
      http:
        paths:
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-clickstack-clickstack-app
                port:
                  number: 3000
  tls:
    - hosts:
        - hyperdx.yourdomain.com
      secretName: hyperdx-tls
```

#### Common Ingress Pitfalls {#common-ingress-pitfalls}

**Path and Rewrite Configuration:**
- For Next.js and other SPAs, always use a regex path and rewrite annotation as shown above
- Do not use just `path: /` without a rewrite, as this will break static asset serving

**Mismatched `frontendUrl` and `ingress.host`:**
- If these do not match, you may experience issues with cookies, redirects, and asset loading

**TLS Misconfiguration:**
- Ensure your TLS secret is valid and referenced correctly in the ingress
- Browsers may block insecure content if you access the app over HTTP when TLS is enabled

**Ingress Controller Version:**
- Some features (like regex paths and rewrites) require recent versions of nginx ingress controller
- Check your version with:
```shell
  kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

### OTEL Collector Ingress {#otel-collector-ingress}

If you need to expose your OTEL collector endpoints (for traces, metrics, logs) through ingress, use the `additionalIngresses` configuration. This is useful for sending telemetry data from outside the cluster or using a custom domain for the collector.
```yaml
hyperdx:
  ingress:
    enabled: true
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

- This creates a separate ingress resource for the OTEL collector endpoints
- You can use a different domain, configure specific TLS settings, and apply custom annotations
- The regex path rule allows you to route all OTLP signals (traces, metrics, logs) through a single rule

:::note
If you do not need to expose the OTEL collector externally, you can skip this configuration. For most users, the general ingress setup is sufficient.
:::

### Troubleshooting Ingress {#troubleshooting-ingress}

**Check Ingress Resource:**
```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Check Ingress Controller Logs:**
```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Test Asset URLs:**
Use `curl` to verify static assets are served as JS, not HTML:
```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**Browser DevTools:**
- Check the Network tab for 404s or assets returning HTML instead of JS
- Look for errors like `Unexpected token <` in the console (indicates HTML returned for JS)

**Check for Path Rewrites:**
- Ensure the ingress is not stripping or incorrectly rewriting asset paths

**Clear Browser and CDN Cache:**
- After changes, clear your browser cache and any CDN/proxy cache to avoid stale assets

### Customizing Values {#customizing-values}

You can customize settings by using `--set` flags:
```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Alternatively, create a custom `values.yaml`. To retrieve the default values:
```shell
helm show values clickstack/clickstack > values.yaml
```

Example configuration:
```yaml
replicaCount: 2

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

hyperdx:
  ingress:
    enabled: true
    host: hyperdx.example.com
```

Apply your custom values:
```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## Cloud Deployment {#cloud-deployment}

### Google Kubernetes Engine (GKE) {#google-kubernetes-engine-gke}

When deploying to GKE, you may need to override certain values due to cloud-specific networking behavior.

#### LoadBalancer DNS Resolution Issue {#loadbalancer-dns-resolution-issue}

GKE's LoadBalancer service can cause internal DNS resolution issues where pod-to-pod communication resolves to external IPs instead of staying within the cluster network. This specifically affects the OTEL collector's connection to the OpAMP server.

**Symptoms:**
- OTEL collector logs showing "connection refused" errors with cluster IP addresses
- OpAMP connection failures like: `dial tcp 34.118.227.30:4320: connect: connection refused`

**Solution:**
Use the fully qualified domain name (FQDN) for the OpAMP server URL:
```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

#### Other GKE Considerations {#other-gke-considerations}
```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

# Adjust for GKE pod networking if needed
clickhouse:
  config:
    clusterCidrs:
      - "10.8.0.0/16"  # GKE commonly uses this range
      - "10.0.0.0/8"   # Fallback for other configurations
```

### Amazon EKS {#amazon-eks}

For EKS deployments, consider these common configurations:
```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"

# EKS typically uses these pod CIDRs
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"

# Enable ingress for production
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
```

### Azure AKS {#azure-aks}

For AKS deployments:
```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"

# AKS pod networking
clickhouse:
  config:
    clusterCidrs:
      - "10.244.0.0/16"  # Common AKS pod CIDR
      - "10.0.0.0/8"
```

### Production Cloud Deployment Checklist {#production-cloud-deployment-checklist}

- [ ] Configure proper `frontendUrl` with your external domain/IP
- [ ] Set up ingress with TLS for HTTPS access
- [ ] Override `otel.opampServerUrl` with FQDN if experiencing connection issues
- [ ] Adjust `clickhouse.config.clusterCidrs` for your pod network CIDR
- [ ] Configure persistent storage for production workloads
- [ ] Set appropriate resource requests and limits
- [ ] Enable monitoring and alerting
- [ ] Configure backup and disaster recovery
- [ ] Implement proper secret management

### Browser Compatibility Notes {#browser-compatibility-notes}

For HTTP-only deployments (development/testing), some browsers may show crypto API errors due to secure context requirements. For production deployments, always use HTTPS with proper TLS certificates through ingress configuration.

## Production Notes {#production-notes}

By default, the chart installs ClickHouse and the OTel collector. However, for production environments, it's recommended that you manage ClickHouse and the OTel collector separately for:

- Better scalability and resource management
- Independent upgrade cycles
- Dedicated monitoring and alerting
- Separation of concerns

To disable ClickHouse and the OTel collector:
```shell
helm install my-clickstack clickstack/clickstack \
  --set clickhouse.enabled=false \
  --set clickhouse.persistence.enabled=false \
  --set otel.enabled=false
```

### Production Best Practices {#production-best-practices}

**Resource Management:**
```yaml
hyperdx:
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
```

**High Availability:**
```yaml
hyperdx:
  replicaCount: 3
  
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/name
                  operator: In
                  values:
                    - clickstack
            topologyKey: kubernetes.io/hostname
```

**Persistent Storage:**
Ensure persistent volumes are configured for data retention:
```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"
```

## Task Configuration {#task-configuration}

By default, there is one task in the chart set up as a cronjob, responsible for checking whether alerts should fire. Here are its configuration options:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `tasks.enabled` | Enable/Disable cron tasks in the cluster. By default, the HyperDX image will run cron tasks intra-process. Change to true if you'd rather use a separate cron task in the cluster. | `false` |
| `tasks.checkAlerts.schedule` | Cron schedule for the check-alerts task | `*/1 * * * *` |
| `tasks.checkAlerts.resources` | Resource requests and limits for the check-alerts task | See `values.yaml` |

Example configuration:
```yaml
tasks:
  enabled: true
  checkAlerts:
    schedule: "*/5 * * * *"  # Run every 5 minutes
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 200m
        memory: 256Mi
```

## Operations {#operations}

### Upgrading the chart {#upgrading-the-chart}

To upgrade to a newer version:
```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

To check available chart versions:
```shell
helm search repo clickstack
```

View the changes that will be applied:
```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml --dry-run --debug
```

### Uninstalling ClickStack {#uninstalling-clickstack}

To remove the deployment:
```shell
helm uninstall my-clickstack
```

This will remove all resources associated with the release, but persistent data (if any) may remain.

To also remove persistent volume claims:
```shell
kubectl delete pvc -l app.kubernetes.io/instance=my-clickstack
```

## Troubleshooting {#troubleshooting}

### Checking logs {#checking-logs}

**View logs for all ClickStack components:**
```shell
kubectl logs -l app.kubernetes.io/name=clickstack
```

**View logs for a specific component:**
```shell
# HyperDX application
kubectl logs -l app.kubernetes.io/component=app

# OTEL collector
kubectl logs -l app.kubernetes.io/component=otel-collector

# ClickHouse
kubectl logs -l app.kubernetes.io/component=clickhouse
```

**Follow logs in real-time:**
```shell
kubectl logs -f -l app.kubernetes.io/name=clickstack
```

### Debugging a Failed Install {#debugging-a-failed-install}
```shell
helm install my-clickstack clickstack/clickstack --debug --dry-run
```

### Verifying Deployment {#verifying-deployment}
```shell
# Check pod status
kubectl get pods -l app.kubernetes.io/name=clickstack

# Check services
kubectl get services -l app.kubernetes.io/name=clickstack

# Check ingress (if enabled)
kubectl get ingress

# Describe a specific pod for detailed information
kubectl describe pod <pod-name>
```

### Common issues {#common-issues}

**Pods not starting:**
- Check resource availability: `kubectl describe node`
- Verify image pull secrets and registry access
- Check for persistent volume claim issues

**Connection refused errors:**
- Verify service endpoints: `kubectl get endpoints`
- Check network policies and firewalls
- For cloud deployments, ensure OpAMP uses FQDN (see [GKE section](#loadbalancer-dns-resolution-issue))

**UI not loading or showing blank page:**
- Verify ingress configuration and TLS setup
- Check that `frontendUrl` matches ingress host
- Inspect browser console for asset loading errors
- Verify static assets are being served correctly (see [Troubleshooting Ingress](#troubleshooting-ingress))

**Authentication or API key issues:**
- Verify secrets are created and mounted correctly
- Restart pods after updating secrets
- Check environment variables in pod: `kubectl exec <pod-name> -- env`

<JSONSupport/>

Users can set these environment variables via either parameters or the `values.yaml`:

**values.yaml:**
```yaml
hyperdx:
  env:
    - name: BETA_CH_OTEL_JSON_SCHEMA_ENABLED
      value: "true"

otel:
  env:
    - name: OTEL_AGENT_FEATURE_GATE_ARG
      value: "--feature-gates=clickhouse.json"
```

**Or via --set:**
```shell
helm install my-clickstack clickstack/clickstack \
  --set "hyperdx.env[0].name=BETA_CH_OTEL_JSON_SCHEMA_ENABLED" \
  --set "hyperdx.env[0].value=true" \
  --set "otel.env[0].name=OTEL_AGENT_FEATURE_GATE_ARG" \
  --set "otel.env[0].value=--feature-gates=clickhouse.json"
```

## Further Resources {#further-resources}

- [ClickStack Helm Charts Repository](https://github.com/hyperdxio/helm-charts)
- [ClickStack Getting Started Guide](/use-cases/observability/clickstack/getting-started)
- [ClickHouse Cloud Documentation](https://clickhouse.com/docs/cloud)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
