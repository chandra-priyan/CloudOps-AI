# CloudOps AI — AWS EKS & Production Deployment Guide

## Overview
This guide describes provisioning production AWS infrastructure using Terraform and deploying CloudOps AI onto Amazon EKS (Elastic Kubernetes Service).

## Infrastructure Components
- **VPC Module**: Multi-AZ VPC with Public/Private subnets, NAT Gateways, and Internet Gateway.
- **EKS Module**: Managed Kubernetes cluster with worker node auto-scaling group (3x t3.medium instances).
- **ECR Module**: Private container registries for `cloudops-backend`, `cloudops-frontend`, and `cloudops-ai-service`.

## Provisioning Steps

1. Navigate to the terraform directory:
   ```bash
   cd terraform
   ```
2. Initialize Terraform providers:
   ```bash
   terraform init
   ```
3. Review execution plan:
   ```bash
   terraform plan -out=tfplan
   ```
4. Apply infrastructure:
   ```bash
   terraform apply tfplan
   ```
5. Configure `kubectl` context for AWS EKS:
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name cloudops-ai-dev
   ```
6. Deploy Kubernetes manifests using Kustomize:
   ```bash
   kubectl apply -k k8s/overlays/dev
   ```
