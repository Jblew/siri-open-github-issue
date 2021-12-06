# siri-open-github-issue

Open github issue with siri! Docker/Firebase/CloudRun endpoint

Features:

- Use Siri shortcut to easily create github issue
- Github issue can be added to Github project (a kanban) (for triage)
- Prevents unwanted access with apikey specified via env
- Configuration via environment variables allows direct deployment to cloud
- Below examples for docker-compose and for Google Cloud (GCP) CloudRun

[TOC]

## Installation

Images:

- docker.io/jedrzejlewandowski/siri-open-github-issue
- ghcr.io/jblew/siri-open-github-issue

## Usage

### With docker-compose

```yaml
version: "3.7"
services:
  server:
    build: .
    command: npm run start
    environment:
      APIKEY_FOR_CLIENTS: "inmysecretlife123" # Api for clients to provide (to prevent unwanted access)
      OWNER: Jblew # Repository owner
      REPO: ephemeris # Repository name
      GITHUB_TOKEN: "" # You Github Personal Access Token
      PROJECT_COLUMN_ID: 764 ## Id of a column in Github project (below instructions on how to find it)
    ports:
      - 8080:80
```

### With Google Cloud (GCP) Clud Run

```sh
gcloud config set project "${GCP_PROJECT_ID}"
gcloud artifacts repositories create ${GCP_ARTIFACT_REPOSITORY} \
    --repository-format=docker \
    --location=${GCP_REGION}
gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev"
TAG="1.0.7"
docker pull "ghcr.io/jblew/siri-open-github-issue:${TAG}"
TARGET_IMAGE="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REPOSITORY}/siri-open-github-issue:${TAG}"
docker tag "ghcr.io/jblew/siri-open-github-issue:${TAG}" ${TARGET_IMAGE}
docker push ${TARGET_IMAGE}

# You need to setup service account roles and Artifact Registry repository before you begin
gcloud beta run deploy "${SERVICE_NAME}" \
            --region "${GCP_REGION_CLOUDRUN}" \
            --image "${TARGET_IMAGE}" \
            --allow-unauthenticated \
            --set-env-vars="APIKEY_FOR_CLIENTS=${APIKEY_FOR_CLIENTS},OWNER=${OWNER},REPO=${REPO},GITHUB_TOKEN=${GITHUB_TOKEN},PROJECT_COLUMN_ID=${PROJECT_COLUMN_ID}"
```

Below are instruction on how to set up service accont for github actions + GCP cloud run + GCP Artifact repository

## Setting up Siri shortcut

![Instructions on setting up Siri Shortcut](./img/siri-shortcut-instructions.png)

## Misc

### How to find ID of a Github project column

![How to find ID of a column](./img/id-of-a-column.png)

### How to create Cloud Run service accont and permissions for Cloud Run deployment and Artifact repository

```bash
GCP_PROJECT_ID="..."
SERVICE_ACCOUNT_ID="gh-actions-..."

gcloud config set project "${GCP_PROJECT_ID}"
gcloud iam service-accounts create ${SERVICE_ACCOUNT_ID} --display-name="gh-actions-ephemeris-backend"

gcloud projects get-iam-policy "${GCP_PROJECT_ID}" --format=json > policy-before.json

SERVICE_ACCOUNT_RESOURCE_ID="serviceAccount:${SERVICE_ACCOUNT_ID}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
    --member="${SERVICE_ACCOUNT_RESOURCE_ID}" --role="roles/run.admin"
gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
    --member="${SERVICE_ACCOUNT_RESOURCE_ID}" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
    --member="${SERVICE_ACCOUNT_RESOURCE_ID}" --role="roles/artifactregistry.writer"

gcloud projects get-iam-policy "${GCP_PROJECT_ID}" --format=json > policy-after.json

gcloud iam service-accounts keys create ./gh-actions-serviceAccount.json \
   --iam-account="${SERVICE_ACCOUNT_ID}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"

```
