# -----------------------------------------------------------------------------
# AWS RDS PostgreSQL Database
# -----------------------------------------------------------------------------

resource "aws_db_subnet_group" "rds" {
  name        = "${var.app_name}-db-subnet-group"
  description = "Subnet group for RDS PostgreSQL across multi-AZ private subnets"
  subnet_ids  = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = {
    Name = "${var.app_name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.app_name}-rds-sg"
  description = "Allows incoming PostgreSQL traffic strictly from ECS Tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from ECS service"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-rds-sg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier        = "${var.app_name}-postgres"
  engine            = "postgres"
  engine_version     = "16.1"
  instance_class    = "db.t4g.micro"
  allocated_storage = 20
  max_allocated_storage = 100
  storage_type      = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = false # Set true for multi-AZ production failover
  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "${var.app_name}-rds-postgres"
  }
}

