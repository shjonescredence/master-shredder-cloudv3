# Outputs for Master Shredder Cloud v3 Infrastructure

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_url" {
  description = "Full URL of the application"
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

output "secrets_manager_secret_name" {
  description = "Name of the Secrets Manager secret for OpenAI API key"
  value       = aws_secretsmanager_secret.openai_api_key.name
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.app.name
}

# Instructions for next steps
output "deployment_instructions" {
  description = "Next steps for deployment"
  value = <<-EOT
    
    🚀 DEPLOYMENT INSTRUCTIONS:
    
    1. Update the OpenAI API key in AWS Secrets Manager:
       aws secretsmanager update-secret --secret-id ${aws_secretsmanager_secret.openai_api_key.name} --secret-string '{"api_key":"your-actual-openai-key"}'
    
    2. Build and push Docker image:
       aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${aws_ecr_repository.app.repository_url}
       docker build -t ${var.app_name} .
       docker tag ${var.app_name}:latest ${aws_ecr_repository.app.repository_url}:latest
       docker push ${aws_ecr_repository.app.repository_url}:latest
    
    3. Your application will be available at: http://${aws_lb.main.dns_name}
    
    EOT
}
