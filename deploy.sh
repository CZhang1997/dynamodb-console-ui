npm run build
aws s3 sync build/ s3://dynamodbworkbench-webapp-prod-us-east-1
aws cloudfront create-invalidation --distribution-id E1G5A19UC6JTSR --paths "/*"