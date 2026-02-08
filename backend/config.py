from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # API Keys
    openai_api_key: str = ""
    perplexity_api_key: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # CORS
    frontend_url: str = "http://localhost:3000"

    # Rate limiting
    free_analysis_limit: int = 1

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
