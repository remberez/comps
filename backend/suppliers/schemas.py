from pydantic import BaseModel, EmailStr, confloat
from typing import Optional, List
from datetime import datetime

class SupplierBase(BaseModel):
    name: str
    contact_person: str
    email: EmailStr
    phone: str
    address: str

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class Supplier(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductSupplierBase(BaseModel):
    product_id: int
    supplier_id: int
    supply_price: confloat(gt=0)
    last_supply_date: datetime

class ProductSupplierCreate(ProductSupplierBase):
    pass

class ProductSupplierUpdate(BaseModel):
    supply_price: Optional[confloat(gt=0)] = None
    last_supply_date: Optional[datetime] = None

class ProductSupplier(ProductSupplierBase):
    id: int

    class Config:
        from_attributes = True

class SupplierWithProducts(Supplier):
    products: List[ProductSupplier]

    class Config:
        from_attributes = True 