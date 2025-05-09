from pydantic import BaseModel, conint
from typing import Optional
from datetime import datetime
from products.schemas import Product as ProductSchema

class CartItemBase(BaseModel):
    product_id: int | None
    quantity: conint(gt=0)

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: Optional[conint(gt=0)] = None

class CartItem(CartItemBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    product: ProductSchema

    class Config:
        from_attributes = True 