from pydantic import BaseModel, conint, confloat
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: str
    price: confloat(gt=0)  # Цена должна быть больше 0
    stock: conint(ge=0)    # Количество не может быть отрицательным
    category_id: int
    supplier_id: int
    supply_price: confloat(gt=0)
    last_supply_date: datetime

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[confloat(gt=0)] = None
    stock: Optional[conint(ge=0)] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    supply_price: Optional[confloat(gt=0)] = None
    last_supply_date: Optional[datetime] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        