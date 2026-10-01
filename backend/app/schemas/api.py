from pydantic import BaseModel, Field
from typing import Any, Optional
class LoginRequest(BaseModel): user_id:str=Field(min_length=1,max_length=64); password:str=Field(min_length=1,max_length=128)
class PredictRequest(BaseModel): variable:str; features:dict[str,float]; horizon_hours:int=Field(default=24,ge=1,le=168)
class ErrorBody(BaseModel): code:str; message:str; request_id:str
class ApiError(BaseModel): error:ErrorBody
