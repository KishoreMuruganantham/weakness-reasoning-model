FROM python:3.11-slim

LABEL maintainer="Team Algorithm Aliens"
LABEL description="Intelligent Weakness Reasoning Model - Multi-Signal Bayesian Engine"

WORKDIR /app

# Copy source code
COPY src/ ./src/
COPY requirements.txt .

# No pip install needed - zero external dependencies (stdlib only)

# Create output directories
RUN mkdir -p /app/data /app/output

# Run the analysis
CMD ["python", "-m", "src.main"]
