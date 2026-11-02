output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "ecs_cluster_name" {
  description = "Name of the AWS ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the ECS backend service"
  value       = aws_ecs_service.backend.name
}

output "rds_endpoint" {
  description = "Database connection endpoint for PostgreSQL"
  value       = aws_db_instance.postgres.endpoint
}

