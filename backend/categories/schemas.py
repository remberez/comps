from typing import Optional
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    description: str

class CategoryCreate(CategoryBase):
    parent_id: Optional[int] = None

class CategoryUpdate(CategoryBase):
    parent_id: Optional[int] = None

class Category(CategoryBase):
    id: int
    parent_id: Optional[int]
    lft: int
    rgt: int

    class Config:
        from_attributes = True