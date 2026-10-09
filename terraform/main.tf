terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "CloudOps-AI"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

module "vpc" {
  source = "./modules/vpc"
  vpc_cidr = var.vpc_cidr
  environment = var.environment
}

module "ecr" {
  source = "./modules/ecr"
  repository_names = ["cloudops-backend", "cloudops-frontend", "cloudops-ai-service"]
}

module "eks" {
  source = "./modules/eks"
  cluster_name = "cloudops-ai-${var.environment}"
  vpc_id = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  node_group_desired_size = 3
}
