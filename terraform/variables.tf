variable "aws_region" {
  description = "AWS deployment region (Mumbai for Indian financial platform)"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name (e.g. production, staging)"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application identifier"
  type        = string
  default     = "finfolio-india"
}

variable "vpc_cidr" {
  description = "CIDR block for the dedicated VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "PostgreSQL RDS Database Name"
  type        = string
  default     = "finfoliodb"
}

variable "db_username" {
  description = "Master administrator username for RDS"
  type        = string
  default     = "finfolio_admin"
}

variable "db_password" {
  description = "Master database password"
  type        = string
  default     = "SecureFinFolio2026Password!"
  sensitive   = true
}

variable "backend_container_port" {
  description = "Container port exposed by FastAPI"
  type        = number
  default     = 8000
}

variable "ecs_task_cpu" {
  description = "Fargate CPU allocation units (512 = 0.5 vCPU)"
  type        = number
  default     = 512
}

variable "ecs_task_memory" {
  description = "Fargate Memory allocation in MB"
  type        = number
  default     = 1024
}

