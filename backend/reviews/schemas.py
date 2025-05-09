from pydantic import BaseModel, conint
from typing import Optional
from datetime import datetime

class ReviewBase(BaseModel):
    rating: conint(ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    product_id: int

class ReviewUpdate(BaseModel):
    rating: Optional[conint(ge=1, le=5)] = None
    comment: Optional[str] = None

class Review(ReviewBase):
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 