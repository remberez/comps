from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Product, Category, Supplier, User
from auth.security import get_current_active_user
from .schemas import (
    ProductCreate,
    ProductUpdate,
    Product as ProductSchema
)

router = APIRouter(prefix="/products", tags=["products"])

async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/", response_model=List[ProductSchema])
async def get_products(
    category_id: int | None = None,
    db: AsyncSession = Depends(get_db)
) -> List[Product]:
    """Получить список всех продуктов с возможностью фильтрации по категории"""
    stmt = select(Product)
    if category_id:
        stmt = stmt.where(Product.category_id == category_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{product_id}", response_model=ProductSchema)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_db)
) -> Product:
    """Получить информацию о конкретном продукте"""
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.post("/", response_model=ProductSchema)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> Product:
    """Создать новый продукт (только для админов)"""
    # Проверяем существование категории
    stmt = select(Category).where(Category.id == product_data.category_id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Проверяем существование поставщика
    stmt = select(Supplier).where(Supplier.id == product_data.supplier_id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found"
        )
    
    # Проверяем уникальность имени
    stmt = select(Product).where(Product.name == product_data.name)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this name already exists"
        )
    
    product = Product(**product_data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductSchema)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> Product:
    """Обновить информацию о продукте (только для админов)"""
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Проверяем существование категории, если она обновляется
    if product_data.category_id is not None:
        stmt = select(Category).where(Category.id == product_data.category_id)
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
    
    # Проверяем существование поставщика, если он обновляется
    if product_data.supplier_id is not None:
        stmt = select(Supplier).where(Supplier.id == product_data.supplier_id)
        result = await db.execute(stmt)
        if not result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found"
            )
    
    # Проверяем уникальность имени, если оно обновляется
    if product_data.name is not None and product_data.name != product.name:
        stmt = select(Product).where(Product.name == product_data.name)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this name already exists"
            )
    
    # Обновляем только указанные поля
    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> None:
    """Удалить продукт (только для админов)"""
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    await db.delete(product)
    await db.commit() 