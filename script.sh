#!/bin/bash
# This script is designed to be idempotent and safe to re-run.
set -e

# ===================================================================
# == K8s Bootstrap Script for Initial Setup
# == This script installs core managers, creates ClusterIssuers,
# == and exposes Argo CD with a valid HTTPS certificate.
# == Run this script ONCE on a fresh K3s cluster.
# ===================================================================

# --- Configuration ---
ARGOCD_HOSTNAME="argocd.dossware.com"
ADMIN_EMAIL="your-email@dossware.com" # <<< IMPORTANT: CHANGE THIS TO YOUR EMAIL

echo "--- [1/6] Installing Cert-Manager via Helm... ---"
helm repo add jetstack https://charts.jetstack.io > /dev/null
helm repo update > /dev/null
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.12.0 \
  --set installCRDs=true \
  --wait # Wait for the installation to complete

echo "--- Cert-Manager installed. Verifying pods... ---"
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=cert-manager \
  -n cert-manager --timeout=120s

echo "--- [2/6] Creating ClusterIssuers for Cert-Manager... ---"
# We apply the ClusterIssuer definitions directly now that the CRDs exist.
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: ${ADMIN_EMAIL}
    privateKeySecretRef:
      name: letsencrypt-prod-private-key
    solvers:
    - http01:
        ingress:
          class: traefik
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: ${ADMIN_EMAIL}
    privateKeySecretRef:
      name: letsencrypt-staging-private-key
    solvers:
    - http01:
        ingress:
          class: traefik
EOF

echo "--- ClusterIssuers created. ---"

echo "--- [3/6] Installing Argo CD via Helm with Ingress settings... ---"
helm repo add argo https://argoproj.github.io/argo-helm > /dev/null
helm repo update > /dev/null
helm upgrade --install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set 'configs.params.server\.insecure'=true \
  --set "configs.cm.url=https://${ARGOCD_HOSTNAME}" \
  --wait # Wait for the installation to complete

echo "--- Argo CD installed. Verifying pods... ---"
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=argocd-server -n argocd --timeout=180s

echo "--- [4/6] Creating Ingress for Argo CD... ---"
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: traefik
  rules:
  - host: "${ARGOCD_HOSTNAME}"
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 80
  tls:
  - hosts:
    - "${ARGOCD_HOSTNAME}"
    secretName: argocd-tls-certificate
EOF

echo "--- Ingress for Argo CD created. ---"

echo "--- [5/6] Waiting for Argo CD certificate from Let's Encrypt... ---"
echo "This might take a few minutes..."
kubectl wait --for=condition=Ready certificate \
  -n argocd argocd-tls-certificate --timeout=300s

echo "--- Certificate is ready! ---"

echo "--- [6/6] Getting initial Argo CD admin password... ---"
ARGO_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

echo ""
echo "==================================================================="
echo "== Bootstrap Complete! Your system is ready. =="
echo "==================================================================="
echo ""
echo "Argo CD UI is available at: https://${ARGOCD_HOSTNAME}"
echo "Argo CD Admin Password:     ${ARGO_PASSWORD}"
echo ""
echo "Next steps:"
echo "1. Login to Argo CD using the URL and password above."
echo "2. Put the 'Declarative Application Stack' YAML file into a Git repository."
echo "3. Create a 'root' application in Argo CD pointing to that Git repository."
echo ""
