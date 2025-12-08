---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm configuration'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Configuring API keys, secrets, and ingress for ClickStack Helm deployments'
doc_type: 'guide'
keywords: ['ClickStack configuration', 'Helm secrets', 'API key setup', 'ingress configuration', 'TLS setup']
---

This guide covers configuration options for ClickStack Helm deployments. For basic installation, see the [main Helm deployment guide](/docs/use-cases/observability/clickstack/deployment/helm).

## API key setup {#api-key-setup}

After successfully deploying ClickStack, configure the API key to enable telemetry data collection:

1. **Access your HyperDX instance** via the configured ingress or service endpoint
2. **Log into the HyperDX dashboard** and navigate to Team settings to generate or retrieve your API key
3. **Update your deployment** with the API key using one of the following methods:

### Method 1: update via Helm upgrade with values file {#api-key-values-file}

Add the API key to your `values.yaml`:
```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

Then upgrade your deployment:
```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### Method 2: update via Helm upgrade with --set flag {#api-key-set-flag}
```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```

### Restart pods to apply changes {#restart-pods}

After updating the API key, restart the pods to pick up the new configuration:
```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
The chart automatically creates a Kubernetes secret (`<release-name>-app-secrets`) with your API key. No additional secret configuration is needed unless you want to use an external secret.
:::

## Secret management {#secret-management}

For handling sensitive data such as API keys or database credentials, use Kubernetes secrets.

### Using pre-configured secrets {#using-pre-configured-secrets}

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

### Creating a custom secret {#creating-a-custom-secret}

Create a custom Kubernetes secret manually:
```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### Referencing a secret in values.yaml {#referencing-a-secret}
```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

## Ingress setup {#ingress-setup}

To expose the HyperDX UI and API via a domain name, enable ingress in your `values.yaml`.

### General ingress configuration {#general-ingress-configuration}
```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note Important configuration note
`hyperdx.frontendUrl` should match the ingress host and include the protocol (e.g., `https://hyperdx.yourdomain.com`). This ensures that all generated links, cookies, and redirects work correctly.
:::

### Enabling TLS (HTTPS) {#enabling-tls}

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

### Example ingress configuration {#example-ingress-configuration}

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

### Common ingress pitfalls {#common-ingress-pitfalls}

**Path and rewrite configuration:**
- For Next.js and other SPAs, always use a regex path and rewrite annotation as shown above
- Do not use just `path: /` without a rewrite, as this will break static asset serving

**Mismatched `frontendUrl` and `ingress.host`:**
- If these do not match, you may experience issues with cookies, redirects, and asset loading

**TLS misconfiguration:**
- Ensure your TLS secret is valid and referenced correctly in the ingress
- Browsers may block insecure content if you access the app over HTTP when TLS is enabled

**Ingress controller version:**
- Some features (like regex paths and rewrites) require recent versions of nginx ingress controller
- Check your version with:
```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## Otel collector ingress {#otel-collector-ingress}

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

## Troubleshooting ingress {#troubleshooting-ingress}

**Check ingress resource:**
```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Check ingress controller logs:**
```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Test asset URLs:**

Use `curl` to verify static assets are served as JS, not HTML:
```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**Browser DevTools:**
- Check the Network tab for 404s or assets returning HTML instead of JS
- Look for errors like `Unexpected token <` in the console (indicates HTML returned for JS)

**Check for path rewrites:**
- Ensure the ingress is not stripping or incorrectly rewriting asset paths

**Clear browser and CDN cache:**
- After changes, clear your browser cache and any CDN/proxy cache to avoid stale assets

## Customizing values {#customizing-values}

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

## Next steps {#next-steps}

- [Deployment options](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - External systems and minimal deployments
- [Cloud deployments](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS, and AKS configurations
- [Main Helm guide](/docs/use-cases/observability/clickstack/deployment/helm) - Basic installation
