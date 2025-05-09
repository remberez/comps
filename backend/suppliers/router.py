from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Supplier, User
from auth.security import get_current_active_user
from .schemas import (
    SupplierCreate,
    SupplierUpdate,
    Supplier as SupplierSchema
)

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/", response_model=List[SupplierSchema])
async def get_suppliers(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> List[Supplier]:
    """Получить список всех поставщиков (только для админов)"""
    stmt = select(Supplier)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{supplier_id}", response_model=SupplierSchema)
async def get_supplier(
    supplier_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> Supplier:
    """Получить информацию о поставщике (только для админов)"""
    stmt = select(Supplier).where(Supplier.id == supplier_id)
    result = await db.execute(stmt)
    supplier = result.scalar_one_or_none()
    
    if supplier is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    return supplier

@router.post("/", response_model=SupplierSchema)
async def create_supplier(
    supplier_data: SupplierCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> Supplier:
    """Создать нового поставщика (только для админов)"""
    # Проверяем уникальность email
    stmt = select(Supplier).where(Supplier.email == supplier_data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    supplier = Supplier(**supplier_data.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    return supplier

@router.put("/{supplier_id}", response_model=SupplierSchema)
async def update_supplier(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> Supplier:
    """Обновить информацию о поставщике (только для админов)"""
    stmt = select(Supplier).where(Supplier.id == supplier_id)
    result = await db.execute(stmt)
    supplier = result.scalar_one_or_none()
    
    if supplier is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    # Проверяем уникальность email, если он обновляется
    if supplier_data.email is not None and supplier_data.email != supplier.email:
        stmt = select(Supplier).where(Supplier.email == supplier_data.email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Обновляем только указанные поля
    update_data = supplier_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(supplier, key, value)
    
    await db.commit()
    await db.refresh(supplier)
    return supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> None:
    """Удалить поставщика (только для админов)"""
    stmt = select(Supplier).where(Supplier.id == supplier_id)
    result = await db.execute(stmt)
    supplier = result.scalar_one_or_none()
    
    if supplier is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    await db.delete(supplier)
    await db.commit()
