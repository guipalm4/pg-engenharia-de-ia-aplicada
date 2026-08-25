terraform {
  required_version = ">= 1.3"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "nexus_apollo_data" {
  bucket = "nexus-apollo-data"
  acl    = "private"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  lifecycle_rule {
    id      = "log"
    enabled = true

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    expiration {
      days = 365
    }
  }

  tags = {
    Environment = "Production"
    Project     = "Nexus Apollo"
  }
}

resource "aws_s3_bucket_public_access_block" "nexus_apollo_data" {
  bucket                  = aws_s3_bucket.nexus_apollo_data.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "bucket_name" {
  value = aws_s3_bucket.nexus_apollo_data.bucket
}