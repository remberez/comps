from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Category, User
from auth.security import get_current_active_user
from .schemas import CategoryCreate, CategoryUpdate, Category as CategorySchema

router = APIRouter(prefix="/categories", tags=["categories"])

async def get_admin_user(
    current_user: Annotated[User, Depends(get_current_active_user)]
) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/", response_model=List[CategorySchema])
async def get_categories(
    db: AsyncSession = Depends(get_db)
) -> List[Category]:
    """Получить список всех категорий"""
    stmt = select(Category)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{category_id}", response_model=CategorySchema)
async def get_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
) -> Category:
    """Получить категорию по ID"""
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.post("/", response_model=CategorySchema)
async def create_category(
    category_data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> Category:
    """Создать новую категорию (только для админов)"""
    # Проверяем, существует ли категория с таким именем
    stmt = select(Category).where(Category.name == category_data.name)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    category = Category(**category_data.model_dump())
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.put("/{category_id}", response_model=CategorySchema)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> Category:
    """Обновить категорию (только для админов)"""
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Проверяем, не пытаемся ли мы использовать имя существующей категории
    if category_data.name != category.name:
        stmt = select(Category).where(Category.name == category_data.name)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
    
    for key, value in category_data.model_dump().items():
        setattr(category, key, value)
    
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> None:
    """Удалить категорию (только для админов)"""
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    await db.delete(category)
    await db.commit() 