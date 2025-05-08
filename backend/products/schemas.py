from pydantic import BaseModel, conint, confloat
from typing import Optional

class ProductBase(BaseModel):
    name: str
    description: str
    price: confloat(gt=0)  # Цена должна быть больше 0
    stock: conint(ge=0)    # Количество не может быть отрицательным
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[confloat(gt=0)] = None
    stock: Optional[conint(ge=0)] = None
    category_id: Optional[int] = None

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True 