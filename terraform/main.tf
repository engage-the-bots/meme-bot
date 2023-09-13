data "aws_ssm_parameter" "slack" {
  name = "/engage2023/bot2/slack"
}

module "bot_lambda" {
  source = "terraform-aws-modules/lambda/aws"
  function_name = var.slackbot_resource_name
  description   = "Engage 2023 Build your own NodeJS Slack Bot"
  handler       = "src/app.handler"
  runtime       = "nodejs18.x"
  source_path = "../slackbot-event-handler"
  create_lambda_function_url = true
  environment_variables = {
    SLACK_BOT_TOKEN      = jsondecode(data.aws_ssm_parameter.slack.value).bot_token
    SLACK_SIGNING_SECRET = jsondecode(data.aws_ssm_parameter.slack.value).signing_secret
  }

  tags = {
    Name        = var.slackbot_resource_name
    TechContact = "mldelaro"
  }
}

output "function_url" {
  description = "Lambda Function URL"
  value       = module.bot_lambda.lambda_function_url
}
