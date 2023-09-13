terraform {
  backend "s3" {
    key     = "hello-bolt-nodejs/terraform.tfstate"
    bucket  = "engage-the-bots-sandbox"
    region  = "us-west-2"
    encrypt = "true"
  }

  required_version = ">= 1.0"
}
