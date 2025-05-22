from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete
from sqlalchemy.exc import IntegrityError

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

# --- Вспомогательные функции для nested sets ---

async def insert_category_nested(db, name, description, parent_id=None):
    if parent_id:
        parent = await db.get(Category, parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
        right = parent.rgt
        # Сдвигаем lft/rgt для всех категорий справа
        await db.execute(update(Category).where(Category.rgt >= right).values(rgt=Category.rgt + 2))
        await db.execute(update(Category).where(Category.lft > right).values(lft=Category.lft + 2))
        new_cat = Category(
            name=name,
            description=description,
            parent_id=parent_id,
            lft=right,
            rgt=right + 1
        )
    else:
        max_rgt = (await db.execute(select(func.max(Category.rgt)))).scalar() or 0
        new_cat = Category(
            name=name,
            description=description,
            parent_id=None,
            lft=max_rgt + 1,
            rgt=max_rgt + 2
        )
    db.add(new_cat)
    await db.commit()
    await db.refresh(new_cat)
    return new_cat

async def delete_category_nested(db, category: Category):
    width = category.rgt - category.lft + 1
    # Удаляем ветку
    await db.execute(delete(Category).where(Category.lft >= category.lft, Category.rgt <= category.rgt))
    # Сдвигаем lft/rgt для остальных
    await db.execute(update(Category).where(Category.lft > category.rgt).values(lft=Category.lft - width))
    await db.execute(update(Category).where(Category.rgt > category.rgt).values(rgt=Category.rgt - width))
    await db.commit()

# --- Эндпоинты ---

@router.get("/", response_model=List[CategorySchema])
async def get_categories(
    db: AsyncSession = Depends(get_db)
) -> List[Category]:
    """Получить дерево категорий (отсортировано по lft)"""
    stmt = select(Category).order_by(Category.lft)
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
    """Создать новую категорию (nested sets)"""
    # Проверяем уникальность имени
    stmt = select(Category).where(Category.name == category_data.name)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    return await insert_category_nested(
        db,
        name=category_data.name,
        description=category_data.description,
        parent_id=category_data.parent_id
    )

@router.put("/{category_id}", response_model=CategorySchema)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> Category:
    """Обновить категорию (имя, описание, parent_id)"""
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    # Проверяем уникальность имени
    if category_data.name != category.name:
        stmt = select(Category).where(Category.name == category_data.name)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
    # Обновляем только имя и описание (перемещение ветки — отдельная задача)
    category.name = category_data.name
    category.description = category_data.description
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user)
) -> None:
    """Удалить категорию и все подкатегории (nested sets)"""
    stmt = select(Category).where(Category.id == category_id)
    result = await db.execute(stmt)
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    await delete_category_nested(db, category)