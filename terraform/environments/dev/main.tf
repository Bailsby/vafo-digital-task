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
}

module "string_analyser" {
  source = "../../modules/lambda"

  function_name      = "string-analyser-dev"
  environment        = "dev"
  lambda_zip_path    = var.lambda_zip_path
  timeout            = 10
  memory_size        = 128
  log_retention_days = 7
}

output "function_name" {
  value = module.string_analyser.function_name
}

output "function_arn" {
  value = module.string_analyser.function_arn
}