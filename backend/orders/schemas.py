from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class OrderProductBase(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)
    price_at_time: float = Field(gt=0)

class OrderBase(BaseModel):
    shipping_address: str

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Optional[str] = None

class OrderProduct(OrderProductBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

class Order(OrderBase):
    id: int
    user_id: int
    status: str
    total_amount: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OrderWithProducts(Order):
    products: List[dict]  # Список продуктов с их количеством и ценой

    class Config:
        from_attributes = True 